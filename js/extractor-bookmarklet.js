/**
 * eGramSwaraj 1-Click Browser Extractor Bookmarklet for Tungi BK
 * 
 * Usage:
 * 1. Open Chrome/Edge with Urban VPN active.
 * 2. Go to https://egramswaraj.gov.in and open the village voucher report for Tungi BK (LGD: 179414).
 * 3. Press F12 -> Console -> Paste this entire script and press Enter.
 *    OR create a browser bookmark with URL: javascript:(function(){...})()
 * 4. A file named 'tungi_extracted_vouchers.json' will automatically download to your computer!
 */

(function() {
  console.log("eGramSwaraj Extractor Started for Tungi BK...");

  const tables = document.querySelectorAll('table');
  if (tables.length === 0) {
    alert("कोणतीही टेबल सापडली नाही. कृपया eGramSwaraj व्हाउचर रिपोर्ट पेज उघडा.");
    return;
  }

  const results = [];
  // Search for tables containing Voucher or Vendor information
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr');
    rows.forEach((tr, index) => {
      const cells = tr.querySelectorAll('td');
      if (cells.length >= 4) {
        const textRow = Array.from(cells).map(c => c.innerText.trim());
        const link = tr.querySelector('a');
        results.push({
          row: index,
          cells: textRow,
          url: link ? link.href : window.location.href
        });
      }
    });
  });

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    village: "Tungi BK (तुंगी बु.)",
    localBodyCode: "179414",
    stateCode: "27",
    sourceUrl: window.location.href,
    extractedRowsCount: results.length,
    rows: results
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const dl = document.createElement('a');
  dl.setAttribute("href", dataStr);
  dl.setAttribute("download", `tungi_egramswaraj_data_${Date.now()}.json`);
  document.body.appendChild(dl);
  dl.click();
  dl.remove();

  alert(`यशस्वी! eGramSwaraj वरून ${results.length} ओळींचा डेटा JSON फाईलमध्ये डाउनलोड झाला आहे.`);
})();
