/**
 * Tungi BK Gram Panchayat Transparency Portal - Data Service
 * Loads data from local JSON or external published Google Sheet CSV
 */

const DataService = {
  data: null,

  async init() {
    try {
      // 1. If embedded data is available (for zero-latency and file:// compatibility), use it
      if (window.EMBEDDED_TUNGI_DATA) {
        this.data = window.EMBEDDED_TUNGI_DATA;
      }

      // 2. Check if user configured a custom remote Google Sheet or JSON URL in localStorage
      const customUrl = localStorage.getItem('tungi_custom_data_url');
      if (customUrl) {
        const response = await fetch(customUrl);
        if (response.ok) {
          this.data = await response.json();
          return this.data;
        }
      }

      // 3. Try to fetch fresh data/tungi_expenditure_data.json if running on http/https
      if (location.protocol.startsWith('http')) {
        const res = await fetch('data/tungi_expenditure_data.json');
        if (res.ok) {
          this.data = await res.json();
        }
      }

      return this.data;
    } catch (err) {
      console.warn('Network load failed, falling back to embedded dataset', err);
      if (window.EMBEDDED_TUNGI_DATA) {
        this.data = window.EMBEDDED_TUNGI_DATA;
        return this.data;
      }
      throw err;
    }
  },

  getAllWorks() {
    return this.data ? this.data.works : [];
  },

  getAllBeneficiaries() {
    return this.data ? this.data.beneficiaries : [];
  },

  getSummary() {
    return this.data ? this.data.summary : null;
  },

  getVillageInfo() {
    return this.data ? this.data.villageInfo : null;
  },

  getGramSabha() {
    return this.data ? this.data.gramSabha : null;
  },

  formatIndianCurrency(num) {
    if (typeof num !== 'number') num = parseFloat(num) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  },

  formatMarathiCurrency(num) {
    const formatted = this.formatIndianCurrency(num);
    // Convert to Devanagari numerals
    const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return formatted.replace(/[0-9]/g, (w) => devanagariDigits[+w]);
  }
};

window.DataService = DataService;
