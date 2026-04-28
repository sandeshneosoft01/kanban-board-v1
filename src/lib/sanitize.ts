import DOMPurify from 'dompurify'

/**
 * Sanitizes a string or undefined value using DOMPurify.
 * Returns an empty string if the input is falsy.
 */
export const sanitize = (value: string | undefined | null): string => {
  if (!value) return ''
  return DOMPurify.sanitize(value)
}
