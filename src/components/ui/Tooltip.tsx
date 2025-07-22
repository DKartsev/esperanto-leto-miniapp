import { FC, ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
  text: string
  children: ReactNode
}

const Tooltip: FC<TooltipProps> = ({ text, children }) => {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block" onClick={() => setOpen(o => !o)}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 whitespace-nowrap bg-white border border-gray-300 text-gray-800 text-sm rounded-lg px-2 py-1 shadow-lg"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

export default Tooltip
