import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Licenses } from "../licenses/Licenses.tsx";
import { Homepage } from "../home/Homepage.tsx";
import Sidebar from "../sidebar/SidebarRoot";

export function AppRoutes() {
  return (
    <Router>
      <div className="flex">
        <div className="w-64 h-screen">
          <Sidebar/>
        </div>
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/licenses" element={<Licenses />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}