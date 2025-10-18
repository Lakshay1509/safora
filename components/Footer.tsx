import Image from "next/image"
import Link from "next/link"
import { Instagram, Linkedin } from "lucide-react"

export function Footer({
  instagramHref = "https://www.instagram.com/safeornot_/",
  linkedinHref = "https://www.linkedin.com/company/safe-or-not/",
  size = 20,
  className = "",
}) {
  return (
    <footer className="bg-[#F9FAFB] border-t border-gray-100 shadow-sm" role="contentinfo">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block group">
              <Image
                src="/logo.avif"
                alt="Safe or Not - Travel Safety Community"
                width={180}
                height={50}
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              Discover safe places and connect with travelers worldwide.
            </p>
          </div>

          {/* Column 2: Community */}
          <nav aria-label="Community Navigation" className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/community?view=feed"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
                >
                  Community Feed
                </Link>
              </li>
              <li>
                <Link
                  href="/community?view=article"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
                >
                  Articles
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 3: Support & Legal */}
          <nav aria-label="Support and Legal" className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:help.safeornot@gmail.com"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
                >
                  Help Center
                </a>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 4: Account & Social */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Get Started
            </h3>
            <ul className="space-y-3 mb-6">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
                >
                  Sign In
                </Link>
              </li>
            </ul>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Follow Us
              </p>
              <div className={`flex items-center gap-3 ${className}`}>
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <Instagram size={size} />
                </a>
                <a
                  href={linkedinHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on LinkedIn"
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <Linkedin size={size} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} Safe or Not. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
