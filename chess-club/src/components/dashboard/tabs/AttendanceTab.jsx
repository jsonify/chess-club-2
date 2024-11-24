import { Search, CheckCircle } from 'lucide-react';

export default function AttendanceTab({
  searchQuery,
  setSearchQuery,
  students,
  attendance,
  toggleAttendance,
  loading
}) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-medium">Today's Attendance</h2>
            <p className="text-sm text-gray-500">Track student check-in/check-out</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="divide-y">
        {students
          .filter(student =>
            student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.teacher.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(student => (
            <div
              key={student.id}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 ${
                attendance[student.id]?.checkedIn ? 'bg-blue-50' : ''
              }`}
            >
              <div>
                <div className="font-medium text-gray-900">
                  {student.first_name} {student.last_name}
                </div>
                <div className="text-sm text-gray-500">
                  Grade {student.grade} - {student.teacher}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleAttendance(student.id, 'checkin')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                    attendance[student.id]?.checkedIn
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>In</span>
                </button>
                <button
                  onClick={() => toggleAttendance(student.id, 'checkout')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                    attendance[student.id]?.checkedOut
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={!attendance[student.id]?.checkedIn}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Out</span>
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}