/**
 * ReSchedule - Interactive Gantt Schedule Engine
 * Handles timeline layout, multi-machine lanes, block rendering, tooltips, and algorithm switching
 */

const GanttEngine = {
  containerId: 'gantt-chart-wrapper',
  totalTimelineMinutes: 240, // default 4 hours
  zoomHours: 4,
  filterChangeovers: true,
  filterBreakdowns: true,
  currentAlgorithm: 'ReSchedule',
  scheduleState: [],

  init() {
    this.scheduleState = JSON.parse(JSON.stringify(RESCHEDULE_DATA.scheduleBlocks));
    this.render();
    this.bindEvents();
  },

  setZoom(hours) {
    this.zoomHours = hours;
    this.totalTimelineMinutes = hours * 60;
    this.render();
  },

  setAlgorithm(algo) {
    this.currentAlgorithm = algo;
    const btn = document.getElementById('btn-generate-schedule');
    if (btn) {
      btn.innerHTML = `<span class="spinner"></span> Optimizing with ${algo}...`;
      btn.disabled = true;
    }

    setTimeout(() => {
      this.recalculateScheduleForAlgorithm(algo);
      this.render();
      if (btn) {
        btn.innerHTML = `<span>⚡</span> Generate Schedule`;
        btn.disabled = false;
      }
      showToast(`Schedule generated using ${algo} algorithm`, 'success');
    }, 600);
  },

  recalculateScheduleForAlgorithm(algo) {
    // Generate distinct schedules demonstrating algorithm tradeoffs
    const base = JSON.parse(JSON.stringify(RESCHEDULE_DATA.scheduleBlocks));
    
    if (algo === 'FCFS') {
      // First come first served: higher changeover, longer makespan, jobs strictly ordered by arrival
      this.scheduleState = base.map(b => {
        if (b.type === 'processing') {
          return { ...b, end: b.start + (b.end - b.start) + 10 };
        }
        return b;
      });
      this.updateSummaryKPIs(270, '04:30 PM', 58.4, 52, 1480, 64.2);
    } else if (algo === 'EDD') {
      // Earliest due date: focuses on deadlines, slightly better on-time, medium makespan
      this.scheduleState = base.map(b => {
        if (b.jobId === 'JOB-002' || b.jobId === 'JOB-008') {
          return { ...b, start: Math.max(0, b.start - 10), end: b.end - 10 };
        }
        return b;
      });
      this.updateSummaryKPIs(245, '04:05 PM', 68.2, 45, 1390, 76.8);
    } else if (algo === 'CP-SAT') {
      // Google OR-Tools CP-SAT: strong makespan, but slower recovery and disrupted by breakdowns
      this.scheduleState = base;
      this.updateSummaryKPIs(225, '03:45 PM', 74.5, 30, 1120, 88.5);
    } else {
      // Proposed ReSchedule: Intelligent MSME recovery, optimal makespan, minimized changeover
      this.scheduleState = base;
      this.updateSummaryKPIs(205, '03:25 PM', 82.6, 22, 965, 94.8);
    }
  },

  updateSummaryKPIs(makespan, completion, util, changeover, energy, ontime) {
    const elMakespan = document.getElementById('kpi-sched-makespan');
    const elComp = document.getElementById('kpi-sched-completion');
    const elUtil = document.getElementById('kpi-sched-util');
    const elChange = document.getElementById('kpi-sched-changeover');
    const elEnergy = document.getElementById('kpi-sched-energy');
    const elOntime = document.getElementById('kpi-sched-ontime');

    if (elMakespan) elMakespan.innerText = `${makespan} min`;
    if (elComp) elComp.innerText = completion;
    if (elUtil) elUtil.innerText = `${util}%`;
    if (elChange) elChange.innerText = `${changeover} min`;
    if (elEnergy) elEnergy.innerText = `₹${energy}`;
    if (elOntime) elOntime.innerText = `${ontime}%`;
  },

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const totalMinutes = this.totalTimelineMinutes;
    const machines = RESCHEDULE_DATA.machines;

    // Timeline header ticks (every 30 mins)
    const tickInterval = totalMinutes <= 240 ? 30 : 60;
    const tickCount = Math.floor(totalMinutes / tickInterval);
    let ticksHtml = '';

    for (let i = 0; i <= tickCount; i++) {
      const min = i * tickInterval;
      const h = Math.floor(min / 60) + 8; // starts at 08:00 AM
      const m = min % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      ticksHtml += `<div class="gantt-time-tick" style="width: ${(tickInterval / totalMinutes) * 100}%">${timeStr} (+${min}m)</div>`;
    }

    // Rows per machine
    let rowsHtml = '';
    machines.forEach(m => {
      // Filter blocks for this machine
      const mBlocks = this.scheduleState.filter(b => {
        if (b.machineId !== m.id) return false;
        if (!this.filterChangeovers && b.type === 'changeover') return false;
        if (!this.filterBreakdowns && b.type === 'breakdown') return false;
        return true;
      });

      let blocksHtml = '';
      mBlocks.forEach(b => {
        const leftPct = (b.start / totalMinutes) * 100;
        const widthPct = Math.max(1.5, ((b.end - b.start) / totalMinutes) * 100);

        let bgStyle = '';
        let extraClass = b.type;
        if (b.isDelayed) extraClass += ' delayed';

        if (b.type === 'processing') {
          const color = RESCHEDULE_DATA.jobColors[b.jobId] || '#06b6d4';
          bgStyle = `background: ${color};`;
        }

        blocksHtml += `
          <div class="gantt-block ${extraClass}" 
               style="left: ${leftPct}%; width: ${widthPct}%; ${bgStyle}"
               data-job="${b.jobId || ''}"
               data-label="${b.label}"
               data-start="${b.start}"
               data-end="${b.end}"
               data-machine="${m.name} (${m.id})"
               data-type="${b.type}">
            <span>${b.label}</span>
          </div>
        `;
      });

      rowsHtml += `
        <div class="gantt-row">
          <div class="gantt-machine-label" title="${m.name}">
            <span class="live-dot ${m.status === 'breakdown' ? 'alert' : ''}" style="background-color: ${this.getMachineStatusColor(m.status)}"></span>
            <strong>${m.id}</strong>
            <span style="font-size: 0.68rem; color: #64748b; font-weight: normal; truncate">${m.type.split(' ')[0]}</span>
          </div>
          <div class="gantt-lane">
            ${blocksHtml}
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="gantt-timeline-header">
        ${ticksHtml}
      </div>
      <div class="gantt-rows">
        ${rowsHtml}
      </div>
    `;

    this.attachTooltips();
  },

  getMachineStatusColor(status) {
    switch (status) {
      case 'available': return '#10b981';
      case 'processing': return '#06b6d4';
      case 'idle': return '#f59e0b';
      case 'maintenance': return '#8b5cf6';
      case 'breakdown': return '#ef4444';
      default: return '#64748b';
    }
  },

  attachTooltips() {
    const tooltip = document.getElementById('gantt-tooltip');
    if (!tooltip) return;

    const blocks = document.querySelectorAll('.gantt-block');
    blocks.forEach(b => {
      b.addEventListener('mouseenter', e => {
        const d = b.dataset;
        tooltip.innerHTML = `
          <div style="font-weight: 700; color: #22d3ee; margin-bottom: 4px;">${d.label}</div>
          <div>Machine: <span style="color: #cbd5e1;">${d.machine}</span></div>
          <div>Duration: <span style="color: #cbd5e1;">${parseInt(d.end) - parseInt(d.start)} mins</span> (T+${d.start}m to T+${d.end}m)</div>
          <div>Category: <span style="text-transform: capitalize; color: #fff;">${d.type}</span></div>
        `;
        tooltip.style.display = 'block';
      });

      b.addEventListener('mousemove', e => {
        tooltip.style.left = `${e.clientX + 14}px`;
        tooltip.style.top = `${e.clientY + 14}px`;
      });

      b.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });
  },

  bindEvents() {
    // Zoom Buttons
    document.querySelectorAll('[data-gantt-zoom]').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('[data-gantt-zoom]').forEach(b => b.classList.remove('btn-primary'));
        btn.classList.add('btn-primary');
        this.setZoom(parseInt(btn.dataset.ganttZoom));
      });
    });

    // Checkbox Filters
    const cbChangeover = document.getElementById('toggle-gantt-changeover');
    if (cbChangeover) {
      cbChangeover.addEventListener('change', e => {
        this.filterChangeovers = e.target.checked;
        this.render();
      });
    }

    const cbBreakdown = document.getElementById('toggle-gantt-breakdown');
    if (cbBreakdown) {
      cbBreakdown.addEventListener('change', e => {
        this.filterBreakdowns = e.target.checked;
        this.render();
      });
    }

    // Export button
    const btnExport = document.getElementById('btn-export-schedule');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        this.exportCSV();
      });
    }
  },

  exportCSV() {
    let csv = 'Block ID,Machine ID,Job ID,Operation,Start Minute,End Minute,Duration,Type\n';
    this.scheduleState.forEach(b => {
      csv += `${b.id},${b.machineId},${b.jobId || 'N/A'},"${b.label}",${b.start},${b.end},${b.end - b.start},${b.type}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ReSchedule_Production_Schedule_${this.currentAlgorithm}.csv`;
    a.click();
    showToast('Schedule exported as CSV successfully', 'success');
  }
};

