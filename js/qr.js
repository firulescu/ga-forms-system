// QR Code generation - wraps qrcode.js library
const QRGen = {
  _url(plantId, siteId) {
    const base = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}`;
    const pin = (typeof AUTH !== 'undefined') ? (AUTH.getSite(siteId)?.operatorPin || '') : '';
    const tok = pin ? btoa('op:' + pin) : '';
    // Minimal URL — plant+site+tok+formtype only (no photo/name to keep URL short)
    const plant = (typeof DB !== 'undefined') ? DB.getPlant(plantId) : null;
    const formType = plant?.formType || '';
    return `${base}form.html?plant=${plantId}&site=${siteId}${tok?'&tok='+tok:''}${formType?'&form='+formType:''}`;
  },

  // Generate QR code as data URL for a plant
  generate(plantId, baseUrl) {
    const siteId = (typeof AUTH !== 'undefined') ? AUTH.getSiteId() : '';
    const url = `${baseUrl}form.html?plant=${plantId}&site=${siteId}`;
    return { url, qrDataUrl: null };
  },

  // Render QR to canvas element
  renderToCanvas(plantId, canvasEl, small) {
    const siteId = (typeof AUTH !== 'undefined') ? AUTH.getSiteId() : '';
    const url = this._url(plantId, siteId);
    if (typeof QRCode === 'undefined') {
      setTimeout(() => { try { this.renderToCanvas(plantId, canvasEl, small); } catch(e){} }, 800);
      return url;
    }
    try {
      canvasEl.innerHTML = '';
      const size = small ? 120 : 200;
      new QRCode(canvasEl, {
        text: url, width: size, height: size,
        colorDark: '#0A0E1A', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch(e) {
      console.warn('QR render error:', e);
      canvasEl.innerHTML = '<div style="width:120px;height:120px;display:flex;align-items:center;justify-content:center;color:#666;font-size:10px;border:1px solid #444;border-radius:4px;">QR Error</div>';
    }
    return url;
  },

  // Print QR label — generate QR as image in current page, pass to print window
  printLabel(plant) {
    const siteId = (typeof AUTH !== 'undefined') ? AUTH.getSiteId() : '';
    const url = this._url(plant.id, siteId);

    // Generate QR in a hidden div first
    const tmp = document.createElement('div');
    tmp.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
    document.body.appendChild(tmp);

    new QRCode(tmp, {
      text: url, width: 200, height: 200,
      colorDark: '#0A0E1A', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    // Wait for QR image to render then open print window
    function tryPrint(tries) {
      const img = tmp.querySelector('img');
      const canvas = tmp.querySelector('canvas');
      let qrDataUrl = null;

      if (canvas && canvas.width > 0) {
        const data = canvas.toDataURL('image/png');
        if (data && data.length > 1000) qrDataUrl = data;
      }
      if (!qrDataUrl && img && img.complete && img.src && img.src.startsWith('data:')) {
        qrDataUrl = img.src;
      }

      if (qrDataUrl) {
        document.body.removeChild(tmp);
        const siteName = (typeof AUTH !== 'undefined' && siteId) ? (AUTH.getSite(siteId)?.name || siteId) : siteId;
        const win = window.open('', '_blank');
        win.document.write(`<!DOCTYPE html><html><head>
          <title>QR Label - ${plant.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Space Mono', monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
            .label { background: white; border: 3px solid #0A0E1A; border-radius: 12px; padding: 28px 24px; text-align: center; width: 300px; box-shadow: 6px 6px 0 #0A0E1A; }
            .plant-id { font-size: 11px; color: #666; letter-spacing: 3px; margin-bottom: 10px; }
            .plant-name { font-size: 18px; font-weight: 700; color: #0A0E1A; margin-bottom: 4px; }
            .plant-loc { font-size: 11px; color: #888; margin-bottom: 16px; }
            .qr-wrap { display: flex; justify-content: center; margin: 16px 0; }
            .qr-wrap img { width: 200px; height: 200px; border-radius: 8px; }
            .plant-site { font-size: 11px; color: #555; margin-bottom: 4px; font-weight: 600; }
          .scan-text { font-size: 10px; color: #aaa; letter-spacing: 2px; margin-top: 12px; }
            @media print { body { background: white; } .label { box-shadow: none; border: 2px solid #000; } }
          </style>
        </head><body>
          <div class="label">
            <div class="plant-id">${plant.id}</div>
            <div class="plant-name">${plant.photo || ''} ${plant.name}</div>
            <div class="plant-loc">📍 ${plant.location}</div>
          <div class="plant-site">🏗️ ${siteName}</div>
            <div class="qr-wrap"><img src="${qrDataUrl}" alt="QR Code"></div>
            <div class="scan-text">SCAN TO INSPECT</div>
          </div>
          <script>setTimeout(() => window.print(), 500);<\/script>
        </body></html>`);
        win.document.close();
      } else if (tries > 0) {
        setTimeout(() => tryPrint(tries - 1), 200);
      } else {
        document.body.removeChild(tmp);
        alert('QR code failed to generate. Please try again.');
      }
    }
    setTimeout(() => tryPrint(20), 300);
  }
};
