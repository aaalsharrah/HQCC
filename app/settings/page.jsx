'use client'

import { AppSidebarContent } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Menu, Moon } from 'lucide-react'
import { useAuth } from '@/lib/firebase/auth-context'
import { useState } from 'react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [username, setUsername] = useState('')
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border fixed inset-y-0 left-0 bg-background/50 backdrop-blur-xl z-30">
        <AppSidebarContent />
      </aside>

      <main className="flex-1 md:ml-64">
        {/* Mobile Sidebar Trigger */}
        <header className="sticky top-0 z-20 flex items-center p-4 md:hidden bg-background/50 backdrop-blur-md border-b border-border/50">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
          <h1 className="text-lg font-bold ml-4">Settings</h1>
        </header>

        <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
          <h1 className="text-3xl font-bold mb-8 hidden md:block">Settings</h1>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Account</h2>
              <div className="h-px bg-border"></div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" defaultValue="********" />
                </div>
                <div>
                  <Button variant="link" className="px-0 h-auto text-primary">
                    Forgot Password?
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Appearance</h2>
              <div className="h-px bg-border"></div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </Label>
                <button
                  id="dark-mode"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Legal & Policies</h2>
              <div className="h-px bg-border"></div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  By using HQCC, you agree to our{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
                <p>Version 1.0.0</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

