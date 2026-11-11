/**
 * ANNAM – Volunteer Dashboard & Food Safety Module (volunteer.js)
 */

let activeSafetyDonationId = null;

document.addEventListener('DOMContentLoaded', () => {
  enforceVolunteerSession();
  renderVolunteerDashboard();
  setupVolunteerTabs();
});

function enforceVolunteerSession() {
  let user = getCurrentUser();
  if (!user || user.role !== 'Volunteer') {
    const users = getUsers();
    user = users.find(u => u.role === 'Volunteer') || {
      id: 'user-vol-1',
      name: 'Kavitha Ramanathan',
      role: 'Volunteer',
      phone: '+91 97890 12345',
      location: 'Chennai Central Zone'
    };
    setCurrentUser(user);
  }

  const volNameEl = document.getElementById('volunteer-name-display');
  const volLocEl = document.getElementById('volunteer-location-display');
  if (volNameEl) volNameEl.textContent = user.name;
  if (volLocEl) volLocEl.textContent = user.location || 'Active Dispatch Volunteer';
}

function renderVolunteerDashboard() {
  const user = getCurrentUser();
  const allDonations = getDonations();

  // Filter volunteer's tasks
  const myPickups = allDonations.filter(d => d.assignedVolunteerId === user.id);
  const activeTasks = myPickups.filter(d => ['Volunteer Assigned', 'In Transit'].includes(d.status));
  const completedDeliveries = myPickups.filter(d => ['Delivered', 'Completed'].includes(d.status));
  const mealsDelivered = completedDeliveries.reduce((sum, d) => sum + (Number(d.mealsCount) || 0), 0);

  // Available donations (not yet accepted by any volunteer)
  const availableDonations = allDonations.filter(d => d.status === 'Available');

  // Update KPI counters
  document.getElementById('stat-pickups-accepted').textContent = myPickups.length;
  document.getElementById('stat-meals-delivered').textContent = mealsDelivered.toLocaleString();
  document.getElementById('stat-active-tasks').textContent = activeTasks.length;
  document.getElementById('stat-completed-deliveries').textContent = completedDeliveries.length;

  renderAvailableDonations(availableDonations);
  renderMyPickups(activeTasks);
  renderCompletedDeliveries(completedDeliveries);
}

function renderAvailableDonations(availableList) {
  const container = document.getElementById('available-donations-grid');
  if (!container) return;

  if (availableList.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <h4 class="empty-state-title">No Pending Food Donations</h4>
        <p class="empty-state-text">Great news! All available surplus meals in your area have been assigned to volunteers.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = availableList.map(item => {
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
              <strong>From:</strong> <span>${item.donorName}</span>
            </div>
            <div class="food-meta-row">
              <strong>Pickup Address:</strong> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${item.pickupAddress}</span>
            </div>
            <div class="food-meta-row">
              <strong>Prepared:</strong> <span>${formatDateTime(item.prepTime)}</span>
            </div>
            <div class="food-meta-row">
              <strong>Safe Until:</strong> ${expiryText}
            </div>
            <div class="food-meta-row">
              <strong>Meals:</strong> <span>${item.mealsCount} meals (${item.quantity})</span>
            </div>
          </div>

          <div class="food-card-footer">
            <button class="btn btn-primary btn-sm" style="width: 100%; justify-content:center;" onclick="acceptPickup('${item.id}')">
              Accept Pickup ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function acceptPickup(donationId) {
  const user = getCurrentUser();
  let donations = getDonations();
  const donation = donations.find(d => d.id === donationId);

  if (!donation) {
    showToast('Donation not found', 'error');
    return;
  }

  showConfirmModal('Accept Food Pickup', `Are you ready to commit to picking up "${donation.foodName}" from ${donation.donorName}?`, () => {
    donation.assignedVolunteerId = user.id;
    donation.assignedVolunteerName = user.name;
    donation.status = 'Volunteer Assigned';
    donation.currentStage = 2; // MATCH stage

    saveDonations(donations);
    showToast(`Pickup accepted for ${donation.id}! Moved to "My Pickups".`, 'success');
    renderVolunteerDashboard();

    // Switch tab to My Pickups
    const myPickupsTab = document.querySelector('[data-vol-tab="pickups"]');
    if (myPickupsTab) myPickupsTab.click();
  });
}

function renderMyPickups(pickups) {
  const container = document.getElementById('my-pickups-grid');
  if (!container) return;

  if (pickups.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19"/>
          <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
        </svg>
        <h4 class="empty-state-title">No Active Tasks</h4>
        <p class="empty-state-text">Check "Available Donations" above to accept a food rescue task in your community.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pickups.map(item => {
    const isVerified = item.safetyVerified;
    const isInTransit = item.status === 'In Transit';

    return `
      <div class="card" style="padding: 24px; border: 1.5px solid ${isVerified ? 'var(--primary-border)' : '#FDE68A'};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 16px; gap: 12px; flex-wrap: wrap;">
          <div>
            <span class="status-badge ${isInTransit ? 'in-transit' : 'assigned'}" style="margin-bottom: 6px;">${item.status}</span>
            <h3 style="font-size: 1.25rem; font-weight:800; color:var(--text-main);">${item.foodName}</h3>
            <span style="font-size: 0.8125rem; color:var(--text-light); font-weight: 700;">ID: ${item.id} · ${item.quantity} (${item.mealsCount} Meals)</span>
          </div>
          <div style="text-align: right;">
            <a href="tracking.html?id=${item.id}" class="btn btn-outline btn-sm">View Live Tracker ➔</a>
          </div>
        </div>

        <!-- Food Safety Banner -->
        <div style="background: ${isVerified ? 'var(--primary-light)' : '#FEF3C7'}; border: 1px solid ${isVerified ? 'var(--primary-border)' : '#FCD34D'}; border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap: 8px;">
            <div style="display:flex; align-items:center; gap: 8px; font-size: 0.875rem; font-weight: 700; color: ${isVerified ? 'var(--primary)' : '#92400E'};">
              <span>${isVerified ? '🛡️ Food Safety Verified' : '⚠️ Food Safety Verification Required'}</span>
            </div>
            ${isVerified ? `
              <span style="font-size: 0.75rem; color: var(--primary);">By ${item.safetyDetails?.verifiedBy || 'Volunteer'}</span>
            ` : `
              <button class="btn btn-sm btn-secondary" onclick="openSafetyModal('${item.id}')">Perform Safety Check</button>
            `}
          </div>
          ${!isVerified ? `
            <p style="font-size: 0.75rem; color: #78350F; margin-top: 6px;">
              Food safety protocol requires a physical check of packaging, odor/appearance, and storage conditions before dispatch.
            </p>
          ` : ''}
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.875rem; margin-bottom: 20px; background: var(--bg-card-subtle); padding: 16px; border-radius: var(--radius-md);">
          <div>
            <div style="font-size: 0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Pickup Point</div>
            <div style="font-weight:700; color:var(--text-main);">${item.donorName}</div>
            <div style="color:var(--text-muted); font-size: 0.8125rem;">${item.pickupAddress}</div>
            <div style="color:var(--primary); font-size: 0.8125rem; font-weight:600; margin-top:4px;">📞 ${item.donorPhone || item.contactNumber}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Delivery Destination</div>
            <div style="font-weight:700; color:var(--text-main);">${item.recipientNgoName || 'Pending NGO Allocation'}</div>
            <div style="color:var(--text-muted); font-size: 0.8125rem;">${item.recipientNgoName ? 'Shelter Food Distribution Center' : 'Will be automatically routed or requested'}</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; gap: 12px; justify-content:flex-end; flex-wrap: wrap;">
          ${!isInTransit ? `
            <button class="btn btn-primary" onclick="confirmPickup('${item.id}')" ${!isVerified ? 'disabled title="Complete food safety checklist first"' : ''}>
              📦 Confirm Pickup & Start Transit
            </button>
          ` : `
            <button class="btn btn-secondary" onclick="completeDelivery('${item.id}')">
              ✅ Complete Delivery at Shelter
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function renderCompletedDeliveries(completed) {
  const container = document.getElementById('completed-deliveries-grid');
  if (!container) return;

  if (completed.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h4 class="empty-state-title">No Deliveries Completed Yet</h4>
        <p class="empty-state-text">Your completed food drop-offs will show here with digital receipts and recipient acknowledgments.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = completed.map(item => `
    <div class="card" style="padding: 20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
        <span class="status-badge delivered">Delivered</span>
        <span class="tabular-nums" style="font-size: 0.8125rem; color:var(--text-muted);">${formatDateTime(item.deliveryConfirmedAt || item.createdAt)}</span>
      </div>
      <h4 style="font-size: 1.125rem; font-weight:800; color:var(--text-main); margin-bottom: 8px;">${item.foodName}</h4>
      <p style="font-size: 0.875rem; color:var(--text-muted); margin-bottom: 12px;">
        Delivered <strong>${item.mealsCount} meals</strong> from ${item.donorName} to ${item.recipientNgoName || 'Community Shelter'}.
      </p>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
        <span style="font-size: 0.75rem; color:var(--primary); font-weight:700;">✓ Food Safety Passed</span>
        <a href="tracking.html?id=${item.id}" class="btn btn-ghost btn-sm">Audit Receipt ➔</a>
      </div>
    </div>
  `).join('');
}

/* Food Safety Verification Modal & Logic */
function openSafetyModal(donationId) {
  activeSafetyDonationId = donationId;
  const modal = document.getElementById('safety-modal');
  const don = getDonations().find(d => d.id === donationId);
  if (!modal || !don) return;

  document.getElementById('safety-food-title').textContent = don.foodName;
  document.getElementById('safety-food-id').textContent = don.id;
  document.getElementById('safety-prep-time').textContent = formatDateTime(don.prepTime);
  document.getElementById('safety-safe-until').textContent = formatDateTime(don.safeUntil);

  // Reset checkboxes
  document.querySelectorAll('.safety-checkbox').forEach(cb => cb.checked = false);
  document.getElementById('safety-temp-input').value = '65';
  document.getElementById('safety-notes-input').value = 'All 5 sanitary and thermal criteria physically inspected and approved.';

  modal.classList.add('open');
}

function closeSafetyModal() {
  const modal = document.getElementById('safety-modal');
  if (modal) modal.classList.remove('open');
  activeSafetyDonationId = null;
}

function submitSafetyVerification(isApproved) {
  if (!activeSafetyDonationId) return;

  const user = getCurrentUser();
  let donations = getDonations();
  const don = donations.find(d => d.id === activeSafetyDonationId);
  if (!don) return;

  if (isApproved) {
    const checks = document.querySelectorAll('.safety-checkbox');
    const allChecked = Array.from(checks).every(cb => cb.checked);
    if (!allChecked) {
      showToast('Mandatory: All 5 safety checklist points must be verified and checked.', 'error');
      return;
    }

    const temp = document.getElementById('safety-temp-input').value;
    const notes = document.getElementById('safety-notes-input').value;

    don.safetyVerified = true;
    don.currentStage = 3; // SAFETY CHECK passed
    don.safetyDetails = {
      status: 'Verified',
      verifiedBy: user ? user.name : 'Authorized Volunteer Inspector',
      verifiedAt: new Date().toISOString(),
      temperature: temp ? `${temp}°C` : 'Optimal',
      notes: notes || 'Hygienic and packaging integrity verified.'
    };

    saveDonations(donations);
    showToast(`Food Safety verified successfully for ${don.id}! Ready for pickup.`, 'success');
  } else {
    // Rejected
    don.safetyVerified = false;
    don.status = 'Rejected';
    don.currentStage = 1;
    don.safetyDetails = {
      status: 'Rejected',
      verifiedBy: user ? user.name : 'Authorized Volunteer Inspector',
      verifiedAt: new Date().toISOString(),
      notes: 'Food failed physical safety inspection (packaging leak or temperature risk).'
    };

    saveDonations(donations);
    showToast(`Donation ${don.id} marked as Rejected due to safety non-compliance.`, 'error');
  }

  closeSafetyModal();
  renderVolunteerDashboard();
}

function confirmPickup(donationId) {
  let donations = getDonations();
  const don = donations.find(d => d.id === donationId);
  if (!don) return;

  if (!don.safetyVerified) {
    showToast('Cannot proceed: Food safety inspection must be completed and verified first.', 'error');
    return;
  }

  showConfirmModal('Confirm Pickup', `Have you collected the meal packets from "${don.donorName}" and are departing towards the recipient?`, () => {
    don.status = 'In Transit';
    don.currentStage = 4; // DELIVER stage
    don.pickedUpAt = new Date().toISOString();

    saveDonations(donations);
    showToast(`Transit started for ${don.id}! Real-time tracking updated.`, 'success');
    renderVolunteerDashboard();
  });
}

function completeDelivery(donationId) {
  let donations = getDonations();
  const don = donations.find(d => d.id === donationId);
  if (!don) return;

  showConfirmModal('Complete Delivery', `Confirm delivery of "${don.foodName}" to ${don.recipientNgoName || 'Shelter'}?`, () => {
    don.status = 'Delivered';
    don.currentStage = 5; // TRANSPARENCY stage (awaiting recipient confirmation)
    don.deliveryConfirmedAt = new Date().toISOString();

    saveDonations(donations);
    showToast(`Delivery completed for ${don.id}! 🌟 Thank you for spreading hope!`, 'success');
    renderVolunteerDashboard();
  });
}

function setupVolunteerTabs() {
  const tabs = document.querySelectorAll('.vol-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-vol-tab');
      document.getElementById('view-available').style.display = target === 'available' ? 'block' : 'none';
      document.getElementById('view-pickups').style.display = target === 'pickups' ? 'block' : 'none';
      document.getElementById('view-completed').style.display = target === 'completed' ? 'block' : 'none';
    });
  });
}
