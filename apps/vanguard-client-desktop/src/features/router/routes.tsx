import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import {Licenses} from "../licenses/Licenses.tsx";
import {Homepage} from "../home/Homepage.tsx";
import {Sidebar} from "../sidebar";
import {Operator} from "../operator/Operator.tsx";

export function AppRoutes() {
	return (
		<Router>
			<div className="w-full h-screen flex">
				<Sidebar/>

				<div className="max-w-[1686px] flex-grow">
					<Routes>
						<Route path="/" element={<Homepage/>}/>
						<Route path="/licenses" element={<Licenses/>}/>
						<Route path="/operator" element={<Operator/>}/>
					</Routes>
				</div>
			</div>
		</Router>
	);
}
