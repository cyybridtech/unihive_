import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUserBookings, getNotifications, getAllBookings, getUniversities, getHostels, getRooms, submitReview } from '../api/api.js';
import {
  User, Booking, Notification, Message, Hostel, Room, Review, University,
  sampleBookings, sampleNotifications, sampleMessages, reviews as initialReviews,
} from '../data/mockData';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  selectedUniversity: string;
  bookings: Booking[];
  notifications: Notification[];
  messages: Message[];
  hostels: Hostel[];
  rooms: Room[];
  filteredHostels: Hostel[];
  filteredRooms: Room[];
  reviews: Review[];
  universities: University[];
  savedHostels: string[];
  logout: () => void;
  setSelectedUniversity: (id: string) => void;
  addUniversity: (uni: University) => void;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  updatePaymentStatus: (id: string, status: Booking['paymentStatus']) => void;
  refreshBookings: () => Promise<void>;
  refreshData: () => Promise<void>;
  addReview: (review: Review) => void;
  sendMessage: (msg: Message) => void;
  markNotificationRead: (id: string) => void;
  toggleSaveHostel: (id: string) => void;
  addHostel: (hostel: Hostel) => void;
  addRoom: (room: Room) => void;
  deleteHostel: (id: string) => void;
  updateRoom: (room: Room) => void;
}

const AppContext = createContext<AppState>({} as AppState);

export const useApp = () => useContext(AppContext);

// Helper: map raw DB booking row → typed Booking
function mapBooking(b: any): Booking {
  return {
    id: String(b.id),
    userId: String(b.user_id),
    roomId: b.room_id,
    hostelId: b.hostel_id,
    bookingDate: b.booking_date,
    status: b.status ?? 'pending',
    paymentStatus: b.payment_status ?? 'unpaid',
    reservationFee: parseFloat(b.reservation_fee || 0),
    totalPrice: parseFloat(b.total_price || 0),
    authCode: b.auth_code || b.authCode || undefined,
    userName: b.user_name || b.userName || undefined,
    userGender: b.user_gender || b.userGender || undefined,
    roomNumber: b.roomNumber || b.room_number || undefined,
    roomType: b.room_type || b.roomType || undefined,
    hostelName: b.hostel_name || b.hostelName || undefined,
  };
}

// Helper: map raw Auth user → typed mockData User
function mapAuthUser(authUser: any): User {
  return {
    id: String(authUser.id),
    name: authUser.full_name || authUser.name || '',
    email: authUser.email || '',
    phone: authUser.phone || '',
    universityId: authUser.university_id || authUser.universityId || 'u1',
    role: authUser.role === 'admin' ? 'admin' : authUser.role === 'manager' ? 'manager' : 'student',
    gender: authUser.gender || authUser.user_gender || undefined,
    avatar: authUser.avatar || (authUser.email?.[0]?.toUpperCase() ?? '?'),
    referralCode: authUser.referral_code || authUser.referralCode || '',
    credits: Number(authUser.credits) || 0,
    joinDate: (authUser.created_at ?? authUser.joinDate ?? new Date().toISOString()).split('T')[0],
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('selectedUniversity') || 'u1' : 'u1';
  });
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [universities, setUniversities] = useState<University[]>([]);
  const [savedHostels, setSavedHostels] = useState<string[]>([]);

  const loadUniversities = async () => {
    try {
      const res: any = await getUniversities();
      if (res.status === 'success' && res.universities) setUniversities(res.universities);
    } catch (e: any) {
      console.error('Failed to load universities', e);
    }
  };

  const loadHostels = async () => {
    try {
      const res: any = await getHostels();
      if (res.status === 'success' && res.hostels) setHostels(res.hostels);
    } catch (e: any) {
      console.error('Failed to load hostels', e);
    }
  };

  const loadRooms = async () => {
    try {
      const res: any = await getRooms();
      if (res.status === 'success' && res.rooms) setRooms(res.rooms);
    } catch (e: any) {
      console.error('Failed to load rooms', e);
    }
  };

  const refreshData = async (): Promise<void> => {
    await Promise.all([loadHostels(), loadRooms()]);
  };

  // Load static data (universities, hostels, rooms)
  useEffect(() => {
    loadUniversities();
    loadHostels();
    loadRooms();
  }, []);

  useEffect(() => {
    if (auth.user?.role === 'manager') {
      const interval = window.setInterval(() => {
        loadHostels();
        loadRooms();
      }, 20000);
      return () => window.clearInterval(interval);
    }
    return undefined;
  }, [auth.user?.role]);

  // Sync user + bookings + notifications whenever auth.user changes
  useEffect(() => {
    if (auth.user) {
      setUser(mapAuthUser(auth.user));

      getUserBookings()
        .then((response: any) => {
          console.log('getUserBookings response:', response);
          if (response.status === 'success' && response.bookings) {
            setBookings(response.bookings.map(mapBooking));
          } else {
            console.error('Bookings API error:', response);
            setBookings(sampleBookings);
          }
        })
        .catch((error: any) => {
          console.error('Bookings fetch error:', error);
          setBookings(sampleBookings);
        });

      if (auth.user && (auth.user.role === 'admin' || auth.user.role === 'manager')) {
        getAllBookings()
          .then((response: any) => {
            if (response.status === 'success' && response.bookings) {
              setBookings(response.bookings.map(mapBooking));
            }
          })
          .catch((error: any) => {
            console.error('Failed to load all bookings for admin/manager', error);
          });
      }

      getNotifications()
        .then((response: any) => {
          console.log('getNotifications response:', response);
          if (response.status === 'success' && response.notifications) {
            setNotifications(response.notifications);
          } else {
            console.error('Notifications API error:', response);
            setNotifications(sampleNotifications);
          }
        })
        .catch((error: any) => {
          console.error('Notifications fetch error:', error);
          setNotifications(sampleNotifications);
        });
    } else {
      setUser(null);
      setBookings([]);
      setNotifications([]);
    }
  }, [auth.user]);

  const logout = () => {
    auth.logout();
  };

  const addBooking = (booking: Booking) => {
    // Prevent duplicate: if already in state (e.g. from DB load), just update
    setBookings(prev => {
      const exists = prev.some(b => b.id === booking.id);
      if (exists) {
        return prev.map(b => b.id === booking.id ? { ...b, ...booking } : b);
      }
      return [...prev, booking];
    });

    setNotifications(prev => [...prev, {
      id: 'n_' + Date.now(),
      userId: booking.userId,
      title: booking.paymentStatus === 'paid' ? 'Payment Successful' : 'Booking Submitted',
      message: booking.paymentStatus === 'paid'
        ? `Your payment of GH₵${booking.totalPrice} has been confirmed.`
        : `Your booking was submitted. Pay from your dashboard to secure your room.`,
      type: 'booking' as const,
      read: false,
      date: new Date().toISOString().split('T')[0],
    }]);
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const updatePaymentStatus = (id: string, status: Booking['paymentStatus']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: status } : b));
  };

  const refreshBookings = async (): Promise<void> => {
    try {
      const response: any = (user && (user.role === 'admin' || user.role === 'manager')) ? await getAllBookings() : await getUserBookings();
      if (response.status === 'success' && response.bookings) {
        setBookings(response.bookings.map(mapBooking));
      }
    } catch (e: any) {
      console.error('refreshBookings failed', e);
    }
  };

  const filteredHostels = useMemo(() => {
    if (!user || user.role !== 'manager') {
      return hostels;
    }
    return hostels.filter(h => String(h.managerId) === String(user.id));
  }, [hostels, user]);

  const filteredRooms = useMemo(() => {
    if (!user || user.role !== 'manager') {
      return rooms;
    }
    const managerHostelIds = new Set(filteredHostels.map(h => h.id));
    return rooms.filter(r => managerHostelIds.has(r.hostelId));
  }, [rooms, filteredHostels, user]);

  const addReview = async (review: Review) => {
    // Optimistic update
    setReviews(prev => [...prev, review]);
    
    if (user) {
      try {
        await submitReview({
          user_id: Number(user.id),
          hostel_id: review.hostelId,
          rating: review.rating,
          comment: review.comment || ''
        });
        // Success - ratings will refresh via getHostels
      } catch (error) {
        // Rollback on failure
        setReviews(prev => prev.filter(r => r.id !== review.id));
        console.error('Review submit failed:', error);
      }
    }
  };

  const sendMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const toggleSaveHostel = (id: string) => {
    setSavedHostels(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  const addUniversity = (uni: University) => {
    setUniversities(prev => [...prev, uni]);
  };

  const addHostel = (hostel: Hostel) => {
    setHostels(prev => [...prev, hostel]);
  };

  const addRoom = (room: Room) => {
    setRooms(prev => [...prev, room]);
  };

  const deleteHostel = (id: string) => {
    setHostels(prev => prev.filter(h => h.id !== id));
    setRooms(prev => prev.filter(r => r.hostelId !== id));
  };

  const updateRoom = (room: Room) => {
    setRooms(prev => prev.map(r => r.id === room.id ? room : r));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedUniversity', selectedUniversity);
    }
  }, [selectedUniversity]);

  return (
    <AppContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      selectedUniversity,
      bookings,
      notifications,
      messages,
      hostels,
      rooms,
      reviews,
      universities,
      savedHostels,
      logout,
      setSelectedUniversity,
      isManager: user?.role === 'manager',
      filteredHostels,
      filteredRooms,
      addUniversity,
      addBooking,
      updateBookingStatus,
      updatePaymentStatus,
      refreshBookings,
      refreshData,
      addReview,
      sendMessage,
      markNotificationRead,
      toggleSaveHostel,
      addHostel,
      addRoom,
      deleteHostel,
      updateRoom,
    }}>
      {children}
    </AppContext.Provider>
  );
}
