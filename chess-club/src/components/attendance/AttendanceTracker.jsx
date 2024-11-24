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
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/login');
        return;
      }
      fetchStudentsAndAttendance();
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  async function fetchStudentsAndAttendance() {
    try {
      setLoading(true);

      // Fetch students with attendance status
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          attendance_records(check_in_time, check_out_time, session_id, 
            attendance_sessions(session_date)
          )
        `)
        .eq('active', true)
        .order('grade')
        .order('last_name');

      if (studentsError) {
        throw studentsError;
      }

      // Process attendance data
      const today = formatDate(new Date());
      const nextWednesday = formatDate(getNextWednesday());
      const attendanceMap = {};
      
      studentsData?.forEach(student => {
        const todayAttendance = student.attendance_records?.find(record =>
          formatDate(record.attendance_sessions.session_date) === (isWednesday(new Date()) ? today : nextWednesday)
        );
        
        attendanceMap[student.id] = {
          checkedIn: !!todayAttendance?.check_in_time,
          checkedOut: !!todayAttendance?.check_out_time
        };
      });

      setStudents(studentsData || []);
      setAttendance(attendanceMap);
    } catch (err) {
      console.error('Error fetching students and attendance:', err);
      toast.error('Failed to load students and attendance data');
    } finally {
      setLoading(false);
    }
  }

  const toggleAttendance = async (studentId, action) => {
    if (!session) {
      toast.error('Please log in to manage attendance');
      navigate('/login');
      return;
    }

    try {
      const today = formatDate(new Date());

      if (action === 'checkin') {
        // First get or create today's session
        let { data: sessionData } = await supabase
          .from('attendance_sessions')
          .select('id')
          .eq('session_date', today)
          .single();

        if (!sessionData) {
          // Create new session for today
          const { data: newSession, error: sessionError } = await supabase
            .from('attendance_sessions')
            .insert([{
              session_date: today,
              start_time: '15:30',
              end_time: '16:00'
            }])
            .select()
            .single();

          if (sessionError) throw sessionError;
          sessionData = newSession;
        }

        // Then create the attendance record
        const { error: recordError } = await supabase
          .from('attendance_records')
          .insert([{
            student_id: studentId,
            session_id: sessionData.id,
            check_in_time: new Date().toISOString()
          }]);

        if (recordError) throw recordError;

      } else if (action === 'checkout') {
        // First find the session_id for today
        const { data: sessionData } = await supabase
          .from('attendance_sessions')
          .select('id')
          .eq('session_date', today)
          .single();

        if (!sessionData) {
          throw new Error('No session found for today');
        }

        // Then update the attendance record
        const { error: updateError } = await supabase
          .from('attendance_records')
          .update({ check_out_time: new Date().toISOString() })
          .match({
            student_id: studentId,
            session_id: sessionData.id
          });

        if (updateError) throw updateError;
      }

      // Update local state
      setAttendance(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [action === 'checkin' ? 'checkedIn' : 'checkedOut']: true
        }
      }));

      toast.success(
        action === 'checkin' 
          ? 'Student checked in successfully' 
          : 'Student checked out successfully'
      );

    } catch (err) {
      console.error('Error toggling attendance:', err);
      toast.error(`Failed to ${action === 'checkin' ? 'check in' : 'check out'} student`);
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
                ? `Today's Attendance (${formatDate(new Date())})`
                : `Next Wednesday's Attendance (${formatDate(getNextWednesday())})`}
            </h2>
            <p className="text-gray-500 text-sm">
              Sherwood Elementary Chess Club
            </p>
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