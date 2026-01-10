import { NextResponse } from "next/server"
import { getAllPosts, getPostsByLanguage, getCategories } from "@/lib/markdown"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get("lang") as "en" | "es" | null

  if (!lang) {
    const allPosts = getAllPosts()
    return NextResponse.json(allPosts)
  }

  // Otherwise return filtered posts by language
  const posts = getPostsByLanguage(lang)
  const categories = getCategories(lang)

  return NextResponse.json({ posts, categories })
}
