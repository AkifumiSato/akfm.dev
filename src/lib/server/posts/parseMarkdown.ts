import * as fs from 'fs'
import * as path from 'path'

export function parseMarkdown(postPath: string) {
  const targetPath = path.resolve(`posts/${postPath}.md`)
  return fs.readFileSync(targetPath, 'utf-8')
}
