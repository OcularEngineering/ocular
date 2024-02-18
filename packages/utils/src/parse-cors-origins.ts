export function parseCorsOrigins(str: string): (string | RegExp)[] {
  return !str
    ? []
    : str.split(",").map((subStr) => {
        return buildRegexpIfValid(subStr) ?? subStr
      })
}

export function buildRegexpIfValid(str: string): RegExp | undefined {
  try {
    const m = str.match(/^([\/~@;%#'])(.*?)\1([gimsuy]*)$/)
    if (m) {
      return new RegExp(m[2], m[3])
    }
  } catch (e) {}

  return
}