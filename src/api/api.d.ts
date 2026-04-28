// Type declarations for api.js (JavaScript module without TypeScript source)

export interface IdVerificationResponse {
  status: 'success' | 'warning' | 'error';
  match_score: number;
  extracted: {
    name: string;
    age: number;
    gender: string;
  };
  raw_text: string;
}
export declare const loginUser: (email: string, password: string) => Promise<any>;
export declare const registerUser: (userData: any) => Promise<any>;
export declare const createBooking: (userId: string, roomId: string, hostelId: string, bookingDate: string) => Promise<any>;
export declare const getUserBookings: () => Promise<any>;
export declare const getNotifications: () => Promise<any>;
export declare const getAllBookings: () => Promise<any>;
export declare const createHostel: (hostelData: any) => Promise<any>;
export declare const deleteHostel: (hostelId: string) => Promise<any>;
export declare const createRoom: (roomData: any) => Promise<any>;
export declare const updateRoomStatus: (roomId: string, available: boolean) => Promise<any>;
export declare const getUniversities: () => Promise<any>;
export declare const createUniversity: (uniData: any) => Promise<any>;
export declare const getHostels: () => Promise<any>;
export declare const getRooms: () => Promise<any>;
export declare const verifyPayment: (reference: string, bookingId: string | number) => Promise<any>;
export declare const approveBooking: (bookingId: string | number, status: string) => Promise<any>;
export declare const getReviewsForHostel: (hostelId: string) => Promise<any>;
export declare const submitReview: (reviewData: any) => Promise<any>;
export declare const uploadImage: (file: File) => Promise<any>;
