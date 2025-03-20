import { Terminal, Trash2 } from 'lucide-react'

interface ConsoleProps {
  output: string[]
  onClear: () => void
}

export function Console({ output, onClear }: ConsoleProps) {
  return (
    <div className="h-48 bg-base-200 rounded-lg overflow-hidden border border-base-100">
      <div className="h-full flex flex-col">
        <div className="h-[48px] flex items-center justify-between px-2 py-3 bg-base-200 border-b border-base-100">
          <div className="flex items-center gap-2 ml-1">
            <Terminal className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Console</h2>
          </div>
          <div className="flex items-center">
            {output.length > 0 && (
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={onClear}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 bg-base-250 p-2 overflow-auto font-mono text-sm">
          {output.length > 0 ? (
            output.map((message, index) => (
              <div
                key={index}
                className={`${message.startsWith('Error:') || message.startsWith('Syntax Error:') ? 'text-error' : 'text-gray-200'}`}
              >
                {message}
              </div>
            ))
          ) : (
            <div className="text-gray-400">No output yet...</div>
          )}
        </div>
      </div>
    </div>
  )
}