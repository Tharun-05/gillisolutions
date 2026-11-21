/**
 * Logo intro on the home page.
 * Plays the logo video once per browser session, then lifts away like a shutter.
 * Never blocks for long: skipped if the video can't start within 1.5 s, capped at 5 s,
 * and skippable by tap, click or any key. The head script decides whether it shows at all.
 */
const root = document.documentElement;
const intro = document.getElementById('intro');

function run() {
  if (!intro) return;
  if (!root.classList.contains('has-intro')) {
    intro.remove(); // not playing this time — make sure the video is never downloaded
    return;
  }
  const video = intro.querySelector('video');
  video.preload = 'auto';
  const bar = intro.querySelector('.intro__bar span');
  const START_TIMEOUT = 1500;
  const MAX_DURATION = 5000;
  let done = false;
  let raf = 0;

  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    try { sessionStorage.setItem('gilli-intro', '1'); } catch { /* storage unavailable */ }
    intro.classList.add('is-leaving');
    root.classList.add('intro-done');
    window.removeEventListener('keydown', finish);
    setTimeout(() => {
      intro.remove();
      video.pause();
      video.removeAttribute('src');
    }, 850);
  };

  // Progress bar follows the video (or the cap, whichever is shorter).
  const tick = () => {
    const total = Math.min((video.duration || 5) * 1000, MAX_DURATION);
    bar.style.transform = `scaleX(${Math.min(1, (video.currentTime * 1000) / total)})`;
    raf = requestAnimationFrame(tick);
  };

  const startTimer = setTimeout(finish, START_TIMEOUT); // video too slow → skip
  video.addEventListener('playing', () => {
    clearTimeout(startTimer);
    raf = requestAnimationFrame(tick);
    setTimeout(finish, MAX_DURATION);
  }, { once: true });
  video.addEventListener('ended', finish);
  video.addEventListener('error', finish, true);

  intro.addEventListener('click', finish);
  window.addEventListener('keydown', finish);

  const p = video.play();
  if (p && p.catch) p.catch(finish); // autoplay refused → skip
}

run();
