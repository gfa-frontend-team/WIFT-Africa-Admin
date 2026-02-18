'use client'

import { useEffect, useState } from 'react'
import { useTheme } from "next-themes";
import StaffPage from '@/components/StaffManagement'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Label } from "@/components/ui/Label"
import { Briefcase, Palette, Sun, Moon, Monitor } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("staff")
  
  // State for primary color selection
  // const [primaryColor, setPrimaryColor] = useState('blue')

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), [])

  const descriptions: Record<string, string> = {
    staff: "Manage your team members, roles, and permissions.",
    theme: "Customize the look and feel and primary brand colors of your dashboard."
  }

  // const colorOptions = [
  //   { name: 'Blue', value: 'blue', class: 'bg-blue-600' },
  //   { name: 'Indigo', value: 'indigo', class: 'bg-indigo-600' },
  //   { name: 'Violet', value: 'violet', class: 'bg-violet-600' },
  //   { name: 'Emerald', value: 'emerald', class: 'bg-emerald-600' },
  //   { name: 'Rose', value: 'rose', class: 'bg-rose-600' },
  //   { name: 'Amber', value: 'amber', class: 'bg-amber-600' },
  // ]

  if (!mounted) return null

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          {descriptions[activeTab]}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Staff Management
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <StaffPage />
        </TabsContent>

        <TabsContent value="theme" className="space-y-6 mt-6">
          <div className="p-6 border border-border rounded-lg bg-card shadow-sm space-y-8">
            
            {/* Appearance Section */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Appearance</h3>
              <RadioGroup
                defaultValue={theme}
                onValueChange={(v) => setTheme(v)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {[
                  { id: 'light', icon: Sun, label: 'Light' },
                  { id: 'dark', icon: Moon, label: 'Dark' },
                  { id: 'system', icon: Monitor, label: 'System' }
                ].map((item) => (
                  <div key={item.id}>
                    <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
                    <Label
                      htmlFor={item.id}
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer transition-all ${
                        theme === item.id ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "border-muted"
                      }`}
                    >
                      <item.icon className={`mb-3 h-6 w-6 ${theme === item.id ? "text-blue-600" : "text-muted-foreground"}`} />
                      <span className="text-xs font-bold uppercase">{item.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <hr className="border-border" />

            {/* Accent Color Section */}
            {/* <div>
              <h3 className="text-lg font-medium text-foreground mb-1">Accent Color</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose the primary color for buttons and links.</p>
              
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPrimaryColor(color.value)}
                    className={`group relative w-10 h-10 rounded-full transition-all ${color.class} flex items-center justify-center hover:scale-110 active:scale-95`}
                    title={color.name}
                  >
                    {primaryColor === color.value && (
                      <Check className="w-5 h-5 text-white animate-in zoom-in duration-200" />
                    )}
                    <span className={`absolute -inset-1 rounded-full border-2 border-blue-600 transition-opacity ${primaryColor === color.value ? "opacity-100" : "opacity-0"}`} />
                  </button>
                ))}
              </div>
            </div> */}

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}