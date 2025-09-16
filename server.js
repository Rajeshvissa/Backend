import { useEffect, useState } from "react";
import { api } from "../api/client.js";

function StatCard({ label, value, icon }) {
  return (
    <div className="col-12 col-md-6 col-lg-3">
      <div className="card shadow-sm h-100 border-0" style={{ borderRadius: "1rem" }}>
        <div className="card-body d-flex flex-column align-items-start">
          <div className="d-flex align-items-center justify-content-between w-100 mb-2">
            <span className="text-muted small">{label}</span>
            <span className="fs-4 text-primary">{icon}</span>
          </div>
          <div className="fs-2 fw-bold mt-auto">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ customers: 0, campaigns: 0, orders: 0, delivered: 0 });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // --- Capture token from URL ---
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) localStorage.setItem("jwt", token);

    const fetchData = async () => {
      try {
        const jwtToken = localStorage.getItem("jwt");
        if (!jwtToken) return;

        const [c, cmp, o] = await Promise.all([
          api.get("/customers", { headers: { Authorization: `Bearer ${jwtToken}` } }),
          api.get("/api/campaigns", { headers: { Authorization: `Bearer ${jwtToken}` } }),
          api.get("/orders", { headers: { Authorization: `Bearer ${jwtToken}` } }),
        ]);

        setStats({
          customers: Array.isArray(c.data) ? c.data.length : 0,
          campaigns: Array.isArray(cmp.data) ? cmp.data.length : 0,
          orders: Array.isArray(o.data) ? o.data.length : 0,
          delivered: 0, // replace with your logic
        });

        setUserData({ name: "User", email: "user@example.com" }); // optional: decode from JWT if you want
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (!userData) return <h3 className="text-center py-5">Please log in to view the dashboard</h3>;

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">Welcome, {userData.name || userData.email} 👋</h3>
      <div className="row g-4">
        <StatCard label="Customers" value={stats.customers} icon="👥" />
        <StatCard label="Campaigns" value={stats.campaigns} icon="📢" />
        <StatCard label="Orders" value={stats.orders} icon="🛒" />
        <StatCard label="Delivered" value={stats.delivered} icon="✅" />
      </div>
    </div>
  );
}
