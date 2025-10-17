import React, { useState } from "react"; 
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UploadIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Plus,
  Users,
  LayoutDashboard, 
  User, 
  UserPlus2, 
  UserPlus2Icon, 
  UserMinus,  // Replaced UserRoundMinus with UserMinus
  PanelLeftClose, 
  PanelLeftOpen, 
  Upload,
  QrCodeIcon,
  RefreshCcw
} from "lucide-react";

const SidebarButton = ({
  icon,
  label,
  onClick,
  active,
  hasSubmenu,
  isOpen,
  collapsed
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-102
    ${
      active
        ? "bg-green-600 text-white shadow-lg"
        : "text-gray-300 hover:bg-green-700/40 hover:text-white"
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`transform transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      {!collapsed && <span className="font-medium">{label}</span>}
    </div>
    {hasSubmenu && !collapsed && (
      <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </div>
    )}
  </button>
);

const Sidebar = () => {
  const [isInternMenuOpen, setIsInternMenuOpen] = useState(false);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'}  bg-[#00102F] min-h-screen h-full flex flex-col shadow-xl sticky top-0 transition-all duration-300`}>
      {/* Logo/Header */}
      <div className="flex justify-center p-4 border-b border-gray-700/50 bg-black/20">
        <div className="relative group cursor-pointer my-4">
          <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute right-0 top-20 transform translate-x-1/2 bg-green-600 text-white p-1.5 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 mt-16">
        <SidebarButton
          icon={<LayoutDashboard className="h-6 w-6" />}
          label="Dashboard"
          onClick={() => handleNavigation("/")}
          active={isActive("/")}
          collapsed={collapsed}
        />

        <div className="space-y-2">
          <SidebarButton
            icon={<User className="h-6 w-6" />}
            label="Intern Management"
            onClick={() => setIsInternMenuOpen(!isInternMenuOpen)}
            active={isActive("/interns-history")}
            hasSubmenu={true}
            isOpen={isInternMenuOpen}
            collapsed={collapsed}
          />

          {!collapsed && (
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isInternMenuOpen ? 'max-h-48' : 'max-h-0'}`}>
              <div className="ml-4 pl-4 border-l border-green-600/30 space-y-2 py-2">
                <SidebarButton
                  icon={<User className="h-5 w-5" />}
                  label="Intern Page"
                  onClick={() => handleNavigation("/interns-history")}
                  active={isActive("/interns-history")}
                  collapsed={collapsed}
                />
                <SidebarButton
                  icon={<UserPlus2 className="h-5 w-5" />}
                  label="Add Interns"
                  onClick={() => handleNavigation("/add-intern")}
                  active={isActive("/add-intern")}
                  collapsed={collapsed}
                />
                {/* <SidebarButton
                  icon={<User className="h-5 w-5" />}
                  label="Availble Interns"
                  onClick={() => handleNavigation("/availbleintern")}
                  active={isActive("/availbleintern")}
                  collapsed={collapsed}
                /> */}
                <SidebarButton
                  icon={<RefreshCcw className="h-5 w-5" />}
                  label="Update Emails"
                  onClick={() => handleNavigation("/upload-txt")}
                  active={isActive("/upload-txt")}
                  collapsed={collapsed}
                />
              </div>
            </div>
          )}
        </div>

        {/* Group Management */}
        <div className="space-y-2">
          <SidebarButton
            icon={<Users className="h-6 w-6" />}
            label="Group Management"
            onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
            active={isActive("/groups")}
            hasSubmenu={true}
            isOpen={isGroupMenuOpen}
            collapsed={collapsed}
          />

          {!collapsed && (
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGroupMenuOpen ? 'max-h-32' : 'max-h-0'}`}>
              <div className="ml-4 pl-4 border-l border-green-600/30 space-y-2 py-2">
                <SidebarButton
                  icon={<UserPlus2Icon className="h-5 w-5" />}
                  label="Create Team"
                  onClick={() => handleNavigation("/groups")}
                  active={isActive("/groups")}
                  collapsed={collapsed}
                />
                <SidebarButton
                  icon={<UserMinus className="h-5 w-5" />}  // Replace UserRoundMinus with UserMinus
                  label="Manage Teams"
                  onClick={() => handleNavigation("/teams")}
                  active={isActive("/teams")}
                  collapsed={collapsed}
                />
              </div>
            </div>
          )}
        </div>

        {/* Project Management */}
        <div className="space-y-2">
          <SidebarButton
            icon={<Users className="h-6 w-6" />}
            label="Projects"
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
            active={isActive("/projects")}
            hasSubmenu={true}
            isOpen={isProjectMenuOpen}
            collapsed={collapsed}
          />

          {!collapsed && (
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isProjectMenuOpen ? 'max-h-48' : 'max-h-0'}`}>
              <div className="ml-4 pl-4 border-l border-green-600/30 space-y-2 py-2">
                <SidebarButton
                  icon={<Plus className="h-5 w-5" />}
                  label="Add Project"
                  onClick={() => handleNavigation("/projects/create")}
                  active={isActive("/projects/create")}
                  collapsed={collapsed}
                />
                <SidebarButton
                  icon={<Users className="h-5 w-5" />}
                  label="Project Overview"
                  onClick={() => handleNavigation("/projects")}
                  active={isActive("/projects")}
                  collapsed={collapsed}
                />
              </div>
            </div>
          )}
        </div>

        {/* QR Code Generator */}
        <SidebarButton
          icon={<QrCodeIcon className="h-6 w-6" />}
          label="QR Meeting Attendance"
          onClick={() => handleNavigation("/qr-generator")}
          active={isActive("/qr-generator")}
          collapsed={collapsed}
        />

        {/* Daily Attendance QR */}
        <SidebarButton
          icon={<RefreshCcw className="h-6 w-6" />}
          label="Daily QR Attendance"
          onClick={() => handleNavigation("/daily-attendance-qr")}
          active={isActive("/daily-attendance-qr")}
          collapsed={collapsed}
        />
      </div>      
    </div>
  );
};

export default Sidebar;
