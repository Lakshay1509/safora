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
            <div style={{ 
                maxWidth: '42rem', 
                margin: '0 auto', 
                backgroundColor: '#ffffff', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                borderRadius: '0.5rem', 
                overflow: 'hidden' 
            }}>
                
                {/* Header */}
                <div style={{ 
                    backgroundColor: '#ffffff', 
                    textAlign: 'center', 
                    padding: '1.5rem 1rem', 
                    borderBottom: '1px solid #e5e7eb' 
                }}>
                    <img
                        src={logoUrl}
                        alt="Brand Logo"
                        style={{ height: '3rem', margin: '0 auto 2rem auto' }}
                    />
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                        🎉 Thank You for Being One of Our First 100 Users!
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        Hey {firstName}, I just wanted to personally say — your early support means everything to us. 💙
                    </p>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>

                    <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '1rem' }}>
                        You were among the first to believe in what we're building, and that truly motivates us every single day.
                    </p>

                    <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '1rem' }}>
                        I'd love to hear your honest thoughts — what's been great, what could be better, and what you'd love to see next.
                    </p>

                    <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '1.5rem' }}>
                        It'll only take a minute or two, but your feedback will help shape the experience for the next 1,000 users (and beyond). 🙌
                    </p>

                    <a
                        href={feedbackLink}
                        style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            backgroundColor: '#4f46e5',
                            borderRadius: '0.375rem',
                            textDecoration: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                    >
                        Share Your Feedback →
                    </a>
                </div>

                {/* Closing Note */}
                <div style={{ 
                    padding: '1.5rem', 
                    textAlign: 'center', 
                    borderTop: '1px solid #e5e7eb', 
                    backgroundColor: '#ffffff' 
                }}>
                    <p style={{ fontSize: '0.95rem', color: '#374151', marginBottom: '0.75rem' }}>
                        Thanks again, {firstName}. It means a lot to have you with us from the start.  
                        Your journey with us is just beginning — and the best is yet to come. 🚀
                    </p>
                    <p style={{ 
                        fontSize: '0.9rem', 
                        color: '#6b7280', 
                        marginTop: '1rem', 
                        fontStyle: 'italic' 
                    }}>
                        With gratitude,<br />
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>Lakshay Gupta</span><br />
                        <span style={{ color: '#6b7280' }}>Founder, Safe or Not</span>
                    </p>
                </div>

               
            </div>
        </div>
    );
}
