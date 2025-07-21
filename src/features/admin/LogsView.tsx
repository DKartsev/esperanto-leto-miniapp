import { useEffect, useState, type FC } from 'react';
import { supabase } from '../../services/supabaseClient';

interface LogEntry {
  id?: string;
  type: string;
  message: string;
  created_at: string;
}

interface LogsViewProps {
  devMode: boolean;
}

const LogsView: FC<LogsViewProps> = ({ devMode }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logPage, setLogPage] = useState(1);

  const loadLogs = async (page: number) => {
    if (devMode) return;
    const from = (page - 1) * 20;
    const to = from + 19;

    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setLogs(prev => [...prev, ...data]);
      setLogPage(page + 1);
    }
  };

  useEffect(() => {
    void loadLogs(1);
  }, []);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Логи</h2>
      <div className="space-y-2">
        {logs.map((log, idx) => (
          <details key={log.id || idx} className="rounded-xl bg-gray-50 border p-4 overflow-auto max-h-48 text-sm">
            <summary className="cursor-pointer select-none">
              {log.type} - {new Date(log.created_at).toLocaleString()}
            </summary>
            <pre className="whitespace-pre-wrap mt-2">{log.message}</pre>
          </details>
        ))}
      </div>
      {!devMode && (
        <button onClick={() => loadLogs(logPage)} className="mt-4 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm">
          Загрузить ещё
        </button>
      )}
    </div>
  );
};

export default LogsView;
