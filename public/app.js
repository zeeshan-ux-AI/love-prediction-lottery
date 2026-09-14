// LoveLottery - 16 Sector Ultimate Funny Engine

const SECTORS = [
  { label: "100% রাজযোটক! 💍", color: "#ff007f", type: "positive" },
  { label: "ব্লক মারবে কালকে! 🚫", color: "#ff4757", type: "negative" },
  { label: "মনে মনের মিল! 💘", color: "#00f2fe", type: "positive" },
  { label: "ফ্রেন্ডজোনে আজীবন! 😭", color: "#9d4edd", type: "negative" },
  { label: "ইনবক্সে নক আসছে! 📱", color: "#2ed573", type: "positive" },
  { label: "ভাই বলে ডাকবে! 🚴", color: "#747d8c", type: "negative" },
  { label: "চা খেয়ে প্রপোজ! ☕", color: "#ffd700", type: "positive" },
  { label: "রিপ্লাই ৩ দিন পর! ⏳", color: "#ff7f50", type: "negative" },
  { label: "গোপন প্রেমিক! 🤫", color: "#ffa502", type: "positive" },
  { label: "বিয়েতে বিরিয়ানি খাওয়াবে! 🍗", color: "#57606f", type: "negative" },
  { label: "সারাদিন চিন্তা করে! 😍", color: "#e84393", type: "positive" },
  { label: "অন্য কারো সাথে ব্যস্ত! 📱", color: "#d63031", type: "negative" },
  { label: "লুকিয়ে প্রোফাইল দেখে! 👁️", color: "#00b894", type: "positive" },
  { label: "মেসেজ সিন করবে না! 🔕", color: "#6c5ce7", type: "negative" },
  { label: "গিফট পাঠাবে কাল! 🎁", color: "#fd79a8", type: "positive" },
  { label: "ছবি দেখে হাসাহাসি! 😆", color: "#e17055", type: "negative" }
];

let canvas, ctx;
let currentAngle = 0;
let isSpinning = false;
let audioCtx = null;

const FAKE_TICKER_DATA = [
  "🔥 রাহাত & রিয়া 99% রাজযোটক! 💍",
  "🚫 সাকিব got: ব্লক মারবে কালকে! with তিশা!",
  "😍 ফাহিম got: মনে মনের মিল! 💘 with নাবিলা!",
  "😭 তানভির got: ফ্রেন্ডজোনে আজীবন! with আনিসা!",
  "📱 আরিফ got: ইনবক্সে নক আসছে! with সুমি!",
  "🎁 হাসান got: গিফট পাঠাবে কাল! with মিম!"
];

window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('wheelCanvas');
  if (canvas) {
    ctx = canvas.getContext('2d');
    drawWheel();
  }

  const spinBtn = document.getElementById('spinBtn');
  if (spinBtn) {
    spinBtn.addEventListener('click', () => {
      initAudio();
      startLotterySpin();
    });
  }

  const closeBtn = document.getElementById('closeModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('resultModal').classList.remove('active');
    });
  }

  startTickerSimulation();
});

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTickSound() {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {}
}

function playResultSound(isPositive) {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    if (isPositive) {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
      });
    } else {
      [300, 250, 200, 150].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.2, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
    }
  } catch (e) {}
}

function drawWheel() {
  const numSectors = SECTORS.length;
  const arc = (2 * Math.PI) / numSectors;
  const radius = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(currentAngle);

  for (let i = 0; i < numSectors; i++) {
    const angle = i * arc;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, angle, angle + arc);
    ctx.lineTo(0, 0);
    ctx.fillStyle = SECTORS[i].color;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#07040d';
    ctx.stroke();

    // Label Text
    ctx.save();
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Outfit, sans-serif';
    ctx.fillText(SECTORS[i].label, radius - 12, 3);
    ctx.restore();
  }

  // Center Knob
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, 2 * Math.PI);
  ctx.fillStyle = '#07040d';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd700';
  ctx.stroke();

  ctx.fillStyle = '#ff007f';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💖', 0, 2);

  ctx.restore();
}

function startLotterySpin() {
  if (isSpinning) return;

  const userName = document.getElementById('userName').value.trim();
  const loverName = document.getElementById('loverName').value.trim();
  const relationType = document.getElementById('relationType').value;

  if (!userName || !loverName) {
    alert('দয়া করে আপনার নাম এবং আপনার ক্রাশ/লাভারে নাম লিখুন!');
    return;
  }

  isSpinning = true;
  document.getElementById('spinBtn').disabled = true;

  const targetSectorIndex = Math.floor(Math.random() * SECTORS.length);
  const numSectors = SECTORS.length;
  const arc = (2 * Math.PI) / numSectors;

  const fullRotations = 6 + Math.floor(Math.random() * 4);
  const targetOffset = (2 * Math.PI) - (targetSectorIndex * arc + arc / 2);
  const totalRotation = fullRotations * 2 * Math.PI + targetOffset - (Math.PI / 2);

  const startRotation = currentAngle % (2 * Math.PI);
  const rotationDelta = totalRotation - startRotation;
  const duration = 4500;
  const startTime = performance.now();
  let lastSoundTime = 0;

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeOut = 1 - Math.pow(1 - progress, 3);
    currentAngle = startRotation + rotationDelta * easeOut;

    if (now - lastSoundTime > (100 + progress * 300)) {
      playTickSound();
      lastSoundTime = now;
    }

    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      document.getElementById('spinBtn').disabled = false;
      const targetSector = SECTORS[targetSectorIndex];
      playResultSound(targetSector.type === "positive");
      finishSpin(userName, loverName, relationType, targetSector);
    }
  }

  requestAnimationFrame(animate);
}

function finishSpin(userName, loverName, relationType, sector) {
  let matchScore, randomPrediction;

  if (sector.type === "positive") {
    matchScore = Math.floor(75 + Math.random() * 24);
    const posPredictions = [
      `লটারি অনুযায়ী ${loverName} আপনার কথা সারাদিন চিন্তা করে! প্রেমে পড়ার চান্স ৯৯%। 💖`,
      `লটারি চাকা বলছে ${loverName} আপনাকে মন থেকে ভালোবাসে, কিন্তু মুখ ফুটে বলতে লজ্জা পায়! 😍`,
      `${userName} & ${loverName}-এর জুটি একদম রাজযোটক! চা নাস্তা খাইয়ে প্রপোজ করে ফেলুন! ☕💍`,
      `${loverName} গোপনে আপনার ফেসবুক প্রফাইল ডেইলি চেক করে! খুব শীঘ্রই ইনবক্সে নক আসবে! 📱`,
      `লটারি রেজাল্ট: ${loverName} কালকে আপনার জন্য স্পেশাল সারপ্রাইজ গিফট পাঠাবে! 🎁`,
      `লটারি রেজাল্ট: ${loverName} আপনার প্রফাইল পিকচারে প্রতিদিন ২ ঘণ্টা তাকিয়ে থাকে! 👁️`
    ];
    randomPrediction = posPredictions[Math.floor(Math.random() * posPredictions.length)];
  } else {
    matchScore = Math.floor(12 + Math.random() * 35);
    const negPredictions = [
      `সাবধান! ${loverName} আপনাকে ফ্রেন্ডজোনে রাখার প্ল্যান করছে! আজই সাবধান হয়ে যান! 😭`,
      `লটারি রেজাল্ট: ${loverName} মেসেজ দেখে ৩ দিন পর ‘হুম’ রিপ্লাই দেবে! ⏳`,
      `দুঃসংবাদ! ${loverName} আপনাকে ভাই বলে ডাকতে পারে! তাড়াতাড়ি রিক্সা থেকে নেমে যান! 🚴`,
      `লটারি রেজাল্ট: ${loverName} এর বিয়েতে আপনাকে বিরিয়ানি খাওয়ার দাওয়াত দেওয়া হবে! 🍗`,
      `সাবধান! কাল সকালে আপনাকে ব্লক মারার হাই চান্স আছে! ইনবক্স চেক করুন! 🚫`,
      `দুঃসংবাদ! ${loverName} আপনার ক্রাশ পোস্ট দেখে হাসাহাসি করছে! 😆`
    ];
    randomPrediction = negPredictions[Math.floor(Math.random() * negPredictions.length)];
  }

  document.getElementById('modalNames').innerText = `${userName} ❤️ ${loverName}`;
  document.getElementById('modalScore').innerText = `${matchScore}%`;
  document.getElementById('modalVerdict').innerText = sector.label;
  document.getElementById('modalVerdict').style.color = sector.type === "positive" ? "var(--cyan-neon)" : "#ff4757";
  document.getElementById('modalPrediction').innerText = randomPrediction;

  const whatsappBtn = document.getElementById('whatsappShareBtn');
  if (whatsappBtn) {
    const shareText = encodeURIComponent(`💘 LoveLottery Result:\n${userName} ❤️ ${loverName}\nMatching Score: ${matchScore}%\nVerdict: ${sector.label}\nCheck your love lottery here: https://love-prediction-lottery.vercel.app`);
    whatsappBtn.href = `https://api.whatsapp.com/send?text=${shareText}`;
  }

  document.getElementById('resultModal').classList.add('active');

  if (sector.type === "positive") {
    triggerConfetti();
  }

  saveEntryToDatabase({
    user_name: userName,
    lover_name: loverName,
    relation_type: relationType,
    compatibility_score: matchScore,
    verdict: sector.label,
    prediction: randomPrediction
  });
}

function saveEntryToDatabase(data) {
  fetch('/api/spin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .catch(err => console.log('Database Log Notice:', err));
}

function triggerConfetti() {
  for (let i = 0; i < 55; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = ['#ff007f', '#9d4edd', '#00f2fe', '#ffd700', '#2ed573'][Math.floor(Math.random() * 5)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.borderRadius = '50%';
    confetti.style.zIndex = '2000';
    confetti.style.pointerEvents = 'none';

    document.body.appendChild(confetti);

    const anim = confetti.animate([
      { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${Math.random() * 200 - 100}px, ${window.innerHeight}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
      duration: 2000 + Math.random() * 1500,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    anim.onfinish = () => confetti.remove();
  }
}

function startTickerSimulation() {
  const tickerEl = document.getElementById('tickerText');
  if (!tickerEl) return;
  tickerEl.innerText = FAKE_TICKER_DATA.join('   •   ');
}
