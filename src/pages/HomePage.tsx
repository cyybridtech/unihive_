import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Star, MapPin, CreditCard, MessageCircle, ChevronRight, CheckCircle, Users, Building2, Award, Hexagon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const { filteredHostels, universities, reviews, selectedUniversity, setSelectedUniversity } = useApp();
  const [searchUni, setSearchUni] = useState(selectedUniversity);
  const navigate = useNavigate();

  const featuredHostels = filteredHostels.filter(h => h.rating >= 4.5).slice(0, 4);
  const stats = { students: '12,500+', hostels: filteredHostels.length.toString(), universities: universities.length.toString(), bookings: '8,200+' };

  const handleSearch = () => {
    setSelectedUniversity(searchUni);
    navigate('/hostels');
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1920&q=40')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-amber-800/40 to-orange-700/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4 text-amber-200" />
              <span className="text-sm text-amber-100 font-medium">100% Verified Hostels Only</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Find Your Perfect<br />
              <span className="text-amber-200">Student Hostel</span>
            </h1>
            <p className="text-lg md:text-xl text-amber-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover verified, safe, and affordable hostels near your university. No scams, no surprises — just trusted accommodation.
            </p>

            <div className="bg-white rounded-2xl shadow-2xl p-3 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    aria-label="Select university"
                    value={searchUni}
                    onChange={e => setSearchUni(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none cursor-pointer"
                  >
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleSearch} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-600/40">
                  <Search className="w-5 h-5" /> Search Hostels
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Happy Students', value: stats.students },
              { icon: Building2, label: 'Verified Hostels', value: stats.hostels },
              { icon: Award, label: 'Universities', value: stats.universities },
              { icon: CreditCard, label: 'Bookings Made', value: stats.bookings },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <s.icon className="w-6 h-6 text-amber-200 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-amber-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How UniHive Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Book your perfect hostel in 4 simple steps. Our team verifies every listing so you can book with confidence.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: Search, title: 'Search', desc: 'Select your university and browse verified hostels nearby' },
              { step: '02', icon: Building2, title: 'Compare', desc: 'View photos, facilities, prices and read student reviews' },
              { step: '03', icon: CreditCard, title: 'Book & Pay', desc: 'Select a room and pay a small reservation fee to secure it' },
              { step: '04', icon: CheckCircle, title: 'Move In', desc: 'Get your booking confirmed and move into your new home' },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-amber-500 transition-colors duration-300">
                  <item.icon className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-xs font-bold text-amber-500 tracking-wider mb-2 block">STEP {item.step}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                {i < 3 && <ChevronRight className="hidden md:block absolute top-8 -right-4 w-6 h-6 text-amber-300" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hostels */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Hostels</h2>
              <p className="text-gray-500">Top-rated verified hostels picked by our team</p>
            </div>
            <Link to="/hostels" className="hidden md:flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-sm">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredHostels.map(hostel => {
              const uni = universities.find(u => u.id === hostel.universityId);
              return (
                <Link to={`/hostels/${hostel.id}`} key={hostel.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={hostel.mainImage} alt={hostel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {hostel.verified && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {hostel.rating}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 truncate">{hostel.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" /> {hostel.distanceFromCampus} from {uni?.name?.split(' ').slice(0, 3).join(' ')}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-600 font-bold text-sm">{hostel.priceRange}</span>
                      <span className="text-xs text-gray-400">{hostel.reviewCount} reviews</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link to="/hostels" className="inline-flex items-center gap-1 text-amber-600 font-semibold">View All Hostels <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* Why UniHive */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Students Trust UniHive</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">We&apos;re not just a listing platform — we physically verify every hostel before it goes live.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Physically Verified', desc: 'Every hostel is personally inspected by our team. We check safety, facilities, and living conditions before listing.' },
              { icon: CreditCard, title: 'Secure Payments', desc: 'Pay only a small reservation fee to secure your room. Full payment is made directly to the hostel upon move-in.' },
              { icon: MessageCircle, title: 'Direct Communication', desc: 'Chat directly with hostel managers through our platform. Get answers to your questions before booking.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-amber-500/50 transition-colors">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Students Say</h2>
            <p className="text-gray-500">Real reviews from real students</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.slice(0, 3).map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">{review.userAvatar}</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{review.userName}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Hexagon className="w-12 h-12 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Find Your Home Away From Home?</h2>
          <p className="text-amber-100 mb-8 text-lg">Join thousands of students who have found their perfect hostel through UniHive.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-amber-600 px-8 py-3.5 rounded-xl font-bold hover:bg-amber-50 transition-colors shadow-lg">
              Create Free Account
            </Link>
            <Link to="/hostels" className="bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-amber-700 transition-colors border border-amber-400">
              Browse Hostels
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-amber-500 p-1.5 rounded-lg">
                  <Hexagon className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Uni<span className="text-amber-500">Hive</span></span>
              </div>
              <p className="text-sm leading-relaxed">The trusted platform for verified student hostel accommodation across Ghana.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/hostels" className="hover:text-amber-400 transition-colors">Browse Hostels</Link></li>
                <li><Link to="/register" className="hover:text-amber-400 transition-colors">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-amber-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Universities</h4>
              <ul className="space-y-2 text-sm">
                {universities.slice(0, 4).map(u => (
                  <li key={u.id}><span className="hover:text-amber-400 cursor-pointer transition-colors">{u.name.split(' ').slice(0, 3).join(' ')}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@unihive.com</li>
                <li>+233 20 000 0000</li>
                <li>Accra, Ghana</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2026 UniHive. All rights reserved. Built with ❤️ for students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
