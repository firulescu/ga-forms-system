// QR Code generation - wraps qrcode.js library
const QRGen = {
  _url(plantId, siteId) {
    const base = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}`;
    const pin = (typeof AUTH !== 'undefined') ? (AUTH.getSite(siteId)?.operatorPin || '') : '';
    const tok = pin ? btoa('op:' + pin) : '';
    const plant = (typeof DB !== 'undefined') ? DB.getPlant(plantId) : null;
    const formType = plant?.formType || '';
    // Keep plant name short — truncate to 20 chars to keep QR scannable
    const shortName = plant ? encodeURIComponent(plant.name.substring(0, 20)) : '';
    const shortLoc  = plant ? encodeURIComponent((plant.location||'').substring(0, 20)) : '';
    const shortSite = (typeof AUTH !== 'undefined') ? encodeURIComponent((AUTH.getSite(siteId)?.name||'').substring(0,20)) : '';
    const photo = plant ? encodeURIComponent(plant.photo || '') : '';
    return `${base}form.html?plant=${plantId}&site=${siteId}${tok?'&tok='+tok:''}${formType?'&form='+formType:''}${shortName?'&pn='+shortName:''}${photo?'&pp='+photo:''}${shortLoc?'&pl='+shortLoc:''}${shortSite?'&sn='+shortSite:''}`;
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

  // Print QR label for a plant
  printLabel(plant) {
    const siteId = (typeof AUTH !== 'undefined') ? AUTH.getSiteId() : '';
    const win = window.open('', '_blank');
    const url = this._url(plant.id, siteId);
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Label - ${plant.name}</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
          body { font-family: 'Space Mono', monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
          .label { background: white; border: 3px solid #0A0E1A; border-radius: 12px; padding: 24px; text-align: center; width: 280px; box-shadow: 6px 6px 0 #0A0E1A; }
          .plant-id { font-size: 11px; color: #666; letter-spacing: 3px; margin-bottom: 8px; }
          .plant-name { font-size: 18px; font-weight: 700; color: #0A0E1A; margin-bottom: 4px; }
          .plant-loc { font-size: 11px; color: #888; margin-bottom: 16px; }
          #qr { display: flex; justify-content: center; margin: 16px 0; }
          .scan-text { font-size: 10px; color: #aaa; letter-spacing: 2px; margin-top: 8px; }
          .url { font-size: 8px; color: #ccc; margin-top: 4px; word-break: break-all; }
          @media print { body { background: white; } .label { box-shadow: none; border: 2px solid #000; } }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="plant-id">${plant.id}</div>
          <div class="plant-name">${plant.photo || ''} ${plant.name}</div>
          <div class="plant-loc">📍 ${plant.location}</div>
          <div id="qr"></div>
          <div class="scan-text">SCAN TO INSPECT</div>
          <div class="url">${url}</div>
        </div>
        <script>
          new QRCode(document.getElementById('qr'), {
            text: '${url}',
            width: 180, height: 180,
            colorDark: '#0A0E1A', colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
          });
          setTimeout(() => window.print(), 800);
        <\/script>
      </body>
      </html>
    `);
  }
};
