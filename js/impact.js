/**
 * ANNAM – Social Impact Dashboard & Canvas Charts (impact.js)
 * High-performance Vanilla JavaScript HTML5 Canvas Charts
 */

document.addEventListener('DOMContentLoaded', () => {
  renderImpactMetrics();
  initMonthlyChart();
  initCategoryChart();
});

function renderImpactMetrics() {
  const donations = getDonations();
  const users = getUsers();

  const totalDonations = donations.length + 250; // Add baseline community stats
  const completedDeliveries = donations.filter(d => ['Delivered', 'Completed'].includes(d.status)).length + 238;
  const currentRescued = donations.reduce((sum, d) => sum + (Number(d.mealsCount) || 0), 0);
  const totalMealsRescued = 12500 + currentRescued;

  const totalVolunteers = users.filter(u => u.role === 'Volunteer').length + 500;
  const totalNGOs = users.filter(u => u.role === 'NGO / Recipient').length + 45;

  // Estimated food waste reduced: ~0.4 kg per meal, and 0.45 kg CO2e saved per meal
  const foodWasteKg = Math.round(totalMealsRescued * 0.42);
  const co2AvoidedKg = Math.round(totalMealsRescued * 0.48);
  const waterSavedLiters = Math.round(totalMealsRescued * 180);

  document.getElementById('impact-meals-rescued').textContent = totalMealsRescued.toLocaleString() + '+';
  document.getElementById('impact-total-donations').textContent = totalDonations.toLocaleString() + '+';
  document.getElementById('impact-volunteers').textContent = totalVolunteers.toLocaleString() + '+';
  document.getElementById('impact-ngos').textContent = totalNGOs.toLocaleString() + '+';
  document.getElementById('impact-completed-deliveries').textContent = completedDeliveries.toLocaleString() + '+';
  document.getElementById('impact-waste-reduced').textContent = foodWasteKg.toLocaleString() + ' kg';
  
  if (document.getElementById('impact-co2-saved')) {
    document.getElementById('impact-co2-saved').textContent = co2AvoidedKg.toLocaleString() + ' kg CO₂e';
  }
  if (document.getElementById('impact-water-saved')) {
    document.getElementById('impact-water-saved').textContent = (waterSavedLiters / 1000).toFixed(1) + 'k Liters';
  }
}

// 1. Monthly Donation Rescue Trend Chart (Canvas Bar Chart)
function initMonthlyChart() {
  const canvas = document.getElementById('monthly-chart-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const values = [1100, 1450, 1820, 2250, 2800, 3100];
  const maxVal = 3500;

  const paddingLeft = 45;
  const paddingBottom = 30;
  const paddingTop = 25;
  const paddingRight = 20;

  const chartWidth = rect.width - paddingLeft - paddingRight;
  const chartHeight = rect.height - paddingTop - paddingBottom;

  // Background Grid Lines
  ctx.strokeStyle = '#E3E9E2';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#8A9C91';
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'right';

  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const yVal = Math.round((maxVal / gridSteps) * i);
    const yPos = paddingTop + chartHeight - (chartHeight / gridSteps) * i;

    ctx.beginPath();
    ctx.moveTo(paddingLeft, yPos);
    ctx.lineTo(paddingLeft + chartWidth, yPos);
    ctx.stroke();

    ctx.fillText(yVal.toLocaleString(), paddingLeft - 8, yPos + 4);
  }

  // Draw Bars
  const barWidth = Math.min(38, chartWidth / months.length - 16);
  const stepX = chartWidth / months.length;

  months.forEach((m, idx) => {
    const val = values[idx];
    const barHeight = (val / maxVal) * chartHeight;
    const x = paddingLeft + idx * stepX + (stepX - barWidth) / 2;
    const y = paddingTop + chartHeight - barHeight;

    // Gradient bar fill
    const grad = ctx.createLinearGradient(0, y, 0, paddingTop + chartHeight);
    grad.addColorStop(0, '#228B45');
    grad.addColorStop(1, '#1A6D36');

    ctx.fillStyle = grad;
    // Rounded top bar
    drawRoundedRect(ctx, x, y, barWidth, barHeight, 6);
    ctx.fill();

    // Value label on top of bar
    ctx.fillStyle = '#26352B';
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(val.toLocaleString(), x + barWidth / 2, y - 6);

    // Month label at bottom
    ctx.fillStyle = '#5C6F63';
    ctx.font = '12px Plus Jakarta Sans, sans-serif';
    ctx.fillText(m, x + barWidth / 2, paddingTop + chartHeight + 18);
  });
}

// 2. Category-Wise Distribution Chart (Canvas Donut Chart)
function initCategoryChart() {
  const canvas = document.getElementById('category-chart-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const categories = [
    { label: 'Cooked Meals', value: 58, color: '#228B45' },
    { label: 'Fresh Produce', value: 20, color: '#FF9F32' },
    { label: 'Bakery & Bread', value: 12, color: '#2563EB' },
    { label: 'Snacks & Savories', value: 10, color: '#7E22CE' }
  ];

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const radius = Math.min(centerX, centerY) - 20;
  const innerRadius = radius * 0.62;

  let startAngle = -Math.PI / 2;

  categories.forEach(cat => {
    const sliceAngle = (cat.value / 100) * (Math.PI * 2);
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = cat.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    startAngle = endAngle;
  });

  // Center Text in Donut Hole
  ctx.fillStyle = '#26352B';
  ctx.font = '800 20px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('100%', centerX, centerY - 8);

  ctx.fillStyle = '#8A9C91';
  ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
  ctx.fillText('RESCUED', centerX, centerY + 12);
}

// Helper to draw rounded rectangle
function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (height < radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
