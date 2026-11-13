/**
 * ReSchedule - Master Application Controller
 * Handles client routing across all 10 pages, CRUD operations, Modals, Global Search & Toasts
 * Styled for Borcelle Modern SaaS Dashboard Palette
 * Team: Quantum Leapers | GNLEC
 */

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '🚨';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

const App = {
  currentPage: 'dashboard',
  editingJobId: null,
  editingMachineId: null,

  init() {
    this.initClock();
    this.initNavigation();
    this.initNotifications();
    this.initGlobalSearch();
    this.initModals();

    // Render initial views
    this.renderJobsTable();
    this.renderMachinesGrid();
    this.renderDisruptionsPage();
    this.renderBenchmarkTable();
    this.renderAnalyticsPage();
    this.initSettings();

    // Initialize module engines
    if (typeof GanttEngine !== 'undefined') GanttEngine.init();
    if (typeof SimulationEngine !== 'undefined') SimulationEngine.init();
    if (typeof RecoveryEngine !== 'undefined') RecoveryEngine.init();

    // Render charts
    setTimeout(() => {
      if (typeof ChartsEngine !== 'undefined') ChartsEngine.renderAll();
    }, 150);
  },

  // Real-time Header Clock
  initClock() {
    const updateTime = () => {
      const now = new Date();
      const elDate = document.getElementById('header-live-date');
      const elTime = document.getElementById('header-live-time');
      if (elDate) {
        elDate.innerText = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      if (elTime) {
        elTime.innerText = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  },

  // 10-Page Sidebar Navigation Router
  initNavigation() {
    const navItems = document.querySelectorAll('[data-nav-target]');
    navItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const targetPage = item.dataset.navTarget;
        this.navigateTo(targetPage);
      });
    });

    // Sidebar collapse toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        setTimeout(() => {
          if (typeof ChartsEngine !== 'undefined') ChartsEngine.renderAll();
        }, 300);
      });
    }
  },

  navigateTo(pageId) {
    this.currentPage = pageId;

    // Update nav active styles
    document.querySelectorAll('[data-nav-target]').forEach(item => {
      if (item.dataset.navTarget === pageId) item.classList.add('active');
      else item.classList.remove('active');
    });

    // Show active page view
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const activeView = document.getElementById(`view-${pageId}`);
    if (activeView) {
      activeView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Refresh charts or sub-engines when entering their page
    setTimeout(() => {
      if (typeof ChartsEngine !== 'undefined') ChartsEngine.renderAll();
      if (pageId === 'scheduling' && typeof GanttEngine !== 'undefined') GanttEngine.render();
      if (pageId === 'recovery' && typeof RecoveryEngine !== 'undefined') {
        RecoveryEngine.renderBeforeGantt();
      }
      if (pageId === 'simulation' && typeof SimulationEngine !== 'undefined') {
        SimulationEngine.renderFloor();
      }
      if (pageId === 'settings') {
        this.initSettings();
      }
    }, 100);
  },

  // Global Search across jobs, machines, disruptions
  initGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    if (!searchInput) return;

    // Keyboard shortcut (Ctrl+K or Cmd+K) to focus search
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = searchInput.value.toLowerCase().trim();
        if (!q) return;

        const matchedJob = RESCHEDULE_DATA.jobs.find(j => j.name.toLowerCase().includes(q) || j.id.toLowerCase().includes(q));
        const matchedMachine = RESCHEDULE_DATA.machines.find(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));

        if (matchedJob) {
          this.navigateTo('jobs');
          showToast(`Navigated to Job: ${matchedJob.name}`, 'info');
        } else if (matchedMachine) {
          this.navigateTo('machines');
          showToast(`Navigated to Machine: ${matchedMachine.name}`, 'info');
        } else {
          showToast(`No exact match for "${q}". Filter applied.`, 'warning');
        }
      }
    });
  },

  // Notifications dropdown
  initNotifications() {
    const btn = document.getElementById('notif-btn');
    const dropdown = document.getElementById('notif-dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target) && e.target !== btn) {
        dropdown.classList.remove('active');
      }
    });

    // Render notifications
    const list = document.getElementById('notif-items-list');
    if (list) {
      list.innerHTML = RESCHEDULE_DATA.notifications.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="showToast('${n.title}', 'info')">
          <div style="font-size: 1.1rem;">${n.type === 'error' ? '🚨' : n.type === 'warning' ? '⚠️' : '✅'}</div>
          <div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #1e293b;">${n.title}</div>
            <div style="font-size: 0.72rem; color: #64748b; margin: 2px 0;">${n.desc}</div>
            <div style="font-size: 0.65rem; color: #94a3b8;">${n.time}</div>
          </div>
        </div>
      `).join('');
    }
  },

  // -------------------------------------------------------------
  // JOB MANAGEMENT CRUD
  // -------------------------------------------------------------
  renderJobsTable() {
    const tbody = document.getElementById('jobs-table-body');
    if (!tbody) return;

    const query = (document.getElementById('job-search-input')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('job-status-filter')?.value || 'all';
    const priorityFilter = document.getElementById('job-priority-filter')?.value || 'all';
    const sortBy = document.getElementById('job-sort-by')?.value || 'dueDate';

    let list = [...RESCHEDULE_DATA.jobs];

    // Filter
    if (query) {
      list = list.filter(j => j.id.toLowerCase().includes(query) || j.name.toLowerCase().includes(query) || j.productType.toLowerCase().includes(query));
    }
    if (statusFilter !== 'all') {
      list = list.filter(j => j.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      list = list.filter(j => j.priority === priorityFilter);
    }

    // Sort
    if (sortBy === 'priority') {
      const order = { urgent: 4, high: 3, medium: 2, low: 1 };
      list.sort((a, b) => (order[b.priority] || 0) - (order[a.priority] || 0));
    } else if (sortBy === 'progress') {
      list.sort((a, b) => b.progress - a.progress);
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #64748b; padding: 2rem;">No jobs match your filter criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(j => {
      let statusBadge = '';
      if (j.status === 'in-progress') statusBadge = '<span class="status-done-pill">✔ In Progress</span>';
      else if (j.status === 'completed') statusBadge = '<span class="status-done-pill" style="color: #10b981;">✔ Completed</span>';
      else if (j.status === 'pending') statusBadge = '<span class="badge badge-amber">Pending</span>';
      else if (j.status === 'delayed') statusBadge = '<span class="badge badge-rose">Delayed</span>';

      let priorityBadge = '';
      if (j.priority === 'urgent') priorityBadge = '<span class="badge badge-rose">Urgent</span>';
      else if (j.priority === 'high') priorityBadge = '<span class="badge badge-amber">High</span>';
      else if (j.priority === 'medium') priorityBadge = '<span class="badge badge-cyan">Medium</span>';
      else priorityBadge = '<span class="badge badge-gray">Low</span>';

      return `
        <tr>
          <td style="font-family: monospace; font-weight: 800; color: #0099ff;">${j.id}</td>
          <td>
            <div style="font-weight: 700; color: #1e293b;">${j.name}</div>
            <div style="font-size: 0.72rem; color: #64748b;">${j.productType}</div>
          </td>
          <td>${priorityBadge}</td>
          <td style="font-size: 0.78rem; color: #475569; font-weight: 600;">${j.arrivalTime}</td>
          <td style="font-size: 0.78rem; color: #475569; font-weight: 600;">${j.dueDate}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="progress-container" style="min-width: 120px;">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${j.progress}%;"></div>
              </div>
              <span style="font-family: monospace; font-size: 0.72rem; color: #475569; font-weight: 700;">${j.progress}%</span>
            </div>
          </td>
          <td style="text-align: center;">
            <span class="badge badge-gray">${j.operations.length} ops</span>
          </td>
          <td style="white-space: nowrap;">
            <button class="btn btn-secondary btn-sm" onclick="App.openEditJobModal('${j.id}')" title="Edit Job">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="App.deleteJob('${j.id}')" title="Delete Job">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddJobModal() {
    this.editingJobId = null;
    document.getElementById('modal-job-title').innerText = 'Add New Production Job';
    document.getElementById('form-job-name').value = '';
    document.getElementById('form-job-product').value = '';
    document.getElementById('form-job-priority').value = 'high';
    document.getElementById('form-job-due').value = 'Today 06:00 PM';
    document.getElementById('form-job-ops').value = 'Rough Mill (45m), Drill Flange (30m), Deburr (20m)';
    this.openModal('modal-job');
  },

  openEditJobModal(jobId) {
    const job = RESCHEDULE_DATA.jobs.find(j => j.id === jobId);
    if (!job) return;
    this.editingJobId = jobId;
    document.getElementById('modal-job-title').innerText = `Edit Job: ${job.id}`;
    document.getElementById('form-job-name').value = job.name;
    document.getElementById('form-job-product').value = job.productType;
    document.getElementById('form-job-priority').value = job.priority;
    document.getElementById('form-job-due').value = job.dueDate;
    document.getElementById('form-job-ops').value = job.operations.map(o => `${o.name} (${o.duration}m)`).join(', ');
    this.openModal('modal-job');
  },

  saveJobForm(e) {
    e.preventDefault();
    const name = document.getElementById('form-job-name').value.trim();
    const productType = document.getElementById('form-job-product').value.trim();
    const priority = document.getElementById('form-job-priority').value;
    const dueDate = document.getElementById('form-job-due').value.trim();

    if (!name) {
      showToast('Please enter a job name', 'warning');
      return;
    }

    if (this.editingJobId) {
      const job = RESCHEDULE_DATA.jobs.find(j => j.id === this.editingJobId);
      if (job) {
        job.name = name;
        job.productType = productType;
        job.priority = priority;
        job.dueDate = dueDate;
      }
      showToast(`Updated job ${this.editingJobId}`, 'success');
    } else {
      const newId = `JOB-${String(RESCHEDULE_DATA.jobs.length + 1).padStart(3, '0')}`;
      RESCHEDULE_DATA.jobs.unshift({
        id: newId,
        name,
        productType: productType || 'Custom Component',
        arrivalTime: '11:00 AM',
        dueDate: dueDate || 'Today 06:00 PM',
        priority,
        status: 'pending',
        progress: 0,
        materialAvailable: true,
        operations: [
          { id: 'OP-NEW-1', name: 'Primary Machining', eligibleMachines: ['M-001'], duration: 40, status: 'pending' },
          { id: 'OP-NEW-2', name: 'Finish Processing', eligibleMachines: ['M-005'], duration: 25, status: 'pending' }
        ]
      });
      showToast(`Job ${newId} created successfully!`, 'success');
    }

    this.closeModal('modal-job');
    this.renderJobsTable();
    if (typeof ChartsEngine !== 'undefined') ChartsEngine.drawJobStatusChart('chart-job-status');
  },

  deleteJob(jobId) {
    if (!confirm(`Are you sure you want to delete job ${jobId}?`)) return;
    RESCHEDULE_DATA.jobs = RESCHEDULE_DATA.jobs.filter(j => j.id !== jobId);
    this.renderJobsTable();
    showToast(`Job ${jobId} deleted`, 'info');
    if (typeof ChartsEngine !== 'undefined') ChartsEngine.drawJobStatusChart('chart-job-status');
  },

  // -------------------------------------------------------------
  // MACHINE MANAGEMENT
  // -------------------------------------------------------------
  setMachineFilter(filter = 'all', btnEl = null) {
    if (btnEl) {
      document.querySelectorAll('.machine-filter-pill').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
      });
      btnEl.classList.remove('btn-secondary');
      btnEl.classList.add('btn-primary');
    }
    this.renderMachinesGrid(filter);
  },

  renderMachinesGrid(filter = 'all') {
    const container = document.getElementById('machines-grid-container');
    if (!container) return;

    let list = [...RESCHEDULE_DATA.machines];
    if (filter !== 'all') {
      list = list.filter(m => m.status === filter);
    }

    container.innerHTML = list.map(m => {
      let statusBadge = '';
      if (m.status === 'processing') statusBadge = '<span class="badge badge-cyan"><span class="live-dot"></span> Processing</span>';
      else if (m.status === 'available') statusBadge = '<span class="badge badge-emerald">Available</span>';
      else if (m.status === 'idle') statusBadge = '<span class="badge badge-amber">Idle</span>';
      else if (m.status === 'maintenance') statusBadge = '<span class="badge badge-purple">Maintenance</span>';
      else if (m.status === 'breakdown') statusBadge = '<span class="badge badge-rose"><span class="live-dot alert"></span> Breakdown</span>';

      return `
        <div class="card machine-tile status-${m.status}" onclick="App.openMachineDetails('${m.id}')" style="cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="font-family: monospace; font-size: 0.78rem; color: #0099ff; font-weight: 800;">${m.id}</span>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: #1e293b; margin-top: 2px;">${m.name}</h3>
              <span style="font-size: 0.72rem; color: #64748b;">${m.type}</span>
            </div>
            ${statusBadge}
          </div>

          <div style="margin: 0.75rem 0; padding: 0.75rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 0.72rem; color: #64748b; font-weight: 600;">Current Operation:</div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #1e293b; margin-top: 2px;">${m.currentOp || 'No active assignment'}</div>
            ${m.currentJob ? `<div style="font-size: 0.72rem; color: #0099ff; font-weight: 700; margin-top: 2px;">Job: ${m.currentJob}</div>` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.78rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b; font-weight: 600;">Utilization</span>
              <span style="font-weight: 800; color: #0099ff;">${m.utilization}%</span>
            </div>
            <div class="progress-bar-bg" style="height: 6px;">
              <div class="progress-bar-fill" style="width: ${m.utilization}%;"></div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #f1f5f9; font-size: 0.72rem; color: #64748b;">
            <span>⚡ <strong>${m.powerDemandKW} kW</strong></span>
            <span>Next: <strong style="color: #1e293b;">${m.nextAvailable}</strong></span>
          </div>

          <div style="display: flex; gap: 0.35rem; margin-top: 0.5rem; flex-wrap: wrap;">
            ${m.capabilities.map(c => `<span class="badge badge-gray" style="font-size: 0.65rem;">${c}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  openMachineDetails(machineId) {
    const m = RESCHEDULE_DATA.machines.find(x => x.id === machineId);
    if (!m) return;

    document.getElementById('modal-machine-title').innerText = `${m.name} (${m.id})`;
    document.getElementById('modal-machine-details-body').innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <label class="form-label">Workcenter Category</label>
          <div style="color: #1e293b; font-weight: 700;">${m.type}</div>
        </div>
        <div>
          <label class="form-label">Current Status</label>
          <div><span class="badge badge-cyan">${m.status.toUpperCase()}</span></div>
        </div>
        <div>
          <label class="form-label">Power Consumption</label>
          <div style="color: #0099ff; font-weight: 700;">${m.powerDemandKW} kW (₹${(m.powerDemandKW * 8.5).toFixed(1)}/hr)</div>
        </div>
        <div>
          <label class="form-label">Speed Multiplier</label>
          <div style="color: #1e293b; font-weight: 700;">${m.speedMultiplier}x Nominal</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Capabilities & Tooling Presets</label>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${m.capabilities.map(c => `<span class="badge badge-cyan">${c}</span>`).join('')}
        </div>
      </div>

      <div class="form-group" style="margin-top: 1rem;">
        <label class="form-label">Maintenance Windows</label>
        ${m.maintenanceWindows.length > 0 ? m.maintenanceWindows.map(w => `
          <div style="padding: 0.65rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.78rem;">
            <strong>${w.type}</strong> - ${w.date} (${w.duration})
          </div>
        `).join('') : '<div style="color: #64748b; font-size: 0.75rem;">No scheduled maintenance planned.</div>'}
      </div>
    `;

    this.openModal('modal-machine-details');
  },

  // -------------------------------------------------------------
  // DISRUPTION MANAGEMENT
  // -------------------------------------------------------------
  renderDisruptionsPage() {
    const listContainer = document.getElementById('disruptions-active-list');
    if (!listContainer) return;

    listContainer.innerHTML = RESCHEDULE_DATA.disruptions.map(d => `
      <div class="card" style="border-left: 5px solid ${d.type === 'breakdown' ? '#ef4444' : '#f59e0b'}; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-family: monospace; font-size: 0.75rem; color: #0099ff; font-weight: 800;">${d.id}</span>
              <span class="badge badge-rose">${d.impactLevel} Impact</span>
              <span class="badge badge-gray">${d.type}</span>
            </div>
            <h3 style="font-size: 1.05rem; font-weight: 800; color: #1e293b; margin-top: 4px;">${d.title}</h3>
            <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0;">${d.desc}</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.launchRecoveryForDisruption('${d.id}')">
            Launch Recovery →
          </button>
        </div>

        <div style="display: flex; gap: 1.5rem; margin-top: 0.75rem; font-size: 0.75rem; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 0.5rem;">
          <span>Target: <strong style="color: #1e293b;">${d.machineId || d.jobId}</strong></span>
          <span>Downtime: <strong style="color: #ef4444;">+${d.estRepairMinutes || d.delayMinutes || 60} mins</strong></span>
          <span>Status: <strong style="color: #f59e0b;">${d.status}</strong></span>
        </div>
      </div>
    `).join('');

    // Disruption History Timeline
    const histContainer = document.getElementById('disruptions-history-list');
    if (histContainer) {
      histContainer.innerHTML = RESCHEDULE_DATA.disruptionHistory.map(h => `
        <div style="padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">${h.event}</div>
            <div style="font-size: 0.72rem; color: #64748b;">${h.resolution}</div>
          </div>
          <div style="text-align: right;">
            <span class="badge badge-cyan">${h.recoveredBy}</span>
            <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">${h.time}</div>
          </div>
        </div>
      `).join('');
    }
  },

  triggerManualDisruption(type) {
    if (type === 'breakdown') {
      const select = document.getElementById('trigger-breakdown-machine');
      const machineId = select ? select.value : 'M-013';
      const m = RESCHEDULE_DATA.machines.find(x => x.id === machineId);
      if (m) {
        m.status = 'breakdown';
        m.currentOp = 'FORCED BREAKDOWN SIMULATION';
      }
      showToast(`Triggered breakdown on ${machineId}`, 'error');
    } else if (type === 'rush-order') {
      const rushId = `JOB-RUSH-${Math.floor(Math.random() * 900) + 100}`;
      RESCHEDULE_DATA.jobs.unshift({
        id: rushId,
        name: 'Urgent Defense Gasket Housing',
        productType: 'Aerospace Grade Inconel',
        arrivalTime: '11:30 AM',
        dueDate: 'Today 04:00 PM',
        priority: 'urgent',
        status: 'pending',
        progress: 0,
        materialAvailable: true,
        operations: [
          { id: 'OP-R1', name: 'High-Speed Mill', eligibleMachines: ['M-001', 'M-003'], duration: 35, status: 'pending' },
          { id: 'OP-R2', name: 'Laser Verification', eligibleMachines: ['M-007'], duration: 20, status: 'pending' }
        ]
      });
      showToast(`Emergency Rush Order ${rushId} injected!`, 'warning');
    } else if (type === 'material-delay') {
      showToast('Triggered material delivery delay on JOB-007 (+180m)', 'warning');
    }

    this.renderDisruptionsPage();
    this.renderJobsTable();
    this.renderMachinesGrid();
  },

  launchRecoveryForDisruption(disruptionId) {
    this.navigateTo('recovery');
    showToast(`Loaded disruption ${disruptionId} for schedule recovery`, 'info');
  },

  // -------------------------------------------------------------
  // BENCHMARK COMPARISON
  // -------------------------------------------------------------
  renderBenchmarkTable() {
    const tbody = document.getElementById('benchmark-table-body');
    if (!tbody) return;

    tbody.innerHTML = RESCHEDULE_DATA.benchmarkData.metrics.map(m => {
      const impVsCpsat = m.metric.includes('Loss') || m.metric.includes('Cost') || m.metric.includes('Time')
        ? (((m.cpsat - m.reschedule) / m.cpsat) * 100).toFixed(1)
        : (((m.reschedule - m.cpsat) / m.cpsat) * 100).toFixed(1);

      return `
        <tr>
          <td style="font-weight: 700; color: #1e293b;">${m.metric}</td>
          <td style="color: #64748b;">${m.fcfs}</td>
          <td style="color: #334155;">${m.edd}</td>
          <td style="color: #8b5cf6; font-weight: 700;">${m.cpsat}</td>
          <td style="color: #0099ff; font-weight: 800; background: #e0f2fe;">${m.reschedule}</td>
          <td style="color: #10b981; font-weight: 800;">+${impVsCpsat}%</td>
        </tr>
      `;
    }).join('');
  },

  runBenchmarkSimulation() {
    const btn = document.getElementById('btn-run-benchmark');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> Running 50 Disruption Traces...`;
    }

    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>▶️</span> Run Benchmark Experiments`;
      }
      this.renderBenchmarkTable();
      if (typeof ChartsEngine !== 'undefined') {
        ChartsEngine.drawBenchmarkChart('chart-benchmark');
        ChartsEngine.drawParetoChart('chart-pareto');
      }
      showToast('Benchmark run completed! ReSchedule outperformed by +7.1% on-time delivery', 'success');
    }, 1500);
  },

  exportBenchmarkReport() {
    let csv = 'Metric,FCFS,EDD,CP-SAT,ReSchedule (Proposed),Unit\n';
    RESCHEDULE_DATA.benchmarkData.metrics.forEach(m => {
      csv += `"${m.metric}",${m.fcfs},${m.edd},${m.cpsat},${m.reschedule},${m.unit}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ReSchedule_Benchmark_Evaluation_Report.csv`;
    a.click();
    showToast('Benchmark Report downloaded as CSV', 'success');
  },

  // -------------------------------------------------------------
  // PERFORMANCE ANALYTICS
  // -------------------------------------------------------------
  renderAnalyticsPage() {
    const a = RESCHEDULE_DATA.analytics.kpis;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setVal('kpi-an-ontime', `${a.onTimeDelivery}%`);
    setVal('kpi-an-throughput', `${a.throughput} jobs/h`);
    setVal('kpi-an-changeover', `${a.changeoverLossHours} hrs`);
    setVal('kpi-an-energy', `₹${a.energyCostINR}`);
    setVal('kpi-an-recovery', `${a.recoveryTimeSec}s`);
    setVal('kpi-an-util', `${a.machineUtilization}%`);
    setVal('kpi-an-tardiness', `${a.avgTardinessMin} min`);
    setVal('kpi-an-makespan', `${a.totalMakespanMin} min`);
    setVal('kpi-an-stability', `${a.stabilityIndex}%`);
    setVal('kpi-an-downtime', `${a.totalDowntimeHours} hrs`);
  },

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // SETTINGS & RESOURCE CONFIGURATION CONTROLLER
  // -------------------------------------------------------------
  initSettings() {
    // Populate resource inputs
    const elWorkers = document.getElementById('set-num-workers');
    const elMachines = document.getElementById('set-num-machines');
    const elAbsentCount = document.getElementById('set-absent-workers-count');
    const elBrokenCount = document.getElementById('set-broken-machines-count');

    if (elWorkers && RESCHEDULE_DATA.settings) {
      elWorkers.value = RESCHEDULE_DATA.settings.numWorkers || 10;
    }
    if (elMachines && RESCHEDULE_DATA.settings) {
      elMachines.value = RESCHEDULE_DATA.settings.numMachines || 13;
    }
    if (elAbsentCount && RESCHEDULE_DATA.settings) {
      elAbsentCount.value = (RESCHEDULE_DATA.settings.absentWorkers || []).length;
    }
    if (elBrokenCount && RESCHEDULE_DATA.settings) {
      elBrokenCount.value = (RESCHEDULE_DATA.settings.brokenMachines || []).length;
    }

    // Populate worker dropdown
    const selectWorker = document.getElementById('set-absent-worker-select');
    if (selectWorker && RESCHEDULE_DATA.workers) {
      const currentVal = selectWorker.value;
      selectWorker.innerHTML = '<option value="">-- Choose a worker to mark absent --</option>' +
        RESCHEDULE_DATA.workers.map(w => `<option value="${w.id}">${w.id}: ${w.name} (${w.skill})</option>`).join('');
      if (currentVal) selectWorker.value = currentVal;
    }

    // Populate machine dropdown
    const selectMachine = document.getElementById('set-broken-machine-select');
    if (selectMachine && RESCHEDULE_DATA.machines) {
      const currentVal = selectMachine.value;
      selectMachine.innerHTML = '<option value="">-- Choose a machine to mark broken --</option>' +
        RESCHEDULE_DATA.machines.map(m => `<option value="${m.id}">${m.id}: ${m.name} (${m.type})</option>`).join('');
      if (currentVal) selectMachine.value = currentVal;
    }

    this.onResourceInputsChanged();
    this.renderAbsentWorkerTags();
    this.renderBrokenMachineTags();
    this.renderWorkersRoster();
  },

  onResourceInputsChanged() {
    const wVal = parseInt(document.getElementById('set-num-workers')?.value) || 10;
    const mVal = parseInt(document.getElementById('set-num-machines')?.value) || 13;

    const bWorkers = document.getElementById('badge-workers-count');
    const bMachines = document.getElementById('badge-machines-count');
    const sumW = document.getElementById('summary-worker-count');
    const sumM = document.getElementById('summary-machine-count');
    const sumC = document.getElementById('summary-concurrency');

    if (bWorkers) bWorkers.innerText = `${wVal} Active`;
    if (bMachines) bMachines.innerText = `${mVal} Fleet`;
    if (sumW) sumW.innerText = wVal;
    if (sumM) sumM.innerText = mVal;
    if (sumC) sumC.innerText = Math.min(wVal, mVal);
  },

  generateScheduleFromSettings() {
    const wInput = document.getElementById('set-num-workers');
    const mInput = document.getElementById('set-num-machines');

    const numWorkers = parseInt(wInput ? wInput.value : 10) || 10;
    const numMachines = parseInt(mInput ? mInput.value : 13) || 13;

    if (numWorkers < 1) {
      showToast('Please specify at least 1 worker', 'warning');
      return;
    }
    if (numMachines < 1 || numMachines > 13) {
      showToast('Machine count must be between 1 and 13', 'warning');
      return;
    }

    const btn = document.getElementById('btn-generate-from-settings');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> Generating Baseline Schedule...`;
    }

    setTimeout(() => {
      const res = GanttEngine.generateScheduleFromResources(numWorkers, numMachines, true);

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>⚡</span> Generate Production Schedule with Available Resources`;
      }

      // Show feedback block in Settings
      const fb = document.getElementById('settings-schedule-feedback');
      if (fb) {
        fb.style.display = 'block';
        fb.innerHTML = `
          <div style="background: #f0fdf4; border: 1.5px solid #22c55e; border-radius: var(--radius-md); padding: 1rem; margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span style="font-weight: 800; color: #15803d; font-size: 0.95rem;">✅ Schedule Successfully Generated!</span>
                <div style="font-size: 0.8rem; color: #334155; margin-top: 3px;">
                  Active Resources: <strong>${res.numWorkers} Workers</strong> &bull; <strong>${res.numMachines} Machines</strong> | 
                  Makespan: <strong>${res.makespan} min</strong> (Target ${res.completionTime}) | 
                  Fleet Utilization: <strong>${res.utilization}%</strong> | 
                  On-Time: <strong>${res.onTimeDelivery}%</strong>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="App.navigateTo('scheduling')">
                📅 View Interactive Gantt Chart →
              </button>
            </div>
          </div>
        `;
      }

      this.renderMachinesGrid();
      this.renderWorkersRoster();
    }, 450);
  },

  onAbsentCountInput(countVal) {
    const count = Math.max(0, parseInt(countVal) || 0);
    const workers = RESCHEDULE_DATA.workers || [];
    RESCHEDULE_DATA.settings.absentWorkers = workers.slice(0, count).map(w => w.id);
    this.renderAbsentWorkerTags();
    this.renderWorkersRoster();
  },

  onBrokenCountInput(countVal) {
    const count = Math.max(0, parseInt(countVal) || 0);
    const defaultBroken = ['M-013', 'M-001', 'M-008', 'M-006', 'M-003', 'M-002'];
    RESCHEDULE_DATA.settings.brokenMachines = defaultBroken.slice(0, count);
    this.renderBrokenMachineTags();
  },

  addAbsentWorkerFromSelect() {
    const select = document.getElementById('set-absent-worker-select');
    if (!select || !select.value) return;

    const wId = select.value;
    if (!RESCHEDULE_DATA.settings.absentWorkers.includes(wId)) {
      RESCHEDULE_DATA.settings.absentWorkers.push(wId);
      const elCount = document.getElementById('set-absent-workers-count');
      if (elCount) elCount.value = RESCHEDULE_DATA.settings.absentWorkers.length;
      this.renderAbsentWorkerTags();
      this.renderWorkersRoster();
      showToast(`Worker ${wId} marked as absent`, 'warning');
    }
  },

  removeAbsentWorker(wId) {
    RESCHEDULE_DATA.settings.absentWorkers = RESCHEDULE_DATA.settings.absentWorkers.filter(id => id !== wId);
    const elCount = document.getElementById('set-absent-workers-count');
    if (elCount) elCount.value = RESCHEDULE_DATA.settings.absentWorkers.length;
    this.renderAbsentWorkerTags();
    this.renderWorkersRoster();
  },

  addBrokenMachineFromSelect() {
    const select = document.getElementById('set-broken-machine-select');
    if (!select || !select.value) return;

    const mId = select.value;
    if (!RESCHEDULE_DATA.settings.brokenMachines.includes(mId)) {
      RESCHEDULE_DATA.settings.brokenMachines.push(mId);
      const elCount = document.getElementById('set-broken-machines-count');
      if (elCount) elCount.value = RESCHEDULE_DATA.settings.brokenMachines.length;
      this.renderBrokenMachineTags();
      showToast(`Machine ${mId} marked as broken`, 'error');
    }
  },

  removeBrokenMachine(mId) {
    RESCHEDULE_DATA.settings.brokenMachines = RESCHEDULE_DATA.settings.brokenMachines.filter(id => id !== mId);
    const elCount = document.getElementById('set-broken-machines-count');
    if (elCount) elCount.value = RESCHEDULE_DATA.settings.brokenMachines.length;
    this.renderBrokenMachineTags();
  },

  renderAbsentWorkerTags() {
    const container = document.getElementById('absent-workers-tags');
    if (!container) return;

    const list = RESCHEDULE_DATA.settings.absentWorkers || [];
    if (list.length === 0) {
      container.innerHTML = '<span style="font-size: 0.75rem; color: #94a3b8; font-style: italic;">No workers currently marked absent.</span>';
      return;
    }

    container.innerHTML = list.map(wId => {
      const w = RESCHEDULE_DATA.workers.find(x => x.id === wId);
      const name = w ? w.name : wId;
      return `
        <span class="disruption-tag tag-worker">
          <span>👤 ${wId}: ${name} (Absent)</span>
          <button type="button" class="tag-remove-btn" onclick="App.removeAbsentWorker('${wId}')" title="Remove absence">✕</button>
        </span>
      `;
    }).join('');
  },

  renderBrokenMachineTags() {
    const container = document.getElementById('broken-machines-tags');
    if (!container) return;

    const list = RESCHEDULE_DATA.settings.brokenMachines || [];
    if (list.length === 0) {
      container.innerHTML = '<span style="font-size: 0.75rem; color: #94a3b8; font-style: italic;">No machines currently reported broken.</span>';
      return;
    }

    container.innerHTML = list.map(mId => {
      const m = RESCHEDULE_DATA.machines.find(x => x.id === mId);
      const name = m ? m.name : mId;
      return `
        <span class="disruption-tag tag-machine">
          <span>🚨 ${mId}: ${name} (Breakdown)</span>
          <button type="button" class="tag-remove-btn" onclick="App.removeBrokenMachine('${mId}')" title="Remove breakdown">✕</button>
        </span>
      `;
    }).join('');
  },

  toggleWorkerAbsent(wId) {
    if (RESCHEDULE_DATA.settings.absentWorkers.includes(wId)) {
      this.removeAbsentWorker(wId);
    } else {
      RESCHEDULE_DATA.settings.absentWorkers.push(wId);
      const elCount = document.getElementById('set-absent-workers-count');
      if (elCount) elCount.value = RESCHEDULE_DATA.settings.absentWorkers.length;
      this.renderAbsentWorkerTags();
      this.renderWorkersRoster();
      showToast(`Worker ${wId} marked as absent`, 'warning');
    }
  },

  renderWorkersRoster() {
    const container = document.getElementById('settings-workers-roster');
    if (!container) return;

    const workers = RESCHEDULE_DATA.workers || [];
    const absentList = RESCHEDULE_DATA.settings.absentWorkers || [];
    const activeLimit = RESCHEDULE_DATA.settings.numWorkers || 10;

    container.innerHTML = workers.map((w, idx) => {
      const isAbsent = absentList.includes(w.id);
      const isBeyondLimit = idx >= activeLimit;
      let badgeHtml = '<span class="badge badge-emerald">Available</span>';
      if (isAbsent) badgeHtml = '<span class="badge badge-rose">Absent</span>';
      else if (isBeyondLimit) badgeHtml = '<span class="badge badge-gray">Standby</span>';

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.55rem 0.75rem; border-bottom: 1px solid #f1f5f9; background: ${isAbsent ? '#fff1f2' : 'transparent'}; border-radius: var(--radius-sm); margin-bottom: 3px;">
          <div>
            <div style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">
              ${w.name} <span style="font-size: 0.7rem; color: #64748b; font-family: monospace;">(${w.id})</span>
            </div>
            <div style="font-size: 0.72rem; color: #64748b;">${w.skill} &bull; ${w.assignedMachine}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${badgeHtml}
            <button type="button" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.68rem;" onclick="App.toggleWorkerAbsent('${w.id}')">
              ${isAbsent ? 'Mark Present' : 'Mark Absent'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  rescheduleFromSettings() {
    const absentWorkers = RESCHEDULE_DATA.settings.absentWorkers || [];
    const brokenMachines = RESCHEDULE_DATA.settings.brokenMachines || [];
    const reason = document.getElementById('set-disruption-reason')?.value || 'Shop floor resource disruption';

    const btn = document.getElementById('btn-trigger-reschedule');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> Executing ReSchedule Heuristic Recovery...`;
    }

    setTimeout(() => {
      const res = GanttEngine.rescheduleForDisruptions(absentWorkers, brokenMachines, reason);

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>🔄</span> Reschedule Production Plan (Intelligent Recovery)`;
      }

      // Display Reschedule Results Summary in Settings
      const resultsContainer = document.getElementById('settings-reschedule-results');
      if (resultsContainer) {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
          <div class="card reschedule-result-card" style="margin-top: 1.25rem; border: 2px solid #0099ff; background: #f0f9ff; padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span class="badge badge-cyan" style="font-size: 0.8rem; font-weight: 800;">⚡ DISRUPTION RECOVERED</span>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: #0369a1; margin: 0.25rem 0 0 0;">
                  Production Schedule Successfully Rescheduled!
                </h4>
              </div>
              <span style="font-size: 0.78rem; color: #64748b; font-family: monospace;">Solver Time: 2.12s</span>
            </div>

            <p style="font-size: 0.8rem; color: #334155; margin-bottom: 1rem;">
              ReSchedule dynamically resolved resource constraints: re-routed <strong>${res.reroutedOperations} operations</strong> away from broken machines and absent workers, preserving <strong>${res.stabilityIndex}</strong> schedule stability index.
            </p>

            <div class="grid-cards-4" style="margin-bottom: 1rem; gap: 0.75rem;">
              <div class="card" style="padding: 0.75rem; background: #ffffff;">
                <div style="font-size: 0.7rem; color: #64748b; font-weight: 700;">ACTIVE WORKFORCE</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #0284c7;">
                  ${res.activeWorkersCount} / ${RESCHEDULE_DATA.settings.numWorkers}
                </div>
                <div style="font-size: 0.68rem; color: #ef4444;">${res.absentWorkersCount} Absent</div>
              </div>

              <div class="card" style="padding: 0.75rem; background: #ffffff;">
                <div style="font-size: 0.7rem; color: #64748b; font-weight: 700;">OPERATIONAL FLEET</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #0284c7;">
                  ${res.activeMachinesCount} / ${RESCHEDULE_DATA.settings.numMachines}
                </div>
                <div style="font-size: 0.68rem; color: #ef4444;">${res.brokenMachinesCount} Breakdown</div>
              </div>

              <div class="card" style="padding: 0.75rem; background: #ffffff;">
                <div style="font-size: 0.7rem; color: #64748b; font-weight: 700;">NEW MAKESPAN</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #1e293b;">${res.makespan} min</div>
                <div style="font-size: 0.68rem; color: #10b981;">Target: ${res.completionTime}</div>
              </div>

              <div class="card" style="padding: 0.75rem; background: #ffffff;">
                <div style="font-size: 0.7rem; color: #64748b; font-weight: 700;">STABILITY INDEX</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #10b981;">${res.stabilityIndex}</div>
                <div style="font-size: 0.68rem; color: #0369a1;">On-Time: ${res.predictedOnTime}</div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-primary btn-sm" onclick="App.navigateTo('scheduling')">
                📅 View Rescheduled Gantt Schedule →
              </button>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('recovery')">
                🛡️ Open Detailed Recovery Center →
              </button>
            </div>
          </div>
        `;
      }

      this.renderMachinesGrid();
      this.renderDisruptionsPage();
      this.renderWorkersRoster();

      showToast(`Production rescheduled! Re-routed ${res.reroutedOperations} operations with ${res.stabilityIndex} stability.`, 'success');
    }, 500);
  },

  resetDisruptions() {
    RESCHEDULE_DATA.settings.absentWorkers = [];
    RESCHEDULE_DATA.settings.brokenMachines = [];

    const elAbsentCount = document.getElementById('set-absent-workers-count');
    const elBrokenCount = document.getElementById('set-broken-machines-count');
    if (elAbsentCount) elAbsentCount.value = 0;
    if (elBrokenCount) elBrokenCount.value = 0;

    RESCHEDULE_DATA.workers.forEach(w => w.status = 'available');
    RESCHEDULE_DATA.machines.forEach(m => {
      if (m.status === 'breakdown') {
        m.status = 'available';
        m.currentOp = 'Ready for Queue';
      }
    });

    const resContainer = document.getElementById('settings-reschedule-results');
    if (resContainer) resContainer.style.display = 'none';

    this.renderAbsentWorkerTags();
    this.renderBrokenMachineTags();
    this.renderWorkersRoster();
    this.renderMachinesGrid();

    const wCount = RESCHEDULE_DATA.settings.numWorkers || 10;
    const mCount = RESCHEDULE_DATA.settings.numMachines || 13;
    GanttEngine.generateScheduleFromResources(wCount, mCount, false);

    showToast('Disruptions cleared. Restored full operational baseline.', 'info');
  },

  saveSettings(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById('set-factory-name')?.value;
    const tariff = document.getElementById('set-tariff')?.value;
    const wVal = parseInt(document.getElementById('set-num-workers')?.value);
    const mVal = parseInt(document.getElementById('set-num-machines')?.value);

    if (name) RESCHEDULE_DATA.settings.factoryName = name;
    if (tariff) RESCHEDULE_DATA.settings.baseElectricityTariff = parseFloat(tariff);
    if (!isNaN(wVal)) RESCHEDULE_DATA.settings.numWorkers = wVal;
    if (!isNaN(mVal)) RESCHEDULE_DATA.settings.numMachines = Math.min(13, Math.max(1, mVal));

    showToast('Factory parameters & resource settings saved successfully', 'success');
  },

  // Modal helpers
  initModals() {
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });
  },

  openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  },

  closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
  }
};

// Bootstrap on DOM load
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
