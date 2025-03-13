import { useState, useCallback } from 'react'
import { Terminal, Code2, PlayCircle, Github, Globe, Layers, ListTodo, List, Trash2, PauseCircle, RotateCcw, Play, RefreshCw, Info } from 'lucide-react'
import Editor from "@monaco-editor/react"
import 'zone.js'

function App() {
  const [code, setCode] = useState(
`//Welcome to JSExplorer! Here you can play around with JavaScript to learn how it works.

console.log('Hello from JSExplorer!')

setTimeout(() => {
  console.log('Timeout executed!')
}, 1000)

Promise.resolve().then(() => {
  console.log('Promise resolved!')
})`)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [speed, setSpeed] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isEventLoopModalOpen, setIsEventLoopModalOpen] = useState(false)

  const executeCode = useCallback(() => {
    setIsRunning(true)
    setIsPaused(false)
    setConsoleOutput([])

    const consoleProxy = {
      log: (...args: any[]) => {
        setConsoleOutput(prev => [...prev, `> ${args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')}`])
      },
      error: (...args: any[]) => {
        setConsoleOutput(prev => [...prev, `Error: ${args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')}`])
      }
    }

    try {
      try {
        new Function(code)
      } catch (e) {
        if (e instanceof SyntaxError) {
          const cleanMessage = e.message.replace(/(?:at line \d+)|(?:line \d+)/i, '').trim()
          const errorMsg = `Syntax Error: ${cleanMessage}`
          setConsoleOutput(prev => [...prev, errorMsg])
          return
        }
      }

      const safeFunction = new Function('console', code)
      safeFunction(consoleProxy)
    } catch (error) {
      if (error instanceof Error) {
        const errorMsg = `${error.name}: ${error.message}`
        setConsoleOutput(prev => [...prev, errorMsg])
      } else {
        setConsoleOutput(prev => [...prev, String(error)])
      }
    }
  }, [code])

  const handleReset = () => {
    setIsRunning(false)
    setConsoleOutput([])
  }

  return (
    <div className="h-screen overflow-hidden bg-base-300 flex flex-col">
      <nav className="navbar h-16 bg-base-200 border-b border-base-100">
        <div className="flex-1">
          <div className="flex items-center gap-1 px-4">
            <img src="/logo.svg" className="w-12 h-12 text-primary" />
            <span className="text-xl font-bold">JSExplorer</span>
          </div>
        </div>
        <div className="flex-none px-4">
          <a
            href="https://github.com/s4mst3r25/jsexplorer"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-ghost"
          >
            <Github className="w-5 h-5" />
            GitHub
          </a>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)] p-4 gap-4">
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex-1 bg-base-200 rounded-lg overflow-hidden border border-base-100">
            <div className="h-full flex flex-col">
              <div className="h-[48px] flex items-center justify-between px-2 py-3 bg-base-200 border-b border-base-100">
                <div className="flex items-center gap-2 ml-1">
                  <Code2 className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Code</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Speed</span>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="range range-primary range-xs w-24"
                    />
                    <span className="text-xs text-gray-400 w-8 text-right">{speed}x</span>
                  </div>
                  {!isRunning ? (
                    <button className="btn btn-sm btn-primary" onClick={executeCode}>
                      <PlayCircle className="w-4 h-4" />
                      Run
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => setIsPaused(!isPaused)}
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
                      <button className="btn btn-sm btn-ghost" onClick={handleReset}>
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
                    onChange={(value) => setCode(value || '')}
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

          <div className="h-48 bg-base-200 rounded-lg overflow-hidden border border-base-100">
            <div className="h-full flex flex-col">
              <div className="h-[48px] flex items-center justify-between px-2 py-3 bg-base-200 border-b border-base-100">
                <div className="flex items-center gap-2 ml-1">
                  <Terminal className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Console</h2>
                </div>
                <div className="flex items-center">
                  {consoleOutput.length > 0 && (
                    <button 
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={() => setConsoleOutput([])}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 bg-base-250 p-2 overflow-auto font-mono text-sm">
                {consoleOutput.length > 0 ? (
                  consoleOutput.map((output, index) => (
                    <div 
                      key={index} 
                      className={`${output.startsWith('Error:') || output.startsWith('Syntax Error:') ? 'text-error' : 'text-gray-200'}`}
                    >
                      {output}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No output yet...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex gap-4">
          <div className="w-1/3 flex flex-col gap-4">
            <div className="flex-1 bg-base-200 rounded-lg overflow-hidden border border-base-100">
              <div className="h-full flex flex-col">
                <div className="h-[48px] flex items-center justify-between px-2 py-3 bg-base-200 border-b border-base-100">
                  <div className="flex items-center gap-2 ml-1">
                    <Layers className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Call Stack</h3>
                  </div>
                </div>
                <div className="flex-1 bg-base-250 p-2 overflow-auto">
                  <div className="text-sm text-gray-400">Empty</div>
                </div>
              </div>
            </div>

            <div className="h-48 bg-base-200 rounded-lg overflow-hidden border border-base-100">
              <div className="h-full flex flex-col">
                <div className="h-[48px] flex items-center justify-between px-2 py-3 bg-base-200 border-b border-base-100">
                  <div className="flex items-center gap-2 ml-1">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Event Loop</h3>
                  </div>
                  <button 
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => setIsEventLoopModalOpen(true)}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 bg-base-250 p-2 overflow-auto flex items-center justify-center">
                  <RefreshCw className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-2/3 flex flex-col gap-4">
            <div className="h-full bg-base-200 rounded-lg overflow-hidden border border-base-100">
              <div className="h-full flex flex-col">
                <div className="h-[48px] p-3 bg-base-200 border-b border-base-100 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Web APIs</h3>
                </div>
                <div className="flex-1 bg-base-250 p-2 overflow-auto">
                  <div className="text-sm text-gray-400">Empty</div>
                </div>
              </div>
            </div>

            <div className="h-full bg-base-200 rounded-lg overflow-hidden border border-base-100">
              <div className="h-full flex flex-col">
                <div className="h-[48px] p-3 bg-base-200 border-b border-base-100 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Task Queue</h3>
                </div>
                <div className="flex-1 bg-base-250 p-2 overflow-auto">
                  <div className="text-sm text-gray-400">Empty</div>
                </div>
              </div>
            </div>

            <div className="h-full bg-base-200 rounded-lg overflow-hidden border border-base-100">
              <div className="h-full flex flex-col">
                <div className="h-[48px] p-3 bg-base-200 border-b border-base-100 flex items-center gap-2">
                  <List className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Microtask Queue</h3>
                </div>
                <div className="flex-1 bg-base-250 p-2 overflow-auto">
                  <div className="text-sm text-gray-400">Empty</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <dialog id="event_loop_modal" className={`modal ${isEventLoopModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-200 border border-base-100 p-0">
          <div className="h-[48px] flex items-center px-4 border-b border-base-100">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Event Loop</h3>
            </div>
          </div>
          <div className="p-4 bg-base-200">
            <p>
              <p>The event loop is responsible for managing the tasks and making sure they execute in the correct order.</p>
            </p>
          </div>
          <div className="modal-action px-4 py-3">
            <button className="btn btn-sm btn-ghost" onClick={() => setIsEventLoopModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => setIsEventLoopModalOpen(false)}>
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}

export default App