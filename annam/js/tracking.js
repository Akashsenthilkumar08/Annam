/**
 * ANNAM – 5-Stage Live Donation Tracking (tracking.js)
 * Stages: ALERT -> MATCH -> SAFETY CHECK -> DELIVER -> TRANSPARENCY
 */

document.addEventListener('DOMContentLoaded', () => {
  setupTrackingPage();
});

function setupTrackingPage() {
  const urlParams = new URLSearchParams(window.location.search);
  let requestedId = urlParams.get('id');

  const donations = getDonations();
  if (donations.length === 0) return;

  // Populate quick-select dropdown
  const selector = document.getElementById('tracking-select-donation');
  if (selector) {
    selector.innerHTML = donations.map(d => `
      <option value="${d.id}" ${requestedId === d.id ? 'selected' : ''}>
        ${d.id} – ${d.foodName.substring(0, 40)}... (${d.status})
      </option>
    `).join('');

    selector.addEventListener('change', (e) => {
      loadDonationDetails(e.target.value);
    });
  }

  // Fallback to first donation if requested ID not provided or not found
  if (!requestedId || !donations.some(d => d.id === requestedId)) {
    requestedId = donations[0].id;
  }

  loadDonationDetails(requestedId);

  // Setup search input
  const searchBtn = document.getElementById('tracking-search-btn');
  const searchInput = document.getElementById('tracking-search-id');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const q = searchInput.value.trim().toUpperCase();
      if (q) loadDonationDetails(q);
    });
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim().toUpperCase();
        if (q) loadDonationDetails(q);
      }
    });
  }
}

function loadDonationDetails(donationId) {
  const donations = getDonations();
  const item = donations.find(d => d.id === donationId);

  const container = document.getElementById('tracking-content-area');
  if (!container) return;

  if (!item) {
    container.innerHTML = `
      <div class="empty-state">
        <h4 class="empty-state-title">Donation ID Not Found</h4>
        <p class="empty-state-text">No donation matching "${donationId}". Please check the ID or pick from the dropdown list above.</p>
      </div>
    `;
    return;
  }

  // Update current URL without reloading
  history.replaceState(null, '', `tracking.html?id=${item.id}`);

  // Determine stage (1 to 5)
  // Stage 1: ALERT (Available)
  // Stage 2: MATCH (Volunteer Assigned / NGO requested)
  // Stage 3: SAFETY CHECK (Safety Verified)
  // Stage 4: DELIVER (In Transit)
  // Stage 5: TRANSPARENCY (Delivered / Completed)
  let stage = item.currentStage || 1;
  if (item.status === 'Available') stage = 1;
  else if (item.status === 'Volunteer Assigned' && !item.safetyVerified) stage = 2;
  else if (item.safetyVerified && item.status !== 'In Transit' && item.status !== 'Delivered' && item.status !== 'Completed') stage = 3;
  else if (item.status === 'In Transit') stage = 4;
  else if (item.status === 'Delivered' || item.status === 'Completed') stage = 5;

  const progressPercent = ((stage - 1) / 4) * 100;

  let statusClass = 'available';
  if (item.status === 'Volunteer Assigned') statusClass = 'assigned';
  if (item.status === 'In Transit') statusClass = 'in-transit';
  if (item.status === 'Delivered' || item.status === 'Completed') statusClass = 'delivered';

  container.innerHTML = `
    <!-- Top Summary Card -->
    <div class="card" style="margin-bottom: 24px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap: 16px; margin-bottom: 20px;">
        <div>
          <div style="display:flex; align-items:center; gap: 10px; margin-bottom: 8px;">
            <span class="status-badge ${statusClass}">${item.status}</span>
            <span class="tabular-nums" style="font-weight:800; color:var(--text-muted); font-size: 0.875rem;">ID: ${item.id}</span>
          </div>
          <h2 style="font-size: 1.625rem; font-weight:800; color:var(--text-main); margin-bottom: 6px;">${item.foodName}</h2>
          <p style="color:var(--text-muted); font-size: 0.9375rem;">${item.description || 'Surplus rescue mission.'}</p>
        </div>
        <div style="text-align: right; background: var(--bg-card-subtle); padding: 12px 20px; border-radius: var(--radius-md);">
          <div style="font-size: 0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Rescued Volume</div>
          <div style="font-size: 1.5rem; font-weight:800; color:var(--primary); line-height: 1.2;">${item.mealsCount} Meals</div>
          <div style="font-size: 0.75rem; color:var(--text-muted);">${item.quantity}</div>
        </div>
      </div>

      <!-- 5-Stage Stepper Tracker -->
      <div class="stepper-row">
        <div class="stepper-progress-line" style="width: ${progressPercent}%;"></div>

        <!-- Stage 1: ALERT -->
        <div class="step-node ${stage >= 1 ? (stage > 1 ? 'completed' : 'active') : ''}">
          <div class="step-circle">${stage > 1 ? '✓' : '1'}</div>
          <span class="step-label">Alert</span>
          <span class="step-sublabel">Surplus Listed</span>
        </div>

        <!-- Stage 2: MATCH -->
        <div class="step-node ${stage >= 2 ? (stage > 2 ? 'completed' : 'active') : ''}">
          <div class="step-circle">${stage > 2 ? '✓' : '2'}</div>
          <span class="step-label">Match</span>
          <span class="step-sublabel">Volunteer Assigned</span>
        </div>

        <!-- Stage 3: SAFETY CHECK -->
        <div class="step-node ${stage >= 3 ? (stage > 3 ? 'completed' : 'active') : ''}">
          <div class="step-circle">${stage > 3 ? '✓' : '3'}</div>
          <span class="step-label">Safety Check</span>
          <span class="step-sublabel">5-Point Verified</span>
        </div>

        <!-- Stage 4: DELIVER -->
        <div class="step-node ${stage >= 4 ? (stage > 4 ? 'completed' : 'active') : ''}">
          <div class="step-circle">${stage > 4 ? '✓' : '4'}</div>
          <span class="step-label">Deliver</span>
          <span class="step-sublabel">In Transit</span>
        </div>

        <!-- Stage 5: TRANSPARENCY -->
        <div class="step-node ${stage >= 5 ? 'completed' : ''}">
          <div class="step-circle">${stage >= 5 ? '✓' : '5'}</div>
          <span class="step-label">Transparency</span>
          <span class="step-sublabel">Impact Logged</span>
        </div>
      </div>
    </div>

    <!-- Stakeholder Details & Timeline Grid -->
    <div style="display:grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; margin-bottom: 24px;">
      
      <!-- Left: Stakeholder Cards -->
      <div style="display:flex; flex-direction:column; gap: 20px;">
        
        <!-- Donor Card -->
        <div class="card" style="padding: 20px;">
          <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 12px;">
            <div style="width:36px; height:36px; border-radius:50%; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:800;">👨‍🍳</div>
            <div>
              <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Food Donor</div>
              <h4 style="font-size: 1rem; font-weight:700; color:var(--text-main);">${item.donorName}</h4>
            </div>
          </div>
          <div style="font-size:0.875rem; color:var(--text-muted); line-height:1.5;">
            <div><strong>Pickup Address:</strong> ${item.pickupAddress}</div>
            <div><strong>Contact:</strong> ${item.donorPhone || item.contactNumber}</div>
            <div><strong>Listed At:</strong> ${formatDateTime(item.createdAt)}</div>
          </div>
        </div>

        <!-- Volunteer Courier Card -->
        <div class="card" style="padding: 20px;">
          <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 12px;">
            <div style="width:36px; height:36px; border-radius:50%; background:var(--secondary-light); color:var(--secondary-hover); display:flex; align-items:center; justify-content:center; font-weight:800;">🚴</div>
            <div>
              <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Assigned Volunteer</div>
              <h4 style="font-size: 1rem; font-weight:700; color:var(--text-main);">${item.assignedVolunteerName || 'Awaiting Volunteer Match'}</h4>
            </div>
          </div>
          <div style="font-size:0.875rem; color:var(--text-muted); line-height:1.5;">
            <div><strong>Status:</strong> ${item.assignedVolunteerName ? 'Dispatched to pickup location' : 'Alert broadcast to active city volunteers'}</div>
            <div><strong>Safety Protocol:</strong> ${item.safetyVerified ? '✅ Certified Safe for Human Consumption' : '⏳ Pending Physical Checklist'}</div>
          </div>
        </div>

        <!-- Recipient NGO Card -->
        <div class="card" style="padding: 20px;">
          <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 12px;">
            <div style="width:36px; height:36px; border-radius:50%; background:#EFF6FF; color:#2563EB; display:flex; align-items:center; justify-content:center; font-weight:800;">🏢</div>
            <div>
              <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Beneficiary / Partner Shelter</div>
              <h4 style="font-size: 1rem; font-weight:700; color:var(--text-main);">${item.recipientNgoName || 'Akshaya Community Shelter Network'}</h4>
            </div>
          </div>
          <div style="font-size:0.875rem; color:var(--text-muted); line-height:1.5;">
            <div><strong>Delivery Confirmation:</strong> ${item.recipientConfirmedAt ? `Confirmed by Shelter Director on ${formatDateTime(item.recipientConfirmedAt)}` : (item.status === 'Delivered' ? 'Delivered - awaiting shelter acknowledgement' : 'Scheduled upon volunteer arrival')}</div>
          </div>
        </div>
      </div>

      <!-- Right: Audit Timeline & Transparency Receipt -->
      <div class="card" style="padding: 24px; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <h3 style="font-size: 1.125rem; font-weight:800; color:var(--text-main); margin-bottom: 16px;">
            Audit Timeline & Chain of Custody
          </h3>
          
          <div style="display:flex; flex-direction:column; gap: 16px; position:relative; padding-left: 20px; border-left: 2px solid var(--border-subtle);">
            
            <div style="position:relative;">
              <div style="position:absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius:50%; background:var(--primary);"></div>
              <div style="font-size:0.75rem; color:var(--text-light); font-weight:700;">ALERT CREATED</div>
              <div style="font-size:0.875rem; font-weight:700; color:var(--text-main);">${item.donorName}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${formatDateTime(item.createdAt)}</div>
            </div>

            <div style="position:relative;">
              <div style="position:absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius:50%; background:${stage >= 2 ? 'var(--primary)' : 'var(--border-strong)'};"></div>
              <div style="font-size:0.75rem; color:var(--text-light); font-weight:700;">VOLUNTEER & RECIPIENT MATCHED</div>
              <div style="font-size:0.875rem; font-weight:700; color:var(--text-main);">${item.assignedVolunteerName || 'Pending match'}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${stage >= 2 ? 'Matched with nearest shelter' : 'In dispatch pool'}</div>
            </div>

            <div style="position:relative;">
              <div style="position:absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius:50%; background:${stage >= 3 ? 'var(--primary)' : 'var(--border-strong)'};"></div>
              <div style="font-size:0.75rem; color:var(--text-light); font-weight:700;">5-POINT FOOD SAFETY AUDIT</div>
              <div style="font-size:0.875rem; font-weight:700; color:var(--text-main);">${item.safetyVerified ? 'Passed & Sealed' : 'Pending inspection'}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${item.safetyDetails?.notes || 'Temperature & packaging test'}</div>
            </div>

            <div style="position:relative;">
              <div style="position:absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius:50%; background:${stage >= 4 ? 'var(--primary)' : 'var(--border-strong)'};"></div>
              <div style="font-size:0.75rem; color:var(--text-light); font-weight:700;">TRANSIT & DELIVERY</div>
              <div style="font-size:0.875rem; font-weight:700; color:var(--text-main);">${stage >= 5 ? 'Arrived at Destination' : (stage >= 4 ? 'En Route' : 'Awaiting Pickup')}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${item.deliveryConfirmedAt ? formatDateTime(item.deliveryConfirmedAt) : 'Estimated 20-30 mins'}</div>
            </div>

            <div style="position:relative;">
              <div style="position:absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius:50%; background:${stage >= 5 ? 'var(--primary)' : 'var(--border-strong)'};"></div>
              <div style="font-size:0.75rem; color:var(--text-light); font-weight:700;">TRANSPARENCY CERTIFICATE</div>
              <div style="font-size:0.875rem; font-weight:700; color:var(--text-main);">${stage >= 5 ? 'Verified by Recipient Shelter' : 'Pending final confirmation'}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${item.recipientConfirmedAt ? formatDateTime(item.recipientConfirmedAt) : 'Final receipt'}</div>
            </div>

          </div>
        </div>

        <!-- Environmental & Social Metric Box -->
        <div style="margin-top: 24px; padding: 16px; background: var(--bg-card-subtle); border-radius: var(--radius-md); border: 1px dashed var(--primary-border);">
          <div style="font-size:0.75rem; font-weight:700; color:var(--primary); text-transform:uppercase; margin-bottom:4px;">Social Impact Footprint</div>
          <div style="font-size: 0.875rem; color:var(--text-main);">
            ✨ Rescued <strong>${item.mealsCount} wholesome meals</strong>, preventing approx. <strong>${(item.mealsCount * 0.45).toFixed(1)} kg</strong> of greenhouse gas CO₂e emissions.
          </div>
        </div>
      </div>

    </div>
  `;
}
