import React, { useMemo, useState } from "react";

/**
 * FacultySyllabusScheduler.jsx
 * - Example-B style subjects (subject -> units -> array of topics)
 * - Option A departments: CSE with sections A/B/C
 * - Splits a chosen unit into 10 parts (10 hours) and lays them out Mon-Sat
 */

const periods = [
  { label: "P1", time: "09:15-10:05" },
  { label: "P2", time: "10:05-10:55" },
  { label: "Break", time: "" }, // empty slot for break
  { label: "P3", time: "11:15-12:10" },
  { label: "P4", time: "12:10-13:05" },
  { label: "Lunch", time: "" },
  { label: "P5", time: "14:10-15:00" },
  { label: "P6", time: "15:00-15:45" },
  { label: "P7", time: "15:45-16:30" }
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* ---------- Example-B sample data (replace with real data) ---------- */
const subjectsData = [
  {
    name: "JAVA",
    units: {
      1: [
        "Introduction to Java",
        "JVM and JRE",
        "Data types & Variables",
        "Operators",
        "Control Flow (if/switch)",
        "Loops",
        "Methods",
        "Arrays",
        "String basics",
        "Basic I/O",
        "OOP concepts (intro)",
        "Classes & Objects",
        "Constructors",
        "this keyword"
      ],
      2: [
        "Inheritance basics",
        "Method Overriding",
        "super keyword",
        "Abstract classes",
        "Interfaces",
        "Polymorphism examples",
        "Packages & Access modifiers"
      ],
      3: [
        "Exception handling",
        "Try-catch-finally",
        "Custom exceptions",
        "File I/O"
      ],
      4: ["Collections intro", "ArrayList", "HashMap", "Iterator"],
      5: ["Threads basics", "Runnable", "Thread synchronization"]
    }
  },
  {
    name: "DATA STRUCTURES",
    units: {
      1: [
        "Intro to DS",
        "Complexity analysis",
        "Arrays operations",
        "Linked List - singly",
        "Linked List - doubly",
        "Linked List - circular",
        "Implementation exercises"
      ],
      2: [
        "Stacks",
        "Queues",
        "Deque",
        "Applications"
      ],
      3: ["Trees introduction", "Binary Tree", "Traversal"],
      4: ["BST", "AVL (intro)", "Heaps"],
      5: ["Graphs intro", "BFS/DFS", "Shortest path (Dijkstra)"]
    }
  },
  {
    name: "MATHEMATICS",
    units: {
      1: ["Set Theory", "Logic", "Proof techniques", "Functions", "Relations"],
      2: ["Matrices", "Determinants", "Linear eqns"],
      3: ["Calculus basics", "Limits", "Derivatives"],
      4: ["Integration", "Applications"],
      5: ["Probability", "Statistics"]
    }
  }
];
/* ------------------------------------------------------------------ */

/** Split an array `items` into exactly `n` parts (order preserved).
 * - If items.length >= n -> distribute into n groups as evenly as possible.
 * - If items.length < n -> first items.length groups get 1 item, remaining are empty strings.
 */
function splitIntoNParts(items, n = 10) {
  const result = [];
  const L = items.length;
  if (L === 0) {
    // return n empty parts
    for (let i = 0; i < n; i++) result.push([]);
    return result;
  }
  if (L >= n) {
    const base = Math.floor(L / n);
    const rem = L % n;
    let idx = 0;
    for (let i = 0; i < n; i++) {
      const size = base + (i < rem ? 1 : 0);
      result.push(items.slice(idx, idx + size));
      idx += size;
    }
    return result;
  } else {
    // L < n -> first L parts get single item, rest empty
    for (let i = 0; i < L; i++) result.push([items[i]]);
    for (let i = L; i < n; i++) result.push([]);
    return result;
  }
}

export default function FacultySyllabusScheduler() {
  // Option A department fixed / but show selection for future
  const [department] = useState("CSE");
  const [sections] = useState(["A", "B", "C"]);
  const [section, setSection] = useState("A");

  // subjects from Example B
  const [subjects] = useState(subjectsData);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].name);
  const [selectedUnit, setSelectedUnit] = useState(1);

  // generated parts and timetable
  const [parts, setParts] = useState([]); // array of 10 parts (each is array of topic strings)
  const [timetable, setTimetable] = useState(null); // 2D mapping day->period->partIndex

  // compute selected subject object
  const subjectObj = useMemo(
    () => subjects.find((s) => s.name === selectedSubject),
    [subjects, selectedSubject]
  );

  function handleGenerateParts() {
    const unitTopics =
      (subjectObj && subjectObj.units && subjectObj.units[selectedUnit]) || [];
    const partsArr = splitIntoNParts(unitTopics, 10); // 10 parts / hours
    setParts(partsArr);
    // Also auto-generate timetable (fill Mon->Sat, slot by slot, skipping break/lunch)
    const flatParts = [];
    for (let p of partsArr) flatParts.push(p); // length 10
    const table = {};
    let idx = 0;
    for (let d of days) {
      table[d] = [];
      for (let period of periods) {
        // if period is Break or Lunch, push null placeholder
        if (period.label === "Break" || period.label === "Lunch") {
          table[d].push(null);
        } else {
          table[d].push(idx < flatParts.length ? idx : null);
          idx++;
        }
      }
    }
    setTimetable(table);
  }

  function prettyPartText(partArr) {
    if (!partArr || partArr.length === 0) return "";
    // join multiple small topics by " / "
    return partArr.join(" / ");
  }

  function renderSlot(day, periodIndex) {
    if (!timetable) return null;
    const partIndex = timetable[day][periodIndex];
    if (partIndex === null || partIndex === undefined) {
      return <div className="text-xs text-gray-400">—</div>;
    }
    const content = prettyPartText(parts[partIndex]);
    return (
      <div>
        <div className="font-semibold text-sm">{content || <em>Topic</em>}</div>
        <div className="text-xs text-gray-500">Unit {selectedUnit} • H{partIndex + 1}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-blue-700">Syllabus → Timetable Generator</h2>

      {/* Controls */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              value={department}
              disabled
              className="mt-1 p-2 border rounded w-full bg-gray-50"
            >
              <option value="CSE">CSE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Section</label>
            <div className="mt-1 flex gap-2">
              {sections.map((s) => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={`px-3 py-2 rounded ${
                    section === s ? "bg-blue-600 text-white" : "bg-gray-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedUnit(1);
                setParts([]);
                setTimetable(null);
              }}
              className="mt-1 p-2 border rounded w-full"
            >
              {subjects.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(Number(e.target.value))}
              className="mt-1 p-2 border rounded w-full"
            >
              {[1, 2, 3, 4, 5].map((u) => (
                <option key={u} value={u}>
                  Unit {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Parts / Hours</label>
            <input
              type="text"
              readOnly
              value={"10 (fixed hours per unit)"}
              className="mt-1 p-2 border rounded w-full bg-gray-50"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateParts}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Generate Timetable for Unit {selectedUnit}
            </button>
          </div>
        </div>
      </div>

      {/* Parts preview */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Unit {selectedUnit} — 10 Parts Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {parts.length === 0 && (
            <div className="text-sm text-gray-500">No parts generated yet — click Generate</div>
          )}
          {parts.map((p, i) => (
            <div key={i} className="p-2 border rounded">
              <div className="flex justify-between">
                <div className="font-semibold">Hour {i + 1}</div>
                <div className="text-xs text-gray-500">Unit {selectedUnit}</div>
              </div>
              <div className="text-sm mt-1">{prettyPartText(p) || <em>—</em>}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timetable */}
      <div className="bg-white p-4 rounded shadow overflow-auto">
        <h3 className="font-semibold mb-3">Generated Timetable — Section {section}</h3>

        {!timetable ? (
          <div className="text-sm text-gray-500">No timetable generated yet.</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100 text-left">Day / Period</th>
                {periods.map((p, i) => (
                  <th key={i} className="border p-2 bg-gray-50 text-left">
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-xs text-gray-500">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {days.map((d) => (
                <tr key={d}>
                  <td className="border p-2 font-semibold bg-gray-50">{d}</td>
                  {periods.map((p, i) => (
                    <td key={i} className="border p-2 align-top" style={{ minWidth: 180 }}>
                      {renderSlot(d, i)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
