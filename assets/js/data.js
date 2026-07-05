// =====================
// DATA DUMMY WAREHUB
// =====================

const warehouses = [
  {
    id: 1,
    name: "Gudang Premium Cawang",
    location: "Cawang, Jakarta Timur",
    address: "Jl. Cawang Indah No. 12, Jakarta Timur",
    size: 50,
    price: 85000,
    rating: 4.9,
    reviews: 42,
    available: true,
    image: "assets/images/gudang-1.jpg",
    facilities: ["CCTV", "Keamanan 24 Jam", "Akses Kendaraan", "Rak Penyimpanan", "Listrik 24 Jam", "Toilet"],
    tags: ["CCTV", "24 Jam", "50 m²"],
    description: "Gudang strategis di kawasan Cawang dengan akses mudah ke jalan tol. Cocok untuk penyimpanan stok fashion, elektronik, maupun kebutuhan UMKM. Dilengkapi CCTV 24 jam dan sistem keamanan modern."
  },
  {
    id: 2,
    name: "Ruang Stok Kemang",
    location: "Kemang, Jakarta Selatan",
    address: "Jl. Kemang Raya No. 45, Jakarta Selatan",
    size: 20,
    price: 120000,
    rating: 4.7,
    reviews: 28,
    available: true,
    image: "assets/images/gudang-2.jpg",
    facilities: ["AC", "CCTV", "Rak Penyimpanan", "Listrik 24 Jam"],
    tags: ["AC", "20 m²"],
    description: "Ruang penyimpanan premium di area Kemang. Ber-AC, cocok untuk produk fashion, kosmetik, dan barang bernilai tinggi."
  },
  {
    id: 3,
    name: "Gudang Logistik Marunda",
    location: "Marunda, Jakarta Utara",
    address: "Jl. Marunda Raya No. 88, Jakarta Utara",
    size: 200,
    price: 45000,
    rating: 4.6,
    reviews: 61,
    available: true,
    image: "assets/images/gudang-3.jpg",
    facilities: ["Loading Dock", "Forklift", "CCTV", "Akses Kendaraan", "Toilet"],
    tags: ["Loading Dock", "200 m²"],
    description: "Gudang skala besar untuk kebutuhan distribusi dan logistik. Tersedia loading dock dan akses forklift."
  },
  {
    id: 4,
    name: "Mini Storage Grogol",
    location: "Grogol, Jakarta Barat",
    address: "Jl. Grogol Permai No. 7, Jakarta Barat",
    size: 8,
    price: 35000,
    rating: 4.5,
    reviews: 17,
    available: true,
    image: "assets/images/gudang-4.jpg",
    facilities: ["CCTV", "Listrik 24 Jam"],
    tags: ["CCTV", "8 m²"],
    description: "Mini storage cocok untuk UMKM dengan stok kecil. Fleksibel dan terjangkau untuk penyimpanan jangka pendek."
  },
  {
    id: 5,
    name: "Gudang Fashion Tanah Abang",
    location: "Tanah Abang, Jakarta Pusat",
    address: "Jl. Tanah Abang II No. 23, Jakarta Pusat",
    size: 30,
    price: 95000,
    rating: 4.8,
    reviews: 55,
    available: false,
    image: "assets/images/gudang-5.jpg",
    facilities: ["AC", "CCTV", "Rak Penyimpanan", "Keamanan 24 Jam"],
    tags: ["AC", "CCTV", "30 m²"],
    description: "Gudang strategis di pusat perdagangan Tanah Abang. Ideal untuk seller fashion yang butuh lokasi dekat pasar."
  },
  {
    id: 6,
    name: "Cold Storage Sunter",
    location: "Sunter, Jakarta Utara",
    address: "Jl. Sunter Jaya No. 5, Jakarta Utara",
    size: 15,
    price: 150000,
    rating: 4.9,
    reviews: 33,
    available: true,
    image: "assets/images/gudang-6.jpg",
    facilities: ["Pendingin", "CCTV", "Keamanan 24 Jam", "Listrik 24 Jam"],
    tags: ["Pendingin", "15 m²"],
    description: "Cold storage khusus untuk produk yang membutuhkan suhu dingin seperti makanan, minuman, dan obat-obatan."
  }
];

const bookings = [
  {
    id: "WH-2401",
    warehouseId: 1,
    warehouseName: "Gudang Cawang",
    location: "Jakarta Timur",
    size: "20 m²",
    period: "1 – 31 Mei 2025",
    total: 2550000,
    status: "active"
  },
  {
    id: "WH-2402",
    warehouseId: 2,
    warehouseName: "Ruang Kemang",
    location: "Jakarta Selatan",
    size: "8 m²",
    period: "15 – 22 Mei 2025",
    total: 840000,
    status: "pending"
  }
];

const bookingHistory = [
  { date: "Mar 2025", warehouse: "Gudang Cawang", duration: "30 hari", total: 2550000, status: "done" },
  { date: "Feb 2025", warehouse: "Mini Storage Grogol", duration: "14 hari", total: 490000, status: "done" },
  { date: "Jan 2025", warehouse: "Gudang Cawang", duration: "30 hari", total: 2550000, status: "done" },
  { date: "Des 2024", warehouse: "Ruang Kemang", duration: "7 hari", total: 840000, status: "done" }
];

const inventory = [
  { name: "Kaos Oversize – Putih, M", sku: "KO-001-W-M", warehouse: "Gudang Cawang", qty: 12, max: 100, status: "critical" },
  { name: "Kaos Oversize – Hitam, L", sku: "KO-001-B-L", warehouse: "Gudang Cawang", qty: 240, max: 300, status: "good" },
  { name: "Celana Cargo – Coklat, L", sku: "CC-002-L", warehouse: "Gudang Cawang", qty: 28, max: 120, status: "low" },
  { name: "Jaket Denim – Navy, XL", sku: "JD-003-XL", warehouse: "Ruang Kemang", qty: 18, max: 90, status: "low" },
  { name: "Sneakers – Putih, 40", sku: "SN-004-40", warehouse: "Ruang Kemang", qty: 130, max: 200, status: "good" },
  { name: "Tote Bag Canvas", sku: "TB-005", warehouse: "Gudang Cawang", qty: 450, max: 500, status: "good" }
];

const ownerListings = [
  { name: "Gudang Premium Cawang", location: "Jakarta Timur", size: "50 m²", price: 85000, status: "active", occupancy: 100 },
  { name: "Ruang Stok Kemang", location: "Jakarta Selatan", size: "20 m²", price: 120000, status: "active", occupancy: 85 },
  { name: "Gudang Baru Bekasi", location: "Bekasi Barat", size: "80 m²", price: 60000, status: "pending", occupancy: 0 }
];

const incomingBookings = [
  { tenant: "ARTH Wear", warehouse: "Gudang Cawang", size: "20 m²", period: "15 – 22 Mei", total: 595000, status: "pending" },
  { tenant: "Toko Skincare", warehouse: "Ruang Kemang", size: "10 m²", period: "20 – 27 Mei", total: 840000, status: "pending" },
  { tenant: "Fashion Tanah Abang", warehouse: "Gudang Cawang", size: "30 m²", period: "1 – 31 Mei", total: 2550000, status: "active" }
];

const earnings = [
  { date: "1 Mei", tenant: "ARTH Wear", warehouse: "Gudang Cawang", gross: 2550000, commission: 127500, net: 2422500 },
  { date: "3 Mei", tenant: "Skincare Online", warehouse: "Ruang Kemang", gross: 1050000, commission: 52500, net: 997500 },
  { date: "10 Mei", tenant: "Toko Aksesoris", warehouse: "Gudang Cawang", gross: 595000, commission: 29750, net: 565250 }
];

const notifications = [
  { message: "Booking dikonfirmasi! Ruang Kemang siap digunakan mulai 15 Mei 2025.", time: "5 menit lalu", read: false },
  { message: "Stok kritis! Kaos Oversize M hanya tersisa 12 pcs. Pertimbangkan restock segera.", time: "2 jam lalu", read: false },
  { message: "Masa sewa Gudang Cawang berakhir dalam 7 hari. Perpanjang sekarang?", time: "1 hari lalu", read: true },
  { message: "Promo Mei: Sewa 30 hari gratis pickup 3x. Berlaku hingga 31 Mei.", time: "3 hari lalu", read: true }
];

const paymentMethods = [
  { id: "transfer", label: "Transfer Bank", desc: "BCA, Mandiri, BNI, BRI" },
  { id: "qris", label: "QRIS", desc: "Semua e-wallet & mobile banking" },
  { id: "gopay", label: "GoPay", desc: "Bayar via aplikasi Gojek" },
  { id: "ovo", label: "OVO", desc: "Bayar via aplikasi OVO" }
];