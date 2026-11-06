/**
 * Vibrant Gram Sabha (Meeting Online) Extractor for Tungi BK
 * Portal: https://meetingonline.gov.in
 * 
 * Usage:
 * 1. Open the meeting details page (after clicking 'view meeting detail' on meetingonline.gov.in).
 * 2. Press F12 -> Console.
 * 3. Paste this code and press ENTER.
 * 4. It will instantly extract:
 *    - All Meeting Metadata (Date, Time, Venue, Purpose)
 *    - Full Attendees List (Names, Categories, Roles)
 *    - Agendas & Resolutions (ठराव)
 *    - Photo & Document attachments
 * 5. Downloads:
 *    - 'Tungi_GramSabha_Attendees.csv' (Excel ready list of all attendees)
 *    - 'Tungi_GramSabha_Meeting_Details.json' (Full structured data)
 */

(function extractGramSabhaDetails() {
  console.clear();
  console.log("🚀 Extracting Gram Sabha Meeting Details & Attendees for Tungi BK...");

  const meetingData = {
    portal: "meetingonline.gov.in (Vibrant Gram Sabha)",
    village: "तुंगी बुद्रुक (Tungi BK)",
    lgdCode: "179414",
    extractedAt: new Date().toLocaleString(),
    url: window.location.href,
    title: document.title,
    basicInfo: {},
    attendees: [],
    agendas: [],
    attachments: []
  };

  // 1. Extract Key-Value details from page (Labels and Values)
  document.querySelectorAll('div, tr, p').forEach(el => {
    const text = el.innerText ? el.innerText.trim() : '';
    if (text.includes('Meeting Date') || text.includes('Meeting Type') || text.includes('Meeting Purpose') || text.includes('Meeting Venue')) {
      const parts = text.split('\n');
      if (parts.length >= 2) {
        meetingData.basicInfo[parts[0].replace(/[:#]/g, '').trim()] = parts.slice(1).join(' ').trim();
      }
    }
  });

  // 2. Extract All Tables (Attendees table, Agendas table, etc.)
  const tables = document.querySelectorAll('table');
  console.log(`📊 Found ${tables.length} tables on page`);

  tables.forEach((table, tIdx) => {
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim());
    const isAttendeesTable = headers.some(h => /name|attendee|member|designation|नाव|उपस्थित/i.test(h));
    const isAgendaTable = headers.some(h => /agenda|resolution|purpose|ठराव|विषय/i.test(h));

    const rows = table.querySelectorAll('tbody tr, tr');
    rows.forEach((tr, rIdx) => {
      const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
      if (cells.length >= 2) {
        if (isAttendeesTable) {
          meetingData.attendees.push({
            row: rIdx,
            cells: cells,
            name: cells[1] || cells[0],
            role: cells[2] || '',
            category: cells[3] || ''
          });
        } else if (isAgendaTable) {
          meetingData.agendas.push(cells);
        } else {
          // General table row
          meetingData.attendees.push({
            row: rIdx,
            cells: cells
          });
        }
      }
    });
  });

  // 3. Extract any Photos or Document Links
  document.querySelectorAll('img').forEach(img => {
    if (img.src && !img.src.includes('logo') && !img.src.includes('icon')) {
      meetingData.attachments.push({ type: 'image', src: img.src });
    }
  });

  document.querySelectorAll('a').forEach(a => {
    if (a.href && (a.href.includes('.pdf') || a.href.includes('download') || a.innerText.includes('View') || a.innerText.includes('Download'))) {
      meetingData.attachments.push({ type: 'file', text: a.innerText.trim(), href: a.href });
    }
  });

  console.log(`✅ Extracted ${meetingData.attendees.length} attendee records!`);

  // 4. Download Full JSON
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(meetingData, null, 2));
  const dlJson = document.createElement('a');
  dlJson.setAttribute("href", jsonStr);
  dlJson.setAttribute("download", `Tungi_GramSabha_${Date.now()}.json`);
  document.body.appendChild(dlJson);
  dlJson.click();
  dlJson.remove();

  // 5. Download Attendees CSV for Excel
  if (meetingData.attendees.length > 0) {
    let csv = "\uFEFF"; // UTF-8 BOM for proper Marathi in Excel
    csv += "अ.क्र.,नाव / तपशील,पद / वर्गवारी,हजेरी नोंद\n";
    meetingData.attendees.forEach((att, idx) => {
      const cleanCells = att.cells.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
      csv += `${idx + 1},${cleanCells}\n`;
    });

    const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const dlCsv = document.createElement('a');
    dlCsv.setAttribute("href", csvUrl);
    dlCsv.setAttribute("download", `Tungi_GramSabha_Attendees_List_${Date.now()}.csv`);
    document.body.appendChild(dlCsv);
    dlCsv.click();
    dlCsv.remove();
  }

  // 6. Copy to clipboard
  try {
    navigator.clipboard.writeText(JSON.stringify(meetingData, null, 2));
  } catch(e) {}

  alert(`🎉 यश आले!\n\nग्रामसभेचा संपूर्ण तपशील आणि उपस्थिती यादी (Attendees List) CSV व JSON फाईलमध्ये डाउनलोड झाली आहे!\n\n(तसेच सर्व डेटा क्लिपबोर्डवरही सेव्ह झाला आहे)`);
})();
