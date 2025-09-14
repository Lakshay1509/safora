import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#F9FAFB] border-t border-gray-100 shadow-sm">
      <nav
        aria-label="Footer"
        className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
      >
        {/* Left: links */}
        <div className="flex items-center gap-8">
          <Link
            href="/privacy-policy"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-1 py-1"
          >
            Privacy Policy
          </Link>
          <a
            href="mailto:help.safeornot@gmail.com"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-1 py-1"
          >
            Help
          </a>
        </div>

        {/* Right: logo */}
        <div className="md:ml-auto ">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Image
              src="/logo.avif"
              alt="Safe or Not"
              width={180}
              height={50}
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
            <span className="sr-only">Home</span>
          </Link>
        </div>
      </nav>
    </footer>
  )
}
