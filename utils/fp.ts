export const sample = (arr: any[] = []) => {
  const len = arr === null ? 0 : arr.length
  return len ? arr[Math.floor(Math.random() * len)] : undefined
}

export function find(subtitleList: any[] = [], args: { [key: string]: any }) {
  const key = Object.keys(args)[0]
  return subtitleList.find((item) => item[key] === args[key])
}
