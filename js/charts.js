/**
 * ReSchedule - Native Canvas Charting Engine
 * High-performance, retina-crisp rendering styled for Borcelle Modern SaaS Palette
 * White card background, soft slate gridlines, vibrant cyan-blue highlights
 */

const ChartsEngine = {
  // Utility to handle HiDPI displays
  setupCanvas(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Normalize coordinate system to use CSS pixels
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
  },

  // 1. Production Completion Bar Chart (Grouped Bars)
  drawProductionChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const data = [
      { day: 'Mon', planned: 15, completed: 14 },
      { day: 'Tue', planned: 16, completed: 16 },
      { day: 'Wed', planned: 14, completed: 11 },
      { day: 'Thu', planned: 17, completed: 17 },
      { day: 'Fri', planned: 15, completed: 13 },
      { day: 'Sat', planned: 10, completed: 9 }
    ];

    const padding = { top: 25, right: 20, bottom: 35, left: 35 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxVal = 20;

    // Background grid (soft slate)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis label
      ctx.fillStyle = '#64748b';
      ctx.font = '600 10px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padding.left - 8, y + 3);
    }

    const groupWidth = chartWidth / data.length;
    const barWidth = Math.min(16, groupWidth * 0.32);

    data.forEach((d, idx) => {
      const groupX = padding.left + idx * groupWidth;
      const xPlanned = groupX + groupWidth / 2 - barWidth - 2;
      const xCompleted = groupX + groupWidth / 2 + 2;

      const hPlanned = (d.planned / maxVal) * chartHeight;
      const hCompleted = (d.completed / maxVal) * chartHeight;

      // Planned Bar (Soft light slate)
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.roundRect(xPlanned, padding.top + chartHeight - hPlanned, barWidth, hPlanned, [4, 4, 0, 0]);
      ctx.fill();

      // Completed Bar (Vibrant Blue from reference image)
      ctx.fillStyle = '#0099ff';
      ctx.beginPath();
      ctx.roundRect(xCompleted, padding.top + chartHeight - hCompleted, barWidth, hCompleted, [4, 4, 0, 0]);
      ctx.fill();

      // Day Label
      ctx.fillStyle = '#475569';
      ctx.font = '600 11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.day, groupX + groupWidth / 2, height - 10);
    });
  },

  // 2. Machine Utilization Horizontal Bars
  drawUtilizationChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const data = RESCHEDULE_DATA.machines.slice(0, 7);
    const padding = { top: 15, right: 45, bottom: 20, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const rowHeight = (height - padding.top - padding.bottom) / data.length;

    data.forEach((m, idx) => {
      const y = padding.top + idx * rowHeight;
      const barH = Math.min(14, rowHeight * 0.6);
      const barY = y + (rowHeight - barH) / 2;

      // Machine Label
      ctx.fillStyle = '#1e293b';
      ctx.font = '700 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(m.id, padding.left - 10, barY + barH - 2);

      // Track bg
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(padding.left, barY, chartWidth, barH, 4);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Fill bar (Vibrant blue/cyan)
      const fillW = (m.utilization / 100) * chartWidth;
      let barColor = '#00a8f4';
      if (m.utilization > 85) barColor = '#0099ff';
      if (m.status === 'breakdown') barColor = '#ef4444';
      if (m.status === 'maintenance') barColor = '#8b5cf6';

      ctx.fillStyle = barColor;
      ctx.beginPath();
      ctx.roundRect(padding.left, barY, fillW, barH, 4);
      ctx.fill();

      // Value label
      ctx.fillStyle = '#475569';
      ctx.font = '700 10px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${m.utilization}%`, padding.left + chartWidth + 8, barY + barH - 2);
    });
  },

  // 3. Job Status Donut Chart
  drawJobStatusChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const counts = {
      'In Progress': RESCHEDULE_DATA.jobs.filter(j => j.status === 'in-progress').length,
      'Completed': RESCHEDULE_DATA.jobs.filter(j => j.status === 'completed').length,
      'Pending': RESCHEDULE_DATA.jobs.filter(j => j.status === 'pending').length,
      'Delayed': RESCHEDULE_DATA.jobs.filter(j => j.status === 'delayed').length
    };

    const colors = {
      'In Progress': '#0099ff',
      'Completed': '#10b981',
      'Pending': '#f59e0b',
      'Delayed': '#ef4444'
    };

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const centerX = width * 0.42;
    const centerY = height * 0.5;
    const radius = Math.min(centerX, centerY) * 0.75;
    const innerRadius = radius * 0.62;

    let startAngle = -Math.PI / 2;

    Object.entries(counts).forEach(([status, val]) => {
      if (val === 0) return;
      const sliceAngle = (val / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[status];
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Center hole text
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 20px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(total, centerX, centerY + 4);
    ctx.fillStyle = '#64748b';
    ctx.font = '700 9px -apple-system, sans-serif';
    ctx.fillText('TOTAL ORDERS', centerX, centerY + 18);

    // Legend on the right side
    const legendX = width * 0.72;
    let legendY = height * 0.22;
    Object.entries(counts).forEach(([status, val]) => {
      ctx.fillStyle = colors[status];
      ctx.beginPath();
      ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#334155';
      ctx.font = '600 11px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${status} (${val})`, legendX + 12, legendY + 4);
      legendY += 26;
    });
  },

  // 4. Energy Consumption Area Chart with Gradient
  drawEnergyChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const data = RESCHEDULE_DATA.analytics.hourlyEnergy;
    const padding = { top: 20, right: 20, bottom: 35, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxKW = 150;

    // Background Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (chartHeight / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '600 10px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(maxKW - (maxKW / 3) * i)} kW`, padding.left - 6, y + 3);
    }

    const stepX = chartWidth / (data.length - 1);

    // Area Gradient Fill (vibrant blue fading to white)
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    grad.addColorStop(0, 'rgba(0, 153, 255, 0.28)');
    grad.addColorStop(1, 'rgba(0, 153, 255, 0.0)');

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    data.forEach((d, idx) => {
      const x = padding.left + idx * stepX;
      const y = padding.top + chartHeight - (d.kw / maxKW) * chartHeight;
      if (idx === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line Path
    ctx.beginPath();
    data.forEach((d, idx) => {
      const x = padding.left + idx * stepX;
      const y = padding.top + chartHeight - (d.kw / maxKW) * chartHeight;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#0099ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Data dots & X labels
    data.forEach((d, idx) => {
      const x = padding.left + idx * stepX;
      const y = padding.top + chartHeight - (d.kw / maxKW) * chartHeight;

      ctx.fillStyle = '#0099ff';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();

      // X-axis label
      if (idx % 2 === 0 || idx === data.length - 1) {
        ctx.fillStyle = '#64748b';
        ctx.font = '600 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.hour, x, height - 10);
      }
    });
  },

  // 5. Benchmark Grouped Bar Chart
  drawBenchmarkChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const algorithms = [
      { key: 'fcfs', label: 'FCFS', color: '#94a3b8' },
      { key: 'edd', label: 'EDD', color: '#f59e0b' },
      { key: 'cpsat', label: 'CP-SAT', color: '#8b5cf6' },
      { key: 'reschedule', label: 'ReSchedule', color: '#0099ff' }
    ];

    const metrics = [
      { name: 'On-Time %', max: 100, values: { fcfs: 64.2, edd: 76.8, cpsat: 88.5, reschedule: 94.8 } },
      { name: 'Stability %', max: 100, values: { fcfs: 42.0, edd: 54.0, cpsat: 68.0, reschedule: 91.5 } },
      { name: 'Throughput', max: 6, values: { fcfs: 3.1, edd: 3.6, cpsat: 4.1, reschedule: 4.6 } }
    ];

    const padding = { top: 35, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (chartHeight / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    const groupWidth = chartWidth / metrics.length;
    const barWidth = 14;

    metrics.forEach((m, mIdx) => {
      const groupX = padding.left + mIdx * groupWidth;
      const startX = groupX + (groupWidth - (algorithms.length * barWidth + (algorithms.length - 1) * 4)) / 2;

      algorithms.forEach((algo, aIdx) => {
        const x = startX + aIdx * (barWidth + 4);
        const val = m.values[algo.key];
        const barH = (val / m.max) * chartHeight;
        const y = padding.top + chartHeight - barH;

        ctx.fillStyle = algo.color;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Value text
        ctx.fillStyle = '#64748b';
        ctx.font = '600 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barWidth / 2, y - 4);
      });

      // Metric Title
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.name, groupX + groupWidth / 2, height - 12);
    });

    // Legend on top
    let legX = padding.left + 10;
    algorithms.forEach(algo => {
      ctx.fillStyle = algo.color;
      ctx.fillRect(legX, 10, 10, 10);
      ctx.fillStyle = '#334155';
      ctx.font = '600 10px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(algo.label, legX + 14, 19);
      legX += 85;
    });
  },

  // 6. Pareto Frontier Multi-Objective Scatter Plot
  drawParetoChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const points = RESCHEDULE_DATA.benchmarkData.paretoPoints;
    const padding = { top: 25, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const minEnergy = 800, maxEnergy = 1600;
    const minOnTime = 50, maxOnTime = 100;

    const getX = energy => padding.left + ((energy - minEnergy) / (maxEnergy - minEnergy)) * chartWidth;
    const getY = onTime => padding.top + chartHeight - ((onTime - minOnTime) / (maxOnTime - minOnTime)) * chartHeight;

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '600 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(maxOnTime - (50 / 4) * i)}%`, padding.left - 6, y + 4);
    }

    // Connect Pareto points curve
    const sorted = [...points].sort((a, b) => a.energyCost - b.energyCost);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    sorted.forEach((pt, idx) => {
      const x = getX(pt.energyCost);
      const y = getY(pt.onTime);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Points
    points.forEach(pt => {
      const x = getX(pt.energyCost);
      const y = getY(pt.onTime);

      const isReSchedule = pt.name.includes('ReSchedule');
      const pointColor = isReSchedule ? '#0099ff' : pt.color;

      ctx.fillStyle = pointColor;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring for ReSchedule
      if (isReSchedule) {
        ctx.strokeStyle = '#0099ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 11px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(pt.name, x + 12, y - 4);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 10px monospace';
      ctx.fillText(`OT: ${pt.onTime}% | ₹${pt.energyCost}`, x + 12, y + 10);
    });

    // Axis titles
    ctx.fillStyle = '#475569';
    ctx.font = '600 11px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Energy Consumption Cost (₹) → Lower is Better', width / 2, height - 10);
  },

  // Refresh all charts visible on screen
  renderAll() {
    this.drawProductionChart('chart-production');
    this.drawUtilizationChart('chart-utilization');
    this.drawJobStatusChart('chart-job-status');
    this.drawEnergyChart('chart-energy');
    this.drawBenchmarkChart('chart-benchmark');
    this.drawParetoChart('chart-pareto');
  }
};

window.addEventListener('resize', () => {
  ChartsEngine.renderAll();
});
