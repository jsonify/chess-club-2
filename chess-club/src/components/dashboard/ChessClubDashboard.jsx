import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChessClubHeader from './ChessClubHeader';
import DashboardStats from './DashboardStats';
import AttendanceTab from './AttendanceTab';
import TournamentTab from './TournamentTab';
import StudentsTab from './StudentsTab';
import ClubDayAlert from './ClubDayAlert';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ChessClubDashboard() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [attendance, setAttendance] = useState({});
  const [students, setStudents] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [achievementStats, setAchievementStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Club session configuration
  const sessionConfig = {
    start: "3:30 PM",
    end: "4:00 PM",
    isClubDay: new Date().getDay() === 3 // Wednesday
  };

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .order('grade')
          .order('last_name');
        
        if (studentsError) throw studentsError;

        // Fetch today's attendance
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('session_date', new Date().toISOString().split('T')[0]);

        if (attendanceError) throw attendanceError;

        // Fetch recent matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (matchesError) throw matchesError;

        // Fetch achievement stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_achievement_stats');

        if (statsError) throw statsError;

        // Update state with fetched data
        setStudents(studentsData || []);
        setAttendance(
          (attendanceData || []).reduce((acc, record) => ({
            ...acc,
            [record.student_id]: true
          }), {})
        );
        setRecentMatches(matchesData || []);
        setAchievementStats(statsData || {});
        setError(null);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Derived state calculations
  const stats = {
    totalStudents: students.length,
    presentCount: Object.values(attendance).filter(Boolean).length,
    attendanceRate: students.length 
      ? Math.round((Object.values(attendance).filter(Boolean).length / students.length) * 100) 
      : 0
  };

  // Event handlers
  const handleAttendanceToggle = async (studentId) => {
    try {
      const isPresent = !attendance[studentId];
      
      if (isPresent) {
        // Check in student
        const { error: checkInError } = await supabase
          .from('attendance_records')
          .insert([{
            student_id: studentId,
            session_date: new Date().toISOString().split('T')[0],
            check_in_time: new Date().toISOString()
          }]);

        if (checkInError) throw checkInError;
      } else {
        // Check out student
        const { error: checkOutError } = await supabase
          .from('attendance_records')
          .update({ check_out_time: new Date().toISOString() })
          .match({ 
            student_id: studentId,
            session_date: new Date().toISOString().split('T')[0]
          });

        if (checkOutError) throw checkOutError;
      }

      // Update local state
      setAttendance(prev => ({
        ...prev,
        [studentId]: isPresent
      }));

    } catch (err) {
      setError(`Failed to update attendance: ${err.message}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ChessClubHeader sessionConfig={sessionConfig} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {error && <ErrorMessage message={error} />}
        
        {sessionConfig.isClubDay && (
          <ClubDayAlert 
            startTime={sessionConfig.start} 
            endTime={sessionConfig.end} 
          />
        )}

        <DashboardStats 
          stats={stats}
          recentMatches={recentMatches}
        />

        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <AttendanceTab 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              students={students}
              attendance={attendance}
              onAttendanceToggle={handleAttendanceToggle}
            />
          </TabsContent>

          <TabsContent value="tournaments">
            <TournamentTab 
              achievementStats={achievementStats}
              recentMatches={recentMatches}
            />
          </TabsContent>

          <TabsContent value="students">
            <StudentsTab 
              students={students}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}