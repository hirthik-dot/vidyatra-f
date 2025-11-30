import { useState } from "react";

export default function CommunicationFaculty() {
  /* ---------------- NAV BAR ---------------- */
  const [activePanel, setActivePanel] = useState("broadcast");

  /* ---------------- BROADCAST PANEL ---------------- */
  const [broadcastList, setBroadcastList] = useState([
    { sender: "teacher", text: "Welcome students!" },
  ]);
  const [broadcastInput, setBroadcastInput] = useState("");

  const sendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;
    setBroadcastList([...broadcastList, { sender: "teacher", text: broadcastInput }]);
    setBroadcastInput("");
  };

  /* ---------------- INDIVIDUAL PANEL ---------------- */
  const [students, setStudents] = useState([
    { reg: "101", name: "Rohit", dept: "CSE", section: "A", online: true },
    { reg: "102", name: "Meera", dept: "ECE", section: "B", online: false },
  ]);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [individualChats, setIndividualChats] = useState({
    Rohit: [{ sender: "student", text: "Sir I need help." }],
    Meera: [],
  });
  const [individualInput, setIndividualInput] = useState("");

  /* Toggle select student */
  const toggleStudentSelect = (name) => {
    setSelectedStudents((prev) =>
      prev.includes(name)
        ? prev.filter((s) => s !== name)
        : [...prev, name]
    );
  };

  /* Send message to selected students */
  const sendIndividual = (e) => {
    e.preventDefault();
    if (!individualInput.trim() || selectedStudents.length === 0) return;

    const updatedChats = { ...individualChats };
    selectedStudents.forEach((name) => {
      updatedChats[name] = [
        ...(updatedChats[name] || []),
        { sender: "teacher", text: individualInput },
      ];
    });

    setIndividualChats(updatedChats);
    setIndividualInput("");
  };

  /* ----------- ADD STUDENT ----------- */
  const [newReg, setNewReg] = useState("");
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("CSE");
  const [newSection, setNewSection] = useState("A");

  const addStudent = () => {
    if (!newReg.trim() || !newName.trim()) return;

    const newStudent = {
      reg: newReg,
      name: newName,
      dept: newDept,
      section: newSection,
      online: false,
    };

    setStudents([...students, newStudent]);
    setIndividualChats({ ...individualChats, [newName]: [] });

    setNewReg("");
    setNewName("");
    setNewDept("CSE");
    setNewSection("A");
  };

  /* ----------- DELETE STUDENT ----------- */
  const deleteStudent = (reg, name) => {
    setStudents(students.filter((s) => s.reg !== reg));
    const updatedChats = { ...individualChats };
    delete updatedChats[name];
    setIndividualChats(updatedChats);
    setSelectedStudents(selectedStudents.filter((s) => s !== name));
  };

  /* ----------- ONLINE / OFFLINE TOGGLE ----------- */
  const toggleOnline = (reg) => {
    setStudents(
      students.map((s) => (s.reg === reg ? { ...s, online: !s.online } : s))
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* ---------------- NAVIGATION BAR ---------------- */}
      <div className="flex gap-4 border-b pb-3">
        <button
          onClick={() => setActivePanel("broadcast")}
          className={`px-4 py-2 rounded-lg ${
            activePanel === "broadcast" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Broadcast Messages
        </button>
        <button
          onClick={() => setActivePanel("individual")}
          className={`px-4 py-2 rounded-lg ${
            activePanel === "individual" ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}
        >
          Individual Messages
        </button>
      </div>

      {/* ---------------- BROADCAST PANEL ---------------- */}
      {activePanel === "broadcast" && (
        <div>
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Broadcast Message Panel
          </h2>
          <div className="bg-white p-6 rounded-xl shadow h-[450px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3">
              {broadcastList.map((b, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-blue-500 text-white max-w-xs"
                >
                  {b.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendBroadcast} className="flex gap-2 mt-4">
              <input
                value={broadcastInput}
                onChange={(e) => setBroadcastInput(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Broadcast to all students..."
              />
              <button className="bg-blue-600 text-white px-4 rounded-lg">Send</button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- INDIVIDUAL PANEL ---------------- */}
      {activePanel === "individual" && (
        <div>
          <h2 className="text-2xl font-bold text-purple-700 mb-4">
            Individual Message Panel
          </h2>

          <div className="grid grid-cols-4 gap-4 h-[500px]">
            {/* STUDENT LIST + ADD */}
            <div className="bg-gray-100 p-4 rounded-xl shadow">
              <h3 className="font-semibold text-lg mb-3">Students</h3>

              {/* Add Student */}
               <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option>CSE</option>
                  <option>ECE</option>
                  <option>EEE</option>
                  <option>MECH</option>
                </select>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                </select>
              <div className="space-y-2 mb-4">
                <input
                  value={newReg}
                  onChange={(e) => setNewReg(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Register Number"
                />
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Student Name"
                />
               
                <button
                  onClick={addStudent}
                  className="w-full bg-green-600 text-white p-2 rounded-lg"
                >
                  Add Student
                </button>
              </div>

              {/* Student List with Multi-Select */}
              {students.map((s) => (
                <div key={s.reg} className="mb-2 p-2 rounded-lg bg-white shadow">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(s.name)}
                      onChange={() => toggleStudentSelect(s.name)}
                    />
                    <div>
                      <span className="font-medium">{s.reg} - {s.name}</span><br />
                      <span className="text-sm text-gray-600">{s.dept} • Section {s.section}</span>
                    </div>
                    {/* Online indicator */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOnline(s.reg);
                      }}
                      className={`inline-block w-3 h-3 rounded-full ml-auto cursor-pointer ${
                        s.online ? "bg-green-500" : "bg-red-500"
                      }`}
                      title={s.online ? "Online — click to set offline" : "Offline — click to set online"}
                    ></span>
                  </label>
                  <button
                    onClick={() => deleteStudent(s.reg, s.name)}
                    className="text-xs text-red-600 underline mt-1"
                  >
                    Remove student
                  </button>
                </div>
              ))}
            </div>

            {/* CHAT WINDOW */}
            <div className="col-span-3 bg-white p-5 rounded-xl shadow flex flex-col">
              {selectedStudents.length === 0 ? (
                <p className="text-gray-500 text-center mt-20">
                  Select students to start chatting
                </p>
              ) : (
                <>
                  {/* Show chat of first selected student */}
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {(individualChats[selectedStudents[0]] || []).map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg max-w-xs ${
                          msg.sender === "teacher"
                            ? "ml-auto bg-purple-600 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={sendIndividual} className="flex gap-2 mt-4">
                    <input
                      value={individualInput}
                      onChange={(e) => setIndividualInput(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      placeholder={`Message ${selectedStudents[0]}${selectedStudents.length > 1 ? ` & ${selectedStudents.length - 1} others` : ""}...`}
                    />
                    <button className="bg-purple-600 text-white px-4 rounded-lg">Send</button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
