import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent, Typography, InputAdornment, TextField } from '@mui/material';

export default function StudentsTab({ students, searchQuery, setSearchQuery }) {
  return (
    <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
      <CardHeader
        title="Student Directory"
        subheader="View and manage student information"
        sx={{ backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'grey.200' }}
      />
      <CardContent>
        <div className="space-y-4">
          {/* Grade Level Summary */}
          <div className="grid grid-cols-5 gap-4">
            {[2, 3, 4, 5, 6].map(grade => (
              <div key={grade} className="bg-gray-50 p-4 rounded-lg text-center">
                <Typography variant="body1" color="grey.600" fontWeight="medium">
                  Grade {grade}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {students.filter(s => s.grade === grade).length}
                </Typography>
              </div>
            ))}
          </div>

          {/* Student List */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <TextField
                placeholder="Search students..."
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
                <div key={student.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Typography variant="body1" fontWeight="medium">
                        {student.name}
                      </Typography>
                      <Typography variant="body2" color="grey.600">
                        Grade {student.grade} - {student.teacher}
                      </Typography>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}