import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex flex-col items-center p-8">
      {/* Hero Section */}
      <section className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Commute Smarter, Save the Planet
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Join your colleagues on premium office‑commute rides. Reduce traffic, cut carbon, and enjoy a comfortable journey.
        </p>
        <Link href="/dashboard">
          <a className="btn-primary inline-block px-6 py-3 text-lg">
            Explore Corridors
          </a>
        </Link>
      </section>

      {/* Why cpool.ai Section */}
      <section className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Why cpool.ai?</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Secure & verified rides – safety first.</li>
          <li>Instant carbon‑saving calculations displayed per ride.</li>
          <li>Premium AI‑driven matching for optimal seat‑fills.</li>
          <li>Earn Good Vibes reputation and unlock discounts.</li>
        </ul>
      </section>

      {/* Visual Showcase */}
      <section className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center p-6">
          <Image src="/images/office_commute_1.png" alt="Office commute" width={200} height={150} />
          <h3 className="mt-4 text-xl font-semibold">Fast & Reliable</h3>
          <p className="text-gray-600 text-center">Rides start as early as 5 am, perfect for early‑bird commuters.</p>
        </div>
        <div className="card flex flex-col items-center p-6">
          <Image src="/images/office_commute_2.png" alt="Carbon savings" width={200} height={150} />
          <h3 className="mt-4 text-xl font-semibold">Eco‑Friendly</h3>
          <p className="text-gray-600 text-center">See real‑time carbon‑saving badges on every ride.</p>
        </div>
        <div className="card flex flex-col items-center p-6">
          <Image src="/images/office_commute_3.png" alt="Premium experience" width={200} height={150} />
          <h3 className="mt-4 text-xl font-semibold">Premium Perks</h3>
          <p className="text-gray-600 text-center">Unlock coupons, AI filters, and exclusive lanes.</p>
        </div>
      </section>
    </div>
  );
}
