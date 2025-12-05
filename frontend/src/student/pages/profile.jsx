// src/student/pages/Profile.jsx

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ResumeTemplate from "../components/ResumeTemplate"; // same UI as faculty

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
    className: "",
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
    {
      name: "",
      issuer: "",
      year: "",
    },
  ],

  achievements: [],
};

// ----------------------------------------
// MAIN COMPONENT
// ----------------------------------------

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

  const user = JSON.parse(localStorage.getItem("user"));
  const studentId =
    localStorage.getItem("studentId") || (user && user.id) || null;

  const resumeRef = useRef(null);

  // ----------------------------------------
  // UPDATE NESTED FIELD
  // ----------------------------------------
  const updateField = (section, field, value) => {
    setStudentDetails((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // ----------------------------------------
  // ADD ITEMS IN ARRAY FIELDS
  // ----------------------------------------
  const addItem = (section, item) => {
    setStudentDetails((prev) => ({
      ...prev,
      [section]: [...prev[section], item],
    }));
  };

  const updateArrayField = (section, index, field, value) => {
    setStudentDetails((prev) => {
      const updated = Array.isArray(prev[section]) ? [...prev[section]] : [];
      if (!updated[index]) updated[index] = {};
      updated[index][field] = value;
      return { ...prev, [section]: updated };
    });
  };

  // ----------------------------------------
  // LOAD PROFILE + MERGE BASIC USER DATA
  // ----------------------------------------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!studentId || !user) {
          console.warn("No studentId or user in localStorage");
          setLoadingProfile(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/student/profile/${studentId}`
        );

        const savedProfile = res.data || {};

        const merged = {
          personalDetails: {
            fullName:
              savedProfile.personalDetails?.fullName || user.name || "",
            email:
              savedProfile.personalDetails?.email || user.email || "",
            phone: savedProfile.personalDetails?.phone || "",
            gender: savedProfile.personalDetails?.gender || "",
            dob: savedProfile.personalDetails?.dob || "",
            address: savedProfile.personalDetails?.address || "",
            profileImage: savedProfile.personalDetails?.profileImage || "",
          },

          academic: {
            ...initialStudentDetails.academic,
            ...savedProfile.academic,
            course:
              savedProfile.academic?.course ||
              "" /* course not in user model */,
            department:
              savedProfile.academic?.department || user.department || "",
            year:
              savedProfile.academic?.year ||
              (user.year ? user.year.toString() : ""),
            className:
              savedProfile.academic?.className || user.className || "",
            university:
              savedProfile.academic?.university ||
              "" /* if you add to user later, merge here */,
          },

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
        console.error("Profile load error", err);
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
        alert("studentId missing!");
        return;
      }

      setSaving(true);

      await axios.post("http://localhost:5000/api/student/profile/save", {
        studentId,
        data: studentDetails,
      });

      alert("Student profile saved!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save student profile.");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------
  // GENERATE AI RESUME
  // ----------------------------------------
  const generateResume = async () => {
    try {
      setLoadingResume(true);

      const res = await axios.post(
        "http://localhost:5000/api/resume/generate",
        {
          studentId,
          ...studentDetails,
        }
      );

      setResume(res.data.resume);
    } catch (err) {
      console.error("AI resume error:", err);
      alert("Resume generation failed.");
    } finally {
      setLoadingResume(false);
    }
  };

  // ----------------------------------------
  // DOWNLOAD DESIGNED PDF
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
      console.error("PDF error:", err);
      alert("PDF export failed.");
    }
  };

  // ----------------------------------------
  // LOADING SCREEN
  // ----------------------------------------
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading student profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Student Profile & Resume Builder
          </h1>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE FORM */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
            {/* TABS */}
            <div className="flex space-x-3 border-b pb-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold ${
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
            <div className="mt-6">
              {activeTab === "Personal Details" && (
                <PersonalDetails
                  data={studentDetails.personalDetails}
                  updateField={updateField}
                />
              )}

              {activeTab === "Academic Info" && (
                <AcademicInfo
                  data={studentDetails.academic}
                  updateField={updateField}
                />
              )}

              {activeTab === "Internships" && (
                <Internships
                  data={studentDetails.internships}
                  addItem={addItem}
                  updateArrayField={updateArrayField}
                />
              )}

              {activeTab === "Projects" && (
                <Projects
                  data={studentDetails.projects}
                  addItem={addItem}
                  updateArrayField={updateArrayField}
                />
              )}

              {activeTab === "Skills" && (
                <Skills
                  data={studentDetails.skills}
                  setStudentDetails={setStudentDetails}
                />
              )}

              {activeTab === "Certifications" && (
                <Certifications
                  data={studentDetails.certifications}
                  addItem={addItem}
                  updateArrayField={updateArrayField}
                />
              )}

              {activeTab === "Achievements" && (
                <Achievements
                  data={studentDetails.achievements}
                  setStudentDetails={setStudentDetails}
                />
              )}
            </div>
          </div>

          {/* RIGHT SIDE — RESUME PREVIEW */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Resume Preview</h2>

            {/* RAW AI TEXT PREVIEW */}
            <div className="border rounded-lg p-4 bg-gray-50 h-40 overflow-auto whitespace-pre-wrap text-xs mb-4">
              {loadingResume
                ? "Generating resume..."
                : resume || "AI Resume will appear here after generation."}
            </div>

            {/* DESIGNED RESUME TEMPLATE */}
            <div className="border rounded-lg p-3 bg-slate-100 max-h-[520px] overflow-auto">
              <ResumeTemplate
                ref={resumeRef}
                studentDetails={studentDetails}
                resume={resume}
              />
            </div>

            {/* BUTTONS */}
            <button
              onClick={generateResume}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm"
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
    </div>
  );
}

/* ----------------------------------------
   REUSABLE INPUT COMPONENT
---------------------------------------- */
function Input({ label, type = "text", value, onChange, textarea = false }) {
  return (
    <div>
      <label className="font-semibold text-gray-700">{label}</label>

      {textarea ? (
        <textarea
          className="mt-1 w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400"
          placeholder={label}
          rows={3}
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

/* ----------------------------------------
   PERSONAL DETAILS TAB
---------------------------------------- */
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

/* ----------------------------------------
   ACADEMIC INFO TAB
---------------------------------------- */
function AcademicInfo({ data, updateField }) {
  return (
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
        label="Year of Study"
        value={data.year}
        onChange={(e) => updateField("academic", "year", e.target.value)}
      />

      <Input
        label="Class / Section"
        value={data.className}
        onChange={(e) =>
          updateField("academic", "className", e.target.value)
        }
      />

      <Input
        label="CGPA"
        type="number"
        value={data.cgpa}
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

      {/* NEW 10TH DETAILS */}
      <h3 className="text-lg font-bold mt-4 col-span-2">10th Standard</h3>

      <Input
        label="10th School Name"
        value={data.tenthSchool}
        onChange={(e) =>
          updateField("academic", "tenthSchool", e.target.value)
        }
      />

      <Input
        label="10th Percentage"
        value={data.tenthPercentage}
        onChange={(e) =>
          updateField("academic", "tenthPercentage", e.target.value)
        }
      />

      <Input
        label="10th Passing Year"
        value={data.tenthYear}
        onChange={(e) =>
          updateField("academic", "tenthYear", e.target.value)
        }
      />

      {/* NEW 12TH DETAILS */}
      <h3 className="text-lg font-bold mt-6 col-span-2">12th Standard</h3>

      <Input
        label="12th School Name"
        value={data.twelfthSchool}
        onChange={(e) =>
          updateField("academic", "twelfthSchool", e.target.value)
        }
      />

      <Input
        label="12th Percentage"
        value={data.twelfthPercentage}
        onChange={(e) =>
          updateField("academic", "twelfthPercentage", e.target.value)
        }
      />

      <Input
        label="12th Passing Year"
        value={data.twelfthYear}
        onChange={(e) =>
          updateField("academic", "twelfthYear", e.target.value)
        }
      />
    </div>
  );
}

/* ----------------------------------------
   INTERNSHIPS TAB
---------------------------------------- */
function Internships({ data, addItem, updateArrayField }) {
  return (
    <div className="space-y-6">
      {data.map((intern, index) => (
        <div
          key={index}
          className="border p-4 rounded-xl bg-gray-50 space-y-3"
        >
          <Input
            label="Company"
            value={intern.company}
            onChange={(e) =>
              updateArrayField(
                "internships",
                index,
                "company",
                e.target.value
              )
            }
          />

          <Input
            label="Role"
            value={intern.role}
            onChange={(e) =>
              updateArrayField("internships", index, "role", e.target.value)
            }
          />

          <Input
            label="Duration"
            value={intern.duration}
            onChange={(e) =>
              updateArrayField(
                "internships",
                index,
                "duration",
                e.target.value
              )
            }
          />

          <Input
            label="Description"
            textarea
            value={intern.description}
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

/* ----------------------------------------
   PROJECTS TAB
---------------------------------------- */
function Projects({ data, addItem, updateArrayField }) {
  return (
    <div className="space-y-6">
      {data.map((proj, index) => (
        <div
          key={index}
          className="border p-4 rounded-xl bg-gray-50 space-y-3"
        >
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
            label="Link (GitHub/Drive)"
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

/* ----------------------------------------
   SKILLS TAB
---------------------------------------- */
function Skills({ data, setStudentDetails }) {
  const addSkill = () => {
    const skill = prompt("Enter a skill:");
    if (skill)
      setStudentDetails((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {data.map((skill, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-xl"
          >
            {skill}
          </span>
        ))}
      </div>

      <button
        onClick={addSkill}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Skill
      </button>
    </div>
  );
}

/* ----------------------------------------
   CERTIFICATIONS TAB
---------------------------------------- */
function Certifications({ data, addItem, updateArrayField }) {
  return (
    <div className="space-y-6">
      {data.map((cert, index) => (
        <div
          key={index}
          className="border p-4 rounded-xl bg-gray-50 space-y-3"
        >
          <Input
            label="Certification Name"
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
          addItem("certifications", { name: "", issuer: "", year: "" })
        }
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Certification
      </button>
    </div>
  );
}

/* ----------------------------------------
   ACHIEVEMENTS TAB
---------------------------------------- */
function Achievements({ data, setStudentDetails }) {
  const addAchievement = () => {
    const text = prompt("Enter an achievement:");
    if (text) {
      setStudentDetails((prev) => ({
        ...prev,
        achievements: [...prev.achievements, text],
      }));
    }
  };

  return (
    <div className="space-y-3">
      <ul className="list-disc pl-5">
        {data.map((ach, idx) => (
          <li key={idx}>{ach}</li>
        ))}
      </ul>

      <button
        onClick={addAchievement}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Achievement
      </button>
    </div>
  );
}
