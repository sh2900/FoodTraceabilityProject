import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";

function Layout({ children }) {
  const { theme } = useTheme();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{
        marginLeft: "240px",
        flex: 1,
        display: "flex",
        flexDirection: "column"
      }}>
        <Navbar />
        <main style={{
          padding: "2rem",
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto"
        }} className="fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;