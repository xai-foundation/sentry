import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Licenses } from "../licenses/Licenses.tsx";
import { Homepage } from "../home/Homepage.tsx";
import {Sidebar} from "../sidebar";
import {Operator} from "../operator/Operator.tsx";

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
            <Route path="/operator" element={<Operator />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
