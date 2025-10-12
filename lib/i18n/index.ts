import en from "./en"

type Locales = "en"

const locales: Record<Locales, any> = {
  en,
}

let current: Locales = "en"

export function setLocale(locale: Locales) {
  current = locale
}

export function t(path: string): string {
  const parts = path.split(".")
  let node: any = locales[current]
  for (const p of parts) {
    if (!node) return path
    node = node[p]
  }
  return typeof node === "string" ? node : path
}

export default {
  setLocale,
  t,
}
