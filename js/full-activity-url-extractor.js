/**
 * Complete Tungi BK Activity Extractor with Direct Government URLs
 * 
 * Extracts:
 * 1. Activity Code
 * 2. Marathi Activity Name
 * 3. Description / Category
 * 4. Work Type
 * 5. Status (ONGOING / APPROVED)
 * 6. Direct Government URL for each activity!
 */

(async function extractAllActivitiesWithURLs() {
  console.clear();
  console.log("🚀 Starting extraction of Tungi BK activities with Direct URLs...");

  // 1. Try to switch to "305 Total Approved Work" if currently showing 14 Ongoing
  const approvedCards = document.querySelectorAll('.card, .box, div, a, button');
  approvedCards.forEach(el => {
    if (el.innerText && el.innerText.includes('305') && el.innerText.includes('Approved')) {
      console.log("👉 Switching to 305 Total Approved Work...");
      try { el.click(); } catch(e) {}
    }
  });

  // Short delay to allow table re-render if it switched
  await new Promise(r => setTimeout(r, 600));

  let extractedItems = [];

  // 2. Read from active table
  const table = document.querySelector('table');
  if (!table) {
    alert("❌ टेबल सापडली नाही. कृपया 'Activities Information' टॅब उघडी असल्याची खात्री करा.");
    return;
  }

  // Check if jQuery DataTable holds the full dataset
  let dt = null;
  try {
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.dataTable) {
      dt = window.jQuery(table).DataTable();
    }
  } catch(e) {}

  if (dt && dt.rows().count() > 0) {
    console.log(`🎯 Found DataTable with ${dt.rows().count()} entries in memory!`);
    
    // Switch pagination to 'All' or maximum so all rows have DOM nodes with URLs
    try {
      dt.page.len(-1).draw();
    } catch(e) {}
  }

  // Now scan all rows in the table
  const rows = table.querySelectorAll('tbody tr, tr');
  rows.forEach(tr => {
    const cells = tr.querySelectorAll('td');
    if (cells.length >= 4) {
      const sNo = cells[0].innerText.trim();
      const codeCell = cells[1];
      const link = codeCell.querySelector('a');
      const code = link ? link.innerText.trim() : codeCell.innerText.trim();
      const name = cells[2] ? cells[2].innerText.trim() : '';
      const desc = cells[3] ? cells[3].innerText.trim() : '';
      const type = cells[4] ? cells[4].innerText.trim() : '';
      const status = cells.length > 5 ? cells[5].innerText.trim() : (cells[4] ? cells[4].innerText.trim() : 'APPROVED');

      // Build official Activity Report URL
      let officialUrl = "";
      if (link) {
        if (link.href && link.href.startsWith('http')) {
          officialUrl = link.href;
        } else if (link.getAttribute('onclick')) {
          // e.g. viewActivityDetails('56530851')
          const match = link.getAttribute('onclick').match(/\d{6,10}/);
          const actCode = match ? match[0] : code;
          officialUrl = `https://egramswaraj.gov.in/viewActivityDetailsReport.do?activityCode=${actCode}`;
        }
      }
      if (!officialUrl && /^\d{6,10}$/.test(code)) {
        officialUrl = `https://egramswaraj.gov.in/viewActivityDetailsReport.do?activityCode=${code}`;
      }

      if (code && name && !name.toLowerCase().includes('activity name')) {
        extractedItems.push({
          sNo: sNo,
          activityCode: code,
          activityName: name,
          description: desc,
          workType: type,
          status: status,
          officialUrl: officialUrl
        });
      }
    }
  });

  console.log(`📊 Extracted ${extractedItems.length} activities with URLs!`);

  if (extractedItems.length === 0) {
    alert("❌ कोणतीही कामे सापडली नाहीत. कृपया पेजवर टेबल दिसत असल्याची खात्री करा.");
    return;
  }

  // 3. Generate CSV with Direct URLs column
  let csv = "\uFEFF"; // UTF-8 BOM
  csv += "अ.क्र.,अ‍ॅक्टिव्हिटी कोड (Activity Code),कामाचे नाव (Activity Name),तपशील (Category),कामाचा प्रकार (Work Type),स्थिती (Status),अधिकृत सरकारी लिंक (Official URL)\n";

  extractedItems.forEach(item => {
    const cleanName = `"${item.activityName.replace(/"/g, '""')}"`;
    const cleanDesc = `"${item.description.replace(/"/g, '""')}"`;
    csv += `${item.sNo},${item.activityCode},${cleanName},${cleanDesc},${item.workType},${item.status},"${item.officialUrl}"\n`;
  });

  // 4. Download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Tungi_BK_${extractedItems.length}_Activities_With_URLs.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 1000);

  // 5. Also copy to clipboard as backup
  try {
    navigator.clipboard.writeText(csv);
  } catch(e) {}

  alert(`🎉 यश आले!\n\nतुंगी बु. ची ${extractedItems.length} कामे प्रत्येकाच्या थेट सरकारी लिंकसह (Direct URLs) CSV मध्ये डाउनलोड झाली आहेत!`);
})();
