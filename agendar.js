(() => {
  const WA_NUMBER = '593958894099';

  // Regex patterns
  const REGEX = {
    name: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{2,50}$/,
    cedula: /^\d{10}$/,
    ruc: /^\d{13}$/,
    phone: /^0\d{9}$/,
    email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    modelo: /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü\s\-\/\.\,\(\)\+]{3,100}$/,
    forbidden: /<script|javascript:|on\w+=|<\/?[a-z][\s\S]*>/i
  };

  let selectedEquipo = '';
  let formData = {};

  // Equipment card selection
  const cards = document.querySelectorAll('.equip-card');
  const tipoInput = document.getElementById('tipoEquipo');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedEquipo = card.dataset.value;
      tipoInput.value = selectedEquipo;
      hideError('errTipo');
    });
  });

  // Helpers
  function showError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
  }
  function hideError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  }
  function markField(input, valid) {
    input.classList.toggle('error', !valid);
    input.classList.toggle('valid', valid);
  }

  // Real-time validation
  const fields = [
    { id: 'modelo', err: 'errModelo', validate: v => REGEX.modelo.test(v) && !REGEX.forbidden.test(v) },
    { id: 'problema', err: 'errProblema', validate: v => v.trim().length >= 10 && !REGEX.forbidden.test(v) },
    { id: 'nombre', err: 'errNombre', validate: v => REGEX.name.test(v.trim()) },
    { id: 'apellido', err: 'errApellido', validate: v => REGEX.name.test(v.trim()) },
    { id: 'cedula', err: 'errCedula', validate: v => REGEX.cedula.test(v) || REGEX.ruc.test(v) },
    { id: 'telefono', err: 'errTelefono', validate: v => REGEX.phone.test(v) },
    { id: 'email', err: 'errEmail', validate: v => REGEX.email.test(v.trim()) },
  ];

  fields.forEach(f => {
    const input = document.getElementById(f.id);
    if (!input) return;
    input.addEventListener('input', () => {
      const valid = f.validate(input.value);
      markField(input, valid);
      if (valid) hideError(f.err); else showError(f.err);
    });
    input.addEventListener('blur', () => {
      if (input.value.trim()) {
        const valid = f.validate(input.value);
        markField(input, valid);
        if (!valid) showError(f.err);
      }
    });
  });

  // Restrict cédula/RUC and teléfono to numbers only
  ['cedula', 'telefono'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { el.value = el.value.replace(/\D/g, ''); });
  });

  // Auto Title Case for nombre/apellido (first letter uppercase, rest lowercase per word)
  ['nombre', 'apellido'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      const cursor = el.selectionStart;
      // Remove non-letter characters
      let val = el.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '');
      // Apply Title Case: first letter uppercase, rest lowercase per word
      val = val.replace(/\S+/g, word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );
      el.value = val;
      el.setSelectionRange(cursor, cursor);
    });
  });

  // Auto capitalize first letter of modelo
  const modeloEl = document.getElementById('modelo');
  if (modeloEl) modeloEl.addEventListener('input', () => {
    const cursor = modeloEl.selectionStart;
    let val = modeloEl.value;
    if (val.length > 0) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }
    modeloEl.value = val;
    modeloEl.setSelectionRange(cursor, cursor);
  });

  // Form submit
  const form = document.getElementById('agendarForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    // Validate equipment
    if (!selectedEquipo) { showError('errTipo'); valid = false; }

    // Validate all fields
    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const isValid = f.validate(input.value);
      markField(input, isValid);
      if (!isValid) { showError(f.err); valid = false; }
      else { hideError(f.err); }
    });

    if (!valid) {
      // Scroll to first error
      const firstErr = document.querySelector('.field-error.show');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Collect data
    formData = {
      equipo: selectedEquipo,
      modelo: document.getElementById('modelo').value.trim(),
      problema: document.getElementById('problema').value.trim(),
      nombre: document.getElementById('nombre').value.trim(),
      apellido: document.getElementById('apellido').value.trim(),
      cedula: document.getElementById('cedula').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      email: document.getElementById('email').value.trim(),
    };

    // Show modal
    document.getElementById('modalOverlay').classList.add('active');
    createConfetti();
  });

  // Modal - Copy code
  document.getElementById('modalCopyBtn').addEventListener('click', function() {
    navigator.clipboard.writeText('ORPEY50');
    this.textContent = '✅ Copiado!';
    setTimeout(() => this.textContent = 'Copiar', 2000);
  });

  // Modal - Send via WhatsApp
  document.getElementById('btnSendWA').addEventListener('click', () => {
    const msg = `📅 *SOLICITUD DE VISITA TÉCNICA A DOMICILIO*
━━━━━━━━━━━━━━━━━━━━

🔧 *EQUIPO*
• Tipo: ${formData.equipo}
• Modelo: ${formData.modelo}

📝 *PROBLEMA / SERVICIO*
${formData.problema}

👤 *DATOS DEL CLIENTE*
• Nombre: ${formData.nombre} ${formData.apellido}
• Cédula/RUC: ${formData.cedula}
• Teléfono: ${formData.telefono}
• Email: ${formData.email}

🏷️ *CÓDIGO PROMO:* ORPEY50 (50% OFF)
💰 *Total a pagar:* $5.00

━━━━━━━━━━━━━━━━━━━━
_Enviado desde orpey-servicios.com_`;

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  });

  // Close modal on overlay click
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      document.getElementById('modalOverlay').classList.remove('active');
    }
  });

  // Confetti effect
  function createConfetti() {
    const container = document.getElementById('confetti');
    container.innerHTML = '';
    const colors = ['#FBC305', '#25D366', '#ef4444', '#3b82f6', '#a855f7', '#f97316'];
    for (let i = 0; i < 30; i++) {
      const span = document.createElement('span');
      span.style.left = Math.random() * 100 + '%';
      span.style.background = colors[Math.floor(Math.random() * colors.length)];
      span.style.animationDelay = Math.random() * 0.8 + 's';
      span.style.width = (4 + Math.random() * 6) + 'px';
      span.style.height = (4 + Math.random() * 6) + 'px';
      container.appendChild(span);
    }
  }
})();
