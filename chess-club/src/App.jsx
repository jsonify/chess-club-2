import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import RootLayout from '@/components/layout/RootLayout';
import Dashboard from '@/pages/Dashboard';
import Registration from '@/pages/Registration';
import Tournaments from '@/pages/Tournaments';
import StudentDirectory from '@/pages/StudentDirectory';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="registration" element={<Registration />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="students" element={<StudentDirectory />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}