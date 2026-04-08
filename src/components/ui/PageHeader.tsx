'use client'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4 flex-wrap gap-2.5">
      <div>
        <h1 className="m-0 mb-0.5 text-[17px] font-bold text-t-primary">{title}</h1>
        {description && (
          <p className="m-0 text-xs text-t-lighter">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
