/**
 * ANNAM – Authentication Module (auth.js)
 * LocalStorage Prototype Authentication
 */

document.addEventListener('DOMContentLoaded', () => {
  setupLoginForm();
  setupRegisterForm();
  setupQuickDemoLogin();
});

// Quick Demo Login Helper for Hackathon Evaluators
function setupQuickDemoLogin() {
  const demoButtons = document.querySelectorAll('[data-demo-role]');
  demoButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const role = btn.getAttribute('data-demo-role');
      const users = getUsers();
      let user = null;

      if (role === 'donor') user = users.find(u => u.role === 'Food Donor');
      if (role === 'volunteer') user = users.find(u => u.role === 'Volunteer');
      if (role === 'ngo' || role === 'recipient') user = users.find(u => u.role === 'NGO / Recipient');

      if (user) {
        setCurrentUser(user);
        showToast(`Logged in as ${user.name} (${user.role})`, 'success');
        redirectUser(user.role);
      }
    });
  });
}

// Login Form Handling
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');

    if (errorEl) errorEl.style.display = 'none';

    if (!email || !password) {
      showError(errorEl, 'Please enter both your email address and password.');
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      showError(errorEl, 'No account found with this email address. Try the Quick Demo buttons or register.');
      return;
    }

    // In prototype demonstration mode, password checks accept 'demo' or registered password
    if (user.password !== password && password !== 'demo') {
      showError(errorEl, 'Incorrect password. (Tip: Demo password is "demo")');
      return;
    }

    // Login successful
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`, 'success');
    redirectUser(user.role);
  });
}

// Registration Form Handling
function setupRegisterForm() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const location = document.getElementById('reg-location').value.trim();
    const role = document.getElementById('reg-role').value;
    const errorEl = document.getElementById('reg-error');

    if (errorEl) errorEl.style.display = 'none';

    if (!name || !email || !phone || !password || !location || !role) {
      showError(errorEl, 'Please complete all required fields.');
      return;
    }

    if (password.length < 4) {
      showError(errorEl, 'Password should be at least 4 characters for this demo.');
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      showError(errorEl, 'An account with this email already exists. Please login instead.');
      return;
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name,
      email,
      phone,
      password,
      location,
      role,
      avatar: name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'U'
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    showToast(`Account registered successfully as ${role}!`, 'success');
    redirectUser(role);
  });
}

function showError(element, message) {
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
  } else {
    showToast(message, 'error');
  }
}

// Redirect based on user role
function redirectUser(role) {
  setTimeout(() => {
    if (role === 'Food Donor') {
      window.location.href = 'donor.html';
    } else if (role === 'Volunteer') {
      window.location.href = 'volunteer.html';
    } else if (role === 'NGO / Recipient') {
      window.location.href = 'recipient.html';
    } else {
      window.location.href = 'index.html';
    }
  }, 400);
}
