import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Calendar, CreditCard, Star, BarChart3, Plus, Trash2, CheckCircle, XCircle, Eye, GraduationCap, DoorOpen, TrendingUp, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { approveBooking, createHostel, createRoom, createUniversity, deleteHostel as deleteHostelApi, uploadImage, updateRoomStatus } from '../api/api.js';

type AdminTab = 'overview' | 'hostels' | 'rooms' | 'bookings' | 'users' | 'reviews' | 'universities';

export default function AdminDashboard() {
  const auth = useAuth();
  const { hostels, rooms, bookings, reviews, universities, refreshBookings, deleteHostel, addHostel, addRoom, addUniversity, updateRoom, updateBookingStatus } = useApp();
  const navigate = useNavigate();
  const isManager = auth.user?.role === 'manager';
  const managerHostels = isManager ? hostels.filter(h => String(h.managerId) === String(auth.user?.id)) : hostels;
  const managerHostelIds = managerHostels.map(h => String(h.id));
  const visibleHostels = isManager ? managerHostels : hostels;
  const visibleRooms = isManager ? rooms.filter(r => managerHostelIds.includes(String(r.hostelId))) : rooms;
  const visibleBookings = isManager ? bookings.filter(b => managerHostelIds.includes(String(b.hostelId))) : bookings;
  const visibleReviews = isManager ? reviews.filter(r => managerHostelIds.includes(String(r.hostelId))) : reviews;
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [showAddHostel, setShowAddHostel] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddUniversity, setShowAddUniversity] = useState(false);
  const [selectedHostelForRoom, setSelectedHostelForRoom] = useState('');
  const [newUniversity, setNewUniversity] = useState({ name: '', city: '', country: 'Ghana' });
  const [hostelImageFile, setHostelImageFile] = useState<File | null>(null);
  const [roomImageFile, setRoomImageFile] = useState<File | null>(null);
  const [hostelSearch, setHostelSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const filteredHostels = visibleHostels.filter(h => {
    const query = hostelSearch.trim().toLowerCase();
    if (!query) return true;
    const uniName = universities.find(u => u.id === h.universityId)?.name.toLowerCase() || '';
    return h.name.toLowerCase().includes(query) || h.address.toLowerCase().includes(query) || uniName.includes(query);
  });
  const filteredRooms = visibleRooms.filter(r => {
    const query = roomSearch.trim().toLowerCase();
    if (!query) return true;
    const hostel = hostels.find(h => h.id === r.hostelId);
    return r.roomNumber.toLowerCase().includes(query) || r.type.toLowerCase().includes(query) || hostel?.name.toLowerCase().includes(query);
  });

  if (!auth.user || (auth.user.role !== 'admin' && auth.user.role !== 'manager')) {
    navigate('/login');
    return null;
  }

  const [newHostel, setNewHostel] = useState({ name: '', universityId: 'u1', address: '', description: '', facilities: '' as string, distanceFromCampus: '', priceRange: '', bankCode: '', accountNumber: '', managerFullName: '', managerEmail: '', managerPhone: '', managerPassword: '', managerGender: 'male' });
  const [newRoom, setNewRoom] = useState<{ roomNumber: string; capacity: string; price: string; description: string; type: string; gender: 'male' | 'female' }>({ roomNumber: '', capacity: '1', price: '', description: '', type: '', gender: 'male' });

  const totalRevenue = visibleBookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.reservationFee, 0);
  const pendingBookings = visibleBookings.filter(b => b.status === 'pending').length;

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'completed': case 'paid': return 'bg-green-100 text-green-700';
      case 'rejected': case 'refunded': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const handleAddHostel = async () => {
    if (!newHostel.name || !newHostel.address) return;

    try {
      let imageUrl = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80';
      if (hostelImageFile) {
        const uploadRes = await uploadImage(hostelImageFile);
        if (uploadRes.status === 'success') {
          imageUrl = uploadRes.url;
        }
      }

      const response = await createHostel({
        name: newHostel.name,
        university_id: newHostel.universityId,
        address: newHostel.address,
        description: newHostel.description,
        distance_from_campus: newHostel.distanceFromCampus,
        price_range: newHostel.priceRange,
        main_image: imageUrl,
        bank_code: newHostel.bankCode,
        account_number: newHostel.accountNumber,
        manager_full_name: newHostel.managerFullName,
        manager_email: newHostel.managerEmail,
        manager_phone: newHostel.managerPhone,
        manager_password: newHostel.managerPassword,
        manager_gender: newHostel.managerGender
      });
      if (response.status === 'success') {
        addHostel({
          id: response.id,
          name: newHostel.name,
          universityId: newHostel.universityId,
          address: newHostel.address,
          description: newHostel.description || 'New verified hostel',
          facilities: newHostel.facilities.split(',').map(f => f.trim()).filter(Boolean),
          distanceFromCampus: newHostel.distanceFromCampus || '1.0 km',
          priceRange: newHostel.priceRange || 'GH₵1,000 – GH₵2,000',
          mainImage: imageUrl,
          gallery: [imageUrl],
          verified: true,
          managerId: response.manager_id || null,
          subaccountCode: response.subaccount_code || null,
          rating: 0.0,
          reviewCount: 0,
        });
        setNewHostel({ name: '', universityId: (universities[0]?.id || 'u1'), address: '', description: '', facilities: '', distanceFromCampus: '', priceRange: '', bankCode: '', accountNumber: '', managerFullName: '', managerEmail: '', managerPhone: '', managerPassword: '', managerGender: 'male' });
        setHostelImageFile(null);
        setShowAddHostel(false);
      } else {
        alert(response.message || 'Failed to create hostel');
      }
    } catch (error: any) {
      alert('Network error: ' + error.message);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber || !newRoom.price || !selectedHostelForRoom) return;

    try {
      let imageUrl = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80';
      if (roomImageFile) {
        const uploadRes = await uploadImage(roomImageFile);
        if (uploadRes.status === 'success') {
          imageUrl = uploadRes.url;
        }
      }

      const response = await createRoom({
        hostel_id: selectedHostelForRoom,
        room_number: newRoom.roomNumber,
        capacity: parseInt(newRoom.capacity),
        price: parseInt(newRoom.price),
        type: newRoom.type || 'Standard',
        gender: newRoom.gender,
        description: newRoom.description,
        image: imageUrl
      });
      if (response.status === 'success') {
        addRoom({
          id: response.id,
          hostelId: selectedHostelForRoom,
          roomNumber: newRoom.roomNumber,
          capacity: parseInt(newRoom.capacity),
          price: parseInt(newRoom.price),
          available: true,
          gender: newRoom.gender,
          description: newRoom.description || 'New room',
          image: imageUrl,
          type: newRoom.type || 'Standard',
        });
        setNewRoom({ roomNumber: '', capacity: '1', price: '', description: '', type: '', gender: 'male' });
        setRoomImageFile(null);
        setShowAddRoom(false);
      } else {
        alert(response.message || 'Failed to create room');
      }
    } catch (error: any) {
      alert('Network error: ' + error.message);
    }
  };

  const handleRoomAvailabilityToggle = async (roomId: string, available: boolean) => {
    try {
      const response = await updateRoomStatus(roomId, available);
      if (response.status === 'success') {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          updateRoom({ ...room, available });
        }
      } else {
        alert(response.message || 'Could not update room status');
      }
    } catch (error: any) {
      alert('Network error: ' + error.message);
    }
  };

  const handleAddUniversity = async () => {
    if (!newUniversity.name || !newUniversity.city) return;
    try {
      const response = await createUniversity(newUniversity);
      if (response.status === 'success') {
        addUniversity({
          id: response.id,
          name: newUniversity.name,
          city: newUniversity.city,
          country: newUniversity.country
        });
        setNewUniversity({ name: '', city: '', country: 'Ghana' });
        setShowAddUniversity(false);
      } else {
        alert(response.message || 'Failed to create university');
      }
    } catch (error: any) {
      alert('Network error: ' + error.message);
    }
  };

  const handleDeleteHostel = async (hostelId: string) => {
    if (!confirm('Delete this hostel permanently?')) return;

    try {
      const response = await deleteHostelApi(hostelId);
      if (response.status === 'success') {
        deleteHostel(hostelId);
      } else {
        alert(response.message || 'Failed to delete hostel');
      }
    } catch (error: any) {
      alert('Network error: ' + error.message);
    }
  };

  const tabs: { id: AdminTab; label: string; icon: typeof Users }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'hostels', label: 'Hostels', icon: Building2 },
    { id: 'rooms', label: 'Rooms', icon: DoorOpen },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'universities', label: 'Universities', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold">{isManager ? 'Manager Dashboard' : 'Admin Dashboard'}</h1>
          <p className="text-gray-400 text-sm">{isManager ? 'Manage your assigned hostel, rooms, and booking requests' : 'Manage hostels, bookings, and platform operations'}</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
                {tab.id === 'bookings' && pendingBookings > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[18px] text-center">{pendingBookings}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Hostels', value: visibleHostels.length.toString(), icon: Building2, color: 'bg-blue-500', trend: '+2 this month' },
                { label: 'Total Bookings', value: visibleBookings.length.toString(), icon: Calendar, color: 'bg-green-500', trend: `${pendingBookings} pending` },
                { label: 'Revenue (Fees)', value: `GH₵${totalRevenue}`, icon: CreditCard, color: 'bg-amber-500', trend: '+15% this month' },
                { label: 'Total Reviews', value: visibleReviews.length.toString(), icon: Star, color: 'bg-purple-500', trend: 'Avg 4.5 stars' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{stat.label}</span>
                    <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {stat.trend}</p>
                </div>
              ))}
            </div>

            {/* Analytics Charts - Simplified visual */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Bookings by University</h3>
                <div className="space-y-3">
                  {universities.map(uni => {
                    const uniBookings = bookings.filter(b => {
                      const hostel = hostels.find(h => h.id === b.hostelId);
                      return hostel?.universityId === uni.id;
                    }).length;
                    const maxBookings = Math.max(...universities.map(u => bookings.filter(b => { const h = hostels.find(h2 => h2.id === b.hostelId); return h?.universityId === u.id; }).length), 1);
                    const progressClass = uniBookings >= maxBookings ? 'w-full' : uniBookings / maxBookings >= 0.9 ? 'w-[90%]' : uniBookings / maxBookings >= 0.75 ? 'w-[75%]' : uniBookings / maxBookings >= 0.6 ? 'w-[60%]' : uniBookings / maxBookings >= 0.45 ? 'w-[45%]' : uniBookings / maxBookings >= 0.3 ? 'w-[30%]' : uniBookings / maxBookings >= 0.15 ? 'w-[15%]' : 'w-[8%]';
                    return (
                      <div key={uni.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 truncate mr-2">{uni.name.split(' ').slice(0, 3).join(' ')}</span>
                          <span className="font-semibold text-gray-800">{uniBookings}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-amber-500 rounded-full transition-all ${progressClass}`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Popular Hostels</h3>
                <div className="space-y-3">
                  {hostels.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5).map((hostel, i) => (
                    <div key={hostel.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <img src={hostel.mainImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{hostel.name}</p>
                        <p className="text-xs text-gray-400">{hostel.reviewCount} reviews</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-gray-800">{hostel.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Actions */}
            {pendingBookings > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">You have {pendingBookings} pending booking(s)</p>
                  <p className="text-sm text-gray-500">Review and approve or reject pending bookings</p>
                </div>
                <button onClick={() => setActiveTab('bookings')} className="ml-auto bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 flex-shrink-0">Review</button>
              </div>
            )}
          </div>
        )}

        {/* Hostels Management */}
        {activeTab === 'hostels' && (
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Manage Hostels ({filteredHostels.length})</h2>
                <p className="text-sm text-gray-500">Search, review and manage your property listings with confidence.</p>
              </div>
              {!isManager && (
                <button onClick={() => setShowAddHostel(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" /> Add Hostel
                </button>
              )}
            </div>
            <div className="mb-6 max-w-md">
              <label htmlFor="hostelSearch" className="sr-only">Search hostels</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id="hostelSearch" type="text" value={hostelSearch} onChange={e => setHostelSearch(e.target.value)} placeholder="Search hostels, addresses or universities..." className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
              </div>
            </div>

            {isManager && managerHostels.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-700 text-sm">You currently do not have an assigned hostel. Please contact an admin to assign a hostel to your manager account.</p>
              </div>
            ) : filteredHostels.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
                No hostels match your search. Try a different name, address, or university.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hostel</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">University</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rooms</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredHostels.map(hostel => {
                        const uni = universities.find(u => u.id === hostel.universityId);
                        const hostelRooms = rooms.filter(r => r.hostelId === hostel.id);
                        return (
                          <tr key={hostel.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={hostel.mainImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm">{hostel.name}</p>
                                  <p className="text-xs text-gray-500">{hostel.address}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{uni?.name.split(' ').slice(0, 3).join(' ')}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{hostelRooms.length} ({hostelRooms.filter(r => r.available).length} avail)</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /><span className="text-sm font-medium">{hostel.rating}</span></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button aria-label="View hostel" onClick={() => navigate(`/hostels/${hostel.id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                                {!isManager && (
                                  <button aria-label="Delete hostel" onClick={() => handleDeleteHostel(hostel.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add Hostel Modal */}
            {showAddHostel && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-5">Add New Hostel</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Hostel Name *</label>
                      <input value={newHostel.name} onChange={e => setNewHostel({ ...newHostel, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="e.g., Sunrise Hall" />
                    </div>
                    <div>
                      <label htmlFor="newHostelUniversity" className="text-sm font-medium text-gray-700 mb-1 block">University *</label>
                      <select id="newHostelUniversity" aria-label="Select university" value={newHostel.universityId} onChange={e => setNewHostel({ ...newHostel, universityId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none">
                        {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Address *</label>
                      <input value={newHostel.address} onChange={e => setNewHostel({ ...newHostel, address: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="e.g., 25 Main Road, Accra" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                      <textarea value={newHostel.description} onChange={e => setNewHostel({ ...newHostel, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none" placeholder="Describe the hostel..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Facilities (comma-separated)</label>
                      <input value={newHostel.facilities} onChange={e => setNewHostel({ ...newHostel, facilities: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="WiFi, Security, Generator" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Distance</label>
                        <input value={newHostel.distanceFromCampus} onChange={e => setNewHostel({ ...newHostel, distanceFromCampus: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="0.5 km" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Price Range</label>
                        <input value={newHostel.priceRange} onChange={e => setNewHostel({ ...newHostel, priceRange: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="GH₵800 – GH₵1,500" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="hostelImageFile" className="text-sm font-medium text-gray-700 mb-1 block">Hostel Image</label>
                      <input id="hostelImageFile" type="file" accept="image/*" aria-label="Upload hostel image" title="Upload hostel image" onChange={e => setHostelImageFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                    </div>

                    <div className="border-t border-gray-200 mt-4 pt-4 pb-2">
                      <h4 className="text-sm font-bold text-gray-800 mb-3">Hostel Manager Credentials</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                          <input type="text" value={newHostel.managerFullName} onChange={e => setNewHostel({ ...newHostel, managerFullName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" placeholder="Hostel Manager Full Name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Email</label>
                            <input type="email" value={newHostel.managerEmail} onChange={e => setNewHostel({ ...newHostel, managerEmail: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" placeholder="manager@example.com" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Phone</label>
                            <input type="tel" value={newHostel.managerPhone} onChange={e => setNewHostel({ ...newHostel, managerPhone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" placeholder="+233 24 123 4567" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Password</label>
                            <input type="password" value={newHostel.managerPassword} onChange={e => setNewHostel({ ...newHostel, managerPassword: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" placeholder="Create a password" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Gender</label>
                          <select id="managerGender" aria-label="Select manager gender" value={newHostel.managerGender} onChange={e => setNewHostel({ ...newHostel, managerGender: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500">
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-4 pb-2">
                      <h4 className="text-sm font-bold text-gray-800 mb-3">Hostel Payout Details & Paystack Subaccount</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name / MoMo</label>
                          <select id="bankCode" aria-label="Select bank or mobile money" value={newHostel.bankCode} onChange={e => setNewHostel({ ...newHostel, bankCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500">
                            <option value="">Select Option</option>
                            <option value="MTN">MTN Mobile Money</option>
                            <option value="VOD">Vodafone Cash</option>
                            <option value="TGO">AirtelTigo</option>
                            <option value="044">Access Bank</option>
                            <option value="014">Ecobank Ghana</option>
                            <option value="053">Zenith Bank</option>
                            <option value="090115">Fidelity Bank</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                          <input type="text" value={newHostel.accountNumber} onChange={e => setNewHostel({ ...newHostel, accountNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" placeholder="0540000000" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowAddHostel(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleAddHostel} className="flex-1 py-3 bg-amber-500 rounded-xl text-sm font-bold text-white hover:bg-amber-600">Add Hostel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rooms Management */}
        {activeTab === 'rooms' && (
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Manage Rooms ({filteredRooms.length})</h2>
                <p className="text-sm text-gray-500">Quickly find rooms by number, type, or hostel name.</p>
              </div>
              <button onClick={() => setShowAddRoom(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Room
              </button>
            </div>
            <div className="mb-6 max-w-md">
              <label htmlFor="roomSearch" className="sr-only">Search rooms</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id="roomSearch" type="text" value={roomSearch} onChange={e => setRoomSearch(e.target.value)} placeholder="Search rooms by number, type, or hostel..." className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
              </div>
            </div>

            {filteredRooms.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
                No rooms match your search. Try another room number or type.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Room</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hostel</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Gender</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Capacity</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRooms.map(room => {
                      const hostel = hostels.find(h => h.id === room.hostelId);
                      return (
                        <tr key={room.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">Room {room.roomNumber}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{hostel?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 capitalize">{room.gender ?? 'Not set'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{room.type}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{room.capacity}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-amber-600">GH₵{room.price.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${room.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {room.available ? 'Available' : 'Occupied'}
                              {(() => {
                                const occupancy = visibleBookings.filter(b => b.roomId === room.id && b.status === 'approved').length;
                                return room.capacity > 1 ? ` • ${occupancy}/${room.capacity}` : '';
                              })()}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex gap-2">
                            <button aria-label={room.available ? 'Mark as occupied' : 'Mark as available'} onClick={() => handleRoomAvailabilityToggle(room.id, !room.available)} className={`px-3 py-2 rounded-lg text-xs font-semibold ${room.available ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                              {room.available ? 'Mark Occupied' : 'Make Available'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

            {showAddRoom && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-5">Add New Room</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Hostel *</label>
                        <select id="selectedHostelForRoom" aria-label="Select hostel for new room" value={selectedHostelForRoom} onChange={e => setSelectedHostelForRoom(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none">
                        <option value="">Select hostel</option>
                        {visibleHostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Room Number *</label>
                        <input value={newRoom.roomNumber} onChange={e => setNewRoom({ ...newRoom, roomNumber: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="101" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Room Type</label>
                        <input value={newRoom.type} onChange={e => setNewRoom({ ...newRoom, type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="Single" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Capacity</label>
                        <input id="newRoomCapacity" type="number" aria-label="Room capacity" value={newRoom.capacity} onChange={e => setNewRoom({ ...newRoom, capacity: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Price (GH₵) *</label>
                        <input id="newRoomPrice" type="number" aria-label="Room price" value={newRoom.price} onChange={e => setNewRoom({ ...newRoom, price: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="1500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Gender *</label>
                      <select id="newRoomGender" aria-label="Select room gender" value={newRoom.gender} onChange={e => setNewRoom({ ...newRoom, gender: e.target.value as 'male' | 'female' })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                      <textarea value={newRoom.description} onChange={e => setNewRoom({ ...newRoom, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none" placeholder="Describe the room..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Room Image</label>
                        <input id="newRoomImageFile" type="file" accept="image/*" aria-label="Upload room image" title="Upload room image" onChange={e => setRoomImageFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowAddRoom(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleAddRoom} className="flex-1 py-3 bg-amber-500 rounded-xl text-sm font-bold text-white hover:bg-amber-600">Add Room</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookings Management */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Bookings ({visibleBookings.length})</h2>
            <div className="space-y-4">
              {visibleBookings.map(booking => {
                const hostel = hostels.find(h => h.id === booking.hostelId);
                const room = rooms.find(r => r.id === booking.roomId);
                return (
                  <div key={booking.id} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-800">Booking #{booking.id}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(booking.status)}`}>{booking.status}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(booking.paymentStatus)}`}>{booking.paymentStatus}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                          <div><span className="text-gray-400 text-xs">Hostel</span><p className="font-medium">{hostel?.name}</p></div>
                          <div><span className="text-gray-400 text-xs">Room</span><p className="font-medium">{room?.type} ({room?.roomNumber})</p></div>
                          <div><span className="text-gray-400 text-xs">Fee</span><p className="font-medium text-amber-600">GH₵{booking.reservationFee}</p></div>
                          <div><span className="text-gray-400 text-xs">Date</span><p className="font-medium">{booking.bookingDate}</p></div>
                        </div>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button type="button" onClick={async () => {
                            try {
                              await approveBooking(booking.id, 'approved');
                              updateBookingStatus(booking.id, 'approved');
                              await refreshBookings();
                            } catch (error) {
                              const err = error instanceof Error ? error : new Error(String(error));
                              alert('Failed to approve booking: ' + err.message);
                            }
                          }} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button type="button" onClick={async () => {
                            try {
                              await approveBooking(booking.id, 'rejected');
                              updateBookingStatus(booking.id, 'rejected');
                              await refreshBookings();
                            } catch (error) {
                              const err = error instanceof Error ? error : new Error(String(error));
                              alert('Failed to reject booking: ' + err.message);
                            }
                          }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Reviews ({visibleReviews.length})</h2>
            <div className="space-y-4">
              {visibleReviews.map(review => {
                const hostel = hostels.find(h => h.id === review.hostelId);
                return (
                  <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm flex-shrink-0">{review.userAvatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm">{review.userName}</span>
                            <span className="text-xs text-gray-400">on {hostel?.name}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                        <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Universities */}
        {activeTab === 'universities' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Universities ({universities.length})</h2>
              {!isManager && (
                <button onClick={() => setShowAddUniversity(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" /> Add University
                </button>
              )}
            </div>

            {isManager && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Managers cannot add or edit universities from this dashboard. Contact an admin for university setup.
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {universities.map(uni => {
                const uniHostels = hostels.filter(h => String(h.universityId) === String(uni.id));
                return (
                  <div key={uni.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                      <GraduationCap className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{uni.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{uni.city || 'No City'}, {uni.country || 'No Country'}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-amber-600 font-semibold">{uniHostels.length} hostels</span>
                      <span className="text-gray-400">{rooms.filter(r => uniHostels.some(h => h.id === r.hostelId)).length} rooms</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add University Modal */}
            {showAddUniversity && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-5">Add New University</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">University Name *</label>
                      <input value={newUniversity.name} onChange={e => setNewUniversity({ ...newUniversity, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="e.g., University of Ghana" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">City *</label>
                        <input value={newUniversity.city} onChange={e => setNewUniversity({ ...newUniversity, city: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="e.g., Accra" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
                        <input value={newUniversity.country} onChange={e => setNewUniversity({ ...newUniversity, country: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="e.g., Ghana" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowAddUniversity(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleAddUniversity} className="flex-1 py-3 bg-amber-500 rounded-xl text-sm font-bold text-white hover:bg-amber-600">Add University</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
