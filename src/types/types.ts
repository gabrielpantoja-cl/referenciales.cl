// 
export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string[] };
  message?: string;
}