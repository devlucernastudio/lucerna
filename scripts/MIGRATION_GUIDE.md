# Migration Guide: Redesign Product Characteristics System

## Overview

This migration redesigns the product characteristics system to be fully dynamic and reusable, replacing the fixed "Colors" block with a flexible characteristic system.

## What Changes

### Before
- Fixed blocks: Characteristics, Colors, Price & Availability
- Colors stored in separate `product_colors` table
- Limited attribute types: text, color, reference
- Product-level color selection settings

### After
- Fully dynamic characteristics system
- Single "Characteristics" block (colors are now characteristics)
- 6 input types: color_palette, manual_colors, select, checkbox, text, textarea
- Reusable characteristic types across products
- Per-product override for required status and price

## Database Schema

### New Tables

1. **characteristic_types**
   - Stores reusable characteristic type definitions
   - Fields: id, name_uk, name_en, input_type, required, reusable, position
   - input_type: 'color_palette' | 'manual_colors' | 'select' | 'checkbox' | 'text' | 'textarea'

2. **characteristic_options**
   - Stores options for select/color characteristics
   - Fields: id, characteristic_type_id, name_uk, name_en, value, color_code, position, is_available

3. **product_characteristics**
   - Links products to characteristics with selected values
   - Fields: id, product_id, characteristic_type_id, required (override), price_override, selected_values (JSONB)

### Deprecated Tables (kept for reference)
- `attribute_types` → Use `characteristic_types`
- `product_attributes` → Use `product_characteristics`
- `product_colors` → Use `characteristic_types` with input_type='color_palette' or 'manual_colors'

### Deprecated Columns (will be removed later)
- `products.color_selection_enabled`
- `products.color_selection_type`

## Migration Steps

### 1. Run Schema Migration
```sql
-- Run this first
\i scripts/010_redesign_characteristics.sql
```

### 2. Migrate Existing Data
```sql
-- Run this to migrate existing colors and attributes
\i scripts/011_migrate_existing_data.sql
```

### 3. Verify Data
- Check that product colors were migrated correctly
- Verify attribute data is preserved
- Test that existing products still work

### 4. Update Application Code
- Update product form component to use new schema
- Update product display page to use new characteristics
- Update cart logic for characteristic validation

### 5. Deprecate Old Tables (after verification)
```sql
-- Run this only after thorough testing
\i scripts/012_deprecate_old_tables.sql
```

## Input Types Explained

### color_palette
- Uses predefined color palette (e.g., Caparol colors)
- Options come from external source
- Users select from palette

### manual_colors
- Admin-defined color options
- Each option has name and hex code
- Stored in `characteristic_options`

### select
- Dropdown/radio selection
- Options defined in `characteristic_options`
- Single or multiple selection based on product configuration

### checkbox
- Boolean characteristic
- Checked/unchecked state
- Stored as boolean in selected_values

### text
- Single-line text input
- For values like "Length: 50cm"
- Stored as text in selected_values

### textarea
- Multi-line text input
- For comments or notes
- Stored as text in selected_values

## Selected Values Format

The `selected_values` JSONB field structure varies by input_type:

```json
// select/checkbox/manual_colors
{
  "options": ["option_id_1", "option_id_2"]
}

// text/textarea
{
  "text": "User entered text"
}

// color_palette
{
  "color_code": "#FF5733"
}
```

## Product-Characteristic Relationship

- One product can have multiple characteristics
- Each product-characteristic link can override:
  - `required`: Make a reusable characteristic required for this product
  - `price_override`: Add price modifier for this characteristic on this product
- If multiple characteristics have prices, calculate total dynamically

## Validation Rules

1. Required characteristics must be selected before adding to cart
2. Validation happens on Product Page (client-side)
3. Server-side validation on checkout

## API Changes

### Fetching Product Characteristics

```typescript
// Old way (deprecated)
const { data: colors } = await supabase
  .from('product_colors')
  .select('*')
  .eq('product_id', productId);

const { data: attributes } = await supabase
  .from('product_attributes')
  .select('*')
  .eq('product_id', productId);

// New way
const { data: characteristics } = await supabase
  .from('product_characteristics')
  .select(`
    *,
    characteristic_types (*),
    characteristic_options (*)
  `)
  .eq('product_id', productId);
```

### Creating Characteristics

```typescript
// 1. Create characteristic type (reusable)
const { data: type } = await supabase
  .from('characteristic_types')
  .insert({
    name_uk: 'Колір',
    name_en: 'Color',
    input_type: 'manual_colors',
    required: false,
    reusable: true
  })
  .select()
  .single();

// 2. Create options (for select/color types)
const { data: options } = await supabase
  .from('characteristic_options')
  .insert([
    {
      characteristic_type_id: type.id,
      name_uk: 'Червоний',
      name_en: 'Red',
      value: '#FF0000',
      color_code: '#FF0000'
    }
  ])
  .select();

// 3. Link to product
await supabase
  .from('product_characteristics')
  .insert({
    product_id: productId,
    characteristic_type_id: type.id,
    required: true, // Override: make required for this product
    selected_values: { options: [options[0].id] }
  });
```

## Rollback Plan

If migration causes issues:

1. Old tables are still present (not dropped)
2. Application code can be reverted to use old tables
3. New tables can be dropped if needed:
   ```sql
   DROP TABLE IF EXISTS product_characteristics CASCADE;
   DROP TABLE IF EXISTS characteristic_options CASCADE;
   DROP TABLE IF EXISTS characteristic_types CASCADE;
   DROP VIEW IF EXISTS product_characteristics_full;
   ```

## Testing Checklist

- [ ] Existing products still display correctly
- [ ] Product colors migrated correctly
- [ ] Attributes migrated correctly
- [ ] New characteristic types can be created
- [ ] Characteristics can be assigned to products
- [ ] Required validation works
- [ ] Price overrides work
- [ ] Cart validation works
- [ ] Checkout process works

