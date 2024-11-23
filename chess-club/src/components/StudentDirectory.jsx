import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students when grade filter or search changes
  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        
        // Start with base query
        let query = supabase
          .from('students')
          .select('*')
          .order('grade')
          .order('last_name');

        // Add grade filter if not showing all
        if (selectedGrade !== 'all') {
          query = query.eq('grade', selectedGrade);
        }

        // Add search filter if there's a search query
        if (searchQuery) {
          query = query.or(
            `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
          );
        }

        const { data, error } = await query;

        if (error) throw error;

        setStudents(data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [selectedGrade, searchQuery]);

  // Group students by grade
  const studentsByGrade = students.reduce((acc, student) => {
    if (!acc[student.grade]) {
      acc[student.grade] = [];
    }
    acc[student.grade].push(student);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Chess Club Students</h1>
        
        {/* Controls */}
        <div className="flex gap-4 mb-4">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="all">All Grades</option>
            {['2', '3', '4', '5', '6'].map((grade) => (
              <option key={grade} value={grade}>Grade {grade}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading students...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {/* Student list */}
        {!loading && !error && (
          <div className="space-y-8">
            {Object.entries(studentsByGrade).map(([grade, gradeStudents]) => (
              <div key={grade} className="bg-white rounded-lg shadow">
                <div className="px-4 py-3 bg-gray-50 rounded-t-lg border-b">
                  <h2 className="font-semibold text-gray-900">
                    Grade {grade} - {gradeStudents.length} students
                  </h2>
                </div>
                <div className="divide-y">
                  {gradeStudents.map((student) => (
                    <div key={student.id} className="px-4 py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.teacher}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}