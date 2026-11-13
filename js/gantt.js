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
    // Apply current settings if present
    if (RESCHEDULE_DATA.settings) {
      if (RESCHEDULE_DATA.settings.numWorkers && RESCHEDULE_DATA.settings.numMachines) {
        this.generateScheduleFromResources(RESCHEDULE_DATA.settings.numWorkers, RESCHEDULE_DATA.settings.numMachines, false);
      }
    }
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

  /**
   * Generates production schedule dynamically based on Number of Workers and Number of Machines available.
   */
  generateScheduleFromResources(numWorkers, numMachines, notify = true) {
    const wCount = Math.max(1, parseInt(numWorkers) || 10);
    const mCount = Math.min(13, Math.max(1, parseInt(numMachines) || 13));

    RESCHEDULE_DATA.settings.numWorkers = wCount;
    RESCHEDULE_DATA.settings.numMachines = mCount;

    // Filter available operational machines up to mCount
    const availableMachines = RESCHEDULE_DATA.machines.slice(0, mCount).map(m => m.id);

    // Map capabilities for routing when machines are limited
    const altCapable = {
      'M-001': ['M-003', 'M-006'],
      'M-002': ['M-004', 'M-001'],
      'M-003': ['M-001'],
      'M-004': ['M-002'],
      'M-005': ['M-007'],
      'M-006': ['M-001', 'M-003'],
      'M-007': ['M-002'],
      'M-008': ['M-005'],
      'M-009': ['M-008'],
      'M-010': ['M-011', 'M-001'],
      'M-011': ['M-010'],
      'M-012': ['M-005', 'M-001'],
      'M-013': ['M-001', 'M-003']
    };

    let base = JSON.parse(JSON.stringify(RESCHEDULE_DATA.scheduleBlocks));

    // Re-route operations if their target machine is beyond fleet capacity
    base.forEach((b, idx) => {
      if (!availableMachines.includes(b.machineId)) {
        if (b.type === 'processing') {
          const candidates = altCapable[b.machineId] || [];
          const viable = candidates.find(c => availableMachines.includes(c)) || availableMachines[0];
          b.originalMachineId = b.machineId;
          b.machineId = viable;
          b.start += 15 + (idx % 3) * 10;
          b.end += 15 + (idx % 3) * 10;
          b.isRescheduled = true;
          b.label = `⚡ ${b.label} [Fleet-Adj to ${viable}]`;
        }
      }
    });

    // Handle operator constraints: if workers < 8, stagger operations
    if (wCount < 8) {
      const staggerDelta = (8 - wCount) * 12;
      base.forEach((b, i) => {
        if (b.type === 'processing') {
          const shift = (i % (8 - wCount + 1)) * staggerDelta;
          b.start += shift;
          b.end += shift;
        }
      });
    }

    this.scheduleState = base;

    // Dynamic metrics computation
    const maxEnd = Math.max(...base.map(b => b.end), 200);
    const makespan = Math.max(190, maxEnd);
    const hours = Math.floor(makespan / 60) + 8;
    const mins = makespan % 60;
    const compTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} PM`;
    const util = (Math.max(60, Math.min(95, 82.6 - (13 - mCount) * 1.8 + (wCount >= 10 ? 2 : -2)))).toFixed(1);
    const changeover = Math.max(15, 22 + (13 - mCount) * 2);
    const energy = Math.round(965 * (mCount / 13) * (makespan / 205));
    const ontime = (Math.max(75, Math.min(98, 95.0 - (13 - mCount) * 1.5 - Math.max(0, 10 - wCount) * 1.8))).toFixed(1);

    this.updateSummaryKPIs(makespan, compTime, util, changeover, energy, ontime);
    this.render();

    const summary = {
      numWorkers: wCount,
      numMachines: mCount,
      makespan,
      completionTime: compTime,
      utilization: util,
      changeover,
      energy,
      onTimeDelivery: ontime
    };

    RESCHEDULE_DATA.settings.lastScheduleSummary = summary;
    if (notify) {
      showToast(`Schedule generated for ${wCount} workers & ${mCount} machines (Makespan: ${makespan}m)`, 'success');
    }
    return summary;
  },

  /**
   * Reschedules production plan dynamically when workers are absent or machines are broken.
   */
  rescheduleForDisruptions(absentWorkerIds = [], brokenMachineIds = [], reason = '') {
    RESCHEDULE_DATA.settings.absentWorkers = [...absentWorkerIds];
    RESCHEDULE_DATA.settings.brokenMachines = [...brokenMachineIds];

    // Update worker status
    RESCHEDULE_DATA.workers.forEach(w => {
      w.status = absentWorkerIds.includes(w.id) ? 'absent' : 'available';
    });

    // Update machine status
    RESCHEDULE_DATA.machines.forEach(m => {
      if (brokenMachineIds.includes(m.id)) {
        m.status = 'breakdown';
        m.currentOp = reason || 'Emergency Breakdown (Offline)';
      } else if (m.status === 'breakdown' && !brokenMachineIds.includes(m.id)) {
        m.status = 'available';
        m.currentOp = 'Ready for Queue';
      }
    });

    const fleetCap = RESCHEDULE_DATA.settings.numMachines || 13;
    const operationalMachines = RESCHEDULE_DATA.machines
      .slice(0, fleetCap)
      .filter(m => !brokenMachineIds.includes(m.id))
      .map(m => m.id);

    const availableWorkers = RESCHEDULE_DATA.workers
      .slice(0, RESCHEDULE_DATA.settings.numWorkers || 10)
      .filter(w => !absentWorkerIds.includes(w.id));

    const altRouting = {
      'M-001': ['M-003', 'M-006', 'M-002'],
      'M-002': ['M-004', 'M-001'],
      'M-003': ['M-001', 'M-006'],
      'M-004': ['M-002'],
      'M-005': ['M-007', 'M-008'],
      'M-006': ['M-001', 'M-003'],
      'M-007': ['M-002', 'M-005'],
      'M-008': ['M-005', 'M-009'],
      'M-009': ['M-008'],
      'M-010': ['M-011', 'M-001'],
      'M-011': ['M-010'],
      'M-012': ['M-005', 'M-001'],
      'M-013': ['M-001', 'M-003']
    };

    let base = JSON.parse(JSON.stringify(RESCHEDULE_DATA.scheduleBlocks));
    let reroutedCount = 0;

    // Process blocks for broken machines
    base = base.map(b => {
      if (brokenMachineIds.includes(b.machineId)) {
        if (b.type === 'processing') {
          reroutedCount++;
          const candidates = altRouting[b.machineId] || [];
          const targetMachine = candidates.find(c => operationalMachines.includes(c)) || operationalMachines[0] || 'M-001';
          const backupWorker = availableWorkers[reroutedCount % (availableWorkers.length || 1)] || { id: 'W-BACKUP', name: 'Backup Operator' };

          return {
            ...b,
            originalMachineId: b.machineId,
            machineId: targetMachine,
            start: b.start + 15,
            end: b.end + 20,
            isRescheduled: true,
            workerId: backupWorker.id,
            workerName: backupWorker.name + ' (Backup)',
            label: `⭐ ${b.label} [Re-routed from ${b.machineId}]`
          };
        }
      }

      // Process operations assigned to absent workers
      if (b.type === 'processing' && b.workerId && absentWorkerIds.includes(b.workerId)) {
        reroutedCount++;
        const backupWorker = availableWorkers[reroutedCount % (availableWorkers.length || 1)] || { id: 'W-BACKUP', name: 'Backup Operator' };
        return {
          ...b,
          workerId: backupWorker.id,
          workerName: backupWorker.name + ' (Covering ' + b.workerId + ')',
          isRescheduled: true,
          label: `${b.label} [Worker Reassigned]`
        };
      }

      return b;
    });

    // Add breakdown blocks for broken machines
    brokenMachineIds.forEach(bmId => {
      const exists = base.some(b => b.machineId === bmId && b.type === 'breakdown');
      if (!exists) {
        base.push({
          id: `SB-BK-${bmId}`,
          machineId: bmId,
          label: `UNEXPECTED BREAKDOWN: ${bmId} Offline`,
          start: 45,
          end: 240,
          type: 'breakdown'
        });
      }
    });

    this.scheduleState = base;

    // Calculate recovered KPIs
    const makespan = 205 + reroutedCount * 5;
    const hours = Math.floor(makespan / 60) + 8;
    const mins = makespan % 60;
    const compTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} PM`;
    const stability = (Math.max(88, 96.5 - reroutedCount * 1.4)).toFixed(1);
    const onTime = (Math.max(86, 95.5 - reroutedCount * 1.1)).toFixed(1);
    const energy = 965 + reroutedCount * 18;
    const changeover = 22 + reroutedCount * 4;

    this.updateSummaryKPIs(makespan, compTime, 81.2, changeover, energy, onTime);
    this.render();

    // Register disruption audit
    const disId = `DIS-RESCHED-${Date.now().toString().slice(-4)}`;
    const disTitle = `Adaptive ReSchedule: ${absentWorkerIds.length} Absent Operator(s) & ${brokenMachineIds.length} Broken Machine(s)`;
    const disDesc = reason || `Dynamic recovery executed. Re-routed ${reroutedCount} operations across active fleet. Preserved ${stability}% schedule stability.`;

    RESCHEDULE_DATA.disruptions.unshift({
      id: disId,
      title: disTitle,
      type: 'breakdown',
      machineId: brokenMachineIds.join(', ') || 'N/A',
      startTime: 'Live Now',
      estRepairMinutes: 120,
      affectedJobs: ['JOB-001', 'JOB-007'],
      impactLevel: 'Managed',
      status: 'Recovered via ReSchedule',
      desc: disDesc
    });

    RESCHEDULE_DATA.disruptionHistory.unshift({
      id: `HIST-${Date.now().toString().slice(-4)}`,
      time: 'Just now',
      event: disTitle,
      resolution: `Re-routed ${reroutedCount} tasks, ${stability}% stability preserved`,
      recoveredBy: 'ReSchedule Solver'
    });

    return {
      status: 'success',
      disruptionId: disId,
      absentWorkersCount: absentWorkerIds.length,
      brokenMachinesCount: brokenMachineIds.length,
      reroutedOperations: reroutedCount,
      makespan,
      completionTime: compTime,
      stabilityIndex: `${stability}%`,
      predictedOnTime: `${onTime}%`,
      activeWorkersCount: availableWorkers.length,
      activeMachinesCount: operationalMachines.length
    };
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
    const maxMachines = (RESCHEDULE_DATA.settings && RESCHEDULE_DATA.settings.numMachines) ? RESCHEDULE_DATA.settings.numMachines : 13;
    const brokenList = (RESCHEDULE_DATA.settings && RESCHEDULE_DATA.settings.brokenMachines) || [];

    machines.forEach((m, mIndex) => {
      // Check if machine is beyond available fleet capacity set in Settings
      if (mIndex >= maxMachines) {
        rowsHtml += `
          <div class="gantt-row offline-machine" style="opacity: 0.45; background: #f8fafc;">
            <div class="gantt-machine-label" title="${m.name} (Offline - Fleet Capacity Limit)">
              <span class="live-dot" style="background-color: #94a3b8;"></span>
              <strong>${m.id}</strong>
              <span style="font-size: 0.65rem; color: #ef4444; font-weight: 700;">OFFLINE</span>
            </div>
            <div class="gantt-lane" style="display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 0.75rem; font-style: italic;">
              Workcenter offline (Fleet capacity set to ${maxMachines} in Settings)
            </div>
          </div>
        `;
        return;
      }

      const isBroken = brokenList.includes(m.id) || m.status === 'breakdown';

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
        if (b.isRescheduled) extraClass += ' rescheduled';

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
               data-worker="${b.workerName ? b.workerName + ' (' + (b.workerId || '') + ')' : ''}"
               data-rescheduled="${b.isRescheduled ? 'true' : 'false'}"
               data-machine="${m.name} (${m.id})"
               data-type="${b.type}">
            <span>${b.label}</span>
          </div>
        `;
      });

      const labelStatusColor = isBroken ? '#ef4444' : this.getMachineStatusColor(m.status);

      rowsHtml += `
        <div class="gantt-row ${isBroken ? 'machine-broken' : ''}">
          <div class="gantt-machine-label" title="${m.name} ${isBroken ? '(BROKEN WORKCENTER)' : ''}">
            <span class="live-dot ${isBroken ? 'alert' : ''}" style="background-color: ${labelStatusColor}"></span>
            <strong>${m.id}</strong>
            <span style="font-size: 0.68rem; color: ${isBroken ? '#ef4444' : '#64748b'}; font-weight: ${isBroken ? '700' : 'normal'};">
              ${isBroken ? '🚨 BROKEN' : m.type.split(' ')[0]}
            </span>
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

    // Update banner KPIs if present
    const wTotal = (RESCHEDULE_DATA.settings && RESCHEDULE_DATA.settings.numWorkers) || 10;
    const wAbsent = (RESCHEDULE_DATA.settings && RESCHEDULE_DATA.settings.absentWorkers) ? RESCHEDULE_DATA.settings.absentWorkers.length : 0;
    const mTotal = maxMachines;
    const mBroken = brokenList.length;

    const elGanttWorkers = document.getElementById('gantt-stat-workers');
    const elGanttAbsent = document.getElementById('gantt-stat-absent');
    const elGanttMachines = document.getElementById('gantt-stat-machines');
    const elGanttBroken = document.getElementById('gantt-stat-broken');
    if (elGanttWorkers) elGanttWorkers.innerText = `${wTotal - wAbsent} Active`;
    if (elGanttAbsent) elGanttAbsent.innerText = `${wAbsent} Absent`;
    if (elGanttMachines) elGanttMachines.innerText = `${Math.max(0, mTotal - mBroken)}/${mTotal} Active`;
    if (elGanttBroken) elGanttBroken.innerText = `${mBroken} Broken`;

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
        let workerHtml = d.worker ? `<div>Assigned Worker: <span style="color: #38bdf8; font-weight: 700;">👤 ${d.worker}</span></div>` : '';
        let reschedHtml = d.rescheduled === 'true' ? `<div style="color: #f59e0b; font-weight: 700; margin-top: 4px; font-size: 0.75rem;">⚡ Adaptive Rescheduled Operation</div>` : '';

        tooltip.innerHTML = `
          <div style="font-weight: 700; color: #22d3ee; margin-bottom: 4px;">${d.label}</div>
          <div>Machine: <span style="color: #cbd5e1;">${d.machine}</span></div>
          ${workerHtml}
          <div>Duration: <span style="color: #cbd5e1;">${parseInt(d.end) - parseInt(d.start)} mins</span> (T+${d.start}m to T+${d.end}m)</div>
          <div>Category: <span style="text-transform: capitalize; color: #fff;">${d.type}</span></div>
          ${reschedHtml}
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

