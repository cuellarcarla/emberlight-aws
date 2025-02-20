import Sidebar from "../components/Sidebar";

const Fitness = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Fitness</h1>
        <p>Welcome to your fitness!</p>
      </div>
    </div>
  );
};

export default Fitness;
