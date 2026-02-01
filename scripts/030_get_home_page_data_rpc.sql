-- RPC: get all data for home page in one call
-- Returns JSONB with: products (featured), product_characteristics, characteristic_types,
-- characteristic_options, price_combinations, content_blocks

CREATE OR REPLACE FUNCTION get_home_page_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_product_ids uuid[];
  v_char_type_ids uuid[];
  v_result jsonb;
BEGIN
  -- Featured product ids (active, limit 6, order by created_at desc)
  SELECT array_agg(sub.id ORDER BY sub.created_at DESC) INTO v_product_ids
  FROM (
    SELECT id, created_at FROM products
    WHERE is_featured = true AND is_active = true
    ORDER BY created_at DESC
    LIMIT 6
  ) sub;

  IF v_product_ids IS NULL THEN
    v_product_ids := ARRAY[]::uuid[];
  END IF;

  -- Characteristic type ids used by these products
  IF array_length(v_product_ids, 1) > 0 THEN
    SELECT array_agg(DISTINCT characteristic_type_id) INTO v_char_type_ids
    FROM product_characteristics
    WHERE product_id = ANY(v_product_ids);
  END IF;

  IF v_char_type_ids IS NULL THEN
    v_char_type_ids := ARRAY[]::uuid[];
  END IF;

  -- Build single JSON result
  SELECT jsonb_build_object(
    'products', COALESCE(
      (SELECT jsonb_agg(p ORDER BY array_position(v_product_ids, p.id)) FROM products p
       WHERE p.id = ANY(v_product_ids) AND p.is_active = true),
      '[]'::jsonb
    ),
    'product_characteristics', COALESCE(
      (SELECT jsonb_agg(pc) FROM product_characteristics pc WHERE pc.product_id = ANY(v_product_ids)),
      '[]'::jsonb
    ),
    'characteristic_types', COALESCE(
      (SELECT jsonb_agg(ct ORDER BY ct.position) FROM characteristic_types ct WHERE ct.id = ANY(v_char_type_ids)),
      '[]'::jsonb
    ),
    'characteristic_options', COALESCE(
      (SELECT jsonb_agg(co ORDER BY co.characteristic_type_id, co.position) FROM characteristic_options co
       WHERE co.characteristic_type_id = ANY(v_char_type_ids)),
      '[]'::jsonb
    ),
    'price_combinations', COALESCE(
      (SELECT jsonb_agg(pc) FROM product_characteristic_price_combinations pc WHERE pc.product_id = ANY(v_product_ids)),
      '[]'::jsonb
    ),
    'content_blocks', COALESCE(
      (SELECT jsonb_agg(cb ORDER BY cb.position) FROM content_blocks cb WHERE cb.is_active = true),
      '[]'::jsonb
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_home_page_data() TO anon;
GRANT EXECUTE ON FUNCTION get_home_page_data() TO authenticated;

COMMENT ON FUNCTION get_home_page_data() IS 'Returns all data needed for the home page (featured products, characteristics, content blocks) in one JSONB.';
