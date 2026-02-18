# ClassMate Database Schema Diagram

This document contains a visual representation of the database schema and relationships for the ClassMate educational platform.

## Entity Relationship Diagram

<svg width="1400" height="1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .table-box { fill: #f8f9fa; stroke: #343a40; stroke-width: 2; }
      .primary-table { fill: #e3f2fd; stroke: #1976d2; stroke-width: 2; }
      .secondary-table { fill: #f3e5f5; stroke: #7b1fa2; stroke-width: 2; }
      .tertiary-table { fill: #e8f5e8; stroke: #388e3c; stroke-width: 2; }
      .table-title { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #212529; }
      .field-text { font-family: Arial, sans-serif; font-size: 11px; fill: #495057; }
      .pk-field { font-weight: bold; fill: #d32f2f; }
      .fk-field { font-style: italic; fill: #1976d2; }
      .relationship-line { stroke: #6c757d; stroke-width: 2; fill: none; }
      .one-to-many { stroke: #28a745; stroke-width: 2; }
      .many-to-many { stroke: #dc3545; stroke-width: 2; }
      .arrow { fill: #6c757d; }
    </style>
  </defs>
  
  <!-- User Table (Core Entity) -->
  <rect x="50" y="50" width="180" height="160" class="primary-table"/>
  <text x="140" y="70" text-anchor="middle" class="table-title">User</text>
  <line x1="60" y1="75" x2="220" y2="75" stroke="#1976d2" stroke-width="1"/>
  <text x="60" y="90" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="60" y="105" class="field-text">uid: String (Unique)</text>
  <text x="60" y="120" class="field-text">name: String</text>
  <text x="60" y="135" class="field-text">email: String (Unique)</text>
  <text x="60" y="150" class="field-text">password: String</text>
  <text x="60" y="165" class="field-text">role: String</text>
  <text x="60" y="180" class="field-text">profile_picture: String</text>
  <text x="60" y="195" class="field-text">fcm_token: String</text>
  
  <!-- Student Table -->
  <rect x="300" y="50" width="180" height="140" class="secondary-table"/>
  <text x="390" y="70" text-anchor="middle" class="table-title">Student</text>
  <line x1="310" y1="75" x2="470" y2="75" stroke="#7b1fa2" stroke-width="1"/>
  <text x="310" y="90" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="310" y="105" class="field-text fk-field">user_id: ObjectId (FK)</text>
  <text x="310" y="120" class="field-text">roll: String</text>
  <text x="310" y="135" class="field-text">section: String</text>
  <text x="310" y="150" class="field-text">department: String</text>
  <text x="310" y="165" class="field-text">semester: String</text>
  <text x="310" y="180" class="field-text">cgpa: Number</text>
  
  <!-- Teacher Table -->
  <rect x="300" y="220" width="180" height="140" class="secondary-table"/>
  <text x="390" y="240" text-anchor="middle" class="table-title">Teacher</text>
  <line x1="310" y1="245" x2="470" y2="245" stroke="#7b1fa2" stroke-width="1"/>
  <text x="310" y="260" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="310" y="275" class="field-text fk-field">user_id: ObjectId (FK)</text>
  <text x="310" y="290" class="field-text">department: String</text>
  <text x="310" y="305" class="field-text">designation: String</text>
  <text x="310" y="320" class="field-text">joining_date: Date</text>
  <text x="310" y="335" class="field-text">about: String</text>
  
  <!-- Course Table -->
  <rect x="550" y="220" width="180" height="160" class="tertiary-table"/>
  <text x="640" y="240" text-anchor="middle" class="table-title">Course</text>
  <line x1="560" y1="245" x2="720" y2="245" stroke="#388e3c" stroke-width="1"/>
  <text x="560" y="260" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="560" y="275" class="field-text fk-field">teacher_id: ObjectId (FK)</text>
  <text x="560" y="290" class="field-text">title: String</text>
  <text x="560" y="305" class="field-text">course_code: String</text>
  <text x="560" y="320" class="field-text">credit: Number</text>
  <text x="560" y="335" class="field-text">description: String</text>
  <text x="560" y="350" class="field-text">image: String</text>
  <text x="560" y="365" class="field-text">created_at: Date</text>
  
  <!-- Enrollment Table -->
  <rect x="550" y="50" width="180" height="120" class="table-box"/>
  <text x="640" y="70" text-anchor="middle" class="table-title">Enrollment</text>
  <line x1="560" y1="75" x2="720" y2="75" stroke="#343a40" stroke-width="1"/>
  <text x="560" y="90" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="560" y="105" class="field-text fk-field">course_id: ObjectId (FK)</text>
  <text x="560" y="120" class="field-text fk-field">student_id: ObjectId (FK)</text>
  <text x="560" y="135" class="field-text">status: String</text>
  <text x="560" y="150" class="field-text">enrolled_at: Date</text>
  
  <!-- ClassSession Table -->
  <rect x="800" y="220" width="180" height="160" class="table-box"/>
  <text x="890" y="240" text-anchor="middle" class="table-title">ClassSession</text>
  <line x1="810" y1="245" x2="970" y2="245" stroke="#343a40" stroke-width="1"/>
  <text x="810" y="260" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="810" y="275" class="field-text fk-field">course_id: ObjectId (FK)</text>
  <text x="810" y="290" class="field-text fk-field">teacher_id: ObjectId (FK)</text>
  <text x="810" y="305" class="field-text">date: Date</text>
  <text x="810" y="320" class="field-text">start_time: String</text>
  <text x="810" y="335" class="field-text">end_time: String</text>
  <text x="810" y="350" class="field-text">topic: String</text>
  <text x="810" y="365" class="field-text">status: String</text>
  
  <!-- AttendanceRecord Table -->
  <rect x="1050" y="220" width="180" height="140" class="table-box"/>
  <text x="1140" y="240" text-anchor="middle" class="table-title">AttendanceRecord</text>
  <line x1="1060" y1="245" x2="1220" y2="245" stroke="#343a40" stroke-width="1"/>
  <text x="1060" y="260" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="1060" y="275" class="field-text fk-field">session_id: ObjectId (FK)</text>
  <text x="1060" y="290" class="field-text fk-field">student_id: ObjectId (FK)</text>
  <text x="1060" y="305" class="field-text">status: String</text>
  <text x="1060" y="320" class="field-text">remarks: String</text>
  <text x="1060" y="335" class="field-text">createdAt: Date</text>
  
  <!-- Assignment Table -->
  <rect x="550" y="420" width="180" height="140" class="table-box"/>
  <text x="640" y="440" text-anchor="middle" class="table-title">Assignment</text>
  <line x1="560" y1="445" x2="720" y2="445" stroke="#343a40" stroke-width="1"/>
  <text x="560" y="460" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="560" y="475" class="field-text fk-field">course_id: ObjectId (FK)</text>
  <text x="560" y="490" class="field-text fk-field">teacher_id: ObjectId (FK)</text>
  <text x="560" y="505" class="field-text">title: String</text>
  <text x="560" y="520" class="field-text">description: String</text>
  <text x="560" y="535" class="field-text">deadline: Date</text>
  <text x="560" y="550" class="field-text">created_at: Date</text>
  
  <!-- Submission Table -->
  <rect x="800" y="420" width="180" height="160" class="table-box"/>
  <text x="890" y="440" text-anchor="middle" class="table-title">Submission</text>
  <line x1="810" y1="445" x2="970" y2="445" stroke="#343a40" stroke-width="1"/>
  <text x="810" y="460" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="810" y="475" class="field-text fk-field">assignment_id: ObjectId (FK)</text>
  <text x="810" y="490" class="field-text fk-field">student_id: ObjectId (FK)</text>
  <text x="810" y="505" class="field-text">file_url: String</text>
  <text x="810" y="520" class="field-text">plagiarism_score: Number</text>
  <text x="810" y="535" class="field-text">grade: Number</text>
  <text x="810" y="550" class="field-text">teacher_comments: String</text>
  <text x="810" y="565" class="field-text">submitted_at: Date</text>
  
  <!-- Message Table -->
  <rect x="50" y="250" width="180" height="180" class="table-box"/>
  <text x="140" y="270" text-anchor="middle" class="table-title">Message</text>
  <line x1="60" y1="275" x2="220" y2="275" stroke="#343a40" stroke-width="1"/>
  <text x="60" y="290" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="60" y="305" class="field-text fk-field">sender_id: ObjectId (FK)</text>
  <text x="60" y="320" class="field-text fk-field">receiver_id: ObjectId (FK)</text>
  <text x="60" y="335" class="field-text">content: String</text>
  <text x="60" y="350" class="field-text">message_type: String</text>
  <text x="60" y="365" class="field-text">file_url: String</text>
  <text x="60" y="380" class="field-text">reactions: Array</text>
  <text x="60" y="395" class="field-text">read: Boolean</text>
  <text x="60" y="410" class="field-text">delivered: Boolean</text>
  
  <!-- ForumPost Table -->
  <rect x="550" y="620" width="180" height="160" class="table-box"/>
  <text x="640" y="640" text-anchor="middle" class="table-title">ForumPost</text>
  <line x1="560" y1="645" x2="720" y2="645" stroke="#343a40" stroke-width="1"/>
  <text x="560" y="660" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="560" y="675" class="field-text fk-field">course_id: ObjectId (FK)</text>
  <text x="560" y="690" class="field-text fk-field">author_id: ObjectId (FK)</text>
  <text x="560" y="705" class="field-text">title: String</text>
  <text x="560" y="720" class="field-text">content: String</text>
  <text x="560" y="735" class="field-text">tags: Array</text>
  <text x="560" y="750" class="field-text">upvotes: Array</text>
  <text x="560" y="765" class="field-text">views: Number</text>
  
  <!-- ForumComment Table -->
  <rect x="800" y="620" width="180" height="140" class="table-box"/>
  <text x="890" y="640" text-anchor="middle" class="table-title">ForumComment</text>
  <line x1="810" y1="645" x2="970" y2="645" stroke="#343a40" stroke-width="1"/>
  <text x="810" y="660" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="810" y="675" class="field-text fk-field">post_id: ObjectId (FK)</text>
  <text x="810" y="690" class="field-text fk-field">author_id: ObjectId (FK)</text>
  <text x="810" y="705" class="field-text">content: String</text>
  <text x="810" y="720" class="field-text">upvotes: Array</text>
  <text x="810" y="735" class="field-text">is_answer: Boolean</text>
  <text x="810" y="750" class="field-text">createdAt: Date</text>
  
  <!-- DriveFile Table -->
  <rect x="1050" y="420" width="180" height="140" class="table-box"/>
  <text x="1140" y="440" text-anchor="middle" class="table-title">DriveFile</text>
  <line x1="1060" y1="445" x2="1220" y2="445" stroke="#343a40" stroke-width="1"/>
  <text x="1060" y="460" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="1060" y="475" class="field-text fk-field">course_id: ObjectId (FK)</text>
  <text x="1060" y="490" class="field-text fk-field">teacher_id: ObjectId (FK)</text>
  <text x="1060" y="505" class="field-text">file_name: String</text>
  <text x="1060" y="520" class="field-text">file_url: String</text>
  <text x="1060" y="535" class="field-text">file_size: Number</text>
  <text x="1060" y="550" class="field-text">uploaded_at: Date</text>
  
  <!-- Task Table -->
  <rect x="50" y="470" width="180" height="160" class="table-box"/>
  <text x="140" y="490" text-anchor="middle" class="table-title">Task</text>
  <line x1="60" y1="495" x2="220" y2="495" stroke="#343a40" stroke-width="1"/>
  <text x="60" y="510" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="60" y="525" class="field-text fk-field">user_id: ObjectId (FK)</text>
  <text x="60" y="540" class="field-text">title: String</text>
  <text x="60" y="555" class="field-text">category: String</text>
  <text x="60" y="570" class="field-text">date: Date</text>
  <text x="60" y="585" class="field-text">participants: Array</text>
  <text x="60" y="600" class="field-text">status: String</text>
  <text x="60" y="615" class="field-text">createdAt: Date</text>
  
  <!-- Review Table -->
  <rect x="300" y="420" width="180" height="120" class="table-box"/>
  <text x="390" y="440" text-anchor="middle" class="table-title">Review</text>
  <line x1="310" y1="445" x2="470" y2="445" stroke="#343a40" stroke-width="1"/>
  <text x="310" y="460" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="310" y="475" class="field-text fk-field">course_id: ObjectId (FK)</text>
  <text x="310" y="490" class="field-text fk-field">student_id: ObjectId (FK)</text>
  <text x="310" y="505" class="field-text">rating: Number</text>
  <text x="310" y="520" class="field-text">comment: String</text>
  <text x="310" y="535" class="field-text">createdAt: Date</text>
  
  <!-- Schedule Table -->
  <rect x="300" y="580" width="180" height="140" class="table-box"/>
  <text x="390" y="600" text-anchor="middle" class="table-title">Schedule</text>
  <line x1="310" y1="605" x2="470" y2="605" stroke="#343a40" stroke-width="1"/>
  <text x="310" y="620" class="field-text pk-field">_id: ObjectId (PK)</text>
  <text x="310" y="635" class="field-text fk-field">course_id: ObjectId (FK)</text>
  <text x="310" y="650" class="field-text fk-field">teacher_id: ObjectId (FK)</text>
  <text x="310" y="665" class="field-text">day: String</text>
  <text x="310" y="680" class="field-text">start_time: String</text>
  <text x="310" y="695" class="field-text">end_time: String</text>
  <text x="310" y="710" class="field-text">room_number: String</text>
  
  <!-- Relationships -->
  
  <!-- User to Student (1:1) -->
  <line x1="230" y1="120" x2="300" y2="120" class="one-to-many"/>
  <polygon points="295,115 305,120 295,125" class="arrow"/>
  <text x="265" y="115" class="field-text">1:1</text>
  
  <!-- User to Teacher (1:1) -->
  <line x1="230" y1="150" x2="280" y2="150" class="one-to-many"/>
  <line x1="280" y1="150" x2="280" y2="290" class="one-to-many"/>
  <line x1="280" y1="290" x2="300" y2="290" class="one-to-many"/>
  <polygon points="295,285 305,290 295,295" class="arrow"/>
  <text x="240" y="145" class="field-text">1:1</text>
  
  <!-- Student to Enrollment (1:N) -->
  <line x1="480" y1="120" x2="550" y2="120" class="one-to-many"/>
  <polygon points="545,115 555,120 545,125" class="arrow"/>
  <text x="515" y="115" class="field-text">1:N</text>
  
  <!-- Course to Enrollment (1:N) -->
  <line x1="640" y1="220" x2="640" y2="170" class="one-to-many"/>
  <polygon points="635,175 640,165 645,175" class="arrow"/>
  <text x="645" y="195" class="field-text">1:N</text>
  
  <!-- Teacher to Course (1:N) -->
  <line x1="480" y1="290" x2="550" y2="290" class="one-to-many"/>
  <polygon points="545,285 555,290 545,295" class="arrow"/>
  <text x="515" y="285" class="field-text">1:N</text>
  
  <!-- Course to ClassSession (1:N) -->
  <line x1="730" y1="300" x2="800" y2="300" class="one-to-many"/>
  <polygon points="795,295 805,300 795,305" class="arrow"/>
  <text x="765" y="295" class="field-text">1:N</text>
  
  <!-- ClassSession to AttendanceRecord (1:N) -->
  <line x1="980" y1="300" x2="1050" y2="300" class="one-to-many"/>
  <polygon points="1045,295 1055,300 1045,305" class="arrow"/>
  <text x="1015" y="295" class="field-text">1:N</text>
  
  <!-- Student to AttendanceRecord (1:N) -->
  <path d="M 480 120 Q 1000 120 1140 220" class="one-to-many" fill="none"/>
  <polygon points="1135,225 1145,220 1140,215" class="arrow"/>
  <text x="800" y="115" class="field-text">1:N</text>
  
  <!-- Course to Assignment (1:N) -->
  <line x1="640" y1="380" x2="640" y2="420" class="one-to-many"/>
  <polygon points="635,415 640,425 645,415" class="arrow"/>
  <text x="645" y="400" class="field-text">1:N</text>
  
  <!-- Assignment to Submission (1:N) -->
  <line x1="730" y1="490" x2="800" y2="490" class="one-to-many"/>
  <polygon points="795,485 805,490 795,495" class="arrow"/>
  <text x="765" y="485" class="field-text">1:N</text>
  
  <!-- Student to Submission (1:N) -->
  <path d="M 480 190 Q 890 190 890 420" class="one-to-many" fill="none"/>
  <polygon points="885,415 890,425 895,415" class="arrow"/>
  <text x="680" y="185" class="field-text">1:N</text>
  
  <!-- User to Message (1:N) sender -->
  <line x1="140" y1="210" x2="140" y2="250" class="one-to-many"/>
  <polygon points="135,245 140,255 145,245" class="arrow"/>
  <text x="145" y="230" class="field-text">1:N</text>
  
  <!-- Course to ForumPost (1:N) -->
  <line x1="640" y1="380" x2="640" y2="620" class="one-to-many"/>
  <polygon points="635,615 640,625 645,615" class="arrow"/>
  <text x="645" y="500" class="field-text">1:N</text>
  
  <!-- ForumPost to ForumComment (1:N) -->
  <line x1="730" y1="700" x2="800" y2="700" class="one-to-many"/>
  <polygon points="795,695 805,700 795,705" class="arrow"/>
  <text x="765" y="695" class="field-text">1:N</text>
  
  <!-- Course to DriveFile (1:N) -->
  <line x1="730" y1="380" x2="1140" y2="380" class="one-to-many"/>
  <line x1="1140" y1="380" x2="1140" y2="420" class="one-to-many"/>
  <polygon points="1135,415 1140,425 1145,415" class="arrow"/>
  <text x="935" y="375" class="field-text">1:N</text>
  
  <!-- User to Task (1:N) -->
  <line x1="140" y1="210" x2="140" y2="470" class="one-to-many"/>
  <polygon points="135,465 140,475 145,465" class="arrow"/>
  <text x="145" y="340" class="field-text">1:N</text>
  
  <!-- Student to Review (1:N) -->
  <line x1="390" y1="190" x2="390" y2="420" class="one-to-many"/>
  <polygon points="385,415 390,425 395,415" class="arrow"/>
  <text x="395" y="305" class="field-text">1:N</text>
  
  <!-- Course to Review (1:N) -->
  <path d="M 550 300 Q 390 300 390 420" class="one-to-many" fill="none"/>
  <polygon points="385,415 390,425 395,415" class="arrow"/>
  <text x="470" y="295" class="field-text">1:N</text>
  
  <!-- Teacher to Schedule (1:N) -->
  <line x1="390" y1="360" x2="390" y2="580" class="one-to-many"/>
  <polygon points="385,575 390,585 395,575" class="arrow"/>
  <text x="395" y="470" class="field-text">1:N</text>
  
  <!-- Legend -->
  <rect x="1050" y="50" width="300" height="120" fill="#f8f9fa" stroke="#343a40" stroke-width="1"/>
  <text x="1200" y="70" text-anchor="middle" class="table-title">Legend</text>
  <line x1="1060" y1="75" x2="1340" y2="75" stroke="#343a40" stroke-width="1"/>
  
  <rect x="1060" y="85" width="15" height="10" class="primary-table"/>
  <text x="1080" y="93" class="field-text">Core Entity (User)</text>
  
  <rect x="1060" y="100" width="15" height="10" class="secondary-table"/>
  <text x="1080" y="108" class="field-text">User Extensions</text>
  
  <rect x="1060" y="115" width="15" height="10" class="tertiary-table"/>
  <text x="1080" y="123" class="field-text">Main Business Entity</text>
  
  <rect x="1060" y="130" width="15" height="10" class="table-box"/>
  <text x="1080" y="138" class="field-text">Supporting Entities</text>
  
  <line x1="1060" y1="150" x2="1100" y2="150" class="one-to-many"/>
  <polygon points="1095,145 1105,150 1095,155" class="arrow"/>
  <text x="1110" y="153" class="field-text">One-to-Many Relationship</text>
  
</svg>

## Relationship Summary

### Core Relationships

1. **User → Student/Teacher (1:1)**
   - Each user can be either a student or teacher (role-based)
   - Separate tables for student and teacher specific attributes

2. **Student → Enrollment → Course (Many-to-Many)**
   - Students can enroll in multiple courses
   - Courses can have multiple students
   - Enrollment table manages the relationship with status

3. **Teacher → Course (1:N)**
   - Each teacher can teach multiple courses
   - Each course is taught by one teacher

4. **Course → ClassSession (1:N)**
   - Each course can have multiple class sessions
   - Each session belongs to one course

5. **ClassSession → AttendanceRecord (1:N)**
   - Each session can have multiple attendance records
   - Each attendance record belongs to one session

6. **Student → AttendanceRecord (1:N)**
   - Each student can have multiple attendance records
   - Each attendance record belongs to one student

### Assignment & Submission Flow

7. **Course → Assignment (1:N)**
   - Each course can have multiple assignments
   - Each assignment belongs to one course

8. **Assignment → Submission (1:N)**
   - Each assignment can have multiple submissions
   - Each submission belongs to one assignment

9. **Student → Submission (1:N)**
   - Each student can make multiple submissions
   - Each submission belongs to one student

### Communication & Collaboration

10. **User → Message (1:N)**
    - Each user can send/receive multiple messages
    - Messages support sender and receiver relationships

11. **Course → ForumPost (1:N)**
    - Each course can have multiple forum posts
    - Each post belongs to one course

12. **ForumPost → ForumComment (1:N)**
    - Each post can have multiple comments
    - Comments support nested replies

### Additional Features

13. **Course → DriveFile (1:N)**
    - Each course can have multiple shared files
    - Files are managed by teachers

14. **User → Task (1:N)**
    - Each user can create multiple tasks
    - Tasks support collaboration with participants

15. **Student → Review (1:N) & Course → Review (1:N)**
    - Students can review multiple courses
    - Courses can receive multiple reviews

16. **Teacher → Schedule (1:N)**
    - Teachers can have multiple scheduled classes
    - Schedules define recurring class timings

## Key Design Principles

### 1. **Referential Integrity**
- All foreign key relationships are validated using pre-save hooks
- Ensures data consistency across related entities

### 2. **Performance Optimization**
- Strategic indexing on frequently queried fields
- Compound indexes for complex queries
- Unique constraints where appropriate

### 3. **Scalability**
- Modular schema design allows for easy extension
- Separate concerns (user management, course management, communication)
- Support for horizontal scaling through proper indexing

### 4. **Data Integrity**
- Enum constraints for status fields
- Required field validation
- Unique constraints for business rules (e.g., one review per student per course)

### 5. **Flexibility**
- JSON/Map fields for dynamic content (syllabus, message reactions)
- Support for multimedia content in messages
- Extensible user roles and permissions

This schema design supports a comprehensive educational platform with real-time communication, attendance tracking, assignment management, and collaborative features while maintaining data integrity and performance.