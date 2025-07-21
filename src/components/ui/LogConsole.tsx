import { FC, useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'

interface LogEntry {
  id?: string
  type: string
  message: string
  created_at: string
}

const LogConsole: FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logPage, setLogPage] = useState(1)
  const [expanded, setExpanded] = useState(false)

  const loadLogs = async (page: number) => {
    const from = (page - 1) * 20
    const to = from + 19

    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (!error && data) {
      setLogs(prev => [...prev, ...data])
      setLogPage(page + 1)
    }
  }

  useEffect(() => {
    void loadLogs(1)
  }, [])

  if (expanded) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-black text-green-300 p-4 z-50 overflow-y-scroll">
        <button
          className="bg-white text-black rounded px-3 py-1 absolute right-4 top-4"
          onClick={() => setExpanded(false)}
        >
          Свернуть
        </button>
        <div className="space-y-2 mt-8">
          {logs.map((log, idx) => (
            <details key={log.id || idx} className="rounded-xl border p-4 overflow-auto max-h-48 text-sm bg-gray-800 text-green-300">
              <summary className="cursor-pointer select-none">
                {log.type} - {new Date(log.created_at).toLocaleString()}
              </summary>
              <pre className="whitespace-pre-wrap mt-2 text-green-300">{log.message}</pre>
            </details>
          ))}
          <button
            onClick={() => loadLogs(logPage)}
            className="mt-4 px-4 py-2 bg-gray-700 rounded text-green-300"
          >
            Загрузить ещё
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed bottom-0 left-0 w-full h-6 bg-black text-green-400 text-xs overflow-hidden px-2 z-50 cursor-pointer"
      onClick={() => setExpanded(true)}
    >
      {logs[0] ? `${logs[0].type}: ${logs[0].message}` : 'Консоль логов'}
    </div>
  )
}

export default LogConsole
