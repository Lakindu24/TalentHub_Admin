const Intern = require("../models/Intern");
const mongoose = require("mongoose");

class InternRepository {

  static async addIntern(data) {
    const intern = new Intern(data);
    return await intern.save();
  }


  static async getAllInterns() {
    return await Intern.find();
  }

  static async getInternById(internId) {
    return await Intern.findById(internId);
  }
  static async findByEmail(email) {
    return await Intern.findOne({ email: email.toLowerCase() });
  }


  static async getAttendanceStats() {
    const interns = await Intern.find();
    const stats = { present: 0, absent: 0 };

    interns.forEach((intern) => {
      if (intern.attendance.length > 0) {
        const latestAttendance = intern.attendance[intern.attendance.length - 1];
        if (latestAttendance.status === "Present") {
          stats.present++;
        } else {
          stats.absent++;
        }
      }
    });

    return stats;
  }


  static async markAttendance(internId, status, date, type = 'manual', timeMarked = null) {
    try {
      console.log("Repository: Marking attendance for intern:", internId);
      
      if (!internId) {
        throw new Error("Intern ID is required");
      }

      // Validate if internId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(internId)) {
        console.error("Invalid ObjectId format:", internId);
        throw new Error("Invalid intern ID format");
      }

      const intern = await Intern.findById(internId);
      if (!intern) {
        console.error("Intern not found with ID:", internId);
        throw new Error("Intern not found");
      }

      console.log("Found intern:", intern.traineeName);

      const attendanceDate = new Date(date).setHours(0, 0, 0, 0);
      const actualTimeMarked = timeMarked || new Date();

      // Check if attendance for this type already exists for today
      const existingAttendanceIndex = intern.attendance.findIndex(
        (entry) => 
          new Date(entry.date).setHours(0, 0, 0, 0) === attendanceDate &&
          entry.type === type
      );

      if (existingAttendanceIndex !== -1) {
        console.log("Updating existing attendance entry for type:", type);
        intern.attendance[existingAttendanceIndex].status = status;
        intern.attendance[existingAttendanceIndex].timeMarked = actualTimeMarked;
      } else {
        console.log("Adding new attendance entry for type:", type);
        intern.attendance.push({ 
          date: date, 
          status,
          type,
          timeMarked: actualTimeMarked
        });
      }

      // Save without validation to avoid fieldOfSpecialization validation issues
      const savedIntern = await intern.save({ validateBeforeSave: false });
      console.log("Attendance saved successfully");
      return savedIntern;
    } catch (error) {
      console.error("Error in markAttendance repository:", error);
      throw error;
    }
  }


  static async updateAttendance(internId, date, status) {
    const intern = await Intern.findById(internId);
    if (!intern) throw new Error("Intern not found");

    const attendanceIndex = intern.attendance.findIndex(
      (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0)
    );

    if (attendanceIndex !== -1) {
      intern.attendance[attendanceIndex].status = status;
    } else {
      intern.attendance.push({ date: new Date(date), status });
    }

    // Save without validation to avoid fieldOfSpecialization validation issues
    return await intern.save({ validateBeforeSave: false });
  }

  static async getAllInternsForDate(startDate, endDate) {

    return await Intern.find({
      "attendance.date": {
        $gte: startDate,
        $lt: endDate
      }
    });
  }

  static async assignToTeam(internIds, teamName) {
    return await Intern.updateMany({ _id: { $in: internIds } }, { $set: { team: teamName } });
  }


  static async removeFromTeam(internId) {

    const updatedIntern = await Intern.findByIdAndUpdate(
      internId,
      { $set: { team: "" } },
      { new: true }
    );
    return updatedIntern;
  }

  static async removeIntern(internId) {
    return await Intern.findByIdAndDelete(internId);
  }

  static async updateIntern(internId, data) {
    return await Intern.findByIdAndUpdate(internId, data, { new: true });
  }

  static async getAllTeams() {
    try {

      const teams = await Intern.aggregate([
        { $match: { team: { $ne: "" } } },
        { $group: { _id: "$team", members: { $push: "$$ROOT" } } },
        {
          $project: {
            name: "$_id",
            members: 1,
            _id: 0,
          }
        }
      ]);
      return teams;
    } catch (error) {
      throw new Error('Error fetching teams: ' + error.message);
    }
  }


  static async updateTeamName(oldTeamName, newTeamName) {
    const result = await Intern.updateMany(
      { team: oldTeamName },
      { $set: { team: newTeamName } }
    );
    return {
      modifiedCount: result.modifiedCount,
      message: `Successfully updated ${result.modifiedCount} interns from ${oldTeamName} to ${newTeamName}`
    };
  }

  static async deleteTeam(teamName) {
    const result = await Intern.updateMany(
      { team: teamName },
      { $set: { team: "" } }
    );
    return {
      deletedCount: result.modifiedCount,
      message: `Team "${teamName}" deleted - ${result.modifiedCount} interns removed`,
    };
  }

  static async assignSingleToTeam(internId, teamName) {
    // Find the intern by ID and update their team
    const updatedIntern = await Intern.findByIdAndUpdate(
      internId,
      { $set: { team: teamName } },
      { new: true }
    );
    return updatedIntern;
  }

  static async getAttendanceStatsForToday() {
    const today = new Date().setHours(0, 0, 0, 0);  // Start of today
    const interns = await Intern.find();
    const stats = { present: 0, absent: 0 };

    interns.forEach((intern) => {
      const todayAttendance = intern.attendance.find(
        (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today
      );
      if (todayAttendance) {
        if (todayAttendance.status === "Present") {
          stats.present++;
        } else {
          stats.absent++;
        }
      }
    });

    return stats;
  }

  static async getAttendanceStatsByType(attendanceType = null) {
    const today = new Date().setHours(0, 0, 0, 0);
    const interns = await Intern.find();
    const stats = { 
      dailyAttendance: { present: 0, absent: 0 },
      meetingAttendance: { present: 0, absent: 0 },
      total: { present: 0, absent: 0 }
    };

    interns.forEach((intern) => {
      const todayAttendance = intern.attendance.filter(
        (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today
      );

      // Check for daily attendance (daily_qr type)
      const dailyAttendance = todayAttendance.find(entry => entry.type === 'daily_qr');
      if (dailyAttendance && dailyAttendance.status === "Present") {
        stats.dailyAttendance.present++;
      } else if (dailyAttendance && dailyAttendance.status === "Absent") {
        stats.dailyAttendance.absent++;
      }

      // Check for meeting attendance (qr or manual type)
      const meetingAttendance = todayAttendance.find(entry => 
        (entry.type === 'qr' || entry.type === 'manual')
      );
      if (meetingAttendance && meetingAttendance.status === "Present") {
        stats.meetingAttendance.present++;
      } else if (meetingAttendance && meetingAttendance.status === "Absent") {
        stats.meetingAttendance.absent++;
      }

      // Total stats (any attendance type)
      const hasAnyAttendance = todayAttendance.some(entry => entry.status === "Present");
      if (hasAnyAttendance) {
        stats.total.present++;
      } else if (todayAttendance.length > 0) {
        stats.total.absent++;
      }
    });

    if (attendanceType === 'daily') {
      return stats.dailyAttendance;
    } else if (attendanceType === 'meeting') {
      return stats.meetingAttendance;
    }
    
    return stats;
  }

  static async getTodayAttendanceByType(attendanceType = null) {
    const today = new Date().setHours(0, 0, 0, 0);
    const interns = await Intern.find();
    const attendedInterns = [];

    interns.forEach((intern) => {
      const todayAttendance = intern.attendance.filter(
        (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today
      );

      let hasRelevantAttendance = false;
      let attendanceInfo = null;

      if (attendanceType === 'daily') {
        const dailyAttendance = todayAttendance.find(entry => 
          entry.type === 'daily_qr' && entry.status === 'Present'
        );
        if (dailyAttendance) {
          hasRelevantAttendance = true;
          attendanceInfo = {
            type: 'Daily QR',
            time: dailyAttendance.timeMarked || dailyAttendance.date,
            method: dailyAttendance.markedBy === 'external_system' ? 'QR Code Scan' : 'Manual Entry'
          };
        }
      } else if (attendanceType === 'meeting') {
        // Show meeting attendance independently of daily (type 'qr' or 'manual')
        const meetingAttendance = todayAttendance.find(entry => 
          (entry.type === 'qr' || entry.type === 'manual') && entry.status === 'Present'
        );
        if (meetingAttendance) {
          hasRelevantAttendance = true;
          attendanceInfo = {
            type: meetingAttendance.type === 'manual' ? 'Manual' : 'Meeting QR',
            time: meetingAttendance.timeMarked || meetingAttendance.date,
            method: meetingAttendance.markedBy === 'external_system' ? 'QR Code Scan' : 'Manual Entry'
          };
        }
      } else {
        // Return all attendance types - but prioritize daily QR over meeting attendance
        const presentAttendance = todayAttendance.filter(entry => entry.status === 'Present');
        if (presentAttendance.length > 0) {
          hasRelevantAttendance = true;
          
          // Check if there's daily attendance - if so, only show daily
          const dailyAttendance = presentAttendance.find(entry => entry.type === 'daily_qr');
          if (dailyAttendance) {
            // Only show daily attendance
            attendanceInfo = {
              type: 'Daily QR',
              time: dailyAttendance.timeMarked || dailyAttendance.date,
              method: dailyAttendance.markedBy === 'external_system' ? 'QR Code Scan' : 'Manual Entry'
            };
          } else {
            // No daily attendance, show meeting attendance (manual or qr)
            const meetingAttendance = presentAttendance.find(entry => 
              entry.type === 'manual' || entry.type === 'qr'
            );
            if (meetingAttendance) {
              attendanceInfo = {
                type: meetingAttendance.type === 'manual' ? 'Manual' : 'Meeting QR',
                time: meetingAttendance.timeMarked || meetingAttendance.date,
                method: meetingAttendance.markedBy === 'external_system' ? 'QR Code Scan' : 'Manual Entry'
              };
            }
          }
        }
      }

      if (hasRelevantAttendance) {
        attendedInterns.push({
          traineeId: intern.traineeId,
          traineeName: intern.traineeName,
          attendanceInfo: attendanceInfo
        });
      }
    });

    return attendedInterns;
  }

  static async updateAttendanceForSpecificDate(internId, date, status) {
    const intern = await Intern.findById(internId);
    if (!intern) throw new Error("Intern not found");

    const existingAttendance = intern.attendance.find(
      (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0)
    );

    if (existingAttendance) {
      existingAttendance.status = status; // Update the existing attendance status
    } else {
      intern.attendance.push({ date: new Date(date), status }); // Add new attendance entry
    }

    // Save without validation to avoid fieldOfSpecialization validation issues
    return await intern.save({ validateBeforeSave: false });
  }







  // Add an available day
  // static async addAvailableDay(traineeId, day) {
  //   const intern = await this.getInternByTraineeId(traineeId);
  //   if (!intern) throw new Error("Intern not found");

  //   if (!intern.availableDays.includes(day)) {
  //     intern.availableDays.push(day);
  //     await intern.save();
  //   }

  //   return intern;
  // }

  // // Remove an available day
  // static async removeAvailableDay(traineeId, day) {
  //   const intern = await this.getInternByTraineeId(traineeId);
  //   if (!intern) throw new Error("Intern not found");

  //   intern.availableDays = intern.availableDays.filter(d => d !== day);
  //   await intern.save();

  //   return intern;
  // }

  // Add an available day using ObjectId
  static async addAvailableDay(id, day) {
    const intern = await this.getInternById(id);
    if (!intern) throw new Error("Intern not found");

    if (!intern.availableDays.includes(day)) {
      intern.availableDays.push(day);
      // Save without validation to avoid fieldOfSpecialization validation issues
      await intern.save({ validateBeforeSave: false });
    }

    return intern;
  }

  // Remove an available day using ObjectId
  static async removeAvailableDay(id, day) {
    const intern = await this.getInternById(id);
    if (!intern) throw new Error("Intern not found");

    intern.availableDays = intern.availableDays.filter(d => d !== day);
    // Save without validation to avoid fieldOfSpecialization validation issues
    await intern.save({ validateBeforeSave: false });

    return intern;
  }

  static async findByTraineeId(traineeId) {
    return await Intern.findOne({ traineeId: traineeId });
  }
  
}



module.exports = InternRepository;
