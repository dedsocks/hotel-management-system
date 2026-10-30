import React, { useState, useEffect } from 'react';
import { 
  BedDouble, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw,
  Building2,
  Brush
} from 'lucide-react';
import { 
  fetchRoomsApi, 
  updateHousekeepingStatusApi,
  fetchHousekeepingTasksApi,
  updateHousekeepingTaskStatusApi
} from '../api/hotelApi';

export default function RoomsHousekeepingView() {
  const [rooms, setRooms] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('rooms'); // 'rooms' | 'tasks'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingRoomId, setUpdatingRoomId] = useState(null);
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, tasksData] = await Promise.all([
        fetchRoomsApi(),
        fetchHousekeepingTasksApi()
      ]);
      if (Array.isArray(roomsData)) setRooms(roomsData);
      if (Array.isArray(tasksData)) setTasks(tasksData);
    } catch (err) {
      console.error('Failed to load rooms and housekeeping data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateHousekeeping = async (roomId, newStatus) => {
    try {
      setUpdatingRoomId(roomId);
      await updateHousekeepingStatusApi(roomId, newStatus);
      setNotification({ type: 'success', message: `Room #${roomId} housekeeping status set to ${newStatus}.` });
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update housekeeping status: ' + err.message });
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateHousekeepingTaskStatusApi(taskId, newStatus);
      setNotification({ type: 'success', message: `Task #${taskId} updated to ${newStatus}.` });
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update task status: ' + err.message });
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = 
      (r.Room_Number || '').toString().includes(searchQuery) ||
      (r.TypeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.Location_Name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || r.Housekeeping_Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getHousekeepingBadge = (status) => {
    switch (status) {
      case 'Clean':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3 h-3" /> Clean</span>;
      case 'Inspected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200"><Sparkles className="w-3 h-3" /> Inspected</span>;
      case 'Dirty':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200"><AlertTriangle className="w-3 h-3" /> Dirty</span>;
      case 'Out of Service':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sand-200 text-noir-850 border border-sand-300">Out of Service</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sand-100">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-sand-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-sand-700 font-semibold mb-1">
            Facilities &amp; Environmental Services
          </div>
          <h1 className="text-3xl font-serif text-noir-950 font-normal">
            Rooms &amp; Housekeeping Turnover
          </h1>
          <p className="text-sm text-sand-700 mt-0.5">
            Monitor room readiness, inspection protocols, and dispatch turnover tasks across wings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtab Switcher */}
          <div className="flex bg-sand-200/80 p-1 rounded-xl border border-sand-300">
            <button
              onClick={() => setActiveSubTab('rooms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'rooms'
                  ? 'bg-noir-900 text-sand-50 shadow-sm'
                  : 'text-sand-700 hover:text-noir-900'
              }`}
            >
              All Rooms ({rooms.length})
            </button>
            <button
              onClick={() => setActiveSubTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'tasks'
                  ? 'bg-noir-900 text-sand-50 shadow-sm'
                  : 'text-sand-700 hover:text-noir-900'
              }`}
            >
              Turnover Tasks ({tasks.length})
            </button>
          </div>

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

      {activeSubTab === 'rooms' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-sand-50/80 p-4 rounded-2xl border border-sand-300">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-sand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by room number or suite category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900 placeholder:text-sand-500 focus:outline-none focus:border-noir-900 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-sand-600 hidden sm:block" />
              <div className="flex gap-1.5">
                {['ALL', 'Clean', 'Inspected', 'Dirty'].map((status) => (
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

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRooms.map((room) => {
              const isUpdating = updatingRoomId === room.Room_ID;
              const isOccupied = room.Booking_Status === 'Checked-In';

              return (
                <div 
                  key={room.Room_ID}
                  className="bg-sand-50 border border-sand-300 rounded-2xl p-5 shadow-sm hover:border-sand-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-sand-600 font-semibold">Room Number</div>
                        <h3 className="text-2xl font-serif font-bold text-noir-950">#{room.Room_Number}</h3>
                      </div>
                      <div className="text-right">
                        {getHousekeepingBadge(room.Housekeeping_Status)}
                        <div className="mt-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isOccupied ? 'bg-amber-100 text-amber-900' : 'bg-sand-200 text-sand-700'
                          }`}>
                            {isOccupied ? 'Occupied' : 'Vacant'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-sand-800 border-t border-sand-200/80 pt-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sand-600">Type:</span>
                        <span className="font-semibold text-noir-900">{room.TypeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sand-600">Rate:</span>
                        <span className="font-serif font-semibold text-noir-900">₹{Number(room.Rate).toLocaleString()} / night</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sand-600">Branch:</span>
                        <span className="text-sand-700 truncate max-w-[180px]">{room.Location_Name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Housekeeping Action Buttons */}
                  <div className="border-t border-sand-200/80 pt-3">
                    <span className="block text-[10px] uppercase tracking-wider text-sand-600 font-semibold mb-2">Set Housekeeping State</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateHousekeeping(room.Room_ID, 'Clean')}
                        disabled={isUpdating || room.Housekeeping_Status === 'Clean'}
                        className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40 text-center"
                      >
                        Clean
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateHousekeeping(room.Room_ID, 'Inspected')}
                        disabled={isUpdating || room.Housekeeping_Status === 'Inspected'}
                        className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40 text-center"
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateHousekeeping(room.Room_ID, 'Dirty')}
                        disabled={isUpdating || room.Housekeeping_Status === 'Dirty'}
                        className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40 text-center"
                      >
                        Dirty
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Housekeeping Tasks View */
        <div className="bg-sand-50 border border-sand-300 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-300 bg-sand-200/40 text-sand-700 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-4">Task ID</th>
                  <th className="py-3 px-4">Room &amp; Estate</th>
                  <th className="py-3 px-4">Assigned Personnel</th>
                  <th className="py-3 px-4">Task Details</th>
                  <th className="py-3 px-4">Reported</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/80">
                {tasks.map((task) => (
                  <tr key={task.Task_ID} className="hover:bg-sand-100/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-noir-900">{task.Task_ID}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-noir-900">Room #{task.Room_Number}</div>
                      <div className="text-[11px] text-sand-600">{task.Location_Name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-noir-900">
                      {task.Assigned_Staff_Name || 'Unassigned (General Pool)'}
                    </td>
                    <td className="py-3.5 px-4 text-sand-800 font-medium">
                      {task.Task_Type}
                    </td>
                    <td className="py-3.5 px-4 text-sand-600">
                      {task.Reported_Date ? new Date(task.Reported_Date).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        task.Status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        task.Status === 'In Progress' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {task.Status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex gap-1.5">
                        {task.Status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(task.Task_ID, 'Completed')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                          >
                            Mark Completed
                          </button>
                        )}
                        {task.Status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(task.Task_ID, 'In Progress')}
                            className="px-2.5 py-1 bg-sand-200 hover:bg-sand-300 text-noir-900 rounded-lg text-xs font-semibold transition-all border border-sand-300"
                          >
                            Start Work
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
