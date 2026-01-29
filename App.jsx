import { useState } from "react";
import * as XLSX from "@e965/xlsx";
import CSMCanvas from "./CSMCanvas";

// Styling
const styles = `
  .app-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg,rgb(127, 140, 233) 0%,rgb(43, 43, 44) 100%);
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

function App() {
  const [workingDays, setWorkingDays] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [industryName, setIndustryName] = useState("");
  const [productionLine, setProductionLine] = useState("");
  const [breaks, setBreaks] = useState([{ lunch: "", tea: "" }]);
  const [machines, setMachines] = useState([createMachine()]);
  const [connections, setConnections] = useState([{ from: "", to: "", inventoryDays: "" }]);
  const [showVSM, setShowVSM] = useState(false);

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
          <h1 className="title">Current State Mapping</h1>
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
                    placeholder="Inventory (days)"
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
            Generate Current State Map
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