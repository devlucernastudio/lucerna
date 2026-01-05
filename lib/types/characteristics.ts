// Type definitions for the new characteristic system

export type CharacteristicInputType = 
  | 'color_palette'  // Predefined color palette (e.g., Caparol)
  | 'color_custom'   // Admin-defined color options (1+ colors)
  | 'select'         // Dropdown selection with predefined options
  | 'checkbox'       // Checkbox(es) - can select one or multiple
  | 'text';          // Free text input from customer

export interface CharacteristicType {
  id: string;
  name_uk: string;
  name_en: string;
  input_type: CharacteristicInputType;
  required: boolean;
  reusable: boolean;
  affects_price: boolean; // If true, this characteristic can affect product price
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CharacteristicOption {
  id: string;
  characteristic_type_id: string;
  name_uk: string | null;
  name_en: string | null;
  value: string; // For colors: hex code, for select: option value
  color_code: string | null; // For color options
  position: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Selected values structure varies by input_type
export type SelectedValues =
  | { options: string[] } // For select/checkbox/manual_colors (array of option IDs)
  | { text: string }      // For text/textarea
  | { color_code: string }; // For color_palette

export interface ProductCharacteristic {
  id: string;
  product_id: string;
  characteristic_type_id: string;
  required: boolean | null; // null = use characteristic_type.required
  affects_price: boolean | null; // null = use characteristic_type.affects_price
  selected_values: SelectedValues;
  created_at: string;
  updated_at: string;
}

// Price combination for products with multiple price-affecting characteristics
export interface ProductCharacteristicPriceCombination {
  id: string;
  product_id: string;
  combination: Record<string, string>; // { "char_type_id": "option_id" or "text_value" }
  price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Full product characteristic with related data
export interface ProductCharacteristicFull extends ProductCharacteristic {
  characteristic_type: CharacteristicType;
  options?: CharacteristicOption[]; // Options for this characteristic type
}

// Product with all characteristics
export interface ProductWithCharacteristics {
  id: string;
  name_uk: string;
  name_en: string;
  price: number;
  // ... other product fields
  characteristics: ProductCharacteristicFull[];
}

// Validation result
export interface CharacteristicValidation {
  characteristic_type_id: string;
  name: string;
  valid: boolean;
  message?: string;
}

