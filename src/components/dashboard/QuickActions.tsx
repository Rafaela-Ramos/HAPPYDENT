// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Calendar, FileText } from "lucide-react";

const quickActions = [
  {
    title: "Nueva Cita",
    description: "Agendar una nueva cita",
    icon: Calendar,
    action: () => console.log("Nueva cita"),
    color: "bg-primary"
  },
  {
    title: "Nuevo Paciente",
    description: "Registrar paciente",
    icon: UserPlus,
    action: () => console.log("Nuevo paciente"),
    color: "bg-accent"
  },
  {
    title: "Nuevo Servicio",
    description: "Añadir servicio",
    icon: Plus,
    action: () => console.log("Nuevo servicio"),
    color: "bg-gradient-primary"
  },
  {
    title: "Ver Historial",
    description: "Consultar historial",
    icon: FileText,
    action: () => console.log("Ver historial"),
    color: "bg-muted-foreground"
  }
];

export function QuickActions() {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                onClick={action.action}
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-hover transition-smooth border-border/50 hover:border-primary/30"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}