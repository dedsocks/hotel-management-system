import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building, 
  CalendarCheck2, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Plus, 
  Search, 
  Users, 
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import CustomSelect from './CustomSelect';
import { 
  INITIAL_RESERVATIONS, 
  INITIAL_ROOMS, 
  INITIAL_GUESTS, 
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_BRANCHES
} from '../data/mockData';
import { 
  fetchRoomsApi, 
  fetchReservationsApi, 
  fetchHousekeepingTasksApi, 
  fetchAnalyticsApi,
  fetchGuestsApi,
  createReservationApi
} from '../api/hotelApi';

export default function OverviewDashboard({ onNavigateTab }) {
  const { currentStaff } = useAuth();
  const isManager = currentStaff?.Role === 'Manager';
  const [selectedBranchId, setSelectedBranchId] = useState('b-01');
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [tasks, setTasks] = useState(INITIAL_HOUSEKEEPING_TASKS);
  const [analytics, setAnalytics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [guests, setGuests] = useState(INITIAL_GUESTS);
  const [isNewResModalOpen, setIsNewResModalOpen] = useState(false);
  const [walkInGuestId, setWalkInGuestId] = useState(INITIAL_GUESTS[0]?.Guest_ID || '');
  const [walkInRoomId, setWalkInRoomId] = useState(INITIAL_ROOMS[0]?.Room_ID || '');
  const [walkInCheckIn, setWalkInCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [walkInCheckOut, setWalkInCheckOut] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [walkInPayment, setWalkInPayment] = useState('Credit Card');
  const [isCreatingWalkIn, setIsCreatingWalkIn] = useState(false);

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingWalkIn(true);
    try {
      const res = await createReservationApi({
        guestId: walkInGuestId,
        roomId: walkInRoomId,
        checkInDate: walkInCheckIn,
        checkOutDate: walkInCheckOut,
        paymentMethod: walkInPayment
      });
      if (res?.success) {
        setIsNewResModalOpen(false);
        const updatedResvs = await fetchReservationsApi();
        if (Array.isArray(updatedResvs)) setReservations(updatedResvs);
      }
    } catch (err) {
      console.error('Walk-in booking failed:', err);
    } finally {
      setIsCreatingWalkIn(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [rms, resvs, tsks, anlt] = await Promise.allSettled([
          fetchRoomsApi(),
          fetchReservationsApi(),
          fetchHousekeepingTasksApi(),
          fetchAnalyticsApi()
        ]);
        if (rms.status === 'fulfilled' && Array.isArray(rms.value) && rms.value.length > 0) {
          const enriched = rms.value.map((r) => {
            const match = INITIAL_ROOMS.find(
              (m) =>
                m.Room_ID === r.Room_ID ||
                String(m.Room_Number) === String(r.Room_Number) ||
                m.RoomType_ID === r.RoomType_ID ||
                m.TypeName.toLowerCase() === (r.TypeName || '').trim().toLowerCase()
            );
            return {
              ...r,
              Image: r.Image || match?.Image || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800',
              Specs: r.Specs || match?.Specs || `${r.Base_Capacity || 2} Guests • Luxury Suite`
            };
          });
          setRooms(enriched);
        }
        if (resvs.status === 'fulfilled' && Array.isArray(resvs.value) && resvs.value.length > 0) {
          setReservations(resvs.value);
        }
        if (tsks.status === 'fulfilled' && Array.isArray(tsks.value) && tsks.value.length > 0) {
          setTasks(tsks.value);
        }
        if (anlt.status === 'fulfilled' && anlt.value?.totalRooms) {
          setAnalytics(anlt.value);
        }
      } catch (err) {
        console.warn('Backend live fetch error, using local state:', err);
      }
    }
    loadData();
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(loadData, 10000);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const currentBranch = INITIAL_BRANCHES.find(b => b.Branch_ID === selectedBranchId) || INITIAL_BRANCHES[0];

  const getLiveRoomStatus = (room) => {
    const activeRes = reservations.find(
      (res) =>
        (res.Room_ID === room.Room_ID || String(res.Room_Number) === String(room.Room_Number)) &&
        (res.Booking_Status === 'Checked-In' || res.Booking_Status === 'Confirmed')
    );
    if (activeRes?.Booking_Status === 'Checked-In') return 'Occupied';
    if (activeRes?.Booking_Status === 'Confirmed') return 'Reserved';
    return room.Status;
  };

  // Quick Stats
  const occupiedCount = rooms.filter(r => getLiveRoomStatus(r) === 'Occupied').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;
  const cleanRooms = rooms.filter(r => r.Housekeeping_Status === 'Clean' || r.Housekeeping_Status === 'Inspected').length;
  const pendingTasks = tasks.filter(t => t.Status !== 'Completed').length;

  const filteredReservations = reservations
    .filter(r => r.Booking_Status === 'Checked-In' || r.Booking_Status === 'Confirmed')
    .filter(r => 
      (r.Guest_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(r.Room_Number || '').includes(searchQuery) ||
      (r.Reservation_ID || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Property Hero Visual Banner with High-Quality Photography */}
      <div className="relative rounded-3xl overflow-hidden border border-sand-300/80 shadow-md h-64 bg-noir-950">
        <img
          src={currentBranch.Image}
          alt={currentBranch.Location_Name}
          className="w-full h-full object-cover opacity-60 transition-all duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/40 to-transparent flex flex-col justify-between p-6 md:p-8">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-sand-50/20 backdrop-blur-md border border-white/20 text-sand-50 text-[11px] tracking-widest uppercase font-semibold">
              Live Property Operations
            </span>
            <div className="w-56">
              <CustomSelect
                variant="dark"
                value={selectedBranchId}
                onChange={setSelectedBranchId}
                options={INITIAL_BRANCHES.map(b => ({
                  value: b.Branch_ID,
                  label: b.Location_Name
                }))}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-white font-normal">
                {currentBranch.Location_Name}
              </h1>
              <p className="text-xs md:text-sm text-sand-200 mt-1 max-w-xl">
                {currentBranch.Tagline} &bull; {currentBranch.Address}
              </p>
            </div>

            <button 
              onClick={() => setIsNewResModalOpen(true)}
              className="self-start md:self-auto px-4 py-2.5 bg-sand-50 hover:bg-white text-noir-950 rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-noir-900" /> New Reservation
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards - Resort Minimalist Elegance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-sand-50 border border-sand-300/80 p-5 rounded-xl shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-sand-600 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Occupancy Rate</span>
            <Users className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="text-3xl font-serif text-noir-900 font-normal">{occupancyRate}%</div>
          <div className="text-xs text-sand-600 mt-2 flex items-center justify-between">
            <span>{occupiedCount} of {rooms.length} suites occupied</span>
            <span className={`font-medium ${occupancyRate > 0 ? 'text-emerald-700' : 'text-sand-500'}`}>
              {occupancyRate > 0 ? 'Active occupancy' : 'No active stays'}
            </span>
          </div>
        </div>

        <div className="bg-sand-50 border border-sand-300/80 p-5 rounded-xl shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-sand-600 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Today's In-House</span>
            <CalendarCheck2 className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="text-3xl font-serif text-noir-900 font-normal">{reservations.length}</div>
          <div className="text-xs text-sand-600 mt-2 flex items-center justify-between">
            <span>
              {reservations.filter(r => r.Booking_Status === 'Checked-In').length} checked-in,{' '}
              {reservations.filter(r => r.Booking_Status === 'Confirmed').length} confirmed
            </span>
            <span className="text-sand-700 font-medium">Live folio sync</span>
          </div>
        </div>

        <div className="bg-sand-50 border border-sand-300/80 p-5 rounded-xl shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-sand-600 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Housekeeping Readiness</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-serif text-noir-900 font-normal">{cleanRooms} / {rooms.length}</div>
          <div className="text-xs text-sand-600 mt-2 flex items-center justify-between">
            <span>{pendingTasks} active tasks assigned</span>
            <span className="text-amber-700 font-medium">
              {rooms.length - cleanRooms} pending turn
            </span>
          </div>
        </div>

        <div className="bg-sand-50 border border-sand-300/80 p-5 rounded-xl shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-sand-600 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Total Folio Revenue</span>
            <CreditCard className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="text-3xl font-serif text-noir-900 font-normal">
            ₹{Number(
              analytics?.totalRevenue ??
                reservations.reduce((sum, r) => sum + Number(r.Total_Amount || r.Base_Price || 0), 0)
            ).toLocaleString()}
          </div>
          <div className="text-xs text-sand-600 mt-2 flex items-center justify-between">
            <span>Rooms &amp; Spa &amp; Dining</span>
            <span className="text-sand-700 font-medium">Live ledger</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Reservations Table & Room Floor Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols (Full width for non-Managers): Live Reservations */}
        <div className={`${isManager ? 'lg:col-span-2' : 'lg:col-span-3'} bg-sand-50 border border-sand-300/80 rounded-2xl p-6 shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-serif text-noir-900 font-medium">Active &amp; Incoming Guests</h2>
              <p className="text-xs text-sand-600 mt-0.5">Real-time room bookings and guest arrivals</p>
            </div>
            
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-sand-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest or suite..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-sand-100 border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-500 focus:outline-none focus:border-noir-900 w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sand-200 text-[11px] font-semibold tracking-wider uppercase text-sand-600">
                  <th className="pb-3 pl-2">Reservation / Guest</th>
                  <th className="pb-3">Suite</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 text-xs">
                {filteredReservations.map((res) => (
                  <tr key={res.Reservation_ID} className="hover:bg-sand-100/70 transition-colors group">
                    <td className="py-3.5 pl-2">
                      <div className="font-medium text-noir-900">{res.Guest_Name}</div>
                      <div className="text-[11px] text-sand-600">{res.Reservation_ID}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-noir-900">Suite {res.Room_Number}</div>
                      <div className="text-[11px] text-sand-600">{res.Room_Type}</div>
                    </td>
                    <td className="py-3.5 text-sand-700">
                      <div>{res.Check_In_Date}</div>
                      <div className="text-[10px] text-sand-500">to {res.Check_Out_Date}</div>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        res.Booking_Status === 'Checked-In'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {res.Booking_Status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2 font-medium text-noir-900">
                      ₹{Number(res.Total_Amount || res.Base_Price || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Room States & Housekeeping Quick View (Manager Only) */}
        {isManager && (
          <div className="space-y-6">
          <div className="bg-sand-50 border border-sand-300/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif text-noir-900 font-medium">Suite Inventory</h3>
              <span className="text-[11px] text-sand-600">{rooms.length} Suites Total</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {rooms.map((room) => {
                const liveStatus = getLiveRoomStatus(room);
                const isOccupied = liveStatus === 'Occupied';
                const isReserved = liveStatus === 'Reserved';
                
                return (
                  <div
                    key={room.Room_ID}
                    className={`rounded-xl border overflow-hidden text-left transition-all ${
                      isOccupied
                        ? 'bg-sand-50 border-noir-900 shadow-sm'
                        : isReserved
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-sand-50 border-sand-300 hover:border-sand-400'
                    }`}
                  >
                    <div className="h-20 w-full relative overflow-hidden bg-sand-200">
                      <img 
                        src={room.Image || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800'} 
                        alt={room.TypeName}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <span className={`absolute top-1.5 right-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isOccupied ? 'bg-noir-900 text-sand-50' : isReserved ? 'bg-amber-600 text-white' : 'bg-sand-100/90 text-noir-900'
                      }`}>
                        {liveStatus}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-noir-900">Suite {room.Room_Number}</span>
                        <span className="text-[11px] font-medium text-sand-700">₹{Number(room.Rate || 0).toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-sand-600 truncate">{room.TypeName}</div>
                      <div className="text-[9px] text-sand-500 truncate mt-0.5">{room.Specs}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-sand-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-sand-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-noir-900 inline-block"></span>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-600 inline-block"></span>
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sand-400 inline-block"></span>
                <span>Maintenance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sand-200 border border-sand-300 inline-block"></span>
                <span>Available</span>
              </div>
            </div>
          </div>

          {/* Quick Housekeeping Card */}
          <div className="bg-sand-200/50 border border-sand-300/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-serif font-medium text-noir-900 uppercase tracking-wider">
                Pending Turnovers
              </h3>
              <button 
                onClick={() => onNavigateTab('rooms')}
                className="text-xs text-sand-700 hover:text-noir-950 flex items-center gap-1"
              >
                All Tasks <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div key={task.Task_ID} className="p-3 bg-sand-50 rounded-lg border border-sand-300 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-noir-900">Suite {task.Room_Number} &bull; {task.Task_Type}</div>
                    <div className="text-[11px] text-sand-600">Reported {task.Reported_Date}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                    {task.Status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Quick Walk-In New Reservation Modal */}
      {isNewResModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-sand-50 rounded-3xl border border-sand-300 shadow-2xl p-6 sm:p-8">
            <h3 className="text-2xl font-serif text-noir-950 font-medium mb-1">Walk-In Reservation</h3>
            <p className="text-xs text-sand-600 mb-5">Create an immediate front-desk booking and generate folio.</p>
            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1">Guest</label>
                <select
                  value={walkInGuestId}
                  onChange={(e) => setWalkInGuestId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900"
                  required
                >
                  {guests.map((g) => (
                    <option key={g.Guest_ID} value={g.Guest_ID}>
                      {g.First_Name} {g.Last_Name} ({g.Email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1">Suite / Room</label>
                <select
                  value={walkInRoomId}
                  onChange={(e) => setWalkInRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900"
                  required
                >
                  {rooms.map((r) => (
                    <option key={r.Room_ID} value={r.Room_ID}>
                      Room #{r.Room_Number} — {r.TypeName || r.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1">Check-In</label>
                  <input
                    type="date"
                    value={walkInCheckIn}
                    onChange={(e) => setWalkInCheckIn(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1">Check-Out</label>
                  <input
                    type="date"
                    value={walkInCheckOut}
                    onChange={(e) => setWalkInCheckOut(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1">Payment Method</label>
                <select
                  value={walkInPayment}
                  onChange={(e) => setWalkInPayment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="UPI / Bank">UPI / Bank</option>
                  <option value="Pay at Hotel">Pay at Hotel</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsNewResModalOpen(false)}
                  className="flex-1 py-2.5 border border-sand-300 text-noir-900 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-sand-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWalkIn}
                  className="flex-1 py-2.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {isCreatingWalkIn ? 'Booking...' : 'Confirm Walk-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
