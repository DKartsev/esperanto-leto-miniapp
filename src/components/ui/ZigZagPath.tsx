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
    strokeWidth="1.5"
    strokeDasharray="4"
    strokeLinecap="round"
    stroke="#C5C5C5"
    fill="none"
    className={className}
    initial="hidden"
    animate="visible"
    variants={pathVariants}
    custom={index}
  />
)

export default ZigZagPath
