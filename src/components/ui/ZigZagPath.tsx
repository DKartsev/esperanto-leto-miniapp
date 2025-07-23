import { FC } from 'react'
import { motion } from 'framer-motion'

interface ZigZagPathProps {
  d: string
  index: number
  className?: string
}

const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { delay: i * 0.05 + 0.05 }
  })
}

const ZigZagPath: FC<ZigZagPathProps> = ({ d, index, className }) => (
  <motion.path
    d={d}
    stroke="#059669"
    strokeWidth="2"
    fill="none"
    className={className}
    initial="hidden"
    animate="visible"
    variants={pathVariants}
    custom={index}
  />
)

export default ZigZagPath
