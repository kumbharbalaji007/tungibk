# ग्रामपंचायत तुंगी बुद्रुक - सार्वजनिक पारदर्शकता पोर्टल
## Tungi BK Gram Panchayat Interactive Transparency Dashboard

> **आपले गाव • आपला हिशोब • खरी पारदर्शकता**  
> गाव: **तुंगी बुद्रुक (Tungi BK)** | तालुका: **औसा** | जिल्हा: **लातूर** | राज्य: **महाराष्ट्र**  
> स्थानिक स्वराज्य संस्था कोड (LGD Code): **179414**

---

## 🌟 वैशिष्ट्ये (Key Features)

1. **कोणाला किती पैसे मिळाले? (Vendor Payout Ledger)**:
   - वर्षभरात ग्रामपंचायत खात्यातून कोणत्या व्यक्ती/कंत्राटदाराला किती एकूण रक्कम अदा झाली याचा पारदर्शक हिशोब.
   - बँक खात्याचा तपशील (`*******7947`) आणि PFMS पेमेंट पद्धत.
2. **कामांचे WhatsApp-Style Cards**:
   - ग्रामीण भागातील अल्पशिक्षित नागरिकांसाठी समजण्यास अतिशय सोपी रचना.
   - कामाचे नाव, जागा/वॉर्ड, खर्चाची रक्कम मराठी शब्दांत व आकड्यांत (उदा. `₹ २,०८,४००`).
3. **थेट अधिकृत पुरावे (eGramSwaraj Proofs)**:
   - भारत सरकारच्या अधिकृत eGramSwaraj पोर्टलवरील मूळ व्हाउचरची थेट लिंक.
   - संलग्न बिल पीडीएफ (Bill PDFs) व फोटो गॅलरी.
4. **स्थानिक सुलभता**:
   - **🔊 ऐका (Audio Readout)**: मराठीत मजकूर वाचून दाखवणारी व्हॉइस सुविधा.
   - **📲 व्हॉट्सॲप शेअर**: गावातील व्हॉट्सॲप ग्रुपवर एका क्लिकमध्ये माहिती पाठवण्याची सोय.
5. **अधिकृत जाहीर प्रकटन व अस्वीकरण (Disclaimer)**:
   - माहितीचा मूळ स्रोत eGramSwaraj असून हे पोर्टल लोकजागृती व पारदर्शकतेसाठी तयार केले आहे.

---

## 🚀 GitHub Pages वर मोफत कसे प्रसिद्ध करायचे? (2-Step Hosting)

हे संपूर्ण संकेतस्थळ **Static (Zero Server Cost)** स्वरूपात बनवले असून GitHub Pages वर मोफत चालू होते:

### पायरी १: GitHub वर कोड पुश करा
तुमच्या कॉम्प्युटरवर git कमांड वापरा किंवा GitHub Desktop द्वारे:
```bash
cd tungi-bk-dashboard
git init
git add .
git commit -m "Initial release of Tungi BK Gram Panchayat Transparency Portal"
git branch -M main
git remote add origin https://github.com/<your-username>/tungi-bk-dashboard.git
git push -u origin main
```

### पायरी २: GitHub Pages चालू करा (फक्त २ क्लिक)
1. तुमच्या GitHub repository मध्ये जा.
2. **Settings** &rarr; डाव्या बाजूला **Pages** वर क्लिक करा.
3. **Build and deployment** &rarr; **Source** मध्ये `Deploy from a branch` निवडा.
4. Branch मध्ये `main` आणि `/ (root)` निवडून **Save** दाबा.
5. अवघ्या १ मिनिटात तुमचे संकेतस्थळ लाइव्ह होईल:  
   👉 `https://<your-username>.github.io/tungi-bk-dashboard/`

---

## 💡 Urban VPN द्वारे eGramSwaraj वरून पुढील वर्षांचा डेटा कसा काढायचा?

eGramSwaraj वर कॅप्चा व आयपी निर्बंध असल्यामुळे तुमच्या ब्राऊझरमधील **Urban VPN** द्वारे डेटा मिळवणे सर्वात सोपे आहे:

### पद्धत १: १-क्लिक ब्राऊझर एक्सट्रॅक्टर (Bookmarklet)
1. ब्राऊझरमध्ये Urban VPN चालू करा आणि [eGramSwaraj Voucher Report](https://egramswaraj.gov.in) उघडा.
2. महाराष्ट्र &rarr; लातूर &rarr; औसा &rarr; तुंगी बु. (LGD: 179414) निवडा.
3. कीबोर्डवर `F12` दाबून `Console` टॅब उघडा.
4. `js/extractor-bookmarklet.js` मधील कोड पेस्ट करून Enter दाबा.
5. संपूर्ण डेटा काही सेकंदात तुमच्या कॉम्प्युटरवर `.json` फाईलच्या स्वरूपात डाउनलोड होईल!

### पद्धत २: एक्सेल डाउनलोड (Export To Excel)
1. eGramSwaraj वर हिरव्या रंगाच्या **"Export To Excel"** बटनावर क्लिक करा.
2. पोर्टलच्या `admin.html` पेजवर जाऊन ती एक्सेल फाईल ड्रॅग-अँड-ड्रॉप करा.

---

## 📸 कामांचे प्रत्यक्ष फोटो कसे जोडायचे?

1. विकासकामाचे प्रत्यक्ष फोटो (उदा. रस्ता, नाली, पाणी टाकी) `assets/photos/` या फोल्डरमध्ये टाका (उदा. `road_photo.jpg`).
2. `data/tungi_expenditure_data.json` फाईल उघडून संबंधित कामाच्या `photoGallery` मध्ये तो फोटो पाथ जोडा:
```json
"photoGallery": [
  "assets/photos/road_photo.jpg"
]
```
3. सेव्ह करून GitHub वर पुश करा; फोटो आपोआप डॅशबोर्डवर दिसतील.
