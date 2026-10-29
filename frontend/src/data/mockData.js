// Initial mock database directly aligned with sql/schema.sql
export const INITIAL_BRANCHES = [
  { Branch_ID: 'b-01', Location_Name: 'Maison Velour Cote d\'Azur', Address: '72 Boulevard de la Croisette, Cannes, France', Contact_Info: '+33 4 93 39 00 00' },
  { Branch_ID: 'b-02', Location_Name: 'Maison Velour Amalfi Coast', Address: 'Via dell\'Amore 14, Positano, Italy', Contact_Info: '+39 089 875 000' }
];

export const INITIAL_STAFF = [
  {
    Staff_ID: 'st-01',
    First_Name: 'Elena',
    Last_Name: 'Rostova',
    Email: 'manager@maisonvelour.com',
    Role: 'Manager',
    Branch_ID: 'b-01',
    Department_Managed: 'Executive Operations',
    Office_Number: 'Suite 401',
    Avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
  },
  {
    Staff_ID: 'st-02',
    First_Name: 'Julian',
    Last_Name: 'Mercier',
    Email: 'reception@maisonvelour.com',
    Role: 'Receptionist',
    Branch_ID: 'b-01',
    Shift_Timing: 'Morning (07:00 - 15:30)',
    Desk_Extension: '101',
    Avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250'
  },
  {
    Staff_ID: 'st-03',
    First_Name: 'Chloe',
    Last_Name: 'Dubois',
    Email: 'therapist@maisonvelour.com',
    Role: 'Therapist',
    Branch_ID: 'b-01',
    Specialty: 'Aromatherapy & Deep Tissue',
    Avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250'
  }
];

export const INITIAL_GUESTS = [
  { Guest_ID: 'g-01', First_Name: 'Alexander', Last_Name: 'Wright', Email: 'alex.wright@luxurytravel.com', Phone: '+1 (555) 234-5678', Loyalty_Points: 1420, Loyalty_Tier: 'Platinum', Special_Requests: 'High floor, feather-free pillows' },
  { Guest_ID: 'g-02', First_Name: 'Camilla', Last_Name: 'Laurent', Email: 'camilla@laurent-design.fr', Phone: '+33 6 12 34 56 78', Loyalty_Points: 850, Loyalty_Tier: 'Gold', Special_Requests: 'Champagne on arrival' },
  { Guest_ID: 'g-03', First_Name: 'Marcus', Last_Name: 'Vance', Email: 'mvance@investcorp.com', Phone: '+44 20 7946 0912', Loyalty_Points: 320, Loyalty_Tier: 'Silver', Special_Requests: 'Early check-in preferred' }
];

export const INITIAL_ROOMS = [
  { Room_ID: 'rm-101', Room_Number: '101', Branch_ID: 'b-01', RoomType_ID: 'rt-sig', TypeName: 'Signature Room', Rate: 420, Housekeeping_Status: 'Clean', Occupant: 'Alexander Wright', Status: 'Occupied' },
  { Room_ID: 'rm-102', Room_Number: '102', Branch_ID: 'b-01', RoomType_ID: 'rt-dlx', TypeName: 'Deluxe Room', Rate: 520, Housekeeping_Status: 'Cleaning In Progress', Occupant: null, Status: 'Available' },
  { Room_ID: 'rm-201', Room_Number: '201', Branch_ID: 'b-01', RoomType_ID: 'rt-ter', TypeName: 'Terrace Suite', Rate: 680, Housekeeping_Status: 'Inspected', Occupant: 'Camilla Laurent', Status: 'Occupied' },
  { Room_ID: 'rm-301', Room_Number: '301', Branch_ID: 'b-01', RoomType_ID: 'rt-mai', TypeName: 'Maison Suite', Rate: 940, Housekeeping_Status: 'Dirty', Occupant: null, Status: 'Available' },
  { Room_ID: 'rm-401', Room_Number: '401', Branch_ID: 'b-01', RoomType_ID: 'rt-res', TypeName: 'Residence Suite', Rate: 1180, Housekeeping_Status: 'Clean', Occupant: null, Status: 'Reserved' },
  { Room_ID: 'rm-402', Room_Number: '402', Branch_ID: 'b-01', RoomType_ID: 'rt-res', TypeName: 'Residence Suite', Rate: 1180, Housekeeping_Status: 'Clean', Occupant: 'Lord Sterling', Status: 'Occupied' }
];

export const INITIAL_RESERVATIONS = [
  {
    Reservation_ID: 'res-8841',
    Guest_ID: 'g-01',
    Guest_Name: 'Alexander Wright',
    Room_ID: 'rm-101',
    Room_Number: '101',
    Room_Type: 'Signature Room',
    Check_In_Date: '2026-10-28',
    Check_Out_Date: '2026-10-31',
    Actual_Check_In: '2026-10-28 14:15',
    Actual_Check_Out: null,
    Booking_Status: 'Checked-In',
    Total_Amount: 1260
  },
  {
    Reservation_ID: 'res-8842',
    Guest_ID: 'g-02',
    Guest_Name: 'Camilla Laurent',
    Room_ID: 'rm-201',
    Room_Number: '201',
    Room_Type: 'Terrace Suite',
    Check_In_Date: '2026-10-29',
    Check_Out_Date: '2026-11-03',
    Actual_Check_In: '2026-10-29 11:30',
    Actual_Check_Out: null,
    Booking_Status: 'Checked-In',
    Total_Amount: 3400
  },
  {
    Reservation_ID: 'res-8843',
    Guest_ID: 'g-03',
    Guest_Name: 'Marcus Vance',
    Room_ID: 'rm-401',
    Room_Number: '401',
    Room_Type: 'Residence Suite',
    Check_In_Date: '2026-11-01',
    Check_Out_Date: '2026-11-05',
    Actual_Check_In: null,
    Actual_Check_Out: null,
    Booking_Status: 'Confirmed',
    Total_Amount: 4720
  }
];

export const INITIAL_HOUSEKEEPING_TASKS = [
  { Task_ID: 'tsk-01', Room_ID: 'rm-301', Room_Number: '301', Assigned_Staff_ID: 'st-02', Task_Type: 'Deep Turnover Cleaning', Status: 'In Progress', Reported_Date: '2026-10-29' },
  { Task_ID: 'tsk-02', Room_ID: 'rm-102', Room_Number: '102', Assigned_Staff_ID: 'st-02', Task_Type: 'Linen Refresh & Restock', Status: 'Pending', Reported_Date: '2026-10-29' }
];
