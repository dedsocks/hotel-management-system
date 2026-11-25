import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  LogOut, 
  UserCheck, 
  Clock, 
  CreditCard, 
  Receipt, 
  Building,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  fetchReservationsApi, 
  checkInReservationApi, 
  checkOutReservationApi 
} from '../api/hotelApi';

export default function ReservationsManagerView() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionInProgress, setActionInProgress] = useState(null);
  const [notification, setNotification] = useState(null);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchReservationsApi();
      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        setReservations([]);
      }
    } catch (err) {
      setError('Failed to load reservations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
    const handleFocus = () => loadReservations();
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(loadReservations, 10000);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const handleCheckIn = async (reservationId) => {
    try {
      setActionInProgress(reservationId);
      const res = await checkInReservationApi(reservationId);
      if (res.error) throw new Error(res.error);
      setNotification({ type: 'success', message: `Reservation #${reservationId} checked in successfully.` });
      await loadReservations();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Check-in failed.' });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCheckOut = async (reservationId) => {
    try {
      setActionInProgress(reservationId);
      const res = await checkOutReservationApi(reservationId);
      if (res.error) throw new Error(res.error);
      setNotification({ type: 'success', message: `Reservation #${reservationId} checked out. Room dispatched to Housekeeping.` });
      await loadReservations();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Check-out failed.' });
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch = 
      (r.Guest_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.Reservation_ID || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.Room_Number || '').toString().includes(searchQuery) ||
      (r.Room_Type || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.Booking_Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">Confirmed</span>;
      case 'Checked-In':
        return <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Checked-In</span>;
      case 'Checked-Out':
        return <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sand-200 text-noir-850 border border-sand-300">Checked-Out</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sand-100 text-sand-800 border border-sand-300">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="pb-6 border-b border-sand-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-sand-700 font-semibold mb-1">
            Front Desk Operations &bull; Guest Ledger
          </div>
          <h1 className="text-3xl font-serif text-noir-950 font-normal">
            Reservations &amp; Check-In Management
          </h1>
          <p className="text-sm text-sand-700 mt-0.5">
            Real-time pipeline tracking reservations, live arrivals, room assignments, and check-out handovers.
          </p>
        </div>

        <button
          onClick={loadReservations}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2 bg-sand-200/80 hover:bg-sand-300 border border-sand-300 text-noir-900 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div 
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs font-semibold hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-sand-50/80 p-4 rounded-2xl border border-sand-300">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-sand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Guest name, reservation ID, or room number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900 placeholder:text-sand-500 focus:outline-none focus:border-noir-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-sand-600 hidden sm:block" />
          <div className="grid grid-cols-4 sm:flex gap-1.5 w-full">
            {['ALL', 'Confirmed', 'Checked-In', 'Checked-Out'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-noir-900 text-sand-50 shadow-sm'
                    : 'bg-white text-sand-800 border border-sand-300 hover:border-sand-400'
                }`}
              >
                {status === 'ALL' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-sand-50 border border-sand-300 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-sand-600 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-noir-900" />
            Loading active reservations...
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-16 text-center text-sand-600 text-sm">
            <CalendarCheck className="w-8 h-8 mx-auto mb-3 text-sand-400" />
            No reservations found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-300 bg-sand-200/40 text-sand-700 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-4">Reservation</th>
                  <th className="py-3 px-4">Guest Details</th>
                  <th className="py-3 px-4">Room &amp; Category</th>
                  <th className="py-3 px-4">Check-In / Out</th>
                  <th className="py-3 px-4">Invoice / Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/80">
                {filteredReservations.map((res) => {
                  const checkInFormatted = res.Check_In_Date ? new Date(res.Check_In_Date).toLocaleDateString() : 'N/A';
                  const checkOutFormatted = res.Check_Out_Date ? new Date(res.Check_Out_Date).toLocaleDateString() : 'N/A';
                  const isActing = actionInProgress === res.Reservation_ID;

                  return (
                    <tr key={res.Reservation_ID} className="hover:bg-sand-100/60 transition-colors">
                      {/* Reservation ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-noir-900">
                        {res.Reservation_ID}
                      </td>

                      {/* Guest Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-noir-900">{res.Guest_Name}</div>
                        <div className="text-[11px] text-sand-600">{res.Guest_Email}</div>
                        {res.Loyalty_Tier && (
                          <span className="inline-block mt-0.5 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-accent-gold/20 text-noir-900">
                            {res.Loyalty_Tier} Tier
                          </span>
                        )}
                      </td>

                      {/* Room & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-noir-900 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-sand-600" />
                          <span>Room #{res.Room_Number}</span>
                        </div>
                        <div className="text-[11px] text-sand-600">{res.Room_Type}</div>
                      </td>

                      {/* Check-In / Out */}
                      <td className="py-3.5 px-4">
                        <div className="text-noir-900 font-medium">In: {checkInFormatted}</div>
                        <div className="text-sand-600">Out: {checkOutFormatted}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-noir-900 font-serif text-sm">
                          ₹{Number(res.Total_Amount || res.Base_Price || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-sand-600">
                          {res.Invoice_ID ? `Inv: ${res.Invoice_ID}` : 'Paid via Booking'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(res.Booking_Status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {res.Booking_Status === 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(res.Reservation_ID)}
                            disabled={isActing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{isActing ? 'Checking In...' : 'Check-In'}</span>
                          </button>
                        )}

                        {res.Booking_Status === 'Checked-In' && (
                          <button
                            type="button"
                            onClick={() => handleCheckOut(res.Reservation_ID)}
                            disabled={isActing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{isActing ? 'Processing...' : 'Check-Out & Turnover'}</span>
                          </button>
                        )}

                        {res.Booking_Status === 'Checked-Out' && (
                          <span className="text-[11px] text-sand-600 font-medium italic">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
