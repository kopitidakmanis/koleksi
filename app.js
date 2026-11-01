(function () {
  const data = window.DATA;
  let cart = [];
  const rp = (a) => "Rp" + Number(a).toLocaleString("id-ID");

  // 1. RENDER PRODUK & SLIDER (Hanya jalan di halaman katalog)
  const grid = document.getElementById("product-grid");
  
  if (grid) {
    data.produk.forEach(p => {
      const el = document.createElement("div");
      el.className = "card";

      let sliderHTML = `<div class="slider-container"><div class="slider-track" onscroll="updateDots(this)">`;
      let dotsHTML = `<div class="slider-dots">`;
      
      p.gambar.forEach((imgSrc, index) => {
        sliderHTML += `<img src="${imgSrc}" alt="${p.nama}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400?text=Gambar+Error'">`;
        dotsHTML += `<div class="dot ${index === 0 ? 'active' : ''}"></div>`;
      });
      
      sliderHTML += `</div>${dotsHTML}</div></div>`;

      el.innerHTML = `
        ${sliderHTML}
        <div class="card-body">
          <div class="card-cat">${p.kategori}</div>
          <h3>${p.nama}</h3>
          <div class="price-row">Harga: <span>${rp(p.harga)}</span></div>
          <button class="btn-add" onclick="tambah(${p.id})">+ Keranjang</button>
        </div>
      `;
      grid.appendChild(el);
    });
  }

  window.updateDots = (track) => {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    track.parentElement.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  };

  // 2. LOGIKA KERANJANG
  window.tambah = (id) => {
    const prod = data.produk.find(p => p.id === id);
    const item = cart.find(c => c.id === id);
    if (item) item.qty++;
    else cart.push({ ...prod, qty: 1 });
    updateUI();
  };

  window.ubah = (id, aksi) => {
    const idx = cart.findIndex(c => c.id === id);
    if (aksi === 'tambah') cart[idx].qty++;
    if (aksi === 'kurang') cart[idx].qty--;
    if (cart[idx].qty === 0) cart.splice(idx, 1);
    updateUI();
  };

  function updateUI() {
    const btn = document.getElementById("cart-btn");
    const container = document.getElementById("cart-items-container");
    let total = 0, harga = 0;

    if (!container) return; // Mencegah error jika di halaman beranda
    container.innerHTML = "";
    
    if (cart.length === 0) {
      if(btn) btn.classList.remove("show");
      container.innerHTML = "<p style='text-align:center; color:#888; margin:20px 0;'>Keranjang masih kosong.</p>";
    } else {
      if(btn) btn.classList.add("show");
      cart.forEach(c => {
        total += c.qty;
        harga += (c.harga * c.qty);
        container.innerHTML += `
          <div class="cart-item">
            <div><b>${c.nama}</b><br>${rp(c.harga)}</div>
            <div class="qty-control">
              <button class="qty-btn" onclick="ubah(${c.id}, 'kurang')">-</button>
              <span>${c.qty}</span>
              <button class="qty-btn" onclick="ubah(${c.id}, 'tambah')">+</button>
            </div>
          </div>
        `;
      });
    }
    
    // Update teks angka keranjang di bawah
    if(document.getElementById("cart-text")) document.getElementById("cart-text").textContent = total + " item";
    if(document.getElementById("cart-price")) document.getElementById("cart-price").textContent = rp(harga);
    if(document.getElementById("modal-total-price")) document.getElementById("modal-total-price").textContent = rp(harga);
  }

  // 3. MODAL & CHECKOUT
  window.tutupModal = (id) => document.getElementById(id).classList.remove("show");
  const cartBtn = document.getElementById("cart-btn");
  if(cartBtn) {
    cartBtn.onclick = () => { if(cart.length) document.getElementById("cart-modal").classList.add("show"); };
  }
  
  window.bukaCheckout = () => { tutupModal("cart-modal"); document.getElementById("checkout-modal").classList.add("show"); };

  window.kirimKeWA = () => {
    const nama = document.getElementById("cust-name").value;
    const hp = document.getElementById("cust-phone").value;
    const alamat = document.getElementById("cust-address").value;
    const eks = document.getElementById("cust-courier").value;
    const bayar = document.getElementById("cust-payment").value;

    if (!nama || !alamat) return alert("Isi Nama dan Alamat dulu ya!");

    let pesan = `Halo Admin, saya mau order:\n\n`;
    let totalHarga = 0;
    cart.forEach((c, i) => {
      pesan += `${i+1}. ${c.nama} - ${c.qty} pcs = ${rp(c.harga * c.qty)}\n`;
      totalHarga += c.harga * c.qty;
    });
    pesan += `\nTotal Produk: ${rp(totalHarga)}`;
    pesan += `\n\nDATA PENGIRIMAN:\nNama: ${nama}\nHP: ${hp}\nAlamat: ${alamat}\nEkspedisi: ${eks}\nPembayaran: ${bayar}`;

    window.open(`https://wa.me/${data.whatsapp}?text=${encodeURIComponent(pesan)}`, "_blank");
  };

  // 4. FITUR UPLOAD FOTO CUSTOM
  const fileInput = document.getElementById("custom-photo");
  const preview = document.getElementById("preview");
  const orderCustomBtn = document.getElementById("order-custom");
  const label = document.getElementById("upload-label");

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
      const tipe = ["image/jpeg", "image/png", "image/webp"];
      if (!tipe.includes(file.type)) { alert("Harus JPG/PNG/WebP"); fileInput.value = ""; return; }
      if (file.size > 5 * 1024 * 1024) { alert("Maks 5 MB"); fileInput.value = ""; return; }
      
      if (preview.src) URL.revokeObjectURL(preview.src);
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
      label.textContent = "✅ Foto siap!";
      orderCustomBtn.disabled = false;
    });

    orderCustomBtn.addEventListener("click", () => {
      const pesan = `Halo, saya mau order CUSTOM.\nSaya sudah pilih foto di website dan akan melampirkan fotonya di chat ini.`;
      window.open(`https://wa.me/${data.whatsapp}?text=${encodeURIComponent(pesan)}`, "_blank");
    });
  }

})();
