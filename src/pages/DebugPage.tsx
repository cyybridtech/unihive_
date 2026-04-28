import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Shield, Building2, CheckCircle, Info } from 'lucide-react';

export default function DebugPage() {
  const auth = useAuth();
  const { hostels, rooms, bookings } = useApp();

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (!auth.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const userId = String(auth.user.id);
  const assignedHostels = hostels.filter(h => String(h.managerId) === userId);
  const assignedRooms = rooms.filter(r => assignedHostels.some(h => h.id === r.hostelId));
  const assignedBookings = bookings.filter(b => assignedHostels.some(h => h.id === b.hostelId));

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-amber-500 px-6 py-8 sm:px-10 sm:py-10 text-white">
            <div className="flex items-start gap-4">
              <div className="rounded-3xl bg-amber-600/90 p-4">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Debug Console</h1>
                <p className="mt-2 max-w-2xl text-sm text-amber-100">
                  A quick view of the current logged-in user, assigned manager count, and hostels for debugging.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-center gap-3 text-gray-700 mb-3">
                  <Info className="w-5 h-5 text-amber-500" />
                  <h2 className="text-sm font-semibold">Current User</h2>
                </div>
                <p className="text-sm text-gray-600">Name: <span className="font-semibold text-gray-900">{auth.user.full_name}</span></p>
                <p className="text-sm text-gray-600">Email: <span className="font-semibold text-gray-900">{auth.user.email}</span></p>
                <p className="text-sm text-gray-600">Role: <span className="font-semibold text-gray-900">{auth.user.role}</span></p>
                <p className="text-sm text-gray-600">ID: <span className="font-semibold text-gray-900">{auth.user.id}</span></p>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-center gap-3 text-gray-700 mb-3">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <h2 className="text-sm font-semibold">Manager Assignments</h2>
                </div>
                <p className="text-sm text-gray-600">Assigned hostels: <span className="font-semibold text-gray-900">{assignedHostels.length}</span></p>
                <p className="text-sm text-gray-600">Assigned rooms: <span className="font-semibold text-gray-900">{assignedRooms.length}</span></p>
                <p className="text-sm text-gray-600">Assigned bookings: <span className="font-semibold text-gray-900">{assignedBookings.length}</span></p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Hostels</h2>
              {assignedHostels.length === 0 ? (
                <p className="text-sm text-gray-500">No hostels are currently assigned to this manager user.</p>
              ) : (
                <div className="space-y-3">
                  {assignedHostels.map(hostel => (
                    <div key={hostel.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-900">{hostel.name}</p>
                      <p className="text-sm text-gray-500">Hostel ID: {hostel.id}</p>
                      <p className="text-sm text-gray-500">Address: {hostel.address}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw Data Summary</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Hostels total</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{hostels.length}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Rooms total</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{rooms.length}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Bookings total</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
