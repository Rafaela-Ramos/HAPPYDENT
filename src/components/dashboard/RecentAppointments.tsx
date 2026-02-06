// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MapPin, RefreshCw } from "lucide-react";
import { appointmentService, Appointment } from "@/services/appointmentService";
import { useToast } from "@/hooks/use-toast";
import { getPeruToday } from "@/lib/dateUtils";

const statusConfig = {
  programada: { label: "Programada", className: "bg-primary/10 text-primary border-primary/20" },
  confirmada: { label: "Confirmada", className: "bg-blue-100 text-blue-800 border-blue-200" },
  en_progreso: { label: "En curso", className: "bg-accent/10 text-accent border-accent/20" },
  completada: { label: "Completada", className: "bg-green-100 text-green-800 border-green-200" },
  cancelada: { label: "Cancelada", className: "bg-destructive/10 text-destructive border-destructive/20" },
  no_asistio: { label: "No asistió", className: "bg-orange-100 text-orange-800 border-orange-200" }
};

export function RecentAppointments() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar citas de hoy
  const loadTodayAppointments = async () => {
    try {
      setLoading(true);
      const today = getPeruToday();
      const response = await appointmentService.getDashboardData({
        date: today,
        limit: 5
      });
      setAppointments(response.data.todayAppointments);
    } catch (error) {
      console.error('Error loading today appointments:', error);
      toast({
        title: "Error",
        description: "Error al cargar citas de hoy",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayAppointments();
  }, []);

  // Función para calcular duración total de servicios
  const calculateTotalDuration = (appointment: Appointment) => {
    if (!appointment.services || appointment.services.length === 0) return '30 min';
    
    const totalMinutes = appointment.services.reduce((total, service) => {
      if (typeof service.service === 'object' && service.service.duration) {
        return total + service.service.duration;
      }
      return total + 30; // duración por defecto
    }, 0);
    
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
    return `${totalMinutes} min`;
  };

  // Función para obtener el primer servicio o un nombre por defecto
  const getMainService = (appointment: Appointment) => {
    if (!appointment.services || appointment.services.length === 0) {
      return appointment.type === 'consulta' ? 'Consulta General' : 'Cita médica';
    }
    
    const firstService = appointment.services[0];
    if (typeof firstService.service === 'object') {
      return firstService.service.name;
    }
    return 'Consulta General';
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Citas de Hoy</span>
          </div>
          {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-background/50">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                  <div className="h-5 bg-muted rounded w-20 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="flex items-center space-x-4 p-3 rounded-lg bg-background/50 hover:bg-background transition-smooth"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-medium">
                  {appointment.patient.firstName[0]}{appointment.patient.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {appointment.patient.fullName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getMainService(appointment)}
                </p>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{appointment.startTime}</span>
                  <span>•</span>
                  <span>{calculateTotalDuration(appointment)}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={statusConfig[appointment.status as keyof typeof statusConfig]?.className || statusConfig.programada.className}
                >
                  {statusConfig[appointment.status as keyof typeof statusConfig]?.label || 'Programada'}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay citas programadas para hoy</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}