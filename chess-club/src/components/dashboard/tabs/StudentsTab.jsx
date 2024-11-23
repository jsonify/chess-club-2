import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function StudentsTab({ students, searchQuery, setSearchQuery }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Directory</CardTitle>
        <CardDescription>View and manage student information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Grade Level Summary */}
          <div className="grid grid-cols-5 gap-4">
            {[2, 3, 4, 5, 6].map(grade => (
              <div key={grade} className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-gray-600">Grade {grade}</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.grade === grade).length}
                </p>
              </div>
            ))}
          </div>

          {/* Student List */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="divide-y">
              {students.map(student => (
                <div key={student.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">
                        Grade {student.grade} - {student.teacher}
                      </p>
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