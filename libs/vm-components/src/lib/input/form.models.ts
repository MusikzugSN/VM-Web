import { VmButtonType } from '@vm-components';

export type VmCheckboxValues = 'checked' | 'unchecked' | 'indeterminate';

export type VmValidFormTypes = number | string | number[] | string[];

export interface VmForm {
  header?: string;
  description?: string;
  fields: VmFormField[];
  submitButton?: string;
  submitButtonType?: VmButtonType;
  submitButtonPosition?: 'left' | 'right' | 'center' | 'full';
}

export type VmFormField = VmInputField | VmCheckboxField | VmSelect ;

export interface VmBaseField {
  label: string;
  key: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
}

export interface VmInputField extends VmBaseField {
  type:
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'text'
    | 'time'
    | 'url';
  value?: VmValidFormTypes;
  placeholder?: string;
  maxLength?: number;
}

export interface VmCheckboxField extends VmBaseField {
  type: 'checkbox';
  labelPosition?: 'before' | 'after';
  value?: VmCheckboxValues;
}
export interface VmSelect extends VmBaseField {
  type: 'select';
  enableSearch?: boolean;
  multiple?: boolean;
  options: VmSelectOption[];
  value?: string | string[];
}
export interface VmSelectOption {
  label: string;
  value: string;
}
/*
interface VmFormFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern as a string
  min?: number; // For number type
  max?: number; // For number type
}
*/
