import React from 'react'

export const SkeletonCard: React.FC<{lines?:number}> = ({lines=1}) => (
  <div className="animate-pulse space-y-2">
    {Array.from({length:lines}).map((_,i)=>(
      <div key={i} className="h-5 bg-gray-200 rounded" />
    ))}
  </div>
)

export const SkeletonText: React.FC<{lines?:number}> = ({lines=3}) => (
  <div className="animate-pulse space-y-2">
    {Array.from({length:lines}).map((_,i)=>(
      <div key={i} className="h-4 bg-gray-200 rounded" />
    ))}
  </div>
)

export const SkeletonSectionList: React.FC<{count?:number}> = ({count=5}) => (
  <div className="space-y-2">
    {Array.from({length:count}).map((_,i)=>(
      <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
    ))}
  </div>
)
