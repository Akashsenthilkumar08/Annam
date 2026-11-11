/**
 * ANNAM – NGO / Recipient Dashboard (recipient.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  enforceRecipientSession();
  renderRecipientDashboard();
  setupSearchAndFilters();
  setupRecipientTabs();
});

function enforceRecipientSession() {
  let user = getCurrentUser();
  if (!user || user.role !== 'NGO / Recipient') {
    const users = getUsers();
    user = users.find(u => u.role === 'NGO / Recipient') || {
      id: 'user-ngo-1',
      name: 'Akshaya Shelter & Orphanage Home',
      role: 'NGO / Recipient',
      phone: '+91 98401 98765',
      location: '18, Kutchery Road, Mylapore, Chennai, Tamil Nadu',
      beneficiaries: 140
    };
    setCurrentUser(user);
  }

  const ngoNameEl = document.getElementById('ngo-name-display');
  const ngoLocEl = document.getElementById('ngo-location-display');
  if (ngoNameEl) ngoNameEl.textContent = user.name;
  if (ngoLocEl) ngoLocEl.textContent = user.location || 'Verified Shelter Partner';
}

function renderRecipientDashboard() {
  const user = getCurrentUser();
  const allDonations = getDonations();

  // My NGO Requests
  const myRequests = allDonations.filter(d => d.recipientNgoId === user.id);
  const activeRequests = myRequests.filter(d => ['Volunteer Assigned', 'In Transit'].includes(d.status));
  const deliveredAwaitingConfirmation = myRequests.filter(d => d.status === 'Delivered');
  const receivedCompleted = myRequests.filter(d => d.status === 'Completed' || d.recipientConfirmedAt);
  const totalMealsReceived = [...receivedCompleted, ...deliveredAwaitingConfirmation].reduce((sum, d) => sum + (Number(d.mealsCount) || 0), 0);

  // Available Donations for Browsing (Available and not yet claimed by other NGO)
  const availableForRequest = allDonations.filter(d => d.status === 'Available' || (d.status === 'Volunteer Assigned' && !d.recipientNgoId));

  document.getElementById('stat-active-requests').textContent = myRequests.length;
  document.getElementById('stat-meals-received').textContent = totalMealsReceived.toLocaleString();
  document.getElementById('stat-available-browse').textContent = availableForRequest.length;
  document.getElementById('stat-completed-deliveries').textContent = receivedCompleted.length;

  filterAndRenderBrowseList();
  renderMyRequestsList(myRequests);
}

function filterAndRenderBrowseList() {
  const searchTerm = (document.getElementById('recipient-search')?.value || '').toLowerCase();
  const categoryFilter = document.getElementById('recipient-cat-filter')?.value || 'all';
  const locationFilter = document.getElementById('recipient-loc-filter')?.value || 'all';

  const allDonations = getDonations();
  const available = allDonations.filter(d => d.status === 'Available' || (d.status === 'Volunteer Assigned' && !d.recipientNgoId));

  const filtered = available.filter(item => {
    const matchesSearch = item.foodName.toLowerCase().includes(searchTerm) ||
                          item.description.toLowerCase().includes(searchTerm) ||
                          item.donorName.toLowerCase().includes(searchTerm);
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLoc = locationFilter === 'all' || (item.city && item.city.toLowerCase() === locationFilter.toLowerCase()) || (item.pickupAddress.toLowerCase().includes(locationFilter.toLowerCase()));

    return matchesSearch && matchesCat && matchesLoc;
  });

  const container = document.getElementById('browse-donations-grid');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h4 class="empty-state-title">No Matching Food Donations</h4>
        <p class="empty-state-text">Try resetting filters or checking back shortly. New donations from marriage halls and restaurants are alerted in real time.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const timeRem = getTimeRemaining(item.safeUntil);
    const isExpired = timeRem.total <= 0;
    const expiryText = isExpired
      ? `<span style="color:#DC2626; font-weight:700;">Expired</span>`
      : `<span style="color:${timeRem.hours < 2 ? '#DC2626' : 'var(--primary)'}; font-weight:600;">${timeRem.hours}h ${timeRem.minutes}m remaining</span>`;

    return `
      <div class="food-card">
        <div class="food-card-img-wrap">
          <img src="${item.image || 'assets/images/marriage-feast.jpg'}" alt="${item.foodName}" class="food-card-img" onerror="this.src='assets/images/marriage-feast.jpg'"/>
          <span class="food-card-badge status-badge available">Available</span>
          <span class="food-card-category">${item.category}</span>
        </div>
        <div class="food-card-body">
          <div style="font-size: 0.75rem; color: var(--text-light); margin-bottom: 4px; font-weight: 700;">ID: ${item.id}</div>
          <h4 class="food-card-title">${item.foodName}</h4>
          
          <div class="food-card-meta">
            <div class="food-meta-row">
              <strong>Source Donor:</strong> <span>${item.donorName}</span>
            </div>
            <div class="food-meta-row">
              <strong>Pickup Location:</strong> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${item.pickupAddress}</span>
            </div>
            <div class="food-meta-row">
              <strong>Quantity:</strong> <span>${item.quantity} (${item.mealsCount} meals)</span>
            </div>
            <div class="food-meta-row">
              <strong>Prepared At:</strong> <span>${formatDateTime(item.prepTime)}</span>
            </div>
            <div class="food-meta-row">
              <strong>Safe Consumption:</strong> ${expiryText}
            </div>
          </div>

          <div class="food-card-footer">
            <button class="btn btn-secondary btn-sm" style="width: 100%; justify-content:center;" onclick="requestFood('${item.id}')">
              Request Food for Shelter ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function requestFood(donationId) {
  const user = getCurrentUser();
  let donations = getDonations();
  const don = donations.find(d => d.id === donationId);

  if (!don) {
    showToast('Donation not found', 'error');
    return;
  }

  showConfirmModal('Request Food for Shelter', `Are you requesting "${don.foodName}" (${don.mealsCount} meals) for ${user.name}? Our dispatch engine will alert nearby volunteers for transit.`, () => {
    don.recipientNgoId = user.id;
    don.recipientNgoName = user.name;
    
    // If not yet assigned a volunteer, keep it ready or auto-match with active volunteer
    if (don.status === 'Available') {
      don.status = 'Volunteer Assigned';
      don.currentStage = 2; // MATCH stage
      // If no volunteer is assigned yet, match with nearest volunteer
      const users = getUsers();
      const volunteer = users.find(u => u.role === 'Volunteer');
      if (volunteer && !don.assignedVolunteerId) {
        don.assignedVolunteerId = volunteer.id;
        don.assignedVolunteerName = volunteer.name;
      }
    }

    saveDonations(donations);
    showToast(`Food requested successfully! Assigned to volunteer dispatch.`, 'success');
    renderRecipientDashboard();

    // Switch tab to My Requests
    const reqTab = document.querySelector('[data-ngo-tab="requests"]');
    if (reqTab) reqTab.click();
  });
}

function renderMyRequestsList(requests) {
  const container = document.getElementById('my-requests-grid');
  if (!container) return;

  if (requests.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
        <h4 class="empty-state-title">No Active Food Requests</h4>
        <p class="empty-state-text">Browse available surplus food listings from marriage halls and restaurants to request meals for your beneficiaries.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = requests.map(item => {
    const isDelivered = item.status === 'Delivered';
    const isCompleted = item.status === 'Completed' || Boolean(item.recipientConfirmedAt);

    let statusBadgeClass = 'assigned';
    if (item.status === 'In Transit') statusBadgeClass = 'in-transit';
    if (item.status === 'Delivered') statusBadgeClass = 'delivered';
    if (item.status === 'Completed') statusBadgeClass = 'delivered';

    return `
      <div class="card" style="padding: 24px; border: 1.5px solid ${isDelivered ? 'var(--primary)' : 'var(--border-subtle)'};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <span class="status-badge ${statusBadgeClass}" style="margin-bottom: 6px;">
              ${isCompleted ? '✓ Completed & Verified' : item.status}
            </span>
            <h3 style="font-size: 1.25rem; font-weight:800; color:var(--text-main);">${item.foodName}</h3>
            <span style="font-size: 0.8125rem; color:var(--text-light); font-weight:700;">ID: ${item.id} · ${item.quantity} (${item.mealsCount} Meals)</span>
          </div>
          <div>
            <a href="tracking.html?id=${item.id}" class="btn btn-outline btn-sm">Track Progress ➔</a>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.875rem; background: var(--bg-card-subtle); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
          <div>
            <div style="font-size: 0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Food Donor</div>
            <div style="font-weight:700; color:var(--text-main);">${item.donorName}</div>
            <div style="color:var(--text-muted); font-size: 0.8125rem;">${item.pickupAddress}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Assigned Courier</div>
            <div style="font-weight:700; color:var(--primary);">${item.assignedVolunteerName || 'Volunteer Dispatch Pending'}</div>
            <div style="color:var(--text-muted); font-size: 0.8125rem;">${item.safetyVerified ? '🛡️ Food Safety Verified' : 'Safety Check Scheduled'}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 12px;">
          <div style="font-size: 0.8125rem; color:var(--text-muted);">
            ${isCompleted ? `Verified & Distributed on ${formatDateTime(item.recipientConfirmedAt)}` : 'Status: In Coordination'}
          </div>

          ${isDelivered && !isCompleted ? `
            <button class="btn btn-primary" onclick="confirmReceived('${item.id}')">
              🤝 Confirm Received at Shelter
            </button>
          ` : ''}

          ${isCompleted ? `
            <span style="font-size: 0.875rem; font-weight: 700; color: var(--primary);">
              ✓ Nourishment Acknowledged
            </span>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function confirmReceived(donationId) {
  let donations = getDonations();
  const don = donations.find(d => d.id === donationId);
  if (!don) return;

  showConfirmModal('Confirm Food Receipt', `Confirm that ${don.mealsCount} meals of "${don.foodName}" have safely arrived at your shelter and are in sound, wholesome condition?`, () => {
    don.status = 'Completed';
    don.currentStage = 5; // TRANSPARENCY completed
    don.recipientConfirmedAt = new Date().toISOString();

    saveDonations(donations);
    showToast(`Wonderful! Receipt recorded for ${don.id}. Total meals saved counter updated!`, 'success');
    renderRecipientDashboard();
  });
}

function setupSearchAndFilters() {
  const searchInput = document.getElementById('recipient-search');
  const catFilter = document.getElementById('recipient-cat-filter');
  const locFilter = document.getElementById('recipient-loc-filter');

  if (searchInput) searchInput.addEventListener('input', filterAndRenderBrowseList);
  if (catFilter) catFilter.addEventListener('change', filterAndRenderBrowseList);
  if (locFilter) locFilter.addEventListener('change', filterAndRenderBrowseList);
}

function setupRecipientTabs() {
  const tabs = document.querySelectorAll('.ngo-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-ngo-tab');
      document.getElementById('view-browse').style.display = target === 'browse' ? 'block' : 'none';
      document.getElementById('view-requests').style.display = target === 'requests' ? 'block' : 'none';
    });
  });
}
