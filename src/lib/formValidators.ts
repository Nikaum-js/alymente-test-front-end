/**
 * File: formatValidators.ts
 * Contains utility functions for formatting and validating documents and phone numbers
 */

/**
 * Formats a CPF by adding dots and dash (000.000.000-00)
 * @param value string containing only CPF numbers
 * @returns string formatted CPF
 */
export function formatDocument(value: string) {
  const doc = value.replace(/\D/g, '')
  return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formats a phone number in the pattern (00) 00000-0000
 * If it has 10 digits, formats as landline: (00) 0000-0000
 * If it has 11 digits, formats as mobile: (00) 00000-0000
 * @param value string containing only phone numbers
 * @returns string formatted phone number
 */
export function formatPhoneNumber(value: string): string {
  const phoneNumber = value.replace(/\D/g, '')

  if (phoneNumber.length <= 10) {
    return phoneNumber.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  } else {
    return phoneNumber.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }
}

/**
 * Checks if a CPF is valid using the validation algorithm
 * @param cpf string containing only CPF numbers
 * @returns boolean true if CPF is valid, false otherwise
 */
function isValidCPF(cpf: string): boolean {
  // Rejects CPFs with all digits equal
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  let remainder

  // First verification digit
  for (let i = 1; i <= 9; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(9, 10))) return false

  // Second verification digit
  sum = 0
  for (let i = 1; i <= 10; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(cpf.substring(10, 11))
}

/**
 * Checks if a CNPJ is valid using the validation algorithm
 * @param cnpj string containing only CNPJ numbers
 * @returns boolean true if CNPJ is valid, false otherwise
 */
function isValidCNPJ(cnpj: string): boolean {
  // Rejects CNPJs with all digits equal
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false

  let size = cnpj.length - 2
  let numbers = cnpj.substring(0, size)
  const digits = cnpj.substring(size)
  let sum = 0
  let pos = size - 7

  // First verification digit
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false

  // Second verification digit
  size = size + 1
  numbers = cnpj.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return result === parseInt(digits.charAt(1))
}

/**
 * Checks if a document (CPF or CNPJ) is valid
 * @param doc string containing only document numbers
 * @returns boolean true if document is valid, false otherwise
 * @example
 * isValidDocument('12345678909') // Validates CPF
 * isValidDocument('12345678000199') // Validates CNPJ
 */
export function isValidDocument(doc: string): boolean {
  // Remove non-numeric characters
  doc = doc.replace(/[^\d]+/g, '')

  // Check document type by length
  if (doc.length === 11) {
    return isValidCPF(doc)
  } else if (doc.length === 14) {
    return isValidCNPJ(doc)
  }

  return false
}