import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface Post {
  title: string
  description: string
  date: string
  category: string
  slug: string
  translationKey: string
  lang: "en" | "es"
  content: string
  readTime?: number
}

const contentDirectory = path.join(process.cwd(), "content")

export function getAllPosts(): Post[] {
  try {
    if (!fs.existsSync(contentDirectory)) {
      fs.mkdirSync(contentDirectory, { recursive: true })
      return []
    }

    const fileNames = fs.readdirSync(contentDirectory)
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, "")
        const fullPath = path.join(contentDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const { data, content } = matter(fileContents)

        const wordsPerMinute = 200
        const wordCount = content.split(/\s+/g).length
        const readTime = Math.ceil(wordCount / wordsPerMinute)

        return {
          title: data.title || "",
          description: data.description || "",
          date: data.date || "",
          category: data.category || "",
          slug: data.slug || slug,
          translationKey: data.translationKey || slug,
          lang: data.lang || "en",
          content,
          readTime,
        } as Post
      })

    return allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1
      } else {
        return -1
      }
    })
  } catch (error) {
    console.error("Error reading posts:", error)
    return []
  }
}

export function getPostsByLanguage(lang: "en" | "es"): Post[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) => post.lang === lang)
}

export function getPostBySlug(slug: string): Post | undefined {
  const allPosts = getAllPosts()
  return allPosts.find((post) => post.slug === slug)
}

export function getSiblingPost(translationKey: string, targetLang: "en" | "es"): Post | undefined {
  const allPosts = getAllPosts()
  return allPosts.find((post) => post.translationKey === translationKey && post.lang === targetLang)
}

export function getCategories(lang: "en" | "es"): string[] {
  const posts = getPostsByLanguage(lang)
  const categories = posts.map((post) => post.category)
  return Array.from(new Set(categories))
}
