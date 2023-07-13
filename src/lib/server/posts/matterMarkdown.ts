import * as fs from 'fs'
import matter from 'gray-matter'
import * as path from 'path'
import * as process from 'process'

export type MarkdownMera = {
  data: {
    title: string
    archive?: boolean
  }
}

type Markdown = MarkdownMera & ReturnType<typeof matter>

function checkRequiredProperty(matterResult: {
  data: Record<string, unknown>
}): matterResult is Markdown {
  if (!Object.hasOwn(matterResult.data, 'title')) {
    return false
  }
  return true
}

export function matterMarkdown(postPath: string): Markdown {
  const targetPath = path.join(process.cwd(), `posts/${postPath}.md`)
  const file = fs.readFileSync(targetPath, 'utf-8')
  const result = matter(file)
  if (checkRequiredProperty(result)) {
    return result
  }
  throw new Error('マークダウンに必須プロパティが足りません')
}
