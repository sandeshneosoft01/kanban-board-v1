import { useEffect } from 'react'
import type { FieldErrors, FieldValues } from 'react-hook-form'

/**
 * Hook to automatically scroll to the first form field with an error.
 * Uses the field name to find the corresponding DOM element.
 * 
 * @param errors - The formState.errors object from react-hook-form
 */
export function useScrollToError<T extends FieldValues>(errors: FieldErrors<T>) {
  useEffect(() => {
    const getFirstErrorKey = (errs: FieldErrors<T>): string | null => {
      const keys = Object.keys(errs)
      if (keys.length === 0) return null

      const firstKey = keys[0]
      const error = errs[firstKey]

      // If it's a nested error object (e.g. for arrays or nested objects), recurse
      if (error && typeof error === 'object' && !('type' in error)) {
        const subKey = getFirstErrorKey(error as FieldErrors<T>)
        return subKey ? `${firstKey}.${subKey}` : firstKey
      }

      return firstKey
    }

    const firstErrorKey = getFirstErrorKey(errors)
    if (firstErrorKey) {
      // Try to find the element by name attribute
      const element = document.getElementsByName(firstErrorKey)[0]
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [errors])
}
