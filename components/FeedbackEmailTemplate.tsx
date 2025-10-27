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
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#333333', lineHeight: '1.6' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                
                {/* Logo - Keep it simple and small */}
                <div style={{ marginBottom: '20px' }}>
                    <img 
                        src={logoUrl} 
                        alt="Safe or Not" 
                        style={{ height: '40px', width: 'auto' }} 
                    />
                </div>

                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'normal', color: '#1f2937', marginBottom: '10px' }}>
                        Hi {firstName},
                    </p>
                    <p style={{ fontSize: '16px', color: '#374151' }}>
                        I wanted to personally reach out and thank you for being one of our first 100 users. Your early support means everything to us.
                    </p>
                </div>

                {/* Body - More conversational, less promotional */}
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
                        You were among the first to believe in what we're building, and that truly motivates us every single day.
                    </p>

                    <p style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
                        I'd love to hear your honest thoughts — what's been great, what could be better, and what you'd love to see next.
                    </p>

                    <p style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
                        Would you mind sharing your feedback? It'll only take a minute or two: <a href={feedbackLink} style={{ color: '#2563eb', textDecoration: 'underline' }}>Here is the feedback link</a>
                    </p>
                </div>

                {/* Simple closing */}
                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '15px', color: '#374151', marginBottom: '15px' }}>
                        Thanks again, {firstName}. It means a lot to have you with us from the start.
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Best regards,<br />
                        Lakshay Gupta<br />
                        Founder, Safe or Not
                    </p>
                </div>
            </div>
        </div>
    );
}
