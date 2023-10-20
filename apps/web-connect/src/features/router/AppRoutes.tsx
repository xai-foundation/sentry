import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import {Sandbox} from "../sandbox";

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Sandbox/>} />
      </Routes>
    </Router>
  );
}
