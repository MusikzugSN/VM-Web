export interface VmForm {
  header: string;
  description?: string;
  fields: VmFormField[];
  submitButton?: string;
}

interface VmFormField {
  label: string;
  type: 'text' | 'number' | 'email' | 'password'; // | 'checkbox' | 'radio' | 'select' | 'textarea';
  key: string;
  //value?: any; // geht aktuell nicht
  description?: string;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  //options?: string[]; // For select and radio types
  //validation?: VmFormFieldValidation;
}

interface VmFormFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern as a string
  min?: number; // For number type
  max?: number; // For number type
}
