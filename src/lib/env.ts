/**
 * 读取数字环境变量，非法时回退默认值。
 */
export function parseEnvNumber(value: string | undefined, fallback: number): number {
  if (value == null || value.trim() === '') return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/**
 * 解析 HTTP keys，逗号分隔。
 */
export function parseEnvKeys(value: string | undefined): string[] | undefined {
  if (!value) return undefined
  const keys = value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
  return keys.length > 0 ? keys : undefined
}