/**
 * ReSchedule - Intelligent Disruption Recovery Engine
 * The Core Innovation of ReSchedule for MSME Job Shops
 * Demonstrates the 8-step intelligent rescheduling workflow with Before-and-After Gantts
 * Styled for Borcelle Modern SaaS Palette
 */

const RecoveryEngine = {
  isRepairing: false,
  activeDisruption: null,
  recoveryResults: null,

  init() {
    this.activeDisruption = RESCHEDULE_DATA.disruptions[0]; // M-013 breakdown
    this.renderDisruptionSummary();
    this.renderBeforeGantt();
    this.bindEvents();
  },

  renderDisruptionSummary() {
    const d = this.activeDisruption;
    if (!d) return;

    const elTitle = document.getElementById('rec-disruption-title');
    const elDesc = document.getElementById('rec-disruption-desc');
    const elMachines = document.getElementById('rec-affected-machines');
    const elJobs = document.getElementById('rec-affected-jobs');
    const elLoss = document.getElementById('rec-estimated-loss');

    if (elTitle) elTitle.innerText = d.title;
    if (elDesc) elDesc.innerText = d.desc;
    if (elMachines) elMachines.innerHTML = `<span class="badge badge-rose">${d.machineId} (${d.machineName})</span>`;
    if (elJobs) elJobs.innerHTML = d.affectedJobs.map(j => `<span class="badge badge-amber">${j}</span>`).join(' ');
    if (elLoss) elLoss.innerText = `Est. Delay: +${d.estRepairMinutes} min | Financial Impact: ~₹12,500`;
  },

  renderBeforeGantt() {
    const container = document.getElementById('rec-gantt-before');
    if (!container) return;

    // Render original disrupted schedule focusing on key machines (M-001, M-002, M-003, M-006, M-007, M-013)
    const targetMachines = ['M-001', 'M-002', 'M-003', 'M-006', 'M-007', 'M-013'];
    let html = '';

    targetMachines.forEach(mId => {
      const blocks = RESCHEDULE_DATA.scheduleBlocks.filter(b => b.machineId === mId);

      let blocksHtml = '';
      blocks.forEach(b => {
        const leftPct = (b.start / 240) * 100;
        const widthPct = Math.max(2, ((b.end - b.start) / 240) * 100);
        let bg = b.type === 'processing' ? (RESCHEDULE_DATA.jobColors[b.jobId] || '#0099ff') : '#64748b';
        if (b.type === 'breakdown') bg = 'repeating-linear-gradient(45deg, #dc2626, #dc2626 8px, #b91c1c 8px, #b91c1c 16px)';

        blocksHtml += `
          <div class="gantt-block ${b.isDelayed ? 'delayed' : ''}" style="left: ${leftPct}%; width: ${widthPct}%; background: ${bg};">
            ${b.label}
          </div>
        `;
      });

      html += `
        <div class="gantt-row" style="margin-bottom: 5px;">
          <div class="gantt-machine-label" style="width: 90px; font-size: 0.76rem;"><strong>${mId}</strong></div>
          <div class="gantt-lane" style="height: 34px;">${blocksHtml}</div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  renderAfterGantt() {
    const container = document.getElementById('rec-gantt-after');
    if (!container) return;

    // Repaired schedule: JOB-007 (stalled on M-013) is safely transferred to M-001 and M-003,
    // preserving unaffected operations on M-002, M-006, M-007!
    const targetMachines = ['M-001', 'M-002', 'M-003', 'M-006', 'M-007', 'M-013'];
    let html = '';

    targetMachines.forEach(mId => {
      let blocksHtml = '';

      if (mId === 'M-001') {
        // M-001 takes diverted operation OP-702 with minimal shift
        blocksHtml = `
          <div class="gantt-block" style="left: 0%; width: 18.75%; background: #0099ff;">JOB-001 [Milling]</div>
          <div class="gantt-block changeover" style="left: 18.75%; width: 4.16%;">Tool Chg</div>
          <div class="gantt-block" style="left: 22.9%; width: 22.9%; background: #ef4444;">JOB-008 [Milling]</div>
          <div class="gantt-block" style="left: 48%; width: 22%; background: #f97316; border: 2.5px solid #0099ff; box-shadow: 0 0 12px rgba(0,153,255,0.6);">
            ⭐ JOB-007 [Re-routed from M-013]
          </div>
          <div class="gantt-block" style="left: 72%; width: 25%; background: #ec4899;">JOB-005 [Shifted +15m]</div>
        `;
      } else if (mId === 'M-002') {
        blocksHtml = `
          <div class="gantt-block" style="left: 20.8%; width: 12.5%; background: #0099ff;">JOB-001 [Drill]</div>
          <div class="gantt-block" style="left: 47.9%; width: 10.4%; background: #ef4444;">JOB-008 [Cross]</div>
          <div class="gantt-block" style="left: 81.25%; width: 12.5%; background: #ec4899;">JOB-005 [Drill]</div>
        `;
      } else if (mId === 'M-003') {
        blocksHtml = `
          <div class="gantt-block" style="left: 27%; width: 20.8%; background: #8b5cf6;">JOB-002 [5-Axis]</div>
          <div class="gantt-block changeover" style="left: 47.9%; width: 4.16%;">Chg</div>
          <div class="gantt-block" style="left: 54%; width: 27%; background: #a855f7;">JOB-009 [Gear Mill]</div>
        `;
      } else if (mId === 'M-006') {
        blocksHtml = `
          <div class="gantt-block" style="left: 0%; width: 25%; background: #8b5cf6;">JOB-002 [Turn]</div>
          <div class="gantt-block" style="left: 27%; width: 16.6%; background: #f59e0b;">JOB-003 [Turn]</div>
          <div class="gantt-block" style="left: 45.8%; width: 31.25%; background: #14b8a6;">JOB-010 [Roughing]</div>
        `;
      } else if (mId === 'M-007') {
        blocksHtml = `
          <div class="gantt-block" style="left: 60.4%; width: 12.5%; background: #ef4444;">JOB-008 [CMM]</div>
          <div class="gantt-block" style="left: 75%; width: 8.3%; background: #8b5cf6;">JOB-002 [CMM]</div>
        `;
      } else if (mId === 'M-013') {
        // M-013 is safely isolated during repair
        blocksHtml = `
          <div class="gantt-block breakdown" style="left: 25%; width: 75%;">
            ISOLATED WORKCENTER (Emergency Spindle Overhaul in Progress)
          </div>
        `;
      }

      html += `
        <div class="gantt-row" style="margin-bottom: 5px;">
          <div class="gantt-machine-label" style="width: 90px; font-size: 0.76rem;"><strong>${mId}</strong></div>
          <div class="gantt-lane" style="height: 34px;">${blocksHtml}</div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  repairSchedule() {
    if (this.isRepairing) return;
    this.isRepairing = true;

    const btnRepair = document.getElementById('btn-repair-schedule');
    if (btnRepair) {
      btnRepair.disabled = true;
      btnRepair.innerHTML = `<span class="spinner"></span> Executing ReSchedule Optimization...`;
    }

    const workflowSteps = [
      { id: 1, label: 'Step 1/8: Detecting disruption & isolating workcenter M-013...' },
      { id: 2, label: 'Step 2/8: Identifying affected downstream operations (OP-702)...' },
      { id: 3, label: 'Step 3/8: Analyzing alternative capable machines (M-001, M-003)...' },
      { id: 4, label: 'Step 4/8: Preserving 92% unaffected job assignments (Stability Anchor)...' },
      { id: 5, label: 'Step 5/8: Optimizing job re-sequencing via heuristic search...' },
      { id: 6, label: 'Step 6/8: Minimizing changeover penalties and tool travel...' },
      { id: 7, label: 'Step 7/8: Validating machine capacity & precedence constraints...' },
      { id: 8, label: 'Step 8/8: Synthesizing repaired production schedule!' }
    ];

    const workflowStatusEl = document.getElementById('rec-workflow-status');

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < workflowSteps.length) {
        const step = workflowSteps[currentStep];
        if (workflowStatusEl) workflowStatusEl.innerText = step.label;
        
        // Update checkmarks in step list
        const stepItem = document.getElementById(`rec-step-${step.id}`);
        if (stepItem) {
          stepItem.classList.remove('badge-gray');
          stepItem.classList.add('badge-emerald');
          stepItem.innerHTML = `<span>✅</span> <span>${step.label.split(':')[1]}</span>`;
        }

        currentStep++;
      } else {
        clearInterval(interval);
        this.finalizeRecovery();
      }
    }, 280); // Total ~2.3 seconds
  },

  finalizeRecovery() {
    this.isRepairing = false;
    const btnRepair = document.getElementById('btn-repair-schedule');
    if (btnRepair) {
      btnRepair.disabled = false;
      btnRepair.innerHTML = `<span>🛡️</span> REPAIR PRODUCTION SCHEDULE`;
    }

    // Render After Gantt
    this.renderAfterGantt();

    // Show KPI comparison cards
    const kpiWrap = document.getElementById('rec-kpis-container');
    if (kpiWrap) kpiWrap.style.display = 'grid';

    // Show After Gantt container
    const afterWrap = document.getElementById('rec-after-wrapper');
    if (afterWrap) afterWrap.style.display = 'block';

    // Update KPI values
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setVal('rec-kpi-time', '2.34s');
    setVal('rec-kpi-rescheduled', '3 Jobs');
    setVal('rec-kpi-changed', '2 Operations');
    setVal('rec-kpi-changeover', '+8 min');
    setVal('rec-kpi-energy', '+₹45');
    setVal('rec-kpi-ontime', '94.2% (Recovered)');
    setVal('rec-kpi-stability', '91.5% Stability Index');

    // Remove delayed badge on JOB-007
    const j7 = RESCHEDULE_DATA.jobs.find(j => j.id === 'JOB-007');
    if (j7) {
      j7.status = 'in-progress';
      j7.progress = 45;
    }

    showToast('Schedule successfully repaired! 91.5% stability achieved', 'success');
  },

  bindEvents() {
    const btnRepair = document.getElementById('btn-repair-schedule');
    if (btnRepair) {
      btnRepair.addEventListener('click', () => {
        this.repairSchedule();
      });
    }
  }
};
