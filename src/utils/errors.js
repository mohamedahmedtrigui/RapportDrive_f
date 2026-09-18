export function firstValidationError(err, fallback) {
  const errors = err.response?.data?.errors
  if (errors) {
    const firstField = Object.values(errors)[0]
    if (Array.isArray(firstField) && firstField.length > 0) {
      return firstField[0]
    }
  }

  return err.response?.data?.message || fallback
}
