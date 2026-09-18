const FIRST_YEAR = 1900

// Годы по убыванию: свежие сверху, их выбирают чаще.
export function yearOptions(first = FIRST_YEAR): { value: number; label: string }[] {
  const current = new Date().getFullYear()

  return Array.from({ length: current - first + 1 }, (_, index) => {
    const value = current - index
    return { value, label: String(value) }
  })
}
