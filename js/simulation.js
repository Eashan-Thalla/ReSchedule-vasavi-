/**
 * ReSchedule - Discrete-Event Manufacturing Simulation Engine
 * Handles virtual simulation clock, event queue processing, live floor state updates
 * Styled for Borcelle Modern SaaS Palette
 */

const SimulationEngine = {
  currentSimMinutes: 0,
  speed: 1, // 1x, 2x, 5x, 10x
  isRunning: false,
  timerInterval: null,
  processedEvents: [],
  maxMinutes: 240,

  init() {
    this.renderFloor();
    this.renderEventQueue();
    this.bindEvents();
    this.updateClockDisplay();
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.updateControlsUI();
    showToast('Simulation started: Live factory floor active', 'success');

    const tickMs = 1000 / this.speed;
    this.timerInterval = setInterval(() => {
      this.tick();
    }, tickMs);
  },

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.updateControlsUI();
    showToast('Simulation paused', 'warning');
  },

  reset() {
    this.pause();
    this.currentSimMinutes = 0;
    this.processedEvents = [];
    this.renderFloor();
    this.renderEventQueue();
    this.renderEventLog();
    this.updateClockDisplay();
    showToast('Simulation reset to 08:00 AM', 'info');
  },

  setSpeed(s) {
    this.speed = s;
    if (this.isRunning) {
      clearInterval(this.timerInterval);
      const tickMs = 1000 / this.speed;
      this.timerInterval = setInterval(() => {
        this.tick();
      }, tickMs);
    }
  },

  tick() {
    this.currentSimMinutes += 1;
    this.updateClockDisplay();

    // Check for triggered events at this minute
    const eventsAtThisTick = RESCHEDULE_DATA.simEvents.filter(e => e.timeMin === this.currentSimMinutes);
    if (eventsAtThisTick.length > 0) {
      eventsAtThisTick.forEach(e => {
        this.processedEvents.unshift({ ...e, executedAt: this.getClockTime() });
        this.triggerFloorStateChange(e);
      });
      this.renderEventLog();
      this.renderEventQueue();
    }

    if (this.currentSimMinutes >= this.maxMinutes) {
      this.pause();
      showToast('Simulation completed shift run (240 mins)', 'success');
    }
  },

  triggerFloorStateChange(evt) {
    if (evt.type === 'breakdown') {
      const m13 = RESCHEDULE_DATA.machines.find(m => m.id === 'M-013');
      if (m13) {
        m13.status = 'breakdown';
        m13.currentOp = 'CRITICAL: Wire Feed Servo Breakdown';
      }
      this.renderFloor();
      showToast('BREAKDOWN DETECTED: M-013 Stalled! Disruption triggered', 'error');
      
      // Update header live dot
      const headerDot = document.getElementById('header-live-dot');
      if (headerDot) headerDot.classList.add('alert');
      const headerStatus = document.getElementById('header-sim-status');
      if (headerStatus) headerStatus.innerText = 'Disruption Active';
    } else if (evt.type === 'recovery') {
      const m13 = RESCHEDULE_DATA.machines.find(m => m.id === 'M-013');
      if (m13) {
        m13.currentOp = 'Bypassed by ReSchedule Recovery';
      }
      this.renderFloor();
      showToast('RECOVERY: ReSchedule re-routed 3 jobs dynamically', 'success');
    }
  },

  getClockTime() {
    const totalMin = this.currentSimMinutes;
    const h = Math.floor(totalMin / 60) + 8;
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  },

  updateClockDisplay() {
    const clockEl = document.getElementById('sim-clock-time');
    const minEl = document.getElementById('sim-clock-minutes');
    const progEl = document.getElementById('sim-progress-bar');

    if (clockEl) clockEl.innerText = this.getClockTime();
    if (minEl) minEl.innerText = `+${this.currentSimMinutes} min`;
    if (progEl) {
      const pct = (this.currentSimMinutes / this.maxMinutes) * 100;
      progEl.style.width = `${pct}%`;
    }
  },

  updateControlsUI() {
    const btnStart = document.getElementById('btn-sim-start');
    const btnPause = document.getElementById('btn-sim-pause');
    const statusBadge = document.getElementById('sim-status-badge');

    if (btnStart) btnStart.disabled = this.isRunning;
    if (btnPause) btnPause.disabled = !this.isRunning;

    if (statusBadge) {
      if (this.isRunning) {
        statusBadge.className = 'badge badge-cyan';
        statusBadge.innerHTML = `<span class="live-dot"></span> Running (${this.speed}x)`;
      } else {
        statusBadge.className = 'badge badge-gray';
        statusBadge.innerHTML = `Paused`;
      }
    }
  },

  renderFloor() {
    const container = document.getElementById('sim-floor-grid');
    if (!container) return;

    let html = '';
    RESCHEDULE_DATA.machines.forEach(m => {
      let statusBadge = '';
      if (m.status === 'processing') statusBadge = '<span class="badge badge-cyan"><span class="live-dot"></span> Processing</span>';
      else if (m.status === 'available') statusBadge = '<span class="badge badge-emerald">Available</span>';
      else if (m.status === 'idle') statusBadge = '<span class="badge badge-amber">Idle</span>';
      else if (m.status === 'maintenance') statusBadge = '<span class="badge badge-purple">Maintenance</span>';
      else if (m.status === 'breakdown') statusBadge = '<span class="badge badge-rose"><span class="live-dot alert"></span> Breakdown</span>';

      html += `
        <div class="machine-tile status-${m.status}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="font-family: monospace; font-size: 0.75rem; color: #0099ff; font-weight: 800;">${m.id}</span>
              <h4 style="font-size: 0.95rem; font-weight: 800; color: #1e293b; margin-top: 2px;">${m.name}</h4>
            </div>
            ${statusBadge}
          </div>
          
          <div style="font-size: 0.78rem; color: #64748b; margin: 4px 0;">
            Op: <span style="color: #1e293b; font-weight: 600;">${m.currentOp || 'Ready'}</span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #64748b; margin-top: auto;">
            <span>Load: <strong style="color: #0099ff;">${m.utilization}%</strong></span>
            <span>Power: <strong style="color: #1e293b;">${m.powerDemandKW} kW</strong></span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  renderEventQueue() {
    const container = document.getElementById('sim-event-queue');
    if (!container) return;

    const upcoming = RESCHEDULE_DATA.simEvents.filter(e => e.timeMin > this.currentSimMinutes);
    if (upcoming.length === 0) {
      container.innerHTML = '<div style="font-size: 0.78rem; color: #64748b; padding: 0.65rem;">Queue completed for this shift.</div>';
      return;
    }

    let html = '';
    upcoming.slice(0, 5).forEach(e => {
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>${e.icon}</span>
            <span style="color: #1e293b; font-weight: 700;">${e.title}</span>
          </div>
          <span style="font-family: monospace; font-size: 0.72rem; color: #0099ff; font-weight: 700;">T+${e.timeMin}m (${e.clock})</span>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  renderEventLog() {
    const container = document.getElementById('sim-event-log');
    if (!container) return;

    if (this.processedEvents.length === 0) {
      container.innerHTML = '<div style="font-size: 0.78rem; color: #64748b; padding: 0.65rem;">No events triggered yet. Press Start Simulation.</div>';
      return;
    }

    let html = '';
    this.processedEvents.forEach(e => {
      let typeColor = '#0099ff';
      if (e.type === 'breakdown') typeColor = '#ef4444';
      if (e.type === 'recovery') typeColor = '#10b981';
      if (e.type === 'material-delay') typeColor = '#f59e0b';

      html += `
        <div style="padding: 0.75rem 0.85rem; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem; border-left: 4px solid ${typeColor}; background: #f8fafc; margin-bottom: 5px; border-radius: 0 6px 6px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <strong style="color: #1e293b;">${e.icon} ${e.title}</strong>
            <span style="font-family: monospace; font-size: 0.7rem; color: #64748b;">${e.executedAt}</span>
          </div>
          <div style="color: #64748b; font-size: 0.75rem;">${e.desc}</div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  bindEvents() {
    const btnStart = document.getElementById('btn-sim-start');
    const btnPause = document.getElementById('btn-sim-pause');
    const btnReset = document.getElementById('btn-sim-reset');

    if (btnStart) btnStart.addEventListener('click', () => this.start());
    if (btnPause) btnPause.addEventListener('click', () => this.pause());
    if (btnReset) btnReset.addEventListener('click', () => this.reset());

    // Speed Selector buttons
    document.querySelectorAll('[data-sim-speed]').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('[data-sim-speed]').forEach(b => b.classList.remove('btn-primary'));
        btn.classList.add('btn-primary');
        this.setSpeed(parseFloat(btn.dataset.simSpeed));
        showToast(`Simulation speed set to ${btn.dataset.simSpeed}x`, 'info');
      });
    });
  }
};
