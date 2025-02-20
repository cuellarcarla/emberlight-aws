const Sidebar = () => {
    return (
      <div style={styles.sidebar}>
        <ul>
          <li>Rutina</li>
          <li>Rutina 2</li>
          <li>Rutina 3</li>
        </ul>
      </div>
    );
  };
  
  const styles = {
    sidebar: {
      width: "200px",
      height: "100vh",
      background: "#fff",
      color: "green",
      padding: "20px",
    },
  };
  
  export default Sidebar;
  