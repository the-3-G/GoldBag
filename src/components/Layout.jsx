import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";
import MobileHeader from "./MobileHeader";

export default function Layout({ children }) {
  const location = useLocation();
  const isTradePage = location.pathname === "/trade";
  const isAgentPage = location.pathname.startsWith("/agent") || location.pathname.startsWith("/admin");
  const isHomePage = location.pathname === "/home";

  // Pages with their own built-in navigation
  const authPages = ["/login", "/signup", "/forgot-password", "/"];
  const isAuthPage = authPages.includes(location.pathname);

  const hideChrome = isAgentPage || isAuthPage;

  return (
    <div className="app">
      {!hideChrome && <Navbar />}
      {!hideChrome && <MobileHeader />}
      <div className={`page-wrap ${isHomePage ? 'page-wrap-home' : ''}`} style={isTradePage || hideChrome ? { padding: 0 } : {}}>
        <div className={isTradePage || isAgentPage ? "container-fluid" : (isAuthPage ? "" : (isHomePage ? "dashboard-container" : "container"))}>
          {children}
        </div>
      </div>
      {!hideChrome && <MobileBottomNav />}
    </div>
  );
}
