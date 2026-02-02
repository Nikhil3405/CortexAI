"use client";

import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/favicon.ico" 
              alt="CortexAI" 
              width={32} 
              height={32}
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
            <span className="font-bold text-neutral-900 text-lg sm:text-xl">CortexAI</span>
          </Link>
          <Link 
            href="/" 
            className="text-sm sm:text-base text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-neutral-200 p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
          <p className="text-sm sm:text-base text-neutral-500 mb-8">Last updated: February 1, 2026</p>

          <div className="prose prose-sm sm:prose-base max-w-none space-y-6 text-neutral-700">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">1. Introduction</h2>
              <p>
                CortexAI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered document analysis service.
              </p>
              <p className="mt-3">
                Please read this Privacy Policy carefully. By using CortexAI, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mt-4 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Email address, password (encrypted), and profile information</li>
                <li><strong>Document Content:</strong> PDF files and documents you upload to the Service</li>
                <li><strong>Conversation Data:</strong> Questions you ask and interactions with the AI</li>
                <li><strong>Feedback:</strong> Any feedback, comments, or suggestions you provide</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mt-4 mb-2">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> Information about how you use the Service, including features accessed and time spent</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers</li>
                <li><strong>Log Data:</strong> Server logs, error reports, and performance metrics</li>
                <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to track activity and improve user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">3. How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Service Delivery:</strong> To provide, operate, and maintain the CortexAI service</li>
                <li><strong>Document Analysis:</strong> To process your documents and generate AI-powered responses</li>
                <li><strong>Account Management:</strong> To manage your account and provide customer support</li>
                <li><strong>Improvement:</strong> To understand usage patterns and improve our Service</li>
                <li><strong>Communication:</strong> To send you updates, security alerts, and administrative messages</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues and security threats</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">4. Data Storage and Security</h2>
              <p>
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Encryption of data in transit using SSL/TLS protocols</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Restricted access to personal information on a need-to-know basis</li>
              </ul>
              <p className="mt-3">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">5. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy. Specifically:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Account Data:</strong> Retained until you delete your account</li>
                <li><strong>Documents:</strong> Stored as long as you maintain your account or until you delete them</li>
                <li><strong>Conversation History:</strong> Retained to provide continuity in your interactions</li>
                <li><strong>Log Data:</strong> Typically retained for 90 days for security and troubleshooting</li>
              </ul>
              <p className="mt-3">
                You may request deletion of your data at any time by contacting us or deleting your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">6. Data Sharing and Disclosure</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our Service (e.g., cloud hosting, AI model providers)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users or others</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">7. Your Rights and Choices</h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Export:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Object:</strong> Object to certain types of data processing</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us at privacy@cortexai.com.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">8. AI and Machine Learning</h2>
              <p>
                CortexAI uses artificial intelligence and machine learning models to analyze your documents and generate responses. Important notes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Your documents are processed by AI models to provide the Service</li>
                <li>We do not use your documents to train our AI models without explicit consent</li>
                <li>AI-generated responses are based solely on the content you provide</li>
                <li>We implement measures to prevent unauthorized access to your document data during processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">9. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve the Service</li>
                <li>Provide security features</li>
              </ul>
              <p className="mt-3">
                You can control cookie settings through your browser, but some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">10. Children's Privacy</h2>
              <p>
                CortexAI is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete such information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">11. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using CortexAI, you consent to the transfer of your information to these countries.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Updating the "Last updated" date at the top of this policy</li>
                <li>Sending you an email notification (for significant changes)</li>
                <li>Displaying a prominent notice in the Service</li>
              </ul>
              <p className="mt-3">
                Your continued use of the Service after such modifications constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">13. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="font-medium text-neutral-900">CortexAI Privacy Team</p>
                <p className="text-neutral-600">Email: privacy@cortexai.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs sm:text-sm text-neutral-500">
            © 2026 CortexAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}