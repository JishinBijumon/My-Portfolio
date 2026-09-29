let lockedScrollY = 0;
const restoreScrollInstantly = (scrollY) => {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo({ left: 0, top: scrollY, behavior: 'auto' });
  if (document.scrollingElement) document.scrollingElement.scrollTop = scrollY;
  requestAnimationFrame(() => { root.style.scrollBehavior = previousBehavior; });
};
// Always begin a fresh page visit at the hero section instead of restoring a prior scroll position.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const scrollToPageStart = () => restoreScrollInstantly(0);
scrollToPageStart();
window.addEventListener('pageshow', scrollToPageStart);
window.addEventListener('load', scrollToPageStart, { once: true });

const lockPageScroll = () => {
  if (document.body.dataset.scrollLocked === 'true') return;
  lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.dataset.scrollLocked = 'true';
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
};

const unlockPageScroll = () => {
  if (document.body.dataset.scrollLocked !== 'true') return;
  document.body.dataset.scrollLocked = 'false';
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  restoreScrollInstantly(lockedScrollY);
};
const syncDialogScrollLock = () => {
  const hasOpenDialog = [...document.querySelectorAll('dialog')].some((dialog) => dialog.open);
  if (hasOpenDialog) lockPageScroll();
  else unlockPageScroll();
};

if (window.HTMLDialogElement) {
  const nativeShowModal = HTMLDialogElement.prototype.showModal;
  const nativeClose = HTMLDialogElement.prototype.close;

  HTMLDialogElement.prototype.showModal = function patchedShowModal(...args) {
    this.dataset.returnScrollY = String(window.scrollY || document.documentElement.scrollTop || 0);
    lockPageScroll();
    try {
      const result = nativeShowModal.apply(this, args);
      syncDialogScrollLock();
      return result;
    } catch (error) {
      syncDialogScrollLock();
      throw error;
    }
  };

  HTMLDialogElement.prototype.close = function patchedClose(...args) {
    const returnScrollY = Number(this.dataset.returnScrollY || lockedScrollY || 0);
    const result = nativeClose.apply(this, args);
    const restorePagePosition = () => {
      document.body.focus?.({ preventScroll: true });
      restoreScrollInstantly(returnScrollY);
    };
    requestAnimationFrame(() => {
      syncDialogScrollLock();
      restorePagePosition();
    });
    setTimeout(restorePagePosition, 0);
    return result;
  };

  document.addEventListener('close', syncDialogScrollLock, true);
  document.addEventListener('cancel', () => requestAnimationFrame(syncDialogScrollLock), true);
}

const typeword = document.getElementById('typeword');
if (typeword) {
  const words = ['PCB Design', 'Embedded Systems', 'IoT Development', 'Hardware Prototyping'];
  let word = 0;
  setInterval(() => { word = (word + 1) % words.length; typeword.textContent = words[word]; }, 2200);
}

const heroGallery = document.querySelector('.hero-gallery');
const heroGalleryFrame = document.querySelector('.hero-gallery-frame');
const heroGalleryImage = document.getElementById('hero-gallery-image');
const heroGalleryTitle = document.getElementById('hero-gallery-title');
const heroGalleryCount = document.getElementById('hero-gallery-count');
let heroSlides = [];
let heroSlideIndex = 0;
let heroSlideTimer = null;

const collectHeroSlides = () => {
  const projectCards = [...document.querySelectorAll('#projects [data-project-modal]')];
  const slides = projectCards
    .map((card) => {
      const image = card.querySelector('.visual img');
      const title = card.querySelector('h3')?.textContent?.trim();
      if (!image?.getAttribute('src') || !title) return null;
      return {
        src: image.getAttribute('src'),
        title,
        alt: image.getAttribute('alt') || title,
      };
    })
    .filter(Boolean);

  const uniqueSlides = [];
  const seen = new Set();
  slides.forEach((slide) => {
    const key = `${slide.src}|${slide.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSlides.push(slide);
    }
  });

  heroSlides = uniqueSlides;
  if (heroSlideIndex >= heroSlides.length) heroSlideIndex = 0;
  if (heroSlides.length && heroGalleryCount) {
    heroGalleryCount.textContent = String(heroSlideIndex + 1).padStart(2, '0');
  }
};

const showHeroSlide = (index) => {
  collectHeroSlides();
  if (!heroGalleryImage || !heroSlides.length) return;
  heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[heroSlideIndex];
  heroGalleryImage.style.opacity = '0';
  setTimeout(() => {
    heroGalleryImage.src = slide.src;
    heroGalleryImage.alt = slide.alt;
    if (heroGalleryTitle) heroGalleryTitle.textContent = slide.title;
    if (heroGalleryCount) heroGalleryCount.textContent = String(heroSlideIndex + 1).padStart(2, '0');
    heroGalleryImage.style.opacity = '1';
  }, 220);
};

const startHeroSlideshow = () => {
  if (!heroGallery || !heroGalleryImage) return;
  collectHeroSlides();
  showHeroSlide(heroSlideIndex);
  clearInterval(heroSlideTimer);
  heroSlideTimer = setInterval(() => showHeroSlide(heroSlideIndex + 1), 2800);
};

if (heroGallery && heroGalleryImage) {
  heroGallery.addEventListener('mouseenter', () => clearInterval(heroSlideTimer));
  heroGallery.addEventListener('mouseleave', startHeroSlideshow);
  heroGallery.addEventListener('click', () => {
    const projectsSection = document.getElementById('projects');
    const projectsGrid = document.querySelector('.projects');
    projectsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (projectsGrid) {
      projectsGrid.classList.remove('flash-focus');
      setTimeout(() => projectsGrid.classList.add('flash-focus'), 450);
    }
  });

  const projectsSection = document.getElementById('projects');
  if (projectsSection) {
    new MutationObserver(startHeroSlideshow).observe(projectsSection, { childList: true, subtree: true });
  }
  startHeroSlideshow();
}

const positionSolderSmoke = () => {
  const scene = document.querySelector('.solder-scene');
  const target = document.querySelector('.loader-board');
  const smoke = document.querySelector('.solder-smoke');
  if (!scene || !target || !smoke) return;
  const sceneBox = scene.getBoundingClientRect();
  const targetBox = target.getBoundingClientRect();
  const tipX = sceneBox.left + (sceneBox.width * 0.05);
  const tipY = sceneBox.top + (sceneBox.height * 0.63);
  const endX = targetBox.left + (targetBox.width / 2);
  const endY = targetBox.top + (targetBox.height / 2);
  const bendX = tipX - Math.max(90, Math.abs(tipX - endX) * 0.42);
  const bendY = tipY - Math.max(55, Math.abs(tipY - endY) * 0.38);
  smoke.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  while (smoke.querySelectorAll('path').length < 6) {
    smoke.appendChild(smoke.querySelector('path')?.cloneNode(false));
  }
  const paths = smoke.querySelectorAll('path');
  const offsets = [-18, 0, 18];
  paths.forEach((path, index) => {
    const offset = offsets[index] || 0;
    path.setAttribute('d', `M ${tipX} ${tipY} C ${bendX} ${tipY - 20 + offset}, ${bendX} ${bendY + offset}, ${endX + offset * .24} ${endY + offset * .18}`);
  });

  const smokePath = `M ${tipX} ${tipY} C ${bendX} ${tipY - 20}, ${bendX} ${bendY}, ${endX} ${endY}`;
  const svgNamespace = 'http://www.w3.org/2000/svg';
  while (smoke.querySelectorAll('.smoke-puff').length < 5) {
    const puff = document.createElementNS(svgNamespace, 'circle');
    puff.classList.add('smoke-puff');
    puff.setAttribute('r', String(5 + smoke.querySelectorAll('.smoke-puff').length * 1.5));
    puff.setAttribute('fill', 'rgba(210,245,235,.28)');
    puff.setAttribute('filter', 'url(#smoke-blur)');
    const motion = document.createElementNS(svgNamespace, 'animateMotion');
    motion.setAttribute('dur', `${3.2 + smoke.querySelectorAll('.smoke-puff').length * .35}s`);
    motion.setAttribute('begin', `${smoke.querySelectorAll('.smoke-puff').length * -.72}s`);
    motion.setAttribute('repeatCount', 'indefinite');
    puff.appendChild(motion);
    smoke.appendChild(puff);
  }
  smoke.querySelectorAll('.smoke-puff animateMotion').forEach((motion) => motion.setAttribute('path', smokePath));
};

const startPortfolioLoader = () => {
  const loader = document.querySelector('.portfolio-loader');
  if (!loader) return;
  const progressBar = loader.querySelector('.loader-progress-line i');
  const progressText = loader.querySelector('.loader-chip');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startedAt = performance.now();
  const duration = reducedMotion ? 80 : 2450;

  const updateProgress = (now) => {
    const percent = Math.min(100, Math.round(((now - startedAt) / duration) * 100));
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}%`;
    if (percent >= 40) loader.classList.add('name-reveal');
    if (percent < 100) {
      requestAnimationFrame(updateProgress);
      return;
    }
    window.setTimeout(() => {
      loader.classList.add('is-leaving');
      window.setTimeout(() => loader.remove(), reducedMotion ? 20 : 1400);
    }, reducedMotion ? 0 : 180);
  };

  requestAnimationFrame(() => { positionSolderSmoke(); updateProgress(performance.now()); });
};

startPortfolioLoader();
window.addEventListener('resize', positionSolderSmoke, { passive: true });

const applyCursorGlow = () => {
  const strongTargets = document.querySelectorAll([
    '.skills article',
    '.projects article',
    '.experience article',
    '.portfolio > div',
    '.hero-gallery',
    '.experience-detail-panel',
    '.internship-panel',
    '.training-summary',
    '.certificate-preview',
    '.project-modal-content',
    '.simple-modal-card'
  ].join(','));

  const lightTargets = document.querySelectorAll([
    '.actions a',
    '.primary',
    '.resume-nav',
    '.contacts a',
    '.resume-actions a',
    '.certificate-actions a',
    '.github-button',
    '.profile-details-list li'
  ].join(','));

  [...strongTargets].forEach((target) => target.classList.add('cursor-glow'));
  [...lightTargets].forEach((target) => target.classList.add('cursor-glow-lite'));

  document.querySelectorAll('.cursor-glow, .cursor-glow-lite, .skills article').forEach((card) => {
    if (card.dataset.cursorGlowReady === 'true') return;
    card.dataset.cursorGlowReady = 'true';
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });
};

applyCursorGlow();

const modal = document.getElementById('resume-modal');
if (modal) {
  const resumePdfUrl = 'ATS_Jishin_Bijumon_George_Resume_SinglePage.pdf';
  const resumeCanvas = modal.querySelector('#resume-canvas');
  let resumePdf = null;
  let resumePage = null;
  let resumeLoading = null;
  let resumeRenderTask = null;

  const renderResume = async () => {
    if (!resumeCanvas) return;
    const frame = modal.querySelector('.resume-frame');
    if (!frame) return;

    if (!resumeLoading) {
      resumeLoading = import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs').then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
        return pdfjsLib.getDocument(resumePdfUrl).promise;
      });
    }

    try {
      resumePdf = resumePdf || await resumeLoading;
      resumePage = resumePage || await resumePdf.getPage(1);

      const baseViewport = resumePage.getViewport({ scale: 1 });
      const availableWidth = Math.max(frame.clientWidth - 20, 1);
      const availableHeight = Math.max(frame.clientHeight - 20, 1);
      const scale = Math.min(
        availableWidth / baseViewport.width,
        availableHeight / baseViewport.height
      );
      const viewport = resumePage.getViewport({ scale });
      const ratio = window.devicePixelRatio || 1;

      if (resumeRenderTask) resumeRenderTask.cancel();

      resumeCanvas.width = Math.floor(viewport.width * ratio);
      resumeCanvas.height = Math.floor(viewport.height * ratio);
      resumeCanvas.style.width = Math.floor(viewport.width) + 'px';
      resumeCanvas.style.height = Math.floor(viewport.height) + 'px';

      resumeRenderTask = resumePage.render({
        canvasContext: resumeCanvas.getContext('2d', { alpha: false }),
        viewport,
        transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : null
      });
      await resumeRenderTask.promise;
    } catch (error) {
      if (error?.name !== 'RenderingCancelledException') {
        console.error('Resume preview failed:', error);
      }
    }
  };

  document.querySelectorAll('[data-resume]').forEach((button) => {
    button.addEventListener('click', () => {
      modal.showModal();
      requestAnimationFrame(() => renderResume());
    });
  });

  modal.querySelector('.close')?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });

  window.addEventListener('resize', () => {
    if (modal.open) requestAnimationFrame(() => renderResume());
  });
}

const nestDetailPanel = document.querySelector('#nest-modal .experience-detail-panel');
if (nestDetailPanel && !nestDetailPanel.querySelector('.nest-project-showcase')) {
  nestDetailPanel.insertAdjacentHTML('beforeend', `
    <div class="nest-project-showcase">
      <div class="nest-project-image"><img src="elderly-monitoring.png" alt="IoT-Based Elderly Health Monitoring System prototype" /></div>
      <div>
        <h3>Human Elderly<br /><em>Monitoring System.</em></h3>
        <h4>IoT-Based Elderly Health Monitoring System</h4>
        <p>An embedded IoT healthcare solution that integrates multiple biomedical and environmental sensors with cloud connectivity for continuous health monitoring and remote patient supervision.</p>
        <ul class="nest-feature-list">
          <li>+ Vital Sign Monitoring</li>
          <li>+ Multi-Sensor Data Acquisition</li>
          <li>+ Cloud-Based Health Dashboard</li>
          <li>+ Wireless IoT Communication</li>
          <li>+ Real-Time Health Analytics</li>
        </ul>
        <div class="nest-stack"><strong>Tech Stack</strong><p>ESP32 - Arduino - Firebase - MAX30102 - DHT11 - MQ Sensors - Embedded C</p></div>
        <a class="github-button" href="https://github.com/JishinBijumon" target="_blank" rel="noopener noreferrer">GitHub -></a>
      </div>
    </div>
  `);
}
const nestTechPanel = document.querySelector('#nest-modal .internship-panel:nth-child(2)');
if (nestTechPanel && !nestTechPanel.querySelector('.certificate-preview')) {
  nestTechPanel.insertAdjacentHTML('beforeend', `
    <div class="certificate-preview">
      <h3>Certificate Preview</h3>
      <img src="nest-certificate-preview.png" alt="NeST Digital internship certificate preview" />
    </div>
  `);
}

const projectModal = document.getElementById('wheelchair-modal');
const galleryLink = document.querySelector('.wheelchair-image');
const projectImages = ['wheelchair-prototype.jpeg', 'wheelchair-electronics.jpeg', 'wheelchair-full.jpeg'];
let imageIndex = 0;
const cardImage = galleryLink?.querySelector('img');
const modalImage = document.getElementById('modal-wheelchair-image');
const slideCurrent = document.getElementById('slide-current');
const showProjectImage = (index) => {
  imageIndex = (index + projectImages.length) % projectImages.length;
  if (cardImage) cardImage.src = projectImages[imageIndex];
  if (modalImage) modalImage.src = projectImages[imageIndex];
  if (slideCurrent) slideCurrent.textContent = String(imageIndex + 1).padStart(2, '0');
};
if (galleryLink && projectModal) {
  galleryLink.addEventListener('click', (event) => { event.preventDefault(); projectModal.showModal(); });
  document.querySelector('.project-close').addEventListener('click', () => projectModal.close());
  projectModal.addEventListener('click', (event) => { if (event.target === projectModal) projectModal.close(); });
  document.querySelector('.previous')?.addEventListener('click', () => showProjectImage(imageIndex - 1));
  document.querySelector('.next')?.addEventListener('click', () => showProjectImage(imageIndex + 1));
}

const pcbVisual = document.querySelector('.visual.pcb');
const pcbModal = document.getElementById('pcb-modal');
const pcbImages = ['bci-pcb-3d.png', 'bci-pcb-layout.png', 'bci-pcb-schematic.png', 'bci-pcb-prototype-1.jpeg', 'bci-pcb-prototype-2.jpeg'];
let pcbIndex = 0;
const modalPcbImage = document.getElementById('modal-pcb-image');
const pcbSlideCurrent = document.getElementById('pcb-slide-current');
const showPcbImage = (index) => {
  pcbIndex = (index + pcbImages.length) % pcbImages.length;
  const cardImage = pcbVisual?.querySelector('img');
  if (cardImage) cardImage.src = pcbImages[pcbIndex];
  if (modalPcbImage) modalPcbImage.src = pcbImages[pcbIndex];
  if (pcbSlideCurrent) pcbSlideCurrent.textContent = String(pcbIndex + 1).padStart(2, '0');
};
if (pcbVisual && pcbModal) {
  pcbVisual.innerHTML = '<span>PCB DESIGN</span><img src="bci-pcb-3d.png" alt="Custom BCI controller board 3D render" /><small>VIEW PCB PROJECT -></small>';
  pcbVisual.classList.add('pcb-image');
  const pcbCard = pcbVisual.closest('article');
  const pcbList = pcbCard?.querySelector('ul');
  if (pcbList) pcbList.innerHTML = '<li>Custom ESP32 Controller Board for BCI Applications</li><li>Multi-Sensor Support with Dedicated I/O Headers</li><li>Optimized PCB Layout for Reliable Signal Integrity</li><li>Expandable Hardware Design with Modular Connectivity</li><li>Real-World Deployment in Smart Wheelchair System</li>';
  pcbVisual.addEventListener('click', () => pcbModal.showModal());
  pcbVisual.setAttribute('role', 'button');
  pcbVisual.setAttribute('tabindex', '0');
  pcbVisual.addEventListener('keydown', (event) => { if (event.key === 'Enter') pcbModal.showModal(); });
  document.querySelector('.pcb-close').addEventListener('click', () => pcbModal.close());
  pcbModal.addEventListener('click', (event) => { if (event.target === pcbModal) pcbModal.close(); });
  document.querySelector('.pcb-previous')?.addEventListener('click', () => showPcbImage(pcbIndex - 1));
  document.querySelector('.pcb-next')?.addEventListener('click', () => showPcbImage(pcbIndex + 1));
}
if (pcbModal && !pcbModal.querySelector('.project-github-icon')) {
  const repoLink = document.createElement('a');
  repoLink.className = 'project-github-icon';
  repoLink.href = 'https://github.com/JishinBijumon/Custom-PCB-Board-for-BCI-based-Smart-Wheelchair-';
  repoLink.target = '_blank';
  repoLink.rel = 'noopener noreferrer';
  repoLink.setAttribute('aria-label', 'Open BCI smart wheelchair PCB repository on GitHub');
  repoLink.title = 'View GitHub repository';
  repoLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.42c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.81-4.58 5.07.36.32.68.93.68 1.88 0 1.36-.01 2.45-.01 2.79 0 .27.18.6.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"/></svg><span>View Repository</span>';
  pcbModal.querySelector('.project-modal-grid > div:last-child')?.appendChild(repoLink);
}

const inverterVisual = document.querySelector('.visual.inverter');
const inverterModal = document.getElementById('inverter-modal');
if (inverterModal) {
  const imageGallery = inverterModal.querySelector('.modal-image-grid');
  if (imageGallery) {
    imageGallery.className = 'modal-image-grid inverter-gallery';
    imageGallery.innerHTML = `
      <figure><img src="inverter-3d-top.png" alt="DC-AC mini inverter 3D board render" /><figcaption>3D Board View</figcaption></figure>
      <figure><img src="inverter-schematic.jpg" alt="DC-AC mini inverter schematic" /><figcaption>Schematic</figcaption></figure>
      <figure><img src="inverter-3d-bottom.jpg" alt="DC-AC mini inverter underside 3D view" /><figcaption>3D Bottom View</figcaption></figure>
      <figure><img src="inverter-pcb-layout.jpg" alt="DC-AC mini inverter PCB layout" /><figcaption>PCB Layout</figcaption></figure>
    `;
  }
}
const inverterImages = ['inverter-3d-top.png'];
let inverterIndex = 0;
const modalInverterImage = document.getElementById('modal-inverter-image');
const inverterSlideCurrent = document.getElementById('inverter-slide-current');
const showInverterImage = (index) => {
  inverterIndex = (index + inverterImages.length) % inverterImages.length;
  const cardImage = inverterVisual?.querySelector('img');
  if (cardImage) cardImage.src = inverterImages[inverterIndex];
  if (modalInverterImage) modalInverterImage.src = inverterImages[inverterIndex];
  if (inverterSlideCurrent) inverterSlideCurrent.textContent = String(inverterIndex + 1).padStart(2, '0');
};
if (inverterVisual && inverterModal) {
  document.querySelector('.inverter-close').addEventListener('click', () => inverterModal.close());
  inverterModal.addEventListener('click', (event) => { if (event.target === inverterModal) inverterModal.close(); });
  document.querySelector('.inverter-previous')?.addEventListener('click', (event) => { event.stopPropagation(); showInverterImage(inverterIndex - 1); });
  document.querySelector('.inverter-next')?.addEventListener('click', (event) => { event.stopPropagation(); showInverterImage(inverterIndex + 1); });
}
if (inverterModal && !inverterModal.querySelector('.project-github-icon')) {
  const repoLink = document.createElement('a');
  repoLink.className = 'project-github-icon';
  repoLink.href = 'https://github.com/JishinBijumon/DC-to-AC-Mini-Inverter-Module';
  repoLink.target = '_blank';
  repoLink.rel = 'noopener noreferrer';
  repoLink.setAttribute('aria-label', 'Open DC-AC Mini Inverter repository on GitHub');
  repoLink.title = 'View GitHub repository';
  repoLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.42c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.81-4.58 5.07.36.32.68.93.68 1.88 0 1.36-.01 2.45-.01 2.79 0 .27.18.6.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"/></svg><span>View Repository</span>';
  inverterModal.querySelector('.project-modal-grid > div:last-child')?.appendChild(repoLink);
}

const projectsGridSetup = document.querySelector('.projects');
const addStatusTag = (modalId, status) => {
  const card = document.querySelector(`[data-project-modal="${modalId}"]`);
  if (!card || card.querySelector('.status-tag')) return;
  const heading = card.querySelector('h3');
  const tag = document.createElement('span');
  tag.className = `status-tag ${status.toLowerCase()}`;
  tag.textContent = status;
  heading?.before(tag);
};
['wheelchair-modal', 'pcb-modal', 'elderly-modal', 'specs-modal', 'inverter-modal'].forEach((id) => addStatusTag(id, 'Completed'));
if (projectsGridSetup && !document.querySelector('[data-project-modal="arduino-modal"]')) {
  projectsGridSetup.insertAdjacentHTML('beforeend', `
    <article data-project-modal="arduino-modal"><div class="visual arduino project-image"><span>PCB DESIGN</span><img src="arduino-uno-layout.png" alt="Custom Arduino Uno board PCB layout" /><small>VIEW ARDUINO BOARD -></small></div><span class="status-tag ongoing">Ongoing</span><h3>Custom Arduino Uno Board using ATmega328P</h3><ul><li>ATmega328P-based custom Arduino-compatible board</li><li>Schematic and PCB layout design workflow</li><li>Microcontroller breakout with regulated power sections</li><li>Designed for embedded prototyping and learning</li><li>Ongoing board refinement and validation</li></ul></article>
    <article data-project-modal="esp32c3-modal"><div class="visual esp32c3 project-image"><span>EMBEDDED PCB</span><img src="esp32-c3-3d.png" alt="Custom mini ESP32-C3 board 3D render" /><small>VIEW ESP32-C3 BOARD -></small></div><span class="status-tag">Completed</span><h3>Custom Mini ESP32-C3 Board</h3><ul><li>Compact ESP32-C3-based embedded board</li><li>Schematic-focused hardware design and review</li><li>WiFi/BLE-ready controller architecture</li><li>Designed for IoT and low-power embedded applications</li><li>Completed board design and documentation</li></ul></article>
    <article data-project-modal="motor-driver-modal"><div class="visual motor-driver project-image"><span>MOTOR CONTROL PCB</span><img src="drv8833-motor-driver-3d.png" alt="DRV8833 motor driver 3D board view" /><small>VIEW MOTOR DRIVER BOARD -></small></div><span class="status-tag">Completed</span><h3>DRV8833 Dual Motor Driver Board</h3><ul><li>DRV8833-based dual DC motor driver PCB</li><li>Dual H-bridge motor output routing</li><li>Control, sleep, and fault signal headers</li><li>Integrated power filtering and protection circuitry</li><li>Completed schematic, PCB layout, and 3D review</li></ul></article>
  `);
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="arduino-modal"><div class="project-modal-content"><button class="arduino-close" aria-label="Close project details">&times;</button><p class="eyebrow">FEATURED PROJECT / 07</p><div class="project-modal-grid"><div class="modal-image-grid"><figure><img src="arduino-uno-layout.png" alt="Custom Arduino Uno board PCB layout" /><figcaption>PCB Layout</figcaption></figure><figure><img src="arduino-uno-schematic.png" alt="Custom Arduino Uno board schematic" /><figcaption>Schematic</figcaption></figure></div><div><h2>Custom Arduino Uno Board<br /><em>using ATmega328P.</em></h2><p>An ongoing custom Arduino-compatible PCB design project focused on learning board architecture, schematic capture, and layout practices around the ATmega328P.</p><ul><li>ATmega328P-based custom Arduino-compatible board</li><li>Schematic capture and PCB layout development</li><li>Power regulation and microcontroller support circuitry</li><li>Header-based embedded prototyping interface</li><li>Ongoing design validation and refinement</li></ul></div></div></div></dialog>
    <dialog id="esp32c3-modal"><div class="simple-modal-card"><button class="esp32-close" aria-label="Close project details">&times;</button><p class="eyebrow">FEATURED PROJECT / 08</p><div class="simple-modal-grid"><div class="project-detail-image"><img src="esp32-c3-3d.png" alt="Custom mini ESP32-C3 board 3D render" /></div><div class="experience-detail-panel"><h2>Custom Mini<br /><em>ESP32-C3 Board.</em></h2><p>A completed compact ESP32-C3 board for IoT-focused embedded applications.</p><ul><li>Compact ESP32-C3-based embedded board</li><li>Schematic-focused hardware design and documentation</li><li>WiFi/BLE-ready embedded controller architecture</li><li>Designed for IoT and connected sensor applications</li><li>Completed design iteration and validation</li></ul></div></div></div></dialog>
    <dialog id="motor-driver-modal"><div class="project-modal-content"><button class="motor-driver-close" aria-label="Close project details">&times;</button><p class="eyebrow">FEATURED PROJECT / 09</p><div class="project-modal-grid"><div class="modal-image-grid"><figure><img src="drv8833-motor-driver-schematic.png" alt="DRV8833 motor driver schematic" /><figcaption>Schematic</figcaption></figure><figure><img src="drv8833-motor-driver-layout.png" alt="DRV8833 motor driver PCB layout" /><figcaption>PCB Layout</figcaption></figure><figure><img src="drv8833-motor-driver-3d.png" alt="DRV8833 motor driver 3D board view" /><figcaption>3D Board View</figcaption></figure></div><div><h2>DRV8833 Dual<br /><em>Motor Driver Board.</em></h2><p>A completed dual DC motor driver PCB designed around the DRV8833 dual H-bridge motor-driver IC.</p><ul><li>DRV8833 dual H-bridge motor driver architecture</li><li>AOUT and BOUT motor output connections</li><li>AIN and BIN logic-control headers</li><li>Sleep and fault signal breakout</li><li>Power filtering with VCC and ground connections</li><li>Completed schematic capture, PCB layout, and 3D review</li></ul></div></div></div></dialog>
  `);
}
const arduinoVisual = document.querySelector('.visual.arduino');
const arduinoModal = document.getElementById('arduino-modal');
const arduinoImages = ['arduino-uno-layout.png'];
let arduinoIndex = 0;
const modalArduinoImage = document.getElementById('modal-arduino-image');
const arduinoSlideCurrent = document.getElementById('arduino-slide-current');
const showArduinoImage = (index) => {
  arduinoIndex = (index + arduinoImages.length) % arduinoImages.length;
  const cardImage = arduinoVisual?.querySelector('img');
  if (cardImage) cardImage.src = arduinoImages[arduinoIndex];
  if (modalArduinoImage) modalArduinoImage.src = arduinoImages[arduinoIndex];
  if (arduinoSlideCurrent) arduinoSlideCurrent.textContent = String(arduinoIndex + 1).padStart(2, '0');
};
if (arduinoVisual && arduinoModal) {
  document.querySelector('.arduino-close')?.addEventListener('click', () => arduinoModal.close());
  arduinoModal.addEventListener('click', (event) => { if (event.target === arduinoModal) arduinoModal.close(); });
  document.querySelector('.arduino-previous')?.addEventListener('click', (event) => { event.stopPropagation(); showArduinoImage(arduinoIndex - 1); });
  document.querySelector('.arduino-next')?.addEventListener('click', (event) => { event.stopPropagation(); showArduinoImage(arduinoIndex + 1); });
}
if (arduinoModal && !arduinoModal.querySelector('.project-github-icon')) {
  const repoLink = document.createElement('a');
  repoLink.className = 'project-github-icon';
  repoLink.href = 'https://github.com/JishinBijumon/Custom-Arduino-Uno-Board-using-ATmega328P';
  repoLink.target = '_blank';
  repoLink.rel = 'noopener noreferrer';
  repoLink.setAttribute('aria-label', 'Open Custom Arduino Uno board repository on GitHub');
  repoLink.title = 'View GitHub repository';
  repoLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.42c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.81-4.58 5.07.36.32.68.93.68 1.88 0 1.36-.01 2.45-.01 2.79 0 .27.18.6.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"/></svg><span>View Repository</span>';
  arduinoModal.querySelector('.project-modal-grid > div:last-child')?.appendChild(repoLink);
}
const esp32c3Modal = document.getElementById('esp32c3-modal');
if (esp32c3Modal) {
  const imagePanel = esp32c3Modal.querySelector('.project-detail-image');
  if (imagePanel) {
    imagePanel.className = 'modal-image-grid esp32c3-gallery';
    imagePanel.innerHTML = `
      <figure><img src="esp32-c3-3d.png" alt="Custom mini ESP32-C3 board 3D render" /><figcaption>3D Board View</figcaption></figure>
      <figure><img src="esp32-c3-schematic.jpg" alt="ESP32-C3 board schematic" /><figcaption>Schematic</figcaption></figure>
      <figure><img src="esp32-c3-layout-top.jpg" alt="ESP32-C3 PCB top layout" /><figcaption>Top PCB Layout</figcaption></figure>
      <figure><img src="esp32-c3-layout-bottom.jpg" alt="ESP32-C3 PCB bottom layout" /><figcaption>Bottom PCB Layout</figcaption></figure>
      <figure><img src="esp32-c3-copper-top.jpg" alt="ESP32-C3 top copper routing" /><figcaption>Top Copper Routing</figcaption></figure>
      <figure><img src="esp32-c3-routing.jpg" alt="ESP32-C3 PCB routing view" /><figcaption>PCB Routing View</figcaption></figure>
    `;
  }
}
document.querySelector('.esp32-close')?.addEventListener('click', () => esp32c3Modal?.close());
esp32c3Modal?.addEventListener('click', (event) => { if (event.target === esp32c3Modal) esp32c3Modal.close(); });
if (esp32c3Modal && !esp32c3Modal.querySelector('.project-github-icon')) {
  const repoLink = document.createElement('a');
  repoLink.className = 'project-github-icon';
  repoLink.href = 'https://github.com/JishinBijumon/ESP32-C3-DEV-BOARD';
  repoLink.target = '_blank';
  repoLink.rel = 'noopener noreferrer';
  repoLink.setAttribute('aria-label', 'Open ESP32-C3 development board repository on GitHub');
  repoLink.title = 'View GitHub repository';
  repoLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.42c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.81-4.58 5.07.36.32.68.93.68 1.88 0 1.36-.01 2.45-.01 2.79 0 .27.18.6.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"/></svg><span>View Repository</span>';
  esp32c3Modal.querySelector('.experience-detail-panel')?.appendChild(repoLink);
}
const motorDriverModal = document.getElementById('motor-driver-modal');
document.querySelector('.motor-driver-close')?.addEventListener('click', () => motorDriverModal?.close());
motorDriverModal?.addEventListener('click', (event) => { if (event.target === motorDriverModal) motorDriverModal.close(); });
if (motorDriverModal && !motorDriverModal.querySelector('.project-github-icon')) {
  const repoLink = document.createElement('a');
  repoLink.className = 'project-github-icon';
  repoLink.href = 'https://github.com/JishinBijumon/Motor-Driver-using-DRV8833';
  repoLink.target = '_blank';
  repoLink.rel = 'noopener noreferrer';
  repoLink.setAttribute('aria-label', 'Open DRV8833 motor driver repository on GitHub');
  repoLink.title = 'View GitHub repository';
  repoLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.42c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.81-4.58 5.07.36.32.68.93.68 1.88 0 1.36-.01 2.45-.01 2.79 0 .27.18.6.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"/></svg><span>View Repository</span>';
  motorDriverModal.querySelector('.project-modal-grid > div:last-child')?.appendChild(repoLink);
}

const githubLogoMarkup = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.42c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.81-4.58 5.07.36.32.68.93.68 1.88 0 1.36-.01 2.45-.01 2.79 0 .27.18.6.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"/></svg><span>View Repository</span>';
document.querySelectorAll('.github-button, #elderly-modal a[href*="github.com"]').forEach((link) => {
  link.className = 'project-github-icon';
  link.setAttribute('aria-label', 'Open project repository on GitHub');
  link.title = 'View GitHub repository';
  link.innerHTML = githubLogoMarkup;
});

const projectPopupIds = [...document.querySelectorAll('[data-project-modal]')].map((card) => card.dataset.projectModal);
projectPopupIds.forEach((id) => {
  const projectDialog = document.getElementById(id);
  if (!projectDialog || projectDialog.querySelector('.project-image-viewer')) return;
  projectDialog.classList.add('project-dialog');
  projectDialog.querySelector('button[class*="close"]')?.classList.add('project-popup-close');

  const viewer = document.createElement('div');
  viewer.className = 'project-image-viewer';
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-label', 'Expanded project image');
  viewer.innerHTML = '<button type="button" class="project-image-viewer-close" aria-label="Close enlarged image">&times;</button><img alt="" />';
  const viewerImage = viewer.querySelector('img');
  const closeViewer = () => viewer.classList.remove('open');
  viewer.querySelector('.project-image-viewer-close').addEventListener('click', closeViewer);
  viewer.addEventListener('click', (event) => { if (event.target === viewer) closeViewer(); });
  projectDialog.appendChild(viewer);

  projectDialog.querySelectorAll('img').forEach((image) => {
    if (image.closest('.project-image-viewer')) return;
    image.classList.add('zoomable-project-image');
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Expand image: ${image.alt || 'project image'}`);
    const showViewer = (event) => {
      event.stopPropagation();
      viewerImage.src = image.currentSrc || image.src;
      viewerImage.alt = image.alt || 'Expanded project image';
      viewer.classList.add('open');
    };
    image.addEventListener('click', showViewer);
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') showViewer(event);
    });
  });
  projectDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && viewer.classList.contains('open')) {
      event.preventDefault();
      event.stopPropagation();
      closeViewer();
    }
  });
});

const splitProjectSection = () => {
  const projectsContainer = document.querySelector('.projects');
  if (!projectsContainer || projectsContainer.classList.contains('split-projects')) return;

  const groups = [
    {
      key: 'embedded',
      label: '01 / EMBEDDED + IOT',
      title: 'Embedded / IoT Projects',
      note: 'Firmware, sensors, connected systems, assistive technology, and real-world embedded prototypes.',
      cards: ['wheelchair-modal', 'elderly-modal', 'specs-modal'],
    },
    {
      key: 'pcb',
      label: '02 / PCB DESIGN',
      title: 'PCB Design Projects',
      note: 'Custom boards, schematic capture, PCB layouts, 3D renders, power electronics, and controller boards.',
      cards: ['pcb-modal', 'inverter-modal', 'arduino-modal', 'esp32c3-modal', 'motor-driver-modal'],
    },
  ];

  const existingCards = new Map([...projectsContainer.querySelectorAll('[data-project-modal]')].map((card) => [card.dataset.projectModal, card]));
  projectsContainer.classList.add('split-projects');
  projectsContainer.innerHTML = '';

  groups.forEach((group) => {
    const section = document.createElement('section');
    section.className = `project-category ${group.key}-projects`;
    section.innerHTML = `
      <div class="project-category-head">
        <div><span>${group.label}</span><h3>${group.title}</h3></div>
        <p>${group.note}</p>
      </div>
      <div class="project-grid"></div>
    `;
    const grid = section.querySelector('.project-grid');
    group.cards.forEach((id) => {
      const card = existingCards.get(id);
      if (card) grid.appendChild(card);
    });
    projectsContainer.appendChild(section);
  });
};
applyCursorGlow();

const addCapability = (sectionTitle, capability) => {
  const card = [...document.querySelectorAll('.skills article')].find((item) => item.querySelector('h3')?.textContent.trim() === sectionTitle);
  const list = card?.querySelector('.skill-list');
  if (!list || [...list.children].some((item) => item.textContent.trim() === capability)) return;
  const item = document.createElement('li');
  item.textContent = capability;
  list.appendChild(item);
};
addCapability('Embedded Systems', 'PIC Microcontrollers');
addCapability('Hardware Tools', 'MPLAB X IDE');
addCapability('Hardware Tools', 'Proteus');

document.querySelectorAll('.contact-icon-list li').forEach((row) => {
  if (row.querySelector('.contact-link-arrow')) return;
  const detail = row.querySelector('a, strong');
  if (!detail) return;
  const isLocation = detail.tagName === 'STRONG';
  const arrow = document.createElement('a');
  arrow.className = 'contact-link-arrow';
  arrow.href = isLocation ? 'https://www.google.com/maps/search/?api=1&query=Kerala%2C%20India' : detail.href;
  arrow.setAttribute('aria-label', isLocation ? 'Open Kerala, India in Google Maps' : `Open ${detail.textContent.trim()}`);
  if (isLocation || arrow.href.startsWith('http')) {
    arrow.target = '_blank';
    arrow.rel = 'noopener noreferrer';
  }
  arrow.setAttribute('aria-hidden', 'false');
  arrow.textContent = '↗';
  row.appendChild(arrow);
});

const openDialogById = (id) => {
  const dialog = document.getElementById(id);
  if (dialog && !dialog.open) dialog.showModal();
};

document.querySelectorAll('[data-project-modal]').forEach((card) => {
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', (event) => {
    event.preventDefault();
    openDialogById(card.dataset.projectModal);
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDialogById(card.dataset.projectModal);
    }
  });
});

document.querySelectorAll('[data-experience-modal]').forEach((card) => {
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', () => openDialogById(card.dataset.experienceModal));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDialogById(card.dataset.experienceModal);
    }
  });
});

document.querySelectorAll('.detail-close').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog')?.close());
});

document.querySelectorAll('#elderly-modal,#specs-modal,#evolve-modal,#nest-modal,#amal-modal').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

const nav = document.getElementById('navigation');
const menu = document.querySelector('.menu');
if (nav && menu) {
  menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
  document.querySelectorAll('#navigation a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
  const navLinks = [...document.querySelectorAll('#navigation a[data-section]')];
  const sections = navLinks.map((link) => document.getElementById(link.dataset.section)).filter(Boolean);
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) navLinks.forEach((link) => link.classList.toggle('active', link.dataset.section === entry.target.id)); }), { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}
const setupPageCursorGlow = () => {
  let idleTimer;
  const updateGlow = (event) => {
    document.body.classList.remove('cursor-idle');
    document.documentElement.style.setProperty('--page-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--page-y', `${event.clientY}px`);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => document.body.classList.add('cursor-idle'), 900);
  };
  window.addEventListener('pointermove', updateGlow, { passive: true });
  window.addEventListener('pointerleave', () => document.body.classList.add('cursor-idle'));
};

setupPageCursorGlow();

const setupScrollReveal = () => {
  if (!('IntersectionObserver' in window)) return;
  const revealTargets = [
    ...document.querySelectorAll(
      '.hero > .eyebrow, .hero-grid > *, .hero > .focus, #about > .eyebrow, .about-profile > *, .profile-details-list li, .skill-metrics > *, #experience > .eyebrow, .experience article, main > .section > .wide-title, main > .section > .skills, .skills article, #projects > .head, #projects .project-category, #projects .project-category-head, #projects .projects > article, #projects .project-grid > article, .contact .wrap > *, footer > *'
    ),
  ];
  const uniqueTargets = [...new Set(revealTargets)];
  uniqueTargets.forEach((element, index) => {
    element.dataset.scrollReveal = '';
    element.dataset.scrollRevealDelay = String(index % 4);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

  uniqueTargets.forEach((element) => revealObserver.observe(element));
};

setupScrollReveal();

const addSystemSignalRail = (section, message, status) => {
  if (!section || section.querySelector('.system-signal-rail')) return;
  const rail = document.createElement('div');
  rail.className = 'system-signal-rail';
  rail.innerHTML = `<span>${message}</span><b>${status}</b>`;
  section.appendChild(rail);
};

addSystemSignalRail(document.getElementById('about'), 'Engineering focus / PCB design · embedded systems · connected devices', 'Signal / Active');
addSystemSignalRail(document.getElementById('experience'), 'Hands-on workflow / integrate → test → validate', 'Build log / Current');
addSystemSignalRail(document.querySelector('.skills')?.closest('.section'), 'Core toolkit / hardware · firmware · connectivity', 'Stack / Ready');
addSystemSignalRail(document.getElementById('projects'), 'Project records / schematics · layouts · working prototypes', 'Portfolio / Online');
