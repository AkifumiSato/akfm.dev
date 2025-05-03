import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
function middlewarePage(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/about")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (
    request.nextUrl.pathname.startsWith("/blog") &&
    request.nextUrl.pathname.endsWith(".html")
  ) {
    const [_blank, _blog, fullDate, slugWithHtml] =
      request.nextUrl.pathname.split("/");
    const [year, month, date] = fullDate.split("-");
    const slug = slugWithHtml.replace(".html", "");
    if ([year].some((v) => v === undefined))
      throw new Error("blogのURLが不正です");
    return NextResponse.redirect(
      new URL(`/posts/${year}/${month}${date}/${slug}`, request.url),
    );
  }
  if (["/blog/", "/blog/2"].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/posts", request.url));
  }
}

export default middlewarePage;

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/about", "/blog/:path*"],
};
