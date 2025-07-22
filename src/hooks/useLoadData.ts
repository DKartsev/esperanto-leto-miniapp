import { useState, useEffect, useRef, useCallback } from 'react'

export function useLoadData<T>(loader: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await loader()
      if (isMountedRef.current) {
        setData(result)
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err?.message || 'Ошибка загрузки')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [loader])

  useEffect(() => {
    isMountedRef.current = true
    void loadData()
    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, reload: loadData }
}
