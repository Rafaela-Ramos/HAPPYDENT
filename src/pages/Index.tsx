// @ts-nocheck
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentAppointments } from "@/components/dashboard/RecentAppointments";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp,
  Bell,
  Search,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { patientService } from "@/services/patientService";
import { appointmentService } from "@/services/appointmentService";
import { paymentService } from "@/services/paymentService";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados para estadísticas
  const [stats, setStats] = useState({
    patients: { total: 0, active: 0, recentlyAdded: 0 },
    appointments: { today: { total: 0, completed: 0, pending: 0 }, upcomingWeek: 0 },
    payments: { month: { revenue: 0, transactions: 0 }, pending: { amount: 0, count: 0 } }
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas en paralelo
      const [patientStats, appointmentStats, paymentStats] = await Promise.all([
        patientService.getPatientStats().catch(() => ({ data: { total: 0, active: 0, recentlyAdded: 0 } })),
        appointmentService.getAppointmentStats().catch(() => ({ data: { today: { total: 0, completed: 0, pending: 0 }, upcomingWeek: 0 } })),
        paymentService.getPaymentStats().catch(() => ({ data: { month: { revenue: 0, transactions: 0 }, pending: { amount: 0, count: 0 } } }))
      ]);

      setStats({
        patients: patientStats.data,
        appointments: appointmentStats.data,
        payments: {
          month: paymentStats.data.month ?? { revenue: 0, transactions: 0 },
          pending: paymentStats.data.pending ?? { amount: 0, count: 0 }
        }
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Error",
        description: "Error al cargar estadísticas del dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Efecto inicial
  useEffect(() => {
    loadDashboardStats();
  }, []);

  // Calcular tasa de ocupación (ejemplo simple)
  const calculateOccupancyRate = () => {
    const { total, completed } = stats.appointments.today;
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  return (
    <Layout>
      {/* Header */}
      <header className="h-16 border-b border-border bg-gradient-card px-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido de vuelta, {user?.fullName || 'Doctor'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar pacientes, citas..." 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={loadDashboardStats}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>
      
      {/* Dashboard Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Pacientes Totales"
            value={loading ? "..." : stats.patients.total.toString()}
            description={`${stats.patients.recentlyAdded} nuevos este mes`}
            icon={Users}
            trend={{ 
              value: stats.patients.recentlyAdded, 
              isPositive: stats.patients.recentlyAdded > 0 
            }}
          />
          <StatsCard
            title="Citas Hoy"
            value={loading ? "..." : stats.appointments.today.total.toString()}
            description={`${stats.appointments.today.completed} completadas`}
            icon={Calendar}
            trend={{ 
              value: stats.appointments.today.pending, 
              isPositive: stats.appointments.today.pending > 0 
            }}
          />
          <StatsCard
            title="Ingresos del Mes"
            value={loading ? "..." : formatCurrency(stats.payments.month.revenue)}
            description={`${stats.payments.month.transactions} transacciones`}
            icon={CreditCard}
            trend={{ 
              value: stats.payments.month.transactions, 
              isPositive: stats.payments.month.revenue > 0 
            }}
          />
          <StatsCard
            title="Tasa de Ocupación"
            value={loading ? "..." : `${calculateOccupancyRate()}%`}
            description="Basado en citas de hoy"
            icon={TrendingUp}
            trend={{ 
              value: calculateOccupancyRate(), 
              isPositive: calculateOccupancyRate() >= 50 
            }}
          />
        </div>
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentAppointments />
          </div>
          
          {/* Quick Actions - Takes 1 column */}
          {/* <div>
            <QuickActions />
          </div> */}
        </div>
      </main>
    </Layout>
  );
};

export default Index;
