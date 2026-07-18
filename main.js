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
