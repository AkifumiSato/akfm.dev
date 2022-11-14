export type Post = {
  year: string;
  date: string;
  slug: string;
};

export type PageProps = {
  params: Post;
};
