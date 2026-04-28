import { useState } from 'react';
import { User, CheckCircle, XCircle, Calendar, CreditCard, Bell, Heart, Gift, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { verifyPayment } from '../api/api.js';

type Tab = 'overview' | 'bookings' | 'payments' | 'notifications' | 'saved' | 'referral';

export default function StudentDashboard() {
  // 1. ALL HOOKS AT THE TOP
  const { user, bookings, notifications, hostels, rooms, universities, savedHostels, markNotificationRead, refreshBookings } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState(false);

  // 2. CONDITIONAL REDIRECT
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  // 3. COMPONENT LOGIC
  const userBookings = bookings.filter(b => String(b.userId) === String(user.id));
  const userNotifications = notifications.filter(n => String(n.userId) === String(user.id));
  const uni = universities.find(u => u.id === user.universityId);
  const saved = hostels.filter(h => savedHostels.includes(h.id));

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved': case 'completed': case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': case 'refunded': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'completed': case 'paid': return 'bg-green-100 text-green-700';
      case 'rejected': case 'refunded': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'referral', label: 'Referral', icon: Gift },
  ];

  const copyReferral = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePayBooking = (booking: any, hostel: any) => {
    if (!(window as any).PaystackPop) {
      alert("Payment system initializing... Please refresh.");
      return;
    }
    const handler = (window as any).PaystackPop.setup({
      key: 'pk_live_f8ea7f2de573926d15775e4fae12d7cdc020b7ee',
      email: user.email,
      amount: booking.totalPrice * 100,
      currency: 'GHS',
      ...(hostel?.subaccountCode ? { subaccount: hostel.subaccountCode } : {}),
      reference: 'BK_' + Math.floor((Math.random() * 1000000000) + 1).toString(),
      callback: function (paystackResponse: any) {
        (async () => {
          const verification = await verifyPayment(paystackResponse.reference, booking.id);
          if (verification.status === 'success') {
            await refreshBookings();
            alert('Payment successful!');
          }
        })();
      },
      onClose: () => alert('Payment window closed.')
    });
    handler.openIframe();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl font-bold">{user.avatar}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-sm">{uni?.name} • Member since {user.joinDate}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'notifications' && userNotifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[18px] text-center">
                    {userNotifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Bookings', value: userBookings.length.toString(), icon: Calendar, color: 'bg-blue-500' },
                { label: 'Active Bookings', value: userBookings.filter(b => b.status === 'approved').length.toString(), icon: CheckCircle, color: 'bg-green-500' },
                { label: 'Saved Hostels', value: saved.length.toString(), icon: Heart, color: 'bg-red-500' },
                { label: 'Credit Balance', value: `GH₵${user.credits}`, icon: CreditCard, color: 'bg-amber-500' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                    <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {userBookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No bookings found.</p>
              </div>
            ) : (
              userBookings.map(booking => {
                const hostel = hostels.find(h => h.id === booking.hostelId);
                const room = rooms.find(r => r.id === booking.roomId);
                return (
                  <div key={booking.id} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col sm:flex-row sm:justify-between shadow-sm gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{hostel?.name || 'Unknown Hostel'}</h3>
                      <p className="text-sm text-gray-500">Booking ID: #{booking.id.slice(-6)}</p>
                      <p className="text-sm text-gray-500 mt-2">Room {room?.roomNumber || booking.roomNumber || 'N/A'} • {room?.type || booking.roomType || 'Standard'}</p>
                      {booking.authCode && (
                        <p className="text-sm text-amber-700 mt-2">Your check-in code: <span className="font-semibold">{booking.authCode}</span></p>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium mt-3 ${statusColor(booking.status)}`}>
                        {statusIcon(booking.status)} {booking.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 mb-2">GH₵{booking.totalPrice}</p>
                      {booking.paymentStatus === 'unpaid' && (
                        <button onClick={() => handlePayBooking(booking, hostel)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y">
            {userNotifications.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No new notifications.</div>
            ) : (
              userNotifications.map(notif => (
                <div key={notif.id} onClick={() => markNotificationRead(notif.id)} className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-amber-50/50' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notif.read ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* REFERRAL TAB */}
        {activeTab === 'referral' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg text-center">
              <Gift className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-3xl font-extrabold">Refer & Earn</h2>
              <p className="mt-2 text-amber-50">Share your unique code with friends and earn GH₵10 for every booking.</p>

              <div className="mt-8 flex bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl items-center gap-3 max-w-sm mx-auto">
                <span className="flex-1 font-mono font-bold text-xl tracking-widest">{user.referralCode}</span>
                <button onClick={copyReferral} className="bg-white text-amber-600 px-6 py-3 rounded-lg text-sm font-bold shadow-sm hover:bg-amber-50 transition-colors">
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-xl border p-6 flex justify-between items-center shadow-sm">
              <div>
                <p className="text-sm text-gray-500 font-medium">Your Earnings</p>
                <p className="text-3xl font-black text-amber-600">GH₵{user.credits || 0}</p>
              </div>
              <button className="text-amber-600 font-bold hover:underline">Withdraw Credits</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}