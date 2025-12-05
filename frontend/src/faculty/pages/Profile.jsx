// src/faculty/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ResumeTemplate from "../components/ResumeTemplate";

// ---------------- INITIAL STATE ----------------
const initialFacultyDetails = {
  personalDetails: {
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    country: "",
    state: "",
    university: "",
    profileImage: "",
  },
  education: {
    highestQualification: "",
    specialization: "",
    certificateLink: "",
  },
  experience: {
    currentPosition: "",
    yearsOfExperience: "",
    pastRoles: "",
  },
  publications: {
    orcid: "",
    scholarId: "",
    scopusId: "",
    researchGate: "",
  },
  roles: {
    adminRoles: "",
    responsibilities: "",
  },
  achievements: {
    awards: "",
    fundedProjects: "",
    certifications: "",
  },
};

export default function FacultyProfile() {
  const tabs = [
    "Personal Details",
    "Bio / Education",
    "Experience",
    "Publications",
    "Current Roles",
    "Achievements",
  ];

  const [activeTab, setActiveTab] = useState("Personal Details");
  const [facultyDetails, setFacultyDetails] = useState(initialFacultyDetails);
  const [resume, setResume] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const facultyId = localStorage.getItem("facultyId");
  const resumeRef = useRef(null);

  // ---------- Update Field ----------
  const updateField = (section, field, value) => {
    setFacultyDetails((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // ---------- Load Profile + Merge ----------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!facultyId) {
          console.warn("facultyId missing");
          setLoadingProfile(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/faculty/profile/${facultyId}`
        );

        const savedProfile = res.data || {};
        const user = JSON.parse(localStorage.getItem("user"));

        const merged = {
          personalDetails: {
            fullName:
              savedProfile.personalDetails?.fullName || user?.name || "",
            email: savedProfile.personalDetails?.email || user?.email || "",
            phone: savedProfile.personalDetails?.phone || "",
            gender: savedProfile.personalDetails?.gender || "",
            dob: savedProfile.personalDetails?.dob || "",
            country: savedProfile.personalDetails?.country || "",
            state: savedProfile.personalDetails?.state || "",
            university: savedProfile.personalDetails?.university || "",
            profileImage: savedProfile.personalDetails?.profileImage || "",
          },
          education: savedProfile.education || initialFacultyDetails.education,
          experience:
            savedProfile.experience || initialFacultyDetails.experience,
          publications:
            savedProfile.publications || initialFacultyDetails.publications,
          roles: savedProfile.roles || initialFacultyDetails.roles,
          achievements:
            savedProfile.achievements || initialFacultyDetails.achievements,
        };

        setFacultyDetails(merged);
      } catch (err) {
        console.error("Profile load error", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [facultyId]);

  // ---------- Save Profile ----------
  const saveProfile = async () => {
    try {
      if (!facultyId) return alert("facultyId missing");

      setSaving(true);

      await axios.post("http://localhost:5000/api/faculty/profile/save", {
        facultyId,
        data: facultyDetails,
      });

      alert("Profile saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Generate Resume ----------
  const generateResume = async () => {
    try {
      setLoadingResume(true);

      const res = await axios.post(
        "http://localhost:5000/api/resume/generate",
        { facultyId, ...facultyDetails }
      );

      setResume(res.data.resume);
    } catch (err) {
      console.error(err);
      alert("Failed to generate resume");
    } finally {
      setLoadingResume(false);
    }
  };

  // ---------- PDF Export ----------
  const downloadDesignedPDF = async () => {
    try {
      if (!resumeRef.current) return alert("Generate resume first!");

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
      });

      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(img, "PNG", 0, 0, width, height);
      pdf.save("faculty_resume.pdf");
    } catch (err) {
      console.error(err);
      alert("PDF export failed");
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  // ----------------------------------------------------
  // UI STARTS HERE — Fixed 50/50 layout
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Faculty Profile & Resume Builder</h1>

          <button
            onClick={saveProfile}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* 50% FORM — 50% RESUME */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT SIDE FORM */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex space-x-3 border-b pb-3 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-semibold rounded-md ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {activeTab === "Personal Details" && (
                <PersonalDetails
                  data={facultyDetails.personalDetails}
                  updateField={updateField}
                />
              )}

              {activeTab === "Bio / Education" && (
                <Education
                  data={facultyDetails.education}
                  updateField={updateField}
                />
              )}

              {activeTab === "Experience" && (
                <Experience
                  data={facultyDetails.experience}
                  updateField={updateField}
                />
              )}

              {activeTab === "Publications" && (
                <Publications
                  data={facultyDetails.publications}
                  updateField={updateField}
                />
              )}

              {activeTab === "Current Roles" && (
                <Roles
                  data={facultyDetails.roles}
                  updateField={updateField}
                />
              )}

              {activeTab === "Achievements" && (
                <Achievements
                  data={facultyDetails.achievements}
                  updateField={updateField}
                />
              )}
            </div>
          </div>

          {/* RIGHT — FULL WIDTH RESUME PREVIEW */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-3">Resume Preview</h2>

            {/* AI Raw Text */}
            <div className="border rounded-lg p-3 bg-gray-50 h-40 overflow-auto text-xs whitespace-pre-wrap mb-4">
              {loadingResume ? "Generating..." : resume || "AI Resume will appear here."}
            </div>

            {/* FULL WIDTH DESIGNED RESUME */}
            <div className="border rounded-lg bg-slate-100 h-[82vh] overflow-y-auto overflow-x-hidden p-4">
              <div className="w-full" ref={resumeRef}>
                <ResumeTemplate
                  facultyDetails={facultyDetails}
                  resume={resume}
                />
              </div>
            </div>

            <button
              onClick={generateResume}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
            >
              Generate AI Resume
            </button>

            <button
              onClick={downloadDesignedPDF}
              className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
            >
              Download Designed Resume PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- INPUT ----------------
function Input({ label, type = "text", value, onChange, textarea = false }) {
  return (
    <div>
      <label className="font-semibold">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          className="mt-1 w-full border rounded-xl p-3"
          value={value || ""}
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          className="mt-1 w-full border rounded-xl p-3"
          value={value || ""}
          onChange={onChange}
        />
      )}
    </div>
  );
}

// ---------------- FORM SECTIONS ----------------

function PersonalDetails({ data, updateField }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Full Name" value={data.fullName} onChange={(e) => updateField("personalDetails", "fullName", e.target.value)} />
      <Input label="Email" value={data.email} onChange={(e) => updateField("personalDetails", "email", e.target.value)} />
      <Input label="Phone" value={data.phone} onChange={(e) => updateField("personalDetails", "phone", e.target.value)} />
      <Input label="Gender" value={data.gender} onChange={(e) => updateField("personalDetails", "gender", e.target.value)} />
      <Input label="Date of Birth" type="date" value={data.dob} onChange={(e) => updateField("personalDetails", "dob", e.target.value)} />
      <Input label="Country" value={data.country} onChange={(e) => updateField("personalDetails", "country", e.target.value)} />
      <Input label="State" value={data.state} onChange={(e) => updateField("personalDetails", "state", e.target.value)} />
      <Input label="University" value={data.university} onChange={(e) => updateField("personalDetails", "university", e.target.value)} />
      <Input label="Profile Image URL" value={data.profileImage} onChange={(e) => updateField("personalDetails", "profileImage", e.target.value)} />
    </div>
  );
}

function Education({ data, updateField }) {
  return (
    <div className="space-y-4">
      <Input label="Highest Qualification" value={data.highestQualification} onChange={(e) => updateField("education", "highestQualification", e.target.value)} />
      <Input label="Specialization" value={data.specialization} onChange={(e) => updateField("education", "specialization", e.target.value)} />
      <Input label="Certificate Link" value={data.certificateLink} onChange={(e) => updateField("education", "certificateLink", e.target.value)} />
    </div>
  );
}

function Experience({ data, updateField }) {
  return (
    <div className="space-y-4">
      <Input label="Current Position" value={data.currentPosition} onChange={(e) => updateField("experience", "currentPosition", e.target.value)} />
      <Input label="Years of Experience" value={data.yearsOfExperience} type="number" onChange={(e) => updateField("experience", "yearsOfExperience", e.target.value)} />
      <Input label="Past Roles" textarea value={data.pastRoles} onChange={(e) => updateField("experience", "pastRoles", e.target.value)} />
    </div>
  );
}

function Publications({ data, updateField }) {
  return (
    <div className="space-y-4">
      <Input label="ORCID" value={data.orcid} onChange={(e) => updateField("publications", "orcid", e.target.value)} />
      <Input label="Google Scholar ID" value={data.scholarId} onChange={(e) => updateField("publications", "scholarId", e.target.value)} />
      <Input label="Scopus ID" value={data.scopusId} onChange={(e) => updateField("publications", "scopusId", e.target.value)} />
      <Input label="ResearchGate" value={data.researchGate} onChange={(e) => updateField("publications", "researchGate", e.target.value)} />
    </div>
  );
}

function Roles({ data, updateField }) {
  return (
    <div className="space-y-4">
      <Input label="Administrative Roles" textarea value={data.adminRoles} onChange={(e) => updateField("roles", "adminRoles", e.target.value)} />
      <Input label="Responsibilities" textarea value={data.responsibilities} onChange={(e) => updateField("roles", "responsibilities", e.target.value)} />
    </div>
  );
}

function Achievements({ data, updateField }) {
  return (
    <div className="space-y-4">
      <Input label="Awards" textarea value={data.awards} onChange={(e) => updateField("achievements", "awards", e.target.value)} />
      <Input label="Funded Projects" textarea value={data.fundedProjects} onChange={(e) => updateField("achievements", "fundedProjects", e.target.value)} />
      <Input label="Certifications" textarea value={data.certifications} onChange={(e) => updateField("achievements", "certifications", e.target.value)} />
    </div>
  );
}
