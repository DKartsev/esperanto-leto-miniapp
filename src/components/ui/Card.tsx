import { FC, ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
}

const Card: FC<CardProps> = ({ children, className }) => (
  <div className={clsx('rounded-2xl bg-white border shadow-sm', className)}>
    {children}
  </div>
)

export default Card
