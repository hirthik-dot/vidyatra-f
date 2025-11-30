// src/student/StudentLayout.jsx
import DashboardLayout from "../components/DashboardLayout";
import {
  Home,
  Calendar,
  CheckSquare,
  User,
  BookOpen,
  LineChart,
  MessageCircle,
  MessageSquare,
  BrainCircuit,
  FileEdit,
  Lightbulb,
} from "lucide-react";

export default function StudentLayout() {
  const items = [
    { label: "Dashboard", path: "dashboard", icon: Home },
    { label: "Schedule", path: "schedule", icon: Calendar },
    { label: "Attendance", path: "attendance", icon: CheckSquare },
    { label: "Assignments", path: "assignments", icon: FileEdit },
    { label: "Assessments", path: "assessments", icon: BookOpen },
    { label: "Performance", path: "performance", icon: LineChart },
    { label: "Leave / OD", path: "leave", icon: MessageCircle },
    { label: "Communication", path: "communication", icon: MessageSquare },
    { label: "AI Assistant", path: "ai", icon: BrainCircuit },
    { label: "Feedback & Suggestion", path: "feedback", icon: Lightbulb },
    { label: "Recommendations", path: "suggestions", icon: Lightbulb },
    { label: "Profile", path: "profile", icon: User },
  ];

  return <DashboardLayout sidebarItems={items} title="Student Panel" />;
}
