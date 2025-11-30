import { useState } from "react";

export default function StudentRecommendations() {
  const [interest, setInterest] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const interestsList = [
    "Web Development",
    "Data Science",
    "AI / ML",
    "Cybersecurity",
    "Mobile App Development",
    "Cloud Computing",
  ];

  const recommendationsData = {
    "Web Development": [
      {
        role: "Frontend Developer",
        description: "Build user interfaces and web pages using HTML, CSS, JS, and React.",
        tasks: ["Create a personal portfolio website", "Contribute to open-source projects"],
        resources: ["MDN Web Docs", "React Official Docs", "Frontend Mentor Challenges"],
      },
      {
        role: "Fullstack Developer",
        description: "Work on both frontend and backend, managing databases and APIs.",
        tasks: ["Build a full-stack CRUD app", "Implement REST APIs with Node.js"],
        resources: ["Node.js Docs", "MongoDB University", "Fullstack Open Course"],
      },
    ],
    "Data Science": [
      {
        role: "Data Analyst",
        description: "Analyze data to extract insights and support business decisions.",
        tasks: ["Analyze datasets in Excel/Pandas", "Create visual dashboards"],
        resources: ["Kaggle Datasets", "Python for Data Analysis", "Tableau Tutorials"],
      },
      {
        role: "Data Scientist",
        description: "Build predictive models and apply machine learning algorithms.",
        tasks: ["Predict student performance using ML", "Participate in Kaggle competitions"],
        resources: ["Scikit-learn Docs", "Coursera Data Science Specialization", "Kaggle Learn"],
      },
    ],
    "AI / ML": [
      {
        role: "Machine Learning Engineer",
        description: "Develop ML models and deploy AI solutions.",
        tasks: ["Build a recommendation system", "Create a sentiment analysis model"],
        resources: ["TensorFlow Tutorials", "PyTorch Docs", "Fast.ai Courses"],
      },
    ],
    "Cybersecurity": [
      {
        role: "Security Analyst",
        description: "Monitor and protect systems against cyber threats.",
        tasks: ["Perform vulnerability assessment", "Set up intrusion detection systems"],
        resources: ["OWASP Guides", "TryHackMe Labs", "Cybrary Courses"],
      },
    ],
  };

  const handleRecommend = () => {
    if (interest && recommendationsData[interest]) {
      setRecommendations(recommendationsData[interest]);
    } else {
      setRecommendations([]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Career & Domain Recommendations</h2>

      {/* Interest Selection */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <select
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className="p-3 border rounded-lg flex-1"
        >
          <option value="">Select your interest</option>
          {interestsList.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        <button
          onClick={handleRecommend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Show Recommendations
        </button>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="space-y-6">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-800">{rec.role}</h3>
              <p className="text-gray-600 mt-2">{rec.description}</p>

              <div className="mt-3">
                <h4 className="font-semibold text-gray-700">Suggested Tasks:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {rec.tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3">
                <h4 className="font-semibold text-gray-700">Helpful Resources:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {rec.resources.map((res, i) => (
                    <li key={i}>{res}</li>
                  ))}
                </ul>
              </div>

              <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">
                Mark as Interested
              </button>
            </div>
          ))}
        </div>
      ) : (
        interest && (
          <p className="text-gray-500 mt-4">No recommendations available for this interest yet.</p>
        )
      )}
    </div>
  );
}
