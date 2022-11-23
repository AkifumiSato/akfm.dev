class NextRequest {}

class NextResponse {
  // not compatible
  constructor(public url: string | URL) {}

  static redirect(url: string | URL) {
    return new NextResponse(url)
  }
}

export { NextRequest, NextResponse }
