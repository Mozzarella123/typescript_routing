import './App.css'
import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "./navigation";


function App() {
  return (
    <div className="App">
      <div className="flex gap-2">
        <Link to={ROUTES.root.fullPath}>Home</Link>
        <Link to={ROUTES.root.tasks.fullPath}>Tasks</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default App
