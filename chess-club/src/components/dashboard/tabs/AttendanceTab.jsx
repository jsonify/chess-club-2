import React from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, Typography, InputAdornment, TextField } from '@mui/material';

export default function AttendanceTab({
  searchQuery,
  setSearchQuery,
  students,
  attendance,
  toggleAttendance
}) {
  return (
    <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
      <CardHeader
        title="Today's Attendance"
        subheader="Track student check-in/check-out"
        sx={{ backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'grey.200' }}
      />
      <CardContent>
        <div className="mb-4">
          <TextField
            placeholder="Search by name or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="h-5 w-5 text-gray-400" />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            fullWidth
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
                <Typography variant="body1" className="font-medium text-gray-900">
                  {student.name}
                </Typography>
                <Typography variant="body2" color="grey.500">
                  Grade {student.grade} - {student.teacher}
                </Typography>
              </div>
              <div
                className={`h-6 w-6 rounded-full ${
                  attendance[student.id] ? 'text-green-500' : 'border-2 border-gray-300'
                }`}
              >
                {attendance[student.id] && <CheckCircle className="h-6 w-6" />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}