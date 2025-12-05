import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ResumeTemplate from "../components/ResumeTemplate";

// ----------------------------------------
// INITIAL STATE
// ----------------------------------------
const initialStudentDetails = {
  personalDetails: {
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    profileImage: "",
  },

  academic: {
    course: "",
    department: "",
    year: "",
    cgpa: "",
    backlogs: "",
    university: "",
    tenthSchool: "",
    tenthPercentage: "",
    tenthYear: "",
    twelfthSchool: "",
    twelfthPercentage: "",
    twelfthYear: "",
  },

  internships: [
    {
      company: "",
      role: "",
      duration: "",
      description: "",
    },
  ],

  projects: [
    {
      title: "",
      techStack: "",
      description: "",
      link: "",
    },
  ],

  skills: [],
  certifications: [
    { name: "", issuer: "", year: "" },
  ],
  achievements: [],
};

export default function StudentProfile() {
  const tabs = [
    "Personal Details",
    "Academic Info",
    "Internships",
    "Projects",
    "Skills",
    "Certifications",
    "Achievements",
  ];

  const [activeTab, setActiveTab] = useState("Personal Details");
  const [studentDetails, setStudentDetails] = useState(initialStudentDetails);

  const [resume, setResume] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const studentId = localStorage.getItem("studentId");
  const resumeRef = useRef(null);

  // ------------------ MODALS -------------------
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  const [skillInput, setSkillInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() === "") return;
    setStudentDetails((prev) => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()],
    }));
    setSkillInput("");
    setShowSkillModal(false);
  };

  const addAchievement = () => {
    if (achievementInput.trim() === "") return;
    setStudentDetails((prev) => ({
      ...prev,
      achievements: [...prev.achievements, achievementInput.trim()],
    }));
    setAchievementInput("");
    setShowAchievementModal(false);
  };

  // ----------------------------------------
  // FETCH PROFILE
  // ----------------------------------------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!studentId) {
          console.warn("No studentId found");
          setLoadingProfile(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/student/profile/${studentId}`
        );

        const savedProfile = res.data || {};
        const user = JSON.parse(localStorage.getItem("user"));

        const merged = {
          personalDetails: {
            fullName:
              savedProfile.personalDetails?.fullName || user?.name || "",
            email:
              savedProfile.personalDetails?.email || user?.email || "",
            phone: savedProfile.personalDetails?.phone || "",
            dob: savedProfile.personalDetails?.dob || "",
            gender: savedProfile.personalDetails?.gender || "",
            address: savedProfile.personalDetails?.address || "",
            profileImage: savedProfile.personalDetails?.profileImage || "",
          },

          academic: savedProfile.academic || initialStudentDetails.academic,
          internships:
            savedProfile.internships || initialStudentDetails.internships,
          projects: savedProfile.projects || initialStudentDetails.projects,
          skills: savedProfile.skills || [],
          certifications:
            savedProfile.certifications ||
            initialStudentDetails.certifications,
          achievements: savedProfile.achievements || [],
        };

        setStudentDetails(merged);
      } catch (err) {
        console.error("Failed loading student profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [studentId]);

  // ----------------------------------------
  // SAVE PROFILE
  // ----------------------------------------
  const saveProfile = async () => {
    try {
      if (!studentId) {
        alert("studentId missing in localStorage");
        return;
      }

      setSaving(true);

      await axios.post("http://localhost:5000/api/student/profile/save", {
        studentId,
        data: studentDetails,
      });

      alert("Student profile saved!");
    } catch (err) {
      console.error("Error saving", err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------
  // GENERATE RESUME
  // ----------------------------------------
  const generateResume = async () => {
    try {
      setLoadingResume(true);
      const res = await axios.post(
        "http://localhost:5000/api/resume/generate",
        { studentId, ...studentDetails }
      );

      setResume(res.data.resume);
    } catch (err) {
      console.error("Resume generation failed", err);
      alert("AI Failed");
    } finally {
      setLoadingResume(false);
    }
  };

  // ----------------------------------------
  // PDF EXPORT
  // ----------------------------------------
  const downloadDesignedPDF = async () => {
    if (!resumeRef.current) {
      alert("Generate resume first!");
      return;
    }

    try {
      const canvas = await html2canvas(resumeRef.current, { scale: 2 });
      const img = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(img, "PNG", 0, 0, width, height);
      pdf.save("student_resume.pdf");
    } catch (err) {
      console.error("PDF ERROR", err);
      alert("PDF export failed");
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading student profile...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-[1600px] mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Student Profile & Resume Builder
          </h1>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* MAIN LAYOUT — 50% LEFT (form) | 50% RIGHT (resume) */}
        <div className="flex gap-4">

          {/* LEFT PANEL — FORM */}
          <div className="w-1/2 bg-white rounded-xl shadow-xl p-4 overflow-y-auto max-h-[88vh]">

            {/* TABS */}
            <div className="flex space-x-2 border-b pb-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-md text-sm font-semibold whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="mt-4">
              {activeTab === "Personal Details" && (
                <PersonalDetails
                  data={studentDetails.personalDetails}
                  updateField={(s, f, v) =>
                    setStudentDetails((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, [f]: v },
                    }))
                  }
                />
              )}

              {activeTab === "Academic Info" && (
                <AcademicInfo
                  data={studentDetails.academic}
                  updateField={(section, field, value) =>
                    setStudentDetails((prev) => ({
                      ...prev,
                      academic: { ...prev.academic, [field]: value },
                    }))
                  }
                />
              )}

              {activeTab === "Internships" && (
                <Internships
                  data={studentDetails.internships}
                  addItem={(section, item) =>
                    setStudentDetails((prev) => ({
                      ...prev,
                      internships: [...prev.internships, item],
                    }))
                  }
                  updateArrayField={(section, index, field, value) => {
                    const copy = [...studentDetails.internships];
                    copy[index][field] = value;
                    setStudentDetails((prev) => ({
                      ...prev,
                      internships: copy,
                    }));
                  }}
                />
              )}

              {activeTab === "Projects" && (
                <Projects
                  data={studentDetails.projects}
                  addItem={(section, item) =>
                    setStudentDetails((prev) => ({
                      ...prev,
                      projects: [...prev.projects, item],
                    }))
                  }
                  updateArrayField={(section, index, field, value) => {
                    const copy = [...studentDetails.projects];
                    copy[index][field] = value;
                    setStudentDetails((prev) => ({
                      ...prev,
                      projects: copy,
                    }));
                  }}
                />
              )}

              {/* SKILLS TAB WITH NEW MODAL */}
              {activeTab === "Skills" && (
                <Skills
                  data={studentDetails.skills}
                  openModal={() => setShowSkillModal(true)}
                />
              )}

              {/* CERTIFICATIONS */}
              {activeTab === "Certifications" && (
                <Certifications
                  data={studentDetails.certifications}
                  addItem={(section, item) =>
                    setStudentDetails((prev) => ({
                      ...prev,
                      certifications: [...prev.certifications, item],
                    }))
                  }
                  updateArrayField={(section, index, field, value) => {
                    const copy = [...studentDetails.certifications];
                    copy[index][field] = value;
                    setStudentDetails((prev) => ({
                      ...prev,
                      certifications: copy,
                    }));
                  }}
                />
              )}

              {/* ACHIEVEMENTS TAB WITH NEW MODAL */}
              {activeTab === "Achievements" && (
                <Achievements
                  data={studentDetails.achievements}
                  openModal={() => setShowAchievementModal(true)}
                />
              )}
            </div>
          </div>

          {/* RIGHT PANEL — FULL WIDTH RESUME PREVIEW */}
          <div className="w-1/2 bg-white rounded-xl shadow-xl p-4 overflow-y-auto overflow-x-auto max-h-[88vh]">

            <h2 className="text-xl font-semibold mb-2">Resume Preview</h2>

            {/* SMALL AI TEXT PREVIEW */}
            <div className="border rounded-lg p-2 bg-gray-50 h-28 overflow-auto whitespace-pre-wrap text-xs mb-2">
              {loadingResume
                ? "Generating resume..."
                : resume || "AI Resume will appear here after generation."}
            </div>

            {/* FULL WIDTH SCROLLABLE RESUME CANVAS */}
            <div className="border rounded-lg bg-slate-100 p-3 overflow-auto w-full min-w-[900px] max-w-[900px] mx-auto">
              <ResumeTemplate ref={resumeRef} studentDetails={studentDetails} resume={resume} />
            </div>

            <button
              onClick={generateResume}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm"
            >
              Generate AI Resume
            </button>

            <button
              onClick={downloadDesignedPDF}
              className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold text-sm"
            >
              Download Designed Resume PDF
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------- SKILL MODAL ---------------------- */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-6 rounded-2xl shadow-2xl animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Add Skill</h2>

            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Enter skill"
              className="w-full border rounded-xl p-3 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSkillModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addSkill}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------- ACHIEVEMENT MODAL ---------------------- */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-6 rounded-2xl shadow-2xl animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Add Achievement</h2>

            <input
              type="text"
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              placeholder="Enter achievement"
              className="w-full border rounded-xl p-3 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAchievementModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addAchievement}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/* ---------------------------- INPUT COMPONENT ---------------------------- */
function Input({ label, type = "text", value, onChange, textarea = false }) {
  return (
    <div>
      <label className="font-semibold text-gray-700">{label}</label>

      {textarea ? (
        <textarea
          className="mt-1 w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400"
          rows={3}
          placeholder={label}
          value={value || ""}
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          className="mt-1 w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400"
          placeholder={label}
          value={value || ""}
          onChange={onChange}
        />
      )}
    </div>
  );
}

/* ---------------------------- PERSONAL DETAILS TAB ---------------------------- */
function PersonalDetails({ data, updateField }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <Input
        label="Full Name"
        value={data.fullName}
        onChange={(e) =>
          updateField("personalDetails", "fullName", e.target.value)
        }
      />

      <Input
        label="Email"
        value={data.email}
        onChange={(e) =>
          updateField("personalDetails", "email", e.target.value)
        }
      />

      <Input
        label="Phone"
        value={data.phone}
        onChange={(e) =>
          updateField("personalDetails", "phone", e.target.value)
        }
      />

      <Input
        label="Gender"
        value={data.gender}
        onChange={(e) =>
          updateField("personalDetails", "gender", e.target.value)
        }
      />

      <Input
        label="Date of Birth"
        type="date"
        value={data.dob}
        onChange={(e) =>
          updateField("personalDetails", "dob", e.target.value)
        }
      />

      <Input
        label="Address"
        textarea
        value={data.address}
        onChange={(e) =>
          updateField("personalDetails", "address", e.target.value)
        }
      />

      <Input
        label="Profile Image URL"
        value={data.profileImage}
        onChange={(e) =>
          updateField("personalDetails", "profileImage", e.target.value)
        }
      />
    </div>
  );
}

/* ---------------------------- ACADEMIC INFO TAB ---------------------------- */
function AcademicInfo({ data, updateField }) {
  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Course"
          value={data.course}
          onChange={(e) => updateField("academic", "course", e.target.value)}
        />

        <Input
          label="Department"
          value={data.department}
          onChange={(e) =>
            updateField("academic", "department", e.target.value)
          }
        />

        <Input
          label="Year"
          value={data.year}
          onChange={(e) => updateField("academic", "year", e.target.value)}
        />

        <Input
          label="CGPA"
          value={data.cgpa}
          type="number"
          onChange={(e) => updateField("academic", "cgpa", e.target.value)}
        />

        <Input
          label="Backlogs"
          type="number"
          value={data.backlogs}
          onChange={(e) => updateField("academic", "backlogs", e.target.value)}
        />

        <Input
          label="University"
          value={data.university}
          onChange={(e) =>
            updateField("academic", "university", e.target.value)
          }
        />
      </div>

      {/* 10th Details */}
      <h3 className="text-lg font-bold mt-6">10th Standard</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="School Name"
          value={data.tenthSchool}
          onChange={(e) =>
            updateField("academic", "tenthSchool", e.target.value)
          }
        />
        <Input
          label="Percentage"
          value={data.tenthPercentage}
          onChange={(e) =>
            updateField("academic", "tenthPercentage", e.target.value)
          }
        />
        <Input
          label="Passing Year"
          value={data.tenthYear}
          onChange={(e) =>
            updateField("academic", "tenthYear", e.target.value)
          }
        />
      </div>

      {/* 12th Details */}
      <h3 className="text-lg font-bold mt-6">12th Standard</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="School Name"
          value={data.twelfthSchool}
          onChange={(e) =>
            updateField("academic", "twelfthSchool", e.target.value)
          }
        />
        <Input
          label="Percentage"
          value={data.twelfthPercentage}
          onChange={(e) =>
            updateField("academic", "twelfthPercentage", e.target.value)
          }
        />
        <Input
          label="Passing Year"
          value={data.twelfthYear}
          onChange={(e) =>
            updateField("academic", "twelfthYear", e.target.value)
          }
        />
      </div>
    </div>
  );
}

/* ---------------------------- INTERNSHIPS TAB ---------------------------- */
function Internships({ data, addItem, updateArrayField }) {
  return (
    <div className="space-y-6">
      {data.map((item, index) => (
        <div key={index} className="border p-4 rounded-xl bg-gray-50 space-y-3">

          <Input
            label="Company"
            value={item.company}
            onChange={(e) =>
              updateArrayField("internships", index, "company", e.target.value)
            }
          />

          <Input
            label="Role"
            value={item.role}
            onChange={(e) =>
              updateArrayField("internships", index, "role", e.target.value)
            }
          />

          <Input
            label="Duration"
            value={item.duration}
            onChange={(e) =>
              updateArrayField("internships", index, "duration", e.target.value)
            }
          />

          <Input
            label="Description"
            textarea
            value={item.description}
            onChange={(e) =>
              updateArrayField(
                "internships",
                index,
                "description",
                e.target.value
              )
            }
          />
        </div>
      ))}

      <button
        onClick={() =>
          addItem("internships", {
            company: "",
            role: "",
            duration: "",
            description: "",
          })
        }
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Internship
      </button>
    </div>
  );
}

/* ---------------------------- PROJECTS TAB ---------------------------- */
function Projects({ data, addItem, updateArrayField }) {
  return (
    <div className="space-y-6">

      {data.map((proj, index) => (
        <div key={index} className="border p-4 rounded-xl bg-gray-50 space-y-3">

          <Input
            label="Project Title"
            value={proj.title}
            onChange={(e) =>
              updateArrayField("projects", index, "title", e.target.value)
            }
          />

          <Input
            label="Tech Stack"
            value={proj.techStack}
            onChange={(e) =>
              updateArrayField("projects", index, "techStack", e.target.value)
            }
          />

          <Input
            label="Description"
            textarea
            value={proj.description}
            onChange={(e) =>
              updateArrayField(
                "projects",
                index,
                "description",
                e.target.value
              )
            }
          />

          <Input
            label="Project Link (GitHub / Drive)"
            value={proj.link}
            onChange={(e) =>
              updateArrayField("projects", index, "link", e.target.value)
            }
          />
        </div>
      ))}

      <button
        onClick={() =>
          addItem("projects", {
            title: "",
            techStack: "",
            description: "",
            link: "",
          })
        }
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Project
      </button>
    </div>
  );
}

/* ---------------------------- SKILLS TAB (uses modal) ---------------------------- */
function Skills({ data, openModal }) {
  return (
    <div className="space-y-3">

      <div className="flex flex-wrap gap-2">
        {data.map((skill, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-xl text-sm"
          >
            {skill}
          </span>
        ))}
      </div>

      <button
        onClick={openModal}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Skill
      </button>
    </div>
  );
}

/* ---------------------------- CERTIFICATIONS TAB ---------------------------- */
function Certifications({ data, addItem, updateArrayField }) {
  return (
    <div className="space-y-6">

      {data.map((cert, index) => (
        <div key={index} className="border p-4 rounded-xl bg-gray-50 space-y-3">

          <Input
            label="Certificate Name"
            value={cert.name}
            onChange={(e) =>
              updateArrayField("certifications", index, "name", e.target.value)
            }
          />

          <Input
            label="Issued By"
            value={cert.issuer}
            onChange={(e) =>
              updateArrayField(
                "certifications",
                index,
                "issuer",
                e.target.value
              )
            }
          />

          <Input
            label="Year"
            value={cert.year}
            onChange={(e) =>
              updateArrayField("certifications", index, "year", e.target.value)
            }
          />
        </div>
      ))}

      <button
        onClick={() =>
          addItem("certifications", {
            name: "",
            issuer: "",
            year: "",
          })
        }
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Certification
      </button>
    </div>
  );
}

/* ---------------------------- ACHIEVEMENTS TAB (uses modal) ---------------------------- */
function Achievements({ data, openModal }) {
  return (
    <div className="space-y-3">

      <ul className="list-disc pl-5">
        {data.map((item, i) => (
          <li key={i} className="text-gray-700 text-sm">
            {item}
          </li>
        ))}
      </ul>

      <button
        onClick={openModal}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Achievement
      </button>
    </div>
  );
}
