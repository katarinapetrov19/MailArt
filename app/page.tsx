'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function Home() {
  // ── Refs ────────────────────────────────────────────────────────────────────
  const sprayCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const wordSlotRef = useRef<HTMLButtonElement>(null);
  const projectCtaRef = useRef<HTMLDivElement>(null);
  const wordCtaRef = useRef<HTMLDivElement>(null);

  // ── Spray canvas trail ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.className = 'spray-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = 0;
    let lastPoint: { x: number | null; y: number | null } = { x: null, y: null };
    let lastMid: { x: number; y: number } | null = null;
    let fadeFrame: number | null = null;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255, 105, 180, 0.5)';
    ctx.shadowBlur = 14;

    const fade = () => {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      fadeFrame = requestAnimationFrame(fade);
    };
    fadeFrame = requestAnimationFrame(fade);

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTime < 4) return;
      lastTime = now;
      const { clientX: x, clientY: y } = e;
      if (lastPoint.x === null) {
        lastPoint = { x, y };
        lastMid = { x, y };
        return;
      }
      const midX = (lastPoint.x! + x) / 2;
      const midY = (lastPoint.y! + y) / 2;
      ctx.beginPath();
      ctx.moveTo(lastMid!.x, lastMid!.y);
      ctx.quadraticCurveTo(lastPoint.x!, lastPoint.y!, midX, midY);
      ctx.strokeStyle = 'rgba(255, 105, 180, 0.75)';
      ctx.lineWidth = 14;
      ctx.stroke();
      lastPoint = { x, y };
      lastMid = { x: midX, y: midY };
    };

    const onLeave = () => {
      lastPoint = { x: null, y: null };
      lastMid = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      if (fadeFrame !== null) cancelAnimationFrame(fadeFrame);
      canvas.remove();
    };
  }, []);

  // ── Hero letter parallax ────────────────────────────────────────────────────
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const parallaxText = document.getElementById('parallaxText');
    if (!parallaxText) return;

    // Wrap .line-1 letters
    const line1Els = parallaxText.querySelectorAll<HTMLElement>('.line-1');
    line1Els.forEach((line) => {
      const text = line.textContent || '';
      line.innerHTML = text
        .split('')
        .map((ch) =>
          ch === ' '
            ? `<span class="letter-space"> </span>`
            : `<span class="letter" style="display:inline-block;">${ch}</span>`
        )
        .join('');
    });

    const onMove = (e: MouseEvent) => {
      const letters = parallaxText.querySelectorAll<HTMLElement>('.letter');
      letters.forEach((letter) => {
        const rect = letter.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) { letter.style.transform = 'translate(0,0)'; return; }
        const influence = Math.max(0, 1 - dist / 500);
        letter.style.transform = `translate(${(dx / dist) * influence * -120}px,${(dy / dist) * influence * -120}px)`;
      });
    };

    const onLeave = () => {
      parallaxText.querySelectorAll<HTMLElement>('.letter').forEach((l) => {
        l.style.transform = 'translate(0,0)';
      });
    };

    heroEl.addEventListener('mousemove', onMove);
    heroEl.addEventListener('mouseleave', onLeave);
    return () => {
      heroEl.removeEventListener('mousemove', onMove);
      heroEl.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // ── Word slot machine ───────────────────────────────────────────────────────
  useEffect(() => {
    const btn = wordSlotRef.current;
    if (!btn) return;

    const WORDS = [
      'ARTIST', 'DANCER', 'PILOT', 'JOKER', 'MAKER',
      'NINJA',  'REBEL',  'LOVER', 'BOXER', 'RIDER',
      'SAINT',  'THIEF',  'CODER', 'RACER', 'LONER',
      'DREAMER','HUNTER', 'ROVER', 'WITCH', 'GHOST',
    ];
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const SPIN_INTERVAL = 38;
    const SPIN_DURATION = 360;
    const STAGGER = 60;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentWord = 'ARTIST';
    let isSpinning = false;

    const rndChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

    const pickNext = () => {
      const pool = WORDS.filter((w) => w !== currentWord);
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const fitLetterSpacing = () => {
      btn.style.letterSpacing = '0px';
      const naturalWidth = btn.scrollWidth;
      const available = window.innerWidth - window.innerWidth * 0.02;
      const n = btn.querySelectorAll('.hero-letter').length;
      if (n <= 1) return;
      btn.style.letterSpacing = `${(available - naturalWidth) / (n - 1)}px`;
    };

    const buildLetters = (word: string) => {
      btn.innerHTML = '';
      return [...word].map(() => {
        const span = document.createElement('span');
        span.className = 'hero-letter';
        span.textContent = rndChar();
        btn.appendChild(span);
        return span;
      });
    };

    const spinLetter = (el: HTMLElement, target: string, duration: number): Promise<void> =>
      new Promise((resolve) => {
        if (reducedMotion) { el.textContent = target; resolve(); return; }
        el.classList.add('is-spinning');
        const deadline = Date.now() + duration;
        const tick = setInterval(() => {
          if (Date.now() >= deadline) {
            clearInterval(tick);
            el.textContent = target;
            el.classList.remove('is-spinning');
            el.classList.add('is-settling');
            el.addEventListener('animationend', () => el.classList.remove('is-settling'), { once: true });
            resolve();
          } else {
            el.textContent = rndChar();
          }
        }, SPIN_INTERVAL);
      });

    const spin = async () => {
      if (isSpinning) return;
      isSpinning = true;
      const next = pickNext();
      const letters = buildLetters(next);
      await Promise.all(
        [...next].map((char, i) =>
          new Promise<void>((res) => setTimeout(() => spinLetter(letters[i], char, SPIN_DURATION).then(res), i * STAGGER))
        )
      );
      currentWord = next;
      btn.setAttribute('aria-label', `I am no ${currentWord.toLowerCase()} — click to change`);
      fitLetterSpacing();
      isSpinning = false;
      btn.dispatchEvent(new CustomEvent('wordSettled'));
    };

    // Init letters
    btn.innerHTML = '';
    [...currentWord].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'hero-letter';
      span.textContent = ch;
      btn.appendChild(span);
    });
    fitLetterSpacing();

    btn.addEventListener('click', spin);
    window.addEventListener('resize', fitLetterSpacing);

    return () => {
      btn.removeEventListener('click', spin);
      window.removeEventListener('resize', fitLetterSpacing);
    };
  }, []);

  // ── "Get a piece of my art" cursor CTA on project hover ────────────────────
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.home-projects');
    if (!sections.length) return;

    const cta = document.createElement('div');
    cta.className = 'hero-cursor-cta';
    cta.textContent = 'Get a piece of my art';
    document.body.appendChild(cta);

    let stopTimer: ReturnType<typeof setTimeout> | null = null;

    const onMove = (e: MouseEvent) => {
      cta.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      cta.classList.add('is-visible');
      if (stopTimer) clearTimeout(stopTimer);
      stopTimer = setTimeout(() => cta.classList.remove('is-visible'), 500);
    };

    const onEnter = () => document.addEventListener('mousemove', onMove);
    const onLeave = () => {
      if (stopTimer) clearTimeout(stopTimer);
      cta.classList.remove('is-visible');
      document.removeEventListener('mousemove', onMove);
    };
    const onClick = () => {
      cta.classList.remove('pulse');
      void cta.offsetWidth;
      cta.classList.add('pulse');
      if (stopTimer) clearTimeout(stopTimer);
      cta.classList.remove('is-visible');
      document.removeEventListener('mousemove', onMove);
      const first = document.getElementById('project-nioaa');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    sections.forEach((s) => {
      s.addEventListener('mouseenter', onEnter);
      s.addEventListener('mouseleave', onLeave);
      s.addEventListener('click', onClick);
    });

    return () => {
      sections.forEach((s) => {
        s.removeEventListener('mouseenter', onEnter);
        s.removeEventListener('mouseleave', onLeave);
        s.removeEventListener('click', onClick);
      });
      document.removeEventListener('mousemove', onMove);
      cta.remove();
    };
  }, []);

  // ── "Who am I?" cursor CTA on word slot hover ───────────────────────────────
  useEffect(() => {
    const wordBtn = wordSlotRef.current;
    if (!wordBtn) return;

    const cta = document.createElement('div');
    cta.className = 'hero-cursor-cta';
    cta.textContent = 'Who am I?';
    document.body.appendChild(cta);

    let clickCount = 0;
    let stopTimer: ReturnType<typeof setTimeout> | null = null;

    const onMove = (e: MouseEvent) => {
      cta.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      cta.classList.add('is-visible');
      if (stopTimer) clearTimeout(stopTimer);
      stopTimer = setTimeout(() => cta.classList.remove('is-visible'), 500);
    };

    const onEnter = () => document.addEventListener('mousemove', onMove);
    const onLeave = () => {
      if (stopTimer) clearTimeout(stopTimer);
      cta.classList.remove('is-visible');
      document.removeEventListener('mousemove', onMove);
    };
    const onClick = () => {
      clickCount++;
      cta.classList.remove('pulse');
      void cta.offsetWidth;
      cta.classList.add('pulse');
      if (clickCount >= 3) {
        clickCount = 0;
        if (stopTimer) clearTimeout(stopTimer);
        cta.classList.remove('is-visible');
        document.removeEventListener('mousemove', onMove);
        const handler = () => {
          wordBtn.removeEventListener('wordSettled', handler);
          const proj = document.getElementById('project-nioaa');
          if (proj) proj.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        wordBtn.addEventListener('wordSettled', handler);
      }
    };

    wordBtn.addEventListener('mouseenter', onEnter);
    wordBtn.addEventListener('mouseleave', onLeave);
    wordBtn.addEventListener('click', onClick);

    return () => {
      wordBtn.removeEventListener('mouseenter', onEnter);
      wordBtn.removeEventListener('mouseleave', onLeave);
      wordBtn.removeEventListener('click', onClick);
      document.removeEventListener('mousemove', onMove);
      cta.remove();
    };
  }, []);

  // ── Project section fade-in on scroll ──────────────────────────────────────
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.home-projects');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const content = entry.target.querySelector<HTMLElement>('.projects-content');
          if (content) {
            if (entry.isIntersecting) content.classList.add('is-in-view');
            else content.classList.remove('is-in-view');
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // ── Shareable section URLs ──────────────────────────────────────────────────
  useEffect(() => {
    const sectionIds = ['home', 'about', 'project-nioaa', 'project-fabrik', 'project-urban-street', 'contact'];

    const initialHash = window.location.hash.slice(1);
    if (initialHash && sectionIds.includes(initialHash)) {
      const target = document.getElementById(initialHash);
      if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'auto', block: 'start' }));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) history.replaceState(null, '', `#${entry.target.id}`);
        });
      },
      { threshold: 0.5 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // ── Fullscreen nav menu ─────────────────────────────────────────────────────
  useEffect(() => {
    const btn = document.getElementById('logoMenuBtn');
    const menu = document.getElementById('fullscreen-menu');
    const overlay = document.getElementById('nav-overlay');
    if (!btn || !menu || !overlay) return;

    const openMenu = () => {
      menu.classList.add('is-open');
      overlay.classList.add('is-open');
      btn.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-label', 'Close menu');
    };
    const closeMenu = () => {
      menu.classList.remove('is-open');
      overlay.classList.remove('is-open');
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-label', 'Open menu');
    };

    const onBtnClick = () => (menu.classList.contains('is-open') ? closeMenu() : openMenu());
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };

    btn.addEventListener('click', onBtnClick);
    overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', onKey);
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

    return () => {
      btn.removeEventListener('click', onBtnClick);
      overlay.removeEventListener('click', closeMenu);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // ── Subscribe side sheet ────────────────────────────────────────────────────
  useEffect(() => {
    const PRICE_IDS: Record<number, string> = {
      1: 'price_1TmDPEIHq8kOuh15l7QEkBFv',
      2: 'price_1TmDPPIHq8kOuh154c29GK9U',
      3: 'price_1TmDPYIHq8kOuh1555z3mwxl',
    };
    const PRICES: Record<number, { display: string }> = {
      1: { display: '8€' },
      2: { display: '11€' },
      3: { display: '15€' },
    };

    let selectedCount = 1;

    const overlay = document.getElementById('subscribe-overlay');
    const sheet = document.getElementById('subscribe-sheet');
    const closeBtn = document.getElementById('subscribe-close');
    const countBtns = document.querySelectorAll<HTMLButtonElement>('.artwork-count-btn');
    const stripeMessage = document.getElementById('paypal-message');

    if (!overlay || !sheet) return;

    const updatePriceDisplay = () => {
      countBtns.forEach((b) => {
        const count = parseInt(b.dataset.count || '1');
        const priceSpan = b.querySelector('.artwork-count-price');
        if (priceSpan) priceSpan.textContent = `${PRICES[count].display}/mo`;
      });
    };

    const validateFields = () => {
      const fields = [
        { id: 'subscribeName',    test: (v: string) => v.length > 0 },
        { id: 'subscribeEmail',   test: (v: string) => v.includes('@') },
        { id: 'subscribeAddress', test: (v: string) => v.length > 0 },
        { id: 'subscribeCity',    test: (v: string) => v.length > 0 },
        { id: 'subscribePostal',  test: (v: string) => v.length > 0 },
        { id: 'subscribeCountry', test: (v: string) => v.length > 0 },
      ];
      let firstInvalid: HTMLElement | null = null;
      fields.forEach(({ id, test }) => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (!el) return;
        if (!test(el.value.trim())) {
          el.classList.add('is-invalid');
          if (!firstInvalid) firstInvalid = el;
        } else {
          el.classList.remove('is-invalid');
        }
      });
      return firstInvalid;
    };

    const showError = (msg: string) => {
      if (stripeMessage) { stripeMessage.textContent = `✗ ${msg}`; stripeMessage.className = 'paypal-message--error'; }
    };

    const handleStripeSubscribe = async () => {
      const firstInvalid = validateFields();
      if (firstInvalid) {
        showError('Please fill in all required fields.');
        (firstInvalid as HTMLElement).focus();
        return;
      }

      const name = (document.getElementById('subscribeName') as HTMLInputElement).value.trim();
      const email = (document.getElementById('subscribeEmail') as HTMLInputElement).value.trim();
      const address = (document.getElementById('subscribeAddress') as HTMLInputElement).value.trim();
      const city = (document.getElementById('subscribeCity') as HTMLInputElement).value.trim();
      const postal = (document.getElementById('subscribePostal') as HTMLInputElement).value.trim();
      const country = (document.getElementById('subscribeCountry') as HTMLInputElement).value.trim();

      const stripeBtn = document.getElementById('stripe-subscribe-btn') as HTMLButtonElement | null;
      if (stripeBtn) { stripeBtn.disabled = true; stripeBtn.textContent = 'Redirecting…'; }
      if (stripeMessage) { stripeMessage.textContent = ''; stripeMessage.className = ''; }

      try {
        const res = await fetch('/api/checkout/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: PRICE_IDS[selectedCount], name, email, address, city, postal, country }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          showError('Something went wrong. Please try again.');
          if (stripeBtn) { stripeBtn.disabled = false; stripeBtn.textContent = 'Subscribe with Stripe'; }
        }
      } catch {
        showError('Something went wrong. Please try again.');
        if (stripeBtn) { stripeBtn.disabled = false; stripeBtn.textContent = 'Subscribe with Stripe'; }
      }
    };

    const openSheet = () => {
      sheet.classList.add('is-open');
      overlay.classList.add('is-open');
      overlay.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      updatePriceDisplay();
      if (stripeMessage) { stripeMessage.textContent = ''; stripeMessage.className = ''; }
      setTimeout(() => { if (closeBtn) closeBtn.focus(); }, 50);
    };

    const closeSheet = () => {
      sheet.classList.remove('is-open');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (stripeMessage) { stripeMessage.textContent = ''; stripeMessage.className = ''; }
    };

    countBtns.forEach((b) => {
      b.addEventListener('click', function (this: HTMLButtonElement) {
        selectedCount = parseInt(this.dataset.count || '1', 10);
        countBtns.forEach((x) => x.classList.remove('is-selected'));
        this.classList.add('is-selected');
        updatePriceDisplay();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    overlay.addEventListener('click', closeSheet);

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet(); };
    document.addEventListener('keydown', onKey);

    const subscribeBtn = document.getElementById('homeSubscribeBtn');
    if (subscribeBtn) subscribeBtn.addEventListener('click', openSheet);

    const mailHowSubBtn = document.getElementById('mailHowSubscribeBtn');
    if (mailHowSubBtn) mailHowSubBtn.addEventListener('click', openSheet);

    const stripePayBtn = document.getElementById('stripe-subscribe-btn');
    if (stripePayBtn) stripePayBtn.addEventListener('click', handleStripeSubscribe);

    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // ── Portrait order side sheet ───────────────────────────────────────────────
  useEffect(() => {
    const overlay = document.getElementById('portrait-overlay');
    const sheet = document.getElementById('portrait-sheet');
    const closeBtn = document.getElementById('portrait-close');
    const photoInput = document.getElementById('portraitPhotoInput') as HTMLInputElement | null;
    const photoPreview = document.getElementById('portraitPhotoPreview') as HTMLImageElement | null;
    const uploadContent = document.getElementById('portraitUploadContent');
    const ppMessage = document.getElementById('portrait-message');

    if (!overlay || !sheet) return;

    const validateFields = () => {
      const fields = [
        { id: 'portraitName',    test: (v: string) => v.length > 0 },
        { id: 'portraitEmail',   test: (v: string) => v.includes('@') },
        { id: 'portraitAddress', test: (v: string) => v.length > 0 },
        { id: 'portraitCity',    test: (v: string) => v.length > 0 },
        { id: 'portraitPostal',  test: (v: string) => v.length > 0 },
        { id: 'portraitCountry', test: (v: string) => v.length > 0 },
      ];
      let firstInvalid: HTMLElement | null = null;
      fields.forEach(({ id, test }) => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (!el) return;
        if (!test(el.value.trim())) { el.classList.add('is-invalid'); if (!firstInvalid) firstInvalid = el; }
        else el.classList.remove('is-invalid');
      });
      return firstInvalid;
    };

    const showError = (msg: string) => {
      if (ppMessage) { ppMessage.textContent = `✗ ${msg}`; ppMessage.className = 'paypal-message--error'; }
    };

    const handleStripePortrait = async () => {
      const firstInvalid = validateFields();
      if (!photoInput?.files?.[0]) {
        showError('Please upload your photo.');
        return;
      }
      if (!(document.getElementById('portraitConsent') as HTMLInputElement)?.checked) {
        showError('Please agree to the photo consent.');
        return;
      }
      if (firstInvalid) {
        showError('Please fill in all required fields.');
        (firstInvalid as HTMLElement).focus();
        return;
      }

      const name = (document.getElementById('portraitName') as HTMLInputElement).value.trim();
      const email = (document.getElementById('portraitEmail') as HTMLInputElement).value.trim();
      const address = (document.getElementById('portraitAddress') as HTMLInputElement).value.trim();
      const city = (document.getElementById('portraitCity') as HTMLInputElement).value.trim();
      const postal = (document.getElementById('portraitPostal') as HTMLInputElement).value.trim();
      const country = (document.getElementById('portraitCountry') as HTMLInputElement).value.trim();
      const note = (document.getElementById('portraitNote') as HTMLTextAreaElement)?.value.trim() ?? '';

      const stripeBtn = document.getElementById('stripe-portrait-btn') as HTMLButtonElement | null;
      if (stripeBtn) { stripeBtn.disabled = true; stripeBtn.textContent = 'Redirecting…'; }
      if (ppMessage) { ppMessage.textContent = ''; ppMessage.className = ''; }

      try {
        const res = await fetch('/api/checkout/portrait', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, address, city, postal, country, note }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          showError('Something went wrong. Please try again.');
          if (stripeBtn) { stripeBtn.disabled = false; stripeBtn.textContent = 'Pay 35€ with Stripe'; }
        }
      } catch {
        showError('Something went wrong. Please try again.');
        if (stripeBtn) { stripeBtn.disabled = false; stripeBtn.textContent = 'Pay 35€ with Stripe'; }
      }
    };

    const openSheet = () => {
      sheet.classList.add('is-open');
      overlay.classList.add('is-open');
      overlay.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      if (ppMessage) { ppMessage.textContent = ''; ppMessage.className = ''; }
      setTimeout(() => { if (closeBtn) closeBtn.focus(); }, 50);
    };

    const closeSheet = () => {
      sheet.classList.remove('is-open');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (photoInput) {
      photoInput.addEventListener('change', function () {
        const file = this.files?.[0];
        if (!file || !photoPreview) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          photoPreview.src = e.target?.result as string;
          photoPreview.classList.add('is-visible');
          if (uploadContent) uploadContent.style.display = 'none';
        };
        reader.readAsDataURL(file);
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    overlay.addEventListener('click', closeSheet);

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet(); };
    document.addEventListener('keydown', onKey);

    const orderBtn = document.getElementById('portraitOrderBtn');
    if (orderBtn) orderBtn.addEventListener('click', openSheet);

    const stripePortraitBtn = document.getElementById('stripe-portrait-btn');
    if (stripePortraitBtn) stripePortraitBtn.addEventListener('click', handleStripePortrait);

    return () => { document.removeEventListener('keydown', onKey); };
  }, []);

  // ── How It Works side sheet (portrait) ─────────────────────────────────────
  useEffect(() => {
    const overlay = document.getElementById('how-overlay');
    const sheet = document.getElementById('how-sheet');
    const closeBtn = document.getElementById('how-close');
    const howBtn = document.getElementById('portraitHowBtn');
    const orderBtn = document.getElementById('howOrderBtn');

    if (!overlay || !sheet) return;

    const openSheet = () => {
      sheet.classList.add('is-open');
      overlay.classList.add('is-open');
      overlay.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => { if (closeBtn) closeBtn.focus(); }, 50);
    };
    const closeSheet = () => {
      sheet.classList.remove('is-open');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    overlay.addEventListener('click', closeSheet);

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet(); };
    document.addEventListener('keydown', onKey);

    if (howBtn) howBtn.addEventListener('click', openSheet);
    if (orderBtn) {
      orderBtn.addEventListener('click', () => {
        closeSheet();
        const portraitSheet = document.getElementById('portrait-sheet');
        const portraitOverlay = document.getElementById('portrait-overlay');
        if (portraitSheet && portraitOverlay) {
          portraitSheet.classList.add('is-open');
          portraitOverlay.classList.add('is-open');
          portraitOverlay.removeAttribute('aria-hidden');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    return () => { document.removeEventListener('keydown', onKey); };
  }, []);

  // ── Mail Club How It Works side sheet ───────────────────────────────────────
  useEffect(() => {
    const overlay = document.getElementById('mail-how-overlay');
    const sheet = document.getElementById('mail-how-sheet');
    const closeBtn = document.getElementById('mail-how-close');
    const howBtn = document.getElementById('mailClubHowBtn');

    if (!overlay || !sheet) return;

    const openSheet = () => {
      sheet.classList.add('is-open');
      overlay.classList.add('is-open');
      overlay.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => { if (closeBtn) closeBtn.focus(); }, 50);
    };
    const closeSheet = () => {
      sheet.classList.remove('is-open');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    overlay.addEventListener('click', closeSheet);

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet(); };
    document.addEventListener('keydown', onKey);

    if (howBtn) howBtn.addEventListener('click', openSheet);

    return () => { document.removeEventListener('keydown', onKey); };
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <button type="button" className="logo-menu-btn" id="logoMenuBtn" aria-label="Open menu" aria-expanded="false">
            <svg className="logo-img" width="133" height="133" viewBox="0 0 133 133" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="PIEPPIEPSEPPL">
              <circle cx="66.5" cy="66.5" r="66.5" fill="white"/>
              <text x="66.5" y="66.5" textAnchor="middle" dominantBaseline="middle" fontFamily="'Playpen Sans', 'PlaypenSans-Bold', sans-serif" fontWeight="700" fontSize="28" fill="black">PIEP!</text>
            </svg>
            <span className="hamburger-icon" aria-hidden="true">
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
            </span>
          </button>
        </div>
      </nav>

      {/* HOME: Split Section */}
      <div id="home" className="split-section" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
        {/* Portrait Commission Section */}
        <section className="portrait-section">
          <div className="portrait-inner">
            <div className="portrait-text">
              <span className="portrait-label">Custom Portrait</span>
              <h2 className="portrait-heading">Your face,<br />my lines.</h2>
              <p className="portrait-body">Send me a realistic photo of yourself — I&apos;ll create a one-of-a-kind hand-drawn portrait and ship the original to your door.</p>
              <button className="portrait-how-link" id="portraitHowBtn" type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                How it works
              </button>
              <div className="portrait-pills">
                <span className="portrait-pill">35€</span>
                <span className="portrait-pill">Ships in 2–3 weeks</span>
                <span className="portrait-pill">Original artwork</span>
              </div>
              <button className="portrait-cta-btn" id="portraitOrderBtn" type="button">Order your portrait</button>
            </div>
            <div className="portrait-visual">
              <div className="portrait-frame">
                <img src="/img/flace-draw.png" alt="Sample portrait" className="portrait-sample-img" />
              </div>
            </div>
          </div>
        </section>

        {/* Mail Club Section */}
        <section className="mail-club-section">
          <div className="mail-club-marquee-bg" aria-hidden="true">
            <div className="mail-club-marquee-row">
              <div className="mail-club-marquee-track">
                <span className="mail-club-marquee-copy">MAIL CLUB &nbsp; SUBSCRIBE &nbsp; MAIL CLUB &nbsp;</span>
                <span className="mail-club-marquee-copy">MAIL CLUB &nbsp; SUBSCRIBE &nbsp; MAIL CLUB &nbsp;</span>
              </div>
            </div>
            <div className="mail-club-marquee-row mail-club-marquee-row--reverse">
              <div className="mail-club-marquee-track">
                <span className="mail-club-marquee-copy">SUBSCRIBE &nbsp; MAIL CLUB &nbsp; SUBSCRIBE &nbsp;</span>
                <span className="mail-club-marquee-copy">SUBSCRIBE &nbsp; MAIL CLUB &nbsp; SUBSCRIBE &nbsp;</span>
              </div>
            </div>
            <div className="mail-club-marquee-row">
              <div className="mail-club-marquee-track">
                <span className="mail-club-marquee-copy">MAIL CLUB &nbsp; SUBSCRIBE &nbsp; MAIL CLUB &nbsp;</span>
                <span className="mail-club-marquee-copy">MAIL CLUB &nbsp; SUBSCRIBE &nbsp; MAIL CLUB &nbsp;</span>
              </div>
            </div>
            <div className="mail-club-marquee-row mail-club-marquee-row--reverse">
              <div className="mail-club-marquee-track">
                <span className="mail-club-marquee-copy">SUBSCRIBE &nbsp; MAIL CLUB &nbsp; SUBSCRIBE &nbsp;</span>
                <span className="mail-club-marquee-copy">SUBSCRIBE &nbsp; MAIL CLUB &nbsp; SUBSCRIBE &nbsp;</span>
              </div>
            </div>
          </div>
          <div className="mail-club-section-overlay">
            <div className="mail-club-inner">
              <div className="mail-club-text">
                <span className="mail-club-label">Mail Club</span>
                <h2 className="mail-club-heading">New art,<br />every month.</h2>
                <p className="mail-club-body">A hand-drawn original mailed to your door each month. 3 subs sizes - one, two or three artworks each month. Limited editions, never reprinted.</p>
                <button className="portrait-how-link" id="mailClubHowBtn" type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  How it works
                </button>
                <div className="portrait-pills">
                  <span className="portrait-pill">15€ / month</span>
                  <span className="portrait-pill">New art monthly</span>
                  <span className="portrait-pill">Original artwork</span>
                </div>
                <button className="mail-club-home-cta-btn" id="homeSubscribeBtn" type="button">Subscribe — from 8€ / month</button>
              </div>
              <div className="mail-club-visual">
                <img src="/img/rosa.png" alt="Mail Club mini preview" className="mail-club-home-image" id="homePlanImage" />
              </div>
            </div>
          </div>
          <div className="mail-club-row-3-overlay" aria-hidden="true">
            <div className="mail-club-marquee-track">
              <span className="mail-club-marquee-copy">MAIL CLUB &nbsp; SUBSCRIBE &nbsp; MAIL CLUB &nbsp;</span>
              <span className="mail-club-marquee-copy">MAIL CLUB &nbsp; SUBSCRIBE &nbsp; MAIL CLUB &nbsp;</span>
            </div>
          </div>
        </section>
      </div>

      {/* ABOUT: Hero Animation */}
      <section id="about" className="hero" ref={heroRef}>
        <div className="hero-background"></div>
        <div className="hero-graphic-text">
          <h1 className="hero-large-title" id="parallaxText">
            <span className="line-1">I AM NO</span>
            <button className="line-2" id="wordSlot" ref={wordSlotRef} aria-label="I'm no artist — click to change">ARTIST</button>
          </h1>
        </div>
      </section>

      {/* PROJECTS: Live Painting @NIOAA */}
      <section id="project-nioaa" className="home-projects projects-split-section">
        <div className="projects-split-layout">
          <div className="projects-half projects-half--image" aria-hidden="true">
            <div className="projects-half-bg projects-half-bg--a is-visible" style={{ backgroundImage: "url('/img/NIOAA.jpg')" }}></div>
          </div>
          <div className="projects-half projects-half--dark">
            <div className="projects-content is-in-view">
              <h2 className="projects-title">Live Painting<br />@NIOAA</h2>
              <p className="projects-description">Custom sneakers and wearables inspired by natural forms, organic textures, and the outdoors. Designed to bring a piece of the wild into everyday style.</p>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="projects-instagram-link" aria-label="Instagram">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>
          <div className="projects-hero-media projects-hero-media--has-video">
            <video className="projects-hero-video" autoPlay muted loop playsInline preload="auto">
              <source src="/img/NIOAA.mp4" type="video/mp4" />
            </video>
            <img src="/img/NIOAA.jpg" alt="Live Painting @NIOAA" className="projects-hero-fallback" loading="eager" />
          </div>
        </div>
      </section>

      {/* Project: FABRIK */}
      <section id="project-fabrik" className="home-projects projects-split-section">
        <div className="projects-split-layout">
          <div className="projects-half projects-half--image" aria-hidden="true">
            <div className="projects-half-bg projects-half-bg--a is-visible" style={{ backgroundImage: "url('/img/fabrik.png')" }}></div>
          </div>
          <div className="projects-half projects-half--dark">
            <div className="projects-content is-in-view">
              <h2 className="projects-title">FABRIK</h2>
              <p className="projects-description">Our project aims to revolutionize the way we connect with technology, making it more intuitive and user-friendly. We believe in creating solutions that enhance everyday experiences.</p>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="projects-instagram-link" aria-label="Instagram">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>
          <div className="projects-hero-media projects-hero-media--has-video">
            <video className="projects-hero-video" autoPlay muted loop playsInline preload="auto">
              <source src="/img/Fabrik.mp4" type="video/mp4" />
            </video>
            <img src="/img/fabrik.png" alt="FABRIK" className="projects-hero-fallback" loading="eager" />
          </div>
        </div>
      </section>

      {/* Project: Urban Street */}
      <section id="project-urban-street" className="home-projects projects-split-section">
        <div className="projects-split-layout">
          <div className="projects-half projects-half--image" aria-hidden="true">
            <div className="projects-half-bg projects-half-bg--a is-visible" style={{ backgroundImage: "url('/img/game.JPG')" }}></div>
          </div>
          <div className="projects-half projects-half--dark">
            <div className="projects-content is-in-view">
              <h2 className="projects-title">Urban Street</h2>
              <p className="projects-description">A series of hand-painted custom sneakers inspired by urban landscapes and street art. Each pair tells a unique story of the city—from weathered walls and graffiti to the energy of bustling streets.</p>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="projects-instagram-link" aria-label="Instagram">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>
          <div className="projects-hero-media projects-hero-media--has-video">
            <video className="projects-hero-video" autoPlay muted loop playsInline preload="auto">
              <source src="/img/game.mp4" type="video/mp4" />
            </video>
            <img src="/img/game.JPG" alt="Urban Street" className="projects-hero-fallback" loading="eager" />
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="footer">
        <div className="container">
          <h2 className="section-title">Work with me</h2>
          <a href="https://www.instagram.com/pieppiepseppl/" target="_blank" rel="noopener" className="instagram-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>@pieppiepseppl</span>
          </a>
          <p className="footer-copy">&copy; 2025 PIEPPIEPSEPPL. All rights reserved. <a href="/privacy" className="footer-privacy-link">Privacy Policy</a></p>
        </div>
      </footer>

      {/* Subscribe Side Sheet */}
      <div id="subscribe-overlay" aria-hidden="true"></div>
      <div id="subscribe-sheet" role="dialog" aria-modal="true" aria-label="Subscribe to Mail Club">
        <button id="subscribe-close" aria-label="Close">&times;</button>
        <h2 className="subscribe-main-title">Subscribe to my Mail Club</h2>
        <p className="subscribe-section-label">Monthly or one-time?</p>
        <div className="subscribe-toggle">
          <label className="subscribe-toggle-option">
            <input type="radio" name="purchase-type" value="subscribe" defaultChecked />
            <span className="subscribe-toggle-label">Subscribe</span>
          </label>
          <label className="subscribe-toggle-option">
            <input type="radio" name="purchase-type" value="one-time" />
            <span className="subscribe-toggle-label">One-time</span>
          </label>
        </div>
        <p className="subscribe-section-label">Choose your plan</p>
        <div className="artwork-count-group" role="group" aria-label="Number of artworks">
          <button className="artwork-count-btn is-selected" data-count="1">
            <span className="artwork-count-label">1 artwork</span>
            <span className="artwork-count-price">8€/mo</span>
          </button>
          <button className="artwork-count-btn" data-count="2">
            <span className="artwork-count-label">2 artworks</span>
            <span className="artwork-count-price">11€/mo</span>
          </button>
          <button className="artwork-count-btn" data-count="3">
            <span className="artwork-count-label">3 artworks</span>
            <span className="artwork-count-price">15€/mo</span>
          </button>
        </div>
        <div className="subscribe-fields">
          <div className="subscribe-fields-row">
            <div>
              <label className="subscribe-field-label required" htmlFor="subscribeName">Name</label>
              <input className="subscribe-field-input" type="text" id="subscribeName" placeholder="Your name" autoComplete="name" required />
            </div>
            <div>
              <label className="subscribe-field-label required" htmlFor="subscribeEmail">Email</label>
              <input className="subscribe-field-input" type="email" id="subscribeEmail" placeholder="your@email.com" autoComplete="email" required />
            </div>
          </div>
          <label className="subscribe-field-label required" htmlFor="subscribeAddress">Street address</label>
          <input className="subscribe-field-input" type="text" id="subscribeAddress" placeholder="123 Main St" autoComplete="street-address" required />
          <div className="subscribe-fields-row">
            <div>
              <label className="subscribe-field-label required" htmlFor="subscribeCity">City</label>
              <input className="subscribe-field-input" type="text" id="subscribeCity" placeholder="City" autoComplete="address-level2" required />
            </div>
            <div>
              <label className="subscribe-field-label required" htmlFor="subscribePostal">Postal code</label>
              <input className="subscribe-field-input" type="text" id="subscribePostal" placeholder="12345" autoComplete="postal-code" required />
            </div>
          </div>
          <label className="subscribe-field-label required" htmlFor="subscribeCountry">Country</label>
          <input className="subscribe-field-input" type="text" id="subscribeCountry" placeholder="Country" autoComplete="country-name" required />
        </div>
        <button id="stripe-subscribe-btn" className="portrait-cta-btn" type="button" style={{ width: '100%', marginTop: '1rem', textAlign: 'center' }}>Subscribe with Stripe</button>
        <p id="paypal-message" role="alert"></p>
      </div>

      {/* Portrait Order Side Sheet */}
      <div id="portrait-overlay" aria-hidden="true"></div>
      <div id="portrait-sheet" role="dialog" aria-modal="true" aria-label="Order a custom portrait">
        <button id="portrait-close" aria-label="Close">&times;</button>
        <h2 className="portrait-sheet-title">Order your portrait</h2>
        <p className="portrait-sheet-subtitle">35€ — hand-drawn original, shipped to you</p>
        <div className="portrait-upload-wrap">
          <p className="portrait-sheet-label">Your photo</p>
          <div className="portrait-upload-area" id="portraitUploadArea">
            <input type="file" id="portraitPhotoInput" accept="image/*" className="portrait-file-input" />
            <div className="portrait-upload-content" id="portraitUploadContent">
              <span className="portrait-upload-icon">&#8593;</span>
              <span className="portrait-upload-text">Tap to upload your photo</span>
              <span className="portrait-upload-hint">Clear, front-facing photo preferred</span>
            </div>
            <img id="portraitPhotoPreview" className="portrait-photo-preview" alt="Your photo preview" />
          </div>
        </div>
        <div className="portrait-fields">
          <div className="portrait-fields-row">
            <div>
              <label className="portrait-field-label required" htmlFor="portraitName">Name</label>
              <input className="portrait-field-input" type="text" id="portraitName" placeholder="Your name" autoComplete="name" required />
            </div>
            <div>
              <label className="portrait-field-label required" htmlFor="portraitEmail">Email</label>
              <input className="portrait-field-input" type="email" id="portraitEmail" placeholder="your@email.com" autoComplete="email" required />
            </div>
          </div>
          <label className="portrait-field-label required" htmlFor="portraitAddress">Street address</label>
          <input className="portrait-field-input" type="text" id="portraitAddress" placeholder="123 Main St" autoComplete="street-address" required />
          <div className="portrait-fields-row">
            <div>
              <label className="portrait-field-label required" htmlFor="portraitCity">City</label>
              <input className="portrait-field-input" type="text" id="portraitCity" placeholder="City" autoComplete="address-level2" required />
            </div>
            <div>
              <label className="portrait-field-label required" htmlFor="portraitPostal">Postal code</label>
              <input className="portrait-field-input" type="text" id="portraitPostal" placeholder="12345" autoComplete="postal-code" required />
            </div>
          </div>
          <label className="portrait-field-label required" htmlFor="portraitCountry">Country</label>
          <input className="portrait-field-input" type="text" id="portraitCountry" placeholder="Country" autoComplete="country-name" required />
          <label className="portrait-field-label" htmlFor="portraitNote">Note for the artist</label>
          <textarea className="portrait-field-input portrait-field-textarea" id="portraitNote" placeholder="Any wishes, style preferences, special details…" rows={3}></textarea>
        </div>
        <label className="portrait-consent-label">
          <input type="checkbox" id="portraitConsent" required />
          <span>I agree to my photo being used to draw my portrait and deleted afterwards. <a href="/privacy" target="_blank" className="portrait-consent-link">Privacy policy</a></span>
        </label>
        <button id="stripe-portrait-btn" className="portrait-cta-btn" type="button" style={{ width: '100%', marginTop: '1rem', textAlign: 'center' }}>Pay 35€ with Stripe</button>
        <p id="portrait-message" role="alert"></p>
      </div>

      {/* How It Works Side Sheet */}
      <div id="how-overlay" aria-hidden="true"></div>
      <div id="how-sheet" role="dialog" aria-modal="true" aria-label="How portrait orders work">
        <button id="how-close" aria-label="Close">&times;</button>
        <h2 className="how-sheet-title">How it works</h2>
        <ol className="how-steps">
          <li className="how-step">
            <span className="how-step-num">1</span>
            <div>
              <strong>Send a photo</strong>
              <p>Upload a clear, front-facing photo of the person you&apos;d like drawn. Natural light works best.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="how-step-num">2</span>
            <div>
              <strong>Pay 35€</strong>
              <p>Secure checkout via Stripe. Your order is confirmed instantly.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="how-step-num">3</span>
            <div>
              <strong>I draw your portrait</strong>
              <p>Hand-drawn in ink, every line made by me. Takes about 1–2 weeks.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="how-step-num">4</span>
            <div>
              <strong>Original ships to your door</strong>
              <p>The physical artwork — not a print — is mailed to you. Delivery in 2–3 weeks.</p>
            </div>
          </li>
        </ol>
        <button className="how-order-btn" id="howOrderBtn" type="button">Order your portrait — 35€</button>
      </div>

      {/* Mail Club How It Works Side Sheet */}
      <div id="mail-how-overlay" aria-hidden="true"></div>
      <div id="mail-how-sheet" role="dialog" aria-modal="true" aria-label="How Mail Club works">
        <button id="mail-how-close" aria-label="Close">&times;</button>
        <h2 className="how-sheet-title">How it works</h2>
        <ol className="how-steps">
          <li className="how-step">
            <span className="how-step-num">1</span>
            <div>
              <strong>Pick your plan</strong>
              <p>Choose 1, 2, or 3 artworks per month — from 8€. Cancel anytime.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="how-step-num">2</span>
            <div>
              <strong>I make something new</strong>
              <p>Each month I create original hand-drawn pieces — never reprinted, never repeated.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="how-step-num">3</span>
            <div>
              <strong>It ships to your door</strong>
              <p>The physical original artwork is mailed to you every month. No digital files — the real thing.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="how-step-num">4</span>
            <div>
              <strong>Limited editions</strong>
              <p>Once a piece ships, it&apos;s gone. Subscribers get first access to every new work.</p>
            </div>
          </li>
        </ol>
        <button className="how-order-btn" id="mailHowSubscribeBtn" type="button">Subscribe — from 8€ / month</button>
      </div>

      {/* Nav overlay + fullscreen menu */}
      <div id="nav-overlay" aria-hidden="true"></div>
      <nav id="fullscreen-menu" role="dialog" aria-modal="true" aria-label="Site navigation" aria-hidden="true">
        <ul className="menu-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#project-nioaa">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </>
  );
}
