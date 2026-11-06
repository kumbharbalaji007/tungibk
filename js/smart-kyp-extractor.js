// Diagnostic & Robust Extractor for eGramSwaraj Know Your Panchayat (KYP)
(function() {
  console.clear();
  console.log("🔍 Scanning page for Tungi BK Activities...");

  // Helper to find documents (main page + all iframes)
  let allDocs = [document];
  document.querySelectorAll('iframe').forEach(f => {
    try {
      if (f.contentDocument) allDocs.push(f.contentDocument);
    } catch(e) {}
  });

  let foundRows = [];

  for (let doc of allDocs) {
    // 1. Check if jQuery DataTable exists on this doc
    try {
      let win = doc.defaultView || window;
      if (win.jQuery && win.jQuery.fn && win.jQuery.fn.dataTable) {
        win.jQuery('table').each(function() {
          try {
            let dt = win.jQuery(this).DataTable();
            if (dt && dt.rows().count() > 0) {
              console.log(`🎯 Found DataTable with ${dt.rows().count()} rows!`);
              dt.rows().every(function() {
                let d = this.data();
                if (Array.isArray(d)) {
                  // Strip HTML tags from strings
                  let cleanRow = d.map(val => {
                    let div = document.createElement('div');
                    div.innerHTML = val;
                    return div.innerText.trim();
                  });
                  foundRows.push(cleanRow);
                } else if (typeof d === 'object') {
                  foundRows.push(Object.values(d));
                }
              });
            }
          } catch(e) {}
        });
      }
    } catch(e) {}

    if (foundRows.length > 0) break;

    // 2. Fallback: Search all standard <table> elements
    doc.querySelectorAll('table').forEach(table => {
      let rows = table.querySelectorAll('tr');
      rows.forEach(tr => {
        let cells = tr.querySelectorAll('td');
        if (cells.length >= 4) {
          let textCells = Array.from(cells).map(c => c.innerText.trim());
          // Check if row has an activity code (numeric e.g. 56530851)
          if (textCells.some(t => /^\d{7,10}$/.test(t) || t.includes('काम') || t.includes('योजना'))) {
            foundRows.push(textCells);
          }
        }
      });
    });

    if (foundRows.length > 0) break;
  }

  console.log(`📊 Total extracted rows: ${foundRows.length}`);

  if (foundRows.length === 0) {
    alert("❌ डेटा सापडला नाही. कृपया खात्री करा की 'Activities Information' टॅब उघडी आहे आणि खाली टेबल दिसत आहे.");
    return;
  }

  // Create clean CSV
  let csv = "\uFEFF"; // UTF-8 BOM
  csv += "अ.क्र.,अ‍ॅक्टिव्हिटी कोड (Activity Code),कामाचे नाव (Activity Name),तपशील (Description),प्रकार (Type),स्थिती (Status)\n";

  foundRows.forEach(r => {
    let clean = r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',');
    csv += clean + "\n";
  });

  // 1. Try Clipboard Copy as immediate backup
  try {
    navigator.clipboard.writeText(csv);
    console.log("📋 Copied CSV to Clipboard as well!");
  } catch(e) {}

  // 2. Download File
  let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = `Tungi_BK_Activities_${foundRows.length}_works.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 1000);

  alert(`🎉 यश आले!\n\nतुंगी बु. ची ${foundRows.length} कामे सापडली आणि CSV फाईल डाउनलोड झाली आहे!\n\n(तसेच हा डेटा क्लिपबोर्डवरही कॉपी झाला आहे - तुम्ही थेट Excel किंवा Notepad मध्ये Ctrl+V दाबून पेस्ट करू शकता)`);
})();
