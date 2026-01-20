"use client"

import { useLanguage } from "@/lib/language-context"
import { Sparkles } from "lucide-react"

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative w-full overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-muted/30 pt-28 pb-20 md:pt-40 md:pb-32">
      <div className="w-full flex flex-col items-center justify-center text-center px-4 min-h-[40vh]">
        <div className="mx-auto max-w-4xl w-full">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Aprende con la tecnología</span>
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl text-center mx-auto w-full">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty md:text-xl text-center mx-auto w-full">
            {t("hero.subtitle")}
          </p>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
    </section>
  )
}
