export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing and using Safe or Not, you accept and agree to be bound by the terms and provisions of this agreement. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Nature of Crowdsourced Data</h2>
          <p className="text-gray-700 mb-3">
            Safe or Not provides safety information based on crowdsourced data submitted by users. You acknowledge and agree that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>All safety ratings and information are provided by community members and reflect individual experiences and opinions</li>
            <li>Data displayed on our platform is publicly sourced and may not be verified or accurate</li>
            <li>Safety conditions can change rapidly and past experiences may not reflect current conditions</li>
            <li>Individual experiences and perceptions of safety vary significantly based on numerous factors</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Public Information</h2>
          <p className="text-gray-700">
            All data submitted to Safe or Not becomes publicly accessible information. By contributing content, you understand that 
            your submissions will be visible to all users and may be used to generate safety ratings and recommendations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. No Warranty and Limitation of Liability</h2>
          <p className="text-gray-700 mb-3">
            <strong>IMPORTANT:</strong> Safe or Not is provided "as is" without any warranties, express or implied. You specifically acknowledge:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>We make no guarantees about the accuracy, completeness, or reliability of any safety information</li>
            <li>We are not responsible for any decisions you make based on information from our platform</li>
            <li>We are not liable for any harm, injury, loss, or damage that may occur as a result of using our service</li>
            <li>You use this service entirely at your own risk</li>
            <li>Individual experiences vary, and what is safe for one person may not be safe for another</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. User Responsibility</h2>
          <p className="text-gray-700">
            You are solely responsible for your own safety and security. You should:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Exercise your own judgment and caution at all times</li>
            <li>Verify information through multiple sources</li>
            <li>Not rely solely on crowdsourced data for safety decisions</li>
            <li>Stay aware of your surroundings and trust your instincts</li>
            <li>Contact local authorities in case of emergency</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Variability of Experiences</h2>
          <p className="text-gray-700">
            Safety is subjective and depends on many factors including time of day, personal circumstances, local conditions, 
            and individual perception. We explicitly disclaim any responsibility for differences between reported experiences 
            and your actual experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify and hold harmless Safe or Not, its operators, and contributors from any claims, damages, or 
            expenses arising from your use of the service or your violation of these terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes 
            acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Contact</h2>
          <p className="text-gray-700">
            If you have questions about these terms, please contact us through our support channels,
            <span className="font-bold ml-2">help.safeornot@gmail.com</span>
          </p>
        </section>
      </div>
    </div>
  );
}
