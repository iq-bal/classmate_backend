import Submission from "../models/submissionModel.js";
import Student from "../models/studentModel.js";
import Assignment from "../models/assignmentModel.js";
import Course from "../models/courseModel.js";
import Enrollment from "../models/enrollmentModel.js";
import User from "../models/userModel.js";
import ClassSession from "../models/classSessionModel.js"; 
import AttendanceRecord from "../models/attendanceRecordModel.js";

const insertDummySubmissions = async () => {
  try {
    const dummySubmissions = [
      {
        assignment_id: "675cba11fea47b18b58ff953",
        student_id: "675cb131c80792e9f500f2d5",
        file_url: "https://example.com/submission1.pdf",
        plagiarism_score: 10,
        teacher_comments: "Well done!",
        grade: "A",
      },
      {
        assignment_id: "675cba11fea47b18b58ff953",
        student_id: "675cb131c80792e9f500f2d6",
        file_url: "https://example.com/submission2.pdf",
        plagiarism_score: 20,
        teacher_comments: "Good effort!",
        grade: "B",
      },
      {
        assignment_id: "675cba0a097be65e5ced61b9",
        student_id: "675cb131c80792e9f500f2d7",
        file_url: "https://example.com/submission3.pdf",
        plagiarism_score: 15,
        teacher_comments: "Keep it up!",
        grade: "A",
      },
    ];

    const result = await Submission.insertMany(dummySubmissions);
    console.log("Dummy submissions inserted:", result);
  } catch (error) {
    console.error("Error inserting dummy submissions:", error);
  }
};

const insertDummyClassSessions = async () => {
  try {
    const dummyClassSessions = [
      {
        course_id: "675c910186e75d98dc7c5cae", // Replace with a valid Course ID
        date: new Date("2024-05-01"),
        start_time: "09:00 AM",
        end_time: "11:00 AM",
        topic: "Introduction to Cache Memory",
      },
      {
        course_id: "675c910186e75d98dc7c5cae", // Replace with a valid Course ID
        date: new Date("2024-05-03"),
        start_time: "10:00 AM",
        end_time: "12:00 PM",
        topic: "Cache Memory Replacement Policies",
      },
      {
        course_id: "675c910186e75d98dc7c5cae", 
        date: new Date("2024-05-05"),
        start_time: "01:00 PM",
        end_time: "03:00 PM",
        topic: "Performance Optimization Techniques",
      },
    ];

    const result = await ClassSession.insertMany(dummyClassSessions);
    console.log("Dummy class sessions inserted:", result);
  } catch (error) {
    console.error("Error inserting dummy class sessions:", error.message);
  }
};


const insertDummyAttendanceRecords = async () => {
  try {
        
    const dummyAttendanceRecords = [
      {
        session: "6761e6ac5453e0b08b1a2c24", // First session
        student: "675cb131c80792e9f500f2d5", // First student
        status: "absent",
        remarks: "On time",
      },
      {
        session: "6761e6ac5453e0b08b1a2c24", // First session
        student: "675cb131c80792e9f500f2d6", // Second student
        status: "present",
        remarks: "Arrived late by 15 minutes",
      },
      {
        session: "6761e6ac5453e0b08b1a2c24", // Second session
        student: "675cb131c80792e9f500f2d7", // Third student
        status: "present",
        remarks: "Missed class without excuse",
      },
    ];

    // Insert dummy attendance records
    const result = await AttendanceRecord.insertMany(dummyAttendanceRecords);
    console.log("Dummy attendance records inserted successfully:", result);
  } catch (error) {
    console.error("Error inserting dummy attendance records:", error.message);
  }
};


const insertDummyStudents = async () => {
  try {
    const dummyStudents = [
      {
        user_id: "675936fc1222fe79f3386690", // Replace with a valid ID
        roll: 500,
        section: "A",
        name: "John Doe",
        email: "john.doe@jsn.com",
      },
      // {
      //   user_id: "675936fc1222fe79f3386690", // Replace with a valid ID
      //   roll: 102,
      //   section: "B",
      //   name: "Jane Smith",
      //   email: "jane.smith@example.com",
      // },
      // {
      //   user_id: "675cb131c80792e9f500f2d3", // Replace with a valid ID
      //   roll: 103,
      //   section: "A",
      //   name: "Emily Davis",
      //   email: "emily.davis@example.com",
      // },
    ];

    // Validate and save each student individually
    for (const studentData of dummyStudents) {
      const student = new Student(studentData);
      try {
        const savedStudent = await student.save(); // Triggers pre('save') hook
        console.log("Student saved:", savedStudent);
      } catch (error) {
        console.error("Error saving student:", error.message);
      }
    }
  } catch (error) {
    console.error("Error in bulk insert:", error.message);
  }
};


export default { insertDummySubmissions, insertDummyClassSessions, insertDummyAttendanceRecords,insertDummyStudents };
