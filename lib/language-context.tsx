"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

type Language = "en" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    "nav.home": "Home",
    "nav.articles": "Articles",
    "nav.categories": "Categories",
    "nav.about": "About",
    "hero.title": "Technology & Innovation",
    "hero.subtitle": "Exploring the intersection of AI, software development, and the digital future",
    "latest.title": "Latest Articles",
    "latest.readMore": "Read article",
    "categories.title": "Categories",
    "footer.rights": "All rights reserved",
    "footer.description":
      "Exploring the frontiers of technology, AI, and innovation. Your source for cutting-edge tech insights.",
    "footer.connect": "Connect",
    "footer.newsletter": "Newsletter",
    "footer.newsletterDesc": "Get the latest tech insights delivered to your inbox.",
    "footer.namePlaceholder": "Your Name",
    "footer.emailPlaceholder": "your@email.com",
    "footer.subscribe": "Subscribe",
    "footer.builtWith": "Built with",
    "search.placeholder": "Search articles...",
    "search.noResults": "No articles found for",
    "filter.all": "All",
    "article.published": "Published on",
    "article.category": "Category",
    "article.readTime": "min read",
    "article.backToHome": "Back to Home",
  },
  es: {
    "nav.home": "Inicio",
    "nav.articles": "Artículos",
    "nav.categories": "Categorías",
    "nav.about": "Acerca de",
    "hero.title": "Tecnología e Innovación",
    "hero.subtitle": "Explorando la intersección de IA, desarrollo de software y el futuro digital",
    "latest.title": "Últimos Artículos",
    "latest.readMore": "Leer artículo",
    "categories.title": "Categorías",
    "footer.rights": "Todos los derechos reservados",
    "footer.description":
      "Explorando las fronteras de la tecnología, IA e innovación. Tu fuente de conocimiento tecnológico de vanguardia.",
    "footer.connect": "Conectar",
    "footer.newsletter": "Boletín",
    "footer.newsletterDesc": "Recibe los últimos conocimientos tecnológicos en tu bandeja de entrada.",
    "footer.namePlaceholder": "Tu Nombre",
    "footer.emailPlaceholder": "tu@email.com",
    "footer.subscribe": "Suscribirse",
    "footer.builtWith": "Creado con",
    "search.placeholder": "Buscar artículos...",
    "search.noResults": "No se encontraron artículos para",
    "filter.all": "Todos",
    "article.published": "Publicado el",
    "article.category": "Categoría",
    "article.readTime": "min de lectura",
    "article.backToHome": "Volver al Inicio",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang) {
      setLanguage(savedLang)
    }
  }, [])

  const handleSetLanguage = async (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)

    // Check if we're on an article page
    if (pathname?.startsWith("/article/")) {
      try {
        // Fetch all posts to find the sibling
        const response = await fetch("/api/posts")
        if (response.ok) {
          const allPosts = await response.json()

          // Extract current slug from pathname
          const currentSlug = pathname.split("/article/")[1]

          // Find current post
          const currentPost = allPosts.find((p: any) => p.slug === currentSlug)

          if (currentPost) {
            // Find sibling post with same translationKey but target language
            const siblingPost = allPosts.find(
              (p: any) => p.translationKey === currentPost.translationKey && p.lang === lang,
            )

            if (siblingPost) {
              // Redirect to sibling article
              router.push(`/article/${siblingPost.slug}`)
              return
            }
          }
        }
      } catch (error) {
        console.error("[v0] Error finding sibling post:", error)
      }

      // Fallback to home page if no translation found
      router.push("/")
    }
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
