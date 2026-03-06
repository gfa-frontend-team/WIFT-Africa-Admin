'use client'

import { useEffect, useState } from 'react'
import { useTheme } from "next-themes";
import StaffPage from '@/components/StaffManagement'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Briefcase, Palette, Sun, Moon, Monitor, Lock } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from "@/components/ui/Label"
import ChangePasswordTab from '@/components/ChangePassword';

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("staff")
  
  // Prevent hydration mismatch
  useEffect(() => setMounted(true), [])

  const descriptions: Record<string, string> = {
    staff: "Manage your team members, roles, and permissions.",
    theme: "Customize the look and feel and primary brand colors of your dashboard.",
    security: "Change your password and manage your account security."
  }

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
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Staff Management</span>
            <span className="sm:hidden">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Staff Management Tab */}
        <TabsContent value="staff">
          <StaffPage />
        </TabsContent>

        {/* Theme Tab */}
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
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <ChangePasswordTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}