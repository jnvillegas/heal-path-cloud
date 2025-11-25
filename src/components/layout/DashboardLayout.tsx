import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Menu, X, Calendar, Users, FileText, LayoutDashboard, Pill, TrendingDown, Stethoscope, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { NavLink } from "@/components/NavLink";
import { useUserRole } from "@/hooks/useUserRole";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, isAdmin, isMedico, isMedicoEvaluador, isGestor } = useUserRole();

  const getRoleName = () => {
    switch (role) {
      case 'administrador': return 'Administrador';
      case 'medico': return 'Médico';
      case 'medico_evaluador': return 'Médico Evaluador';
      case 'gestor': return 'Gestor';
      case 'paciente': return 'Paciente';
      default: return 'Usuario';
    }
  };

  const canViewPatients = isMedico || isMedicoEvaluador || isAdmin;
  const canViewDoctors = isAdmin || isGestor;
  const canViewAppointments = isMedico || isMedicoEvaluador || isAdmin;
  const canViewMedicalRecords = isMedico || isMedicoEvaluador;
  const canViewPrescriptions = isMedico || isMedicoEvaluador;
  const canViewCostSavings = isMedico || isMedicoEvaluador || isGestor || isAdmin;
  const canViewReports = isGestor || isAdmin;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sesión cerrada exitosamente");
      navigate("/auth");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-10 h-10" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                MediCloud
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink
                to="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              >
                <LayoutDashboard className="inline-block w-4 h-4 mr-2" />
                Dashboard
              </NavLink>
              {canViewPatients && (
                <NavLink
                  to="/patients"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <Users className="inline-block w-4 h-4 mr-2" />
                  Pacientes
                </NavLink>
              )}
              {canViewDoctors && (
                <NavLink
                  to="/doctors"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <Stethoscope className="inline-block w-4 h-4 mr-2" />
                  Médicos
                </NavLink>
              )}
              {canViewAppointments && (
                <NavLink
                  to="/appointments"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <Calendar className="inline-block w-4 h-4 mr-2" />
                  Agenda
                </NavLink>
              )}
              {canViewMedicalRecords && (
                <NavLink
                  to="/medical-records"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <FileText className="inline-block w-4 h-4 mr-2" />
                  Historias Clínicas
                </NavLink>
              )}
              {canViewPrescriptions && (
                <NavLink
                  to="/prescriptions"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <Pill className="inline-block w-4 h-4 mr-2" />
                  Recetas
                </NavLink>
              )}
              {canViewCostSavings && (
                <NavLink
                  to="/cost-savings"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <TrendingDown className="inline-block w-4 h-4 mr-2" />
                  Ahorro de Costos
                </NavLink>
              )}
              {canViewReports && (
                <NavLink
                  to="/reports"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <BarChart3 className="inline-block w-4 h-4 mr-2" />
                  Reportes
                </NavLink>
              )}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name || "Usuario"}</p>
                  <Badge variant="secondary" className="text-xs">{getRoleName()}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-4 py-3 space-y-2">
              <NavLink
                to="/dashboard"
                className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                activeClassName="bg-primary text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="inline-block w-4 h-4 mr-2" />
                Dashboard
              </NavLink>
              {canViewPatients && (
                <NavLink
                  to="/patients"
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="inline-block w-4 h-4 mr-2" />
                  Pacientes
                </NavLink>
              )}
              {canViewDoctors && (
                <NavLink
                  to="/doctors"
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Stethoscope className="inline-block w-4 h-4 mr-2" />
                  Médicos
                </NavLink>
              )}
              {canViewAppointments && (
                <NavLink
                  to="/appointments"
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="inline-block w-4 h-4 mr-2" />
                  Agenda
                </NavLink>
              )}
              {canViewMedicalRecords && (
                <NavLink
                  to="/medical-records"
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="inline-block w-4 h-4 mr-2" />
                  Historias Clínicas
                </NavLink>
              )}
              {canViewPrescriptions && (
                <NavLink
                  to="/prescriptions"
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Pill className="inline-block w-4 h-4 mr-2" />
                  Recetas
                </NavLink>
              )}
              {canViewCostSavings && (
                <NavLink
                  to="/cost-savings"
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <TrendingDown className="inline-block w-4 h-4 mr-2" />
                  Ahorro de Costos
                </NavLink>
              )}
              {canViewReports && (
                <NavLink
                  to="/reports"
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className="inline-block w-4 h-4 mr-2" />
                  Reportes
                </NavLink>
              )}
              <div className="pt-4 border-t border-border">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{user?.user_metadata?.full_name || "Usuario"}</p>
                    <Badge variant="secondary" className="text-xs">{getRoleName()}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
