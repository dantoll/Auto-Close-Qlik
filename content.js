let idleMinutes = 3;        // default
const WARNING_SECONDS = 30;

let idleTimer;
let countdownTimer;
let remainingSeconds;
let warningEl;

/* =========================
   Timer logic
========================= */

function getIdleTimeMs() {
  return (idleMinutes * 60 - WARNING_SECONDS) * 1000;
}

function resetAllTimers() {
  clearTimeout(idleTimer);
  clearInterval(countdownTimer);
  removeWarning();

  idleTimer = setTimeout(startWarningCountdown, getIdleTimeMs());
}

function startWarningCountdown() {
  remainingSeconds = WARNING_SECONDS;
  showWarning();
  updateWarningText();

  countdownTimer = setInterval(() => {
    remainingSeconds--;
    updateWarningText();

    if (remainingSeconds <= 0) {
      clearInterval(countdownTimer);
      chrome.runtime.sendMessage({ action: "closeThisTab" });
    }
  }, 1000);
}

/* =========================
   Warning UI
========================= */

function showWarning() {
  if (warningEl) return;

  warningEl = document.createElement("div");
  warningEl.id = "auto-close-warning";

  Object.assign(warningEl.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#1f2937",
    color: "white",
    padding: "14px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    zIndex: "999999",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
    maxWidth: "260px"
  });

  warningEl.innerHTML = `
    <strong>⚠️ Deze pagina sluit automatisch</strong><br>
    Geen activiteit gedetecteerd.<br>
    Sluiten over <span id="countdown"></span> seconden.
  `;

  document.body.appendChild(warningEl);
}

function updateWarningText() {
  const span = warningEl?.querySelector("#countdown");
  if (span) span.textContent = remainingSeconds;
}

function removeWarning() {
  if (warningEl) {
    warningEl.remove();
    warningEl = null;
  }
}

/* =========================
   Activity detection
========================= */

[
  "mousedown",
  "keydown",
  "scroll",
  "touchstart"
].forEach(event =>
  window.addEventListener(event, resetAllTimers, { passive: true })
);

/* =========================
   DevTools API
========================= */

window.setIdleMinutes = function (minutes) {
  const value = Number(minutes);

  if (!Number.isFinite(value) || value <= WARNING_SECONDS / 60) {
    console.warn(
      `❌ Ongeldige waarde. Minimaal ${(WARNING_SECONDS / 60).toFixed(1)} minuten.`
    );
    return;
  }

  idleMinutes = value;
  resetAllTimers();

  console.log(
    `✅ IDLE_MINUTES aangepast naar ${idleMinutes} minuten`
  );
};

window.getIdleMinutes = function () {
  return idleMinutes;
};

/* =========================
   Init
========================= */

console.log(
  `🕒 Auto-close actief — idle na ${idleMinutes} minuten`
);

resetAllTimers();
