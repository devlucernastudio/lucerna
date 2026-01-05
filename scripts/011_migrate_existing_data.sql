-- Migration script: Migrate existing product_colors and product_attributes to new system
-- Run this AFTER 010_redesign_characteristics.sql
-- This script migrates existing data to the new characteristic system

-- ============================================
-- STEP 1: Migrate product_colors to characteristic system
-- ============================================

-- First, create a "Color" characteristic type if it doesn't exist and colors are being used
DO $$
DECLARE
  color_type_id UUID;
  product_record RECORD;
  color_record RECORD;
  color_option_id UUID;
  has_colors BOOLEAN;
  table_exists BOOLEAN;
BEGIN
  -- Check if product_colors table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'product_colors'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RETURN;
  END IF;
  
  -- Check if there are any product_colors to migrate
  SELECT EXISTS(SELECT 1 FROM product_colors LIMIT 1) INTO has_colors;
  
  IF has_colors THEN
    -- Create "Колір" / "Color" characteristic type
    INSERT INTO characteristic_types (name_uk, name_en, input_type, required, reusable, position)
    VALUES ('Колір', 'Color', 'manual_colors', false, true, 0)
    ON CONFLICT DO NOTHING
    RETURNING id INTO color_type_id;
    
    -- Get the color type ID if it already exists
    IF color_type_id IS NULL THEN
      SELECT id INTO color_type_id FROM characteristic_types 
      WHERE name_uk = 'Колір' AND input_type = 'manual_colors' LIMIT 1;
    END IF;
    
    -- Migrate each product's colors
    FOR product_record IN 
      SELECT DISTINCT product_id FROM product_colors
    LOOP
      -- Create product_characteristic link
      INSERT INTO product_characteristics (product_id, characteristic_type_id, required, selected_values)
      VALUES (product_record.product_id, color_type_id, false, '[]'::jsonb)
      ON CONFLICT (product_id, characteristic_type_id) DO NOTHING;
      
      -- Get all colors for this product and create options
      FOR color_record IN
        SELECT DISTINCT color_code, color_name_uk, color_name_en 
        FROM product_colors 
        WHERE product_id = product_record.product_id AND is_available = true
      LOOP
        -- Create or get color option
        SELECT id INTO color_option_id FROM characteristic_options 
        WHERE characteristic_type_id = color_type_id AND value = color_record.color_code LIMIT 1;
        
        -- Create if it doesn't exist (using ON CONFLICT with UNIQUE constraint)
        IF color_option_id IS NULL THEN
          INSERT INTO characteristic_options (characteristic_type_id, name_uk, name_en, value, color_code, is_available)
          VALUES (color_type_id, color_record.color_name_uk, color_record.color_name_en, color_record.color_code, color_record.color_code, true)
          ON CONFLICT (characteristic_type_id, value) DO UPDATE SET 
            name_uk = EXCLUDED.name_uk,
            name_en = EXCLUDED.name_en,
            color_code = EXCLUDED.color_code
          RETURNING id INTO color_option_id;
          
          -- If still null after conflict, get the existing ID
          IF color_option_id IS NULL THEN
            SELECT id INTO color_option_id FROM characteristic_options 
            WHERE characteristic_type_id = color_type_id AND value = color_record.color_code LIMIT 1;
          END IF;
        END IF;
        
        -- Add option to product's selected_values
        UPDATE product_characteristics
        SET selected_values = (
          SELECT jsonb_agg(DISTINCT value)
          FROM jsonb_array_elements_text(
            COALESCE(selected_values, '[]'::jsonb) || jsonb_build_array(color_option_id::text)
          ) value
        )
        WHERE product_id = product_record.product_id 
          AND characteristic_type_id = color_type_id;
      END LOOP;
    END LOOP;
  END IF;
END $$;

-- ============================================
-- STEP 2: Migrate product_attributes to characteristic system
-- ============================================

-- Note: This migration is more complex as it depends on attribute_types structure
-- For now, we'll create a basic migration that preserves text attributes
-- More complex migrations (color, reference) should be handled manually

DO $$
DECLARE
  attr_type_id UUID;
  new_char_type_id UUID;
  product_record RECORD;
  attr_record RECORD;
  tables_exist BOOLEAN;
BEGIN
  -- Check if both product_attributes and attribute_types tables exist
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'product_attributes'
  ) AND EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'attribute_types'
  ) INTO tables_exist;
  
  IF tables_exist THEN
    -- Migrate text-type attributes
    FOR attr_record IN
      SELECT DISTINCT 
        pa.product_id,
        pa.attribute_type_id,
        pa.value_text,
        at.name_uk,
        at.name_en
      FROM product_attributes pa
      JOIN attribute_types at ON pa.attribute_type_id = at.id
      WHERE at.type = 'text' AND pa.value_text IS NOT NULL
    LOOP
      -- Find or create corresponding characteristic type
      SELECT id INTO new_char_type_id 
      FROM characteristic_types 
      WHERE name_uk = attr_record.name_uk 
        AND input_type = 'text' 
      LIMIT 1;
      
      IF new_char_type_id IS NULL THEN
        -- Create new characteristic type
        INSERT INTO characteristic_types (name_uk, name_en, input_type, required, reusable)
        VALUES (attr_record.name_uk, attr_record.name_en, 'text', false, true)
        RETURNING id INTO new_char_type_id;
      END IF;
      
      -- Create product_characteristic with text value
      INSERT INTO product_characteristics (product_id, characteristic_type_id, selected_values)
      VALUES (
        attr_record.product_id, 
        new_char_type_id,
        jsonb_build_object('text', attr_record.value_text)
      )
      ON CONFLICT (product_id, characteristic_type_id) 
      DO UPDATE SET selected_values = jsonb_build_object('text', attr_record.value_text);
    END LOOP;
  END IF;
END $$;

-- ============================================
-- STEP 3: Log migration completion
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed. Please verify data integrity before removing old tables.';
  RAISE NOTICE 'Old tables (attribute_types, product_attributes, product_colors) are deprecated but kept for reference.';
  RAISE NOTICE 'Review migrated data and then run 012_deprecate_old_tables.sql when ready.';
END $$;

