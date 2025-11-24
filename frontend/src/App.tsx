import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import HomePage from './pages/Home'
import TicketList from './pages/TicketList'
import CreateTicket from './pages/CreateTicket'
import TicketDetail from './pages/TicketDetail'
import KnowledgeBase from './pages/KnowledgeBase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {isLoginPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      ) : (
        <AppLayout>
          <Routes>
            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/tickets" element={<PrivateRoute><TicketList /></PrivateRoute>} />
            <Route path="/tickets/new" element={<PrivateRoute><CreateTicket /></PrivateRoute>} />
            <Route path="/tickets/:id" element={<PrivateRoute><TicketDetail /></PrivateRoute>} />
            <Route path="/kb" element={<PrivateRoute><KnowledgeBase /></PrivateRoute>} />
            {/* Redirect any unknown route to dashboard or home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      )}
    </>
  )
}

export default App
