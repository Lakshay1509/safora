import * as React from "react";

interface FeedbackTemplateProps {
    firstName: string;
    logoUrl: string;
    feedbackLink: string;
}

export function FeedbackEmailTemplate({
    firstName,
    logoUrl,
    feedbackLink,
}: FeedbackTemplateProps) {
    return (
        <div style={{ backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '42rem', margin: '0 auto', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                
                {/* Header */}
                <div style={{ backgroundColor: '#ffffff', textAlign: 'center', padding: '1.5rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <img
                        src={logoUrl}
                        alt="Brand Logo"
                        style={{ height: '3rem', margin: '0 auto 2rem auto' }}
                    />
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>🎉 Thank You for Being One of Our First 100 Users!</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Hello {firstName}, your support means the world to us. 💙
                    </p>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>

                    <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '1rem' }}>
                        As an early supporter, your opinion matters more than ever.  
                        We'd love for you to share your honest thoughts about your experience so far — 
                        what's working, what's not, and what you'd love to see next.
                    </p>

                    <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '1.5rem' }}>
                        It'll take less than 2 minutes, but your feedback will help shape the future of our product 
                        for the next 1,000 users and beyond. 🙌
                    </p>

                    <a
                        href={feedbackLink}
                        style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#ffffff',
                            backgroundColor: '#4f46e5',
                            borderRadius: '0.375rem',
                            textDecoration: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        Share Your Feedback →
                    </a>
                </div>

                {/* Closing Note */}
                <div style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
                    <p style={{ fontSize: '0.95rem', color: '#374151', marginBottom: '0.5rem' }}>
                        From the whole team — thank you for believing in us this early.  
                        We couldn't have reached this milestone without you.
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Here's to building something amazing together. 🚀
                    </p>
                </div>

                {/* Footer */}
                <div style={{ backgroundColor: '#f9fafb', padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                    <p>
                        You're receiving this email because you're part of our first 100 users.  
                    </p>
                    
                </div>
            </div>
        </div>
    );
}
