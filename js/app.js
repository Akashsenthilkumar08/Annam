/**
 * ANNAM – Share Food, Spread Hope
 * Core Application Engine & Data Store
 * Vanilla JavaScript (ES6)
 */

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'annam_users',
  CURRENT_USER: 'annam_current_user',
  DONATIONS: 'annam_donations',
  NOTIFICATIONS: 'annam_notifications',
  SAFETY_LOGS: 'annam_safety_logs'
};

// Seed Data for Hackathon Demonstration
const SEED_USERS = [
  // 3 Food Donors
  {
    id: 'user-donor-1',
    name: 'Grand Chola Palace - Royal Wedding Hall',
    email: 'donor@grandchola.com',
    password: 'demo',
    role: 'Food Donor',
    phone: '+91 98410 23456',
    location: 'No. 42, GN Chetty Road, T. Nagar, Chennai, Tamil Nadu',
    avatar: 'GC'
  },
  {
    id: 'user-donor-2',
    name: 'Saravana Heritage Hotel & Caterers',
    email: 'saravana@heritagehotel.in',
    password: 'demo',
    role: 'Food Donor',
    phone: '+91 94430 78901',
    location: '74, DB Road, R.S. Puram, Coimbatore, Tamil Nadu',
    avatar: 'SH'
  },
  {
    id: 'user-donor-3',
    name: 'Spice Garden Bistro & Banquets',
    email: 'events@spicegardenbistro.com',
    password: 'demo',
    role: 'Food Donor',
    phone: '+91 99001 54321',
    location: '100 Ft Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka',
    avatar: 'SG'
  },
  // 3 Volunteers
  {
    id: 'user-vol-1',
    name: 'Kavitha Ramanathan',
    email: 'volunteer@kavitha.org',
    password: 'demo',
    role: 'Volunteer',
    phone: '+91 97890 12345',
    location: 'Chennai Central - Anna Nagar Zone',
    avatar: 'KR',
    badge: 'Senior Food Courier'
  },
  {
    id: 'user-vol-2',
    name: 'Arjun Subramaniam',
    email: 'arjun@rescuevolunteer.in',
    password: 'demo',
    role: 'Volunteer',
    phone: '+91 98450 67890',
    location: 'Bengaluru East - Koramangala Zone',
    avatar: 'AS',
    badge: 'Rapid Responder'
  },
  {
    id: 'user-vol-3',
    name: 'Meera Krishnan',
    email: 'meera.k@foodhero.org',
    password: 'demo',
    role: 'Volunteer',
    phone: '+91 93600 45678',
    location: 'Coimbatore North - Gandhipuram Zone',
    avatar: 'MK',
    badge: 'Safety Specialist'
  },
  // 2 Partner NGOs
  {
    id: 'user-ngo-1',
    name: 'Akshaya Shelter & Orphanage Home',
    email: 'ngo@akshayashelter.org',
    password: 'demo',
    role: 'NGO / Recipient',
    phone: '+91 98401 98765',
    location: '18, Kutchery Road, Mylapore, Chennai, Tamil Nadu',
    avatar: 'AS',
    beneficiaries: 140
  },
  {
    id: 'user-ngo-2',
    name: 'Asha Deepam Community Kitchen & Senior Care',
    email: 'care@ashadeepamtrust.org',
    password: 'demo',
    role: 'NGO / Recipient',
    phone: '+91 98802 34567',
    location: '4th Block, 9th Cross, Jayanagar, Bengaluru, Karnataka',
    avatar: 'AD',
    beneficiaries: 220
  }
];

const SEED_DONATIONS = [
  {
    id: 'DON-101',
    donorId: 'user-donor-1',
    donorName: 'Grand Chola Palace - Royal Wedding Hall',
    donorPhone: '+91 98410 23456',
    foodName: '100 Vegetarian Meal Packets (Sambar Rice, Poriyal, Chapati, Payasam)',
    category: 'Cooked Meals',
    description: 'Fresh wedding banquet surplus prepared under sanitary conditions in steam kettles. Packed neatly in eco-friendly meal boxes.',
    quantity: '100 Packets',
    mealsCount: 100,
    prepTime: new Date(Date.now() - 2 * 3600000).toISOString(),
    safeUntil: new Date(Date.now() + 5 * 3600000).toISOString(),
    pickupAddress: 'Grand Chola Palace Banquet Hall, No. 42, GN Chetty Road, T. Nagar, Chennai',
    city: 'Chennai',
    contactNumber: '+91 98410 23456',
    image: 'assets/images/marriage-feast.jpg',
    status: 'Available', // Available -> Volunteer Assigned -> In Transit -> Delivered -> Completed
    currentStage: 1, // 1: ALERT, 2: MATCH, 3: SAFETY CHECK, 4: DELIVER, 5: TRANSPARENCY
    assignedVolunteerId: null,
    assignedVolunteerName: null,
    recipientNgoId: null,
    recipientNgoName: null,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    safetyVerified: false,
    safetyDetails: null,
    deliveryConfirmedAt: null,
    recipientConfirmedAt: null
  },
  {
    id: 'DON-102',
    donorId: 'user-donor-2',
    donorName: 'Saravana Heritage Hotel & Caterers',
    donorPhone: '+91 94430 78901',
    foodName: '50 Rice Meal Packets with Dal & Veg Curry',
    category: 'Cooked Meals',
    description: 'Surplus buffet meals packed hot in compartmentalized thermal containers.',
    quantity: '50 Packets',
    mealsCount: 50,
    prepTime: new Date(Date.now() - 3 * 3600000).toISOString(),
    safeUntil: new Date(Date.now() + 3 * 3600000).toISOString(),
    pickupAddress: '74, DB Road, R.S. Puram, Coimbatore',
    city: 'Coimbatore',
    contactNumber: '+91 94430 78901',
    image: 'assets/images/hero-food.jpg',
    status: 'Volunteer Assigned',
    currentStage: 2,
    assignedVolunteerId: 'user-vol-1',
    assignedVolunteerName: 'Kavitha Ramanathan',
    recipientNgoId: 'user-ngo-1',
    recipientNgoName: 'Akshaya Shelter & Orphanage Home',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    safetyVerified: false,
    safetyDetails: null,
    deliveryConfirmedAt: null,
    recipientConfirmedAt: null
  },
  {
    id: 'DON-103',
    donorId: 'user-donor-3',
    donorName: 'Spice Garden Bistro & Banquets',
    donorPhone: '+91 99001 54321',
    foodName: '30 Fresh Fruit Boxes (Mangoes, Apples, Bananas)',
    category: 'Fresh Produce',
    description: 'Clean whole fruit surplus from evening dessert catering and kitchen pantry.',
    quantity: '30 Crates',
    mealsCount: 90,
    prepTime: new Date(Date.now() - 5 * 3600000).toISOString(),
    safeUntil: new Date(Date.now() + 24 * 3600000).toISOString(),
    pickupAddress: '100 Ft Road, HAL 2nd Stage, Indiranagar, Bengaluru',
    city: 'Bengaluru',
    contactNumber: '+91 99001 54321',
    image: 'assets/images/fruit-produce.jpg',
    status: 'In Transit',
    currentStage: 4,
    assignedVolunteerId: 'user-vol-2',
    assignedVolunteerName: 'Arjun Subramaniam',
    recipientNgoId: 'user-ngo-2',
    recipientNgoName: 'Asha Deepam Community Kitchen',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    safetyVerified: true,
    safetyDetails: {
      verifiedBy: 'Arjun Subramaniam',
      verifiedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      packagingScore: 'Passed - Food Grade Wooden Crates',
      smellTempScore: 'Fresh - Whole Uncut Fruit Checked',
      notes: 'Certified safe for immediate distribution to community center.'
    },
    deliveryConfirmedAt: null,
    recipientConfirmedAt: null
  },
  {
    id: 'DON-104',
    donorId: 'user-donor-1',
    donorName: 'Grand Chola Palace - Royal Wedding Hall',
    donorPhone: '+91 98410 23456',
    foodName: '40 Savory & Sweet Snack Packets (Samosas, Idlis, Vadais)',
    category: 'Snacks',
    description: 'Evening tea break catering surplus from executive summit in Chennai.',
    quantity: '40 Boxes',
    mealsCount: 40,
    prepTime: new Date(Date.now() - 12 * 3600000).toISOString(),
    safeUntil: new Date(Date.now() - 2 * 3600000).toISOString(),
    pickupAddress: 'No. 42, GN Chetty Road, T. Nagar, Chennai',
    city: 'Chennai',
    contactNumber: '+91 98410 23456',
    image: 'assets/images/marriage-feast.jpg',
    status: 'Delivered',
    currentStage: 5,
    assignedVolunteerId: 'user-vol-1',
    assignedVolunteerName: 'Kavitha Ramanathan',
    recipientNgoId: 'user-ngo-1',
    recipientNgoName: 'Akshaya Shelter & Orphanage Home',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    safetyVerified: true,
    safetyDetails: {
      verifiedBy: 'Kavitha Ramanathan',
      verifiedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
      packagingScore: 'Sealed Foil Trays',
      smellTempScore: 'Warm 65°C - Passed',
      notes: 'Delivered promptly to children & elderly wing.'
    },
    deliveryConfirmedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    recipientConfirmedAt: new Date(Date.now() - 7 * 3600000).toISOString()
  },
  {
    id: 'DON-105',
    donorId: 'user-donor-3',
    donorName: 'Spice Garden Bistro & Banquets',
    donorPhone: '+91 99001 54321',
    foodName: '75 Fresh Lunch Packets (Pulao, Dal Makhani, Roti)',
    category: 'Cooked Meals',
    description: 'Corporate executive luncheon surplus. Unopened, steam table kept until packaged.',
    quantity: '75 Boxes',
    mealsCount: 75,
    prepTime: new Date(Date.now() - 1 * 3600000).toISOString(),
    safeUntil: new Date(Date.now() + 6 * 3600000).toISOString(),
    pickupAddress: '100 Ft Road, HAL 2nd Stage, Indiranagar, Bengaluru',
    city: 'Bengaluru',
    contactNumber: '+91 99001 54321',
    image: 'assets/images/ngo-distribution.jpg',
    status: 'Available',
    currentStage: 1,
    assignedVolunteerId: null,
    assignedVolunteerName: null,
    recipientNgoId: null,
    recipientNgoName: null,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    safetyVerified: false,
    safetyDetails: null,
    deliveryConfirmedAt: null,
    recipientConfirmedAt: null
  }
];

// Initialize Storage if empty or outdated
function initDatabase(forceReset = false) {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(SEED_DONATIONS));
  }
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default current user to Grand Chola Donor for instant testing
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
  }
}

// Get All Users
function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

// Save Users
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Get All Donations
function getDonations() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]');
}

// Save Donations
function saveDonations(donations) {
  localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
}

// Get Current Logged-in User
function getCurrentUser() {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

// Set Current User
function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Logout
function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// Switch Demo Persona for Hackathon Judges
function switchDemoPersona(roleKey) {
  const users = getUsers();
  let targetUser = null;
  if (roleKey === 'donor') targetUser = users.find(u => u.role === 'Food Donor');
  if (roleKey === 'volunteer') targetUser = users.find(u => u.role === 'Volunteer');
  if (roleKey === 'recipient' || roleKey === 'ngo') targetUser = users.find(u => u.role === 'NGO / Recipient');

  if (targetUser) {
    setCurrentUser(targetUser);
    showToast(`Switched persona to: ${targetUser.name} (${targetUser.role})`, 'success');
    setTimeout(() => {
      if (targetUser.role === 'Food Donor') window.location.href = 'donor.html';
      else if (targetUser.role === 'Volunteer') window.location.href = 'volunteer.html';
      else if (targetUser.role === 'NGO / Recipient') window.location.href = 'recipient.html';
    }, 400);
  }
}

// Reset Entire Database to Fresh Hackathon Seed State
function resetDemoData() {
  initDatabase(true);
  showToast('Demo data successfully reset to initial hackathon sample state!', 'success');
  setTimeout(() => {
    window.location.reload();
  }, 600);
}

// Toast Notification System
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Confirmation Dialog Modal Helper
function showConfirmModal(title, message, onConfirm) {
  let modal = document.getElementById('global-confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-confirm-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title" id="confirm-modal-title">Confirm Action</h3>
          <button class="modal-close-btn" onclick="closeConfirmModal()">&times;</button>
        </div>
        <div class="modal-body">
          <p id="confirm-modal-message" style="font-size: 0.9375rem; color: var(--text-main); line-height: 1.5;"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline btn-sm" onclick="closeConfirmModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" id="confirm-modal-btn">Proceed</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-message').textContent = message;

  const btn = document.getElementById('confirm-modal-btn');
  btn.onclick = () => {
    closeConfirmModal();
    if (typeof onConfirm === 'function') onConfirm();
  };

  modal.classList.add('open');
}

function closeConfirmModal() {
  const modal = document.getElementById('global-confirm-modal');
  if (modal) modal.classList.remove('open');
}

// Render Top Demo Persona Banner (Present on all pages for seamless hackathon grading)
function renderDemoBanner() {
  const user = getCurrentUser();
  const banner = document.createElement('div');
  banner.className = 'demo-banner';
  banner.innerHTML = `
    <div class="demo-banner-left">
      <span class="demo-badge">Hackathon Preview</span>
      <span>Active Session: <strong>${user ? user.name : 'Guest'}</strong> ${user ? `(${user.role})` : ''}</span>
    </div>
    <div class="demo-banner-roles">
      <span>Switch Persona:</span>
      <button class="demo-role-btn ${user && user.role === 'Food Donor' ? 'active' : ''}" onclick="switchDemoPersona('donor')">👨‍🍳 Food Donor</button>
      <button class="demo-role-btn ${user && user.role === 'Volunteer' ? 'active' : ''}" onclick="switchDemoPersona('volunteer')">🚴 Volunteer</button>
      <button class="demo-role-btn ${user && user.role === 'NGO / Recipient' ? 'active' : ''}" onclick="switchDemoPersona('recipient')">🏢 NGO</button>
      <button class="demo-reset-btn" onclick="resetDemoData()" title="Reset all LocalStorage state">↺ Reset Data</button>
    </div>
  `;
  document.body.insertBefore(banner, document.body.firstChild);
}

// Time remaining calculation helper
function getTimeRemaining(deadline) {
  const total = Date.parse(deadline) - Date.parse(new Date());
  const hours = Math.floor((total / (1000 * 60 * 60)));
  const minutes = Math.floor((total / 1000 / 60) % 60);
  return { total, hours, minutes };
}

// Format relative date or time
function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Generate inline SVG logo
function getAnnamLogoSvg(size = 40) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#EBF6EE" stroke="#228B45" stroke-width="3"/>
      <!-- Supportive Sharing Hands -->
      <path d="M22 64C22 64 34 76 50 76C66 76 78 64 78 64" stroke="#228B45" stroke-width="4" stroke-linecap="round"/>
      <!-- Nourishing Food Bowl -->
      <path d="M28 50C28 62 72 62 72 50C72 48 28 48 28 50Z" fill="#FF9F32"/>
      <ellipse cx="50" cy="48" rx="22" ry="5" fill="#E6851C"/>
      <!-- Steaming Nourishment Grain / Leaf -->
      <path d="M50 22C44 28 42 36 50 42C58 36 56 28 50 22Z" fill="#228B45"/>
      <path d="M38 28C34 32 34 38 40 42C44 38 43 32 38 28Z" fill="#2FC060"/>
      <path d="M62 28C66 32 66 38 60 42C56 38 57 32 62 28Z" fill="#2FC060"/>
    </svg>
  `;
}

// Mobile Hamburger Toggle
function setupNavHamburger() {
  const hamburger = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (hamburger && links) {
    hamburger.addEventListener('click', () => {
      links.classList.toggle('mobile-open');
    });
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  renderDemoBanner();
  setupNavHamburger();
});
