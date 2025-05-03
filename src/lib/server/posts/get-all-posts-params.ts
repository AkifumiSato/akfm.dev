import { glob } from "glob";

export function getAllPostsParams() {
  const files = glob.sync("posts/[0-9]*/[0-9]*/*.md");
  return files
    .map((file) => {
      // glob的に必ずmatch
      const [_post, year, date, slugMd] = file.split("/");
      const slug = slugMd.replace(".md", "");
      if (year && date && slug) {
        return {
          year,
          date,
          slug,
        };
      }
      throw new Error("/[year]/[date]/[slug]形式である必要があります");
    })
    .sort((prev, next) => {
      const prevFullDate = `${prev.year}${prev.date}`;
      const nextFullDate = `${next.year}${next.date}`;
      return nextFullDate > prevFullDate ? 1 : -1;
    });
}
