"use client";

import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">Terms of Service</h1>
          <p className="text-sm sm:text-base text-neutral-500 mb-8">Last updated: February 1, 2026</p>

          <div className="prose prose-sm sm:prose-base max-w-none space-y-6 text-neutral-700">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using CortexAI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">2. Description of Service</h2>
              <p>
                CortexAI provides an AI-powered document analysis platform that allows users to upload PDF documents and interact with them through natural language queries. The Service uses advanced language models to extract, analyze, and respond to questions about uploaded documents.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">3. User Accounts</h2>
              <p>
                To use the Service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Ensuring your account information is accurate and up-to-date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">4. Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Upload, transmit, or share content that is illegal, harmful, threatening, abusive, or otherwise objectionable</li>
                <li>Violate any intellectual property rights or proprietary rights of others</li>
                <li>Upload documents containing malware, viruses, or other harmful code</li>
                <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                <li>Use the Service for any commercial purpose without prior written consent</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">5. Content Ownership and Rights</h2>
              <p>
                You retain all ownership rights to the documents and content you upload to CortexAI. By uploading content, you grant us a limited license to process, store, and analyze your documents solely for the purpose of providing the Service to you.
              </p>
              <p className="mt-3">
                We do not claim ownership of your content and will not use it for any purpose other than providing the Service, except as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">6. Data Privacy and Security</h2>
              <p>
                Your use of the Service is also governed by our Privacy Policy. We implement industry-standard security measures to protect your data, but cannot guarantee absolute security. You acknowledge that you use the Service at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">7. AI-Generated Content</h2>
              <p>
                Responses generated by CortexAI are created using artificial intelligence and may contain inaccuracies or errors. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>AI-generated responses should be reviewed and verified before relying on them</li>
                <li>CortexAI is not responsible for decisions made based on AI-generated content</li>
                <li>The Service does not provide professional advice (legal, medical, financial, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">8. Service Availability</h2>
              <p>
                We strive to provide continuous service availability but do not guarantee uninterrupted access. We reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Modify, suspend, or discontinue the Service at any time</li>
                <li>Perform maintenance and updates without prior notice</li>
                <li>Limit usage or features for technical or security reasons</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, CortexAI and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Your use or inability to use the Service</li>
                <li>Unauthorized access to your data or transmissions</li>
                <li>Errors or inaccuracies in AI-generated content</li>
                <li>Any other matter relating to the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">10. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
              <p className="mt-3">
                You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the "Last updated" date. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">12. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="font-medium text-neutral-900">CortexAI Support</p>
                <p className="text-neutral-600">Email: support@cortexai.com</p>
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