import React, { useState, useEffect } from 'react';
import {
  fetchDiningMenuApi,
  fetchFoodOrdersApi,
  createFoodOrderApi,
  updateFoodOrderStatusApi,
  fetchReservationsApi
} from '../api/hotelApi';
import { Utensils, Plus, CheckCircle2, Clock, RefreshCw, ChefHat } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function PosDiningView() {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResId, setSelectedResId] = useState('');
  const [cart, setCart] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [menuRes, ordersRes, resRes] = await Promise.all([
        fetchDiningMenuApi(),
        fetchFoodOrdersApi(),
        fetchReservationsApi()
      ]);
      if (Array.isArray(menuRes)) setMenuItems(menuRes);
      if (Array.isArray(ordersRes)) setOrders(ordersRes);
      if (Array.isArray(resRes)) {
        const active = resRes.filter((r) => r.Booking_Status === 'Checked-In' || r.Booking_Status === 'Confirmed');
        setReservations(active);
        if (active.length > 0 && !selectedResId) setSelectedResId(active[0].Reservation_ID);
      }
    } catch (err) {
      console.error('Failed to load dining POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateQty = (itemId, delta) => {
    setCart((prev) => {
      const next = (prev[itemId] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const items = Object.entries(cart).map(([itemId, quantity]) => ({ itemId, quantity }));
    if (!selectedResId || items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await createFoodOrderApi({ reservationId: selectedResId, items });
      if (res?.success) {
        setIsModalOpen(false);
        setCart({});
        await loadData();
      }
    } catch (err) {
      console.error('Failed to place food order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateFoodOrderStatusApi(orderId, status);
      await loadData();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Preparing':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-300 pb-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-sand-600 font-semibold block mb-1">
            Culinary &amp; Room Service
          </span>
          <h1 className="text-3xl font-serif text-noir-950 font-medium">Kitchen &amp; Dining POS</h1>
          <p className="text-xs text-sand-600 mt-1">
            Manage in-room dining orders, kitchen preparation tickets, and folio charges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 bg-white border border-sand-300 rounded-xl text-sand-700 hover:text-noir-900 hover:bg-sand-100 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Dining Order</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-sand-50 rounded-2xl border border-sand-300 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-sand-200 flex items-center justify-between bg-sand-100/60">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-noir-900" />
            <h2 className="font-serif text-lg font-medium text-noir-950">Active Kitchen Tickets</h2>
          </div>
          <span className="text-xs text-sand-600 font-medium">{orders.length} Orders</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-sand-600">Loading kitchen orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-sand-600">No dining orders placed yet.</div>
        ) : (
          <div className="divide-y divide-sand-200">
            {orders.map((order) => (
              <div key={order.Order_ID} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-sand-100/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-noir-900">{order.Order_ID}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${statusBadge(order.Order_Status)}`}>
                      {order.Order_Status}
                    </span>
                    <span className="text-xs text-sand-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.Order_Time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-noir-950">
                    {order.Guest_Name} &bull; <span className="text-sand-700">Room #{order.Room_Number}</span>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="text-xs text-sand-600">
                      {order.items.map((i) => `${i.Quantity}× ${i.Name}`).join(' • ')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-serif font-bold text-noir-950">₹{Number(order.Total_Amount).toLocaleString()}</div>
                    <div className="text-[10px] text-sand-500">Posted to Folio</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {order.Order_Status === 'Placed' && (
                      <button
                        onClick={() => handleStatusChange(order.Order_ID, 'Preparing')}
                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Prepare
                      </button>
                    )}
                    {(order.Order_Status === 'Placed' || order.Order_Status === 'Preparing') && (
                      <button
                        onClick={() => handleStatusChange(order.Order_ID, 'Delivered')}
                        className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Deliver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Dining Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-sand-50 rounded-3xl border border-sand-300 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-serif text-noir-950 font-medium mb-1">New In-Room Dining Order</h3>
            <p className="text-xs text-sand-600 mb-5">Select guest room folio and culinary items.</p>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <CustomSelect
                label="Guest Stay / Room"
                value={selectedResId}
                onChange={setSelectedResId}
                options={reservations.map((r) => ({
                  value: r.Reservation_ID,
                  label: `${r.Guest_Name} (Room #${r.Room_Number} • ${r.Reservation_ID})`,
                  icon: <Utensils className="w-3.5 h-3.5" />
                }))}
              />

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {menuItems.map((item) => {
                  const qty = cart[item.Item_ID] || 0;
                  return (
                    <div key={item.Item_ID} className="p-3 bg-white rounded-xl border border-sand-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-noir-900">{item.Name}</div>
                        <div className="text-[10px] text-sand-600">{item.Category} &bull; ₹{Number(item.Price).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.Item_ID, -1)}
                          className="w-6 h-6 rounded-full border border-sand-300 text-xs font-bold hover:bg-sand-100"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-semibold">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.Item_ID, 1)}
                          className="w-6 h-6 rounded-full border border-sand-300 text-xs font-bold hover:bg-sand-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-sand-300 text-noir-900 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-sand-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || Object.keys(cart).length === 0}
                  className="flex-1 py-2.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Place Order & Charge Folio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
