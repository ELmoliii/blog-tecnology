"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Languages, Menu, Moon, Sun, Search, Github, Globe } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { useState } from "react"

interface HeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export function Header({ searchQuery = "", onSearchChange }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [activeNav, setActiveNav] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)

  const navItems = [
    { key: "nav.home", href: "/" },
    { key: "nav.articles", href: "#articles" },
  ]

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en")
  }

  const displayLanguage = language === "en" ? "Español" : "English"

  return (
    <header className="sticky top-4 left-0 right-0 z-50 px-4">
      <div className="mx-auto w-full max-w-7xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-background/70 backdrop-blur-md backdrop-saturate-150 shadow-xl shadow-black/5">
        <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-500/50">
              <span className="text-xl font-bold text-white">MS</span>
            </div>
            <span className="hidden sm:inline font-serif text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-600 bg-clip-text text-transparent">
              MoliSchola
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onMouseEnter={() => setActiveNav(item.key)}
                onMouseLeave={() => setActiveNav("")}
                className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-primary group"
              >
                {t(item.key)}
                <span
                  className={`absolute -bottom-1 left-0 h-1 w-1 rounded-full bg-primary transition-all duration-300 ${
                    activeNav === item.key ? "opacity-100 scale-100" : "opacity-0 scale-0"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={language === "es" ? "Buscar artículos..." : "Search articles..."}
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-9 pr-4 h-9 bg-background/50 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary/50 focus:bg-background/70 transition-all duration-300 ${
                  searchFocused ? "scale-105" : "scale-100"
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-xl h-9 w-9 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
              >
                <a href="https://github.com/ELmoliii" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-xl h-9 w-9 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
              >
                <a href="https://alejandromoli.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Portfolio</span>
                </a>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2 rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">{displayLanguage}</span>
            </Button>

            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 pt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {t(item.key)}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
