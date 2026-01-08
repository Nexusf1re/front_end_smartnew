'use client'

import { Button } from './ui/button'
import { FileSpreadsheet } from 'lucide-react'
import Image from 'next/image'

export function Header() {
  const handleExportExcel = () => {
    // Funcionalidade de exportação para Excel
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
      <div className="flex items-center gap-3">

        <h1 className="text-2xl font-bold text-gray-900">Performance Manutenção</h1>
      </div>
    </header>
  )
}
