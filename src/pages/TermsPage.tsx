import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-3xl border border-gray-200 overflow-hidden">
        <div className="bg-amber-500 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white">UniHive</p>
              <h1 className="text-3xl font-bold text-white">Terms of Service & Privacy Policy</h1>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">Agreement and Account Eligibility</h2>
            <p className="mt-3 text-sm text-gray-600 leading-7">
              By using UniHive, you agree to follow these terms and policies. Your account must represent a real student or authorized manager, and you must be truthful when providing personal details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Booking and Payment Responsibilities</h2>
            <p className="mt-3 text-sm text-gray-600 leading-7">
              All bookings, payments, and cancellations are governed by UniHive rules. You must provide accurate payment information, complete bookings in good faith, and communicate promptly if there are any issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Hostel Usage and Safety</h2>
            <p className="mt-3 text-sm text-gray-600 leading-7">
              Students must respect hostel policies, maintain a safe living environment, and follow any gender-specific room assignments. Managers must keep hostel listings accurate and respond to booking requests professionally.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Privacy and Data Use</h2>
            <p className="mt-3 text-sm text-gray-600 leading-7">
              UniHive collects and stores the information you provide to deliver services and process bookings. Your data is used only for account management, hostel communication, and payment verification unless you explicitly agree otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Important Notices</h2>
            <ul className="mt-3 space-y-3 text-sm text-gray-600 leading-7 list-disc list-inside">
              <li>All users must agree to these terms before creating an account.</li>
              <li>Gender selection is limited to male or female only for rooms and user profiles.</li>
              <li>UniHive may update these terms at any time; continued use indicates acceptance of changes.</li>
            </ul>
          </section>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-900">Note</p>
            <p className="mt-2 text-sm text-amber-700 leading-7">
              Your agreement is required to use UniHive. Please review these terms carefully before registering or booking a hostel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
