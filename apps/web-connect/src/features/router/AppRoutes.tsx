import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import Sandbox from '../sandbox/Sandbox';

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Sandbox/>} />
      </Routes>
    </Router>
  );
}