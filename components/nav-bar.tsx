"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Settings, Activity, Menu, Wifi, WifiOff } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useWebSocket } from "@/lib/websocket"
import { ModeToggle } from "@/components/mode-toggle"

export default function NavBar() {
  const pathname = usePathname()
  const { connected, useFallbackMode } = useWebSocket()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/test-connection", label: "Diagnóstico", icon: Activity },
    { href: "/setup", label: "Configuração", icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">DroneControl</span>
          </Link>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <span className="text-xl font-bold">DroneControl</span>
              </Link>
            </div>
            <nav className="flex flex-col gap-4 mt-8 px-7">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 text-sm font-medium ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex items-center space-x-4 md:space-x-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <div className="flex items-center">
            {connected || useFallbackMode ? (
              <div className="flex items-center text-green-500" title="Conectado">
                <Wifi className="h-5 w-5 mr-2" />
                <span className="hidden md:inline text-sm">{useFallbackMode ? "Simulação" : "Conectado"}</span>
              </div>
            ) : (
              <div className="flex items-center text-red-500" title="Desconectado">
                <WifiOff className="h-5 w-5 mr-2" />
                <span className="hidden md:inline text-sm">Desconectado</span>
              </div>
            )}
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

