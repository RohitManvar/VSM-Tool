import { useState } from "react";

function CSMCanvas({ machines, onClose }) {
  const startX = 220;
  const gap = 240;
  const yProcess = 280;
  const yInventory = 430;
  const yInfo = 100;

  const svgWidth = startX + machines.length * gap + 500;
  const svgHeight = 800;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Value Stream Map</h2>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div style={styles.canvasWrapper}>
          <svg width={svgWidth} height={svgHeight} style={styles.svg}>
            {/* SUPPLIER BOX */}
            <g>
              <rect
                x="20"
                y={yProcess}
                width="160"
                height="100"
                fill="#f0f9ff"
                stroke="#0284c7"
                strokeWidth="2"
                rx="8"
                ry="8"
                filter="drop-shadow(2px 4px 6px rgba(2, 132, 199, 0.2))"
              />
              <text
                x="100"
                y={yProcess + 25}
                textAnchor="middle"
                fontWeight="bold"
                fontSize="14"
                fill="#0284c7"
              >
                SUPPLIER
              </text>
              <text x="35" y={yProcess + 50} fontSize="11" fill="#2d3748">
                Raw Materials
              </text>
              <text x="35" y={yProcess + 68} fontSize="11" fill="#2d3748">
                Lead Time: Weekly
              </text>
              <text x="35" y={yProcess + 86} fontSize="11" fill="#2d3748">
                Delivery: Truck
              </text>
            </g>

            {/* CUSTOMER BOX */}
            <g>
              <rect
                x={svgWidth - 200}
                y={yProcess}
                width="160"
                height="100"
                fill="#fef3c7"
                stroke="#f59e0b"
                strokeWidth="2"
                rx="8"
                ry="8"
                filter="drop-shadow(2px 4px 6px rgba(245, 158, 11, 0.2))"
              />
              <text
                x={svgWidth - 120}
                y={yProcess + 25}
                textAnchor="middle"
                fontWeight="bold"
                fontSize="14"
                fill="#f59e0b"
              >
                CUSTOMER
              </text>
              <text x={svgWidth - 185} y={yProcess + 50} fontSize="11" fill="#2d3748">
                Orders: Monthly
              </text>
              <text x={svgWidth - 185} y={yProcess + 68} fontSize="11" fill="#2d3748">
                Forecast: Weekly
              </text>
              <text x={svgWidth - 185} y={yProcess + 86} fontSize="11" fill="#2d3748">
                Delivery: Daily
              </text>
            </g>

            {/* PRODUCTION CONTROL BOX */}
            <g>
              <rect
                x={svgWidth / 2 - 100}
                y={yInfo - 40}
                width="200"
                height="80"
                fill="#f3e8ff"
                stroke="#9333ea"
                strokeWidth="2"
                rx="8"
                ry="8"
                filter="drop-shadow(2px 4px 6px rgba(147, 51, 234, 0.2))"
              />
              <text
                x={svgWidth / 2}
                y={yInfo - 15}
                textAnchor="middle"
                fontWeight="bold"
                fontSize="13"
                fill="#9333ea"
              >
                PRODUCTION
              </text>
              <text
                x={svgWidth / 2}
                y={yInfo}
                textAnchor="middle"
                fontWeight="bold"
                fontSize="13"
                fill="#9333ea"
              >
                CONTROL
              </text>
              <text x={svgWidth / 2 - 80} y={yInfo + 20} fontSize="10" fill="#2d3748">
                MRP/ERP System
              </text>
            </g>

            {/* INFORMATION FLOW - Customer to Production Control */}
            <path
              d={`M ${svgWidth - 120} ${yProcess} 
                  L ${svgWidth - 120} ${yInfo + 50}
                  L ${svgWidth / 2 + 100} ${yInfo + 50}
                  L ${svgWidth / 2 + 100} ${yInfo + 40}`}
              stroke="#9333ea"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              markerEnd="url(#infoArrow)"
            />
            <text
              x={svgWidth - 200}
              y={yInfo + 65}
              fontSize="10"
              fill="#9333ea"
              fontStyle="italic"
            >
              Orders
            </text>

            {/* INFORMATION FLOW - Production Control to Supplier */}
            <path
              d={`M ${svgWidth / 2 - 100} ${yInfo + 20}
                  L ${200} ${yInfo + 20}
                  L ${200} ${yProcess}`}
              stroke="#9333ea"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              markerEnd="url(#infoArrow)"
            />
            <text
              x="220"
              y={yInfo + 15}
              fontSize="10"
              fill="#9333ea"
              fontStyle="italic"
            >
              Purchase Orders
            </text>

            {/* INFORMATION FLOW - Production Control to Processes */}
            {machines.map((m, i) => {
              const x = startX + i * gap + 100;
              return (
                <line
                  key={`info-${i}`}
                  x1={svgWidth / 2}
                  y1={yInfo + 40}
                  x2={x}
                  y2={yProcess}
                  stroke="#9333ea"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                  markerEnd="url(#infoArrow)"
                />
              );
            })}
            <text
              x={svgWidth / 2 - 50}
              y={yInfo + 85}
              fontSize="10"
              fill="#9333ea"
              fontStyle="italic"
            >
              Production Schedule
            </text>

            {/* MATERIAL FLOW - Supplier to First Process */}
            <line
              x1="180"
              y1={yProcess + 50}
              x2={startX}
              y2={yProcess + 75}
              stroke="#667eea"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />

            {/* MATERIAL FLOW - Last Process to Customer */}
            <line
              x1={startX + (machines.length - 1) * gap + 200}
              y1={yProcess + 75}
              x2={svgWidth - 200}
              y2={yProcess + 50}
              stroke="#667eea"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />

            {/* MATERIAL FLOW */}
            {machines.map((m, i) => {
              const x = startX + i * gap;
              const uptime = m.breakdown ? `${100 - Number(m.breakdown)}%` : "NA";

              return (
                <g key={i}>
                  {/* Process Box */}
                  <rect
                    x={x}
                    y={yProcess}
                    width="200"
                    height="150"
                    fill="#ffffff"
                    stroke="#667eea"
                    strokeWidth="2"
                    rx="8"
                    ry="8"
                    filter="drop-shadow(2px 4px 6px rgba(102, 126, 234, 0.2))"
                  />

                  {/* Process Name */}
                  <text
                    x={x + 100}
                    y={yProcess + 20}
                    textAnchor="middle"
                    fontWeight="bold"
                    fontSize="13"
                    fill="#667eea"
                  >
                    {m.name || `Process ${i + 1}`}
                  </text>

                  {/* Process Details */}
                  <text x={x + 10} y={yProcess + 40} fontSize="11" fill="#2d3748">
                    Operators: {m.operators || "-"}
                  </text>
                  <text x={x + 10} y={yProcess + 54} fontSize="11" fill="#2d3748">
                    Cycle Time: {m.cycleTime || "-"} sec
                  </text>
                  <text x={x + 10} y={yProcess + 68} fontSize="11" fill="#2d3748">
                    Changeover: {m.totalChange || "-"} min
                  </text>
                  <text x={x + 10} y={yProcess + 82} fontSize="11" fill="#2d3748">
                    Shift: 1
                  </text>
                  <text x={x + 10} y={yProcess + 96} fontSize="11" fill="#2d3748">
                    Available: {m.seconds || "-"} sec
                  </text>
                  <text x={x + 10} y={yProcess + 110} fontSize="11" fill="#2d3748">
                    Uptime: {uptime}
                  </text>
                  <text x={x + 10} y={yProcess + 124} fontSize="11" fill="#2d3748">
                    Rejection: {m.rejection || "-"} %
                  </text>
                  <text x={x + 10} y={yProcess + 138} fontSize="11" fill="#2d3748">
                    Rework: {m.rework || "-"} %
                  </text>

                  {/* Inventory Triangle */}
                  {i < machines.length - 1 && (
                    <>
                      <polygon
                        points={`${x + 200},${yInventory} ${x + 230},${yInventory + 40} ${x + 170},${yInventory + 40}`}
                        fill="#fef3c7"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                      <text
                        x={x + 200}
                        y={yInventory + 58}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#92400e"
                      >
                        {machines[i + 1].inventory || "0"} Days
                      </text>
                    </>
                  )}

                  {/* Flow Arrow */}
                  {i < machines.length - 1 && (
                    <line
                      x1={x + 200}
                      y1={yProcess + 75}
                      x2={x + gap}
                      y2={yProcess + 75}
                      stroke="#667eea"
                      strokeWidth="2.5"
                      markerEnd="url(#arrow)"
                    />
                  )}
                </g>
              );
            })}

            {/* LEAD TIME LADDER */}
            <g>
              {/* Timeline Base */}
              <line
                x1={startX}
                y1={yInventory + 120}
                x2={startX + machines.length * gap}
                y2={yInventory + 120}
                stroke="#2d3748"
                strokeWidth="2"
              />

              {machines.map((m, i) => {
                const x = startX + i * gap + 100;
                const cycleTime = m.cycleTime || 0;
                const inventoryDays = i < machines.length - 1 ? (machines[i + 1].inventory || 0) : 0;

                // Calculate times
                const cycleTimeHours = (cycleTime / 3600).toFixed(2);
                const waitTimeDays = inventoryDays;

                return (
                  <g key={`timeline-${i}`}>
                    {/* Process Cycle Time (down arrow) */}
                    <line
                      x1={x}
                      y1={yInventory + 120}
                      x2={x}
                      y2={yInventory + 150}
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                    <rect
                      x={x - 35}
                      y={yInventory + 150}
                      width="70"
                      height="35"
                      fill="#d1fae5"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      rx="4"
                    />
                    <text
                      x={x}
                      y={yInventory + 165}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#065f46"
                      fontWeight="600"
                    >
                      C/T
                    </text>
                    <text
                      x={x}
                      y={yInventory + 178}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#065f46"
                      fontWeight="600"
                    >
                      {cycleTime ? `${cycleTime}s` : '-'}
                    </text>

                    {/* Wait Time / Inventory (up arrow) */}
                    {i < machines.length - 1 && (
                      <>
                        <line
                          x1={x + 120}
                          y1={yInventory + 120}
                          x2={x + 120}
                          y2={yInventory + 90}
                          stroke="#ef4444"
                          strokeWidth="2"
                        />
                        <rect
                          x={x + 85}
                          y={yInventory + 55}
                          width="70"
                          height="35"
                          fill="#fee2e2"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          rx="4"
                        />
                        <text
                          x={x + 120}
                          y={yInventory + 70}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#991b1b"
                          fontWeight="600"
                        >
                          Wait
                        </text>
                        <text
                          x={x + 120}
                          y={yInventory + 83}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#991b1b"
                          fontWeight="600"
                        >
                          {waitTimeDays ? `${waitTimeDays}d` : '-'}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Summary Totals */}
              <g>
                {/* Total Cycle Time */}
                <rect
                  x={startX}
                  y={yInventory + 200}
                  width="180"
                  height="45"
                  fill="#d1fae5"
                  stroke="#10b981"
                  strokeWidth="2"
                  rx="6"
                />
                <text
                  x={startX + 90}
                  y={yInventory + 218}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#065f46"
                  fontWeight="600"
                >
                  Total Cycle Time
                </text>
                <text
                  x={startX + 90}
                  y={yInventory + 235}
                  textAnchor="middle"
                  fontSize="13"
                  fill="#065f46"
                  fontWeight="700"
                >
                  {machines.reduce((sum, m) => sum + Number(m.cycleTime || 0), 0)} sec
                </text>

                {/* Total Lead Time */}
                <rect
                  x={startX + 200}
                  y={yInventory + 200}
                  width="180"
                  height="45"
                  fill="#fee2e2"
                  stroke="#ef4444"
                  strokeWidth="2"
                  rx="6"
                />
                <text
                  x={startX + 290}
                  y={yInventory + 218}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#991b1b"
                  fontWeight="600"
                >
                  Total Lead Time
                </text>
                <text
                  x={startX + 290}
                  y={yInventory + 235}
                  textAnchor="middle"
                  fontSize="13"
                  fill="#991b1b"
                  fontWeight="700"
                >
                  {machines.reduce((sum, m, i) => {
                    const inv = i < machines.length - 1 ? Number(machines[i + 1].inventory || 0) : 0;
                    return sum + inv;
                  }, 0)} days
                </text>

                {/* Value-Added Ratio */}
                <rect
                  x={startX + 400}
                  y={yInventory + 200}
                  width="180"
                  height="45"
                  fill="#e0e7ff"
                  stroke="#667eea"
                  strokeWidth="2"
                  rx="6"
                />
                <text
                  x={startX + 490}
                  y={yInventory + 218}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#4338ca"
                  fontWeight="600"
                >
                  Value-Added Ratio
                </text>
                <text
                  x={startX + 490}
                  y={yInventory + 235}
                  textAnchor="middle"
                  fontSize="13"
                  fill="#4338ca"
                  fontWeight="700"
                >
                  {(() => {
                    const totalCycle = machines.reduce((sum, m) => sum + Number(m.cycleTime || 0), 0);
                    const totalWait = machines.reduce((sum, m, i) => {
                      const inv = i < machines.length - 1 ? Number(machines[i + 1].inventory || 0) : 0;
                      return sum + inv * 24 * 3600; // convert days to seconds
                    }, 0);
                    const ratio = totalWait > 0 ? ((totalCycle / (totalCycle + totalWait)) * 100).toFixed(2) : 100;
                    return `${ratio}%`;
                  })()}
                </text>
              </g>

              {/* Legend */}
              <text
                x={startX}
                y={yInventory + 40}
                fontSize="12"
                fill="#2d3748"
                fontWeight="600"
              >
                Lead Time Ladder:
              </text>
            </g>

            {/* Arrow Markers */}
            <defs>
              <marker
                id="arrow"
                markerWidth="10"
                markerHeight="10"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="#667eea" />
              </marker>
              <marker
                id="infoArrow"
                markerWidth="8"
                markerHeight="8"
                refX="5"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L5,3 L0,6 Z" fill="#9333ea" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [workingDays, setWorkingDays] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [industryName, setIndustryName] = useState("");
  const [productionLine, setProductionLine] = useState("");
  const [breaks, setBreaks] = useState([{ lunch: "", tea: "" }]);
  const [machines, setMachines] = useState([createMachine()]);
  const [showVSM, setShowVSM] = useState(false);

  function createMachine() {
    return {
      name: "",
      hours: "",
      seconds: 0,
      threeMonths: 0,
      rework: "",
      rejection: "",
      breakdown: "",
      avgChange: "",
      changeCount: "",
      totalChange: 0,
      cycleTime: "",
      inventory: "",
      operators: "",
    };
  }

  const totalBreakTime = breaks.reduce(
    (sum, b) => sum + Number(b.lunch || 0) + Number(b.tea || 0),
    0
  );

  const totalAvailableTime = 24 * 60 * 60 - totalBreakTime * 60;

  const perDayProduction =
    monthlyRate && workingDays
      ? (monthlyRate / workingDays).toFixed(2)
      : "";

  const addShift = () =>
    setBreaks([...breaks, { lunch: "", tea: "" }]);

  const addMachine = () =>
    setMachines([...machines, createMachine()]);

  const updateMachine = (index, field, value) => {
    const updated = [...machines];
    updated[index][field] = value;

    if (field === "hours") {
      const sec = value * 3600;
      updated[index].seconds = sec;
      updated[index].threeMonths = sec * workingDays * 3;
    }

    if (field === "avgChange" || field === "changeCount") {
      updated[index].totalChange =
        (updated[index].avgChange || 0) *
        (updated[index].changeCount || 0);
    }

    setMachines(updated);
  };

  const generateVSM = () => {
    const data = {
      industryName,
      productionLine,
      workingDays,
      monthlyRate,
      totalBreakTime,
      totalAvailableTime,
      perDayProduction,
      breaks,
      machines,
    };

    console.log("Generated VSM Data:", data);
    setShowVSM(true);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>Current Stream Mapping</h1>
      </div>

      <div style={styles.container}>
        {/* Industry Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.icon}>🏭</span>
            Industry Information
          </h2>
          <div style={styles.grid}>
            <input
              style={styles.input}
              placeholder="Industry Name"
              value={industryName}
              onChange={(e) => setIndustryName(e.target.value)}
            />
            <input
              style={styles.input}
              placeholder="Production Line Names"
              value={productionLine}
              onChange={(e) => setProductionLine(e.target.value)}
            />
            <input
              style={styles.input}
              type="number"
              placeholder="Working Days per Month"
              value={workingDays}
              onChange={(e) => setWorkingDays(e.target.value)}
            />
            <input
              style={styles.input}
              type="number"
              placeholder="Monthly Production Rate"
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(e.target.value)}
            />
          </div>

          {perDayProduction && (
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Daily Production Target</div>
              <div style={styles.statValue}>{perDayProduction} units</div>
            </div>
          )}
        </div>

        {/* Breaks Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.icon}>⏰</span>
            Shift Breaks
          </h2>
          {breaks.map((b, i) => (
            <div key={i} style={styles.breakRow}>
              <span style={styles.shiftLabel}>Shift {i + 1}</span>
              <input
                style={styles.inputSmall}
                type="number"
                placeholder="Lunch/Dinner (min)"
                value={b.lunch}
                onChange={(e) => {
                  const arr = [...breaks];
                  arr[i].lunch = e.target.value;
                  setBreaks(arr);
                }}
              />
              <input
                style={styles.inputSmall}
                type="number"
                placeholder="Tea (min)"
                value={b.tea}
                onChange={(e) => {
                  const arr = [...breaks];
                  arr[i].tea = e.target.value;
                  setBreaks(arr);
                }}
              />
            </div>
          ))}
          <button style={styles.buttonSecondary} onClick={addShift}>
            + Add Shift
          </button>

          <div style={styles.statsGrid}>
            <div style={styles.miniStatCard}>
              <div style={styles.miniStatLabel}>Total Break Time</div>
              <div style={styles.miniStatValue}>{totalBreakTime} min</div>
            </div>
            <div style={styles.miniStatCard}>
              <div style={styles.miniStatLabel}>Available Time</div>
              <div style={styles.miniStatValue}>{totalAvailableTime.toLocaleString()} sec</div>
            </div>
          </div>
        </div>

        {/* Machines Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.icon}>⚙️</span>
            Machine Configuration
          </h2>
          
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Machine Name</th>
                  <th style={styles.th}>Avail. Hours/Day</th>
                  <th style={styles.th}>Total Time (sec)</th>
                  <th style={styles.th}>3 Mo. Time (sec)</th>
                  <th style={styles.th}>Rework %</th>
                  <th style={styles.th}>Rejection %</th>
                  <th style={styles.th}>Breakdown %</th>
                  <th style={styles.th}>Avg Change (min)</th>
                  <th style={styles.th}>Changes/Mo</th>
                  <th style={styles.th}>Total Change (min)</th>
                  <th style={styles.th}>Cycle Time (sec)</th>
                  <th style={styles.th}>Inventory (days)</th>
                  <th style={styles.th}>Operators</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((m, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        placeholder="Machine"
                        value={m.name}
                        onChange={(e) => updateMachine(i, "name", e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        type="number"
                        value={m.hours}
                        onChange={(e) => updateMachine(i, "hours", e.target.value)}
                      />
                    </td>
                    <td style={{...styles.td, ...styles.readOnly}}>{m.seconds}</td>
                    <td style={{...styles.td, ...styles.readOnly}}>{m.threeMonths}</td>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        type="number"
                        value={m.rework}
                        onChange={(e) => updateMachine(i, "rework", e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        type="number"
                        value={m.rejection}
                        onChange={(e) => updateMachine(i, "rejection", e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        type="number"
                        value={m.breakdown}
                        onChange={(e) => updateMachine(i, "breakdown", e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        type="number"
                        value={m.avgChange}
                        onChange={(e) => updateMachine(i, "avgChange", e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        type="number"
                        value={m.changeCount}
                        onChange={(e) => updateMachine(i, "changeCount", e.target.value)}
                      />
                    </td>
                    <td style={{...styles.td, ...styles.readOnly}}>{m.totalChange}</td>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        type="number"
                        value={m.cycleTime}
                        onChange={(e) => updateMachine(i, "cycleTime", e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        type="number"
                        value={m.inventory}
                        onChange={(e) => updateMachine(i, "inventory", e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        type="number"
                        value={m.operators}
                        onChange={(e) => updateMachine(i, "operators", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button style={styles.buttonSecondary} onClick={addMachine}>
            + Add Machine
          </button>
        </div>

        {/* Generate Button */}
        <button style={styles.buttonPrimary} onClick={generateVSM}>
          Generate Value Stream Map
        </button>
      </div>

      {/* VSM Canvas Modal */}
      {showVSM && <CSMCanvas machines={machines} onClose={() => setShowVSM(false)} />}
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,rgb(82, 83, 87) 0%,rgb(61, 60, 62) 100%)",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    color: "white",
  },
  title: {
    fontSize: "42px",
    fontWeight: "700",
    margin: "0 0 10px 0",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  subtitle: {
    fontSize: "18px",
    opacity: "0.95",
    margin: "0",
    fontWeight: "400",
  },
  container: {
    maxWidth: "1600px",
    margin: "0 auto",
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "12px",
  },
  icon: {
    fontSize: "28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  input: {
    padding: "14px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "15px",
    transition: "all 0.3s ease",
    outline: "none",
  },
  inputSmall: {
    padding: "12px 14px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    outline: "none",
    flex: "1",
  },
  breakRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "12px",
  },
  shiftLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
    minWidth: "60px",
  },
  statCard: {
    background: "linear-gradient(135deg,rgb(82, 83, 87) 0%,rgb(61, 60, 62) 100%)",
    padding: "24px",
    borderRadius: "12px",
    color: "white",
    textAlign: "center",
  },
  statLabel: {
    fontSize: "14px",
    opacity: "0.9",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginTop: "20px",
  },
  miniStatCard: {
    background: "#f7fafc",
    padding: "20px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
  },
  miniStatLabel: {
    fontSize: "13px",
    color: "#718096",
    marginBottom: "6px",
    fontWeight: "500",
  },
  miniStatValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2d3748",
  },
  tableWrapper: {
    overflowX: "auto",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  table: {
    width: "100%",
    minWidth: "1400px",
    borderCollapse: "collapse",
  },
  th: {
    background: "linear-gradient(135deg,rgb(82, 83, 87) 0%,rgb(61, 60, 62) 100%)",
    color: "white",
    padding: "14px 10px",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "center",
    whiteSpace: "nowrap",
    borderRight: "1px solid rgba(255,255,255,0.1)",
  },
  tr: {
    transition: "background 0.2s ease",
  },
  td: {
    padding: "10px",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
    borderRight: "1px solid #e2e8f0",
  },
  readOnly: {
    background: "#f0f4f8",
    fontWeight: "600",
    color: "#2d3748",
  },
  tableInput: {
    width: "100%",
    padding: "8px",
    border: "1px solid #cbd5e0",
    borderRadius: "6px",
    fontSize: "13px",
    outline: "none",
    transition: "border 0.2s ease",
  },
  buttonSecondary: {
    background: "white",
    color: "#667eea",
    border: "2px solidrgb(127, 129, 136)",
    borderRadius: "10px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  buttonPrimary: {
    width: "100%",
    background: "linear-gradient(135deg,rgb(82, 83, 87) 0%,rgb(61, 60, 62) 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "18px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  modalOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    background: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "1000",
    padding: "20px",
  },
  modalContent: {
    background: "white",
    borderRadius: "16px",
    maxWidth: "95vw",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    borderBottom: "2px solid #e2e8f0",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a202c",
    margin: "0",
  },
  closeButton: {
    background: "transparent",
    border: "none",
    fontSize: "28px",
    color: "#718096",
    cursor: "pointer",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    transition: "all 0.2s ease",
  },
  canvasWrapper: {
    overflow: "auto",
    padding: "30px",
    maxHeight: "calc(90vh - 80px)",
  },
  svg: {
    background: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  },
};

export default App;