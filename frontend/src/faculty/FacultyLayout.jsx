// src/faculty/FacultyLayout.jsx
import DashboardLayout from "../components/DashboardLayout";
import {
  Home,
  Users,
  Calendar,
  ClipboardList,
  FileCheck,
  BookOpen,
  Layers,
  BrainCircuit,
  BarChart,
  MessageSquare,
  Settings,
} from "lucide-react";

export default function FacultyLayout() {
  const items = [
    { label: "Dashboard", path: "dashboard", icon: Home },
    { label: "Students", path: "students", icon: Users },
    { label: "Timetable", path: "timetable", icon: Calendar },
    { label: "Attendance", path: "attendance", icon: FileCheck },
    { label: "Assignments & Assessment", path: "tasks", icon: ClipboardList },
    { label: "Syllabus", path: "syllabus", icon: BookOpen },
    { label: "Leave/ OD Approval", path: "leave-od", icon: BookOpen },
    { label: "Topics", path: "topics", icon: Layers },
    { label: "AI Tools", path: "ai", icon: BrainCircuit },
    { label: "Behaviour", path: "behaviour", icon: BarChart },
    { label: "Performance", path: "performance", icon: BarChart },
    { label: "Communication", path: "communication", icon: MessageSquare },
    { label: "Profile", path: "profile", icon: Settings },

  ];

  return <DashboardLayout sidebarItems={items} title="Faculty Panel" />;
}
