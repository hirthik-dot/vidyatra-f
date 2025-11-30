import { Bell, BookOpen, Calendar, User } from "lucide-react";

export default function FacultyDashboard() {
  const faculty = {
    name: "Dr. Priya Sharma",
    facultyId: "CSF2025",
    department: "Computer Science",
    email: "priya.sharma@college.edu",
    phone: "+91 9876543210",
    profileImage: "/faculty-placeholder.png",
  };

  const announcements = [
    { text: "Submit syllabus completion report by Dec 5", date: "Nov 28, 2025" },
    { text: "Department meeting on Dec 2 at 10:00 AM", date: "Nov 27, 2025" },
    { text: "New research paper submissions open", date: "Nov 26, 2025" },
  ];

  const classes = [
    { subject: "Data Structures", schedule: "Mon/Wed 10:00-11:30", room: "101", students: 60 },
    { subject: "Database Systems", schedule: "Tue/Thu 12:00-1:30", room: "102", students: 55 },
    { subject: "Algorithms", schedule: "Mon/Wed 2:00-3:30", room: "103", students: 50 },
  ];

  const pendingAssignments = [
    { title: "Data Structures Assignment 3", due: "Dec 2", submissions: 55 },
    { title: "Database Project Report", due: "Dec 5", submissions: 50 },
  ];

  const exams = [
    { subject: "Data Structures", date: "Dec 10", time: "10:00 AM", room: "101" },
    { subject: "Algorithms", date: "Dec 12", time: "2:00 PM", room: "103" },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-blue-700">Faculty Dashboard</h2>
          <p className="text-gray-500">Welcome, {faculty.name}!</p>
        </div>
        <div className="relative cursor-pointer">
          <Bell className="w-6 h-6 text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1">
            {announcements.length}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Classes Today</p>
          <h3 className="text-3xl font-bold text-blue-700">{classes.length}</h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Pending Assignments</p>
          <h3 className="text-3xl font-bold text-blue-700">{pendingAssignments.length}</h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Total Students</p>
          <h3 className="text-3xl font-bold text-blue-700">
            {classes.reduce((sum, c) => sum + c.students, 0)}
          </h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Notifications</p>
          <h3 className="text-3xl font-bold text-blue-700">{announcements.length}</h3>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4 text-blue-700">Recent Announcements</h3>
        <ul className="space-y-3">
          {announcements.map((note, i) => (
            <li key={i} className="p-3 border rounded-lg text-gray-700 hover:bg-gray-50 transition flex justify-between">
              <span>• {note.text}</span>
              <span className="text-gray-400 text-sm">{note.date}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Classes & Assignments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Classes */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Today's Classes
          </h3>
          <ul className="space-y-3">
            {classes.map((c, i) => (
              <li key={i} className="p-3 border rounded-lg text-gray-700 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <span className="font-medium">{c.subject}</span>
                </div>
                <div className="text-gray-500 text-sm">
                  {c.schedule} | Room {c.room} | Students: {c.students}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Pending Assignments
          </h3>
          <ul className="space-y-3">
            {pendingAssignments.map((a, i) => (
              <li key={i} className="p-3 border rounded-lg text-gray-700 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <span className="font-medium">{a.title}</span>
                </div>
                <div className="text-gray-500 text-sm">
                  Due {a.due} | Submissions: {a.submissions}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Exams Schedule */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Upcoming Exams
        </h3>
        <ul className="space-y-3">
          {exams.map((e, i) => (
            <li key={i} className="p-3 border rounded-lg text-gray-700 flex justify-between">
              <span>{e.subject}</span>
              <span className="text-gray-500">{e.date} | {e.time} | Room {e.room}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Faculty Profile */}
      <div className="bg-white p-6 rounded-xl shadow flex flex-col sm:flex-row items-center gap-4">
        <img
          src={faculty.profileImage}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-700">{faculty.name}</h3>
          <p className="text-gray-500">ID: {faculty.facultyId}</p>
          <p className="text-gray-500">{faculty.department}</p>
          <p className="text-gray-500">{faculty.email}</p>
          <p className="text-gray-500">{faculty.phone}</p>
          <button className="mt-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
