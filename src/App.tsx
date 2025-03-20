import { useState, useCallback, useRef, useEffect } from 'react'
import { Github, Globe, Layers, ListTodo, List, RefreshCw, Info } from 'lucide-react'
import { Monaco } from "@monaco-editor/react"
import { v4 as uuidv4 } from 'uuid'
import { CodeEditor } from './components/CodeEditor'
import { Console } from './components/Console'
import { TaskBox } from './components/TaskBox'
import { FloatingTask } from './components/FloatingTask'
import { Task, BoxPosition } from './types'

function App() {
  const [code, setCode] = useState(
`// Welcome to JSExplorer! Here you can play around with JavaScript to learn how it works.

setTimeout(() => {
    console.log(1);
}, 0);

Promise.resolve().then(() => {
    console.log(2);
});

console.log(3);

setTimeout(() => {
    console.log(4);
}, 0);

console.log(5);`)

  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [speed, setSpeed] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isEventLoopModalOpen, setIsEventLoopModalOpen] = useState(false)
  const [callStack, setCallStack] = useState<Task[]>([])
  const [webApis, setWebApis] = useState<Task[]>([])
  const [taskQueue, setTaskQueue] = useState<Task[]>([])
  const [microtaskQueue, setMicrotaskQueue] = useState<Task[]>([])
  const [floatingTask, setFloatingTask] = useState<{
    task: Task;
    startPosition: BoxPosition;
    endPosition: BoxPosition;
  } | null>(null)
  
  const editorRef = useRef<any>(null)
  const decorationsRef = useRef<string[]>([])
  const monacoRef = useRef<Monaco | null>(null)
  const boxPositions = useRef<Record<string, DOMRect>>({})
  const shouldContinueRef = useRef(true)
  const pauseRef = useRef<boolean>(false);

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
  }

  const highlightCode = (startLine: number, startColumn: number, endLine: number, endColumn: number) => {
    if (!editorRef.current || !monacoRef.current) return

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      [{
        range: new monacoRef.current.Range(startLine, startColumn, endLine, endColumn),
        options: {
          inlineClassName: 'bg-primary bg-opacity-20'
        }
      }]
    )
  }

  const clearHighlight = () => {
    if (!editorRef.current) return
    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [])
  }

  const delay = (ms: number) => {
    return new Promise<void>((resolve) => {
      let startTime = Date.now();
      let elapsedTime = 0;
      
      const check = () => {
        if (!pauseRef.current) {
          elapsedTime += Date.now() - startTime;
          if (elapsedTime >= ms / speed) {
            resolve();
          } else {
            startTime = Date.now();
            setTimeout(check, 50);
          }
        } else {
          startTime = Date.now();
          setTimeout(check, 100);
        }
      };
      
      check();
    });
  };

  const moveTask = async (task: Task, from: string, to: string, throughEventLoop: boolean = false) => {
    if (!shouldContinueRef.current) return

    const fromBox = boxPositions.current[from]
    const toBox = boxPositions.current[to]
    const eventLoopBox = throughEventLoop ? boxPositions.current['eventLoop'] : null

    if (!fromBox || !toBox) return

    const cardWidth = 180
    const cardHeight = 40

    let startX = fromBox.x + (fromBox.width - cardWidth) / 2
    let startY = fromBox.y + 60
    
    if (from === 'callStack') {
      setCallStack(prev => prev.filter(t => t.id !== task.id))
    } else if (from === 'webApis') {
      setWebApis(prev => prev.filter(t => t.id !== task.id))
    } else if (from === 'taskQueue') {
      setTaskQueue(prev => prev.filter(t => t.id !== task.id))
    } else if (from === 'microtaskQueue') {
      setMicrotaskQueue(prev => prev.filter(t => t.id !== task.id))
    }
    
    await new Promise(resolve => setTimeout(resolve, 50))
    if (!shouldContinueRef.current) return

    if (!throughEventLoop || !eventLoopBox) {
      setFloatingTask({
        task,
        startPosition: { 
          x: startX, 
          y: startY,
          width: cardWidth,
          height: cardHeight
        },
        endPosition: { 
          x: toBox.x + (toBox.width - cardWidth) / 2, 
          y: toBox.y + 60,
          width: cardWidth,
          height: cardHeight
        }
      })
      
      await delay(500)
      if (!shouldContinueRef.current) return
      
      setFloatingTask(null)
      
      await new Promise(resolve => setTimeout(resolve, 50))
      if (!shouldContinueRef.current) return
      
      if (to === 'callStack') {
        setCallStack(prev => [...prev, task])
      } else if (to === 'webApis') {
        setWebApis(prev => [...prev, task])
      } else if (to === 'taskQueue') {
        setTaskQueue(prev => [...prev, task])
      } else if (to === 'microtaskQueue') {
        setMicrotaskQueue(prev => [...prev, task])
      }
    } else {
      setFloatingTask({
        task,
        startPosition: { 
          x: startX, 
          y: startY,
          width: cardWidth,
          height: cardHeight
        },
        endPosition: { 
          x: eventLoopBox.x + (eventLoopBox.width - cardWidth) / 2, 
          y: eventLoopBox.y + (eventLoopBox.height - cardHeight) / 2,
          width: cardWidth,
          height: cardHeight
        }
      })
      
      await delay(500)
      if (!shouldContinueRef.current) return
      
      await delay(300)
      if (!shouldContinueRef.current) return
      
      setFloatingTask({
        task,
        startPosition: { 
          x: eventLoopBox.x + (eventLoopBox.width - cardWidth) / 2, 
          y: eventLoopBox.y + (eventLoopBox.height - cardHeight) / 2,
          width: cardWidth,
          height: cardHeight
        },
        endPosition: { 
          x: toBox.x + (toBox.width - cardWidth) / 2, 
          y: toBox.y + 60,
          width: cardWidth,
          height: cardHeight
        }
      })
      
      await delay(500)
      if (!shouldContinueRef.current) return
      
      setFloatingTask(null)
      
      await new Promise(resolve => setTimeout(resolve, 50))
      if (!shouldContinueRef.current) return
      
      if (to === 'callStack') {
        setCallStack(prev => [...prev, task])
      } else if (to === 'webApis') {
        setWebApis(prev => [...prev, task])
      } else if (to === 'taskQueue') {
        setTaskQueue(prev => [...prev, task])
      } else if (to === 'microtaskQueue') {
        setMicrotaskQueue(prev => [...prev, task])
      }
    }
  }

  const fadeAndRemoveFromCallStack = async (taskId: string) => {
    setCallStack(prev => prev.map(item => 
      item.id === taskId ? { ...item, fadeOut: true } : item
    ))
    
    await new Promise(resolve => setTimeout(resolve, 300))
    if (!shouldContinueRef.current) return
    
    setCallStack(prev => prev.filter(item => item.id !== taskId))
    
    await new Promise(resolve => setTimeout(resolve, 50))
    if (!shouldContinueRef.current) return
  }

  const executeCode = useCallback(async () => {
    shouldContinueRef.current = true
    setIsRunning(true)
    setIsPaused(false)
    setConsoleOutput([])
    setCallStack([])
    setWebApis([])
    setTaskQueue([])
    setMicrotaskQueue([])
    clearHighlight()

    try {
      const setTimeout1 = {
        id: uuidv4(),
        name: 'setTimeout()',
        type: 'function' as const,
        line: 3,
      }
      setCallStack([setTimeout1])
      highlightCode(3, 0, 5, 3)
      await delay(1000)
      if (!shouldContinueRef.current) return

      const callback1 = {
        id: uuidv4(),
        name: '() => { console.log(1) }',
        type: 'async' as const,
        line: 3,
      }
      await moveTask(callback1, 'callStack', 'webApis')
      if (!shouldContinueRef.current) return
      
      highlightCode(3, 0, 5, 3)
      await delay(500)
      if (!shouldContinueRef.current) return

      const promise = {
        id: uuidv4(),
        name: 'Promise.resolve()',
        type: 'function' as const,
        line: 7,
      }
      setCallStack([promise])
      highlightCode(7, 0, 9, 3)
      await delay(1000)
      if (!shouldContinueRef.current) return

      const promiseCallback = {
        id: uuidv4(),
        name: '() => { console.log(2) }',
        type: 'promise' as const,
        line: 7,
      }
      await moveTask(promiseCallback, 'callStack', 'microtaskQueue')
      if (!shouldContinueRef.current) return
      
      highlightCode(7, 0, 9, 3)
      await delay(500)
      if (!shouldContinueRef.current) return

      const consoleLog3 = {
        id: uuidv4(),
        name: 'console.log()',
        type: 'function' as const,
        line: 11,
      }
      setCallStack([consoleLog3])
      highlightCode(11, 0, 11, 14)
      await delay(500)
      if (!shouldContinueRef.current) return
      setConsoleOutput(prev => [...prev, '3'])
      await fadeAndRemoveFromCallStack(consoleLog3.id)
      await delay(200)
      if (!shouldContinueRef.current) return

      const setTimeout2 = {
        id: uuidv4(),
        name: 'setTimeout()',
        type: 'function' as const,
        line: 13,
      }
      setCallStack([setTimeout2])
      highlightCode(13, 0, 15, 3)
      await delay(1000)
      if (!shouldContinueRef.current) return

      const callback2 = {
        id: uuidv4(),
        name: '() => { console.log(4) }',
        type: 'async' as const,
        line: 13,
      }
      await moveTask(callback2, 'callStack', 'webApis')
      if (!shouldContinueRef.current) return
      
      highlightCode(13, 0, 15, 3)
      await delay(500)
      if (!shouldContinueRef.current) return

      const consoleLog5 = {
        id: uuidv4(),
        name: 'console.log()',
        type: 'function' as const,
        line: 17,
      }
      setCallStack([consoleLog5])
      highlightCode(17, 0, 17, 14)
      await delay(500)
      if (!shouldContinueRef.current) return
      setConsoleOutput(prev => [...prev, '5'])
      await fadeAndRemoveFromCallStack(consoleLog5.id)
      await delay(200)
      if (!shouldContinueRef.current) return

      await moveTask(promiseCallback, 'microtaskQueue', 'callStack', true)
      if (!shouldContinueRef.current) return
      
      highlightCode(7, 0, 9, 3)
      await delay(500)
      if (!shouldContinueRef.current) return
      setConsoleOutput(prev => [...prev, '2'])
      await fadeAndRemoveFromCallStack(promiseCallback.id)
      await delay(200)
      if (!shouldContinueRef.current) return

      await moveTask(callback1, 'webApis', 'taskQueue')
      if (!shouldContinueRef.current) return
      
      await moveTask(callback2, 'webApis', 'taskQueue')
      if (!shouldContinueRef.current) return
      
      await delay(500)
      if (!shouldContinueRef.current) return

      await moveTask(callback1, 'taskQueue', 'callStack', true)
      if (!shouldContinueRef.current) return
      
      highlightCode(3, 0, 5, 3)
      await delay(500)
      if (!shouldContinueRef.current) return
      setConsoleOutput(prev => [...prev, '1'])
      await fadeAndRemoveFromCallStack(callback1.id)
      await delay(200)
      if (!shouldContinueRef.current) return

      await moveTask(callback2, 'taskQueue', 'callStack', true)
      if (!shouldContinueRef.current) return
      
      highlightCode(13, 0, 15, 3)
      await delay(500)
      if (!shouldContinueRef.current) return
      setConsoleOutput(prev => [...prev, '4'])
      await fadeAndRemoveFromCallStack(callback2.id)
      await delay(200)
      if (!shouldContinueRef.current) return

      setIsRunning(false)
      clearHighlight()
    } catch (error) {
      console.error('Error in executeCode: ', error)
    }
  }, [delay, speed, editorRef, monacoRef, clearHighlight, highlightCode])

  const handleReset = () => {
    shouldContinueRef.current = false
    setIsRunning(false)
    setIsPaused(false)
    setConsoleOutput([])
    setCallStack([])
    setWebApis([])
    setTaskQueue([])
    setMicrotaskQueue([])
    setFloatingTask(null)
    clearHighlight()
  }

  const togglePause = () => {
    setIsPaused(prev => !prev)
    pauseRef.current = !pauseRef.current
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
          <CodeEditor
            code={code}
            onChange={setCode}
            onMount={handleEditorDidMount}
            speed={speed}
            onSpeedChange={setSpeed}
            isRunning={isRunning}
            isPaused={isPaused}
            onRun={executeCode}
            onPause={togglePause}
            onReset={handleReset}
          />

          <Console
            output={consoleOutput}
            onClear={() => setConsoleOutput([])}
          />
        </div>

        <div className="w-1/2 flex gap-4">
          <div className="w-1/3 flex flex-col gap-4">
            <TaskBox
              title="Call Stack"
              icon={Layers}
              items={callStack}
              className="flex-1"
              onPositionChange={(pos) => boxPositions.current['callStack'] = pos}
            />

            <div className="h-48 bg-base-200 rounded-lg overflow-hidden border border-base-100">
              <div className="h-full flex flex-col">
                <div 
                  className="h-[48px] flex items-center justify-between px-2 py-3 bg-base-200 border-b border-base-100"
                  ref={(el) => {
                    if (el) boxPositions.current['eventLoop'] = el.getBoundingClientRect()
                  }}
                >
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
                  <RefreshCw className={`w-12 h-12 text-gray-400 ${isRunning && !isPaused ? 'animate-spin' : ''}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="w-2/3 flex flex-col gap-4">
            <TaskBox
              title="Web APIs"
              icon={Globe}
              items={webApis}
              className="h-full"
              onPositionChange={(pos) => boxPositions.current['webApis'] = pos}
            />

            <TaskBox
              title="Task Queue"
              icon={ListTodo}
              items={taskQueue}
              className="h-full"
              onPositionChange={(pos) => boxPositions.current['taskQueue'] = pos}
            />

            <TaskBox
              title="Microtask Queue"
              icon={List}
              items={microtaskQueue}
              className="h-full"
              onPositionChange={(pos) => boxPositions.current['microtaskQueue'] = pos}
            />
          </div>
        </div>
      </div>

      {floatingTask && (
        <FloatingTask
          task={floatingTask.task}
          startPosition={floatingTask.startPosition}
          endPosition={floatingTask.endPosition}
        />
      )}

      <dialog id="event_loop_modal" className={`modal ${isEventLoopModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-200 border border-base-100 p-0">
          <div className="h-[48px] flex items-center px-4 border-b border-base-100">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Event Loop</h3>
            </div>
          </div>
          <div className="p-4 bg-base-200">
            <p>The event loop is responsible for managing the tasks and making sure they execute in the correct order.</p>
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