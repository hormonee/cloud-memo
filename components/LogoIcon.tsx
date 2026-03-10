import React from 'react'

type LogoIconProps = {
  className?: string
  iconSize?: string
  iconClass?: string
  containerClass?: string
}

export default function LogoIcon({ className = '', iconSize = 'text-xl', iconClass = '', containerClass = 'size-8 rounded-lg' }: LogoIconProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex flex-shrink-0 items-center justify-center bg-primary text-white shadow-lg shadow-primary/20 ${containerClass}`}>
        <span className={`material-symbols-outlined ${iconSize} ${iconClass}`}>cloud_upload</span>
      </div>
      <span className="font-black tracking-tight whitespace-nowrap">Cloud Memo</span>
    </div>
  )
}
