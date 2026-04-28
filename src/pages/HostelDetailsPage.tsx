import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, CheckCircle, Heart, ChevronLeft, ChevronRight, Wifi, Shield, Zap, Droplets, BookOpen, X, Users, DoorOpen, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createBooking, verifyPayment, submitReview } from '../api/api.js';

export default function HostelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { filteredHostels, filteredRooms, reviews, universities, isAuthenticated, savedHostels, toggleSaveHostel, addBooking, user, addReview } = useApp();

  const hostel = filteredHostels.find(h => h.id === id);
  const hostelRooms = filteredRooms.filter(r => r.hostelId === id);
  const hostelReviews = reviews.filter(r => r.hostelId === id);
  const uni = universities.find(u => u.id === hostel?.universityId);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [roomGenderFilter, setRoomGenderFilter] = useState<'all' | 'male' | 'female'>(user?.gender || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [reviewComment, setReviewComment] = useState('');
  const [showGallery, setShowGallery] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);

  const selectedRoomData = selectedRoom ? filteredRooms.find(r => r.id === selectedRoom) : undefined;

  const filteredHostelRooms = hostelRooms.filter(room => {
    if (roomGenderFilter === 'all') return true;
    return room.gender === roomGenderFilter;
  });
  const hiddenRoomCount = hostelRooms.length - filteredHostelRooms.length;

  useEffect(() => {
    if (selectedRoom && !filteredHostelRooms.some(room => room.id === selectedRoom)) {
      setSelectedRoom(null);
    }
  }, [filteredHostelRooms, selectedRoom]);

  if (!hostel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hostel not found</h2>
          <button onClick={() => navigate('/hostels')} className="text-amber-600 font-medium">Back to hostels</button>
        </div>
      </div>
    );
  }

  const facilityIcons: Record<string, typeof Wifi> = { WiFi: Wifi, Security: Shield, Generator: Zap, 'Water Tank': Droplets, 'Study Room': BookOpen };
  const isSaved = savedHostels.includes(hostel.id);

  const handleBookRoom = async () => {
    if (!isAuthenticated) { 
      navigate('/login'); 
      return; 
    }
    if (!selectedRoom) return;
    const room = selectedRoomData;
    if (!room) return;

    const bookingDate = new Date().toISOString().split('T')[0];
    
    try {
      const response = await createBooking(user!.id, selectedRoom, hostel.id, bookingDate);
      
      if (response.status === 'success') {
        const bookingId = response.booking_id;

        // Ensure Paystack SDK is securely loaded before calling it
        if (!(window as any).PaystackPop) {
           alert("Payment system initializing... Please fully refresh your page once and try again to load the Paystack security scripts.");
           return;
        }

        const handler = (window as any).PaystackPop.setup({
          key: 'pk_live_f8ea7f2de573926d15775e4fae12d7cdc020b7ee',
          email: user?.email,
          amount: room.price * 100, // Full rent in pesewas
          currency: 'GHS',
          ...(hostel.subaccountCode ? { subaccount: hostel.subaccountCode } : {}),
          reference: 'BK_' + Math.floor((Math.random() * 1000000000) + 1).toString(), // Generate a random reference
          callback: function(paystackResponse: any) {
            (async () => {
              const verification = await verifyPayment(paystackResponse.reference, bookingId);
              if (verification.status === 'success') {
                // Add booking to local state with 'paid' status (it was just created in DB)
                addBooking({
                  id: bookingId,
                  userId: user!.id,
                  roomId: selectedRoom,
                  hostelId: hostel.id,
                  bookingDate,
                  status: 'pending',
                  paymentStatus: 'paid',
                  reservationFee: room.price,
                  totalPrice: room.price,
                });
                setBookingSuccess(true);
              } else {
                // Booking already exists in DB as 'unpaid'.
                // Add it to local state so user can retry from the dashboard.
                addBooking({
                  id: bookingId,
                  userId: user!.id,
                  roomId: selectedRoom,
                  hostelId: hostel.id,
                  bookingDate,
                  status: 'pending',
                  paymentStatus: 'unpaid',
                  reservationFee: room.price,
                  totalPrice: room.price,
                });
                alert('Payment could not be confirmed: ' + verification.message + '\nYou can retry payment from your dashboard.');
                setBookingSuccess(true);
              }
            })();
          },
          onClose: function() {
            alert('Payment window closed. You can pay your rent later from your dashboard.');
            addBooking({
              id: bookingId,
              userId: user!.id,
              roomId: selectedRoom,
              hostelId: hostel.id,
              bookingDate,
              status: 'pending',
              paymentStatus: 'unpaid',
              reservationFee: room.price,
              totalPrice: room.price,
            });
            setBookingSuccess(true);
          }
        });
        handler.openIframe();
      } else {
        alert(response.message || 'Booking failed');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      alert('System Error: ' + (error.message || 'Unknown crash') + '. Please try refreshing the page.');
    }
  };

  const handleSubmitReview = async () => {
    if (!user) return;
    setLoadingReview(true);
    try {
      const response = await submitReview({
        user_id: user.id,
        hostel_id: hostel.id,
        rating: reviewRating,
        comment: reviewComment
      });
      if (response.status === 'success') {
        // Add to local state
        addReview({
          id: response.review_id.toString(),
          userId: user.id,
          hostelId: hostel.id,
          rating: reviewRating,
          comment: reviewComment,
          date: new Date().toISOString().split('T')[0],
          userName: user.name,
          userAvatar: user.avatar,
        });
        setShowReviewModal(false);
        setReviewComment('');
        setReviewRating(5);
      } else {
        alert(response.message || 'Failed to submit review');
      }
    } catch (error: any) {
      alert('Network error: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative bg-black">
        <button aria-label="Go back" onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[300px] md:h-[450px] overflow-hidden cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={hostel.gallery[activeImage]} alt={hostel.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button aria-label="Previous image" onClick={e => { e.stopPropagation(); setActiveImage(prev => (prev - 1 + hostel.gallery.length) % hostel.gallery.length); }} className="bg-white/90 p-2 rounded-full shadow hover:bg-white"><ChevronLeft className="w-5 h-5" /></button>
              <button aria-label="Next image" onClick={e => { e.stopPropagation(); setActiveImage(prev => (prev + 1) % hostel.gallery.length); }} className="bg-white/90 p-2 rounded-full shadow hover:bg-white"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <span className="text-sm bg-black/50 rounded-full px-3 py-1">{activeImage + 1} / {hostel.gallery.length}</span>
            </div>
          </div>
          <div className="flex gap-2 p-2 bg-gray-900 overflow-x-auto">
            {hostel.gallery.map((img, i) => (
              <button key={i} aria-label={`View image ${i + 1}`} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-amber-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={img} alt={`Gallery image ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{hostel.name}</h1>
                    {hostel.verified && (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> {hostel.address} • {hostel.distanceFromCampus} from {uni?.name}</p>
                </div>
                {isAuthenticated && (
                    <button aria-label={isSaved ? 'Remove saved hostel' : 'Save hostel'} onClick={() => toggleSaveHostel(hostel.id)} className={`p-3 rounded-full border transition-colors ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-white'}`}>
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500' : ''}`} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(hostel.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-1 font-bold text-gray-800">{hostel.rating}</span>
                  <span className="text-gray-500 text-sm">({hostel.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About this hostel</h2>
              <p className="text-gray-600 leading-relaxed">{hostel.description}</p>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hostel.facilities.map(f => {
                  const Icon = facilityIcons[f] || CheckCircle;
                  return (
                    <div key={f} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <Icon className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium text-gray-700">{f}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rooms */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Available Rooms</h2>
                  {hiddenRoomCount > 0 && (
                    <p className="text-sm text-gray-500 mt-1">{hiddenRoomCount} room{hiddenRoomCount > 1 ? 's' : ''} hidden by the current gender filter.</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <select aria-label="Filter hostel rooms by gender" value={roomGenderFilter} onChange={e => setRoomGenderFilter(e.target.value as 'all' | 'male' | 'female')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none">
                    <option value="all">All rooms</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1">
                    <button type="button" onClick={() => setViewMode('grid')} className={`px-3 py-2 rounded-lg text-sm font-semibold ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Grid</button>
                    <button type="button" onClick={() => setViewMode('list')} className={`px-3 py-2 rounded-lg text-sm font-semibold ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>List</button>
                  </div>
                </div>
              </div>
              <div className={`${viewMode === 'grid' ? 'grid md:grid-cols-2 gap-5' : 'space-y-4'}`}>
                {filteredHostelRooms.length === 0 && (
                  <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500">
                    No rooms match the selected gender filter. Change the filter to see more rooms.
                  </div>
                )}
                {filteredHostelRooms.length > 0 ? filteredHostelRooms.map(room => (
                  <div key={room.id} className={`border rounded-xl p-4 transition-all ${selectedRoom === room.id ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-300'} ${!room.available ? 'opacity-50' : 'cursor-pointer'}`}
                    onClick={() => { if (room.available) setSelectedRoom(room.id); }}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <img src={room.image} alt={room.type} className="w-full sm:w-32 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">{room.type}</h3>
                            <p className="text-sm text-gray-500">Room {room.roomNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-amber-600">GH₵{room.price.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">per semester</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Users className="w-3.5 h-3.5" /> {room.capacity} {room.capacity === 1 ? 'person' : 'people'}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500"><DoorOpen className="w-3.5 h-3.5" /> Room {room.roomNumber}</span>
                          <span className={`text-xs font-semibold ${room.available ? 'text-green-600' : 'text-red-500'}`}>
                            {room.available ? 'Available' : 'Occupied'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : null}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reviews ({hostelReviews.length})</h2>
                {isAuthenticated && (
            <button onClick={() => setShowReviewModal(true)} className="text-amber-600 hover:text-amber-700 text-sm font-semibold" disabled={!isAuthenticated}>Write a Review</button>
          )}
        </div>
              {hostelReviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-5">
                  {hostelReviews.map(review => (
                    <div key={review.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">{review.userAvatar}</div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{review.userName}</p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500 mb-1">Price range</p>
                  <p className="text-2xl font-bold text-amber-600">{hostel.priceRange}</p>
                  <p className="text-xs text-gray-400">per semester</p>
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Distance</span>
                    <span className="font-medium text-gray-800">{hostel.distanceFromCampus}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Available rooms</span>
                    <span className="font-medium text-green-600">{hostelRooms.filter(r => r.available).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Booking model</span>
                    <span className="font-medium text-gray-800">No hidden fees</span>
                  </div>
                </div>
                {selectedRoom ? (
                  <div className="bg-amber-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-amber-600 font-medium mb-1">Selected Room</p>
                    <p className="font-bold text-gray-800">{selectedRoomData?.type} - Room {selectedRoomData?.roomNumber}</p>
                    <p className="text-amber-600 font-bold">GH₵{selectedRoomData?.price.toLocaleString()}/semester</p>
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-400 mb-4">Select a room above to book</p>
                )}
                <p className="text-xs text-gray-500 mb-3">By booking, you agree to UniHive terms and conditions. Cancellations or misuse may result in penalties.</p>
                <button
                  onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } if (selectedRoom) setShowBookingModal(true); }}
                  disabled={!selectedRoom}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors ${selectedRoom ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {isAuthenticated ? 'Book This Room' : 'Sign In to Book'}
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Quick Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500" /> Physically verified by UniHive</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500" /> Secure reservation system</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500" /> Direct messaging available</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500" /> Student-verified reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {!bookingSuccess ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">Confirm Booking</h3>
                  <button aria-label="Close booking modal" onClick={() => setShowBookingModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Hostel</span><span className="font-medium">{hostel.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Room</span><span className="font-medium">{selectedRoomData?.type} ({selectedRoomData?.roomNumber})</span></div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between text-sm"><span className="text-gray-500">Total Rent</span><span className="font-bold text-amber-600">GH₵{selectedRoomData?.price.toLocaleString()}</span></div>
                </div>
                <p className="text-xs text-gray-500 mb-5">By confirming, you will be prompted to securely pay your full rent via Paystack. Funds are safely held.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowBookingModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleBookRoom} className="flex-1 py-3 bg-amber-500 rounded-xl text-sm font-bold text-white hover:bg-amber-600 shadow-lg">Confirm Booking</button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Submitted!</h3>
                <p className="text-gray-500 text-sm mb-6">Your booking request has been submitted. If you closed the payment window, please pay the rent from your dashboard to secure your room.</p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowBookingModal(false); setBookingSuccess(false); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Close</button>
                  <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 bg-amber-500 rounded-xl text-sm font-bold text-white hover:bg-amber-600">Go to Dashboard</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
              <button aria-label="Close review modal" onClick={() => setShowReviewModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="mb-5">
              <p className="text-sm text-gray-500 mb-2">Your Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} aria-label={`Select ${s} star rating`} onClick={() => setReviewRating(s)}>
                    <Star className={`w-8 h-8 transition-colors ${s <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 hover:text-amber-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-sm text-gray-500 mb-2">Your Review</p>
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} placeholder="Share your experience..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <button onClick={handleSubmitReview} disabled={!reviewComment.trim() || loadingReview} className="w-full py-3 bg-amber-500 rounded-xl text-sm font-bold text-white hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400">
              {loadingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* Full Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button aria-label="Close gallery" onClick={() => setShowGallery(false)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 z-10"><X className="w-6 h-6 text-white" /></button>
          <button aria-label="Previous gallery image" onClick={() => setActiveImage(prev => (prev - 1 + hostel.gallery.length) % hostel.gallery.length)} className="absolute left-4 bg-white/20 p-3 rounded-full hover:bg-white/30"><ChevronLeft className="w-6 h-6 text-white" /></button>
          <img src={hostel.gallery[activeImage]} alt="Hostel gallery" className="max-w-full max-h-full object-contain" />
          <button aria-label="Next gallery image" onClick={() => setActiveImage(prev => (prev + 1) % hostel.gallery.length)} className="absolute right-4 bg-white/20 p-3 rounded-full hover:bg-white/30"><ChevronRight className="w-6 h-6 text-white" /></button>
          <div className="absolute bottom-4 text-white text-sm">{activeImage + 1} / {hostel.gallery.length}</div>
        </div>
      )}
    </div>
  );
}
