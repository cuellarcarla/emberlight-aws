import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Community from "./pages/Community";
import Fitness from "./pages/Fitness";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Community />} />
        <Route path="/fitness" element={<Fitness />} />
      </Routes>
    </Router>
  );
};

export default App;
