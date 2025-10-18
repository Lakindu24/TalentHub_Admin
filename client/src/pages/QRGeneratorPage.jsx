import React, { useEffect, useState } from "react";
import { api, getAuthHeaders } from "../api/apiConfig";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Dialog } from "@headlessui/react";
import {
  Clock,
  User,
  QrCode,
  AlertCircle,
  Check,
  X,
  Loader,
  Calendar,
  Search,
  Download,
  RefreshCw,
  QrCodeIcon,
} from "lucide-react";
import { motion } from "framer-motion";

const QRGeneratorPage = () => {
  const [qrCode, setQrCode] = useState("");
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [isExpired, setIsExpired] = useState(false); // Track QR code expiry status
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchQRCode = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        "/qrcode/generate-meeting-qr",
        getAuthHeaders()
      );
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
        setIsExpired(false); // QR Code is now active
        toast.success("QR Code generated successfully!", {
          duration: 3000,
          icon: <Check size={18} />,
        });
      } else {
        toast.error("QR code not received.", {
          duration: 3000,
          icon: <X size={18} />,
        });
      }
    } catch (error) {
      console.error("QR Code error", error);
      toast.error("Failed to generate QR code", {
        duration: 3000,
        icon: <AlertCircle size={18} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceLogs = async () => {
    try {
      const response = await api.get("/interns", getAuthHeaders());
      const today = new Date().toDateString();
      
      console.log("Fetching attendance logs for date:", today);
      console.log("Total interns:", response.data.length);
      
      const logs = response.data
        .filter((i) => {
          const hasQRAttendance = i.attendance?.some(
            (a) => {
              const attDate = new Date(a.date).toDateString();
              const isToday = attDate === today;
              const isPresent = a.status === "Present";
              const isQRType = (a.type === "qr");
              
              // Debug logging
              if (isToday && isPresent) {
                console.log(`Intern ${i.traineeId} - Date: ${attDate}, Status: ${a.status}, Type: ${a.type}, TimeMarked: ${a.timeMarked}`);
              }
              
              return isToday && isPresent && isQRType;
            }
          );
          return hasQRAttendance;
        })
        .map((i) => {
          // Find ALL today's MEETING QR attendance records to handle multiple entries
          const todayAttendances = i.attendance.filter(
            (a) =>
              new Date(a.date).toDateString() === today &&
              a.status === "Present" &&
              (a.type === "qr")
          );
          
          console.log(`Mapping intern ${i.traineeId}, found ${todayAttendances.length} attendance records:`, todayAttendances);
          
          // Get the most recent attendance record
          const todayAttendance = todayAttendances.length > 0 
            ? todayAttendances.reduce((latest, current) => {
                const latestTime = latest.timeMarked ? new Date(latest.timeMarked) : new Date(latest.date);
                const currentTime = current.timeMarked ? new Date(current.timeMarked) : new Date(current.date);
                return currentTime > latestTime ? current : latest;
              })
            : null;
          
          return {
            traineeId: i.traineeId,
            name: i.traineeName,
            time: todayAttendance?.timeMarked 
              ? new Date(todayAttendance.timeMarked).toLocaleTimeString()
              : new Date().toLocaleTimeString(),
            type: todayAttendance?.type || "qr"
          };
        });
      
      console.log("Filtered logs:", logs);
      console.log("Setting attendance logs to state:", logs.map(log => ({
        traineeId: log.traineeId,
        name: log.name,
        time: log.time,
        type: log.type
      })));
      setAttendanceLogs(logs);
    } catch (err) {
      console.error("Fetching logs error", err);
      toast.error("Failed to fetch attendance logs", {
        icon: <AlertCircle size={18} />,
      });
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAttendanceLogs();
    
    // Set up interval for periodic refresh
    const interval = setInterval(fetchAttendanceLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter logs based on search term
  const filteredLogs = attendanceLogs.filter(
    (log) =>
      log.traineeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log("Component render - attendanceLogs state:", attendanceLogs);
  console.log("Component render - filteredLogs for display:", filteredLogs);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <Navbar />
        </div>
        <Toaster position="top-right" />

        <div className="h-20" />

        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4 mt-5">
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
                <QrCodeIcon className="h-10 w-auto text-4xl text-green-600" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-3xl font-bold text-[#060B27]"
                >
                  QR Code Meeting Attendance
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-gray-500"
                >
                  Generate meeting QR codes and monitor all QR-based attendance
                </motion.p>
              </div>
            </div>

            <button
              className={`flex items-center justify-center gap-2 bg-blue-300 px-6 py-2.5 text-black rounded-lg hover:bg-blue-700 hover:text-white transition-colors shadow-sm ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={async () => {
                if (!isLoading) {
                  await fetchQRCode();
                  setModalOpen(true);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-5 w-5 text-white animate-spin" />
              ) : (
                <>
                  <QrCode size={18} />
                  Generate QR Code
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-medium">
                  Total Meeting Scans Today
                </h3>
                <span className="p-2 bg-blue-50 rounded-lg">
                  <User className="h-5 w-5 text-blue-500" />
                </span>
              </div>
              <p className="text-2xl font-bold mt-2">{attendanceLogs.length}</p>
              <p className="text-xs text-gray-500 mt-1">Updated in real-time</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-medium">
                  QR Code Status
                </h3>
                <span
                  className={`p-2 ${
                    qrCode && !isExpired ? "bg-green-50" : "bg-red-50"
                  } rounded-lg`}
                >
                  {qrCode && !isExpired ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </span>
              </div>
              <p className="text-lg font-semibold mt-2">
                {qrCode && !isExpired ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {qrCode && !isExpired
                  ? "QR code is ready for scanning"
                  : "Generate a new QR code to start"}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-medium">
                  Current Time
                </h3>
                <span className="p-2 bg-purple-50 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-500" />
                </span>
              </div>
              <p className="text-lg font-semibold mt-2" id="current-time">
                {new Date().toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date().toDateString()}
              </p>
            </div>
          </div>

          <Dialog
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-md w-full p-0 overflow-hidden">
                <div className="bg-[#00102F] p-4 text-white">
                  <Dialog.Title className="text-xl font-bold text-center">
                    QR Code Attendance Scanner
                  </Dialog.Title>
                  <p className="text-indigo-100 text-sm text-center mt-1">
                    {qrCode && !isExpired
                      ? "Active QR code ready for scanning"
                      : "QR code needs to be generated"}
                  </p>
                </div>

                <div className="p-6">
                  {qrCode && !isExpired ? (
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="relative">
                          <img
                            src={qrCode}
                            alt="QR Code"
                            className="w-64 h-64 object-contain"
                          />
                          <div className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                            Active
                          </div>
                        </div>
                      </div>
                      <div className="flex mt-4 gap-2 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <p className="text-sm">{new Date().toDateString()}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-4 text-center">
                        Have trainees scan this QR code with the attendance app
                        to mark their presence
                      </p>

                      <div className="flex gap-3 mt-6 w-full">
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors">
                          <Download size={16} />
                          Save
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors">
                          <RefreshCw size={16} />
                          Refresh
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="text-center text-red-500 font-medium">
                        QR code is expired or unavailable
                      </p>
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Generate a new QR code to continue tracking attendance
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between gap-4">
                  <button
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    onClick={() => setModalOpen(false)}
                  >
                    <X size={16} />
                    Close
                  </button>
                  {qrCode && !isExpired ? (
                    <button
                      className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        setIsExpired(true);
                        toast.error("QR Code expired.", {
                          icon: <AlertCircle size={18} />,
                          duration: 3000,
                        });
                        setModalOpen(false);
                      }}
                    >
                      <AlertCircle size={16} />
                      Expire Code
                    </button>
                  ) : (
                    <button
                      className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      onClick={fetchQRCode}
                    >
                      <QrCode size={16} />
                      Regenerate
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>

          <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Today's Meeting QR Attendance
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Trainees who have checked in via meeting QR today
                  </p>
                </div>

                <div className="relative w-full md:w-64">
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
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredLogs.length > 0 ? (
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
                        Check-in Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <QrCode className="h-4 w-4 text-gray-400 mr-2" />
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
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            {log.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.type === 'qr' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {log.type === 'qr' ? 'Meeting' : 'Daily'}
                          </span>
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
                        No trainees have checked in today
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {filteredLogs.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">{filteredLogs.length}</span>
                  {searchTerm ? " matching" : ""} trainees
                </p>
                {searchTerm &&
                  filteredLogs.length !== attendanceLogs.length && (
                    <p className="text-sm text-gray-500">
                      (Filtered from{" "}
                      <span className="font-medium">
                        {attendanceLogs.length}
                      </span>{" "}
                      total)
                    </p>
                  )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QRGeneratorPage;
