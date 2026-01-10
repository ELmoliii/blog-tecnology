"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import type { Post } from "@/lib/markdown"
import { useLanguage } from "@/lib/language-context"

interface ArticleCardProps {
  post: Post
}

export function ArticleCard({ post }: ArticleCardProps) {
  const { t } = useLanguage()

  return (
    <Link href={`/article/${post.slug}`} className="group">
      <Card className="h-full overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/50">
        <CardHeader>
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
              {post.category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {post.readTime} {t("article.readTime")}
              </span>
            </div>
          </div>
          <CardTitle className="line-clamp-2 font-serif text-xl font-bold leading-tight transition-colors duration-300 group-hover:text-primary">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-base leading-relaxed">{post.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(post.lang === "es" ? "es-ES" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
