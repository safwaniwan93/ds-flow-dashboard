const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.local$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./,
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]*:/i,
  /^\[?fe80:/i,
]

export function normalizePublicSiteUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 2048) {
    return null
  }

  try {
    const url = new URL(value)

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname))
    ) {
      return null
    }

    return url.origin
  } catch {
    return null
  }
}

export function boundedString(value: unknown, maxLength: number, fallback: string | null = null) {
  if (typeof value !== "string") return fallback
  return value.slice(0, maxLength)
}

export function optionalPublicHttpsUrl(value: unknown) {
  if (value === "" || value === null || value === undefined) return null
  if (typeof value !== "string" || value.length > 2048) return null

  try {
    const url = new URL(value)
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname))
    ) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}
