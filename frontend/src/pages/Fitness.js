import Sidebar from "../components/Sidebar";
import "./Fitness.css";

const Fitness = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="fitness-dashboard">
        <div className="fitness-demo">
          <img src="/fitness-template.jpeg" alt="fitness-template" className="fitness-template"/>
        </div>
        <div className="fitness-timer">
          <p className="fitness-title">FLEXIONES</p>
          <p className="fitness-timer-count">00:30</p>
        </div>
      </div>
    </div>
  );
};

export default Fitness;
