  import { useState, useMemo } from "react";
  import * as XLSX from "@e965/xlsx";

  // Styling
  const styles = `
  .app-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg,rgb(167, 168, 176) 0%,rgb(43, 43, 44) 100%);
    padding: 2rem;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .title {
    color: white;
    font-size: 2.5rem;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }

  .section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .input {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .input:focus {
    outline: none;
    border-color: #667eea;
  }

  .input-small {
    padding: 0.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.9rem;
    width: 140px;
  }

  .break-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .shift-label {
    font-weight: 600;
    color: #4b5563;
    min-width: 60px;
  }

  .button-primary {
    width: 100%;
    padding: 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .button-primary:hover {
    transform: translateY(-2px);
  }

  .button-secondary {
    padding: 0.6rem 1.2rem;
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 1rem;
  }

  .button-secondary:hover {
    background: #667eea;
    color: white;
  }

  .button-delete {
    padding: 0.4rem 0.8rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .stat-card {
    background: #667eea;
    color: white;
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
  }

  .stat-label {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .mini-stat-card {
    background: white;
    border: 2px solid #667eea;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
  }

  .mini-stat-label {
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }

  .mini-stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
  }

  .table-wrapper {
    overflow-x: auto;
    margin: 1rem 0;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    background: white;
  }

  .th {
    background: #667eea;
    color: white;
    padding: 0.75rem;
    font-weight: 600;
    font-size: 0.85rem;
    text-align: left;
    white-space: nowrap;
  }

  .td {
    padding: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .tr:hover {
    background: #f9fafb;
  }

  .table-input {
    width: 100%;
    padding: 0.4rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .read-only {
    background: #f3f4f6;
    color: #6b7280;
    font-weight: 600;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 95vw;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 2px solid #e5e7eb;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
  }

  .modal-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1f2937;
  }

  .close-button {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .canvas-wrapper {
    padding: 2rem;
    overflow: auto;
  }

  .svg-canvas {
    display: block;
  }

  .excel-upload {
    margin-top: 1rem;
    padding: 1rem;
    background: #f0f9ff;
    border-radius: 8px;
    border: 2px dashed #0284c7;
  }

  .excel-upload-label {
    display: block;
    font-weight: 600;
    color: #0284c7;
    margin-bottom: 0.5rem;
  }

  .excel-upload-input {
    padding: 0.5rem;
  }

  .connections-grid {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;
    gap: 0.75rem;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .select {
    padding: 0.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.9rem;
    background: white;
  }

  .node-type-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
  }

  .badge-machine {
    background: #dbeafe;
    color: #1e40af;
  }

  .badge-inventory {
    background: #fef3c7;
    color: #92400e;
  }
  `;

  function CSMCanvas({ machines, connections, onClose }) {
    // Build node graph structure
    const nodeGraph = useMemo(() => {
      const graph = {
        nodes: new Map(),
        edges: []
      };

      // Add machine nodes
      machines.forEach((m, i) => {
        const nodeId = `machine-${i}`;
        graph.nodes.set(nodeId, {
          id: nodeId,
          type: 'machine',
          data: m,
          index: i,
          x: 0,
          y: 0,
          level: 0
        });
      });

      // Add inventory nodes from connections
      const inventoryNodes = new Set();
      connections.forEach(conn => {
        if (conn.from.startsWith('inventory-') && !inventoryNodes.has(conn.from)) {
          inventoryNodes.add(conn.from);
          graph.nodes.set(conn.from, {
            id: conn.from,
            type: 'inventory',
            data: { inventory: conn.inventoryDays || 0 },
            x: 0,
            y: 0,
            level: 0
          });
        }
        if (conn.to.startsWith('inventory-') && !inventoryNodes.has(conn.to)) {
          inventoryNodes.add(conn.to);
          graph.nodes.set(conn.to, {
            id: conn.to,
            type: 'inventory',
            data: { inventory: conn.inventoryDays || 0 },
            x: 0,
            y: 0,
            level: 0
          });
        }
      });

      // Add edges
      connections.forEach(conn => {
        if (conn.from && conn.to && graph.nodes.has(conn.from) && graph.nodes.has(conn.to)) {
          graph.edges.push({
            from: conn.from,
            to: conn.to,
            inventoryDays: conn.inventoryDays || 0
          });
        }
      });

      return graph;
    }, [machines, connections]);

    // Calculate node levels (topological layering)
    const layoutNodes = useMemo(() => {
      const graph = nodeGraph;
      const nodes = Array.from(graph.nodes.values());
      
      // Calculate in-degrees
      const inDegree = new Map();
      nodes.forEach(n => inDegree.set(n.id, 0));
      graph.edges.forEach(e => {
        inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
      });

      // Find start nodes (no incoming edges)
      const queue = nodes.filter(n => inDegree.get(n.id) === 0);
      if (queue.length === 0 && nodes.length > 0) {
        // If no start nodes, pick first node
        queue.push(nodes[0]);
      }

      // BFS to assign levels
      const visited = new Set();
      let currentLevel = 0;
      
      while (queue.length > 0) {
        const levelSize = queue.length;
        for (let i = 0; i < levelSize; i++) {
          const node = queue.shift();
          if (visited.has(node.id)) continue;
          
          visited.add(node.id);
          node.level = currentLevel;

          // Add children
          graph.edges
            .filter(e => e.from === node.id)
            .forEach(e => {
              const childNode = graph.nodes.get(e.to);
              if (childNode && !visited.has(childNode.id)) {
                queue.push(childNode);
              }
            });
        }
        currentLevel++;
      }

      // Group nodes by level
      const levelGroups = new Map();
      nodes.forEach(n => {
        if (!levelGroups.has(n.level)) {
          levelGroups.set(n.level, []);
        }
        levelGroups.get(n.level).push(n);
      });

      // Assign positions
      const levelGap = 280;
      const nodeGap = 200;
      const startX = 220;
      const baseY = 280;

      levelGroups.forEach((levelNodes, level) => {
        const x = startX + level * levelGap;
        const totalHeight = levelNodes.length * nodeGap;
        const startY = baseY - totalHeight / 2 + nodeGap / 2;

        levelNodes.forEach((node, i) => {
          node.x = x;
          node.y = startY + i * nodeGap;
        });
      });

      return nodes;
    }, [nodeGraph]);

    const svgWidth = Math.max(1400, layoutNodes.reduce((max, n) => Math.max(max, n.x), 0) + 400);
    const svgHeight = Math.max(800, layoutNodes.reduce((max, n) => Math.max(max, n.y), 0) + 300);

    // Calculate metrics
    const totalCycleTime = machines.reduce((sum, m) => sum + Number(m.cycleTime || 0), 0);
    const totalLeadTime = connections.reduce((sum, c) => sum + Number(c.inventoryDays || 0), 0);
    const totalWaitSeconds = totalLeadTime * 24 * 3600;
    const valueAddedRatio = totalWaitSeconds > 0 
      ? ((totalCycleTime / (totalCycleTime + totalWaitSeconds)) * 100).toFixed(2)
      : "100.00";

      const yProcess = 200;   // machine row Y
      const yInfo = 5;       // information flow Y
      const startX = 220;     // first machine X
      const gap = 380;        // distance between machines

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Current Stream Map</h2>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
          
          <div className="canvas-wrapper">
            <svg width={svgWidth} height={svgHeight} className="svg-canvas">
              
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#667eea" />
                </marker>
                <marker id="infoArrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
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
                  filter="drop-shadow(2px 4px 6px rgba(2,132,199,0.2))"
                />
                <text x="100" y={yProcess + 25} textAnchor="middle" fontWeight="700" fontSize="14" fill="#0284c7">
                  SUPPLIER
                </text>
                <text x="35" y={yProcess + 50} fontSize="11">Raw Materials</text>
                <text x="35" y={yProcess + 68} fontSize="11">Lead Time: Weekly</text>
                <text x="35" y={yProcess + 86} fontSize="11">Delivery: Truck</text>
              </g>

              {/* CUSTOMER BOX */}
              <g>
              <rect
                x={svgWidth - 170}
                y={yProcess}
                width="160"
                height="100"
                fill="#fef3c7"
                stroke="#f59e0b"
                strokeWidth="2"
                rx="8"
                filter="drop-shadow(2px 4px 6px rgba(245,158,11,0.2))"
              />
              <text x={svgWidth - 90} y={yProcess + 25} textAnchor="middle" fontWeight="700" fontSize="14" fill="#f59e0b">
                CUSTOMER
              </text>
              <text x={svgWidth - 145} y={yProcess + 50} fontSize="11">Orders: Monthly</text>
              <text x={svgWidth - 145} y={yProcess + 68} fontSize="11">Forecast: Weekly</text>
              <text x={svgWidth - 145} y={yProcess + 86} fontSize="11">Delivery: Daily</text>
              </g>


              {/* PRODUCTION CONTROL */}
                <g>
                  <rect
                    x={svgWidth / 2 - 100}
                    y={yInfo}
                    width="200"
                    height="80"
                    fill="#f3e8ff"
                    stroke="#9333ea"
                    strokeWidth="2"
                    rx="8"
                    filter="drop-shadow(2px 4px 6px rgba(147,51,234,0.2))"
                  />
                  <text x={svgWidth / 2} y={yInfo + 25} textAnchor="middle" fontWeight="700" fontSize="13" fill="#9333ea">
                    PRODUCTION CONTROL
                  </text>
                  <text x={svgWidth - 940} y={yInfo + 50} fontSize="10">
                    MRP / ERP System
                  </text>
                </g>

              {/*Customer → Production Control*/} 
                <path
                  d={`M ${svgWidth - 90} ${yProcess}
                      L ${svgWidth - 90} ${yInfo + 40}
                      L ${svgWidth - 770} ${yInfo + 40}`}

                  stroke="#9333ea"
                  strokeDasharray="5,5"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#infoArrow)"
                  />

              {/*Production Control → Supplier*/} 
                <path
                  d={`M ${svgWidth / 2 - 100} ${yInfo + 40}
                      L 100 ${yInfo + 40}
                      L 100 ${yProcess}`}
                  stroke="#9333ea"
                  strokeDasharray="5,5"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#infoArrow)"
                />

              {/*Production Control → Each Machine*/} 
                {layoutNodes
                  .filter(n => n.type === "machine")
                  .map((node, i) => (
                    <line
                      key={`info-${i}`}
                      x1={svgWidth / 2}
                      y1={yInfo + 80}
                      x2={node.x + 100}
                      y2={node.y}
                      stroke="#9333ea"
                      strokeWidth="1.5"
                      strokeDasharray="5,5"
                      markerEnd="url(#infoArrow)"
                    />
                ))}

              {/*Supplier → First Machine*/}  
              <line
                x1="100"
                y1={yProcess + 100}
                x2={layoutNodes[0].x}
                y2={layoutNodes[0].y + 75}
                stroke="#667eea"
                strokeWidth="3"
                markerEnd="url(#arrow)"
              />

              {/*Last Machine → Customer*/}
              <line
                x1={layoutNodes[layoutNodes.length - 1].x + 200}
                y1={layoutNodes[layoutNodes.length - 1].y + 75}
                x2={svgWidth - 95}
                y2={yProcess + 102}
                stroke="#667eea"
                strokeWidth="3"
                markerEnd="url(#arrow)"
              />
    

              {/* Render Edges */}
              {nodeGraph.edges.map((edge, i) => {
                const fromNode = nodeGraph.nodes.get(edge.from);
                const toNode = nodeGraph.nodes.get(edge.to);
                if (!fromNode || !toNode) return null;

                const x1 = fromNode.x + (fromNode.type === 'machine' ? 200 : 60);
                const y1 = fromNode.y + (fromNode.type === 'machine' ? 75 : 20);
                const x2 = toNode.x;
                const y2 = toNode.y + (toNode.type === 'machine' ? 75 : 20);

                return (
                  <g key={`edge-${i}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#667eea"
                      strokeWidth="2.5"
                      markerEnd="url(#arrow)"
                    />
                    {edge.inventoryDays > 0 && (
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 10}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#f59e0b"
                      >
                        {edge.inventoryDays}d
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Render Nodes */}
              {layoutNodes.map((node) => {
                if (node.type === 'machine') {
                  const m = node.data;
                  const uptime = m.breakdown ? `${100 - Number(m.breakdown)}%` : "NA";

                  return (
                    <g key={node.id}>
                      <rect
                        x={node.x}
                        y={node.y}
                        width="200"
                        height="150"
                        fill="#ffffff"
                        stroke="#667eea"
                        strokeWidth="2"
                        rx="8"
                        filter="drop-shadow(2px 4px 6px rgba(102, 126, 234, 0.2))"
                      />
                      <text
                        x={node.x + 100}
                        y={node.y + 20}
                        textAnchor="middle"
                        fontWeight="bold"
                        fontSize="13"
                        fill="#667eea"
                      >
                        {m.name || `Process ${node.index + 1}`}
                      </text>
                      <text x={node.x + 10} y={node.y + 40} fontSize="11" fill="#2d3748">
                        Operators: {m.operators || "-"}
                      </text>
                      <text x={node.x + 10} y={node.y + 54} fontSize="11" fill="#2d3748">
                        Cycle Time: {m.cycleTime || "-"} sec
                      </text>
                      <text x={node.x + 10} y={node.y + 68} fontSize="11" fill="#2d3748">
                        Changeover: {m.totalChange || "-"} min
                      </text>
                      <text x={node.x + 10} y={node.y + 82} fontSize="11" fill="#2d3748">
                        Available: {m.seconds || "-"} sec
                      </text>
                      <text x={node.x + 10} y={node.y + 96} fontSize="11" fill="#2d3748">
                        Uptime: {uptime}
                      </text>
                      <text x={node.x + 10} y={node.y + 110} fontSize="11" fill="#2d3748">
                        Rejection: {m.rejection || "-"} %
                      </text>
                      <text x={node.x + 10} y={node.y + 124} fontSize="11" fill="#2d3748">
                        Rework: {m.rework || "-"} %
                      </text>
                    </g>
                  );
                } else if (node.type === 'inventory') {
                  return (
                    <g key={node.id}>
                      <polygon
                        points={`${node.x},${node.y} ${node.x + 30},${node.y + 40} ${node.x - 30},${node.y + 40}`}
                        fill="#fef3c7"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                      <text
                        x={node.x}
                        y={node.y + 58}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#92400e"
                      >
                        {node.data.inventory || 0}d
                      </text>
                    </g>
                  );
                }
                return null;
              })}
              

              {/* Lead Time Ladder */}
              <g transform={`translate(100, ${svgHeight - 200})`}>
                {(() => {
                  let cumulativeTime = 0;
                  const ladderSegments = [];
                  const segmentWidth = 120;
                  const ladderHeight = 60;
                  
                  // Build ladder segments from connections and machines
                  layoutNodes
                    .sort((a, b) => a.level - b.level || a.y - b.y)
                    .forEach((node, idx) => {
                      if (node.type === 'machine') {
                        const cycleTimeSec = Number(node.data.cycleTime || 0);
                        const cycleTimeDays = cycleTimeSec / 86400;
                        
                        ladderSegments.push({
                          type: 'process',
                          time: cycleTimeSec,
                          displayTime: `${cycleTimeSec}s`,
                          cumulative: cumulativeTime,
                          label: node.data.name || `M${idx + 1}`
                        });
                        
                        cumulativeTime += cycleTimeDays;
                        
                        // Find inventory after this machine
                        const outgoingEdge = nodeGraph.edges.find(e => e.from === node.id);
                        if (outgoingEdge && outgoingEdge.inventoryDays > 0) {
                          ladderSegments.push({
                            type: 'wait',
                            time: outgoingEdge.inventoryDays,
                            displayTime: `${outgoingEdge.inventoryDays}d`,
                            cumulative: cumulativeTime,
                            label: 'Inventory'
                          });
                          cumulativeTime += Number(outgoingEdge.inventoryDays);
                        }
                      }
                    });

                  return (
                    <>
                      {/* Ladder Title */}
                      <text x="0" y="-20" fontSize="14" fontWeight="700" fill="#1f2937">
                        Lead Time Ladder
                      </text>
                      
                      {/* Draw ladder segments */}
                      {ladderSegments.map((segment, i) => {
                        const x = i * segmentWidth;
                        const isWait = segment.type === 'wait';
                        
                        return (
                          <g key={i}>
                            {/* Horizontal line */}
                            <line
                              x1={x}
                              y1={isWait ? 0 : ladderHeight}
                              x2={x + segmentWidth}
                              y2={isWait ? 0 : ladderHeight}
                              stroke="#667eea"
                              strokeWidth="3"
                            />
                            
                            {/* Vertical drop/rise */}
                            <line
                              x1={x + segmentWidth}
                              y1={isWait ? 0 : ladderHeight}
                              x2={x + segmentWidth}
                              y2={isWait ? ladderHeight : 0}
                              stroke="#667eea"
                              strokeWidth="3"
                            />
                            
                            {/* Time label on segment */}
                            <text
                              x={x + segmentWidth / 2}
                              y={isWait ? -8 : ladderHeight - 8}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="600"
                              fill={isWait ? "#f59e0b" : "#10b981"}
                            >
                              {segment.displayTime}
                            </text>
                            
                            {/* Process/Wait label */}
                            <text
                              x={x + segmentWidth / 2}
                              y={isWait ? 15 : ladderHeight + 20}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#6b7280"
                            >
                              {segment.label}
                            </text>
                            
                            {/* Cumulative time at each step */}
                            <text
                              x={x + segmentWidth}
                              y={ladderHeight + 45}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="600"
                              fill="#667eea"
                            >
                              {segment.cumulative.toFixed(2)}d
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Starting point */}
                      <circle cx="0" cy={ladderHeight} r="4" fill="#667eea" />
                      <text x="0" y={ladderHeight + 45} textAnchor="middle" fontSize="10" fontWeight="600" fill="#667eea">
                        0d
                      </text>
                    </>
                  );
                })()}
              </g>

              {/* Summary Metrics */}
              <g transform={`translate(220, ${svgHeight - 50})`}>
                <rect x="0" y="0" width="180" height="45" fill="#d1fae5" stroke="#10b981" strokeWidth="2" rx="6" />
                <text x="90" y="18" textAnchor="middle" fontSize="11" fill="#065f46" fontWeight="600">
                  Total Cycle Time
                </text>
                <text x="90" y="35" textAnchor="middle" fontSize="13" fill="#065f46" fontWeight="700">
                  {totalCycleTime} sec
                </text>

                <rect x="200" y="0" width="180" height="45" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" rx="6" />
                <text x="290" y="18" textAnchor="middle" fontSize="11" fill="#991b1b" fontWeight="600">
                  Total Lead Time
                </text>
                <text x="290" y="35" textAnchor="middle" fontSize="13" fill="#991b1b" fontWeight="700">
                  {totalLeadTime} days
                </text>

                <rect x="400" y="0" width="180" height="45" fill="#e0e7ff" stroke="#667eea" strokeWidth="2" rx="6" />
                <text x="490" y="18" textAnchor="middle" fontSize="11" fill="#4338ca" fontWeight="600">
                  Value-Added Ratio
                </text>
                <text x="490" y="35" textAnchor="middle" fontSize="13" fill="#4338ca" fontWeight="700">
                  {valueAddedRatio}%
                </text>
              </g>
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
    const [connections, setConnections] = useState([{ from: "", to: "", inventoryDays: "" }]);
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

    const handleExcelUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const parsedMachines = rows.map((row) => ({
          name: row["Machine Name"] || "",
          hours: Number(row["No of Available Hours daily"] || 0),
          seconds: Number(row["Total Time (sec)"] || 0),
          threeMonths: Number(row["Available time for last 3 months"] || 0),
          rework: Number(row["Rework % last 3 months"] || ""),
          rejection: Number(row["Rejection % last 3 months"] || ""),
          breakdown: Number(row["last 3 months brkdown %"] || ""),
          avgChange: Number(row["Avg Changeover Time (min)"] || 0),
          changeCount: Number(row["No of Changeover per month"] || 0),
          totalChange: Number(row["Total Changeover"] || 0),
          cycleTime: Number(row["Cycle Time (sec)"] || 0),
          inventory: Number(row["Inventory before operations (days)"] || 0),
          operators: Number(row["No. of Operators (No.)"] || 1),
        }));

        setMachines(parsedMachines);
      };
      reader.readAsArrayBuffer(file);
    };

    const totalBreakTime = breaks.reduce(
      (sum, b) => sum + Number(b.lunch || 0) + Number(b.tea || 0),
      0
    );

    const totalAvailableTime = 24 * 60 * 60 - totalBreakTime * 60;
    const perDayProduction = monthlyRate && workingDays ? (monthlyRate / workingDays).toFixed(2) : "";

    const addShift = () => setBreaks([...breaks, { lunch: "", tea: "" }]);
    const addMachine = () => setMachines([...machines, createMachine()]);
    const addConnection = () => setConnections([...connections, { from: "", to: "", inventoryDays: "" }]);

    const updateMachine = (index, field, value) => {
      const updated = [...machines];
      updated[index][field] = value;

      if (field === "hours") {
        const sec = value * 3600;
        updated[index].seconds = sec;
        updated[index].threeMonths = sec * workingDays * 3;
      }

      if (field === "avgChange" || field === "changeCount") {
        updated[index].totalChange = (updated[index].avgChange || 0) * (updated[index].changeCount || 0);
      }

      setMachines(updated);
    };

    const updateConnection = (index, field, value) => {
      const updated = [...connections];
      updated[index][field] = value;
      setConnections(updated);
    };

    const deleteConnection = (index) => {
      setConnections(connections.filter((_, i) => i !== index));
    };

    const generateVSM = () => {
      console.log("Generated VSM Data:", {
        industryName,
        productionLine,
        machines,
        connections
      });
      setShowVSM(true);
    };

    // Build node options for dropdowns
    const nodeOptions = [
      { value: "", label: "-- Select Node --" },
      ...machines.map((m, i) => ({
        value: `machine-${i}`,
        label: `${m.name || `Machine ${i + 1}`}`,
        type: 'machine'
      }))
    ];

    return (
      <>
        <style>{styles}</style>
        <div className="app-wrapper">
          <div className="header">
            <h1 className="title">Current Stream Mapping</h1>
          </div>

          <div className="container">
            {/* Industry Information */}
            <div className="section">
              <h2 className="section-title">Industry Information</h2>
              <div className="grid">
                <input
                  className="input"
                  placeholder="Industry Name"
                  value={industryName}
                  onChange={(e) => setIndustryName(e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Production Line Names"
                  value={productionLine}
                  onChange={(e) => setProductionLine(e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Working Days per Month"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Monthly Production Rate"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(e.target.value)}
                />
              </div>

              {perDayProduction && (
                <div className="stat-card">
                  <div className="stat-label">Daily Production Target</div>
                  <div className="stat-value">{perDayProduction} units</div>
                </div>
              )}
            </div>

            {/* Breaks Section */}
            <div className="section">
              <h2 className="section-title">Shift Breaks</h2>
              {breaks.map((b, i) => (
                <div key={i} className="break-row">
                  <span className="shift-label">Shift {i + 1}</span>
                  <input
                    className="input-small"
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
                    className="input-small"
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
              <button className="button-secondary" onClick={addShift}>
                + Add Shift
              </button>

              <div className="stats-grid">
                <div className="mini-stat-card">
                  <div className="mini-stat-label">Total Break Time</div>
                  <div className="mini-stat-value">{totalBreakTime} min</div>
                </div>
                <div className="mini-stat-card">
                  <div className="mini-stat-label">Available Time</div>
                  <div className="mini-stat-value">{totalAvailableTime.toLocaleString()} sec</div>
                </div>
              </div>
            </div>

            {/* Machines Section */}
            <div className="section">
              <h2 className="section-title">Machine Configuration</h2>
              
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="th">#</th>
                      <th className="th">Machine Name</th>
                      <th className="th">No of Available Hours daily</th>
                      <th className="th">Total Time (sec)</th>
                      <th className="th">Available time for last 3 months</th>
                      <th className="th">Rework % last 3 months</th>
                      <th className="th">Rejection % last 3 months</th>
                      <th className="th">last 3 months brkdown %</th>
                      <th className="th">Avg Changeover Time (min)</th>
                      <th className="th">No of Changeover per month</th>
                      <th className="th">Total Changeover time</th>
                      <th className="th">Cycle Time (sec)</th>
                      <th className="th">No. of Operators (No.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.map((m, i) => (
                      <tr key={i} className="tr">
                        <td className="td">{i + 1}</td>
                        <td className="td">
                          <input
                            className="table-input"
                            placeholder="Machine"
                            value={m.name}
                            onChange={(e) => updateMachine(i, "name", e.target.value)}
                          />
                        </td>
                        <td className="td">
                          <input
                            className="table-input"
                            type="number"
                            value={m.hours}
                            onChange={(e) => updateMachine(i, "hours", e.target.value)}
                          />
                        </td>
                        <td className="td read-only">{m.seconds}</td>
                        <td className="td read-only">{m.threeMonths}</td>
                        <td className="td">
                          <input
                            className="table-input"
                            type="number"
                            value={m.rework}
                            onChange={(e) => updateMachine(i, "rework", e.target.value)}
                          />
                        </td>
                        <td className="td">
                          <input
                            className="table-input"
                            type="number"
                            value={m.rejection}
                            onChange={(e) => updateMachine(i, "rejection", e.target.value)}
                          />
                        </td>
                        <td className="td">
                          <input
                            className="table-input"
                            type="number"
                            value={m.breakdown}
                            onChange={(e) => updateMachine(i, "breakdown", e.target.value)}
                          />
                        </td>
                        <td className="td">
                          <input
                            className="table-input"
                            type="number"
                            value={m.avgChange}
                            onChange={(e) => updateMachine(i, "avgChange", e.target.value)}
                          />
                        </td>
                        <td className="td">
                          <input
                            className="table-input"
                            type="number"
                            value={m.changeCount}
                            onChange={(e) => updateMachine(i, "changeCount", e.target.value)}
                          />
                        </td>
                        <td className="td read-only">{m.totalChange}</td>
                        <td className="td">
                          <input
                            className="table-input"
                            type="number"
                            value={m.cycleTime}
                            onChange={(e) => updateMachine(i, "cycleTime", e.target.value)}
                          />
                        </td>
                        <td className="td">
                          <input
                            className="table-input"
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
              <button className="button-secondary" onClick={addMachine}>
          + Add Machine
        </button>

        <div className="excel-upload">
          <label className="excel-upload-label">
            Upload Machine Data from Excel
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            className="excel-upload-input"
          />
        </div>
      </div>

      {/* Process Connections */}
      <div className="section">
        <h2 className="section-title">Process Flow Connections</h2>
        {connections.map((conn, i) => (
          <div key={i} className="connections-grid">
            <select
              className="select"
              value={conn.from}
              onChange={(e) => updateConnection(i, "from", e.target.value)}
            >
              {nodeOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                  {opt.type && (
                    <span className={`node-type-badge badge-${opt.type}`}>
                      {opt.type}
                    </span>
                  )}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={conn.to}
              onChange={(e) => updateConnection(i, "to", e.target.value)}
            >
              {nodeOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                  {opt.type && (
                    <span className={`node-type-badge badge-${opt.type}`}>
                      {opt.type}
                    </span>
                  )}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                className="input-small"
                type="number"
                placeholder="Inventory before operations(days)"
                value={conn.inventoryDays}
                onChange={(e) => updateConnection(i, "inventoryDays", e.target.value)}
              />
              <button
                className="button-delete"
                onClick={() => deleteConnection(i)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <button className="button-secondary" onClick={addConnection}>
          + Add Connection
        </button>
      </div>


      {/* Generate VSM Button */}
      <button className="button-primary" onClick={generateVSM}>
        Generate Current Stream Map
      </button>
    </div>

    {showVSM && (
      <CSMCanvas
        machines={machines}
        connections={connections}
        onClose={() => setShowVSM(false)}
      />
    )}
  </div>
</>
);
}

export default App;

