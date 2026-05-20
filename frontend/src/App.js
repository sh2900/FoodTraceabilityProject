import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Blockchain from "./pages/Blockchain";
import Analytics from "./pages/Analytics";
import MyProducts from "./pages/MyProducts";
import Traceability from "./pages/Traceability";
import VerifySearch from "./pages/VerifySearch";
import Verify from "./pages/Verify";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/blockchain" element={<Blockchain />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/my-products" element={<MyProducts />} />
        <Route path="/trace/:batchId" element={<Traceability />} />
        
        {/* Public Routes */}
        <Route path="/verify" element={<VerifySearch />} />
        <Route path="/verify/:batchId" element={<Verify />} />
      </Routes>
      <Chatbot />
    </>
  );
}

export default App;