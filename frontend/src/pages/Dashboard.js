import React, { useState } from "react";
import Layout from "../components/Layout";
import AdminDashboard from "../components/admin/AdminDashboard";
import FarmerDashboard from "../components/farmer/FarmerDashboard";
import WarehouseDashboard from "../components/warehouse/WarehouseDashboard";
import TransporterDashboard from "../components/transporter/TransporterDashboard";
import RetailerDashboard from "../components/retailer/RetailerDashboard";

function Dashboard() {
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  const renderDashboard = () => {
    switch (user.role?.toLowerCase()) {
      case 'admin':
        return <AdminDashboard />;
      case 'farmer':
        return <FarmerDashboard />;
      case 'warehouse':
        return <WarehouseDashboard />;
      case 'transporter':
        return <TransporterDashboard />;
      case 'retailer':
        return <RetailerDashboard />;
      default:
        return <FarmerDashboard />;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
}

export default Dashboard;