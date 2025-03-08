import { useState, useCallback } from 'react'
import { Terminal, Code2, PlayCircle, Github, Globe, Layers, ListTodo, List } from 'lucide-react'
import Editor from "@monaco-editor/react"

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

  const executeCode = useCallback(() => {
    setConsoleOutput([])

    const consoleProxy = {
      log: (...args: any[]) => {
        setConsoleOutput(prev => [...prev, args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')])
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
          const match = e.message.match(/(?:at line (\d+))|(?:line (\d+))/i)
          const lineNum = match ? (match[1] || match[2]) : null
          const cleanMessage = e.message.replace(/(?:at line \d+)|(?:line \d+)/i, '').trim()
          const errorMsg = lineNum ? `Syntax Error at line ${lineNum}: ${cleanMessage}` : `Syntax Error: ${cleanMessage}`
          setConsoleOutput(prev => [...prev, errorMsg])
          return
        }
      }

      const safeFunction = new Function('console', code)
      safeFunction(consoleProxy)
    } catch (error) {
      if (error instanceof Error) {
        const stack = error.stack || ''
        const match = stack.match(/<anonymous>:(\d+):(\d+)/)
        const lineNum = match ? match[1] : null
        const errorMsg = lineNum ? `${error.name} at line ${lineNum}: ${error.message}` : `${error.name}: ${error.message}`
        setConsoleOutput(prev => [...prev, errorMsg])
      } else {
        setConsoleOutput(prev => [...prev, String(error)])
      }
    }
  }, [code])

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
              <div className="flex items-center justify-between p-3 bg-base-200 border-b border-base-100 relative z-10">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Code</h2>
                </div>
                <button className="btn btn-sm btn-primary" onClick={executeCode}>
                  <PlayCircle className="w-4 h-4" />
                  Run
                </button>
              </div>
              <div className="flex-1 overflow-hidden relative z-20">
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

          <div className="h-48 bg-base-200 rounded-lg overflow-hidden border border-base-100">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-3 bg-base-200 border-b border-base-100">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Console</h2>
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
          <div className="w-1/3 bg-base-200 rounded-lg overflow-hidden border border-base-100">
            <div className="h-full flex flex-col">
              <div className="p-3 bg-base-200 border-b border-base-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Call Stack</h3>
              </div>
              <div className="flex-1 bg-base-250 p-2 overflow-auto">
                <div className="text-sm text-gray-400">Empty</div>
              </div>
            </div>
          </div>

          <div className="w-2/3 flex flex-col gap-4">
            <div className="flex-1 bg-base-200 rounded-lg overflow-hidden border border-base-100">
              <div className="h-full flex flex-col">
                <div className="p-3 bg-base-200 border-b border-base-100 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Web APIs</h3>
                </div>
                <div className="flex-1 bg-base-250 p-2 overflow-auto">
                  <div className="text-sm text-gray-400">Empty</div>
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-lg overflow-hidden border border-base-100">
              <div className="h-full flex flex-col">
                <div className="p-3 bg-base-200 border-b border-base-100 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Task Queue</h3>
                </div>
                <div className="flex-1 bg-base-250 p-2 overflow-auto">
                  <div className="text-sm text-gray-400">Empty</div>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-base-200 rounded-lg overflow-hidden border border-base-100">
              <div className="h-full flex flex-col">
                <div className="p-3 bg-base-200 border-b border-base-100 flex items-center gap-2">
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
    </div>
  )
}

export default App