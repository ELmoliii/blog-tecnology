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

import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/atom-one-dark.css"

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
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <article className={`transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          {/* Hero Section */}
          <div className="w-full bg-muted/30 border-b">
            <div className="container mx-auto px-4 py-12 md:py-20 max-w-screen-xl">
              <Button
                variant="ghost"
                size="sm"
                className="mb-8 hover:bg-transparent pl-0 hover:text-primary transition-colors"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("article.backToHome")}
              </Button>
              
              <div className="max-w-4xl">
                 <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1.5 text-sm">
                  {post.category}
                </Badge>
                <h1 className="text-balance mb-6 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-7xl">
                  {post.title}
                </h1>
                <p className="text-pretty text-xl leading-relaxed text-muted-foreground md:text-2xl max-w-3xl mb-8">
                  {post.description}
                </p>

                {/* Mobile Metadata (Hidden on Desktop) */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground lg:hidden border-t pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString(post.lang === "es" ? "es-ES" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="container mx-auto px-4 py-12 max-w-screen-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 xl:gap-24">
              {/* Main Content */}
              <div className="min-w-0">
                <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:font-bold max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-primary pl-4 py-2 bg-muted/30 my-4 rounded-r-lg italic" {...props} />
                      ),
                      pre: ({node, children, ...props}) => {
                         // Try to extract language from the code element (children)
                         let language = 'text';
                         if (children && typeof children === 'object' && 'props' in children) {
                           const childProps = (children as any).props;
                           if (childProps?.className) {
                             const match = /language-(\w+)/.exec(childProps.className);
                             if (match) {
                               language = match[1];
                             }
                           }
                         }

                         return (
                          <div className="relative rounded-lg overflow-hidden my-6 border bg-[#282c34]">
                            <div className="flex items-center px-4 py-2 bg-muted/20 border-b">
                              <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                              </div>
                              <span className="ml-4 text-xs text-muted-foreground font-mono">
                                {language}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <pre className="p-4 m-0 bg-transparent font-mono text-sm leading-relaxed" {...props}>
                                {children}
                              </pre>
                            </div>
                          </div>
                         )
                      },
                      code: ({node, className, children, ...props}: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        // If it has a language, it's likely a block (inside pre), so we keep it simple.
                        // If no language, likely inline, so we add pill styles.
                        // This logic isn't perfect but covers most cases without breaking hydration.
                        const isMatch = !!match
                        
                        return (
                          <code 
                            className={`${className} ${!isMatch ? "bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" : ""}`} 
                            {...props}
                          >
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Sidebar Metadata (Hidden on Mobile) */}
              <div className="hidden lg:block space-y-8 lg:sticky lg:top-24 h-fit">
                <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
                  <h3 className="font-serif text-lg font-semibold border-b pb-4">Article Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="p-2 rounded-full bg-muted">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("article.published")}</p>
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString(post.lang === "es" ? "es-ES" : "en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="p-2 rounded-full bg-muted">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                         <p className="font-medium text-foreground">{t("article.readTime")}</p>
                         <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
