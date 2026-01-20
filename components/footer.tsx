"use client"

import type React from "react"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Globe, Github, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })
      const data = await response.json()
      if (data.status === 'success') {
        console.log('Success:', data)
        setName("")
        setEmail("")
      } else {
        console.error('Error:', data.message)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#010409] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-20 md:px-6 flex flex-col items-center">
        <div className="w-full grid gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 transition-all duration-300 group-hover:scale-110">
                <span className="text-xl font-bold text-white">TV</span>
              </div>
              <span className="font-serif text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-600 bg-clip-text text-transparent">
                MoliSchola
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-pretty leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">{t("footer.connect")}</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://alejandromoli.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800/50 group-hover:bg-primary/10 transition-colors">
                  <Globe className="h-4 w-4" />
                </div>
                <span>Portfolio</span>
              </a>
              <a
                href="https://github.com/ELmoliii"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800/50 group-hover:bg-primary/10 transition-colors">
                  <Github className="h-4 w-4" />
                </div>
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/alex-moli/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800/50 group-hover:bg-primary/10 transition-colors">
                  <Linkedin className="h-4 w-4" />
                </div>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">{t("footer.newsletter")}</h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{t("footer.newsletterDesc")}</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder={t("footer.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white dark:bg-[#0a0f1a] border-slate-200 dark:border-slate-800 focus:border-primary/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <Input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-[#0a0f1a] border-slate-200 dark:border-slate-800 focus:border-primary/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20"
              >
                {t("footer.subscribe")}
              </Button>
            </form>
          </div>
        </div>

        <div className="w-full mt-16 border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
          <p>
            © {currentYear} Alejandro Molinero. {t("footer.rights")}.
          </p>
        </div>
      </div>
    </footer>
  )
}
