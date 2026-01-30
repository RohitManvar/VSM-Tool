import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


// Full page styling instead of modal
const canvasStyles = `
  .canvas-full-page {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 1000;
    overflow: auto;
  }

  .canvas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .canvas-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .export-button, .close-button {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid white;
    border-radius: 8px;
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    position: relative;
  }

  .export-button:hover, .close-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .export-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border: 2px solid #667eea;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 1000;
  }

  .dropdown-item {
    padding: 0.75rem 1.5rem;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .dropdown-item:hover {
    background: #f0f4ff;
  }

  .canvas-wrapper {
    padding: 2rem;
    overflow: auto;
  }

  .svg-canvas {
    display: block;
    margin: 0 auto;
    background: #f8fafc;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .loading-content {
    background: white;
    padding: 2rem 3rem;
    border-radius: 12px;
    text-align: center;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e0e7ff;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function CSMCanvas({ machines, connections, onClose }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

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
        level: 0,
        colIndex: 0,
        rowIndex: 0
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
          level: 0,
          colIndex: 0,
          rowIndex: 0
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
          level: 0,
          colIndex: 0,
          rowIndex: 0
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

  // Improved node layout calculation with better spacing
  const layoutNodes = useMemo(() => {
    const graph = nodeGraph;
    const nodes = Array.from(graph.nodes.values());
    
    if (nodes.length === 0) return [];

    // Calculate in-degrees for topological sorting
    const inDegree = new Map();
    nodes.forEach(n => inDegree.set(n.id, 0));
    graph.edges.forEach(e => {
      inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
    });

    // Find start nodes (no incoming edges)
    const queue = nodes.filter(n => inDegree.get(n.id) === 0);
    if (queue.length === 0 && nodes.length > 0) {
      queue.push(nodes[0]);
    }

    // BFS to assign levels and create topological ordering
    const visited = new Set();
    let currentLevel = 0;
    const topologicalOrder = [];
    
    while (queue.length > 0) {
      const levelSize = queue.length;
      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift();
        if (visited.has(node.id)) continue;
        
        visited.add(node.id);
        node.level = currentLevel;
        topologicalOrder.push(node);

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

    // For nodes that weren't reached (cycles), assign them levels
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        node.level = currentLevel;
        topologicalOrder.push(node);
      }
    });

    // Group nodes by level and type
    const levelGroups = new Map();
    topologicalOrder.forEach(n => {
      if (!levelGroups.has(n.level)) {
        levelGroups.set(n.level, []);
      }
      levelGroups.get(n.level).push(n);
    });

    // Assign positions with intelligent spacing
    const machineSpacing = {
      horizontal: 320,
      vertical: 220
    };
    
    const inventorySpacing = {
      horizontal: 280,
      vertical: 180
    };

    // Calculate positions for each level
    let maxRowCount = 0;
    const levelDetails = new Map();

    // First pass: count nodes per level and per type
    levelGroups.forEach((levelNodes, level) => {
      const machinesInLevel = levelNodes.filter(n => n.type === 'machine');
      const inventoriesInLevel = levelNodes.filter(n => n.type === 'inventory');
      
      // Sort machines by their connections for better layout
      machinesInLevel.sort((a, b) => {
        const aOutgoing = graph.edges.filter(e => e.from === a.id).length;
        const bOutgoing = graph.edges.filter(e => e.from === b.id).length;
        return bOutgoing - aOutgoing;
      });

      inventoriesInLevel.sort((a, b) => b.data.inventory - a.data.inventory);

      levelDetails.set(level, {
        machines: machinesInLevel,
        inventories: inventoriesInLevel,
        machineCount: machinesInLevel.length,
        inventoryCount: inventoriesInLevel.length,
        totalRows: Math.max(machinesInLevel.length, inventoriesInLevel.length)
      });

      maxRowCount = Math.max(maxRowCount, machinesInLevel.length, inventoriesInLevel.length);
    });

    // Calculate total width needed based on max rows
    const baseX = 220;
    const baseY = 280;
    
    const dynamicHorizontalSpacing = Math.max(
      machineSpacing.horizontal,
      Math.min(400, 300 + (maxRowCount * 10))
    );

    // Second pass: assign positions with staggered layout
    levelGroups.forEach((levelNodes, level) => {
      const details = levelDetails.get(level);
      const x = baseX + level * dynamicHorizontalSpacing;
      
      const totalHeight = details.totalRows * machineSpacing.vertical;
      const startY = baseY - totalHeight / 2 + machineSpacing.vertical / 2;

      details.machines.forEach((node, i) => {
        node.x = x;
        node.y = startY + i * machineSpacing.vertical;
        node.colIndex = level;
        node.rowIndex = i;
        
        if (details.inventoryCount > 0) {
          node.x += 20;
        }
      });

      details.inventories.forEach((node, i) => {
        const inventoryY = startY + i * inventorySpacing.vertical;
        
        let bestX = x - 40;
        
        const overlappingMachine = details.machines.find(m => 
          Math.abs(m.y - inventoryY) < machineSpacing.vertical / 2
        );
        
        if (overlappingMachine) {
          bestX = x - 80;
        }
        
        node.x = bestX;
        node.y = inventoryY;
        node.colIndex = level;
        node.rowIndex = i;
      });
    });

    return topologicalOrder;
  }, [nodeGraph]);

  // Calculate dynamic positions for components with improved collision avoidance
  const positions = useMemo(() => {
    if (layoutNodes.length === 0) {
      return {
        supplier: { x: 20, y: 200 },
        customer: { x: 800, y: 200 },
        productionControl: { x: 400, y: 5 },
        svgWidth: 1400,
        svgHeight: 800
      };
    }

    const minX = Math.min(...layoutNodes.map(n => n.x)) - 100;
    const maxX = Math.max(...layoutNodes.map(n => n.x)) + 300;
    const minY = Math.min(...layoutNodes.map(n => n.y)) - 150;
    const maxY = Math.max(...layoutNodes.map(n => n.y)) + 200;

    const machineNodes = layoutNodes.filter(n => n.type === 'machine');
    const yProcess = machineNodes.length > 0 
      ? machineNodes.reduce((sum, n) => sum + n.y, 0) / machineNodes.length
      : (minY + maxY) / 2;

    const svgWidth = Math.max(1400, maxX + 400);
    const svgHeight = Math.max(800, maxY + 350);

    const supplier = {
      x: Math.max(20, minX - 200),
      y: yProcess - 30
    };

    const customer = {
      x: Math.min(svgWidth - 180, maxX + 200),
      y: yProcess - 30
    };

    const productionControl = {
      x: (minX + maxX) / 2 - 100,
      y: Math.max(5, minY - 180)
    };

    return {
      supplier,
      customer,
      productionControl,
      yProcess,
      svgWidth,
      svgHeight,
      minX,
      maxX,
      minY,
      maxY
    };
  }, [layoutNodes]);

  // Calculate metrics
  const totalCycleTime = machines.reduce((sum, m) => sum + Number(m.cycleTime || 0), 0);
  const totalLeadTime = connections.reduce((sum, c) => sum + Number(c.inventoryDays || 0), 0);
  const totalWaitSeconds = totalLeadTime * 24 * 3600;
  const valueAddedRatio = totalWaitSeconds > 0 
    ? ((totalCycleTime / (totalCycleTime + totalWaitSeconds)) * 100).toFixed(2)
    : "100.00";

  // PDF Export Functions
  const exportToPDF = async (pageSize) => {
    setIsExporting(true);
    setExportStatus(`Preparing ${pageSize} export...`);
    setShowExportMenu(false);

    try {
      const svgElement = document.querySelector('.svg-canvas');
      if (!svgElement) {
        throw new Error('SVG canvas not found');
      }

      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.background = 'white';
      document.body.appendChild(tempContainer);

      // Clone the SVG
      const svgClone = svgElement.cloneNode(true);
      tempContainer.appendChild(svgClone);

      // Convert SVG to canvas
      setExportStatus('Converting to PDF...');
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      if (pageSize === 'A3') {
        await exportA3(imgData, imgWidth, imgHeight);
      } else {
        await exportA4MultiPage(imgData, imgWidth, imgHeight);
      }

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportStatus("");
    }
  };

  const exportA3 = async (imgData, imgWidth, imgHeight) => {
    setExportStatus('Generating A3 PDF...');
    
    // A3 dimensions in mm (landscape)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate scaling to fit A3
    const margin = 10;
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2);

    const scaleX = availableWidth / (imgWidth / 2);
    const scaleY = availableHeight / (imgHeight / 2);
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = (imgWidth / 2) * scale;
    const scaledHeight = (imgHeight / 2) * scale;

    const x = (pdfWidth - scaledWidth) / 2;
    const y = (pdfHeight - scaledHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
    pdf.save('value-stream-map-A3.pdf');
  };

  const exportA4MultiPage = async (imgData, imgWidth, imgHeight) => {
    setExportStatus("Auto-adjusting A4 pages...");
  
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
  
    const pageWidth = pdf.internal.pageSize.getWidth();   // 210
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297
  
    const marginX = 0;      // no left/right margin (wall print)
    const marginY = 12;     // safe top/bottom margin
  
    const usableWidth = pageWidth - marginX * 2;
    const usableHeight = pageHeight - marginY * 2;
  
    // Fit by height (VSM best practice)
    const scale = usableHeight / imgHeight;
    const scaledImgWidth = imgWidth * scale;
  
    // Auto page calculation (small → large flows)
    const pagesNeeded = Math.ceil(scaledImgWidth / usableWidth);
    const pages = Math.min(Math.max(pagesNeeded, 1), 12);
  
    const img = new Image();
    img.src = imgData;
    await new Promise(res => (img.onload = res));
  
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = imgWidth;
    sourceCanvas.height = imgHeight;
    sourceCanvas.getContext("2d").drawImage(img, 0, 0);
  
    const sliceWidthPx = imgWidth / pages;
  
    for (let i = 0; i < pages; i++) {
      if (i > 0) pdf.addPage();
  
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = sliceWidthPx;
      sliceCanvas.height = imgHeight;
  
      const ctx = sliceCanvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
  
      ctx.drawImage(
        sourceCanvas,
        sliceWidthPx * i,
        0,
        sliceWidthPx,
        imgHeight,
        0,
        0,
        sliceWidthPx,
        imgHeight
      );
  
      pdf.addImage(
        sliceCanvas.toDataURL("image/png", 1.0),
        "PNG",
        0,          // flush left
        marginY,    // top safe margin
        usableWidth,
        usableHeight
      );
  
      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(
        `Page ${i + 1} of ${pages}`,
        pageWidth / 2,
        pageHeight - 6,
        { align: "center" }
      );
    }
  
    pdf.save("value-stream-map-A4-auto.pdf");
  };

  
  return (
    <>
      <style>{canvasStyles}</style>
      <div className="canvas-full-page">
        <div className="canvas-header">
          <h2 className="canvas-title">Current State Map</h2>
          <div className="button-group">
            <div style={{ position: 'relative' }}>
              <button 
                className="export-button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
              {showExportMenu && (
                <div className="dropdown-menu">
                  <div 
                    className="dropdown-item"
                    onClick={() => exportToPDF('A3')}
                  >
                    📄 Export as A3 (Single Page)
                  </div>
                  <div 
                    className="dropdown-item"
                    onClick={() => exportToPDF('A4')}
                  >
                    📑 Export as A4 (Multi-Page)
                  </div>
                </div>
              )}
            </div>
            <button className="close-button" onClick={onClose}>
              Close Map
            </button>
          </div>
        </div>
        
        {isExporting && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <p style={{ color: '#667eea', fontWeight: 600, fontSize: '1.1rem' }}>
                {exportStatus}
              </p>
            </div>
          </div>
        )}
        
        <div className="canvas-wrapper">
          <TransformWrapper
            initialScale={1}
            minScale={0.2}
            maxScale={4}
            wheel={{ step: 0.1 }}
            doubleClick={{ step: 1 }}
            pinch={{ step: 5 }}
            panning={{ velocityDisabled: false }}
            limitToBounds={false}
            centerOnInit
          >
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                cursor: "grab"
              }}
              contentStyle={{
                width: positions.svgWidth,
                height: positions.svgHeight
              }}
            >
              <svg
                width={positions.svgWidth}
                height={positions.svgHeight}
                className="svg-canvas"
              >
            
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
                x={positions.supplier.x}
                y={positions.supplier.y}
                width="160"
                height="100"
                fill="#f0f9ff"
                stroke="#0284c7"
                strokeWidth="2"
                rx="8"
                filter="drop-shadow(2px 4px 6px rgba(2,132,199,0.2))"
              />
              <text 
                x={positions.supplier.x + 80} 
                y={positions.supplier.y + 25} 
                textAnchor="middle" 
                fontWeight="700" 
                fontSize="14" 
                fill="#0284c7"
              >
                SUPPLIER
              </text>
              <text x={positions.supplier.x + 15} y={positions.supplier.y + 50} fontSize="11">Raw Materials</text>
              <text x={positions.supplier.x + 15} y={positions.supplier.y + 68} fontSize="11">Lead Time: Weekly</text>
              <text x={positions.supplier.x + 15} y={positions.supplier.y + 86} fontSize="11">Delivery: Truck</text>
            </g>

            {/* CUSTOMER BOX */}
            <g>
              <rect
                x={positions.customer.x}
                y={positions.customer.y}
                width="160"
                height="100"
                fill="#fef3c7"
                stroke="#f59e0b"
                strokeWidth="2"
                rx="8"
                filter="drop-shadow(2px 4px 6px rgba(245,158,11,0.2))"
              />
              <text 
                x={positions.customer.x + 80} 
                y={positions.customer.y + 25} 
                textAnchor="middle" 
                fontWeight="700" 
                fontSize="14" 
                fill="#f59e0b"
              >
                CUSTOMER
              </text>
              <text x={positions.customer.x + 25} y={positions.customer.y + 50} fontSize="11">Orders: Monthly</text>
              <text x={positions.customer.x + 25} y={positions.customer.y + 68} fontSize="11">Forecast: Weekly</text>
              <text x={positions.customer.x + 25} y={positions.customer.y + 86} fontSize="11">Delivery: Daily</text>
            </g>

            {/* PRODUCTION CONTROL */}
            <g>
              <rect
                x={positions.productionControl.x}
                y={positions.productionControl.y}
                width="200"
                height="80"
                fill="#f3e8ff"
                stroke="#9333ea"
                strokeWidth="2"
                rx="8"
                filter="drop-shadow(2px 4px 6px rgba(147,51,234,0.2))"
              />
              <text 
                x={positions.productionControl.x + 100} 
                y={positions.productionControl.y + 25} 
                textAnchor="middle" 
                fontWeight="700" 
                fontSize="13" 
                fill="#9333ea"
              >
                PRODUCTION CONTROL
              </text>
              <text 
                x={positions.productionControl.x + 100} 
                y={positions.productionControl.y + 50} 
                textAnchor="middle"
                fontSize="10"
              >
                MRP / ERP System
              </text>
            </g>

            {/* Customer → Production Control */} 
            <path
              d={`M ${positions.customer.x + 80} ${positions.customer.y}
                  L ${positions.customer.x + 80} ${positions.productionControl.y + 40}
                  L ${positions.productionControl.x + 200} ${positions.productionControl.y + 40}`}
              stroke="#9333ea"
              strokeDasharray="5,5"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#infoArrow)"
            />

            {/* Production Control → Supplier */} 
            <path
              d={`M ${positions.productionControl.x} ${positions.productionControl.y + 40}
                  L ${positions.supplier.x + 80} ${positions.productionControl.y + 40}
                  L ${positions.supplier.x + 80} ${positions.supplier.y}`}
              stroke="#9333ea"
              strokeDasharray="5,5"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#infoArrow)"
            />

            {/* Production Control → Each Machine */} 
            {layoutNodes
              .filter(n => n.type === "machine")
              .map((node, i) => (
                <line
                  key={`info-${i}`}
                  x1={positions.productionControl.x + 100}
                  y1={positions.productionControl.y + 80}
                  x2={node.x + 100}
                  y2={node.y}
                  stroke="#9333ea"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                  markerEnd="url(#infoArrow)"
                />
            ))}

            {/* Supplier → First Machine */}
            {layoutNodes.length > 0 && (
              <line
                x1={positions.supplier.x + 80}
                y1={positions.supplier.y + 100}
                x2={layoutNodes[0].x}
                y2={layoutNodes[0].y + 75}
                stroke="#667eea"
                strokeWidth="3"
                markerEnd="url(#arrow)"
              />
            )}

            {/* Last Machine → Customer */}
            {layoutNodes.length > 0 && (
              <line
                x1={layoutNodes[layoutNodes.length - 1].x + 200}
                y1={layoutNodes[layoutNodes.length - 1].y + 75}
                x2={positions.customer.x + 5}
                y2={positions.customer.y + 50}
                stroke="#667eea"
                strokeWidth="3"
                markerEnd="url(#arrow)"
              />
            )}

            {/* Render Edges with improved positioning */}
            {nodeGraph.edges.map((edge, i) => {
              const fromNode = nodeGraph.nodes.get(edge.from);
              const toNode = nodeGraph.nodes.get(edge.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + (fromNode.type === 'machine' ? 200 : 60);
              const y1 = fromNode.y + (fromNode.type === 'machine' ? 75 : 20);
              const x2 = toNode.x;
              const y2 = toNode.y + (toNode.type === 'machine' ? 75 : 20);

              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

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
                    <g>
                      <polygon
                        points={`${midX - 12},${midY - 5} ${midX + 12},${midY - 5} ${midX},${midY - 25}`}
                        fill="#2597ba"
                        stroke="#92400e"
                        strokeWidth="1.5"
                      />
                      <text
                        x={midX}
                        y={midY - 8}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill="white"
                      >
                        I
                      </text>
                      <text
                        x={midX}
                        y={midY + 8}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#92400e"
                      >
                        {edge.inventoryDays}d
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render Nodes with improved spacing */}
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
                      y={node.y + 26}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill="#92400e"
                    >
                      I
                    </text>
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
            <g transform={`translate(100, ${positions.svgHeight - 200})`}>
              {(() => {
                let cumulativeTime = 0;
                const ladderSegments = [];
                const segmentWidth = 120;
                const ladderHeight = 60;
                
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
                    <text x="0" y="-20" fontSize="14" fontWeight="700" fill="#1f2937">
                      Lead Time Ladder
                    </text>
                    
                    {ladderSegments.map((segment, i) => {
                      const x = i * segmentWidth;
                      const isWait = segment.type === 'wait';
                      
                      return (
                        <g key={i}>
                          <line
                            x1={x}
                            y1={isWait ? 0 : ladderHeight}
                            x2={x + segmentWidth}
                            y2={isWait ? 0 : ladderHeight}
                            stroke="#667eea"
                            strokeWidth="3"
                          />
                          
                          <line
                            x1={x + segmentWidth}
                            y1={isWait ? 0 : ladderHeight}
                            x2={x + segmentWidth}
                            y2={isWait ? ladderHeight : 0}
                            stroke="#667eea"
                            strokeWidth="3"
                          />
                          
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
                          
                          <text
                            x={x + segmentWidth / 2}
                            y={isWait ? 15 : ladderHeight + 20}
                            textAnchor="middle"
                            fontSize="9"
                            fill="#6b7280"
                          >
                            {segment.label}
                          </text>
                          
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
                    
                    <circle cx="0" cy={ladderHeight} r="4" fill="#667eea" />
                    <text x="0" y={ladderHeight + 45} textAnchor="middle" fontSize="10" fontWeight="600" fill="#667eea">
                      0d
                    </text>
                  </>
                );
              })()}
            </g>

            {/* Summary Metrics */}
            <g transform={`translate(220, ${positions.svgHeight - 50})`}>
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
          </TransformComponent>
          </TransformWrapper>
        </div>
      </div>
    </>
  );
}

export default CSMCanvas;