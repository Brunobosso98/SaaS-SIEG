
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
  
  // Check for known invalid values (all same digits)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Calculate first verification digit
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = (weight === 2) ? 9 : weight - 1;
  }
  
  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cnpj.charAt(12)) !== digit1) return false;
  
  // Calculate second verification digit
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = (weight === 2) ? 9 : weight - 1;
  }
  
  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return parseInt(cnpj.charAt(13)) === digit2;
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
