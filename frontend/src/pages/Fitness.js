import Sidebar from "../components/Sidebar";
import "./Fitness.css";

const Fitness = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div class="fitness-dashboard">
        <div class="fitness-demo">
          <img src="/fitness-template.jpeg" alt="fitness-template" className="fitness-template"/>
        </div>
        <div class="fitness-timer">
          <p class="fitness-title">FLEXIONES</p>
          <p class="fitness-timer-count">00:30</p>
        </div>
      </div>
    </div>
  );
};

export default Fitness;
