
/**
 * Validates a Brazilian CNPJ number
 * @param cnpj The CNPJ string to validate
 * @returns true if valid, false otherwise
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove non-numeric characters
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Check if it has 14 digits
  if (cnpj.length !== 14) return false;
  
  // Check for known invalid values
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validate verification digits
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  
  return result === parseInt(digits.charAt(1));
}

/**
 * Formats a CNPJ string with the standard Brazilian format
 * @param cnpj The raw CNPJ string
 * @returns Formatted CNPJ (e.g., 12.345.678/0001-90)
 */
export function formatCNPJ(cnpj: string): string {
  // Remove non-numeric characters
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Apply mask
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
