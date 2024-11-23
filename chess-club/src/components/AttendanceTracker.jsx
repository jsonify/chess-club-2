// AttendanceTracker.jsx
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { AttendanceStats } from './AttendanceStats';

export default function AttendanceTracker() {
  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState({});
  const [students] = useState([
    { id: 1, name: 'Emma Smith', grade: 2, teacher: 'Ms. Johnson' },
    { id: 2, name: 'Liam Brown', grade: 2, teacher: 'Ms. Johnson' },
    { id: 3, name: 'Olivia Davis', grade: 3, teacher: 'Mr. Wilson' },
    { id: 4, name: 'Noah Garcia', grade: 3, teacher: 'Mr. Wilson' },
    { id: 5, name: 'Ava Miller', grade: 4, teacher: 'Mrs. Davis' }
  ]);

  // Calculate stats directly instead of using a separate state
  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter(Boolean).length;
  const attendanceRate = totalStudents ? Math.round((presentCount / totalStudents) * 100) : 0;

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.teacher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Sherwood Elementary Chess Club
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <AttendanceStats 
          totalStudents={totalStudents}
          presentCount={presentCount}
          attendanceRate={attendanceRate}
        />

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or teacher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="divide-y">
            {filteredStudents.map(student => (
              <div 
                key={student.id}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer ${
                  attendance[student.id] ? 'bg-blue-50' : ''
                }`}
                onClick={() => toggleAttendance(student.id)}
              >
                <div>
                  <div className="font-medium text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-500">
                    Grade {student.grade} - {student.teacher}
                  </div>
                </div>
                <div className={`h-6 w-6 rounded-full ${
                  attendance[student.id] 
                    ? 'text-green-500' 
                    : 'border-2 border-gray-300'
                }`}>
                  {attendance[student.id] && <CheckCircle className="h-6 w-6" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}