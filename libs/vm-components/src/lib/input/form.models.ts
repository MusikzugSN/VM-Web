import {VmcButtonType} from '@vm-components';

export interface VmForm {
  header: string;
  description?: string;
  fields: VmFormField[];
  submitButton?: string;
  submitButtonType?: VmcButtonType;
}

export interface VmFormField {
  label: string;
  type: 'color' | 'date' | 'datetime-local' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url'// | 'checkbox' | 'radio' | 'select' | 'textarea';
  key: string;
  value?: any;
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
