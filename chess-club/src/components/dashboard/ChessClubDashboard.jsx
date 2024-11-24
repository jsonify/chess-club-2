import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate, isWednesday } from '@/lib/utils';
import { toast } from 'sonner';
import ChessClubHeader from './ChessClubHeader';
import DashboardStats from './DashboardStats';
import ClubDayAlert from './alerts/ClubDayAlert';
import AttendanceTab from './tabs/AttendanceTab';
import StudentsTab from './tabs/StudentsTab';
import TournamentTab from './tabs/TournamentTab';

export default function ChessClubDashboard() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [achievementStats, setAchievementStats] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    attendanceRate: 0,
    activeMatches: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch students with attendance status
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select(`
            *,
            attendance_records!inner(
              check_in_time,
              check_out_time,
              session_id,
              attendance_sessions!inner(
                session_date
              )
            )
          `)
          .eq('active', true)
          .order('grade')
          .order('last_name');
          
        if (studentsError) throw studentsError;

        // Process attendance data
        const today = formatDate(new Date());
        const attendanceMap = {};
        studentsData?.forEach(student => {
          const todayAttendance = student.attendance_records?.find(record => 
            formatDate(record.attendance_sessions.session_date) === today
          );
          if (todayAttendance) {
            attendanceMap[student.id] = true;
          }
        });

        setStudents(studentsData || []);
        setAttendance(attendanceMap);

        // Fetch recent matches if the table exists
        try {
          const { data: matches, error: matchesError } = await supabase
            .from('matches')
            .select(`
              *,
              player1:students!player1_id(first_name, last_name),
              player2:students!player2_id(first_name, last_name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

          if (!matchesError) {
            setRecentMatches(matches || []);
          }
        } catch (matchError) {
          console.log('Matches table not available:', matchError);
        }

        // Update dashboard stats
        setStats({
          totalStudents: studentsData?.length || 0,
          presentToday: Object.keys(attendanceMap).length,
          attendanceRate: studentsData?.length 
            ? Math.round((Object.keys(attendanceMap).length / studentsData.length) * 100) 
            : 0,
          activeMatches: 0 // We'll update this when matches functionality is added
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const toggleAttendance = async (studentId) => {
    try {
      const isPresent = attendance[studentId];
      const today = formatDate(new Date());
      
      if (isPresent) {
        // First find the session_id for today
        const { data: sessionData } = await supabase
          .from('attendance_sessions')
          .select('id')
          .eq('session_date', today)
          .single();

        if (!sessionData) {
          throw new Error('No session found for today');
        }

        // Then delete the attendance record
        await supabase
          .from('attendance_records')
          .delete()
          .match({ 
            student_id: studentId, 
            session_id: sessionData.id 
          });
      } else {
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
        await supabase
          .from('attendance_records')
          .insert([{ 
            student_id: studentId,
            session_id: sessionData.id,
            check_in_time: new Date().toISOString()
          }]);
      }

      // Update local state
      setAttendance(prev => ({
        ...prev,
        [studentId]: !isPresent
      }));

      // Update stats
      setStats(prev => ({
        ...prev,
        presentToday: !isPresent ? prev.presentToday + 1 : prev.presentToday - 1,
        attendanceRate: Math.round(((prev.presentToday + (!isPresent ? 1 : -1)) / prev.totalStudents) * 100)
      }));

    } catch (err) {
      console.error('Error toggling attendance:', err);
      toast.error(err.message || 'Failed to update attendance');
    }
  };

  return (
    <div className="space-y-6">
      <ChessClubHeader />
      
      {isWednesday(new Date()) && <ClubDayAlert />}
      
      <DashboardStats 
        stats={stats} 
        loading={loading} 
        error={error} 
      />

      <div className="space-y-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['attendance', 'students', 'tournaments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-4">
          {activeTab === 'attendance' && (
            <AttendanceTab 
              students={students}
              attendance={attendance}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              toggleAttendance={toggleAttendance}
              loading={loading}
            />
          )}
          {activeTab === 'students' && (
            <StudentsTab 
              students={students}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loading={loading}
            />
          )}
          {activeTab === 'tournaments' && (
            <TournamentTab 
              achievementStats={achievementStats}
              recentMatches={recentMatches}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}