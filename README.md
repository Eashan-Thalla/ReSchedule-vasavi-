# ReSchedule | Intelligent Manufacturing Recovery System
### Disruption-Recovery Production Scheduling for MSME Job Shops

**Team:** Quantum Leapers  
**Team Members:** Yagna Valkya, Amrutha, Eashan, Konda  
**Institution:** Gokaraju Lailavathi Engineering College  
**Theme:** Smart Automation  

---

## 🚀 Overview

**ReSchedule** is an industrial-grade SaaS production scheduling and disruption recovery web application designed specifically for Micro, Small, and Medium Enterprises (MSME) job shops. It tackles unexpected shop-floor disruptions—such as machine breakdowns, sudden rush orders, and material delivery delays—by delivering intelligent real-time rescheduling that preserves schedule stability while minimizing makespan, changeover losses, and energy costs.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, Modern CSS3 (Dark Navy & Cyan industrial theme, responsive, smooth micro-interactions), Vanilla JavaScript (Modular ES6 architecture)
- **Visualizations:** Native Canvas Charting Engine (Donut, Grouped Bars, Area Energy Curve, Pareto Frontier scatter plot) and custom interactive Gantt timeline engine
- **Java Backend Server:** `ReScheduleServer.java` (Zero-dependency standard Java HTTP Server with REST API endpoints)
- **Python Backend Reference:** `backend_api.py` (FastAPI REST service ready for OR-Tools integration)

---

## 💻 How to Run

### Option 1: Direct Browser Launch (Easiest & Instant)
No software, compilers, or build tools needed!
1. Navigate to the `Rescheduler` folder.
2. Double-click **`index.html`** or right-click and open with **Google Chrome**, **Microsoft Edge**, or **Firefox**.
3. All 10 pages, charts, Gantt timelines, discrete-event simulation, and recovery animations work 100% out of the box!

### Option 2: Run with Java Server
If you have Java installed (Java 8, 11, 17, 21+):
```bash
# In the Rescheduler directory:
java ReScheduleServer.java
```
Or compile and run:
```bash
javac ReScheduleServer.java
java ReScheduleServer
```
Open **`http://localhost:8080`** in your browser.

### Option 3: Run with Python FastAPI
```bash
pip install fastapi uvicorn
uvicorn backend_api:app --reload --port 8000
```

---

## 🌟 10 Main Navigation Modules

1. **Dashboard:**
   - 8 manufacturing KPI cards: Total Jobs, Completed, Pending, Delayed, Available Machines, Machines Under Breakdown, On-Time Delivery %, Fleet Utilization %.
   - 4 live visualizations: Production Completion, Fleet Utilization, Job Status donut, and Hourly Energy Demand.
   - Live activity feed & active disruption alert banner.
   - Full 13-machine fleet telemetry table.

2. **Job Management:**
   - Full CRUD: Add, edit, and delete production jobs with modal form.
   - Live search, priority filter (Urgent, High, Medium, Low), status filter, and multi-field sorting.
   - Operation sequence tracker with progress indicators.

3. **Machine Fleet Management:**
   - 13 factory machines (CNC mills, radial drills, surface finishers, lathes, laser cutters, EDM, welders).
   - Real-time workcenter status (Available, Processing, Idle, Maintenance, Breakdown).
   - Workcenter detail modal with historical maintenance and capabilities.

4. **Production Scheduling (Gantt Chart):**
   - Interactive multi-machine timeline (M-001 to M-013).
   - Operation blocks color-coded by job ID.
   - Distinct hatched rendering for tool changeovers, machine breakdowns, and maintenance.
   - 4-Algorithm comparison: **FCFS**, **EDD**, **CP-SAT**, and **ReSchedule**.
   - Zoom controls (4h, 8h, Full shift) and CSV export.

5. **Simulation Center:**
   - Discrete-event simulation clock (08:00 AM start, minute ticks).
   - Controls: Start, Pause, Resume, Reset, and Speed (1x, 2x, 5x, 10x).
   - Animated visual factory floor that dynamically updates machine states as simulation progresses.
   - Live event queue and real-time timestamped event log.

6. **Disruption Management:**
   - 4 manual disruption triggers:
     - Machine Breakdown (with failure variance)
     - Urgent Rush Order injection
     - Late Material Arrival
     - Scheduled Maintenance
   - Active disruptions impact tracker and history timeline.

7. **Schedule Recovery (Flagship Innovation):**
   - Disruption impact analysis (affected jobs vs preserved unaffected jobs).
   - **"REPAIR PRODUCTION SCHEDULE"** action button.
   - Animated 8-step recovery protocol demonstration.
   - Side-by-side **Before-and-After Gantt Charts** displaying re-routed jobs and isolated workcenters.
   - Quantitative recovery KPIs: 2.34s recovery time, 91.5% schedule stability index, and recovered on-time delivery.

8. **Performance Analytics:**
   - 10 key manufacturing performance metrics (On-time delivery, throughput, changeover loss, energy cost, recovery time, machine utilization, average tardiness, makespan, stability, downtime).
   - Trend charts and filters.

9. **Benchmark Comparison:**
   - Side-by-side evaluation of FCFS, EDD, CP-SAT, and ReSchedule.
   - Multi-metric grouped bar charts and percentage improvement matrix.
   - **Pareto Frontier multi-objective trade-off plot** (On-Time Delivery vs Energy Cost vs Changeover Loss).
   - Benchmark simulation runner and CSV report export.

10. **System Settings:**
    - Factory operating hours and shift parameters.
    - Electricity tariff models (base and peak rates).
    - Recovery time budget configuration and Team Quantum Leapers attribution.

---

## 👥 Authors & Credits

**Team Quantum Leapers**  
- **Yagna Valkya**  
- **Amrutha**  
- **Eashan**  
- **Konda**  

**Institution:** Gokaraju Lailavathi Engineering College  
**Theme:** Smart Automation  
**Project:** ReSchedule | Intelligent Manufacturing Production Scheduling & Recovery System

