/**
 * eGramSwaraj "View Activity Details Report" Modal Auto-Extractor
 * 
 * Instructions:
 * When you open the popup / modal for any Activity (like your screenshot with 'Fund Allocation', 
 * 'Technical Approval Details', etc.):
 * 1. Press F12 -> Console
 * 2. Paste this code and press ENTER.
 * 3. It will automatically click all [+] sections to expand them and download the full report in JSON & text!
 */

(function extractActivityModal() {
  console.log("🔍 Expanding all sections in View Activity Details Report...");

  // 1. Expand all collapsed accordion sections by clicking them if they have '+'
  const accordionHeaders = document.querySelectorAll('.accordion-header, .panel-heading, [class*="accordion"], a[href*="#"], h4, h5');
  accordionHeaders.forEach(el => {
    if (el.innerText && (el.innerText.includes('+') || el.innerText.includes('Details') || el.innerText.includes('Approval'))) {
      try { el.click(); } catch (e) {}
    }
  });

  // Wait 500ms for animations to expand
  setTimeout(() => {
    const reportData = {
      title: "View Activity Details Report",
      url: window.location.href,
      extractedAt: new Date().toLocaleString(),
      sections: []
    };

    // Find all tables inside the modal or active page
    const tables = document.querySelectorAll('table');
    tables.forEach((table, tIdx) => {
      const rows = [];
      table.querySelectorAll('tr').forEach(tr => {
        const rowCells = [];
        tr.querySelectorAll('th, td').forEach(cell => {
          rowCells.push(cell.innerText.trim());
        });
        if (rowCells.length > 0) rows.push(rowCells);
      });

      if (rows.length > 0) {
        reportData.sections.push({
          tableIndex: tIdx + 1,
          rows: rows
        });
      }
    });

    // Download JSON
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `activity_details_report_${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();

    alert("✅ या अ‍ॅक्टिव्हिटीचा सर्व तपशील (Fund Allocation, Approvals, Expenditure) फाईलमध्ये डाउनलोड झाला आहे!");
  }, 600);
})();
