import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  PlusCircle, 
  Receipt,
  BedDouble,
  Search,
  Filter
} from 'lucide-react';
import { 
  fetchSpaAppointmentsApi, 
  fetchSpaServicesApi, 
  fetchTherapistsApi, 
  fetchReservationsApi,
  bookSpaAppointmentApi,
  updateSpaAppointmentStatusApi
} from '../api/hotelApi';
import { INITIAL_RESERVATIONS, INITIAL_STAFF } from '../data/mockData';
import CustomSelect from './CustomSelect';

const FALLBACK_SPA_SERVICES = [
  { Service_ID: 'spa-01', Service_Name: 'Ayurvedic Royal Abhyanga', Duration_Minutes: 90, Price: 8500 },
  { Service_ID: 'spa-02', Service_Name: 'Himalayan Hot Stone Therapy', Duration_Minutes: 75, Price: 7200 },
  { Service_ID: 'spa-03', Service_Name: 'Aromatherapy Deep Tissue', Duration_Minutes: 60, Price: 5800 },
];

const FALLBACK_THERAPISTS = INITIAL_STAFF.filter((s) => s.Role === 'Therapist').map((t) => ({
  Therapist_ID: t.Staff_ID,
  First_Name: t.First_Name,
  Last_Name: t.Last_Name,
  Specialty: t.Specialty || 'Wellness Specialist'
}));

export default function PosSpaServicesView() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // New appointment modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedReservationId, setSelectedReservationId] = useState('');
  const [selectedTherapistId, setSelectedTherapistId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-31');
  const [appointmentTime, setAppointmentTime] = useState('14:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apptsRes, srvsRes, thersRes, resvsRes] = await Promise.allSettled([
        fetchSpaAppointmentsApi(),
        fetchSpaServicesApi(),
        fetchTherapistsApi(),
        fetchReservationsApi()
      ]);

      if (apptsRes.status === 'fulfilled' && Array.isArray(apptsRes.value)) {
        setAppointments(apptsRes.value);
      }

      const loadedServices =
        srvsRes.status === 'fulfilled' && Array.isArray(srvsRes.value) && srvsRes.value.length > 0
          ? srvsRes.value
          : FALLBACK_SPA_SERVICES;
      setServices(loadedServices);
      if (loadedServices.length > 0 && !selectedServiceId) {
        setSelectedServiceId(loadedServices[0].Service_ID);
      }

      const loadedTherapists =
        thersRes.status === 'fulfilled' && Array.isArray(thersRes.value) && thersRes.value.length > 0
          ? thersRes.value
          : FALLBACK_THERAPISTS;
      setTherapists(loadedTherapists);
      if (loadedTherapists.length > 0 && !selectedTherapistId) {
        setSelectedTherapistId(loadedTherapists[0].Therapist_ID);
      }

      const loadedReservations =
        resvsRes.status === 'fulfilled' && Array.isArray(resvsRes.value) && resvsRes.value.length > 0
          ? resvsRes.value
          : INITIAL_RESERVATIONS;
      setReservations(loadedReservations);
      if (loadedReservations.length > 0 && !selectedReservationId) {
        setSelectedReservationId(loadedReservations[0].Reservation_ID);
      }
    } catch (err) {
      console.error('Failed to load spa data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const startDateTime = `${appointmentDate}T${appointmentTime}:00`;
      
      const res = await bookSpaAppointmentApi({
        reservationId: selectedReservationId,
        serviceId: selectedServiceId,
        therapistId: selectedTherapistId,
        startTime: startDateTime
      });

      if (res.error) throw new Error(res.error);

      setNotification({
        type: 'success',
        message: `Spa treatment (${res.serviceName}) confirmed & billed to room folio!`
      });
      setIsBookModalOpen(false);
      await loadData();
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Failed to book appointment: ' + err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateSpaAppointmentStatusApi(appointmentId, newStatus);
      setNotification({ type: 'success', message: `Appointment status updated to ${newStatus}.` });
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update appointment: ' + err.message });
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch = 
      (a.Guest_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.Service_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.Therapist_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.Room_Number || '').toString().includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || a.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedService = services.find(s => s.Service_ID === selectedServiceId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-sand-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-sand-700 font-semibold mb-1">
            Point of Sale &bull; Spa &amp; Wellness Services
          </div>
          <h1 className="text-3xl font-serif text-noir-950 font-normal">
            Spa Appointments &amp; Room Folio Billing
          </h1>
          <p className="text-sm text-sand-700 mt-0.5">
            Schedule holistic therapy sessions, assign master therapists, and post charges directly to guest room invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-4 py-2 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Spa Session</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-sand-200/80 hover:bg-sand-300 border border-sand-300 text-noir-900 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between border ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-semibold text-xs">Dismiss</button>
        </div>
      )}

      {/* Spa Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {services.map((srv) => (
          <div key={srv.Service_ID} className="bg-sand-50 border border-sand-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-accent-gold font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Signature Treatment
                </span>
                <span className="text-xs font-medium text-sand-600">{srv.Duration_Minutes} Mins</span>
              </div>
              <h3 className="text-lg font-serif font-semibold text-noir-950 mb-1">{srv.Service_Name}</h3>
            </div>
            <div className="mt-4 pt-3 border-t border-sand-200/80 flex items-center justify-between">
              <span className="text-base font-serif font-bold text-noir-950">₹{Number(srv.Price).toLocaleString()}</span>
              <button
                onClick={() => {
                  setSelectedServiceId(srv.Service_ID);
                  setIsBookModalOpen(true);
                }}
                className="px-3 py-1.5 bg-sand-200 hover:bg-sand-300 text-noir-900 rounded-lg text-xs font-semibold transition-colors border border-sand-300"
              >
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-sand-50/80 p-4 rounded-2xl border border-sand-300">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-sand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by guest, therapist, service, or room number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900 placeholder:text-sand-500 focus:outline-none focus:border-noir-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sand-600 hidden sm:block" />
          <div className="flex gap-1.5">
            {['ALL', 'Scheduled', 'Completed', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-noir-900 text-sand-50 shadow-sm'
                    : 'bg-white text-sand-800 border border-sand-300 hover:border-sand-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-sand-50 border border-sand-300 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-sand-600 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-noir-900" />
            Loading spa sessions...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-16 text-center text-sand-600 text-sm">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-sand-400" />
            No spa sessions found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-300 bg-sand-200/40 text-sand-700 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-4">Appt #</th>
                  <th className="py-3 px-4">Guest &amp; Suite</th>
                  <th className="py-3 px-4">Treatment</th>
                  <th className="py-3 px-4">Therapist</th>
                  <th className="py-3 px-4">Scheduled Slot</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/80">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.Appointment_ID} className="hover:bg-sand-100/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-noir-900">{appt.Appointment_ID}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-noir-900">{appt.Guest_Name}</div>
                      <div className="text-[11px] text-sand-600">Room #{appt.Room_Number}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-noir-900">{appt.Service_Name}</div>
                      <div className="text-[10px] text-sand-600">{appt.Duration_Minutes} mins duration</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-noir-900">
                      {appt.Therapist_Name}
                    </td>
                    <td className="py-3.5 px-4 text-sand-800">
                      <div>{new Date(appt.Start_Time).toLocaleDateString()}</div>
                      <div className="text-[11px] text-sand-600 font-mono">
                        {new Date(appt.Start_Time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &rarr; {new Date(appt.End_Time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-serif font-semibold text-noir-950">
                      ₹{Number(appt.Price).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        appt.Status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        appt.Status === 'Scheduled' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        'bg-sand-200 text-sand-700 border border-sand-300'
                      }`}>
                        {appt.Status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {appt.Status === 'Scheduled' && (
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(appt.Appointment_ID, 'Completed')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(appt.Appointment_ID, 'Cancelled')}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-semibold transition-all border border-rose-200"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Spa Session Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-sand-100 border border-sand-300 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <h2 className="text-2xl font-serif text-noir-950 font-normal mb-1">Schedule Spa Treatment</h2>
            <p className="text-xs text-sand-600 mb-6">Select guest room folio, treatment, and specialist.</p>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <CustomSelect
                label="Guest Stay / Room"
                value={selectedReservationId}
                onChange={setSelectedReservationId}
                options={reservations.map((r) => ({
                  value: r.Reservation_ID,
                  label: `${r.Guest_Name} (Room #${r.Room_Number} • Res ${r.Reservation_ID})`,
                  icon: <BedDouble className="w-3.5 h-3.5" />
                }))}
              />

              <CustomSelect
                label="Treatment Service"
                value={selectedServiceId}
                onChange={setSelectedServiceId}
                options={services.map((s) => ({
                  value: s.Service_ID,
                  label: `${s.Service_Name} — ${s.Duration_Minutes} mins (₹${Number(s.Price).toLocaleString()})`,
                  icon: <Sparkles className="w-3.5 h-3.5" />
                }))}
              />

              <CustomSelect
                label="Assigned Therapist"
                value={selectedTherapistId}
                onChange={setSelectedTherapistId}
                options={therapists.map((t) => ({
                  value: t.Therapist_ID,
                  label: `${t.First_Name} ${t.Last_Name} (${t.Specialty})`,
                  icon: <User className="w-3.5 h-3.5" />
                }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900 focus:outline-none focus:border-noir-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900 focus:outline-none focus:border-noir-900"
                    required
                  />
                </div>
              </div>

              {selectedService && (
                <div className="p-3 bg-sand-200/50 rounded-xl border border-sand-300 text-xs flex justify-between items-center">
                  <span className="text-sand-700">Folio Charge Addition:</span>
                  <span className="font-serif font-bold text-noir-950 text-sm">
                    + ₹{Number(selectedService.Price).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 border border-sand-300 text-noir-900 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting Folio...' : 'Confirm & Charge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
