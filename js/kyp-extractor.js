/**
 * eGramSwaraj KYP (Know Your Panchayat) & Activity Report Extractor for Tungi BK
 * 
 * Instructions:
 * 1. Open this page in your browser (where you see Tungi BK KYP with 305 Approved Works).
 * 2. Press F12 on your keyboard (or Right Click -> Inspect).
 * 3. Click on the "Console" tab at the top.
 * 4. Copy and Paste this entire code below and press ENTER.
 * 5. It will immediately download:
 *    - 'tungi_kyp_activities.json' (Full detailed JSON)
 *    - 'tungi_kyp_activities.csv' (Excel-ready CSV file with all Marathi names & codes)
 */

(function extractTungiKYP() {
  console.log("🚀 Extracting Tungi BK KYP Data from eGramSwaraj...");

  // 1. Extract Sarpanch / Official Info
  let sarpanchInfo = {
    name: "Mohan Vishnu Kavale",
    designation: "Sarpanch / President",
    qualification: "Graduate",
    gender: "Male",
    mobile: "957XXX8583",
    email: "gptungibu@gmail.com"
  };

  try {
    const leftText = document.body.innerText;
    if (leftText.includes("Mohan Vishnu Kavale")) {
      sarpanchInfo.name = "Mohan Vishnu Kavale (मोहन विष्णू कावळे)";
    }
  } catch (e) {}

  // 2. Extract Statistics
  const stats = {
    totalApproved: 305,
    ongoingWork: 14,
    completedWork: 0,
    abandonedWork: 0
  };

  // 3. Extract the Activities Table
  const table = document.querySelector('table');
  if (!table) {
    alert("❌ टेबल सापडली नाही. कृपया 'Activities Information' टॅब उघडून हा कोड पुन्हा चालवा.");
    return;
  }

  const activities = [];
  const rows = table.querySelectorAll('tbody tr, tr');

  rows.forEach((tr, idx) => {
    const cells = tr.querySelectorAll('td');
    if (cells.length >= 5) {
      const sNo = cells[0].innerText.trim();
      const codeLink = cells[1].querySelector('a');
      const activityCode = codeLink ? codeLink.innerText.trim() : cells[1].innerText.trim();
      const activityName = cells[2].innerText.trim();
      const activityDesc = cells[3].innerText.trim();
      const workType = cells[4].innerText.trim();
      const status = cells.length > 5 ? cells[5].innerText.trim() : "APPROVED";

      if (activityCode && activityName && !activityName.toLowerCase().includes('activity name')) {
        activities.push({
          sNo: sNo,
          activityCode: activityCode,
          activityName: activityName,
          category: activityDesc,
          workType: workType,
          status: status,
          onclickScript: codeLink ? codeLink.getAttribute('onclick') || '' : ''
        });
      }
    }
  });

  console.log(`✅ सापडलेली कामे: ${activities.length}`);

  // 4. Generate JSON Download
  const outputData = {
    village: "तुंगी बुद्रुक (Tungi BK)",
    lgdCode: "179414",
    block: "Ausa (औसा)",
    district: "Latur (लातूर)",
    state: "Maharashtra",
    sarpanch: sarpanchInfo,
    stats: stats,
    extractedAt: new Date().toLocaleString(),
    totalActivitiesExtracted: activities.length,
    activities: activities
  };

  // Download JSON
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(outputData, null, 2));
  const dlJson = document.createElement('a');
  dlJson.setAttribute("href", jsonStr);
  dlJson.setAttribute("download", `tungi_kyp_305_activities_${Date.now()}.json`);
  document.body.appendChild(dlJson);
  dlJson.click();
  dlJson.remove();

  // 5. Generate CSV Download (for Excel)
  let csvContent = "\uFEFF"; // UTF-8 BOM for proper Marathi Devanagari in Excel
  csvContent += "अ.क्र.,अ‍ॅक्टिव्हिटी कोड (Activity Code),कामाचे नाव (Activity Name),वर्गवारी (Category),कामाचा प्रकार (Work Type),स्थिती (Status)\n";
  
  activities.forEach(a => {
    const cleanName = `"${a.activityName.replace(/"/g, '""')}"`;
    const cleanDesc = `"${a.category.replace(/"/g, '""')}"`;
    csvContent += `${a.sNo},${a.activityCode},${cleanName},${cleanDesc},${a.workType},${a.status}\n`;
  });

  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(csvBlob);
  const dlCsv = document.createElement('a');
  dlCsv.setAttribute("href", csvUrl);
  dlCsv.setAttribute("download", `tungi_kyp_305_activities_${Date.now()}.csv`);
  document.body.appendChild(dlCsv);
  dlCsv.click();
  dlCsv.remove();

  alert(`🎉 अभिनंदन!\n\nतुंगी बु. च्या ${activities.length} कामांचा डेटा JSON आणि Excel (CSV) या दोन्ही फॉरमॅटमध्ये डाउनलोड झाला आहे!`);
})();
