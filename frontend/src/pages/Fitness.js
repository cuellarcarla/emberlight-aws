import Sidebar from "../components/Sidebar";
import "./Fitness.css";

const Fitness = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div class="fitness-dashboard">
        <div class="fitness-demo">
          video.mp4
        </div>
        <div class="fitness-timer">
          00:00
        </div>
      </div>
    </div>
  );
};

export default Fitness;
