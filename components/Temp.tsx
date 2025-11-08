import * as React from "react";

interface TempEmailTemplate {
    firstName: string;
    logoUrl: string;
    
}

export function TempEmailTemplate({
    firstName,
    logoUrl,
   
}: TempEmailTemplate) {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#333333', lineHeight: '1.6', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                
                {/* Logo */}
                <div style={{ marginBottom: '20px' }}>
                    <img 
                        src={logoUrl} 
                        alt="Safe or Not Logo" 
                        style={{ height: '40px', width: 'auto', display: 'block' }} 
                    />
                </div>

                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '16px', color: '#1f2937', margin: '0 0 15px 0' }}>
                        Hi {firstName},
                    </p>
                    <p style={{ fontSize: '15px', color: '#374151', margin: '0 0 15px 0' }}>
                        Thank you for being one of our first 100 members. Your early support means a lot to our team.
                    </p>
                </div>

                {/* Referral intro */}
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '15px', color: '#374151', margin: '0 0 15px 0' }}>
                        We have launched a referral program where you can invite your friends to join Safe or Not. When they sign up using your unique referral code, you earn recognition in our community.
                    </p>
                </div>

                {/* Rewards section */}
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <p style={{ fontSize: '15px', color: '#374151', margin: '0 0 12px 0', fontWeight: '600' }}>
                        Monthly Rewards
                    </p>
                    
                    <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0' }}>
                        • Top 3 referrers receive a verified badge
                    </p>
                    
                    <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 12px 0' }}>
                        • The top referrer with at least 10 successful referrals receives a 500 (INR) rupee Amazon gift card
                    </p>
                    
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>
                        Your verified badge increases visibility and trust for your contributions in the community.
                    </p>
                </div>

                {/* How to access */}
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '15px', color: '#374151', margin: '0 0 15px 0' }}>
                        You can find your unique referral code in your account settings. Simply share this code with your friends through WhatsApp, Instagram, or any platform you prefer.
                    </p>
                    
                    <p style={{ fontSize: '15px', color: '#374151', margin: '0 0 15px 0' }}>
                        When your friends use your code during signup, they join our travel safety community and you move closer to earning monthly rewards.
                    </p>

                     <p style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
                         <a href={'https://www.safeornot.space/profile'} style={{ color: '#2563eb', textDecoration: 'underline' }}>Here is the link to your profile</a>
                    </p>
                </div>

                {/* Closing */}
                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '15px', color: '#374151', margin: '0 0 15px 0' }}>
                        Thank you for helping us grow a community of travelers who care about safety.
                    </p>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '0' }}>
                        Best regards,<br />
                        Lakshay Gupta<br />
                        Founder<br />
                        Safe or Not
                    </p>
                </div>

            </div>
        </div>
    );
}
