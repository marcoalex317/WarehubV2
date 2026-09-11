// Helper bersama untuk ubah hasil query sql.js jadi bentuk yang lebih
// mudah dipakai di route handler. Sebelumnya fungsi-fungsi ini
// diduplikasi (dengan variasi kecil) di routes/admin.js, routes/bookings.js,
// dan routes/warehouses.js — sekarang ditarik ke satu tempat.

// Array of object, mis. [{ id: 1, name: 'Gudang A' }, ...]
// Dipakai oleh routes/bookings.js dan routes/warehouses.js.
function rowsToObjects(result) {
  if (!result.length || !result[0].values.length) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => { obj[c] = row[i]; });
    return obj;
  });
}

// Bentuk { columns: [...], rows: [[...], ...] }, dipakai routes/admin.js
// untuk ditampilkan sebagai tabel mentah di halaman admin.
function rowsToTable(result) {
  if (!result.length || !result[0].values.length) return { columns: [], rows: [] };
  return { columns: result[0].columns, rows: result[0].values };
}

module.exports = { rowsToObjects, rowsToTable };
