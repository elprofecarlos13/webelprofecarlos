// ── ROBOT EYES: siguen el cursor ──────────────────────────────
const roboSvg = document.getElementById('robo-svg');
const eyeLPupil = document.getElementById('eyeL_pupil');
const eyeLIris  = document.getElementById('eyeL_iris');
const eyeLShine = document.getElementById('eyeL_shine');
const eyeRPupil = document.getElementById('eyeR_pupil');
const eyeRIris  = document.getElementById('eyeR_iris');
const eyeRShine = document.getElementById('eyeR_shine');
const browL = document.getElementById('browL');
const browR = document.getElementById('browR');
const mouth = document.getElementById('mouth');
const bubble = document.getElementById('speechBubble');
const armR  = document.getElementById('armRGroup');

const frases = [
  '¡Hola! Soy RoboKit 🤖',
  '¡Aprende conmigo! 🚀',
  '¿Listo para programar? 💻',
  '¡La robótica es genial! ⚙️',
  '¡Oye, te veo! 👀',
  '¡Bienvenido, amigo! 😄',
];
let fraseIdx = 0;
let isNear = false;
let waveInterval = null;

// Posición base de cada ojo en el viewBox del SVG
const EYE_L = { bx: 102, by: 122, maxMove: 5 };
const EYE_R = { bx: 178, by: 122, maxMove: 5 };

function movePupil(pupilEl, irisEl, shineEl, eyeBase, svgRect, mouseX, mouseY) {
  const svgW = 280, svgH = 460;
  // Convertir mouse a coordenadas SVG
  const mx = ((mouseX - svgRect.left) / svgRect.width)  * svgW;
  const my = ((mouseY - svgRect.top)  / svgRect.height) * svgH;

  const dx = mx - eyeBase.bx;
  const dy = my - eyeBase.by;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const limit = eyeBase.maxMove;
  const ratio = Math.min(dist, limit) / (dist || 1);

  const nx = eyeBase.bx + dx * ratio;
  const ny = eyeBase.by + dy * ratio;

  pupilEl.setAttribute('cx', nx);
  pupilEl.setAttribute('cy', ny);
  irisEl.setAttribute('cx', nx);
  irisEl.setAttribute('cy', ny);
  shineEl.setAttribute('cx', nx + 5);
  shineEl.setAttribute('cy', ny - 4);
}

function setExpression(type) {
  if (type === 'happy') {
    mouth.setAttribute('d', 'M104 164 Q140 178 176 164');
    browL.setAttribute('d', 'M78 95 Q102 88 124 95');
    browR.setAttribute('d', 'M154 95 Q178 88 200 95');
    eyeLIris.setAttribute('fill', '#4da3ff');
    eyeRIris.setAttribute('fill', '#4da3ff');
  } else if (type === 'excited') {
    mouth.setAttribute('d', 'M104 162 Q140 182 176 162');
    browL.setAttribute('d', 'M78 90 Q102 82 124 90');
    browR.setAttribute('d', 'M154 90 Q178 82 200 90');
    eyeLIris.setAttribute('fill', '#ff6b1a');
    eyeRIris.setAttribute('fill', '#ff6b1a');
  } else if (type === 'curious') {
    mouth.setAttribute('d', 'M110 170 Q140 172 170 170');
    browL.setAttribute('d', 'M78 94 Q102 90 124 97');
    browR.setAttribute('d', 'M154 90 Q178 94 200 97');
    eyeLIris.setAttribute('fill', '#4da3ff');
    eyeRIris.setAttribute('fill', '#4da3ff');
  } else {
    // neutral
    mouth.setAttribute('d', 'M104 164 Q140 176 176 164');
    browL.setAttribute('d', 'M78 97 Q102 90 124 97');
    browR.setAttribute('d', 'M154 97 Q178 90 200 97');
    eyeLIris.setAttribute('fill', '#4da3ff');
    eyeRIris.setAttribute('fill', '#4da3ff');
  }
}

function startWave() {
  if (waveInterval) return;
  let angle = -30;
  let dir = 1;
  waveInterval = setInterval(() => {
    angle += dir * 8;
    if (angle > 10 || angle < -50) dir *= -1;
    armR.style.transform = `rotate(${angle}deg)`;
    armR.style.transformOrigin = '220px 215px';
  }, 60);
}

function stopWave() {
  if (waveInterval) { clearInterval(waveInterval); waveInterval = null; }
  armR.style.transform = 'rotate(0deg)';
}

function showBubble(text) {
  bubble.textContent = text;
  bubble.style.opacity = '0';
  bubble.style.transform = 'translateY(10px) scale(0.9)';
  bubble.style.transition = 'opacity 0.3s, transform 0.3s';
  requestAnimationFrame(() => {
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateY(0) scale(1)';
  });
}

document.addEventListener('mousemove', (e) => {
  const rect = roboSvg.getBoundingClientRect();
  if (!rect.width) return;

  movePupil(eyeLPupil, eyeLIris, eyeLShine, EYE_L, rect, e.clientX, e.clientY);
  movePupil(eyeRPupil, eyeRIris, eyeRShine, EYE_R, rect, e.clientX, e.clientY);

  // Distancia al centro del robot
  const robotCX = rect.left + rect.width / 2;
  const robotCY = rect.top  + rect.height / 2;
  const dist = Math.sqrt((e.clientX - robotCX)**2 + (e.clientY - robotCY)**2);

  const NEAR_THRESHOLD = 220;
  if (dist < NEAR_THRESHOLD) {
    if (!isNear) {
      isNear = true;
      fraseIdx = (fraseIdx + 1) % frases.length;
      showBubble(frases[fraseIdx]);
      setExpression('excited');
      startWave();
      setTimeout(() => { if(isNear) setExpression('happy'); }, 1000);
    }
  } else {
    if (isNear) {
      isNear = false;
      setExpression('neutral');
      stopWave();
    }
  }
});

// Parpadeo natural
function blink() {
  const eyeLW = document.getElementById('eyeL_white');
  const eyeRW = document.getElementById('eyeR_white');
  // Escalar ojos verticalmente a 0 y volver
  [eyeLW, eyeLIris, eyeLPupil, eyeLShine, eyeRW, eyeRIris, eyeRPupil, eyeRShine].forEach(el => {
    el.style.transition = 'transform 0.08s';
    el.style.transformBox = 'fill-box';
    el.style.transformOrigin = 'center';
    el.style.transform = 'scaleY(0.05)';
  });
  setTimeout(() => {
    [eyeLW, eyeLIris, eyeLPupil, eyeLShine, eyeRW, eyeRIris, eyeRPupil, eyeRShine].forEach(el => {
      el.style.transform = 'scaleY(1)';
    });
  }, 120);
  setTimeout(blink, 2500 + Math.random() * 3000);
}
setTimeout(blink, 2000);

// ── LIGHTBOX ──────────────────────────────────────────────────
const galItems = document.querySelectorAll('.gal-item');
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbClose  = document.getElementById('lbClose');
const lbPrev   = document.getElementById('lbPrev');
const lbNext   = document.getElementById('lbNext');
let currentIdx = 0;
const galImgs  = [];

galItems.forEach((item, i) => {
  const img = item.querySelector('img');
  galImgs.push(img ? img.src : null);
  item.addEventListener('click', () => {
    if (!galImgs[i]) return; // no hay foto aún
    currentIdx = i;
    openLb(i);
  });
});

function openLb(i) {
  if (!galImgs[i]) return;
  lbImg.src = galImgs[i];
  lightbox.classList.add('open');
}
function closeLb() { lightbox.classList.remove('open'); }
lbClose.addEventListener('click', closeLb);
lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLb(); });
lbPrev.addEventListener('click', () => { currentIdx = (currentIdx - 1 + galImgs.length) % galImgs.length; openLb(currentIdx); });
lbNext.addEventListener('click', () => { currentIdx = (currentIdx + 1) % galImgs.length; openLb(currentIdx); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') lbPrev.click();
  if (e.key === 'ArrowRight') lbNext.click();
});


document.querySelectorAll('section,.card,.gal-item').forEach(el=>{
    el.classList.add('fade-in');
  });
  
  const obs=new IntersectionObserver(entries=>{
   entries.forEach(e=>{
     if(e.isIntersecting){e.target.classList.add('visible');}
   });
  },{threshold:0.15});
  
  document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));