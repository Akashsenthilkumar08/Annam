/**
 * ANNAM – Food Donor Dashboard (donor.js)
 */

let selectedImageData = 'assets/images/marriage-feast.jpg';

document.addEventListener('DOMContentLoaded', () => {
  enforceDonorSession();
  setupAddDonationForm();
  setupImagePicker();
  renderDonorDashboard();
  setupFilterTabs();
});

function enforceDonorSession() {
  let user = getCurrentUser();
  if (!user || user.role !== 'Food Donor') {
    const users = getUsers();
    user = users.find(u => u.role === 'Food Donor') || {
      id: 'user-donor-1',
      name: 'Grand Chola Palace - Royal Wedding Hall',
      role: 'Food Donor',
      location: 'No. 42, GN Chetty Road, T. Nagar, Chennai',
      phone: '+91 98410 23456'
    };
    setCurrentUser(user);
  }

  // Populate donor info in UI
  const donorNameEl = document.getElementById('donor-name-display');
  const donorLocEl = document.getElementById('donor-location-display');
  if (donorNameEl) donorNameEl.textContent = user.name;
  if (donorLocEl) donorLocEl.textContent = user.location;

  // Pre-fill form addresses if empty
  const addrInput = document.getElementById('donation-address');
  const phoneInput = document.getElementById('donation-phone');
  if (addrInput && !addrInput.value) addrInput.value = user.location || '';
  if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';

  // Set default prep time and safe consumption deadline
  const now = new Date();
  const prepInput = document.getElementById('donation-preptime');
  const safeInput = document.getElementById('donation-safeuntil');
  if (prepInput) {
    prepInput.value = now.toISOString().slice(0, 16);
  }
  if (safeInput) {
    const inFiveHours = new Date(now.getTime() + 5 * 3600000);
    safeInput.value = inFiveHours.toISOString().slice(0, 16);
  }
}

function renderDonorDashboard() {
  const user = getCurrentUser();
  const allDonations = getDonations();
  const donorDonations = allDonations.filter(d => d.donorId === user.id || !d.donorId);

  // Compute statistics
  const totalDonations = donorDonations.length;
  const mealsDonated = donorDonations.reduce((sum, d) => sum + (Number(d.mealsCount) || 0), 0);
  const activeDonations = donorDonations.filter(d => ['Available', 'Volunteer Assigned', 'In Transit'].includes(d.status)).length;
  const completedDonations = donorDonations.filter(d => ['Delivered', 'Completed'].includes(d.status)).length;

  document.getElementById('stat-total-donations').textContent = totalDonations;
  document.getElementById('stat-meals-donated').textContent = mealsDonated.toLocaleString();
  document.getElementById('stat-active-donations').textContent = activeDonations;
  document.getElementById('stat-completed-donations').textContent = completedDonations;

  renderDonationCards(donorDonations);
}

function renderDonationCards(donations) {
  const container = document.getElementById('donor-donations-grid');
  if (!container) return;

  if (donations.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h4 class="empty-state-title">No Food Donations Listed Yet</h4>
        <p class="empty-state-text">You haven't listed any surplus meals. Click "Add Food Donation" to share surplus food and spread hope!</p>
        <button class="btn btn-primary btn-sm" onclick="openAddDonationModal()">+ Create Donation</button>
      </div>
    `;
    return;
  }

  container.innerHTML = donations.map(item => {
    const timeRem = getTimeRemaining(item.safeUntil);
    const isExpired = timeRem.total <= 0;
    const expiryText = isExpired
      ? `<span style="color:#DC2626; font-weight:700;">Expired</span>`
      : `<span style="color:${timeRem.hours < 2 ? '#DC2626' : 'var(--primary)'}; font-weight:600;">${timeRem.hours}h ${timeRem.minutes}m left</span>`;

    let statusClass = 'available';
    if (item.status === 'Volunteer Assigned') statusClass = 'assigned';
    if (item.status === 'In Transit') statusClass = 'in-transit';
    if (item.status === 'Delivered' || item.status === 'Completed') statusClass = 'delivered';

    return `
      <div class="food-card" data-status="${item.status}">
        <div class="food-card-img-wrap">
          <img src="${item.image || 'assets/images/marriage-feast.jpg'}" alt="${item.foodName}" class="food-card-img" onerror="this.src='assets/images/marriage-feast.jpg'"/>
          <span class="food-card-badge status-badge ${statusClass}">${item.status}</span>
          <span class="food-card-category">${item.category}</span>
        </div>
        <div class="food-card-body">
          <div style="font-size: 0.75rem; color: var(--text-light); margin-bottom: 4px; font-weight: 700;">ID: ${item.id}</div>
          <h4 class="food-card-title">${item.foodName}</h4>
          
          <div class="food-card-meta">
            <div class="food-meta-row">
              <strong>Quantity:</strong> <span>${item.quantity} (${item.mealsCount} meals)</span>
            </div>
            <div class="food-meta-row">
              <strong>Pickup:</strong> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${item.pickupAddress}</span>
            </div>
            <div class="food-meta-row">
              <strong>Safe Consumption:</strong> ${expiryText}
            </div>
            ${item.assignedVolunteerName ? `
              <div class="food-meta-row" style="color: var(--primary);">
                <strong>Volunteer:</strong> <span>${item.assignedVolunteerName}</span>
              </div>
            ` : ''}
            ${item.recipientNgoName ? `
              <div class="food-meta-row" style="color: #2563EB;">
                <strong>Recipient NGO:</strong> <span>${item.recipientNgoName}</span>
              </div>
            ` : ''}
          </div>

          <div class="food-card-footer">
            <a href="tracking.html?id=${item.id}" class="btn btn-outline btn-sm" style="flex:1; justify-content:center;">
              Track Delivery ➔
            </a>
            ${item.status === 'Available' ? `
              <button class="btn btn-ghost btn-sm" style="color:#DC2626;" onclick="cancelDonation('${item.id}')" title="Cancel this listing">
                ✕
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setupFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      const user = getCurrentUser();
      const allDonations = getDonations().filter(d => d.donorId === user.id || !d.donorId);

      if (filter === 'all') {
        renderDonationCards(allDonations);
      } else if (filter === 'active') {
        renderDonationCards(allDonations.filter(d => ['Available', 'Volunteer Assigned', 'In Transit'].includes(d.status)));
      } else if (filter === 'completed') {
        renderDonationCards(allDonations.filter(d => ['Delivered', 'Completed'].includes(d.status)));
      }
    });
  });
}

function setupImagePicker() {
  const fileInput = document.getElementById('donation-image-file');
  const preview = document.getElementById('image-preview');
  const presetButtons = document.querySelectorAll('.preset-thumb-btn');

  presetButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectedImageData = btn.getAttribute('data-src');
      if (preview) {
        preview.src = selectedImageData;
        preview.style.display = 'block';
      }
      presetButtons.forEach(b => b.style.borderColor = 'var(--border-subtle)');
      btn.style.borderColor = 'var(--primary)';
    });
  });

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          selectedImageData = event.target.result;
          if (preview) {
            preview.src = selectedImageData;
            preview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function setupAddDonationForm() {
  const form = document.getElementById('add-donation-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const foodName = document.getElementById('donation-name').value.trim();
    const description = document.getElementById('donation-desc').value.trim();
    const category = document.getElementById('donation-category').value;
    const quantity = document.getElementById('donation-quantity').value.trim();
    const mealsCount = parseInt(document.getElementById('donation-meals').value, 10) || 1;
    const prepTime = document.getElementById('donation-preptime').value;
    const safeUntil = document.getElementById('donation-safeuntil').value;
    const pickupAddress = document.getElementById('donation-address').value.trim();
    const contactNumber = document.getElementById('donation-phone').value.trim();

    if (!foodName || !quantity || !pickupAddress || !contactNumber) {
      showToast('Please fill in all mandatory donation fields.', 'error');
      return;
    }

    const user = getCurrentUser();
    const newDonationId = 'DON-' + Math.floor(100 + Math.random() * 900);

    const newDonation = {
      id: newDonationId,
      donorId: user ? user.id : 'user-donor-1',
      donorName: user ? user.name : 'Grand Chola Palace',
      donorPhone: contactNumber,
      foodName,
      category,
      description: description || 'Fresh, hygienic surplus meals prepared under sanitary standards.',
      quantity,
      mealsCount,
      prepTime: prepTime ? new Date(prepTime).toISOString() : new Date().toISOString(),
      safeUntil: safeUntil ? new Date(safeUntil).toISOString() : new Date(Date.now() + 5 * 3600000).toISOString(),
      pickupAddress,
      city: pickupAddress.includes('Bengaluru') ? 'Bengaluru' : (pickupAddress.includes('Coimbatore') ? 'Coimbatore' : 'Chennai'),
      contactNumber,
      image: selectedImageData || 'assets/images/marriage-feast.jpg',
      status: 'Available',
      currentStage: 1, // ALERT stage
      assignedVolunteerId: null,
      assignedVolunteerName: null,
      recipientNgoId: null,
      recipientNgoName: null,
      createdAt: new Date().toISOString(),
      safetyVerified: false,
      safetyDetails: null,
      deliveryConfirmedAt: null,
      recipientConfirmedAt: null
    };

    const donations = getDonations();
    donations.unshift(newDonation);
    saveDonations(donations);

    showToast(`Donation ${newDonationId} listed successfully! Nearby volunteers and NGOs have been alerted.`, 'success');

    // Close modal & reset
    closeAddDonationModal();
    form.reset();
    enforceDonorSession();
    renderDonorDashboard();
  });
}

function cancelDonation(id) {
  showConfirmModal('Cancel Donation', 'Are you sure you want to cancel this food listing?', () => {
    let donations = getDonations();
    donations = donations.filter(d => d.id !== id);
    saveDonations(donations);
    showToast('Donation removed.', 'info');
    renderDonorDashboard();
  });
}

function openAddDonationModal() {
  const modal = document.getElementById('add-donation-modal');
  if (modal) modal.classList.add('open');
}

function closeAddDonationModal() {
  const modal = document.getElementById('add-donation-modal');
  if (modal) modal.classList.remove('open');
}
