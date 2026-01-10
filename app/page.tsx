"use client"

import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ArticleCard } from "@/components/article-card"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/language-context"
import { useEffect, useState } from "react"
import type { Post } from "@/lib/markdown"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const { language, t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function fetchPosts() {
      const response = await fetch(`/api/posts?lang=${language}`)
      const data = await response.json()
      setPosts(data.posts)
      setCategories(data.categories)
    }
    fetchPosts()
  }, [language])

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === null || post.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="w-full flex flex-col items-center min-h-screen">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Hero />
      <main className="flex-1 w-full">
        <section id="articles" className="py-20 md:py-32">
          <div
            className={`max-w-7xl mx-auto px-4 md:px-6 transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            <div className="mb-8 text-center">
              <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl mx-auto">{t("latest.title")}</h2>
            </div>

            {categories.length > 0 && (
              <div className="mb-12 flex flex-wrap justify-center gap-3">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 hover:scale-105 ${
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-accent"
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  {t("filter.all")}
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 hover:scale-105 ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-accent"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            )}

            {filteredPosts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-muted/30 p-12 text-center">
                <p className="text-lg text-muted-foreground mx-auto">
                  {searchQuery
                    ? `${t("search.noResults")} "${searchQuery}".`
                    : selectedCategory
                      ? `${t("category.noArticles")} "${selectedCategory}".`
                      : `${t("noArticles.available")}`}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
