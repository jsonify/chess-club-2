import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Pencil, Check, X } from 'lucide-react';

// `teacherOptions` (names) and `onTeacherChange(student, newTeacher)` are optional;
// when both are given, each row gets a control to change the student's teacher.
export default function StudentTable({ students, teacherOptions, onTeacherChange }) {
  const [editingId, setEditingId] = useState(null);
  const [editTeacher, setEditTeacher] = useState('');
  const [saving, setSaving] = useState(false);
  const canEditTeacher = Boolean(onTeacherChange && teacherOptions);

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditTeacher(student.teacher || '');
  };

  const saveTeacher = async (student) => {
    if (!editTeacher || editTeacher === student.teacher) {
      setEditingId(null);
      return;
    }
    setSaving(true);
    try {
      await onTeacherChange(student, editTeacher);
      setEditingId(null);
    } catch {
      // The caller reports the error; keep the row in edit mode so it can be retried.
    } finally {
      setSaving(false);
    }
  };

  const [sortConfig, setSortConfig] = useState({
    key: 'last_name',
    direction: 'asc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');

  // Sort function
  const sortedStudents = [...students].sort((a, b) => {
    if (sortConfig.key === 'name') {
      const nameA = `${a.last_name}, ${a.first_name}`.toLowerCase();
      const nameB = `${b.last_name}, ${b.first_name}`.toLowerCase();
      return sortConfig.direction === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Filter function
  const filteredStudents = sortedStudents.filter(student => {
    const matchesSearch = (
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.teacher || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesGrade = filterGrade === 'all' || student.grade.toString() === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const requestSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: 
        current.key === key && current.direction === 'asc' 
          ? 'desc' 
          : 'asc',
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-500" />
      : <ChevronDown className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg w-full sm:w-64"
            />
          </div>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Grades</option>
            {[2, 3, 4, 5, 6].map(grade => (
              <option key={grade} value={grade.toString()}>
                Grade {grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  <SortIcon columnKey="name" />
                </div>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('grade')}
              >
                <div className="flex items-center gap-1">
                  Grade
                  <SortIcon columnKey="grade" />
                </div>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('teacher')}
              >
                <div className="flex items-center gap-1">
                  Teacher
                  <SortIcon columnKey="teacher" />
                </div>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {student.last_name}, {student.first_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.grade}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === student.id ? (
                    <div className="flex items-center gap-1">
                      <select
                        value={editTeacher}
                        onChange={(e) => setEditTeacher(e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm"
                        autoFocus
                      >
                        {/* Keep the current teacher selectable even if they've been deactivated */}
                        {[...new Set([student.teacher, ...teacherOptions].filter(Boolean))]
                          .sort((a, b) => a.localeCompare(b))
                          .map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => saveTeacher(student)}
                        disabled={saving}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                        aria-label="Save teacher"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
                        aria-label="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      {student.teacher}
                      {canEditTeacher && (
                        <button
                          type="button"
                          onClick={() => startEdit(student)}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded-md"
                          aria-label={`Change teacher for ${student.first_name} ${student.last_name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {filteredStudents.length} of {students.length} students
        </p>
      </div>
    </div>
  );
}