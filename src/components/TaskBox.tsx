import { DivideIcon as LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Task } from '../types'
import { useRef, useEffect } from 'react'

interface TaskBoxProps {
  title: string
  icon: typeof LucideIcon
  items: Task[]
  className?: string
  onPositionChange?: (position: DOMRect) => void
}

export function TaskBox({ title, icon: Icon, items, className = '', onPositionChange }: TaskBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (boxRef.current && onPositionChange) {
      const observer = new ResizeObserver(() => {
        onPositionChange(boxRef.current!.getBoundingClientRect())
      })
      
      observer.observe(boxRef.current)
      onPositionChange(boxRef.current.getBoundingClientRect())

      return () => observer.disconnect()
    }
  }, [onPositionChange])

  return (
    <div ref={boxRef} className={`bg-base-200 rounded-lg overflow-hidden border border-base-100 ${className}`}>
      <div className="h-full flex flex-col">
        <div className="h-[48px] p-3 bg-base-200 border-b border-base-100 flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="flex-1 bg-base-250 p-2 overflow-auto">
          <AnimatePresence mode="popLayout">
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: (item as any).fadeOut ? 0 : 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm bg-base-200 p-3 rounded border-2 border-primary shadow-lg"
                  >
                    <span className="text-primary font-bold">{item.name}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">Empty</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}