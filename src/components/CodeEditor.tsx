import { Editor, Monaco } from "@monaco-editor/react"
import { Code2, PlayCircle, Play, PauseCircle, RotateCcw } from 'lucide-react'

interface CodeEditorProps {
  code: string
  onChange: (value: string) => void
  onMount: (editor: any, monaco: Monaco) => void
  speed: number
  onSpeedChange: (speed: number) => void
  isRunning: boolean
  isPaused: boolean
  onRun: () => void
  onPause: () => void
  onReset: () => void
}

export function CodeEditor({ 
  code, 
  onChange, 
  onMount,
  speed,
  onSpeedChange,
  isRunning,
  isPaused,
  onRun,
  onPause,
  onReset
}: CodeEditorProps) {
  return (
    <div className="flex-1 bg-base-200 rounded-lg overflow-hidden border border-base-100">
      <div className="h-full flex flex-col">
        <div className="h-[48px] flex items-center justify-between px-2 py-3 bg-base-200 border-b border-base-100">
          <div className="flex items-center gap-2 ml-1">
            <Code2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Code</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isRunning ? 'text-gray-500' : 'text-gray-400'}`}>Speed</span>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => onSpeedChange(Number(e.target.value))}
                className={`range range-xs ${isRunning ? 'range-secondary opacity-50 cursor-not-allowed' : 'range-primary'} w-24`}
                disabled={isRunning}
              />
              <span className={`text-xs ${isRunning ? 'text-gray-500' : 'text-gray-400'} w-8 text-right`}>{speed}x</span>
            </div>
            {!isRunning ? (
              <button className="btn btn-sm btn-primary" onClick={onRun}>
                <PlayCircle className="w-4 h-4" />
                Run
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm btn-primary" 
                  onClick={onPause}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      Pause
                    </>
                  )}
                </button>
                <button className="btn btn-sm btn-ghost" onClick={onReset}>
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative z-20">
          <div className="h-full pt-2">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => onChange(value || '')}
              onMount={onMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                fixedOverflowWidgets: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}