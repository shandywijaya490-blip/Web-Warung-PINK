// Data Store & State
const cart = {};
const MAIN_WA_NUMBER = "6289525068907";
const PINK_PRINT_WA_NUMBER = "62882005161406";
let selectedPayment = null;
let qrCodeInstance = null;

window.onload = function() {
    document.getElementById('customWebUrl').value = window.location.href;
    initQRCode(window.location.href);
};

// Tab Switcher
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-pinky-500', 'text-white', 'shadow-md');
        btn.classList.add('text-gray-600', 'hover:bg-pink-100');
    });

    document.getElementById('content-' + tabName).classList.remove('hidden');
    const activeBtn = document.getElementById('tab-' + tabName);
    activeBtn.classList.add('bg-pinky-500', 'text-white', 'shadow-md');
    activeBtn.classList.remove('text-gray-600', 'hover:bg-pink-100');
}

// Search Filter
function filterItems() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let cards = document.querySelectorAll('.item-card');

    cards.forEach(card => {
        let name = card.querySelector('.item-name').innerText.toLowerCase();
        if (name.includes(input)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Qty Handler
function updateQty(id, change) {
    if (!cart[id]) {
        const card = document.querySelector(`[data-id="${id}"]`);
        cart[id] = {
            id: id,
            name: card.getAttribute('data-name'),
            price: parseInt(card.getAttribute('data-price')) || 0,
            unit: card.getAttribute('data-unit'),
            type: card.getAttribute('data-type'),
            qty: 0
        };
    }

    cart[id].qty += change;
    if (cart[id].qty < 0) cart[id].qty = 0;
    if (cart[id].qty === 0) {
        delete cart[id];
    }

    document.getElementById(`qty-${id}`).innerText = cart[id] ? cart[id].qty : 0;
    updateCartBar();
}

function updateCartBar() {
    let totalCount = 0;
    let totalPrice = 0;
    let listHtml = '';

    for (let id in cart) {
        let item = cart[id];
        totalCount += item.qty;
        totalPrice += item.price * item.qty;
        listHtml += `
            <div class="flex justify-between items-center text-xs bg-white p-2 rounded-xl border border-pink-100">
                <div>
                    <span class="font-bold text-gray-800">${item.name}</span>
                    <span class="text-pinky-600 font-semibold ml-1">(${item.qty}x)</span>
                </div>
                <span class="font-extrabold text-gray-700">${item.price > 0 ? 'Rp ' + (item.price * item.qty).toLocaleString('id-ID') : item.unit}</span>
            </div>
        `;
    }

    const cartBar = document.getElementById('cartBar');
    if (totalCount > 0) {
        cartBar.classList.remove('translate-y-full');
    } else {
        cartBar.classList.add('translate-y-full');
        document.getElementById('cartDetailList').classList.add('hidden');
        document.getElementById('cartDetailIcon').classList.remove('rotate-180');
        document.getElementById('cartDetailToggleText').innerText = 'Lihat Rincian';
    }

    document.getElementById('cartCountBadge').innerText = totalCount;
    document.getElementById('cartSummaryText').innerText = `${totalCount} Pesanan Dipilih`;
    document.getElementById('cartTotalPrice').innerText = totalPrice > 0 ? `Rp ${totalPrice.toLocaleString('id-ID')}` : 'Sesuai Layanan';
    document.getElementById('cartDetailList').innerHTML = listHtml;
    document.getElementById('checkoutTotalText').innerText = totalPrice > 0 ? `Rp ${totalPrice.toLocaleString('id-ID')}` : 'Sesuai Layanan';
}

function toggleCartDetail() {
    const list = document.getElementById('cartDetailList');
    const icon = document.getElementById('cartDetailIcon');
    const text = document.getElementById('cartDetailToggleText');

    if (list.classList.contains('hidden')) {
        list.classList.remove('hidden');
        icon.classList.add('rotate-180');
        text.innerText = 'Sembunyikan';
    } else {
        list.classList.add('hidden');
        icon.classList.remove('rotate-180');
        text.innerText = 'Lihat Rincian';
    }
}

// Checkout & Modal Pembayaran
function openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const content = document.getElementById('checkoutModalContent');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
    }, 10);
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const content = document.getElementById('checkoutModalContent');
    modal.classList.add('opacity-0');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function selectPaymentMethod(method) {
    selectedPayment = method;
    document.querySelectorAll('.payment-opt-btn').forEach(btn => {
        btn.classList.remove('border-pinky-500', 'bg-pink-50');
        btn.classList.add('border-pink-200', 'bg-white');
    });
    document.getElementById(`payBtn-${method}`).classList.add('border-pinky-500', 'bg-pink-50');

    document.getElementById('paymentDetailBox').classList.remove('hidden');
    document.getElementById('view-qris').classList.add('hidden');
    document.getElementById('view-cash').classList.add('hidden');
    document.getElementById('view-split').classList.add('hidden');

    const submitBtn = document.getElementById('submitOrderBtn');
    submitBtn.classList.remove('bg-gray-300', 'bg-emerald-600', 'hover:bg-emerald-700', 'pink-gradient-btn');
    submitBtn.removeAttribute('disabled');

    if (method === 'qris') {
        document.getElementById('view-qris').classList.remove('hidden');
        submitBtn.classList.add('pink-gradient-btn', 'text-white');
        submitBtn.innerHTML = '<i class="fa-brands fa-whatsapp text-lg"></i><span>Lanjut Bayar QRIS & Kirim ke WA</span>';
    } else if (method === 'cash') {
        document.getElementById('view-cash').classList.remove('hidden');
        submitBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700', 'text-white');
        submitBtn.innerHTML = '<i class="fa-brands fa-whatsapp text-lg"></i><span>Kirim Pesanan Cash ke WA</span>';
    } else if (method === 'split') {
        document.getElementById('view-split').classList.remove('hidden');
        submitBtn.classList.add('pink-gradient-btn', 'text-white');
        submitBtn.innerHTML = '<i class="fa-brands fa-whatsapp text-lg"></i><span>Kirim QRIS + Cash ke WA</span>';
    }
}

function confirmAndSendWA() {
    if (!selectedPayment) return;

    let hasPrint = false;
    let orderLines = [];
    let totalPrice = 0;

    for (let id in cart) {
        let item = cart[id];
        if (item.type === 'print') hasPrint = true;
        orderLines.push(`• ${item.name} (${item.qty}x)${item.price > 0 ? ' - Rp ' + (item.price * item.qty).toLocaleString('id-ID') : ''}`);
        totalPrice += item.price * item.qty;
    }

    let paymentText = "";
    let targetWA = hasPrint ? PINK_PRINT_WA_NUMBER : MAIN_WA_NUMBER;

    if (selectedPayment === 'qris') {
        targetWA = MAIN_WA_NUMBER;
        paymentText = "Metode Pembayaran: *QRIS*\n📌 Catatan: Bukti bayar akan dikirim setelah ini.";
    } else if (selectedPayment === 'cash') {
        paymentText = "Metode Pembayaran: *Tunai / Cash di Tempat*";
    } else if (selectedPayment === 'split') {
        targetWA = MAIN_WA_NUMBER;
        let qVal = document.getElementById('splitQrisAmount').value || '0';
        let cVal = document.getElementById('splitCashAmount').value || '0';
        paymentText = `Metode Pembayaran: *QRIS + Cash*\n- QRIS: Rp ${qVal}\n- Cash: Rp ${cVal}\n📌 Catatan: Bukti bayar QRIS akan dikirim setelah ini.`;
    }

    let message = `Halo Kak, saya ingin membuat pesanan baru di *PINK GROUP*:\n\n` +
                  `${orderLines.join('\n')}\n\n` +
                  (totalPrice > 0 ? `*Total Tagihan: Rp ${totalPrice.toLocaleString('id-ID')}*\n\n` : '') +
                  `${paymentText}\n\n` +
                  `Mohon segera diproses ya kak. Terima kasih! 💖`;

    let encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${targetWA}?text=${encoded}`, '_blank');
    closeCheckoutModal();
}

function downloadQrisImage() {
    let canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 400);

    let img = new Image();
    img.crossOrigin = "anonymous";
    img.src = document.querySelector('#view-qris img') ? document.querySelector('#view-qris img').src : '';
    img.onload = function() {
        ctx.drawImage(img, 50, 50, 300, 300);
        let link = document.createElement('a');
        link.download = 'QRIS-Warung-Pink.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    img.onerror = function() {
        alert('Gagal mendownload gambar QRIS. Silakan simpan manual dari layar.');
    }
}

// QR Web Modal Handlers
function toggleQRModal() {
    const modal = document.getElementById('qrModal');
    const content = document.getElementById('qrModalContent');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
        }, 10);
    } else {
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

function initQRCode(text) {
    const container = document.getElementById('qrcode');
    container.innerHTML = "";
    qrCodeInstance = new QRCode(container, {
        text: text,
        width: 180,
        height: 180,
        colorDark: "#66001f",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function updateQRCode() {
    let urlInput = document.getElementById('customWebUrl').value;
    if (!urlInput) {
        alert('Silakan masukkan link web terlebih dahulu!');
        return;
    }
    initQRCode(urlInput);
}

function downloadQR() {
    const img = document.querySelector('#qrcode img') || document.querySelector('#qrcode canvas');
    if (!img) return;
    let dataUrl = img.tagName === 'CANVAS' ? img.toDataURL('image/png') : img.src;
    let link = document.createElement('a');
    link.download = 'Barcode-Pink-Group.png';
    link.href = dataUrl;
    link.click();
}

function printQR() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html> <head><title>Cetak Barcode Pink Group</title></head> <body style="text-align: center; font-family: sans-serif; padding: 40px;"> <h2>💖 PINK GROUP 💖</h2> <p>Scan untuk membuka layanan Warung Pink, Pink Print & Pink Service</p> <div style="margin: 20px auto;">${document.getElementById('qrcode').innerHTML}</div> <p style="font-size: 12px; color: #666;">Silakan pajang di meja kasir / toko Anda</p> </body> </html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
}

function orderViaWA(text) {
    let encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${MAIN_WA_NUMBER}?text=${encoded}`, '_blank');
}