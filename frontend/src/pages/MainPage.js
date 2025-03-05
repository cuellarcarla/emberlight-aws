import { Link } from "react-router-dom";

const MainPage = () => {
  return (
    <div>
      <h1>SOLUCIÓN DE SALUD Y BIENESTAR</h1>
      <p>Discover our features and join the community!</p>
      <Link to="/register">Get Started</Link>
    </div>
  );
};

export default MainPage;
