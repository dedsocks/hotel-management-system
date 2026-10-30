import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  CreditCard, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Percent,
  Calendar
} from 'lucide-react';
import { fetchInvoicesApi } from '../api/hotelApi';

export default function BillingInvoicesView() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await fetchInvoicesApi();
      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      (inv.Invoice_ID || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.Guest_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.Reservation_ID || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.Payment_Method || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || (inv.Payment_Status || 'Completed') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = invoices.reduce((acc, curr) => acc + Number(curr.Net_Payable || 0), 0);
  const totalTax = invoices.reduce((acc, curr) => acc + Number(curr.Tax_Amount || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="pb-6 border-b border-sand-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-sand-700 font-semibold mb-1">
            Financial Ledger &bull; Guest Folios
          </div>
          <h1 className="text-3xl font-serif text-noir-950 font-normal">
            Billing, Invoices &amp; Transactions
          </h1>
          <p className="text-sm text-sand-700 mt-0.5">
            Audit itemized billing records, tax calculations, discounts, and payment methods.
          </p>
        </div>

        <button
          onClick={loadInvoices}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2 bg-sand-200/80 hover:bg-sand-300 border border-sand-300 text-noir-900 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Invoices</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-sand-50 border border-sand-300 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-sand-600 font-semibold">Total Revenue Invoiced</span>
            <Receipt className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="text-2xl font-serif font-bold text-noir-950">
            ₹{totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-sand-600 mt-1">Across all confirmed &amp; checked-in stays</div>
        </div>

        <div className="bg-sand-50 border border-sand-300 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-sand-600 font-semibold">Total Taxes Remitted (12% GST)</span>
            <Percent className="w-4 h-4 text-sand-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-noir-950">
            ₹{totalTax.toLocaleString()}
          </div>
          <div className="text-[11px] text-sand-600 mt-1">Luxury tax &amp; service charge component</div>
        </div>

        <div className="bg-sand-50 border border-sand-300 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-sand-600 font-semibold">Invoices Generated</span>
            <FileText className="w-4 h-4 text-noir-900" />
          </div>
          <div className="text-2xl font-serif font-bold text-noir-950">
            {invoices.length} Folios
          </div>
          <div className="text-[11px] text-sand-600 mt-1">Synchronized with MySQL schema</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-sand-50/80 p-4 rounded-2xl border border-sand-300">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-sand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice ID, guest name, reservation ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900 placeholder:text-sand-500 focus:outline-none focus:border-noir-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sand-600 hidden sm:block" />
          <div className="flex gap-1.5">
            {['ALL', 'Completed', 'Pending'].map((status) => (
              <button
                key={status}
                type="button"
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

      {/* Invoices Table */}
      <div className="bg-sand-50 border border-sand-300 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-sand-600 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-noir-900" />
            Loading invoices and financial transactions...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-16 text-center text-sand-600 text-sm">
            <Receipt className="w-8 h-8 mx-auto mb-3 text-sand-400" />
            No invoice records found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-300 bg-sand-200/40 text-sand-700 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Guest &amp; Reservation</th>
                  <th className="py-3 px-4">Date Issued</th>
                  <th className="py-3 px-4">Subtotal / Tax / Disc</th>
                  <th className="py-3 px-4">Net Total</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/80">
                {filteredInvoices.map((inv) => {
                  const issueDateFormatted = inv.Issue_Date ? new Date(inv.Issue_Date).toLocaleDateString() : 'N/A';

                  return (
                    <tr key={inv.Invoice_ID} className="hover:bg-sand-100/60 transition-colors">
                      {/* Invoice ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-noir-900">
                        {inv.Invoice_ID}
                      </td>

                      {/* Guest & Reservation */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-noir-900">{inv.Guest_Name}</div>
                        <div className="text-[11px] text-sand-600 font-mono">Res: {inv.Reservation_ID}</div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-4 text-sand-700">
                        {issueDateFormatted}
                      </td>

                      {/* Itemized summary */}
                      <td className="py-3.5 px-4 text-sand-700">
                        <div>Room: ₹{Number(inv.Total_Charges || 0).toLocaleString()}</div>
                        <div className="text-[10px] text-sand-500">
                          Tax: +₹{Number(inv.Tax_Amount || 0).toLocaleString()} &bull; Disc: -₹{Number(inv.Discount || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Net Payable */}
                      <td className="py-3.5 px-4">
                        <div className="font-serif font-bold text-sm text-noir-950">
                          ₹{Number(inv.Net_Payable || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 font-medium text-sand-800">
                          <CreditCard className="w-3.5 h-3.5 text-sand-600" />
                          <span>{inv.Payment_Method || 'Credit Card'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {inv.Payment_Status || 'Completed'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-1.5 bg-sand-200/80 hover:bg-sand-300 text-noir-900 rounded-lg text-xs font-semibold transition-all border border-sand-300 inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Folio</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-sand-100 border border-sand-300 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="text-center border-b border-sand-300 pb-5 mb-5">
              <span className="text-[10px] tracking-[0.25em] uppercase text-sand-600 font-semibold block mb-1">
                Official Guest Folio
              </span>
              <h2 className="text-2xl font-serif text-noir-950 font-normal">
                The Grand Girvan Palace
              </h2>
              <p className="text-xs text-sand-600 mt-0.5">
                Invoice Reference: <span className="font-mono font-semibold text-noir-900">{selectedInvoice.Invoice_ID}</span>
              </p>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between border-b border-sand-200/80 pb-2">
                <span className="text-sand-600">Guest Name</span>
                <span className="font-semibold text-noir-900">{selectedInvoice.Guest_Name}</span>
              </div>
              <div className="flex justify-between border-b border-sand-200/80 pb-2">
                <span className="text-sand-600">Guest Email</span>
                <span className="text-noir-900">{selectedInvoice.Guest_Email}</span>
              </div>
              <div className="flex justify-between border-b border-sand-200/80 pb-2">
                <span className="text-sand-600">Reservation Reference</span>
                <span className="font-mono font-semibold text-noir-900">{selectedInvoice.Reservation_ID}</span>
              </div>
              <div className="flex justify-between border-b border-sand-200/80 pb-2">
                <span className="text-sand-600">Stay Duration</span>
                <span className="text-noir-900">
                  {new Date(selectedInvoice.Check_In_Date).toLocaleDateString()} &rarr; {new Date(selectedInvoice.Check_Out_Date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-sand-200/80 pb-2">
                <span className="text-sand-600">Room Accommodation Subtotal</span>
                <span className="font-semibold text-noir-900">₹{Number(selectedInvoice.Total_Charges || 0).toLocaleString()}</span>
              </div>
              {Number(selectedInvoice.Discount || 0) > 0 && (
                <div className="flex justify-between border-b border-sand-200/80 pb-2 text-emerald-800">
                  <span>Promotional Discount</span>
                  <span>- ₹{Number(selectedInvoice.Discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-sand-200/80 pb-2">
                <span className="text-sand-600">Luxury GST &amp; Taxes (12%)</span>
                <span className="text-noir-900">+ ₹{Number(selectedInvoice.Tax_Amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-noir-950 font-serif">
                <span>Total Net Settled</span>
                <span>₹{Number(selectedInvoice.Net_Payable || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 text-[11px] text-sand-600">
                <span>Settled Via</span>
                <span className="font-medium text-noir-900">{selectedInvoice.Payment_Method || 'Credit Card'} &bull; Status: {selectedInvoice.Payment_Status || 'Completed'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="w-full py-2.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
              >
                Close Folio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
