import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Yachts from "./pages/Yachts";
import YachtDetail from "./pages/YachtDetail";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import UserBookings from "./pages/UserBookings";
import UserDashboard from "./pages/user/UserDashboard";
import UserDashboardHome from "./pages/user/UserDashboardHome";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardHome from "./pages/admin/DashboardHome";
import AdminYachts from "./pages/admin/AdminYachts";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRevenue from "./pages/admin/AdminRevenue";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/yachts" element={<Yachts />} />
            <Route path="/yacht/:id" element={<YachtDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/bookings" element={<UserBookings />} />
            <Route path="/user" element={<UserDashboard />}>
              <Route index element={<UserDashboardHome />} />
              <Route path="dashboard" element={<UserDashboardHome />} />
              <Route path="bookings" element={<UserBookings />} />
            </Route>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="yachts" element={<AdminYachts />} />
              <Route path="offers" element={<AdminOffers />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="revenue" element={<AdminRevenue />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
