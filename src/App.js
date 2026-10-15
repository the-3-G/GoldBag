import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Suspense, lazy, useState, useEffect } from "react";

import Layout from "./components/Layout";
import AgentLayout from "./pages/agent/AgentLayout";
import LoadingPage from "./components/LoadingPage";
import DemoBanner from "./components/DemoBanner";
import HomeRedirect from "./components/HomeRedirect";

import { AuthProvider } from "./contexts/AuthContext";
import { DemoProvider, useDemoMode } from "./contexts/DemoContext";
import RequireAuth from "./components/RequireAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import { ROLES } from "./constants/roles";
import ErrorBoundary from "./components/ErrorBoundary";

import "./App.css";

// Route that activates demo mode then redirects to /home
function DemoEntry() {
  const { enterDemo } = useDemoMode();
  const navigate = useNavigate();
  useEffect(() => {
    enterDemo();
    navigate("/home", { replace: true });
  }, [enterDemo, navigate]);
  return <LoadingPage />;
}

// ─── Lazy-loaded User Pages ────────────────────────────────────────────────
const Home               = lazy(() => import("./pages/Home"));
const Market             = lazy(() => import("./pages/Market"));
const CoinDetails        = lazy(() => import("./pages/CoinDetails"));
const Trade              = lazy(() => import("./pages/Trade"));
const News               = lazy(() => import("./pages/News"));
const Profile            = lazy(() => import("./pages/Profile"));
const Deposit            = lazy(() => import("./pages/Deposit"));
const Withdraw           = lazy(() => import("./pages/Withdraw"));
const Wallet             = lazy(() => import("./pages/Wallet"));
const AccountTransfer    = lazy(() => import("./pages/AccountTransfer"));
const Exchange           = lazy(() => import("./pages/Exchange"));
const Promotion          = lazy(() => import("./pages/Promotion"));
const SecurityCenter     = lazy(() => import("./pages/SecurityCenter"));
const WithdrawalAddress  = lazy(() => import("./pages/WithdrawalAddress"));
const PaymentMethods     = lazy(() => import("./pages/PaymentMethods"));
const DownloadApp        = lazy(() => import("./pages/DownloadApp"));
const RegulatoryInfo     = lazy(() => import("./pages/RegulatoryInfo"));
const Transactions       = lazy(() => import("./pages/Transactions"));
const Assets             = lazy(() => import("./pages/Assets"));
const LiveChat           = lazy(() => import("./pages/LiveChat"));
const Verification       = lazy(() => import("./pages/Verification"));
const Settings           = lazy(() => import("./pages/Settings"));
const VerifyEmail        = lazy(() => import("./pages/VerifyEmail"));
const ContactUs          = lazy(() => import("./pages/ContactUs"));
const TermsOfService     = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy      = lazy(() => import("./pages/PrivacyPolicy"));
const RiskDisclosure     = lazy(() => import("./pages/RiskDisclosure"));
const AmlKycPolicy       = lazy(() => import("./pages/AmlKycPolicy"));

// ─── Lazy-loaded Auth Pages ────────────────────────────────────────────────
const Login          = lazy(() => import("./pages/Login"));
const Signup         = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

// ─── Lazy-loaded Admin Pages ───────────────────────────────────────────────
const AdminDashboard   = lazy(() => import("./pages/admin/AdminDashboard"));
const Users            = lazy(() => import("./pages/admin/Users"));
const AgentCreator     = lazy(() => import("./pages/admin/AgentCreator"));
const Agents           = lazy(() => import("./pages/admin/Agents"));
const Deposits         = lazy(() => import("./pages/admin/Deposits"));
const Withdrawals      = lazy(() => import("./pages/admin/Withdrawals"));
const Trades           = lazy(() => import("./pages/admin/Trades"));
const TradeSettings    = lazy(() => import("./pages/admin/TradeSettings"));
const AdminCommissions = lazy(() => import("./pages/admin/Commissions"));
const Verifications    = lazy(() => import("./pages/admin/Verifications"));
const AdminSettings    = lazy(() => import("./pages/admin/AdminSettings"));
const BalanceHistory   = lazy(() => import("./pages/admin/BalanceHistory"));

// ─── Lazy-loaded Agent Pages ───────────────────────────────────────────────
const AgentDashboard   = lazy(() => import("./pages/agent/AgentDashboard"));
const Referrals        = lazy(() => import("./pages/agent/Referrals"));
const AgentCommissions = lazy(() => import("./pages/agent/Commissions"));
const AgentChats       = lazy(() => import("./pages/agent/AgentChats"));
const AgentWithdraw    = lazy(() => import("./pages/agent/AgentWithdraw"));
const AgentSettings    = lazy(() => import("./pages/agent/AgentSettings"));
const AgentsList       = lazy(() => import("./pages/agent/AgentsList"));
const AgentOrderList   = lazy(() => import("./pages/agent/AgentOrderList"));
const AgentFinance     = lazy(() => import("./pages/agent/AgentFinance"));

// ──────────────────────────────────────────────────────────────────────────
export default function App() {
  // Show animated loading screen once per browser session
  const [showLoader, setShowLoader] = useState(
    () => !sessionStorage.getItem("gb_loaded")
  );

  const handleLoadDone = () => {
    sessionStorage.setItem("gb_loaded", "1");
    setShowLoader(false);
  };

  if (showLoader) {
    return <LoadingPage onDone={handleLoadDone} />;
  }

  return (
    <AuthProvider>
      <DemoProvider>
        <Router>
          {/* Gold banner shown across all pages when in demo mode */}
          <DemoBanner />
          <Layout>
            <ErrorBoundary>
              <Suspense fallback={<LoadingPage />}>
                <Routes>

                  {/* ── DEMO ENTRY ─────────────────────────────── */}
                  <Route path="/demo" element={<DemoEntry />} />

                  {/* ── ROOT ───────────────────────────────────── */}
                  <Route path="/" element={<HomeRedirect />} />

                  {/* ── PUBLIC ─────────────────────────────────── */}
                  <Route path="/market"       element={<Market />} />
                  <Route path="/verification" element={<Verification />} />
                  <Route path="/coin/:id"     element={<CoinDetails />} />
                  <Route path="/news"         element={<News />} />
                  <Route path="/contact"      element={<ContactUs />} />
                  <Route path="/terms"         element={<TermsOfService />} />
                  <Route path="/privacy"        element={<PrivacyPolicy />} />
                  <Route path="/risk"           element={<RiskDisclosure />} />
                  <Route path="/aml"            element={<AmlKycPolicy />} />

                  {/* ── AUTH ───────────────────────────────────── */}
                  <Route path="/login"           element={<Login />} />
                  <Route path="/signup"          element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* ── USER (protected) ───────────────────────── */}
                  <Route path="/home"               element={<RequireAuth><Home /></RequireAuth>} />
                  <Route path="/trade"              element={<RequireAuth><Trade /></RequireAuth>} />
                  <Route path="/profile"            element={<RequireAuth><Profile /></RequireAuth>} />
                  <Route path="/settings"           element={<RequireAuth><Settings /></RequireAuth>} />
                  <Route path="/deposit"            element={<RequireAuth><Deposit /></RequireAuth>} />
                  <Route path="/withdraw"           element={<RequireAuth><Withdraw /></RequireAuth>} />
                  <Route path="/wallet"             element={<RequireAuth><Wallet /></RequireAuth>} />
                  <Route path="/account-transfer"   element={<RequireAuth><AccountTransfer /></RequireAuth>} />
                  <Route path="/exchange"           element={<RequireAuth><Exchange /></RequireAuth>} />
                  <Route path="/promotion"          element={<RequireAuth><Promotion /></RequireAuth>} />
                  <Route path="/security"           element={<RequireAuth><SecurityCenter /></RequireAuth>} />
                  <Route path="/withdrawal-address" element={<RequireAuth><WithdrawalAddress /></RequireAuth>} />
                  <Route path="/payment-methods"    element={<RequireAuth><PaymentMethods /></RequireAuth>} />
                  <Route path="/download-app"       element={<RequireAuth><DownloadApp /></RequireAuth>} />
                  <Route path="/regulatory-info"    element={<RequireAuth><RegulatoryInfo /></RequireAuth>} />
                  <Route path="/transactions"       element={<RequireAuth><Transactions /></RequireAuth>} />
                  <Route path="/assets"             element={<RequireAuth><Assets /></RequireAuth>} />
                  <Route path="/chat"               element={<RequireAuth><LiveChat /></RequireAuth>} />
                  <Route path="/verify-email"       element={<RequireAuth><VerifyEmail /></RequireAuth>} />

                  {/* ── ADMIN ──────────────────────────────────── */}
                  <Route path="/admin/dashboard"     element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><AdminDashboard /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/users"         element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><Users /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/chats"         element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><AgentChats /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/create-agent"  element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><AgentCreator /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/agents"        element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><Agents /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/deposits"      element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><Deposits /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/withdrawals"   element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><Withdrawals /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/trades"        element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><Trades /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/trade-settings" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><TradeSettings /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/commissions"   element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><AdminCommissions /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/verifications" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><Verifications /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/settings"      element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><AdminSettings /></AgentLayout></ProtectedRoute>} />
                  <Route path="/admin/balance-history" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AgentLayout><BalanceHistory /></AgentLayout></ProtectedRoute>} />

                  {/* ── AGENT ──────────────────────────────────── */}
                  <Route path="/agent/dashboard"       element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentDashboard /></ProtectedRoute>} />
                  <Route path="/agent/referrals"       element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><Referrals /></ProtectedRoute>} />
                  <Route path="/agent/commissions"     element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentCommissions /></ProtectedRoute>} />
                  <Route path="/agent/chats"           element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentChats /></ProtectedRoute>} />
                  <Route path="/agent/service"         element={<Navigate to="/agent/chats" replace />} />
                  <Route path="/agent/withdraw"        element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentWithdraw /></ProtectedRoute>} />
                  <Route path="/agent/settings"        element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentSettings /></ProtectedRoute>} />
                  <Route path="/agent/agents"          element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentsList /></ProtectedRoute>} />
                  <Route path="/agent/orders/delivery" element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentOrderList /></ProtectedRoute>} />
                  <Route path="/agent/orders/contract" element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentOrderList /></ProtectedRoute>} />
                  <Route path="/agent/deposits"        element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentFinance /></ProtectedRoute>} />
                  <Route path="/agent/withdrawals"     element={<ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentFinance /></ProtectedRoute>} />

                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Layout>
        </Router>
      </DemoProvider>
    </AuthProvider>
  );
}
