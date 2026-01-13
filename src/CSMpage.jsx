import { useEffect, useState } from "react";
import "./app.css";

function CSMPage() {
  const [vsmData, setVsmData] = useState(null);
  const [svgWidth, setSvgWidth] = useState(1200);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Load data from localStorage
    const data = localStorage.getItem('vsmData');
    if (data) {
      setVsmData(JSON.parse(data));
    } else {
      // Redirect back if no data
      window.location.href = '/';
    }

    // Handle window resize for responsive scaling
    const handleResize = () => {
      const containerWidth = document.querySelector('.csm-container')?.clientWidth || 1200;
      setSvgWidth(Math.max(1200, containerWidth - 100));
      
      // Calculate scale for responsiveness
      const availableWidth = containerWidth - 40;
      const calculatedScale = Math.min(1, availableWidth / 1200);
      setScale(calculatedScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  if (!vsmData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading CSM Data...</p>
      </div>
    );
  }

  const { industryName, productionLine, workingDays, monthlyRate, perDayProduction, machines } = vsmData;
  const startX = 220;
  const gap = 240;
  const yProcess = 280;
  const yInventory = 430;
  const yInfo = 100;
  const calculatedSvgWidth = startX + machines.length * gap + 500;
  const svgHeight = 800;

  return (
    <div className="csm-page-wrapper">
      <div className="csm-header">
        <div className="csm-header-content">
          <h1 className="csm-title">Current Stream Map</h1>
          {industryName && (
            <p className="csm-subtitle">
              {industryName} • {productionLine || 'Production Line'}
            </p>
          )}
        </div>
        <div className="csm-header-actions">
          <button className="csm-back-button" onClick={handleBack}>
            ← Back to Editor
          </button>
          <button className="csm-print-button" onClick={handlePrint}>
            📄 Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="csm-info-panel">
        {industryName && (
          <div className="csm-info-item">
            <strong>Industry:</strong> {industryName}
          </div>
        )}
        {productionLine && (
          <div className="csm-info-item">
            <strong>Production Line:</strong> {productionLine}
          </div>
        )}
        {workingDays && (
          <div className="csm-info-item">
            <strong>Working Days:</strong> {workingDays}/month
          </div>
        )}
        {monthlyRate && (
          <div className="csm-info-item">
            <strong>Monthly Rate:</strong> {monthlyRate} units
          </div>
        )}
        {perDayProduction && (
          <div className="csm-info-item">
            <strong>Daily Target:</strong> {perDayProduction} units
          </div>
        )}
      </div>

      <div className="csm-container" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        <svg 
          width={calculatedSvgWidth} 
          height={svgHeight} 
          className="csm-svg"
          style={{ 
            display: 'block',
            margin: '0 auto'
          }}
        >
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
              x={calculatedSvgWidth - 200}
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
              x={calculatedSvgWidth - 120}
              y={yProcess + 25}
              textAnchor="middle"
              fontWeight="bold"
              fontSize="14"
              fill="#f59e0b"
            >
              CUSTOMER
            </text>
            <text x={calculatedSvgWidth - 185} y={yProcess + 50} fontSize="11" fill="#2d3748">
              Orders: Monthly
            </text>
            <text x={calculatedSvgWidth - 185} y={yProcess + 68} fontSize="11" fill="#2d3748">
              Forecast: Weekly
            </text>
            <text x={calculatedSvgWidth - 185} y={yProcess + 86} fontSize="11" fill="#2d3748">
              Delivery: Daily
            </text>
          </g>

          {/* PRODUCTION CONTROL BOX */}
          <g>
            <rect
              x={calculatedSvgWidth / 2 - 100}
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
              x={calculatedSvgWidth / 2}
              y={yInfo - 15}
              textAnchor="middle"
              fontWeight="bold"
              fontSize="13"
              fill="#9333ea"
            >
              PRODUCTION
            </text>
            <text
              x={calculatedSvgWidth / 2}
              y={yInfo}
              textAnchor="middle"
              fontWeight="bold"
              fontSize="13"
              fill="#9333ea"
            >
              CONTROL
            </text>
            <text x={calculatedSvgWidth / 2 - 80} y={yInfo + 20} fontSize="10" fill="#2d3748">
              MRP/ERP System
            </text>
          </g>

          {/* INFORMATION FLOW - Customer to Production Control */}
          <path
            d={`M ${calculatedSvgWidth - 120} ${yProcess} 
                L ${calculatedSvgWidth - 120} ${yInfo + 50}
                L ${calculatedSvgWidth / 2 + 100} ${yInfo + 50}
                L ${calculatedSvgWidth / 2 + 100} ${yInfo + 40}`}
            stroke="#9333ea"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            markerEnd="url(#infoArrow)"
          />
          <text
            x={calculatedSvgWidth - 200}
            y={yInfo + 65}
            fontSize="10"
            fill="#9333ea"
            fontStyle="italic"
          >
            Orders
          </text>

          {/* INFORMATION FLOW - Production Control to Supplier */}
          <path
            d={`M ${calculatedSvgWidth / 2 - 100} ${yInfo + 20}
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
                x1={calculatedSvgWidth / 2}
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
            x={calculatedSvgWidth / 2 - 50}
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
            x2={calculatedSvgWidth - 200}
            y2={yProcess + 50}
            stroke="#667eea"
            strokeWidth="3"
            markerEnd="url(#arrow)"
          />

          {/* PROCESS BOXES */}
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
              y1={yInventory + 130}
              x2={startX + machines.length * gap}
              y2={yInventory + 130}
              stroke="#2d3748"
              strokeWidth="2"
            />

            {machines.map((m, i) => {
              const x = startX + i * gap + 110;
              const cycleTime = m.cycleTime || 0;
              const inventoryDays = i < machines.length - 1 ? (machines[i + 1].inventory || 0) : 0;

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
                        {inventoryDays ? `${inventoryDays}d` : '-'}
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
        </svg>
      </div>
    </div>
  );
}

export default CSMPage;