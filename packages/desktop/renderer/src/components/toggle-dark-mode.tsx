"use client"

import * as React from "react"
import { Check, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const themes = [
  {
    value: "system",
    label: "System", 
    illustration: (
      <div className="relative w-full aspect-[4/3] flex items-end justify-center">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full bg-white"/>
          <div className="w-1/2 h-full bg-[#181A20]" />
        </div>
        <Image src="/dashboard-system.svg" alt="System" width={128} height={96} className="relative z-1" />
      </div>
    ),
  },
  {
    value: "light",
    label: "Light",
    illustration: (
      <div className="relative w-full aspect-[4/3] flex items-end justify-center bg-white rounded-lg">
        <Image src="/dashboard-light.svg" alt="Light" width={128} height={96} />
      </div>
    ),
  },
  {
    value: "dark", 
    label: "Dark",
    illustration: (
      <div className="relative w-full aspect-[4/3] flex items-end justify-center bg-[#181A20] rounded-lg">
        <Image src="/dashboard-dark.svg" alt="Dark" width={128} height={96} />
      </div>
    ),
  },
]

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <div className="flex gap-4">
        {themes.map((t) => (
          <a className="flex flex-col gap-2" 
          key={t.value}
          type="button"
          aria-label={`Select ${t.label} theme`}
          onClick={() => setTheme(t.value)}>
            <button
              
              className={cn(
                "group relative flex-1 p-0 rounded-2xl border-2 transition-all focus:outline-none",
                theme === t.value
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40"
              )}
            >
              <Card className="flex flex-col overflow-hidden items-center bg-transparent shadow-none border-0 p-0">
                <div className="w-full">{t.illustration}</div>
              </Card>
              {theme === t.value && (
                <span className="absolute -top-2 -right-2 bg-primary rounded-full p-1 shadow-lg z-2">
                  <Check className="text-white" size={18} />
                </span>
              )}
            </button>
            <span className="text-card-foreground">{t.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
