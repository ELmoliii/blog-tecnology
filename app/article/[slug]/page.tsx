"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import type { Post } from "@/lib/markdown"
import { useLanguage } from "@/lib/language-context"
import ReactMarkdown from "react-markdown"

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [post, setPost] = useState<Post | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      const response = await fetch(`/api/posts/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      }
    }
    fetchPost()
  }, [params.slug])

  useEffect(() => {
    if (post) {
      setMounted(true)
    }
  }, [post])

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className={`py-12 transition-opacity duration-700 md:py-20 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <div className="container mx-auto max-w-4xl px-4 md:px-6">
            <Button
              variant="ghost"
              size="sm"
              className="mb-8 transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("article.backToHome")}
            </Button>

            <header className="mb-12">
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                {post.category}
              </Badge>
              <h1 className="text-balance mb-6 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {post.title}
              </h1>
              <p className="text-pretty mb-6 text-xl leading-relaxed text-muted-foreground">{post.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.date}>
                    {t("article.published")}{" "}
                    {new Date(post.date).toLocaleDateString(post.lang === "es" ? "es-ES" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {post.readTime} {t("article.readTime")}
                  </span>
                </div>
              </div>
            </header>

            <div className="prose prose-lg dark:prose-invert mx-auto">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
