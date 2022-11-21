import * as fs from 'fs'
import * as path from 'path'

export function parsePostsMarkdown(postPath: string) {
  const targetPath = path.resolve(`posts/${postPath}.md`)
  const file = fs.readFileSync(targetPath, 'utf-8')
  return file
}
