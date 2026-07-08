// =====================
// UTILITY FUNCTIONS
// =====================

// Format angka ke Rupiah
function formatRupiah(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

// Format angka singkat (2550000 → Rp 2,5jt)
function formatRupiahShort(amount) {
  if (amount >= 1000000) {
    return "Rp " + (amount / 1000000).toFixed(1) + "jt";
  }
  if (amount >= 1000) {
    return "Rp " + (amount / 1000).toFixed(0) + "rb";
  }
  return formatRupiah(amount);
}

// Hitung harga booking
function calcBookingPrice(pricePerDay, days) {
  const subtotal = pricePerDay * days;
  const fee      = Math.round(subtotal * 0.05);
  const total    = subtotal + fee;
  return { subtotal, fee, total };
}

// Tanggal hari ini dalam format YYYY-MM-DD
function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// =====================
// TOAST NOTIFICATION
// =====================

function showToast(message, duration = 3000) {
  let toast = document.getElementById("toast");

  // Buat elemen toast jika belum ada
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// =====================
// MODAL
// =====================

function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) overlay.classList.add("show");
}

function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) overlay.classList.remove("show");
}

// Tutup modal kalau klik di luar area modal
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("show");
  }
});

// =====================
// NAVBAR ACTIVE STATE
// =====================

function setActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// =====================
// SIDEBAR TAB SWITCHING
// =====================

function initSidebar() {
  const sidebarItems = document.querySelectorAll(".sidebar-item[data-tab]");

  sidebarItems.forEach(item => {
    item.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      // Update active state sidebar
      sidebarItems.forEach(i => i.classList.remove("active"));
      this.classList.add("active");

      // Sembunyikan semua tab content
      const allTabs = document.querySelectorAll(".tab-content");
      allTabs.forEach(tab => tab.classList.add("hidden"));

      // Tampilkan tab yang dipilih
      const activeTab = document.getElementById(tabId);
      if (activeTab) activeTab.classList.remove("hidden");
    });
  });
}

// =====================
// FILTER CHIP
// =====================

function initFilterChips() {
  const chips = document.querySelectorAll(".filter-chip");

  chips.forEach(chip => {
    chip.addEventListener("click", function () {
      chips.forEach(c => c.classList.remove("active"));
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");
      filterWarehouses(filter);
    });
  });
}

// =====================
// WAREHOUSE CARD BUILDER
// =====================

function buildWarehouseCard(w) {
  const availBadge = w.available
    ? `<span class="badge badge-success"><span class="dot dot-success"></span>Tersedia</span>`
    : `<span class="badge badge-gray">Penuh</span>`;

  const tags = w.tags.slice(0, 2).map(t =>
    `<span class="badge badge-gray">${t}</span>`
  ).join("");

  return `
    <a href="detail.html?id=${w.id}" class="card card-clickable warehouse-card">
      <div class="warehouse-card-availability">${availBadge}</div>
      <img src="${w.image}" alt="${w.name}" class="warehouse-card-img" />
      <div class="card-body">
        <div class="warehouse-card-name">${w.name}</div>
        <div class="warehouse-card-loc">
          <img src="assets/icons/location.svg" alt="" />
          ${w.location}
        </div>
        <div class="warehouse-card-tags">
          <span class="badge badge-gray">${w.size} m²</span>
          ${tags}
        </div>
        <div class="warehouse-card-bottom">
          <div class="warehouse-price">
            ${formatRupiah(w.price)}<span> /hari</span>
          </div>
          <div class="warehouse-rating">
            <img src="assets/icons/star.svg" alt="" />
            ${w.rating}
            <span class="reviews">(${w.reviews})</span>
          </div>
        </div>
      </div>
    </a>
  `;
}

// =====================
// FILTER WAREHOUSES
// =====================

function filterWarehouses(filter) {
  const grid = document.getElementById("warehouse-grid");
  if (!grid) return;

  let filtered = warehouses;

  if (filter && filter !== "all") {
    filtered = warehouses.filter(w =>
      w.facilities.some(f =>
        f.toLowerCase().includes(filter.toLowerCase())
      )
    );
  }

  // Cek filter dari select (lokasi, ukuran, harga)
  const lokasi = document.getElementById("f-lokasi")?.value;
  const ukuran = document.getElementById("f-ukuran")?.value;
  const harga  = document.getElementById("f-harga")?.value;

  if (lokasi && lokasi !== "Semua Lokasi") {
    filtered = filtered.filter(w =>
      w.location.toLowerCase().includes(lokasi.toLowerCase())
    );
  }

  if (ukuran && ukuran !== "Semua Ukuran") {
    if (ukuran === "< 10 m²")    filtered = filtered.filter(w => w.size < 10);
    if (ukuran === "10 – 50 m²") filtered = filtered.filter(w => w.size >= 10 && w.size <= 50);
    if (ukuran === "50 – 200 m²")filtered = filtered.filter(w => w.size > 50 && w.size <= 200);
    if (ukuran === "> 200 m²")   filtered = filtered.filter(w => w.size > 200);
  }

  if (harga && harga !== "Semua Harga") {
    if (harga === "< Rp 50.000/hari")    filtered = filtered.filter(w => w.price < 50000);
    if (harga === "Rp 50 – 100K/hari")   filtered = filtered.filter(w => w.price >= 50000 && w.price <= 100000);
    if (harga === "Rp 100 – 200K/hari")  filtered = filtered.filter(w => w.price > 100000 && w.price <= 200000);
  }

  // Update jumlah hasil
  const countEl = document.getElementById("result-count");
  if (countEl) countEl.textContent = filtered.length;

  // Render cards
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-gray-400);">
        <img src="assets/icons/warehouse.svg" alt="" style="width:48px;height:48px;opacity:0.2;margin:0 auto 1rem;">
        <p>Tidak ada gudang yang sesuai filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(buildWarehouseCard).join("");
}

// =====================
// INIT FILTER SELECTS
// =====================

function initFilterSelects() {
  const selects = document.querySelectorAll(".filter-select");
  selects.forEach(sel => {
    sel.addEventListener("change", () => {
      const activeChip = document.querySelector(".filter-chip.active");
      const filter = activeChip ? activeChip.getAttribute("data-filter") : "all";
      filterWarehouses(filter);
    });
  });
}

// =====================
// BOOKING PRICE CALC
// =====================

function initBookingCalc() {
  const durSelect  = document.getElementById("book-dur");
  const sizeSelect = document.getElementById("book-size");

  if (!durSelect) return;

  function update() {
    const pricePerDay = parseInt(
      document.getElementById("book-price-base")?.value || 85000
    );
    const days = parseInt(durSelect.value);
    const { subtotal, fee, total } = calcBookingPrice(pricePerDay, days);

    const descEl  = document.getElementById("price-desc");
    const subEl   = document.getElementById("price-sub");
    const feeEl   = document.getElementById("price-fee");
    const totalEl = document.getElementById("price-total");
    const mSubEl  = document.getElementById("m-sub");
    const mFeeEl  = document.getElementById("m-fee");
    const mTotEl  = document.getElementById("m-total");

    if (descEl)  descEl.textContent  = `${formatRupiah(pricePerDay)} x ${days} hari`;
    if (subEl)   subEl.textContent   = formatRupiah(subtotal);
    if (feeEl)   feeEl.textContent   = formatRupiah(fee);
    if (totalEl) totalEl.textContent = formatRupiah(total);
    if (mSubEl)  mSubEl.textContent  = formatRupiah(subtotal);
    if (mFeeEl)  mFeeEl.textContent  = formatRupiah(fee);
    if (mTotEl)  mTotEl.textContent  = formatRupiah(total);
  }

  durSelect.addEventListener("change", update);
  if (sizeSelect) sizeSelect.addEventListener("change", update);

  // Jalankan sekali saat load
  update();
}

// =====================
// SET TODAY DATE
// =====================

function initDateInputs() {
  const dateInputs = document.querySelectorAll("input[type='date']");
  dateInputs.forEach(input => {
    if (!input.value) input.value = todayISO();
  });
}

// =====================
// CONFIRM BOOKING
// =====================

function confirmBooking() {
  closeModal("modal-booking");
  showToast("Booking berhasil! Cek dashboard untuk detailnya.");
  setTimeout(() => {
    window.location.href = "dashboard-tenant.html";
  }, 1500);
}

// =====================
// ON PAGE LOAD
// =====================

document.addEventListener("DOMContentLoaded", function () {
  setActiveNav();
  initSidebar();
  initFilterChips();
  initFilterSelects();
  initBookingCalc();
  initDateInputs();

  document.addEventListener("click", function (e) {
    const link = e.target.closest('a[href="#"]');
    if (link && !link.hasAttribute('onclick')) {
      e.preventDefault();
      showToast("Halaman ini belum tersedia.");
    }
  });
});