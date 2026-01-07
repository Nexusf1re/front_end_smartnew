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
        <Image 
          src="/logo-ico.png" 
          alt="Logo" 
          width={55} 
          height={55}
          className="object-contain"
        />
        <h1 className="text-2xl font-bold text-gray-900">Performance Manutenção - SmartNew System</h1>
      </div>
    </header>
  )
}
