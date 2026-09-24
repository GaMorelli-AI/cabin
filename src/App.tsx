import { RobotExperience } from "./components/RobotExperience/RobotExperience";
import { useKioskMode } from "./hooks/useKioskMode";
import "./App.css";

function App() {
  useKioskMode();
  return <RobotExperience />;
}

export default App;
