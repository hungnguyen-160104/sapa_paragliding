const setBoundary = (value: Date, endOfDay = false) => {
  const date = new Date(value)
  if (endOfDay) {
    date.setUTCHours(23, 59, 59, 999)
  } else {
    date.setUTCHours(0, 0, 0, 0)
  }
  return date
}

const parseDate = (value?: string | null, endOfDay = false) => {
  if (!value) {
    return null
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return setBoundary(parsed, endOfDay)
}

export const buildDateRangeMatch = (field: string, from?: string | null, to?: string | null) => {
  const range: Record<string, Date> = {}
  const start = parseDate(from, false)
  const end = parseDate(to, true)

  if (start) {
    range.$gte = start
  }

  if (end) {
    range.$lte = end
  }

  if (!range.$gte && !range.$lte) {
    return {}
  }

  return {
    [field]: range
  }
}
