import React, { useEffect, useState, useCallback } from "react";
import {
  Clock,
  User,
  AlertCircle,
  Check,
  X,
  Loader,
  Calendar,
  Search,
  Download,
  RefreshCw,
  QrCodeIcon,
  Users,
  Activity,
  Timer,
} from "lucide-react";
import { FaQrcode as QrCode } from "react-icons/fa";
import { api, getAuthHeaders } from "../../api/apiConfig";
import { fetchTodayAttendanceByType } from "../../api/internApi";
import { toast, Toaster } from "react-hot-toast";

const InternHistory = () => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial load
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeAttendanceType, setActiveAttendanceType] = useState("all"); // "all", "daily", "meeting"

  const fetchAttendanceLogs = useCallback(async (isManualRefresh = false) => {
    try {
      // Only show full loading on initial load or filter change, not on periodic refresh
      if (attendanceLogs.length === 0 || isManualRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const attendanceType = activeAttendanceType === "all" ? null : activeAttendanceType;
      const logs = await fetchTodayAttendanceByType(attendanceType);
      
      if (logs) {
        const formattedLogs = logs.map((log) => ({
          traineeId: log.traineeId,
          name: log.traineeName,
          attendanceInfo: log.attendanceInfo,
          time: Array.isArray(log.attendanceInfo)
            ? log.attendanceInfo.map(info => new Date(info.time).toLocaleTimeString()).join(", ")
            : new Date(log.attendanceInfo.time).toLocaleTimeString(),
          type: Array.isArray(log.attendanceInfo)
            ? log.attendanceInfo.map(info => info.type).join(", ")
            : log.attendanceInfo.type,
          method: Array.isArray(log.attendanceInfo)
            ? log.attendanceInfo.map(info => {
                if (info.type === "Daily" || info.type === "Meeting") {
                  return "QR Code Scan";
                } else if (info.type === "Manual" || info.method === "Manual Entry") {
                  return "Manual Method";
                } else if (info.method === "QR Code Scan" || (info.method === "Manual Entry" && info.type === "Meeting")) {
                  return "QR Code Scan";
                } else {
                  return info.method;
                }
              }).join(", ")
            : (log.attendanceInfo.type === "Daily" || log.attendanceInfo.type === "Meeting"
                ? "QR Code Scan"
                : (log.attendanceInfo.type === "Manual" || log.attendanceInfo.method === "Manual Entry"
                  ? "Manual Method"
                  : (log.attendanceInfo.method === "QR Code Scan" || (log.attendanceInfo.method === "Manual Entry" && log.attendanceInfo.type === "Meeting")
                    ? "QR Code Scan"
                    : log.attendanceInfo.method)))
        }));
        setAttendanceLogs(formattedLogs);
      } else {
        setAttendanceLogs([]);
      }
    } catch (err) {
      console.error("Fetching logs error", err);
      if (isManualRefresh) {
        toast.error("Failed to fetch attendance logs", {
          icon: <AlertCircle size={18} />,
        });
      }
      setAttendanceLogs([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeAttendanceType, attendanceLogs.length]);

  useEffect(() => {
    fetchAttendanceLogs();
    const interval = setInterval(fetchAttendanceLogs, 5000); // Increased to 5 seconds to reduce load
    return () => clearInterval(interval);
  }, [fetchAttendanceLogs]);

  const filteredLogs = attendanceLogs.filter(
    (log) =>
      log.traineeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Today's Marked Attendance
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Trainees who have checked in today • {filteredLogs.length} records
              {isRefreshing && <span className="text-blue-600 ml-2">• Updating...</span>}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Attendance Type Tabs */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: "all", label: "All", icon: Activity },
                { key: "daily", label: "Daily", icon: Timer },
                { key: "meeting", label: "Meeting", icon: Users }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveAttendanceType(key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 transition-all ${
                    activeAttendanceType === key
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Search and Refresh */}
            <div className="flex gap-2">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search trainees..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              
              <button
                onClick={() => fetchAttendanceLogs(true)}
                disabled={isLoading || isRefreshing}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh attendance data"
              >
                <RefreshCw className={`h-4 w-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* Subtle refresh indicator */}
        {isRefreshing && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-2 text-sm text-blue-700 flex items-center">
            <Loader className="h-4 w-4 animate-spin mr-2" />
            Refreshing attendance data...
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading attendance data...</span>
          </div>
        ) : filteredLogs.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trainee ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Attendance Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Method
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-in Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      {log.traineeId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      {log.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {log.type.includes("Daily") && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1">
                          <Timer className="h-3 w-3 mr-1" />
                          Daily
                        </span>
                      )}
                      {log.type.includes("Meeting") && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-1">
                          <Users className="h-3 w-3 mr-1" />
                          Meeting
                        </span>
                      )}
                      {log.type.includes("Manual") && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                          <User className="h-3 w-3 mr-1" />
                          Manual
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {log.method.includes("QR") ? (
                        <QrCode className="h-4 w-4 text-gray-400 mr-2" />
                      ) : (
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      {log.method}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      {log.time}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <Search className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No matching records
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search term
                </p>
              </>
            ) : (
              <>
                <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No attendance records
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeAttendanceType === "daily" 
                    ? "No daily attendance records found for today"
                    : activeAttendanceType === "meeting"
                    ? "No meeting attendance records found for today"
                    : "No trainees have checked in today"}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {(filteredLogs.length > 0 || attendanceLogs.length > 0) && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredLogs.length}</span>
              {searchTerm ? " matching" : ""} 
              {activeAttendanceType === "daily" ? " daily attendance" :
               activeAttendanceType === "meeting" ? " meeting attendance" : " attendance"} records
            </p>
            {searchTerm && filteredLogs.length !== attendanceLogs.length && (
              <p className="text-sm text-gray-500">
                (Filtered from{" "}
                <span className="font-medium">{attendanceLogs.length}</span>{" "}
                total)
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>Auto-refreshes every 3 seconds</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternHistory;
