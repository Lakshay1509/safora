import * as React from "react";

interface Highlight {
    title: string;
    description: string;
    link: string;
    imageUrl?: string;
}

interface EmailTemplateProps {
    firstName: string;
    highlights: Highlight[];
    logoUrl: string;
}

export function EmailTemplate({
    firstName,
    highlights,
    logoUrl,
}: EmailTemplateProps) {
    return (
        <div style={{ backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '42rem', margin: '0 auto', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                {/* Header with Logo */}
                <div style={{ backgroundColor: '#ffffff', textAlign: 'center', padding: '1.5rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <img
                        src={logoUrl}
                        alt="Brand Logo"
                        style={{ height: '3rem', margin: '0 auto 2rem auto' }}
                    />
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Your Daily Digest</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Hello {firstName}, here's what's new today 👇
                    </p>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem' }}>
                    {highlights.map((item, idx) => (
                        <div
                            key={idx}
                            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '2rem' }}
                        >
                            {/* Text Section */}
                            <div style={{ flex: '1' }}>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>{item.title}</h2>
                                <p style={{ color: '#4b5563', fontSize: '0.875rem', marginTop: '0.25rem' }}>{item.description}</p>
                                <a
                                    href={item.link}
                                    style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#4f46e5', textDecoration: 'none' }}
                                >
                                    Read more →
                                </a>
                            </div>

                            {/* Image Section */}
                            {item.imageUrl && (
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    style={{ width: '4rem', height: '4rem', objectFit: 'cover', borderRadius: '0.5rem', flexShrink: 0 }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{ backgroundColor: '#f9fafb', padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                    <p>
                        You're receiving this email because you subscribed to Daily Digest.
                    </p>
                    <p style={{ marginTop: '0.25rem' }}>
                       
                        <a href="https://www.safeornot.space/profile/settings" style={{ color: '#4f46e5', textDecoration: 'none' }}>
                            Manage Preferences
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
