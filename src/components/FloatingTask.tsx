import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'
import { Task, BoxPosition } from '../types'

interface FloatingTaskProps {
  task: Task
  startPosition: BoxPosition
  endPosition: BoxPosition
}

export function FloatingTask({ task, startPosition, endPosition }: FloatingTaskProps) {
  const controls = useAnimation()

  useEffect(() => {
    const animate = async () => {
      await controls.start({
        x: endPosition.x,
        y: endPosition.y,
        width: endPosition.width,
        height: endPosition.height,
        transition: { duration: 0.5, ease: 'easeInOut' }
      })
    }
    
    animate()
  }, [controls, endPosition])

  return (
    <motion.div
      initial={{ ...startPosition, position: 'fixed', zIndex: 100 }}
      animate={controls}
      className="text-sm bg-base-200 p-3 rounded border-2 border-primary shadow-lg"
      style={{ width: startPosition.width, height: startPosition.height, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
    >
      <span className="text-primary font-bold">{task.name}</span>
    </motion.div>
  )
}