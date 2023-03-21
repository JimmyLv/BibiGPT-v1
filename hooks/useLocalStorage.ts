import React from 'react'


/**
 * State to store our value
 * Pass initial state function to useState so logic is only executed once
 *
 * @export
 * @template T
 * @param {string} key
 * @param {T} [initialValue]
 * @return {*}  {(T | undefined)}
 */
export function useLocalStorage<T>(key: string, initialValue?: T){
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.error(error)
      return initialValue
    }
  })


  /**
   * Return a wrapped version of useState's setter function that ...
   * ...persists the new value to localStorage.
   *
   * @param {T} value
   */
  const setValue = (value: T): void => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }
  return [storedValue, setValue] as const
}
