import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ResumeTemplate from "../components/ResumeTemplate";
import { API_BASE_URL } from "../../config/api";

/* ----------------------------------------
   INITIAL STATE
---------------------------------------- */
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
  internships: [{ company: "", role: "", duration: "", description: "" }],
  projects: [{ title: "", techStack: "", description: "", link: "" }],
  skills: [],
  certifications: [{ name: "", issuer: "", year: "" }],
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

  const studentId = localStorage.getItem("studentId");
  const resumeRef = useRef(null);

  const [activeTab, setActiveTab] = useState("Personal Details");
  const [studentDetails, setStudentDetails] = useState(initialStudentDetails);

  const [resume, setResume] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const [skillInput, setSkillInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");

  /* ----------------------------------------
     CLEAN AI TEXT
  ---------------------------------------- */
  const cleanResumeText = (text) =>
    text
      ?.replace(/```json[\s\S]*?```/g, "")
      .replace(/\{[\s\S]*?\}/g, "")
      .replace(/Here is[\s\S]*?:/gi, "")
      .replace(/PREMIUM\+ RESUME RULES[\s\S]*/gi, "")
      .replace(/====[\s\S]*/g, "")
      .trim() || "";

  /* ----------------------------------------
     LOAD PROFILE
  ---------------------------------------- */
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/student/profile/${studentId}`
        );

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const saved = res.data || {};

        setStudentDetails({
          personalDetails: {
            fullName: saved.personalDetails?.fullName || user.name || "",
            email: saved.personalDetails?.email || user.email || "",
            phone: saved.personalDetails?.phone || "",
            dob: saved.personalDetails?.dob || "",
            gender: saved.personalDetails?.gender || "",
            address: saved.personalDetails?.address || "",
            profileImage: saved.personalDetails?.profileImage || "",
          },
          academic: saved.academic || initialStudentDetails.academic,
          internships: saved.internships || initialStudentDetails.internships,
          projects: saved.projects || initialStudentDetails.projects,
          skills: saved.skills || [],
          certifications:
            saved.certifications || initialStudentDetails.certifications,
          achievements: saved.achievements || [],
        });
      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    if (studentId) loadProfile();
  }, [studentId]);

  /* ----------------------------------------
     SAVE PROFILE
  ---------------------------------------- */
  const saveProfile = async () => {
    try {
      setSaving(true);
      await axios.post(`${API_BASE_URL}/api/student/profile/save`, {
        studentId,
        data: studentDetails,
      });
      alert("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------------------
     GENERATE RESUME
  ---------------------------------------- */
  const generateResume = async () => {
    try {
      setLoadingResume(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/resume/generate`,
        { studentId, ...studentDetails }
      );
      setResume(cleanResumeText(res.data.resume));
    } catch (err) {
      console.error(err);
      alert("AI Resume generation failed");
    } finally {
      setLoadingResume(false);
    }
  };

  /* ----------------------------------------
     PDF EXPORT
  ---------------------------------------- */
  const downloadDesignedPDF = async () => {
    const canvas = await html2canvas(resumeRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;

    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save("student_resume.pdf");
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading student profile...
      </div>
    );
  }

  /* ----------------------------------------
     MAIN UI
  ---------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h1 className="text-3xl font-bold">
            Student Profile & Resume Builder
          </h1>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-2xl shadow p-4">
          {/* TABS */}
          <div className="flex gap-2 border-b pb-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-200"
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
                update={(f, v) =>
                  setStudentDetails((p) => ({
                    ...p,
                    personalDetails: { ...p.personalDetails, [f]: v },
                  }))
                }
              />
            )}

            {activeTab === "Academic Info" && (
              <AcademicInfo
                data={studentDetails.academic}
                update={(f, v) =>
                  setStudentDetails((p) => ({
                    ...p,
                    academic: { ...p.academic, [f]: v },
                  }))
                }
              />
            )}
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <button
          onClick={() => {
            setShowResumeModal(true);
            setResume("");
            generateResume();
          }}
          className="mt-4 w-full bg-purple-600 text-white py-4 rounded-xl text-lg"
        >
          Generate Resume Preview
        </button>
      </div>

      {/* RESUME MODAL */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl">
            <button
              onClick={() => setShowResumeModal(false)}
              className="float-right text-2xl"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">Resume Preview</h2>

            {loadingResume ? (
              <div className="animate-pulse h-40 bg-gray-200 rounded"></div>
            ) : (
              <>
                <div ref={resumeRef}>
                  <ResumeTemplate
                    studentDetails={studentDetails}
                    resume={resume}
                  />
                </div>

                <button
                  onClick={downloadDesignedPDF}
                  className="mt-4 w-full bg-green-600 text-white py-3 rounded-xl"
                >
                  Download PDF
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- INPUT ---------------- */
function Input({ label, value, onChange, type = "text", textarea }) {
  return (
    <div>
      <label className="font-semibold">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          className="w-full p-3 border rounded"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full p-3 border rounded"
        />
      )}
    </div>
  );
}

/* ---------------- PERSONAL ---------------- */
function PersonalDetails({ data, update }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Input label="Full Name" value={data.fullName} onChange={(e)=>update("fullName",e.target.value)} />
      <Input label="Email" value={data.email} onChange={(e)=>update("email",e.target.value)} />
      <Input label="Phone" value={data.phone} onChange={(e)=>update("phone",e.target.value)} />
      <Input label="DOB" type="date" value={data.dob} onChange={(e)=>update("dob",e.target.value)} />
      <Input label="Gender" value={data.gender} onChange={(e)=>update("gender",e.target.value)} />
      <Input label="Address" textarea value={data.address} onChange={(e)=>update("address",e.target.value)} />
    </div>
  );
}

/* ---------------- ACADEMIC ---------------- */
function AcademicInfo({ data, update }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Input label="Course" value={data.course} onChange={(e)=>update("course",e.target.value)} />
      <Input label="Department" value={data.department} onChange={(e)=>update("department",e.target.value)} />
      <Input label="Year" value={data.year} onChange={(e)=>update("year",e.target.value)} />
      <Input label="CGPA" value={data.cgpa} onChange={(e)=>update("cgpa",e.target.value)} />
    </div>
  );
}
