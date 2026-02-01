-- RPC: get all data for product page in one call
-- Returns JSONB with: product, product_characteristics, characteristic_types, characteristic_options,
-- price_combinations, additional_info_block, downloadable_files, related_products,
-- related_product_characteristics, related_characteristic_types, related_characteristic_options, related_price_combinations

CREATE OR REPLACE FUNCTION get_product_page_data(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_product_id uuid;
  v_category_ids uuid[];
  v_related_ids uuid[];
  v_result jsonb;
BEGIN
  -- Product by slug, active only
  SELECT id INTO v_product_id
  FROM products
  WHERE slug = p_slug AND is_active = true
  LIMIT 1;

  IF v_product_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Category ids for this product (for related products)
  SELECT array_agg(category_id) INTO v_category_ids
  FROM product_categories
  WHERE product_id = v_product_id;

  -- Related product ids: other products in same categories, max 3
  IF v_category_ids IS NOT NULL AND array_length(v_category_ids, 1) > 0 THEN
    SELECT array_agg(pid) INTO v_related_ids
    FROM (
      SELECT product_id AS pid
      FROM product_categories
      WHERE category_id = ANY(v_category_ids) AND product_id != v_product_id
      GROUP BY product_id
      LIMIT 3
    ) sub;
  END IF;

  IF v_related_ids IS NULL THEN
    v_related_ids := ARRAY[]::uuid[];
  END IF;

  -- Build single JSON result
  SELECT jsonb_build_object(
    'product', (SELECT to_jsonb(p) FROM products p WHERE p.id = v_product_id),
    'product_characteristics', COALESCE(
      (SELECT jsonb_agg(pc ORDER BY pc.position) FROM product_characteristics pc WHERE pc.product_id = v_product_id),
      '[]'::jsonb
    ),
    'characteristic_types', COALESCE(
      (SELECT jsonb_agg(ct ORDER BY ct.position) FROM characteristic_types ct
       WHERE ct.id IN (SELECT characteristic_type_id FROM product_characteristics WHERE product_id = v_product_id)),
      '[]'::jsonb
    ),
    'characteristic_options', COALESCE(
      (SELECT jsonb_agg(co ORDER BY co.characteristic_type_id, co.position) FROM characteristic_options co
       WHERE co.characteristic_type_id IN (SELECT characteristic_type_id FROM product_characteristics WHERE product_id = v_product_id)),
      '[]'::jsonb
    ),
    'price_combinations', COALESCE(
      (SELECT jsonb_agg(pc) FROM product_characteristic_price_combinations pc WHERE pc.product_id = v_product_id),
      '[]'::jsonb
    ),
    'additional_info_block', (SELECT to_jsonb(cb) FROM content_blocks cb WHERE cb.type = 'additional_info' ORDER BY cb.created_at DESC LIMIT 1),
    'downloadable_files', COALESCE(
      (SELECT jsonb_agg(df) FROM product_downloadable_files pdf
       JOIN downloadable_files df ON df.id = pdf.downloadable_file_id
       WHERE pdf.product_id = v_product_id AND pdf.show_file = true),
      '[]'::jsonb
    ),
    'related_products', COALESCE(
      (SELECT jsonb_agg(p ORDER BY array_position(v_related_ids, p.id)) FROM products p
       WHERE p.id = ANY(v_related_ids) AND p.is_active = true),
      '[]'::jsonb
    ),
    'related_product_characteristics', COALESCE(
      (SELECT jsonb_agg(pc) FROM product_characteristics pc WHERE pc.product_id = ANY(v_related_ids)),
      '[]'::jsonb
    ),
    'related_characteristic_types', COALESCE(
      (SELECT jsonb_agg(ct ORDER BY ct.position) FROM characteristic_types ct
       WHERE ct.id IN (SELECT DISTINCT characteristic_type_id FROM product_characteristics WHERE product_id = ANY(v_related_ids))),
      '[]'::jsonb
    ),
    'related_characteristic_options', COALESCE(
      (SELECT jsonb_agg(co ORDER BY co.characteristic_type_id, co.position) FROM characteristic_options co
       WHERE co.characteristic_type_id IN (SELECT DISTINCT characteristic_type_id FROM product_characteristics WHERE product_id = ANY(v_related_ids))),
      '[]'::jsonb
    ),
    'related_price_combinations', COALESCE(
      (SELECT jsonb_agg(pc) FROM product_characteristic_price_combinations pc WHERE pc.product_id = ANY(v_related_ids)),
      '[]'::jsonb
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Allow anon and authenticated to call (RLS applies inside function)
GRANT EXECUTE ON FUNCTION get_product_page_data(text) TO anon;
GRANT EXECUTE ON FUNCTION get_product_page_data(text) TO authenticated;

COMMENT ON FUNCTION get_product_page_data(text) IS 'Returns all data needed for the product page in one JSONB (product, characteristics, related products, etc.)';
