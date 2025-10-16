"use client";

import WorldMap from "@/components/ui/world-map";
import { useAuth } from "@/contexts/AuthContext";
import SelectGender from "./SelectGender";
import LoginButton from "./LoginLogoutButton";
import { useGetDefaultUserLanding } from "@/features/user/use-get-user-landing";
import Script from "next/script";
import Image from "next/image";
import CTA from "./CTA";
import BentoBox from "./BentoBox";

export default function LandingPage() {
  const { user, loading } = useAuth();

  const shouldFetchUserData = !!user && !loading;

  const { data, isLoading, isError } = useGetDefaultUserLanding({
    enabled: shouldFetchUserData,
  });

  return (
    <main className="min-h-screen w-full py-10 sm:py-16 md:py-20 dark:bg-black bg-white flex flex-col justify-center items-center overflow-hidden">
      {/* Metadata JSON-LD for SEO */}
      <Script
        id="ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "SafeOrNot",
            url: "https://safeornot.space",
            description:
              "Community-driven and real-time safety tips.",
          }),
        }}
      />

      {/* Hero Section */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-bold text-3xl lg:text-4xl dark:text-white text-black">
          Your Everyday <span className="italic text-red-500">Safety Lens</span>
        </h1>

        {/* <p className="text-sm sm:text-base md:text-lg text-neutral-500 max-w-xs sm:max-w-md md:max-w-2xl mx-auto py-2 sm:py-3 md:py-4">
          Subtle safety insights — quick, simple, and reassuring.
        </p> */}

      </header>

      {/* Why Section */}
      <section
        aria-labelledby="why-safeornot"
        className="w-full max-w-4xl text-center px-4 sm:px-6 lg:px-8"
      >
        <p className="mt-2 text-sm sm:text-base md:text-lg text-neutral-500 mx-auto py-2 sm:py-3 md:py-4">
          Get community-driven and real-time tips for safer
          decisions wherever you go.
        </p>
      </section>

      {/* CTA Section */}
      <section className="mt-6 ">
        {!user ? (
          <CTA extraLoading={isLoading} userPresent={false} />
        ) : (
          <CTA extraLoading={isLoading} userPresent={true} />
        )}
      </section>

      {/* Map Section */}
      <section
        aria-label="Interactive World Safety Map"
        className="w-full max-w-7xl mx-auto mt-6 sm:mt-8 md:mt-10 px-2 sm:px-4"
      >
        <div className="aspect-[16/9] sm:aspect-[16/8] md:aspect-[16/7] lg:aspect-[16/6] flex justify-center items-center">
          {/* <WorldMap
            dots={[
              {
                start: { lat: 64.2008, lng: -149.4937 }, // Alaska
                end: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
              },
              {
                start: { lat: 64.2008, lng: -149.4937 }, // Alaska
                end: { lat: -15.7975, lng: -47.8919 }, // Brasília
              },
              {
                start: { lat: -15.7975, lng: -47.8919 }, // Brasília
                end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
              },
              {
                start: { lat: 51.5074, lng: -0.1278 }, // London
                end: { lat: 28.6139, lng: 77.209 }, // New Delhi
              },
              {
                start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
              },
              {
                start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
              },
            ]}
          /> */}
          <Image src="/hero.avif" alt="hero" height='1200' width='1200' />
        </div>

      </section>

      {/* Gender Selection */}
      <SelectGender
        DialogOpen={
          !isLoading && !isError && data?.userData.gender === null
        }
      />

      {/* Hero Support Section */}
      <section
        aria-labelledby="support-hero"
        className="w-full flex justify-center items-center pb-8 px-4  md:pb-16 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl mx-auto">
  {/* Badges Container - Centered horizontally at top */}
  <div className="flex justify-center items-center gap-2 mb-6">
    <a 
  href="https://startupfa.me/s/safeornot?utm_source=safeornot.space" 
  target="_blank"
  rel="noopener noreferrer"
>
  <img 
    src="https://startupfa.me/badges/featured-badge.webp" 
    alt="SafeOrNot - Featured on Startup Fame" 
    width={171} 
    height={54}
    className="w-auto h-auto max-w-[140px] sm:max-w-[171px]"
  />
</a>

<a
  href="https://peerpush.net/p/safe-or-not"
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src="https://peerpush.net/p/safe-or-not/badge"
    alt="Safe or Not badge"
    width={171} 
    height={54}
    className="w-auto h-auto max-w-[140px] sm:max-w-[171px]"
  />
</a>

  </div>

  {/* Peerlist Image - Centered below badges */}
  <div className="flex justify-center">
    <Image
      src="/peerlist.avif"
      alt="Peerlist community support"
      width={550}
      height={550}
      className="w-full h-auto max-w-md md:max-w-lg"
      priority
    />
  </div>
</div>

      </section>

      <BentoBox/>

      {/* NEW: How It Works Section - Adds ~200 words */}
      <section className="w-full max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
            How SafeOrNot Works
          </h2>
          <p className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto">
            Our platform connects travelers worldwide to share authentic safety experiences. 
            Every location review comes from real people who have been there, creating a 
            trusted network of safety information you can rely on when planning your next trip.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold mb-3">Browse Locations</h3>
            <p className="text-neutral-600">
              Search any location worldwide to discover safety insights, ratings, and 
              detailed reviews from our global community of travelers.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold mb-3">Share Your Experience</h3>
            <p className="text-neutral-600">
              Contribute to the community by sharing your own safety experiences. 
              Your insights help fellow travelers make informed decisions.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3">Make Informed Decisions</h3>
            <p className="text-neutral-600">
              Access real-time safety data, day/night comparisons, and AI-powered 
              recommendations to travel with confidence.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="community-description"
        className="w-full py-12 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {/* Text Content */}
            <div className="flex-1 max-w-2xl">
              <h2
                id="community-description"
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center lg:text-left bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent leading-tight tracking-wide animate-fade-in"
              >
                A growing community of{' '}
                <span className="italic font-semibold">travelers</span>{' '}
                sharing real experiences for safer, smarter journeys.
              </h2>
            </div>

            {/* Image Content */}
            <div className="flex-1 max-w-2xl">
              <Image
                src="/og.webp"
                alt="Travel community experiences and reviews"
                width={1000}
                height={1000}
                className="rounded-2xl border-b-4 border-black"
              />
            </div>
          </div>
        </div>
      </section>

      {/* NEW: FAQ Section - Adds ~300 words */}
      <section className="w-full max-w-4xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-10">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          <details className="group border border-neutral-200 rounded-lg p-6">
            <summary className="font-semibold text-lg cursor-pointer">
              How accurate are the safety ratings?
            </summary>
            <p className="mt-3 text-neutral-600">
              Our safety ratings are based on real user experiences and community reports. 
              We use AI to identify patterns and verify authenticity, ensuring reliable 
              information for travelers worldwide.
            </p>
          </details>

          <details className="group border border-neutral-200 rounded-lg p-6">
            <summary className="font-semibold text-lg cursor-pointer">
              Can I contribute safety information?
            </summary>
            <p className="mt-3 text-neutral-600">
              Yes! We encourage all travelers to share their experiences. Simply create 
              an account, search for a location, and add your review. Your contribution 
              helps build a safer travel community.
            </p>
          </details>

          <details className="group border border-neutral-200 rounded-lg p-6">
            <summary className="font-semibold text-lg cursor-pointer">
              Is SafeOrNot free to use?
            </summary>
            <p className="mt-3 text-neutral-600">
              Yes, SafeOrNot is completely free for all travelers. Browse locations, 
              read reviews, and contribute your own experiences at no cost.
            </p>
          </details>

          <details className="group border border-neutral-200 rounded-lg p-6">
            <summary className="font-semibold text-lg cursor-pointer">
              How often is safety information updated?
            </summary>
            <p className="mt-3 text-neutral-600">
              Safety information is updated in real-time as community members share new 
              experiences. Our AI continuously analyzes patterns to provide the most 
              current safety insights.
            </p>
          </details>
        </div>
      </section>

      {/* Community Description Section */}
      


      {/* Footer */}
      <footer className="mt-10 text-center text-xs text-neutral-500">
        <p>
          © {new Date().getFullYear()} SafeOrNot. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
