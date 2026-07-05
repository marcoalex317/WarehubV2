// =====================
// WAREHUB AUTH SYSTEM
// =====================

// Demo accounts yang bisa dipakai login
const demoAccounts = [
  {
    id: 1,
    name: "ARTH Wear",
    email: "tenant@warehub.com",
    password: "tenant123",
    role: "tenant"
  },
  {
    id: 2,
    name: "Budi Santoso",
    email: "owner@warehub.com",
    password: "owner123",
    role: "owner"
  }
];

// =====================
// SESSION MANAGEMENT
// =====================

function saveSession(user) {
  localStorage.setItem("wh_user", JSON.stringify(user));
}

function getSession() {
  const data = localStorage.getItem("wh_user");
  return data ? JSON.parse(data) : null;
}

function clearSession() {
  localStorage.removeItem("wh_user");
}

function isLoggedIn() {
  return getSession() !== null;
}

function getCurrentUser() {
  return getSession();
}

function getCurrentRole() {
  const user = getSession();
  return user ? user.role : null;
}

// =====================
// LOGIN
// =====================

function login(email, password) {
  // Cek demo accounts dulu
  const found = demoAccounts.find(
    a => a.email === email && a.password === password
  );
  if (found) {
    saveSession(found);
    return { success: true, user: found };
  }

  // Cek registered accounts dari localStorage
  const registered = getRegisteredUsers();
  const registeredUser = registered.find(
    u => u.email === email && u.password === password
  );
  if (registeredUser) {
    saveSession(registeredUser);
    return { success: true, user: registeredUser };
  }

  return { success: false, message: "Email atau password salah." };
}

// =====================
// REGISTER
// =====================

function getRegisteredUsers() {
  const data = localStorage.getItem("wh_registered");
  return data ? JSON.parse(data) : [];
}

function saveRegisteredUsers(users) {
  localStorage.setItem("wh_registered", JSON.stringify(users));
}

function register(name, email, password, role) {
  // Validasi tidak boleh pakai email demo
  const allEmails = [
    ...demoAccounts.map(a => a.email),
    ...getRegisteredUsers().map(u => u.email)
  ];

  if (allEmails.includes(email)) {
    return { success: false, message: "Email sudah terdaftar." };
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    role
  };

  const users = getRegisteredUsers();
  users.push(newUser);
  saveRegisteredUsers(users);

  return { success: true, user: newUser };
}

// =====================
// LOGOUT
// =====================

function logout() {
  clearSession();
  window.location.href = "index.html";
}

// =====================
// ROUTE PROTECTION
// =====================

// Halaman yang butuh login
function requireLogin(redirectTo = "login.html") {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

// Halaman yang butuh role tertentu
function requireRole(role, redirectTo = "index.html") {
  const user = getCurrentUser();
  if (!user || user.role !== role) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

// Redirect kalau sudah login (untuk halaman login/register)
function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user) {
    if (user.role === "tenant") {
      window.location.href = "dashboard-tenant.html";
    } else {
      window.location.href = "dashboard-owner.html";
    }
  }
}

// =====================
// NAVBAR USER STATE
// =====================

function updateNavbar() {
  const user = getCurrentUser();
  const navRight = document.querySelector(".navbar-right");

  // Tampilkan/sembunyikan link dashboard sesuai role
  const navTenant = document.getElementById("nav-tenant");
  const navOwner  = document.getElementById("nav-owner");
  const navMsgs   = document.getElementById("nav-messages");
  if (navTenant) navTenant.style.display = (user && user.role === "tenant") ? "flex" : "none";
  if (navOwner)  navOwner.style.display  = (user && user.role === "owner")  ? "flex" : "none";
  if (navMsgs)   navMsgs.style.display   = user ? "flex" : "none";

  if (!navRight) return;

  if (user) {
    navRight.innerHTML = `
      <a href="messages.html" title="Pesan" style="
          width: 34px; height: 34px; border-radius: var(--radius-md);
          background: var(--color-gray-100); color: var(--color-gray-700);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; transition: background 0.15s;"
        onmouseover="this.style.background='var(--color-gray-200)'"
        onmouseout="this.style.background='var(--color-gray-100)'">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 2H2C1.45 2 1 2.45 1 3V10C1 10.55 1.45 11 2 11H5V14L8.5 11H14C14.55 11 15 10.55 15 10V3C15 2.45 14.55 2 14 2Z"
                stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
        </svg>
      </a>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--color-primary-light);
          color: var(--color-primary);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: var(--font-size-sm);
          flex-shrink: 0;">
          ${user.name.charAt(0).toUpperCase()}
        </div>
        <div style="font-size: var(--font-size-sm);">
          <div style="font-weight: 600; color: var(--color-gray-800);
                      white-space: nowrap;">
            ${user.name}
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--color-gray-400);">
            ${user.role === "tenant" ? "Penyewa" : "Pemilik Gudang"}
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="logout()">Keluar</button>
      </div>
    `;
  } else {
    navRight.innerHTML = `
      <a href="login.html" class="btn btn-ghost">Masuk</a>
      <a href="register.html" class="btn btn-primary">Daftar</a>
    `;
  }
}

// =====================
// BOOKING SESSION
// =====================

function saveBookingData(data) {
  localStorage.setItem("wh_booking", JSON.stringify(data));
}

function getBookingData() {
  const data = localStorage.getItem("wh_booking");
  return data ? JSON.parse(data) : null;
}

function clearBookingData() {
  localStorage.removeItem("wh_booking");
}

// =====================
// ACTIVE BOOKINGS
// =====================

function saveActiveBooking(booking) {
  const existing = getActiveBookings();
  existing.push(booking);
  localStorage.setItem("wh_active_bookings", JSON.stringify(existing));
}

function getActiveBookings() {
  const data = localStorage.getItem("wh_active_bookings");
  return data ? JSON.parse(data) : [];
}