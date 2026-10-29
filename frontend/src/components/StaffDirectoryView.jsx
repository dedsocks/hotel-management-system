import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building, ShieldCheck, Mail, Phone, Calendar, Award } from 'lucide-react';
import { INITIAL_STAFF } from '../data/mockData';

export default function StaffDirectoryView() {
  const { currentUser, switchUser } = useAuth();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="pb-6 border-b border-sand-300 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-sand-700 font-semibold mb-1">
            Personnel &bull; Role Hierarchy
          </div>
          <h1 className="text-3xl font-serif text-noir-950 font-normal">
            Hotel Staff &amp; Specializations
          </h1>
          <p className="text-sm text-sand-700 mt-0.5">
            Overview of on-duty staff, roles, and shift assignments across property departments.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-sand-600">Active Viewing Role:</span>
          <div className="text-sm font-semibold text-noir-900">{currentUser?.Role}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INITIAL_STAFF.map((staff) => {
          const isCurrent = currentUser?.Staff_ID === staff.Staff_ID;

          return (
            <div
              key={staff.Staff_ID}
              className={`bg-sand-50 border rounded-2xl p-6 transition-all relative ${
                isCurrent
                  ? 'border-noir-900 shadow-md ring-1 ring-noir-900'
                  : 'border-sand-300/80 shadow-sm hover:border-sand-400'
              }`}
            >
              {isCurrent && (
                <span className="absolute top-4 right-4 text-[10px] bg-noir-900 text-sand-50 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  You are logged in
                </span>
              )}

              <div className="flex items-center gap-4 mb-4">
                <img
                  src={staff.Avatar}
                  alt={staff.First_Name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-sand-300"
                />
                <div>
                  <h3 className="text-lg font-serif font-medium text-noir-950">
                    {staff.First_Name} {staff.Last_Name}
                  </h3>
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-sand-200 text-noir-850 mt-1">
                    {staff.Role}
                  </span>
                </div>
              </div>

              {/* Specialization Details directly from schema */}
              <div className="space-y-2.5 text-xs text-sand-800 border-t border-sand-200 pt-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-sand-600" />
                  <span>{staff.Email}</span>
                </div>

                {staff.Role === 'Manager' && (
                  <>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
                      <span>Dept: <strong>{staff.Department_Managed}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-sand-600" />
                      <span>Office: {staff.Office_Number}</span>
                    </div>
                  </>
                )}

                {staff.Role === 'Receptionist' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-accent-gold" />
                      <span>Shift: {staff.Shift_Timing}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-sand-600" />
                      <span>Extension: #{staff.Desk_Extension}</span>
                    </div>
                  </>
                )}

                {staff.Role === 'Therapist' && (
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-accent-gold" />
                    <span>Specialty: {staff.Specialty}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-sand-200">
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => switchUser(staff.Staff_ID)}
                  className={`w-full py-2 rounded-lg text-xs font-medium tracking-wider uppercase transition-all ${
                    isCurrent
                      ? 'bg-sand-200 text-sand-500 cursor-default'
                      : 'bg-sand-100 hover:bg-noir-900 hover:text-sand-50 text-noir-900 border border-sand-300'
                  }`}
                >
                  {isCurrent ? 'Current Session' : `Switch to ${staff.First_Name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
