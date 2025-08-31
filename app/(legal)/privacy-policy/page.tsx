import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for this hobby app using Google OAuth. We collect your name and email for authentication only.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <h1 className="text-pretty text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Effective Date: 30th August 2025</p>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-6 py-8">
        <section aria-labelledby="intro">
          <h2 id="intro" className="text-xl font-semibold tracking-tight">
            1. Introduction
          </h2>
          <p className="mt-3 leading-relaxed">
            This application ("we," "our," or "the App") is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, and safeguard your personal information when you sign in using Google OAuth.
            By using the App, you agree to the terms of this Privacy Policy.
          </p>
        </section>

        <section aria-labelledby="info-we-collect" className="mt-8">
          <h2 id="info-we-collect" className="text-xl font-semibold tracking-tight">
            2. Information We Collect
          </h2>
          <p className="mt-3 leading-relaxed">
            When you sign in with Google, we collect the following information from your Google account:
          </p>
          <ul className="mt-3 list-disc pl-6 leading-relaxed">
            <li>Name</li>
            <li>Email address</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            We do not collect any other information from your Google account (e.g., contacts, files, photos, calendar
            data, etc.).
          </p>
        </section>

        <section aria-labelledby="purpose" className="mt-8">
          <h2 id="purpose" className="text-xl font-semibold tracking-tight">
            3. Purpose of Data Use
          </h2>
          <p className="mt-3 leading-relaxed">The data collected is used exclusively for:</p>
          <ul className="mt-3 list-disc pl-6 leading-relaxed">
            <li>Authentication (to verify your identity)</li>
            <li>Providing secure access to your account within the App</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            We do not use your information for advertising, profiling, or any unrelated purpose.
          </p>
        </section>

        <section aria-labelledby="sharing" className="mt-8">
          <h2 id="sharing" className="text-xl font-semibold tracking-tight">
            4. Data Sharing and Disclosure
          </h2>
          <p className="mt-3 leading-relaxed">
            We will never sell, rent, or trade your personal data to third parties. Your information may only be
            disclosed:
          </p>
          <ul className="mt-3 list-disc pl-6 leading-relaxed">
            <li>To comply with a legal obligation or lawful request by public authorities</li>
            <li>
              To enforce our Terms of Service or protect the rights, property, or safety of the App, our users, or
              others
            </li>
          </ul>
        </section>

        <section aria-labelledby="storage-security" className="mt-8">
          <h2 id="storage-security" className="text-xl font-semibold tracking-tight">
            5. Data Storage and Security
          </h2>
          <p className="mt-3 leading-relaxed">
            We use industry-standard security measures to store and protect your information against unauthorized
            access, alteration, disclosure, or destruction. Your data is stored only for as long as you actively use the
            App. If you delete your account or request removal, your information will be permanently deleted from our
            systems (unless required by law to retain it).
          </p>
        </section>

        <section aria-labelledby="your-rights" className="mt-8">
          <h2 id="your-rights" className="text-xl font-semibold tracking-tight">
            6. Your Rights (GDPR/CCPA)
          </h2>
          <p className="mt-3 leading-relaxed">
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="mt-3 list-disc pl-6 leading-relaxed">
            <li>
              <span className="font-medium">Right to Access:</span> Request a copy of the data we hold about you.
            </li>
            <li>
              <span className="font-medium">Right to Rectification:</span> Correct inaccurate or incomplete information.
            </li>
            <li>
              <span className="font-medium">Right to Erasure:</span> Request deletion of your data ("Right to be
              Forgotten").
            </li>
            <li>
              <span className="font-medium">Right to Data Portability:</span> Receive your data in a structured,
              machine-readable format.
            </li>
            <li>
              <span className="font-medium">Right to Withdraw Consent:</span> Revoke your consent to data processing at
              any time.
            </li>
            <li>
              <span className="font-medium">Right to Opt-Out (CCPA):</span> California residents may opt out of any
              “sale” of personal information (note: we do not sell personal data).
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            To exercise any of these rights, please contact us at help.safeornot@gmail.com. We will respond in accordance
            with applicable data protection laws.
          </p>
        </section>

        <section aria-labelledby="children" className="mt-8">
          <h2 id="children" className="text-xl font-semibold tracking-tight">
            7. Children’s Privacy
          </h2>
          <p className="mt-3 leading-relaxed">
            Our App is not directed toward individuals under the age of 13 (or the relevant minimum age in your
            jurisdiction). We do not knowingly collect information from children. If you believe a child has provided us
            with personal data, please contact us immediately.
          </p>
        </section>

        <section aria-labelledby="changes" className="mt-8">
          <h2 id="changes" className="text-xl font-semibold tracking-tight">
            8. Changes to This Privacy Policy
          </h2>
          <p className="mt-3 leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be posted within the App, and the
            “Effective Date” above will be updated. Continued use of the App after such updates constitutes acceptance
            of the revised Privacy Policy.
          </p>
        </section>

        <section aria-labelledby="contact" className="mt-8">
          <h2 id="contact" className="text-xl font-semibold tracking-tight">
            9. Contact Information
          </h2>
          <p className="mt-3 leading-relaxed">
            If you have questions, requests, or concerns about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-3 leading-relaxed">
            Safe or Not
            <br />
            Email: help.safeornot@gmail.com
            <br />
           
          </p>
        </section>
      </article>
    </main>
  )
}
