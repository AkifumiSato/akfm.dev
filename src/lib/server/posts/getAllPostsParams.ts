import { glob } from 'glob'

export function getAllPostsParams() {
  const files = glob.sync('posts/[0-9]*/[0-9]*/*.md')
  return files.map((file) => {
    // glob的に必ずmatch
    const [_post, year, date, slugMd] = file.split('/')
    const slug = slugMd.replace('.md', '')
    if (year && date && slug) {
      return {
        params: {
          year,
          date,
          slug,
        },
      }
    }
    throw new Error('/[year]/[date]/[slug]形式である必要があります')
  })
}
