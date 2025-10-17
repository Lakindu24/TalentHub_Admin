import React, { useState, useEffect } from "react";
import { api, getAuthHeaders } from "../api/apiConfig";
import { useNavigate } from "react-router-dom";
import { FileText, FolderKanbanIcon, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetching all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects", getAuthHeaders());
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects. Please refresh and try again.");
      } finally {
        setLoading(false); // Data is fetched, loading is false
      }
    };

    fetchProjects();
  }, []);

  // Navigate to Project Overview Page for a specific project
  const handleProjectOverview = (projectId) => {
    navigate(`/projects/${projectId}/overview`);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        <Navbar />

        <div className="max-w-6xl px-4 sm:px-6   mt-16 sm:mt-24">
          <div className="bg-white rounded-xl p-10 sm:p-8">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className="p-4 rounded-2xl"
              >
                <FolderKanbanIcon className="h-10 w-auto text-4xl text-green-600" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-3xl font-bold text-[#060B27]"
                >
                  Project Management
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-gray-500"
                >
                  Manage all created projects
                </motion.p>
              </div>
            </div>

            <div className="space-y-8 mt-10 shadow-md ">
              {/* Projects Listing */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700">
                    All Projects
                  </h3>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3" />
                      <p className="text-sm text-gray-500">
                        Loading projects...
                      </p>
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <FileText className="h-8 w-8 mx-auto text-gray-300 mb-3" />
                      <p>No projects found</p>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project._id}
                        className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">
                            {project.projectName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {project.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleProjectOverview(project._id)}
                          className="ml-4 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label={`View overview for ${project.projectName}`}
                        >
                          <span>View Project Overview</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
};

export default ProjectManagementPage;
