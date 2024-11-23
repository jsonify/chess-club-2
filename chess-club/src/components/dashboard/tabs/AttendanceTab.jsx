import React from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AttendanceTab({ 
  searchQuery, 
  setSearchQuery, 
  students, 
  attendance, 
  toggleAttendance 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Attendance</CardTitle>
        <CardDescription>Track student check-in/check-out</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <div className="divide-y">
          {students.map(student => (
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
      </CardContent>
    </Card>
  );
}