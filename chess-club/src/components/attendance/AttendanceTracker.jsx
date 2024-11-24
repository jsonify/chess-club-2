import { useState, useEffect } from 'react';
import { CheckCircle, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate, getNextWednesday, isWednesday } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function AttendanceTracker() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    attendanceRate: 0
  });
  const navigate = useNavigate();

  // Get today or next Wednesday's date
  const targetDate = isWednesday(new Date()) ? new Date() : getNextWednesday();
  const formattedTargetDate = formatDate(targetDate);

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, []);

  async function fetchStudentsAndAttendance() {
    try {
      setLoading(true);

      // First, get all active students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('active', true)
        .order('grade')
        .order('last_name');

      if (studentsError) throw studentsError;

      // Then, get attendance records for the target date
      const { data: sessionData } = await supabase
        .from('attendance_sessions')
        .select('id')
        .eq('session_date', formattedTargetDate)
        .single();

      let attendanceMap = {};
      
      if (sessionData) {
        const { data: attendanceRecords } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('session_id', sessionData.id);

        if (attendanceRecords) {
          attendanceRecords.forEach(record => {
            attendanceMap[record.student_id] = {
              checkedIn: !!record.check_in_time,
              checkedOut: !!record.check_out_time
            };
          });
        }
      }

      setStudents(studentsData || []);
      setAttendance(attendanceMap);
      setStats({
        totalStudents: studentsData?.length || 0,
        presentToday: Object.values(attendanceMap).filter(a => a.checkedIn).length,
        attendanceRate: studentsData?.length
          ? Math.round((Object.values(attendanceMap).filter(a => a.checkedIn).length / studentsData.length) * 100)
          : 0
      });

    } catch (err) {
      console.error('Error fetching students and attendance:', err);
      toast.error('Failed to load students and attendance data');
    } finally {
      setLoading(false);
    }
  }

  const toggleAttendance = async (studentId, action) => {
    try {
      // First get or create session for target date
      let { data: sessionData } = await supabase
        .from('attendance_sessions')
        .select('id')
        .eq('session_date', formattedTargetDate)
        .single();

      if (!sessionData) {
        const { data: newSession, error: sessionError } = await supabase
          .from('attendance_sessions')
          .insert([{
            session_date: formattedTargetDate,
            start_time: '15:30',
            end_time: '16:00'
          }])
          .select()
          .single();

        if (sessionError) throw sessionError;
        sessionData = newSession;
      }

      // Check if record already exists
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .eq('session_id', sessionData.id)
        .single();

      if (action === 'checkin') {
        if (existingRecord) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('attendance_records')
            .update({
              check_in_time: existingRecord.check_in_time ? null : new Date().toISOString()
            })
            .eq('id', existingRecord.id);

          if (updateError) throw updateError;
        } else {
          // Create new record
          const { error: insertError } = await supabase
            .from('attendance_records')
            .insert([{
              student_id: studentId,
              session_id: sessionData.id,
              check_in_time: new Date().toISOString()
            }]);

          if (insertError) throw insertError;
        }
      } else if (action === 'checkout' && existingRecord) {
        // Handle checkout
        const { error: updateError } = await supabase
          .from('attendance_records')
          .update({
            check_out_time: existingRecord.check_out_time ? null : new Date().toISOString()
          })
          .eq('id', existingRecord.id);

        if (updateError) throw updateError;
      }

      // Refresh attendance data
      await fetchStudentsAndAttendance();

      toast.success(
        action === 'checkin' 
          ? existingRecord?.check_in_time 
            ? 'Check-in removed'
            : 'Student checked in'
          : existingRecord?.check_out_time
            ? 'Check-out removed'
            : 'Student checked out'
      );

    } catch (err) {
      console.error('Error toggling attendance:', err);
      toast.error(`Failed to update attendance: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-medium">
              {isWednesday(new Date())
                ? "Today's Attendance"
                : "Next Wednesday's Attendance"} ({formattedTargetDate})
            </h2>
            <p className="text-gray-500 text-sm">
              Track student attendance
            </p>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search students..."
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