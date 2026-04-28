const BASE_URL = "/backend/api";
const defaultFetchOptions = { credentials: 'include' };

const parseJsonResponse = async (res) => {
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    const message = data?.message || data?.error || res.statusText || 'Unknown API error';
    throw new Error(`API error ${res.status}: ${message}`);
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Invalid JSON response from ${res.url}: ${text.slice(0, 200)}`);
    }
  }

  throw new Error(`Unexpected response content type from ${res.url}: ${contentType || 'unknown'}\n${text.slice(0, 200)}`);
};

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, { ...defaultFetchOptions, ...options });
  return parseJsonResponse(res);
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login.php`, {
    ...defaultFetchOptions,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return parseJsonResponse(res);
};

export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/register.php`, {
    ...defaultFetchOptions,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return parseJsonResponse(res);
};

// Create booking API
export const createBooking = async (userId, roomId, hostelId, bookingDate) => {
  const res = await fetch(`${BASE_URL}/bookings.php`, {
    ...defaultFetchOptions,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, room_id: roomId, hostel_id: hostelId, booking_date: bookingDate }),
  });

  return parseJsonResponse(res);
};

// Get user bookings
const getUserId = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr).id : '';
  } catch {
    return '';
  }
};

export const getUserBookings = async () => {
  const userId = getUserId();
  const url = userId ? `${BASE_URL}/getUserBookings.php?user_id=${userId}` : `${BASE_URL}/getUserBookings.php`;
  const res = await fetch(url, {
    ...defaultFetchOptions,
  });
  return parseJsonResponse(res);
};

// Get user notifications
export const getNotifications = async () => {
  const userId = getUserId();
  const url = userId ? `${BASE_URL}/getNotifications.php?user_id=${userId}` : `${BASE_URL}/getNotifications.php`;
  const res = await fetch(url, {
    ...defaultFetchOptions,
  });
  return parseJsonResponse(res);
};

// Admin APIs
export const createHostel = async (hostelData) => {
  const res = await fetch(`${BASE_URL}/createHostel.php`, {
    ...defaultFetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(hostelData)
  });
  return parseJsonResponse(res);
};

export const deleteHostel = async (hostelId) => {
  const res = await fetch(`${BASE_URL}/deleteHostel.php`, {
    ...defaultFetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostel_id: hostelId })
  });
  return parseJsonResponse(res);
};

export const createRoom = async (roomData) => {
  const res = await fetch(`${BASE_URL}/createRoom.php`, {
    ...defaultFetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roomData)
  });
  return parseJsonResponse(res);
};

export const updateRoomStatus = async (roomId, available) => {
  const res = await fetch(`${BASE_URL}/updateRoomStatus.php`, {
    ...defaultFetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId, available })
  });
  return parseJsonResponse(res);
};

// Get all bookings (admin)
export const getAllBookings = async () => {
  const res = await fetch(`${BASE_URL}/getAllBookings.php`, {
    ...defaultFetchOptions,
  });
  return parseJsonResponse(res);
};

// Universities
export const getUniversities = async () => {
  const res = await fetch(`${BASE_URL}/getUniversities.php`, {
    ...defaultFetchOptions,
  });
  return parseJsonResponse(res);
};

export const createUniversity = async (uniData) => {
  const res = await fetch(`${BASE_URL}/createUniversity.php`, {
    ...defaultFetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(uniData)
  });
  return parseJsonResponse(res);
};

// Hostels and Rooms
export const getHostels = async () => {
  const res = await fetch(`${BASE_URL}/getHostels.php`, {
    ...defaultFetchOptions,
  });
  return parseJsonResponse(res);
};

export const getRooms = async () => {
  const res = await fetch(`${BASE_URL}/getRooms.php`, {
    ...defaultFetchOptions,
  });
  return parseJsonResponse(res);
};

export const verifyPayment = async (reference, bookingId) => {
  const res = await fetch(`${BASE_URL}/verifyPayment.php`, {
    ...defaultFetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference, booking_id: bookingId })
  });
  return parseJsonResponse(res);
};

// Approve/Reject booking (admin)
export const approveBooking = async (bookingId, status) => {
  const res = await fetch(`${BASE_URL}/approveBooking.php`, {
    ...defaultFetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId, status })
  });
  return parseJsonResponse(res);
};

// Reviews API
export const getReviewsForHostel = async (hostelId) => {
  const res = await fetch(`${BASE_URL}/reviews.php?hostel_id=${hostelId}`, {
    ...defaultFetchOptions,
  });
  return parseJsonResponse(res);
};

export const submitReview = async (reviewData) => {
  const res = await fetch(`${BASE_URL}/reviews.php`, {
    ...defaultFetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });
  return parseJsonResponse(res);
};

// Image Upload
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await fetch(`${BASE_URL}/uploadImage.php`, {
    ...defaultFetchOptions,
    method: 'POST',
    body: formData
  });
  return parseJsonResponse(res);
};
