/**
 * Tungi BK Gram Panchayat Transparency Portal - UI Application Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    initSpeechVoices();
    await DataService.init();
    renderSummary();
    renderWorks();
    renderBeneficiaries();
    renderProofsTable();
    renderGramSabhaSection();
    setupEventListeners();
    checkDisclaimerOnLoad();
    handleDeepLinkOnLoad();
  } catch (e) {
    console.error('Initialization error:', e);
    showToast('माहिती लोड करण्यात त्रुटी आली. कृपया पुन्हा लोड करा.', 'error');
  }
});

let currentCategory = 'all';
let currentSearchQuery = '';
let activeSpeechUtterance = null;

// Render Summary Metrics
function renderSummary() {
  const summary = DataService.getSummary();
  const village = DataService.getVillageInfo();
  if (!summary) return;

  document.getElementById('total-expenditure-marathi').innerText = DataService.formatMarathiCurrency(summary.totalExpenditure);
  document.getElementById('total-expenditure-words').innerText = summary.totalExpenditureWords;
  document.getElementById('total-works-count').innerText = summary.totalWorks + ' कामे';
  document.getElementById('total-beneficiaries-count').innerText = summary.totalBeneficiaries + ' कंत्राटदार / संस्था';
  document.getElementById('current-fin-year').innerText = summary.financialYear;
}

// Render Works Cards (WhatsApp Style Feed)
function renderWorks() {
  const container = document.getElementById('works-container');
  const allWorks = DataService.getAllWorks();

  const filtered = allWorks.filter(w => {
    const matchesCat = currentCategory === 'all' || w.categoryKey === currentCategory;
    const matchesSearch = !currentSearchQuery || 
      w.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
      w.location.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
      w.voucherNo.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
      w.payees.some(p => p.name.toLowerCase().includes(currentSearchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div class="text-4xl mb-3">🔍</div>
        <h3 class="text-lg font-bold text-gray-700">कोणतीही कामे सापडली नाहीत</h3>
        <p class="text-sm text-gray-500 mt-1">कृपया शोध शब्द बदलून पहा किंवा 'सर्व कामे' निवडा.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(work => {
    const payeesList = work.payees.map(p => `
      <div class="flex items-center justify-between text-xs py-1.5 px-2 bg-gray-50 rounded-lg border border-gray-100 mt-1">
        <span class="font-medium text-gray-800"><i class="fas fa-user-check text-emerald-600 mr-1.5"></i>${p.name}</span>
        <span class="font-bold text-emerald-700">${DataService.formatMarathiCurrency(p.amount)}</span>
      </div>
    `).join('');

    return `
      <div class="whatsapp-card bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col justify-between" id="card-${work.id}">
        <!-- Top Card Header -->
        <div class="p-4 sm:p-5">
          <div class="flex items-start justify-between gap-3 mb-2">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              ${work.status}
            </span>
            <span class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              व्हाउचर: ${work.voucherNo}
            </span>
          </div>

          <h3 class="text-lg font-bold text-gray-900 leading-snug devanagari-bold mb-2">
            ${work.title}
          </h3>

          <div class="flex items-center text-xs text-gray-500 mb-3">
            <i class="fas fa-map-marker-alt text-red-500 mr-1.5"></i>
            <span>${work.location}</span>
            <span class="mx-2">•</span>
            <i class="far fa-calendar-alt text-gray-400 mr-1"></i>
            <span>${work.date}</span>
          </div>

          <!-- Highlight Amount Box -->
          <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3.5 mb-3">
            <div class="text-xs text-emerald-800 font-medium">एकूण मंजूर व अदा रक्कम:</div>
            <div class="text-2xl font-extrabold text-emerald-700 devanagari-bold mt-0.5">
              ${DataService.formatMarathiCurrency(work.amount)}
            </div>
            <div class="text-xs text-emerald-900 opacity-80 mt-0.5">
              (${work.amountWords})
            </div>
          </div>

          <!-- Photo Preview (Clickable) -->
          ${work.photoGallery && work.photoGallery.length > 0 ? `
            <div class="relative rounded-xl overflow-hidden mb-3 border border-gray-200 cursor-pointer group" onclick="openPhotoModal('${work.photoGallery[0]}', '${work.title}')">
              <img src="${work.photoGallery[0]}" alt="${work.title}" class="w-full h-40 object-cover object-top group-hover:scale-105 transition duration-300" />
              <div class="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                <span class="bg-white text-gray-900 text-xs font-bold py-1 px-3 rounded-full shadow">
                  <i class="fas fa-search-plus mr-1"></i> मोठा पुरावा पहा
                </span>
              </div>
              <div class="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-[11px] font-medium px-2 py-0.5 rounded">
                <i class="fas fa-file-invoice text-emerald-400 mr-1"></i> सरकारी पावती पुरावा
              </div>
            </div>
          ` : ''}

          <!-- Marathi Description -->
          <p class="text-xs text-gray-600 leading-relaxed mb-3">
            ${work.marathiDescription}
          </p>

          <!-- Payees / Contractors Breakdown -->
          <div class="mb-2">
            <div class="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              कोणाच्या खात्यावर जमा झाले:
            </div>
            ${payeesList}
          </div>
        </div>

        <!-- Action Bar (Footer of Card) -->
        <div class="bg-gray-50 border-t border-gray-100 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
          <!-- Voice Button -->
          <button 
            type="button" 
            onclick="speakWork('${work.id}')"
            class="audio-btn-${work.id} inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-emerald-700 transition"
            title="मराठीत ऐका">
            <i class="fas fa-volume-up text-emerald-600 mr-1 sm:mr-1.5 text-sm"></i>
            <span>ऐका</span>
          </button>

          <!-- WhatsApp Share Button with Deep Link -->
          <button 
            type="button"
            onclick="shareOnWhatsApp('${work.id}')"
            class="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-[#25D366] text-white hover:bg-[#20ba59] shadow-sm transition"
            title="व्हॉट्सॲपवर पाठवा (Direct Link सह)">
            <i class="fab fa-whatsapp text-sm mr-1 sm:mr-1.5"></i>
            <span>शेअर</span>
          </button>

          <!-- Copy Deep Link Button -->
          <button 
            type="button"
            onclick="copyWorkLink('${work.id}')"
            class="inline-flex items-center px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-emerald-700 transition"
            title="या कामाची थेट लिंक कॉपी करा">
            <i class="fas fa-link text-gray-400 mr-1 text-xs"></i>
            <span class="hidden sm:inline">लिंक</span>
          </button>

          <!-- Official Proof Details Modal Button -->
          <button 
            type="button"
            onclick="openVoucherModal('${work.id}')"
            class="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm transition">
            <i class="fas fa-file-shield mr-1 sm:mr-1.5"></i>
            <span>पुरावा</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render Beneficiary / Payout Transparency Ledger
function renderBeneficiaries() {
  const container = document.getElementById('beneficiaries-container');
  const beneficiaries = DataService.getAllBeneficiaries();

  // Sort descending by total received amount
  const sorted = [...beneficiaries].sort((a, b) => b.totalAmount - a.totalAmount);

  container.innerHTML = sorted.map((b, index) => {
    return `
      <div class="whatsapp-card bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                #${index + 1}
              </span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
                ${b.type}
              </span>
            </div>
            <span class="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              ${b.workCount} कामांचे पेमेंट
            </span>
          </div>

          <h3 class="text-base font-bold text-gray-900 devanagari-bold mb-1">
            ${b.name}
          </h3>

          <!-- Bank Account details -->
          <div class="flex items-center text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <i class="fas fa-university text-gray-400 mr-2"></i>
            <span>बँक खाते: <strong class="text-gray-800 font-mono">${b.accountMask}</strong> (${b.accountType})</span>
          </div>

          <!-- Total Received Payout Box -->
          <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-3.5 mb-3 shadow-sm">
            <div class="text-xs opacity-90 font-medium">वर्षभरात खात्यावर जमा झालेली एकूण रक्कम:</div>
            <div class="text-2xl font-extrabold devanagari-bold mt-0.5">
              ${DataService.formatMarathiCurrency(b.totalAmount)}
            </div>
            <div class="text-xs opacity-90 mt-0.5">
              (${b.totalAmountWords})
            </div>
          </div>

          <!-- Associated Works -->
          <div class="text-xs text-gray-600 mb-3">
            <div class="font-bold text-gray-800 mb-1">केलेली कामे / पुरवलेले साहित्य:</div>
            <p class="leading-relaxed bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-200">
              ${b.worksSummary}
            </p>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
          <span>व्हाउचर्स: <strong class="text-gray-700">${b.vouchers.join(', ')}</strong></span>
          <button 
            type="button" 
            onclick="filterByBeneficiary('${b.name}')" 
            class="text-emerald-700 hover:text-emerald-900 font-bold">
            कामे पहा &rarr;
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render Proofs & Vouchers Table View
function renderProofsTable() {
  const container = document.getElementById('proofs-table-body');
  const allWorks = DataService.getAllWorks();

  container.innerHTML = allWorks.map(w => {
    return `
      <tr class="hover:bg-gray-50 border-b border-gray-200 transition">
        <td class="px-4 py-3 font-mono text-xs font-bold text-gray-900">
          ${w.voucherNo}
        </td>
        <td class="px-4 py-3 text-xs text-gray-600">
          ${w.date}
        </td>
        <td class="px-4 py-3 text-xs font-semibold text-gray-800">
          ${w.title}
        </td>
        <td class="px-4 py-3 text-xs font-bold text-emerald-700">
          ${DataService.formatMarathiCurrency(w.amount)}
        </td>
        <td class="px-4 py-3 text-xs text-gray-600">
          ${w.payees.map(p => p.name).join(', ')}
        </td>
        <td class="px-4 py-3 text-xs">
          <span class="inline-flex items-center text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
            <i class="fas fa-paperclip mr-1 text-gray-400"></i>${w.attachedBill}
          </span>
        </td>
        <td class="px-4 py-3 text-xs text-right whitespace-nowrap">
          <a 
            href="${w.officialUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-sm">
            <i class="fas fa-external-link-alt mr-1.5"></i>
            <span>eGramSwaraj पावती</span>
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// Filter by Beneficiary
function filterByBeneficiary(name) {
  switchTab('tab-works');
  const searchInput = document.getElementById('search-input');
  searchInput.value = name;
  currentSearchQuery = name;
  renderWorks();
  showToast(`'${name}' यांची कामे दाखवत आहोत`, 'info');
}

// Variables for Attendee Table filtering & search
let currentAttendeeCategory = 'all';
let currentAttendeeSearch = '';

// Render Gram Sabha Section (Scheduled Meetings, Paper Scans, Resolutions & Attendees)
function renderGramSabhaSection() {
  const gs = DataService.getGramSabha();
  if (!gs) return;

  // 1. Render Scheduled Meetings (शासकीय नोंदणीकृत सभा)
  const schedBody = document.getElementById('scheduled-meetings-body');
  if (schedBody && gs.scheduledMeetings) {
    schedBody.innerHTML = gs.scheduledMeetings.map(m => `
      <tr class="hover:bg-amber-50/60 border-b border-gray-200 transition">
        <td class="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
          <i class="far fa-calendar-alt text-amber-600 mr-1.5"></i>${m.registeredOn}
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="font-bold text-gray-900">तुंगी बुद्रुक - Tungi (Bu)</div>
          <div class="text-[11px] text-gray-500 font-mono">Ausa › Latur › MAHARASHTRA</div>
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            ${m.meetingType}
          </span>
        </td>
        <td class="px-4 py-3 font-medium text-gray-800 leading-snug">
          ${m.purpose}
        </td>
        <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
          <i class="far fa-clock text-emerald-600 mr-1.5"></i>${m.date}
        </td>
        <td class="px-4 py-3 text-gray-600 leading-snug">
          <i class="fas fa-map-marker-alt text-red-500 mr-1"></i>${m.venue}
        </td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <i class="fas fa-check-circle text-emerald-600 mr-1"></i>${m.status || 'संपन्न'}
          </span>
        </td>
      </tr>
    `).join('');
  }

  // 2. Render Paper Scans Gallery (हस्तलिखित रजिस्टर व नोटीस फोटो)
  const scansGrid = document.getElementById('paper-scans-grid');
  if (scansGrid && gs.paperScans) {
    scansGrid.innerHTML = gs.paperScans.map(s => `
      <div class="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group">
        <div class="relative h-44 overflow-hidden bg-gray-200 cursor-pointer" onclick="openPhotoModal('${s.file}', '${s.title}')">
          <img src="${s.file}" alt="${s.title}" class="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300" />
          <div class="absolute top-2 left-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-black/75 text-white">
              ${s.tag}
            </span>
          </div>
          <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
            <span class="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow">
              <i class="fas fa-search-plus mr-1"></i> झूम करून पहा
            </span>
          </div>
        </div>
        <div class="p-3 bg-white flex flex-col justify-between flex-1">
          <h4 class="text-xs font-bold text-gray-900 leading-snug mb-2 devanagari-bold line-clamp-2">
            ${s.title}
          </h4>
          <button 
            onclick="openPhotoModal('${s.file}', '${s.title}')" 
            class="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 transition flex items-center justify-center gap-1.5">
            <i class="fas fa-expand text-emerald-600"></i>
            <span>मोठा फोटो उघडा</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  // 3. Render Resolutions (विषय व ठराव)
  const resContainer = document.getElementById('resolutions-container');
  if (resContainer && gs.resolutions) {
    resContainer.innerHTML = gs.resolutions.map(r => `
      <div class="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:border-emerald-300 transition">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            ${r.resNo}
          </span>
          <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            <i class="fas fa-check-circle mr-1"></i>${r.status}
          </span>
        </div>
        <h4 class="text-sm font-bold text-gray-900 devanagari-bold mb-2">
          ${r.topic}
        </h4>
        <p class="text-xs text-gray-600 leading-relaxed mb-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          ${r.details}
        </p>
        <div class="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100 pt-2">
          <span>सुचक: <strong class="text-gray-700">${r.proposer}</strong></span>
          <span>अनुमोदक: <strong class="text-gray-700">${r.seconder}</strong></span>
        </div>
      </div>
    `).join('');
  }

  // 4. Render Attendees Table (हजेरी यादी)
  renderAttendeesTable(gs.attendees);

  // Setup attendee search
  const attSearch = document.getElementById('attendee-search');
  if (attSearch) {
    attSearch.addEventListener('input', (e) => {
      currentAttendeeSearch = e.target.value.trim();
      applyAttendeeFilters();
    });
  }
}

// Attendee category filter
window.filterAttendeeCategory = function(cat, btnEl) {
  currentAttendeeCategory = cat;
  document.querySelectorAll('.att-cat-pill').forEach(btn => {
    btn.classList.remove('bg-emerald-700', 'text-white', 'shadow-sm');
    btn.classList.add('bg-gray-100', 'text-gray-700');
  });
  if (btnEl) {
    btnEl.classList.remove('bg-gray-100', 'text-gray-700');
    btnEl.classList.add('bg-emerald-700', 'text-white', 'shadow-sm');
  }
  applyAttendeeFilters();
};

function applyAttendeeFilters() {
  const gs = DataService.getGramSabha();
  if (!gs || !gs.attendees) return;

  const q = currentAttendeeSearch.toLowerCase();
  const filtered = gs.attendees.filter(a => {
    const matchesCat = currentAttendeeCategory === 'all' || 
      (currentAttendeeCategory === 'ग्रामस्थ' && a.category === 'ग्रामस्थ') ||
      (currentAttendeeCategory === 'महिला' && (a.category === 'महिला' || a.role.includes('महिला'))) ||
      (currentAttendeeCategory === 'अधिकारी' && (a.category === 'शासकीय अधिकारी' || a.category === 'कर्मचारी'));

    const matchesSearch = !q ||
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.sNo.toString().includes(q);

    return matchesCat && matchesSearch;
  });

  renderAttendeesTable(filtered);
}

function renderAttendeesTable(attendeesList) {
  const container = document.getElementById('attendees-table-body');
  if (!container) return;

  if (!attendeesList || attendeesList.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-xs text-gray-500">
          <i class="fas fa-search text-gray-400 text-lg mb-1 block"></i>
          शोधलेल्या निकषांनुसार कोणीही व्यक्ती हजेरी यादीत सापडली नाही.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = attendeesList.map(a => `
    <tr class="hover:bg-amber-50/50 border-b border-gray-200 transition">
      <td class="px-4 py-3 font-mono font-bold text-gray-600">${a.sNo}</td>
      <td class="px-4 py-3 font-bold text-gray-900 devanagari-bold">
        <i class="fas fa-user-circle text-gray-400 mr-1.5"></i>${a.name}
      </td>
      <td class="px-4 py-3 text-gray-700">${a.role}</td>
      <td class="px-4 py-3 whitespace-nowrap">
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
          a.category === 'महिला' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
          a.category === 'शासकीय अधिकारी' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          a.category === 'कर्मचारी' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
          'bg-gray-100 text-gray-700'
        }">
          ${a.category}
        </span>
      </td>
      <td class="px-4 py-3 whitespace-nowrap">
        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
          a.signatureStatus.includes('अंगठा') ? 'bg-amber-50 text-amber-800 border border-amber-200' :
          'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }">
          <i class="${a.signatureStatus.includes('अंगठा') ? 'fas fa-fingerprint' : 'fas fa-signature'} mr-1 text-[10px]"></i>
          ${a.signatureStatus}
        </span>
      </td>
      <td class="px-4 py-3 text-right whitespace-nowrap">
        ${a.scanSheet ? `
          <button 
            onclick="openPhotoModal('${a.scanSheet}', 'अ.क्र. ${a.sNo}: ${a.name} - मूळ रजिस्टर हजेरी नोंद')" 
            class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 transition shadow-sm">
            <i class="fas fa-file-invoice text-emerald-600 mr-1"></i>
            <span>रजिस्टर पान पहा</span>
          </button>
        ` : '-'}
      </td>
    </tr>
  `).join('');
}

// Category filter button click
window.filterCategory = function(cat, buttonEl) {
  currentCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.classList.remove('bg-emerald-700', 'text-white');
    btn.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
  });
  if (buttonEl) {
    buttonEl.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
    buttonEl.classList.add('bg-emerald-700', 'text-white');
  }
  renderWorks();
};

// Search handling
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      renderWorks();
    });
  }
}

// Tab Switching
window.switchTab = function(tabId) {
  // Hide all sections
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));

  // Reset tab buttons
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.remove('border-amber-400', 'text-white', 'font-black', 'bg-emerald-900/80');
    btn.classList.add('border-transparent', 'text-emerald-200/90', 'font-semibold');
  });

  // Show active tab
  const activeSection = document.getElementById(tabId);
  if (activeSection) {
    activeSection.classList.remove('hidden');
  }

  // Highlight active tab button
  const activeBtn = document.getElementById(`btn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.remove('border-transparent', 'text-emerald-200/90', 'font-semibold');
    activeBtn.classList.add('border-amber-400', 'text-white', 'font-black', 'bg-emerald-900/80');
  }

  // Smooth scroll up so user sees the newly selected tab content immediately
  const mainEl = document.querySelector('main');
  if (mainEl) {
    const topPos = mainEl.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
  }
};

// ================= SPEECH SYNTHESIS CONTROLLER =================
let availableVoices = [];

function initSpeechVoices() {
  if ('speechSynthesis' in window) {
    availableVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      availableVoices = window.speechSynthesis.getVoices();
    };
  }
}

// Clean text for speech so it NEVER says "Indian Rupee" or "comma comma"
function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    // Remove parenthetical English abbreviations or amounts like (₹८३,९०४) or (Musa Patel)
    .replace(/\([^)]*\)/g, ' ')
    // Replace rupee symbol or variants with Devanagari word 'रुपये'
    .replace(/₹\s*/g, ' रुपये ')
    .replace(/Rs\.?\s*/gi, ' रुपये ')
    .replace(/INR\s*/gi, ' रुपये ')
    // Strip commas, colons, semicolons, brackets, slashes that cause pauses or "comma comma"
    .replace(/[,;:\/\\~_#*~`\-]/g, ' ')
    // Remove english letters if any
    .replace(/[a-zA-Z]/g, ' ')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim();
}

function getBestIndicVoice() {
  if (!availableVoices.length && 'speechSynthesis' in window) {
    availableVoices = window.speechSynthesis.getVoices();
  }
  // 1. Marathi voice (mr-IN)
  let voice = availableVoices.find(v => v.lang === 'mr-IN' || v.lang.startsWith('mr'));
  if (voice) return { voice, lang: 'mr-IN' };

  // 2. Hindi voice (hi-IN) - Devanagari script is identical, reads Marathi fluently!
  voice = availableVoices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
  if (voice) return { voice, lang: 'hi-IN' };

  // 3. Indian English voice fallback
  voice = availableVoices.find(v => v.lang.includes('IN') || v.name.toLowerCase().includes('india'));
  if (voice) return { voice, lang: voice.lang };

  return null;
}

// Text to Speech Audio Narration (मराठीत वाचून दाखवा)
window.speakWork = function(workId) {
  const work = DataService.getAllWorks().find(w => w.id === workId);
  if (!work) return;

  if (!('speechSynthesis' in window)) {
    showToast('आपल्या ब्राउझरमध्ये ऑडिओ सुविधा उपलब्ध नाही.', 'error');
    return;
  }

  // If already speaking, toggle stop
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    document.querySelectorAll('[class^="audio-btn-"]').forEach(btn => btn.classList.remove('speaking-active'));
    showToast('ऑडिओ थांबवला आहे.', 'info');
    return;
  }

  // Build clean, natural Marathi sentences without raw symbols, English letters or stray commas
  const cleanTitle = cleanTextForSpeech(work.title);
  const cleanLocation = cleanTextForSpeech(work.location);
  const cleanDesc = cleanTextForSpeech(work.marathiDescription);
  const cleanAmountWords = cleanTextForSpeech(work.amountWords);
  const cleanPayees = work.payees.map(p => cleanTextForSpeech(p.name)).filter(Boolean).join(' आणि ');

  const textToSpeak = `ग्रामपंचायत तुंगी बुद्रुक. कामाचे नाव. ${cleanTitle}. जागा. ${cleanLocation}. एकूण खर्च. ${cleanAmountWords}. निधी मिळालेली व्यक्ती. ${cleanPayees}. अधिक तपशील. ${cleanDesc}.`;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  
  const indicVoice = getBestIndicVoice();
  if (indicVoice) {
    utterance.voice = indicVoice.voice;
    utterance.lang = indicVoice.lang;
  } else {
    utterance.lang = 'mr-IN';
  }

  utterance.rate = 0.88; // Slightly measured rate for crystal-clear rural comprehension
  utterance.pitch = 1.0;

  const btn = document.querySelector(`.audio-btn-${workId}`);
  if (btn) btn.classList.add('speaking-active');

  utterance.onend = () => {
    if (btn) btn.classList.remove('speaking-active');
  };
  utterance.onerror = (e) => {
    console.warn('Speech error:', e);
    if (btn) btn.classList.remove('speaking-active');
  };

  window.speechSynthesis.speak(utterance);
  showToast('मराठीत ऑडिओ सुरू आहे... थांबवण्यासाठी पुन्हा दाबा.', 'info');
};

// ================= WHATSAPP SHARE & DEEP LINK CONTROLLER =================

// Get current portal base URL (automatically works on local, GitHub Pages, or custom domain)
function getPortalBaseUrl() {
  if (window.location.origin && window.location.origin.startsWith('http')) {
    return window.location.origin + window.location.pathname.replace(/\/index\.html$/i, '').replace(/\/+$/, '');
  }
  return 'https://kumbharbalaji007.github.io/tungibk';
}

// WhatsApp 1-Tap Share for Individual Work Card (includes Portal Deep Link + Govt Link)
window.shareOnWhatsApp = function(workId) {
  const work = DataService.getAllWorks().find(w => w.id === workId);
  if (!work) return;

  const baseUrl = getPortalBaseUrl();
  const directLink = `${baseUrl}/?work=${work.id}`;

  const msg = 
`🚩 *ग्रामपंचायत तुंगी बुद्रुक (Tungi BK) - पारदर्शकता हिशोब* 🚩
━━━━━━━━━━━━━━━━━━━━
📌 *कामाचे नाव:* ${work.title}
📍 *जागा:* ${work.location}
💰 *झालेला खर्च:* ₹${work.amount.toLocaleString('en-IN')} (${work.amountWords})
📅 *व्हाउचर तारीख:* ${work.date} (क्र. ${work.voucherNo})
👤 *निधी कोणाला मिळाला:* ${work.payees.map(p => p.name + ' - ₹' + p.amount.toLocaleString('en-IN')).join(', ')}
📜 *संलग्न बिल:* ${work.attachedBill}

📱 *तुंगी बु. पोर्टलवर थेट पाहण्यासाठी लिंक:*
👉 ${directLink}

✅ *अधिकृत शासकीय पुरावा (eGramSwaraj):*
${work.officialUrl}
━━━━━━━━━━━━━━━━━━━━
_टीप: ही माहिती केंद्र सरकारच्या ई-ग्रामस्वराज पोर्टलवरून वैयक्तिक अभ्यासासाठी संकलित केलेली आहे._`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(whatsappUrl, '_blank');
};

// Share Entire Portal on WhatsApp
window.sharePortalOnWhatsApp = function() {
  const baseUrl = getPortalBaseUrl();
  const msg = 
`🚩 *ग्रामपंचायत तुंगी बुद्रुक (Tungi BK) - पारदर्शकता पोर्टल* 🚩
━━━━━━━━━━━━━━━━━━━━
गावातील विकासकामांचा १५ लाख रुपयांचा हिशोब, कंत्राटदारांना मिळालेला निधी आणि २ ऑक्टोबरच्या ग्रामसभेची अधिकृत हजेरी पाहण्यासाठी खालील लिंक उघडा:

👉 ${baseUrl}/

✅ कामांची यादी, फोटो आणि मराठीत आवाज ऐकण्याची सोय.
✅ ग्रामसभेतील कागदावरील सह्यांचे मूळ रजिस्टर फोटो.
✅ शासकीय eGramSwaraj व Meeting Online पोर्टलचे थेट पुरावे.
━━━━━━━━━━━━━━━━━━━━
_टीप: हे पोर्टल केवळ माहिती व वैयक्तिक पारदर्शकतेसाठी आहे._`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(whatsappUrl, '_blank');
};

// Copy Work Deep Link to Clipboard
window.copyWorkLink = function(workId) {
  const baseUrl = getPortalBaseUrl();
  const directLink = `${baseUrl}/?work=${workId}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(directLink).then(() => {
      showToast('या कामाची थेट लिंक कॉपी झाली! आपण कोठेही शेअर करू शकता.', 'info');
    }).catch(() => fallbackCopy(directLink));
  } else {
    fallbackCopy(directLink);
  }
};

function fallbackCopy(text) {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  showToast('या कामाची थेट लिंक कॉपी झाली!', 'info');
}

// Open Voucher Detail Modal
window.openVoucherModal = function(workId) {
  const work = DataService.getAllWorks().find(w => w.id === workId);
  if (!work) return;

  const modal = document.getElementById('voucher-modal');
  const body = document.getElementById('voucher-modal-content');

  body.innerHTML = `
    <div class="p-6">
      <div class="flex items-center justify-between border-b pb-4 mb-4">
        <div>
          <span class="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            eGramSwaraj अधिकृत व्हाउचर
          </span>
          <h2 class="text-xl font-extrabold text-gray-900 mt-1 devanagari-bold">
            ${work.title}
          </h2>
        </div>
        <button onclick="closeVoucherModal()" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5">
        <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div class="text-gray-500">व्हाउचर क्रमांक (Voucher No):</div>
          <div class="text-sm font-bold text-gray-900 font-mono mt-0.5">${work.voucherNo}</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div class="text-gray-500">व्हाउचर तारीख (Date):</div>
          <div class="text-sm font-bold text-gray-900 mt-0.5">${work.date}</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div class="text-gray-500">योजना (Scheme Name):</div>
          <div class="text-sm font-bold text-gray-900 mt-0.5">${work.scheme}</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div class="text-gray-500">अ‍ॅक्टिव्हिटी कोड (Activity Code):</div>
          <div class="text-sm font-bold text-gray-900 mt-0.5">${work.activityCode}</div>
        </div>
        <div class="col-span-full bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div class="text-gray-500">लेखा शीर्षक (Account Head):</div>
          <div class="text-xs font-semibold text-gray-800 mt-0.5">${work.accountHead}</div>
        </div>
      </div>

      <!-- Amount Banner -->
      <div class="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-5 flex items-center justify-between">
        <div>
          <div class="text-xs text-emerald-800 font-bold">एकूण अदा रक्कम:</div>
          <div class="text-2xl font-black text-emerald-700 devanagari-bold">
            ${DataService.formatMarathiCurrency(work.amount)}
          </div>
          <div class="text-xs text-emerald-900 opacity-90">${work.amountWords}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500">संलग्न सरकारी बिल PDF:</div>
          <div class="text-xs font-mono font-bold text-gray-800 bg-white px-2 py-1 rounded border border-gray-200 mt-1">
            <i class="fas fa-file-pdf text-red-500 mr-1"></i>${work.attachedBill}
          </div>
        </div>
      </div>

      <!-- Payee Accounts Breakdown -->
      <div class="mb-5">
        <h4 class="text-sm font-bold text-gray-900 mb-2">खाते व पेमेंट तपशील (PFMS):</h4>
        <div class="space-y-2">
          ${work.payees.map(p => `
            <div class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div>
                <div class="text-sm font-bold text-gray-800">${p.name}</div>
                <div class="text-xs text-gray-500">बँक खाते: <span class="font-mono">${p.account}</span> (${p.mode})</div>
              </div>
              <div class="text-right">
                <div class="text-base font-extrabold text-emerald-700">
                  ${DataService.formatMarathiCurrency(p.amount)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Evidence Screenshot Preview -->
      ${work.evidenceScreenshot ? `
        <div class="mb-5">
          <h4 class="text-sm font-bold text-gray-900 mb-2">सरकारी संकेतस्थळाचा स्क्रीनशॉट पुरावा:</h4>
          <div class="border rounded-xl overflow-hidden cursor-pointer" onclick="openPhotoModal('${work.evidenceScreenshot}', '${work.title}')">
            <img src="${work.evidenceScreenshot}" alt="Proof" class="w-full h-auto max-h-60 object-contain bg-gray-50 hover:opacity-95" />
          </div>
        </div>
      ` : ''}

      <!-- Direct Links & Sharing Bar -->
      <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button 
            type="button"
            onclick="shareOnWhatsApp('${work.id}')"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white transition shadow">
            <i class="fab fa-whatsapp mr-1.5 text-base"></i>
            WhatsApp शेअर
          </button>
          <button 
            type="button"
            onclick="copyWorkLink('${work.id}')"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition shadow-sm">
            <i class="fas fa-link mr-1.5 text-gray-500"></i>
            लिंक कॉपी
          </button>
        </div>
        <a 
          href="${work.officialUrl}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow">
          <i class="fas fa-external-link-alt mr-2"></i>
          eGramSwaraj वर थेट उघडा
        </a>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
};

window.closeVoucherModal = function() {
  document.getElementById('voucher-modal').classList.add('hidden');
};

// Open Photo Preview Modal
window.openPhotoModal = function(photoUrl, title) {
  const modal = document.getElementById('photo-modal');
  const img = document.getElementById('photo-modal-img');
  const caption = document.getElementById('photo-modal-title');

  img.src = photoUrl;
  caption.innerText = title;
  modal.classList.remove('hidden');
};

window.closePhotoModal = function() {
  document.getElementById('photo-modal').classList.add('hidden');
};

// ================= DISCLAIMER MODAL CONTROLLER =================

// Open Disclaimer Modal
window.openDisclaimerModal = function() {
  const modal = document.getElementById('disclaimer-modal');
  if (modal) modal.classList.remove('hidden');
};

// Accept & Close Disclaimer Modal
window.acceptDisclaimerModal = function() {
  const modal = document.getElementById('disclaimer-modal');
  if (modal) modal.classList.add('hidden');
  try {
    sessionStorage.setItem('tungi_disclaimer_accepted', 'true');
  } catch (e) {}
};

// Check Disclaimer on Page Load
function checkDisclaimerOnLoad() {
  try {
    const accepted = sessionStorage.getItem('tungi_disclaimer_accepted');
    if (!accepted) {
      setTimeout(() => {
        openDisclaimerModal();
      }, 400);
    }
  } catch (e) {
    openDisclaimerModal();
  }
}

// Handle Deep Link (?work=work_X) on Page Load
function handleDeepLinkOnLoad() {
  const params = new URLSearchParams(window.location.search);
  const targetWorkId = params.get('work') || window.location.hash.replace('#', '').replace('card-', '');

  if (targetWorkId) {
    // If arriving directly via deep link, auto-acknowledge disclaimer modal so work is immediately in focus
    try {
      sessionStorage.setItem('tungi_disclaimer_accepted', 'true');
    } catch (e) {}
    const discModal = document.getElementById('disclaimer-modal');
    if (discModal) discModal.classList.add('hidden');

    switchTab('tab-works');

    setTimeout(() => {
      const card = document.getElementById(`card-${targetWorkId}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('ring-4', 'ring-amber-400', 'shadow-2xl');
        
        // Add animated indicator banner
        const badge = document.createElement('div');
        badge.id = 'deeplink-highlight-badge';
        badge.className = 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs py-2 px-3 text-center shadow flex items-center justify-center gap-1.5 animate-bounce rounded-t-xl';
        badge.innerHTML = '<i class="fas fa-bullseye text-amber-200"></i> <span>आपण व्हॉट्सॲपवरून उघडलेले काम येथे आहे</span>';
        card.prepend(badge);

        showToast('आपण निवडलेले काम हायलाइट केले आहे.', 'info');

        setTimeout(() => {
          card.classList.remove('ring-4', 'ring-amber-400', 'shadow-2xl');
          if (badge) badge.remove();
        }, 7000);
      }
    }, 600);
  }
}

// Simple Toast Notification
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  const bg = type === 'error' ? 'bg-red-600' : type === 'info' ? 'bg-emerald-700' : 'bg-gray-800';
  toast.className = `fixed bottom-5 right-5 z-50 ${bg} text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg transition transform translate-y-0`;
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
