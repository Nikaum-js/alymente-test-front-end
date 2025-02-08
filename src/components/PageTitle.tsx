import { cn } from '@/lib/utils';
import React from 'react'

interface PageTitleProps {
  title: string;
  classname?: string
}

export default function PageTitle({ title, classname }: PageTitleProps) {
  return (
    <h1 className={cn("text-2xl font-semibold", classname)}>
      {title}
    </h1>
  )
}