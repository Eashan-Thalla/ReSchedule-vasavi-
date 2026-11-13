/**
 * ReSchedule - Manufacturing Domain Data Model & Mock State
 * Team: Quantum Leapers | GNLEC
 */

const RESCHEDULE_DATA = {
  // 10 Factory Floor Human Operators / Workforce Roster
  workers: [
    { id: 'W-001', name: 'Rajesh Sharma', skill: '5-Axis CNC Milling', status: 'available', assignedMachine: 'M-001', experienceYrs: 8 },
    { id: 'W-002', name: 'Priya Patel', skill: 'Precision Drilling & Boring', status: 'available', assignedMachine: 'M-002', experienceYrs: 5 },
    { id: 'W-003', name: 'Amit Verma', skill: 'CNC Lathe & Turning', status: 'available', assignedMachine: 'M-006', experienceYrs: 7 },
    { id: 'W-004', name: 'Sunita Rao', skill: 'Laser Cutting & Press Brake', status: 'available', assignedMachine: 'M-010', experienceYrs: 6 },
    { id: 'W-005', name: 'Vikram Singh', skill: 'Robotic MIG/TIG Welding', status: 'available', assignedMachine: 'M-012', experienceYrs: 9 },
    { id: 'W-006', name: 'Deepa Nair', skill: 'Surface Finishing & Polish', status: 'available', assignedMachine: 'M-005', experienceYrs: 4 },
    { id: 'W-007', name: 'Karthik Iyer', skill: 'CMM Quality Inspection', status: 'available', assignedMachine: 'M-007', experienceYrs: 11 },
    { id: 'W-008', name: 'Manoj Kumar', skill: 'Vacuum Heat Treatment', status: 'available', assignedMachine: 'M-009', experienceYrs: 10 },
    { id: 'W-009', name: 'Sneha Reddy', skill: 'Wire EDM Machining', status: 'available', assignedMachine: 'M-013', experienceYrs: 6 },
    { id: 'W-010', name: 'Arjun Das', skill: 'CNC Vertical Milling', status: 'available', assignedMachine: 'M-003', experienceYrs: 5 }
  ],

  // 13 Factory Floor Work Centers / Machines
  machines: [
    {
      id: 'M-001',
      name: 'CNC 5-Axis Mill Alpha',
      type: 'CNC Milling',
      status: 'processing',
      currentJob: 'JOB-001',
      currentOp: 'OP-01 (Rough Milling)',
      capabilities: ['Milling', 'Contouring', 'Boring'],
      speedMultiplier: 1.2,
      powerDemandKW: 14.5,
      utilization: 88,
      nextAvailable: '11:45 AM',
      maintenanceWindows: [{ id: 'MW-1', date: '2026-11-12', type: 'Preventive Spindle Check', duration: '2h' }]
    },
    {
      id: 'M-002',
      name: 'High-Precision Drill Beta',
      type: 'CNC Drilling',
      status: 'available',
      currentJob: null,
      currentOp: 'Ready for Queue',
      capabilities: ['Drilling', 'Tapping', 'Reaming'],
      speedMultiplier: 1.0,
      powerDemandKW: 8.5,
      utilization: 64,
      nextAvailable: 'Immediate',
      maintenanceWindows: []
    },
    {
      id: 'M-003',
      name: 'CNC Vertical Mill Gamma',
      type: 'CNC Milling',
      status: 'processing',
      currentJob: 'JOB-002',
      currentOp: 'OP-02 (Pocketing)',
      capabilities: ['Milling', 'Facing', 'Threading'],
      speedMultiplier: 1.1,
      powerDemandKW: 12.0,
      utilization: 91,
      nextAvailable: '12:30 PM',
      maintenanceWindows: []
    },
    {
      id: 'M-004',
      name: 'Heavy Duty Radial Drill',
      type: 'CNC Drilling',
      status: 'idle',
      currentJob: null,
      currentOp: 'Standby',
      capabilities: ['Drilling', 'Countersinking'],
      speedMultiplier: 0.9,
      powerDemandKW: 7.2,
      utilization: 42,
      nextAvailable: 'Immediate',
      maintenanceWindows: []
    },
    {
      id: 'M-005',
      name: 'Surface Finisher Epsilon',
      type: 'Surface Finishing',
      status: 'processing',
      currentJob: 'JOB-004',
      currentOp: 'OP-03 (Micro-Polishing)',
      capabilities: ['Polishing', 'Deburring', 'Lapping'],
      speedMultiplier: 1.0,
      powerDemandKW: 6.5,
      utilization: 75,
      nextAvailable: '11:15 AM',
      maintenanceWindows: []
    },
    {
      id: 'M-006',
      name: 'CNC Turning Lathe Zeta',
      type: 'Lathe Turning',
      status: 'available',
      currentJob: null,
      currentOp: 'Ready',
      capabilities: ['Turning', 'Facing', 'Grooving', 'Threading'],
      speedMultiplier: 1.15,
      powerDemandKW: 11.0,
      utilization: 78,
      nextAvailable: 'Immediate',
      maintenanceWindows: []
    },
    {
      id: 'M-007',
      name: 'CMM Quality Inspection Station',
      type: 'Quality Inspection',
      status: 'processing',
      currentJob: 'JOB-008',
      currentOp: 'OP-03 (Coordinate Metrology)',
      capabilities: ['3D Inspection', 'Surface Roughness', 'Tolerance Metrology'],
      speedMultiplier: 1.0,
      powerDemandKW: 3.5,
      utilization: 58,
      nextAvailable: '11:30 AM',
      maintenanceWindows: []
    },
    {
      id: 'M-008',
      name: 'Cylindrical Grinder Theta',
      type: 'Grinding',
      status: 'maintenance',
      currentJob: null,
      currentOp: 'Wheel Truing & Calibration',
      capabilities: ['Cylindrical Grinding', 'Internal Grinding'],
      speedMultiplier: 0.85,
      powerDemandKW: 9.0,
      utilization: 32,
      nextAvailable: '02:00 PM',
      maintenanceWindows: [{ id: 'MW-2', date: 'Today', type: 'Preventive Wheel Recalibration', duration: '3.5h' }]
    },
    {
      id: 'M-009',
      name: 'Vacuum Heat Treatment Furnace',
      type: 'Heat Treatment',
      status: 'available',
      currentJob: null,
      currentOp: 'Temperature Purge',
      capabilities: ['Hardening', 'Tempering', 'Stress Relief'],
      speedMultiplier: 1.0,
      powerDemandKW: 26.0,
      utilization: 45,
      nextAvailable: 'Immediate',
      maintenanceWindows: []
    },
    {
      id: 'M-010',
      name: 'Fiber Laser Cutter 6kW',
      type: 'Laser Cutting',
      status: 'processing',
      currentJob: 'JOB-006',
      currentOp: 'OP-01 (Profile Cutting)',
      capabilities: ['Laser Cutting', 'Nesting', 'Sheet Beveling'],
      speedMultiplier: 1.3,
      powerDemandKW: 19.5,
      utilization: 84,
      nextAvailable: '11:20 AM',
      maintenanceWindows: []
    },
    {
      id: 'M-011',
      name: 'CNC Press Brake 150T',
      type: 'Sheet Bending',
      status: 'idle',
      currentJob: null,
      currentOp: 'Standby for Cut Stock',
      capabilities: ['Air Bending', 'Bottoming', 'Coining'],
      speedMultiplier: 1.0,
      powerDemandKW: 10.5,
      utilization: 49,
      nextAvailable: 'Immediate',
      maintenanceWindows: []
    },
    {
      id: 'M-012',
      name: 'Robotic MIG/TIG Welding Cell',
      type: 'Welding',
      status: 'processing',
      currentJob: 'JOB-004',
      currentOp: 'OP-02 (Seam Welding)',
      capabilities: ['MIG Welding', 'TIG Welding', 'Spot Welding'],
      speedMultiplier: 1.25,
      powerDemandKW: 16.0,
      utilization: 79,
      nextAvailable: '12:00 PM',
      maintenanceWindows: []
    },
    {
      id: 'M-013',
      name: 'Wire Electrical Discharge (EDM)',
      type: 'EDM Machining',
      status: 'breakdown',
      currentJob: 'JOB-007',
      currentOp: 'Stalled: High-voltage Spindle Failure',
      capabilities: ['Precision Wire EDM', 'Sinker EDM'],
      speedMultiplier: 0.75,
      powerDemandKW: 8.5,
      utilization: 15,
      nextAvailable: 'Est. 03:30 PM (Disrupted)',
      maintenanceWindows: [{ id: 'MW-3', date: 'Today', type: 'Emergency Corrective Repair', duration: '4h' }]
    }
  ],

  // 10 Detailed Production Jobs
  jobs: [
    {
      id: 'JOB-001',
      name: 'Automotive Subframe Bracket',
      productType: 'High-Tensile Steel Bracket',
      arrivalTime: '08:00 AM',
      dueDate: '04:00 PM Today',
      priority: 'high',
      status: 'in-progress',
      progress: 68,
      materialAvailable: true,
      operations: [
        { id: 'OP-101', name: 'Rough CNC Milling', eligibleMachines: ['M-001', 'M-003'], duration: 45, status: 'completed' },
        { id: 'OP-102', name: 'Precision Boring & Drill', eligibleMachines: ['M-002', 'M-004'], duration: 30, status: 'in-progress' },
        { id: 'OP-103', name: 'Vibratory Surface Finish', eligibleMachines: ['M-005'], duration: 25, status: 'pending' }
      ]
    },
    {
      id: 'JOB-002',
      name: 'Planetary Gearbox Housing',
      productType: 'Nodular Cast Iron Castings',
      arrivalTime: '08:30 AM',
      dueDate: '03:00 PM Today',
      priority: 'urgent',
      status: 'in-progress',
      progress: 55,
      materialAvailable: true,
      operations: [
        { id: 'OP-201', name: 'CNC Lathe Turning', eligibleMachines: ['M-006'], duration: 60, status: 'completed' },
        { id: 'OP-202', name: '5-Axis Cavity Milling', eligibleMachines: ['M-001', 'M-003'], duration: 50, status: 'in-progress' },
        { id: 'OP-203', name: 'Coordinate Metrology', eligibleMachines: ['M-007'], duration: 20, status: 'pending' }
      ]
    },
    {
      id: 'JOB-003',
      name: 'Turbine Rotor Transmission Shaft',
      productType: 'EN24 Alloy Steel Shaft',
      arrivalTime: '09:00 AM',
      dueDate: '06:00 PM Today',
      priority: 'medium',
      status: 'in-progress',
      progress: 35,
      materialAvailable: true,
      operations: [
        { id: 'OP-301', name: 'OD Turning & Grooving', eligibleMachines: ['M-006'], duration: 40, status: 'completed' },
        { id: 'OP-302', name: 'Journal Cylindrical Grind', eligibleMachines: ['M-008'], duration: 45, status: 'delayed' },
        { id: 'OP-303', name: 'Induction Hardening', eligibleMachines: ['M-009'], duration: 55, status: 'pending' }
      ]
    },
    {
      id: 'JOB-004',
      name: 'Aerospace Electronic Chassis',
      productType: 'Al 6061-T6 Enclosure',
      arrivalTime: '08:15 AM',
      dueDate: '02:30 PM Today',
      priority: 'high',
      status: 'in-progress',
      progress: 80,
      materialAvailable: true,
      operations: [
        { id: 'OP-401', name: 'Fiber Laser Profiling', eligibleMachines: ['M-010'], duration: 20, status: 'completed' },
        { id: 'OP-402', name: 'Robotic TIG Seam Weld', eligibleMachines: ['M-012'], duration: 30, status: 'in-progress' },
        { id: 'OP-403', name: 'Surface Micro-Bead Blast', eligibleMachines: ['M-005'], duration: 25, status: 'pending' }
      ]
    },
    {
      id: 'JOB-005',
      name: 'Sanitary Flow Valve Body',
      productType: '316L Stainless Steel Forging',
      arrivalTime: '09:30 AM',
      dueDate: '08:00 PM Today',
      priority: 'medium',
      status: 'pending',
      progress: 0,
      materialAvailable: true,
      operations: [
        { id: 'OP-501', name: '5-Axis Cavity Mill', eligibleMachines: ['M-001', 'M-003'], duration: 70, status: 'pending' },
        { id: 'OP-502', name: 'Flange Drilling & Tap', eligibleMachines: ['M-002', 'M-004'], duration: 30, status: 'pending' },
        { id: 'OP-503', name: 'Electropolish Finish', eligibleMachines: ['M-005'], duration: 35, status: 'pending' }
      ]
    },
    {
      id: 'JOB-006',
      name: 'High-Current Copper Busbar Sets',
      productType: 'ETP Copper Busbar Bars',
      arrivalTime: '07:45 AM',
      dueDate: '01:00 PM Today',
      priority: 'high',
      status: 'completed',
      progress: 100,
      materialAvailable: true,
      operations: [
        { id: 'OP-601', name: 'Laser Shear & Notch', eligibleMachines: ['M-010'], duration: 20, status: 'completed' },
        { id: 'OP-602', name: 'CNC Busbar Punching', eligibleMachines: ['M-011'], duration: 20, status: 'completed' },
        { id: 'OP-603', name: 'Compound Offset Bending', eligibleMachines: ['M-011'], duration: 15, status: 'completed' }
      ]
    },
    {
      id: 'JOB-007',
      name: 'Multi-Cavity Plastic Injection Die',
      productType: 'P20 Tool Steel Core & Cavity',
      arrivalTime: '10:00 AM',
      dueDate: 'Tomorrow 12:00 PM',
      priority: 'urgent',
      status: 'delayed',
      progress: 15,
      materialAvailable: false,
      materialEta: '02:00 PM Today (Delayed)',
      operations: [
        { id: 'OP-701', name: 'Hard Milling Prep', eligibleMachines: ['M-001', 'M-003'], duration: 90, status: 'completed' },
        { id: 'OP-702', name: 'High-Precision Wire EDM', eligibleMachines: ['M-013'], duration: 120, status: 'delayed' },
        { id: 'OP-703', name: 'Diamond Paste Polish', eligibleMachines: ['M-005'], duration: 60, status: 'pending' }
      ]
    },
    {
      id: 'JOB-008',
      name: 'Titanium Hydraulic Manifold Block',
      productType: 'Ti-6Al-4V Aerospace Manifold',
      arrivalTime: '07:30 AM',
      dueDate: '02:00 PM Today',
      priority: 'urgent',
      status: 'in-progress',
      progress: 85,
      materialAvailable: true,
      operations: [
        { id: 'OP-801', name: 'Titanium Face Milling', eligibleMachines: ['M-001'], duration: 55, status: 'completed' },
        { id: 'OP-802', name: 'High-Pressure Cross Hole', eligibleMachines: ['M-002'], duration: 25, status: 'completed' },
        { id: 'OP-803', name: 'CMM Pressure Metrology', eligibleMachines: ['M-007'], duration: 30, status: 'in-progress' }
      ]
    },
    {
      id: 'JOB-009',
      name: 'Helical Drive Pinion Shaft',
      productType: 'Case Hardened 8620 Alloy',
      arrivalTime: '10:15 AM',
      dueDate: 'Tomorrow 05:00 PM',
      priority: 'low',
      status: 'pending',
      progress: 0,
      materialAvailable: true,
      operations: [
        { id: 'OP-901', name: 'CNC Lathe Step Turn', eligibleMachines: ['M-006'], duration: 50, status: 'pending' },
        { id: 'OP-902', name: 'Hobbing & Gear Mill', eligibleMachines: ['M-003'], duration: 65, status: 'pending' },
        { id: 'OP-903', name: 'Carburizing Furnace', eligibleMachines: ['M-009'], duration: 120, status: 'pending' }
      ]
    },
    {
      id: 'JOB-010',
      name: 'Flanged Pressure Vessel Nozzle',
      productType: 'ASTM A105 Carbon Steel',
      arrivalTime: '10:30 AM',
      dueDate: 'Tomorrow 03:00 PM',
      priority: 'medium',
      status: 'pending',
      progress: 0,
      materialAvailable: true,
      operations: [
        { id: 'OP-1001', name: 'Heavy OD Roughing', eligibleMachines: ['M-006'], duration: 75, status: 'pending' },
        { id: 'OP-1002', name: 'Bolt Circle Drill & Tap', eligibleMachines: ['M-002', 'M-004'], duration: 40, status: 'pending' },
        { id: 'OP-1003', name: 'Weld Prep Bevel', eligibleMachines: ['M-001'], duration: 30, status: 'pending' }
      ]
    }
  ],

  // Job Gantt Palette
  jobColors: {
    'JOB-001': '#06b6d4', // Cyan
    'JOB-002': '#8b5cf6', // Violet
    'JOB-003': '#f59e0b', // Amber
    'JOB-004': '#10b981', // Emerald
    'JOB-005': '#ec4899', // Pink
    'JOB-006': '#38bdf8', // Sky
    'JOB-007': '#f97316', // Orange
    'JOB-008': '#ef4444', // Red
    'JOB-009': '#a855f7', // Purple
    'JOB-010': '#14b8a6'  // Teal
  },

  // Initial Schedule Blocks for Gantt (0 to 240 mins)
  scheduleBlocks: [
    { id: 'SB-1', machineId: 'M-001', jobId: 'JOB-001', label: 'JOB-001 [Milling]', start: 0, end: 45, type: 'processing', workerId: 'W-001', workerName: 'Rajesh Sharma' },
    { id: 'SB-2', machineId: 'M-001', label: 'Tool Changeover', start: 45, end: 55, type: 'changeover', workerId: 'W-001', workerName: 'Rajesh Sharma' },
    { id: 'SB-3', machineId: 'M-001', jobId: 'JOB-008', label: 'JOB-008 [Milling]', start: 55, end: 110, type: 'processing', workerId: 'W-001', workerName: 'Rajesh Sharma' },
    { id: 'SB-4', machineId: 'M-001', jobId: 'JOB-005', label: 'JOB-005 [Cavity Mill]', start: 120, end: 190, type: 'processing', workerId: 'W-001', workerName: 'Rajesh Sharma' },

    { id: 'SB-5', machineId: 'M-002', jobId: 'JOB-001', label: 'JOB-001 [Drill & Tap]', start: 50, end: 80, type: 'processing', workerId: 'W-002', workerName: 'Priya Patel' },
    { id: 'SB-6', machineId: 'M-002', jobId: 'JOB-008', label: 'JOB-008 [Cross Hole]', start: 115, end: 140, type: 'processing', workerId: 'W-002', workerName: 'Priya Patel' },
    { id: 'SB-7', machineId: 'M-002', jobId: 'JOB-005', label: 'JOB-005 [Flange Drill]', start: 195, end: 225, type: 'processing', workerId: 'W-002', workerName: 'Priya Patel' },

    { id: 'SB-8', machineId: 'M-003', jobId: 'JOB-002', label: 'JOB-002 [5-Axis Mill]', start: 65, end: 115, type: 'processing', workerId: 'W-010', workerName: 'Arjun Das' },
    { id: 'SB-9', machineId: 'M-003', label: 'Changeover', start: 115, end: 125, type: 'changeover', workerId: 'W-010', workerName: 'Arjun Das' },
    { id: 'SB-10', machineId: 'M-003', jobId: 'JOB-009', label: 'JOB-009 [Gear Mill]', start: 130, end: 195, type: 'processing', workerId: 'W-010', workerName: 'Arjun Das' },

    { id: 'SB-11', machineId: 'M-004', jobId: 'JOB-010', label: 'JOB-010 [Bolt Circle]', start: 120, end: 160, type: 'processing', workerId: 'W-002', workerName: 'Priya Patel' },

    { id: 'SB-12', machineId: 'M-005', jobId: 'JOB-004', label: 'JOB-004 [Polish]', start: 80, end: 105, type: 'processing', workerId: 'W-006', workerName: 'Deepa Nair' },
    { id: 'SB-13', machineId: 'M-005', jobId: 'JOB-001', label: 'JOB-001 [Vibratory]', start: 110, end: 135, type: 'processing', workerId: 'W-006', workerName: 'Deepa Nair' },
    { id: 'SB-14', machineId: 'M-005', jobId: 'JOB-007', label: 'JOB-007 [Paste Polish]', start: 200, end: 240, type: 'processing', workerId: 'W-006', workerName: 'Deepa Nair' },

    { id: 'SB-15', machineId: 'M-006', jobId: 'JOB-002', label: 'JOB-002 [Turning]', start: 0, end: 60, type: 'processing', workerId: 'W-003', workerName: 'Amit Verma' },
    { id: 'SB-16', machineId: 'M-006', jobId: 'JOB-003', label: 'JOB-003 [Grooving]', start: 65, end: 105, type: 'processing', workerId: 'W-003', workerName: 'Amit Verma' },
    { id: 'SB-17', machineId: 'M-006', jobId: 'JOB-010', label: 'JOB-010 [Roughing]', start: 110, end: 185, type: 'processing', workerId: 'W-003', workerName: 'Amit Verma' },

    { id: 'SB-18', machineId: 'M-007', jobId: 'JOB-008', label: 'JOB-008 [Metrology]', start: 145, end: 175, type: 'processing', workerId: 'W-007', workerName: 'Karthik Iyer' },
    { id: 'SB-19', machineId: 'M-007', jobId: 'JOB-002', label: 'JOB-002 [CMM Check]', start: 180, end: 200, type: 'processing', workerId: 'W-007', workerName: 'Karthik Iyer' },

    { id: 'SB-20', machineId: 'M-008', label: 'Scheduled Maintenance', start: 0, end: 90, type: 'maintenance', workerId: 'W-001', workerName: 'Rajesh Sharma' },
    { id: 'SB-21', machineId: 'M-008', jobId: 'JOB-003', label: 'JOB-003 [Cyl Grind - DELAYED]', start: 100, end: 145, type: 'processing', isDelayed: true, workerId: 'W-001', workerName: 'Rajesh Sharma' },

    { id: 'SB-22', machineId: 'M-009', jobId: 'JOB-003', label: 'JOB-003 [Induction Hardening]', start: 155, end: 210, type: 'processing', isDelayed: true, workerId: 'W-008', workerName: 'Manoj Kumar' },

    { id: 'SB-23', machineId: 'M-010', jobId: 'JOB-004', label: 'JOB-004 [Laser Cut]', start: 0, end: 20, type: 'processing', workerId: 'W-004', workerName: 'Sunita Rao' },
    { id: 'SB-24', machineId: 'M-010', jobId: 'JOB-006', label: 'JOB-006 [Laser Shear]', start: 25, end: 45, type: 'processing', workerId: 'W-004', workerName: 'Sunita Rao' },

    { id: 'SB-25', machineId: 'M-011', jobId: 'JOB-006', label: 'JOB-006 [Punch & Bend]', start: 50, end: 85, type: 'processing', workerId: 'W-004', workerName: 'Sunita Rao' },

    { id: 'SB-26', machineId: 'M-012', jobId: 'JOB-004', label: 'JOB-004 [TIG Seam Weld]', start: 45, end: 75, type: 'processing', workerId: 'W-005', workerName: 'Vikram Singh' },

    { id: 'SB-27', machineId: 'M-013', label: 'UNEXPECTED BREAKDOWN (Spindle Fault)', start: 60, end: 240, type: 'breakdown', workerId: 'W-009', workerName: 'Sneha Reddy' },
    { id: 'SB-28', machineId: 'M-013', jobId: 'JOB-007', label: 'JOB-007 [Wire EDM - BLOCKED]', start: 90, end: 210, type: 'processing', isDelayed: true, workerId: 'W-009', workerName: 'Sneha Reddy' }
  ],

  // Active Disruptions List
  disruptions: [
    {
      id: 'DIS-01',
      title: 'Machine M-013 Sudden Spindle Failure',
      type: 'breakdown',
      machineId: 'M-013',
      machineName: 'Wire Electrical Discharge (EDM)',
      startTime: '10:15 AM',
      estRepairMinutes: 180,
      affectedJobs: ['JOB-007'],
      impactLevel: 'Critical',
      status: 'Active (Unresolved)',
      desc: 'High voltage discharge generator overheated; wire feed servo stalled.'
    },
    {
      id: 'DIS-02',
      title: 'Supplier Material Delay: P20 Tool Steel',
      type: 'material-delay',
      jobId: 'JOB-007',
      supplier: 'Midwest Specialty Alloys Ltd',
      originalEta: '09:00 AM',
      revisedEta: '02:00 PM',
      delayMinutes: 300,
      affectedJobs: ['JOB-007'],
      impactLevel: 'High',
      status: 'Active',
      desc: 'Transport truck axle failure on expressway; shipment delayed by 5 hours.'
    },
    {
      id: 'DIS-03',
      title: 'Emergency Rush Order Arrival (Aero Defense)',
      type: 'rush-order',
      jobId: 'JOB-RUSH-99',
      jobName: 'Emergency Missile Gasket Flange',
      priority: 'Top Urgent',
      targetCompletion: '03:30 PM Today',
      estDuration: 95,
      impactLevel: 'High',
      status: 'Pending Insertion',
      desc: 'Critical AOG replacement part needed before 16:00 flight test.'
    }
  ],

  // Disruption History Timeline
  disruptionHistory: [
    { id: 'HIST-1', time: '08:15 AM', event: 'Laser Cutter M-010 optical lens purge required', resolution: '10 min offline, recovered without makespan slippage', recoveredBy: 'ReSchedule' },
    { id: 'HIST-2', time: 'Yesterday 03:40 PM', event: 'CNC Mill Gamma M-003 tool breakage (carbide endmill)', resolution: 'Re-sequenced JOB-002 to M-001, 98% stability preserved', recoveredBy: 'ReSchedule' },
    { id: 'HIST-3', time: 'Nov 07 11:20 AM', event: 'Alloy stock delivery delayed 2 hours', resolution: 'Buffer operations swapped, zero tardiness incurred', recoveredBy: 'ReSchedule' }
  ],

  // Discrete-Event Simulation Event Queue
  simEvents: [
    { timeMin: 0, clock: '08:00 AM', type: 'job-arrival', icon: '📥', title: 'Batch Release', desc: 'JOB-001, JOB-004, JOB-006 released to shop floor queue' },
    { timeMin: 0, clock: '08:00 AM', type: 'op-start', icon: '▶️', title: 'Operations Initiated', desc: 'M-001 starts JOB-001; M-006 starts JOB-002; M-010 starts JOB-004' },
    { timeMin: 20, clock: '08:20 AM', type: 'op-complete', icon: '✅', title: 'Laser Cutting Done', desc: 'M-010 finished OP-401 for JOB-004. Transferring to M-012' },
    { timeMin: 45, clock: '08:45 AM', type: 'op-complete', icon: '✅', title: 'Milling Complete', desc: 'M-001 finished OP-101. Machine initiates tool changeover' },
    { timeMin: 60, clock: '09:00 AM', type: 'breakdown', icon: '🚨', title: 'ALARM: M-013 Failure', desc: 'EDM Machine Nu spindle generator breakdown! Stalling workcenter' },
    { timeMin: 65, clock: '09:05 AM', type: 'op-start', icon: '▶️', title: 'Lathe Completed', desc: 'M-006 finished JOB-002; starts JOB-003 grooving' },
    { timeMin: 85, clock: '09:25 AM', type: 'material-delay', icon: '⚠️', title: 'Material Delay Alert', desc: 'Supplier reports P20 steel shipment stalled. JOB-007 delayed' },
    { timeMin: 105, clock: '09:45 AM', type: 'rush-order', icon: '⚡', title: 'Emergency Order', desc: 'Aerospace Customer issues rush priority ticket for manifold' },
    { timeMin: 110, clock: '09:50 AM', type: 'recovery', icon: '🛡️', title: 'ReSchedule Triggered', desc: 'Intelligent disruption recovery initiated; schedule repaired in 2.34s' },
    { timeMin: 120, clock: '10:00 AM', type: 'op-start', icon: '🔄', title: 'Alternative Routing', desc: 'M-001 takes diverted operations from breakdown machine M-013' },
    { timeMin: 180, clock: '11:00 AM', type: 'repair', icon: '🔧', title: 'Maintenance Clear', desc: 'Grinder Theta M-008 wheel truing completed. Back online' }
  ],

  // Benchmark Comparison Dataset
  benchmarkData: {
    metrics: [
      { metric: 'On-Time Delivery (%)', fcfs: 64.2, edd: 76.8, cpsat: 88.5, reschedule: 94.8, unit: '%' },
      { metric: 'Throughput (jobs/hr)', fcfs: 3.1, edd: 3.6, cpsat: 4.1, reschedule: 4.6, unit: 'jobs/h' },
      { metric: 'Changeover Loss (hours)', fcfs: 5.4, edd: 4.8, cpsat: 3.2, reschedule: 2.1, unit: 'hrs' },
      { metric: 'Energy Cost (₹)', fcfs: 1480, edd: 1390, cpsat: 1120, reschedule: 965, unit: '₹' },
      { metric: 'Recovery Time (seconds)', fcfs: 45.0, edd: 35.0, cpsat: 28.5, reschedule: 2.34, unit: 'sec' },
      { metric: 'Schedule Stability Index (%)', fcfs: 42.0, edd: 54.0, cpsat: 68.0, reschedule: 91.5, unit: '%' }
    ],
    paretoPoints: [
      { name: 'FCFS', onTime: 64.2, energyCost: 1480, changeover: 5.4, color: '#94a3b8' },
      { name: 'EDD', onTime: 76.8, energyCost: 1390, changeover: 4.8, color: '#f59e0b' },
      { name: 'CP-SAT', onTime: 88.5, energyCost: 1120, changeover: 3.2, color: '#8b5cf6' },
      { name: 'Proposed ReSchedule', onTime: 94.8, energyCost: 965, changeover: 2.1, color: '#06b6d4' }
    ]
  },

  // Performance Analytics Data Points
  analytics: {
    kpis: {
      onTimeDelivery: 91.4,
      throughput: 4.4,
      changeoverLossHours: 2.6,
      energyCostINR: 1045,
      recoveryTimeSec: 2.34,
      machineUtilization: 72.8,
      avgTardinessMin: 14.2,
      totalMakespanMin: 220,
      stabilityIndex: 89.2,
      totalDowntimeHours: 3.5
    },
    dailyTrend: [
      { day: 'Mon', onTime: 86, energy: 1180, throughput: 3.8, utilization: 68 },
      { day: 'Tue', onTime: 89, energy: 1120, throughput: 4.1, utilization: 71 },
      { day: 'Wed', onTime: 84, energy: 1250, throughput: 3.7, utilization: 67 },
      { day: 'Thu', onTime: 93, energy: 1040, throughput: 4.4, utilization: 76 },
      { day: 'Fri', onTime: 91, energy: 1060, throughput: 4.3, utilization: 73 },
      { day: 'Sat', onTime: 95, energy: 980, throughput: 4.6, utilization: 78 }
    ],
    hourlyEnergy: [
      { hour: '08:00', kw: 62 },
      { hour: '09:00', kw: 95 },
      { hour: '10:00', kw: 118 },
      { hour: '11:00', kw: 124 },
      { hour: '12:00', kw: 88 },
      { hour: '13:00', kw: 75 },
      { hour: '14:00', kw: 112 },
      { hour: '15:00', kw: 106 },
      { hour: '16:00', kw: 82 }
    ]
  },

  // System Notifications
  notifications: [
    { id: 'N-1', title: 'Breakdown Alert: M-013', desc: 'Wire EDM spindle malfunction detected. Schedule recovery advised.', time: '5m ago', type: 'error', read: false },
    { id: 'N-2', title: 'Recovery Completed', desc: 'ReSchedule generated optimal repair plan: 3 jobs re-routed, 91% stability.', time: '12m ago', type: 'success', read: false },
    { id: 'N-3', title: 'Material Arrival Delayed', desc: 'P20 Tool Steel shipment delayed to 02:00 PM.', time: '35m ago', type: 'warning', read: true },
    { id: 'N-4', title: 'Maintenance Scheduled', desc: 'Grinder Theta M-008 wheel truing underway until 02:00 PM.', time: '1h ago', type: 'info', read: true }
  ],

  // System Settings Defaults
  settings: {
    factoryName: 'Quantum Precision Job Shop Works',
    institution: 'Gokaraju Lailavathi Engineering College',
    theme: 'Smart Automation',
    operatingHoursStart: '08:00',
    operatingHoursEnd: '20:00',
    shiftsPerDay: 2,
    baseElectricityTariff: 8.50,
    peakElectricityTariff: 12.20,
    defaultAlgorithm: 'ReSchedule',
    recoveryBudgetSec: 5,
    solverBackendUrl: 'http://localhost:8000/api',
    // Factory Resource Capacity & Disruption State
    numWorkers: 10,
    numMachines: 13,
    absentWorkers: [],
    brokenMachines: ['M-013'],
    lastScheduleSummary: null
  }
};

