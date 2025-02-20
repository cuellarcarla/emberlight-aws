const Sidebar = () => {
    return (
      <div style={styles.sidebar}>
        <ul>
          <li>Profile</li>
          <li>Settings</li>
          <li>Logout</li>
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
  