// Initial mock database directly aligned with sql/schema.sql
export const INITIAL_BRANCHES = [
  { 
    Branch_ID: 'b-01', 
    Location_Name: 'The Grand Girvan Palace • Coastal Estate', 
    Address: '1 Girvan Palace Way, Ayrshire Coast, Scotland', 
    Contact_Info: '+44 1465 710000',
    Image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
    Tagline: 'Regal coastal palace surrounded by private cliffs and manicured royal gardens'
  },
  { 
    Branch_ID: 'b-02', 
    Location_Name: 'The Grand Girvan Palace • Lake Pavilion', 
    Address: 'Via Regina 42, Lake Como, Italy', 
    Contact_Info: '+39 031 950 000',
    Image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200',
    Tagline: 'Historic lakeside villa with private boat moorings and terraced vineyards'
  },
  { 
    Branch_ID: 'b-03', 
    Location_Name: 'The Grand Girvan Palace • Highland Sanctuary', 
    Address: 'Loch Fyne Highlands, Scotland', 
    Contact_Info: '+44 1499 300000',
    Image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
    Tagline: 'Majestic castle sanctuary featuring private lochside lodges and thermal spas'
  }
];

export const INITIAL_STAFF = [
  {
    Staff_ID: 'st-01',
    First_Name: 'Elena',
    Last_Name: 'Rostova',
    Email: 'manager@grandgirvanpalace.com',
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
    Email: 'reception@grandgirvanpalace.com',
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
    Email: 'therapist@grandgirvanpalace.com',
    Role: 'Therapist',
    Branch_ID: 'b-01',
    Specialty: 'Aromatherapy & Deep Tissue',
    Avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250'
  }
];

export const INITIAL_GUESTS = [
  { 
    Guest_ID: 'g-01', 
    First_Name: 'Alexander', 
    Last_Name: 'Wright', 
    Email: 'alex.wright@luxurytravel.com', 
    Password: 'password123',
    Phone: '+1 (555) 234-5678', 
    Loyalty_Points: 1420, 
    Loyalty_Tier: 'Platinum', 
    Account_Status: 'Active',
    Special_Requests: 'High floor, feather-free pillows',
    Avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  { 
    Guest_ID: 'g-02', 
    First_Name: 'Camilla', 
    Last_Name: 'Laurent', 
    Email: 'camilla@laurent-design.fr', 
    Password: 'password123',
    Phone: '+33 6 12 34 56 78', 
    Loyalty_Points: 850, 
    Loyalty_Tier: 'Gold', 
    Account_Status: 'Active',
    Special_Requests: 'Champagne on arrival',
    Avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'
  },
  { 
    Guest_ID: 'g-03', 
    First_Name: 'Marcus', 
    Last_Name: 'Vance', 
    Email: 'mvance@investcorp.com', 
    Password: 'password123',
    Phone: '+44 20 7946 0912', 
    Loyalty_Points: 320, 
    Loyalty_Tier: 'Silver', 
    Account_Status: 'Active',
    Special_Requests: 'Early check-in preferred',
    Avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
  }
];

export const INITIAL_ROOMS = [
  { 
    Room_ID: 'rm-101', 
    Room_Number: '101', 
    Branch_ID: 'b-01', 
    RoomType_ID: 'rt-sig', 
    TypeName: 'Signature Room', 
    Rate: 18500, 
    Housekeeping_Status: 'Clean', 
    Occupant: 'Alexander Wright', 
    Status: 'Occupied',
    Image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800',
    Specs: '38 m² • King Bed • Ocean View'
  },
  { 
    Room_ID: 'rm-102', 
    Room_Number: '102', 
    Branch_ID: 'b-01', 
    RoomType_ID: 'rt-dlx', 
    TypeName: 'Deluxe Room', 
    Rate: 24500, 
    Housekeeping_Status: 'Cleaning In Progress', 
    Occupant: null, 
    Status: 'Available',
    Image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=800',
    Specs: '48 m² • Private Balcony • Marble Bath'
  },
  { 
    Room_ID: 'rm-201', 
    Room_Number: '201', 
    Branch_ID: 'b-01', 
    RoomType_ID: 'rt-ter', 
    TypeName: 'Terrace Suite', 
    Rate: 36000, 
    Housekeeping_Status: 'Inspected', 
    Occupant: 'Camilla Laurent', 
    Status: 'Occupied',
    Image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=800',
    Specs: '65 m² • Sun Deck • Solarium'
  },
  { 
    Room_ID: 'rm-301', 
    Room_Number: '301', 
    Branch_ID: 'b-01', 
    RoomType_ID: 'rt-mai', 
    TypeName: 'Palace Suite', 
    Rate: 52000, 
    Housekeeping_Status: 'Dirty', 
    Occupant: null, 
    Status: 'Available',
    Image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
    Specs: '85 m² • Panoramic Lounge • Royal Butler Service'
  },
  { 
    Room_ID: 'rm-401', 
    Room_Number: '401', 
    Branch_ID: 'b-01', 
    RoomType_ID: 'rt-res', 
    TypeName: 'Royal Residence Suite', 
    Rate: 85000, 
    Housekeeping_Status: 'Clean', 
    Occupant: null, 
    Status: 'Reserved',
    Image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800',
    Specs: '120 m² • 2 Bedrooms • Private Plunge Pool'
  },
  { 
    Room_ID: 'rm-402', 
    Room_Number: '402', 
    Branch_ID: 'b-01', 
    RoomType_ID: 'rt-res', 
    TypeName: 'Royal Residence Suite', 
    Rate: 85000, 
    Housekeeping_Status: 'Clean', 
    Occupant: 'Lord Sterling', 
    Status: 'Occupied',
    Image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
    Specs: '120 m² • Sunset Vista • Royal Fireplace'
  }
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
    Total_Amount: 55500
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
    Total_Amount: 180000
  },
  {
    Reservation_ID: 'res-8843',
    Guest_ID: 'g-03',
    Guest_Name: 'Marcus Vance',
    Room_ID: 'rm-401',
    Room_Number: '401',
    Room_Type: 'Royal Residence Suite',
    Check_In_Date: '2026-11-01',
    Check_Out_Date: '2026-11-05',
    Actual_Check_In: null,
    Actual_Check_Out: null,
    Booking_Status: 'Confirmed',
    Total_Amount: 340000
  }
];

export const INITIAL_HOUSEKEEPING_TASKS = [
  { Task_ID: 'tsk-01', Room_ID: 'rm-301', Room_Number: '301', Assigned_Staff_ID: 'st-02', Task_Type: 'Deep Turnover Cleaning', Status: 'In Progress', Reported_Date: '2026-10-29' },
  { Task_ID: 'tsk-02', Room_ID: 'rm-102', Room_Number: '102', Assigned_Staff_ID: 'st-02', Task_Type: 'Linen Refresh & Restock', Status: 'Pending', Reported_Date: '2026-10-29' }
];

export const INITIAL_EXPERIENCES = [
  {
    id: 'exp-1',
    title: 'Vintage Cellar & Sommelier Tastings',
    category: 'Epicurean & Wine',
    tag: 'Sommelier Tour',
    duration: '2.5 Hours',
    groupSize: 'Up to 6 Guests',
    price: '₹14,500 / person',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1000',
    description: 'Descend into our 18th-century subterranean stone vault. Sample rare vintages guided by our head sommelier, paired with artisanal highland cheeses and cured delicacies.'
  },
  {
    id: 'exp-2',
    title: 'Ayrshire Twilight Catamaran Charter',
    category: 'Maritime Adventure',
    tag: 'Private Charter',
    duration: '3.5 Hours',
    groupSize: 'Private Group (1-8)',
    price: '₹38,000 / charter',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1000',
    description: 'Set sail along the dramatic Ayrshire cliffs as the evening sun descends behind Ailsa Craig. Includes chilled Laurent-Perrier champagne, canapés, and heated deck blankets.'
  },
  {
    id: 'exp-3',
    title: 'The Chef’s Botanical Atrium',
    category: 'Culinary Masterclass',
    tag: 'Fine Dining',
    duration: '3 Hours',
    groupSize: '8 Guests Max',
    price: '₹18,500 / person',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1000',
    description: 'An intimate seven-course tasting journey set inside our glass botanical conservatory. Ingredients are harvested daily from palace kitchen gardens and local coastal purveyors.'
  },
  {
    id: 'exp-4',
    title: 'Loch & Estate Falconry Walk',
    category: 'Heritage Tradition',
    tag: 'Estate Exclusive',
    duration: '2 Hours',
    groupSize: 'Up to 4 Guests',
    price: '₹12,000 / person',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=1000',
    description: 'Experience the noble art of falconry on the palace moors. Handle Harris hawks, golden falcons, and barn owls under the mentorship of our resident master falconer.'
  },
  {
    id: 'exp-5',
    title: 'Championship Seaside Links Golf',
    category: 'Sport & Leisure',
    tag: 'Palace Greens',
    duration: '4 Hours',
    groupSize: '1 - 4 Players',
    price: '₹22,000 / round',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1000',
    description: 'Tee off along the rugged coastline with panoramic views of the Irish Sea. Includes private caddie service, Callaway club hire, and post-round clubhouse afternoon tea.'
  },
  {
    id: 'exp-6',
    title: 'Midnight Stargazing & Outdoor Firepit',
    category: 'Night Sanctuary',
    tag: 'Dark Sky Certified',
    duration: '2 Hours',
    groupSize: 'Couples / Small Groups',
    price: '₹9,500 / couple',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1000',
    description: 'Recline on shearling loungers by roaring stone firepits in Scotland’s darkest skies. Equipped with high-power brass telescopes, single-malt scotch, and hot spiced cocoa.'
  }
];
