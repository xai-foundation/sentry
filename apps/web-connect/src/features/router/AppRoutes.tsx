import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import {Checkout} from "../checkout";

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Checkout/>} />
      </Routes>
    </Router>
  );
}
