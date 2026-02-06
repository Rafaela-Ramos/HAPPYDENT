import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Camera,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Settings,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Importar servicio
import { 
  profileService, 
  UpdateProfileRequest 
} from "@/services/profileService";

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  specialty: string;
  professionalLicense: string;
  bio: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialPasswordFormData: PasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // Estados principales
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    specialty: '',
    professionalLicense: '',
    bio: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>(initialPasswordFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Estado para Pregunta de Seguridad
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    question: '',
    answer: '',
    currentPassword: ''
  });
  const [securityErrors, setSecurityErrors] = useState<Record<string, string>>({});
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [showSecurityPassword, setShowSecurityPassword] = useState(false);

  // Cargar datos del perfil
  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfile();
      const profileData = response.data;

      setFormData({
        fullName: profileData.fullName || '',
        email: profileData.email || '',
        phone: profileData.profile?.phone || '',
        address: profileData.profile?.address || '',
        city: '',
        specialty: profileData.profile?.specialty || '',
        professionalLicense: profileData.profile?.professionalLicense || '',
        bio: profileData.profile?.bio || ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Validar formulario de perfil
  const validateProfileForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = 'Nombre completo es requerido';
    if (!formData.email.trim()) errors.email = 'Email es requerido';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email no válido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validar formulario de contraseña
  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordForm.currentPassword) errors.currentPassword = 'Contraseña actual es requerida';
    if (!passwordForm.newPassword) errors.newPassword = 'Nueva contraseña es requerida';
    if (passwordForm.newPassword && passwordForm.newPassword.length < 6) {
      errors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validar formulario de pregunta de seguridad
  const validateSecurityForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!securityForm.question.trim()) errors.question = 'La pregunta es requerida';
    if (securityForm.question && securityForm.question.trim().length > 200) {
      errors.question = 'La pregunta no puede exceder 200 caracteres';
    }
    if (!securityForm.answer.trim()) errors.answer = 'La respuesta es requerida';
    if (securityForm.answer && securityForm.answer.trim().length > 100) {
      errors.answer = 'La respuesta no puede exceder 100 caracteres';
    }
    if (!securityForm.currentPassword) errors.currentPassword = 'La contraseña actual es requerida';

    setSecurityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Actualizar perfil
  const handleProfileUpdate = async () => {
    if (!validateProfileForm()) return;

    try {
      setSaving(true);

      const updateData: UpdateProfileRequest = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        profile: {
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
          specialty: formData.specialty.trim() || undefined,
          professionalLicense: formData.professionalLicense.trim() || undefined,
          bio: formData.bio.trim() || undefined,
        }
      };

      const response = await profileService.updateProfile(updateData);
      
      // Actualizar el contexto de autenticación con los nuevos datos
      if (updateUser) {
        const updated = response.data;
        updateUser({
          ...(user as any),
          fullName: updated.fullName,
          email: updated.email,
          profile: updated.profile
        });
      }

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Cambiar contraseña
  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    try {
      setSavingPassword(true);

      await profileService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      toast({
        title: "Éxito",
        description: "Contraseña actualizada correctamente",
      });

      setPasswordForm(initialPasswordFormData);
      setIsPasswordDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar contraseña",
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // Actualizar pregunta de seguridad
  const handleSecurityQuestionUpdate = async () => {
    if (!validateSecurityForm()) return;

    try {
      setSavingSecurity(true);
      await profileService.updateSecurityQuestion({
        question: securityForm.question.trim(),
        answer: securityForm.answer.trim(),
        currentPassword: securityForm.currentPassword
      });

      toast({
        title: 'Éxito',
        description: 'Pregunta de seguridad actualizada correctamente'
      });

      setIsSecurityDialogOpen(false);
      setSecurityForm({ question: '', answer: '', currentPassword: '' });
      setSecurityErrors({});
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar pregunta de seguridad',
        variant: 'destructive'
      });
    } finally {
      setSavingSecurity(false);
    }
  };

  // Obtener iniciales para el avatar
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.slice(0, 2);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-muted-foreground">
              Administra tu información personal y configuración de la cuenta
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsSecurityDialogOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Pregunta de Seguridad
            </Button>
            <Button 
              onClick={() => setIsPasswordDialogOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Lock className="h-4 w-4" />
              Cambiar Contraseña
            </Button>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(formData.fullName || 'NN')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{formData.fullName || 'Sin nombre'}</h2>
                <p className="text-muted-foreground">{formData.email}</p>
                 <p className="text-sm text-muted-foreground">{formData.phone || 'Sin teléfono'}</p>
                {formData.specialty && (
                  <p className="text-sm font-medium text-primary">{formData.specialty}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Información Personal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className={formErrors.fullName ? 'border-red-500' : ''}
                />
                {formErrors.fullName && <p className="text-sm text-red-500">{formErrors.fullName}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                    placeholder="+51 999 999 999"
                  />
                </div>
              </div>
              
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="pl-10"
                  placeholder="Dirección completa"
                />
              </div>
            </div>            

            <div>
              <Label htmlFor="bio">Biografía Profesional</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                placeholder="Describe tu experiencia y especialidades profesionales..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Información Profesional</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                  placeholder="Ej: Ortodoncia, Endodoncia, etc."
                />
              </div>
              <div>
                <Label htmlFor="professionalLicense">Número de Colegiatura</Label>
                <Input
                  id="professionalLicense"
                  value={formData.professionalLicense}
                  onChange={(e) => setFormData(prev => ({ ...prev, professionalLicense: e.target.value }))}
                  placeholder="Número de registro profesional"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleProfileUpdate} 
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar Contraseña
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Contraseña Actual *</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={passwordErrors.currentPassword ? 'border-red-500' : ''}
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordErrors.currentPassword && <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>}
              </div>

              <div>
                <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={passwordErrors.newPassword ? 'border-red-500' : ''}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordErrors.newPassword && <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={passwordErrors.confirmPassword ? 'border-red-500' : ''}
                    placeholder="Repite la nueva contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordErrors.confirmPassword && <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsPasswordDialogOpen(false);
                    setPasswordForm(initialPasswordFormData);
                    setPasswordErrors({});
                  }}
                  disabled={savingPassword}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={savingPassword}
                  className="gap-2"
                >
                  {savingPassword ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {savingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Security Question Dialog */}
        <Dialog open={isSecurityDialogOpen} onOpenChange={setIsSecurityDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Actualizar Pregunta de Seguridad
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="security-question">Pregunta *</Label>
                <Input
                  id="security-question"
                  value={securityForm.question}
                  onChange={(e) => setSecurityForm(prev => ({ ...prev, question: e.target.value }))}
                  className={securityErrors.question ? 'border-red-500' : ''}
                  placeholder="¿Ciudad de nacimiento?"
                />
                {securityErrors.question && <p className="text-sm text-red-500">{securityErrors.question}</p>}
              </div>
              <div>
                <Label htmlFor="security-answer">Respuesta *</Label>
                <Input
                  id="security-answer"
                  value={securityForm.answer}
                  onChange={(e) => setSecurityForm(prev => ({ ...prev, answer: e.target.value }))}
                  className={securityErrors.answer ? 'border-red-500' : ''}
                  placeholder="Lima"
                />
                {securityErrors.answer && <p className="text-sm text-red-500">{securityErrors.answer}</p>}
              </div>
              <div>
                <Label htmlFor="security-currentPassword">Contraseña Actual *</Label>
                <div className="relative">
                  <Input
                    id="security-currentPassword"
                    type={showSecurityPassword ? 'text' : 'password'}
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={securityErrors.currentPassword ? 'border-red-500' : ''}
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSecurityPassword(prev => !prev)}
                  >
                    {showSecurityPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {securityErrors.currentPassword && <p className="text-sm text-red-500">{securityErrors.currentPassword}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsSecurityDialogOpen(false);
                    setSecurityForm({ question: '', answer: '', currentPassword: '' });
                    setSecurityErrors({});
                  }}
                  disabled={savingSecurity}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSecurityQuestionUpdate}
                  disabled={savingSecurity}
                  className="gap-2"
                >
                  {savingSecurity ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  {savingSecurity ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}