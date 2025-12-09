import { useState } from "react";

export default function TopicsAndCurriculum() {
  const [topics, setTopics] = useState([
    {
      no: 1,
      periods: 1,
      topic: "Introduction to Web, HTTP Protocol – Request & Response",
      example:
        "Real-life Ex: Understanding how browsers fetch data from websites (e.g., visiting Amazon.com).",
      teaching: "PPT & Mind Mapping",
      status: false,
    },
    {
      no: 2,
      periods: 1,
      topic: "Web Browser & Web Server – Roles and Communication",
      example:
        "Real-life Ex: How a Chrome browser talks to Google servers to render a search result.",
      teaching: "Network Diagram & Whiteboard Explanation",
      status: false,
    },
    {
      no: 3,
      periods: 1,
      topic:
        "Concepts of Effective Web Design – UI/UX principles, Layouts",
      example:
        "Real-life Ex: Comparing Apple.com (good design) vs cluttered sites.",
      teaching: "Case Study & Video Walkthrough",
      status: false,
    },
    {
      no: 4,
      periods: 1,
      topic:
        "Page Linking and Navigation Design – Internal, External, Anchor, Menus",
      example:
        "Real-life Ex: Navigation bar in e-commerce site to switch between Home, Products, Cart, etc.",
      teaching: "Code Lab & Hands-on Practice",
      status: false,
    },
    {
      no: 5,
      periods: 1,
      topic:
        "Planning and publishing a website – Hosting, Domains, Tools",
      example:
        "Real-life Ex: Deploying a portfolio site using GitHub Pages or custom hosting.",
      teaching: "Infographic Poster & Interactive Demo",
      status: false,
    },
    {
      no: 6,
      periods: 2,
      topic:
        "Basics of HTML: Structure, Tags, Forms, Media, Semantic Elements",
      example:
        "Real-life Ex: Creating resume web pages with images, videos, and contact form.",
      teaching: "VS Code & Worksheet Activity",
      status: false,
    },
    {
      no: 7,
      periods: 1,
      topic:
        "HTML Features – Accessibility, SEO Optimization",
      example:
        "Real-life Ex: Making a site readable for screen readers and rank higher in Google search.",
      teaching: "Lighthouse Tool & Checklist Roleplay",
      status: false,
    },
    {
      no: 8,
      periods: 2,
      topic:
        "Introduction to CSS – Syntax, Selectors, Color, Text, Box Model, Layouts (Flex, Grid)",
      example:
        "Real-life Ex: Styling responsive blog layouts or online store product cards.",
      teaching: "Pair Programming & Styling Practice",
      status: false,
    },
  ]);

  const toggleStatus = (index) => {
    const updated = [...topics];
    updated[index].status = !updated[index].status;
    setTopics(updated);
  };

  return (
    <div className="space-y-6 p-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-4">
        Topics & Curriculum
      </h2>

      {/* UNIT HEADER BOX */}
      <div className="bg-white shadow rounded-xl border">
        <div className="grid grid-cols-2">
          <div className="border-r p-4 font-semibold text-lg">
            UNIT I: INTRODUCTION TO WEB DESIGN, HTML AND CSS
          </div>
          <div className="p-4 font-semibold text-lg text-right">
            Target Hours: 10
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">S.No</th>
              <th className="border p-3">No. of Periods</th>
              <th className="border p-3">Name of the Topic</th>
              <th className="border p-3">Teaching Aids & Methods</th>
              <th className="border p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {topics.map((t, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border p-3">{t.no}</td>
                <td className="border p-3">{t.periods}</td>

                <td className="border p-3">
                  <p className="font-semibold">{t.topic}</p>
                  <p className="text-sm text-gray-500">{t.example}</p>
                </td>

                <td className="border p-3 text-sm text-gray-600">
                  {t.teaching}
                </td>

                <td className="border p-3">
                  <button
                    onClick={() => toggleStatus(i)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      t.status
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {t.status ? "Completed" : "Not Completed"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
