/* ===================================================================
   main.js – Portfolio JavaScript
   =================================================================== */

/* ------------------------------------------------------------------
   1. CUSTOM CURSOR
   ------------------------------------------------------------------ */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.12;
  cursorY += (mouseY - cursorY) * 0.12;
  cursor.style.left = cursorX + 'px';
  cursor.style.top  = cursorY + 'px';
  requestAnimationFrame(animateCursor);
})();

/* ------------------------------------------------------------------
   2. NAVBAR – scroll class + active link + hamburger
   ------------------------------------------------------------------ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
const allNavLinks = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

allNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  allNavLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* ------------------------------------------------------------------
   3. SCROLL REVEAL
   ------------------------------------------------------------------ */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
        const delay    = siblings.indexOf(entry.target) * 90;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
revealEls.forEach(el => revealObserver.observe(el));

/* ------------------------------------------------------------------
   4. STATS COUNTER ANIMATION
   ------------------------------------------------------------------ */
const statNumbers = document.querySelectorAll('.stat-number[data-target]');

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
statNumbers.forEach(el => countObserver.observe(el));

function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const decimal  = parseInt(el.dataset.decimal || 0);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const start    = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 4);
    el.textContent = (target * eased).toFixed(decimal) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toFixed(decimal) + suffix;
  }
  requestAnimationFrame(update);
}

/* ------------------------------------------------------------------
   5. LANGUAGE BAR ANIMATION
   ------------------------------------------------------------------ */
const langFills = document.querySelectorAll('.lang-fill');
const langObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const width = el.style.width;
        el.style.width = '0';
        requestAnimationFrame(() => requestAnimationFrame(() => { el.style.width = width; }));
        langObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);
langFills.forEach(el => langObserver.observe(el));

/* ------------------------------------------------------------------
   6. LIVE TIMECODE on hero photo
   ------------------------------------------------------------------ */
const timecodeEl = document.querySelector('.photo-timecode');
if (timecodeEl) {
  let frames = 0;
  setInterval(() => {
    frames++;
    const f  = frames % 25;
    const s  = Math.floor(frames / 25) % 60;
    const m  = Math.floor(frames / 25 / 60) % 60;
    const h  = Math.floor(frames / 25 / 3600);
    const pad = n => String(n).padStart(2, '0');
    timecodeEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
  }, 40); // ~25fps
}

/* ------------------------------------------------------------------
   7. AI CHAT
   ------------------------------------------------------------------ */
const chatBox   = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const chatSend  = document.getElementById('chat-send');

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendSuggestion(text) {
  chatInput.value = text;
  sendMessage();
}

function appendMessage(role, content, isTyping = false) {
  const msg    = document.createElement('div');
  msg.classList.add('chat-message', role);

  const avatar = document.createElement('div');
  avatar.classList.add('chat-avatar', role === 'bot' ? 'bot-avatar' : 'user-avatar');
  avatar.innerHTML = role === 'bot'
    ? '<i class="ph ph-robot"></i>'
    : '<i class="ph ph-user"></i>';

  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble');

  if (isTyping) {
    bubble.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  } else {
    bubble.textContent = content;
  }

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = '';
  chatSend.disabled = true;

  appendMessage('user', text);
  const typingMsg = appendMessage('bot', '', true);

  try {
    const response = await fetch('/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message: text }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${response.status}`);
    }

    const data = await response.json();
    typingMsg.remove();
    appendMessage('bot', data.reply);

  } catch (err) {
    typingMsg.remove();
    appendMessage('bot', `⚠️ ${err.message || 'Unable to reach the AI assistant. Make sure the server is running.'}`);
  } finally {
    chatSend.disabled = false;
    chatInput.focus();
  }
}

/* ------------------------------------------------------------------
   8. SMOOTH SCROLL
   ------------------------------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ------------------------------------------------------------------
   9. PARALLAX on hero background circles
   ------------------------------------------------------------------ */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const c1 = document.querySelector('.c1');
  const c2 = document.querySelector('.c2');
  if (c1) c1.style.transform = `translateY(${scrollY * 0.15}px)`;
  if (c2) c2.style.transform = `translateY(${-scrollY * 0.1}px)`;
});

/* ------------------------------------------------------------------
   10. DYNAMIC DATE on navbar
   ------------------------------------------------------------------ */
const navDateEl = document.getElementById('nav-date');
if (navDateEl) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  navDateEl.textContent = new Date().toLocaleDateString('en-US', options);
}

/* ------------------------------------------------------------------
   11. MEDIA GALLERY — load from /api/assets, filter, lightbox, video modal
   ------------------------------------------------------------------ */
(async function initGallery() {
  const gridEl    = document.getElementById('gallery-grid');
  const loadingEl = document.getElementById('gallery-loading');
  const emptyEl   = document.getElementById('gallery-empty');
  const filterBar = document.getElementById('gallery-filters');
  if (!gridEl) return;

  let allItems    = [];
  let photoItems  = []; // for lightbox navigation
  let lbIndex     = 0;

  /* --- fetch assets --- */
  try {
    const res  = await fetch('/api/assets');
    const data = await res.json();
    allItems   = data.items || [];
  } catch (e) {
    console.warn('Gallery: could not load assets', e);
  }

  loadingEl.style.display = 'none';

  if (allItems.length === 0) {
    emptyEl.style.display = 'block';
    return;
  }

  /* --- render cards --- */
  function prettifyName(filename) {
    return filename
      .replace(/\.[^.]+$/, '')        // remove extension
      .replace(/[-_]/g, ' ')           // dashes/underscores → spaces
      .replace(/\b\w/g, c => c.toUpperCase()); // title case
  }

  function buildCard(item, delay) {
    const card = document.createElement('div');
    card.className = `gallery-card ${item.type}`;
    card.dataset.category = item.category;
    card.style.animationDelay = `${delay * 60}ms`;

    const icon = item.type === 'photo'
      ? '<i class="ph ph-image"></i>'
      : '<i class="ph ph-play-circle"></i>';

    /* Media element */
    let mediaHTML = '';
    if (item.type === 'photo') {
      mediaHTML = `<img class="gc-media" src="${item.path}" alt="${prettifyName(item.filename)}" loading="lazy" />`;
    } else {
      mediaHTML = item.thumbnail
        ? `<img class="gc-video-thumb" src="${item.thumbnail}" alt="${prettifyName(item.filename)}" loading="lazy" />`
        : `<div class="gc-video-placeholder"><i class="ph ph-${item.categoryIcon.replace('ph-','')}"></i></div>`;
      mediaHTML += `<div class="gc-play-btn"><div class="gc-play-circle"><i class="ph ph-play"></i></div></div>`;
    }

    card.innerHTML = `
      ${mediaHTML}
      <div class="gc-top-label">
        <span class="gc-cat-badge" style="border-color:${item.categoryColor}40; color:${item.categoryColor};">${item.categoryLabel}</span>
        <span class="gc-type-icon">${icon}</span>
      </div>
      <div class="gc-overlay">
        <div class="gc-overlay-title">${prettifyName(item.filename)}</div>
        <div class="gc-overlay-sub">${item.type === 'photo' ? '🖼 Click to enlarge' : '▶ Click to play'}</div>
      </div>`;

    /* Click handlers */
    if (item.type === 'photo') {
      card.addEventListener('click', () => openLightbox(item));
    } else {
      card.addEventListener('click', () => openVideoModal(item));
    }

    return card;
  }

  function renderGrid(filter) {
    gridEl.innerHTML = '';
    photoItems = [];
    const filtered = filter === 'all'
      ? allItems
      : allItems.filter(i => i.category === filter);

    if (filtered.length === 0) {
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
      filtered.forEach((item, i) => {
        if (item.type === 'photo') photoItems.push(item);
        gridEl.appendChild(buildCard(item, i));
      });
    }
  }

  renderGrid('all');

  /* --- filter buttons --- */
  filterBar.querySelectorAll('.gfilter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterBar.querySelectorAll('.gfilter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid(btn.dataset.filter);
    });
  });

  /* ----------------------------------------------------------------
     LIGHTBOX
  ---------------------------------------------------------------- */
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbCat     = document.getElementById('lb-cat');
  const lbFname   = document.getElementById('lb-fname');
  const lbCounter = document.getElementById('lb-counter');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');

  function openLightbox(item) {
    lbIndex = photoItems.indexOf(item);
    if (lbIndex === -1) lbIndex = 0;
    showLbSlide();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function showLbSlide() {
    const item  = photoItems[lbIndex];
    lbImg.src   = item.path;
    lbImg.alt   = prettifyName(item.filename);
    lbCat.textContent   = item.categoryLabel;
    lbFname.textContent = prettifyName(item.filename);
    lbCounter.textContent = `${lbIndex + 1} / ${photoItems.length}`;
    lbCat.style.color   = item.categoryColor;
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  lbPrev.addEventListener('click', e => {
    e.stopPropagation();
    lbIndex = (lbIndex - 1 + photoItems.length) % photoItems.length;
    showLbSlide();
  });

  lbNext.addEventListener('click', e => {
    e.stopPropagation();
    lbIndex = (lbIndex + 1) % photoItems.length;
    showLbSlide();
  });

  document.addEventListener('keydown', e => {
    if (lightbox.style.display !== 'none') {
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   { lbIndex = (lbIndex - 1 + photoItems.length) % photoItems.length; showLbSlide(); }
      if (e.key === 'ArrowRight')  { lbIndex = (lbIndex + 1) % photoItems.length; showLbSlide(); }
    }
    if (videoModal.style.display !== 'none') {
      if (e.key === 'Escape') closeVideoModal();
    }
  });

  /* ----------------------------------------------------------------
     VIDEO MODAL
  ---------------------------------------------------------------- */
  const videoModal = document.getElementById('video-modal');
  const vmVideo    = document.getElementById('vm-video');
  const vmCat      = document.getElementById('vm-cat');
  const vmTitle    = document.getElementById('vm-title');
  const vmClose    = document.getElementById('vm-close');
  const vmBackdrop = document.getElementById('vm-backdrop');

  function openVideoModal(item) {
    vmVideo.src        = item.path;
    vmCat.textContent  = item.categoryLabel;
    vmTitle.textContent = prettifyName(item.filename);
    vmCat.style.color  = item.categoryColor;
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    vmVideo.play().catch(() => {});
  }

  function closeVideoModal() {
    vmVideo.pause();
    vmVideo.src = '';
    videoModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  vmClose.addEventListener('click', closeVideoModal);
  vmBackdrop.addEventListener('click', closeVideoModal);
})();

