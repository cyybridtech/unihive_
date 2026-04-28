export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface Hostel {
  id: string;
  name: string;
  universityId: string;
  address: string;
  description: string;
  facilities: string[];
  distanceFromCampus: string;
  priceRange: string;
  mainImage: string;
  gallery: string[];
  verified: boolean;
  subaccountCode?: string;
  managerId?: string;
  rating: number;
  reviewCount: number;
  lat?: number;
  lng?: number;
}

export interface Room {
  id: string;
  hostelId: string;
  roomNumber: string;
  capacity: number;
  price: number;
  available: boolean;
  gender?: 'male' | 'female' | 'unisex';
  description: string;
  image: string;
  type: string;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  hostelId: string;
  bookingDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  reservationFee: number;
  totalPrice: number;
  authCode?: string;
  userName?: string;
  userGender?: string;
  roomNumber?: string;
  roomType?: string;
  hostelName?: string;
}

export interface Review {
  id: string;
  userId: string;
  hostelId: string;
  rating: number;
  comment: string;
  date: string;
  userName: string;
  userAvatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'info' | 'hostel';
  read: boolean;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  universityId: string;
  role: 'student' | 'admin' | 'manager';
  gender?: 'male' | 'female';
  avatar: string;
  referralCode: string;
  credits: number;
  joinDate: string;
}

export const universities: University[] = [];

export const hostels: Hostel[] = [];

export const rooms: Room[] = [];

export const reviews: Review[] = [];

export const sampleBookings: Booking[] = [];

export const sampleMessages: Message[] = [];

export const sampleNotifications: Notification[] = [];

export const currentUser: User = {
  id: 'student1',
  name: 'Ama Mensah',
  email: 'ama.mensah@student.ug.edu.gh',
  phone: '+233 24 123 4567',
  universityId: 'u1',
  role: 'student',
  avatar: 'AM',
  referralCode: 'UNIHIVE-AMA2026',
  credits: 25,
  joinDate: '2026-01-01',
};

export const adminUser: User = {
  id: 'admin',
  name: 'UniHive Admin',
  email: 'admin@unihive.com',
  phone: '+233 20 000 0000',
  universityId: '',
  role: 'admin',
  avatar: 'UA',
  referralCode: '',
  credits: 0,
  joinDate: '2025-01-01',
};

export const allFacilities = ['WiFi', 'Security', 'Water Tank', 'Study Room', 'Kitchen', 'Laundry', 'Parking', 'Generator', 'AC', 'CCTV', 'En-suite Bathroom', 'Gym', 'Rooftop Lounge', 'Elevator', 'Swimming Pool', 'Restaurant', 'Balcony', 'Common Room', 'Kitchenette', 'Mini Fridge'];
