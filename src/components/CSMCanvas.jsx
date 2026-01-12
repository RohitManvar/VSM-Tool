import { useState } from "react";

function CSMCanvas({ machines, onClose }) {
  const startX = 120;
  const gap = 240;
  const yProcess = 180;
  const yInventory = 330;

  const svgWidth = startX + machines.length * gap + 400;
  const svgHeight = 600;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Value Stream Map</h2>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div style={styles.canvasWrapper}>
          <svg width={svgWidth} height={svgHeight} style={styles.svg}>
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

            {/* Arrow Marker */}
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
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}