// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { authService } from '@/services/authService';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario o email es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'identify' | 'question' | 'reset'>('identify');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [identifiedUser, setIdentifiedUser] = useState<{ userId: string; username: string; email: string; securityQuestion: string | null; hasSecurityQuestion: boolean } | null>(null);
  const [answer, setAnswer] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin',
      password: 'admin123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Intentando login con:', data.username);
      await login(data.username, data.password);
      console.log('Login exitoso, redirigiendo...');
      navigate('/'); // Redirigir al dashboard después del login exitoso
    } catch (err) {
      console.error('Error en login:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/img/logo_DentoPro.png"
              alt="DentoPro"
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription className="text-muted-foreground">
            Accede a tu cuenta de DentoPro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario o Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa tu usuario o email"
                        type="text"
                        autoComplete="username"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Ingresa tu contraseña"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-4">
            
            <div className="text-center">
              <Button
                variant="link"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => {
                  setForgotOpen(true);
                  setForgotStep('identify');
                  setForgotError(null);
                  setIdentifiedUser(null);
                  setAnswer('');
                  setResetToken(null);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Recuperación de Contraseña */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
          </DialogHeader>

          {forgotStep === 'identify' && (
            <div className="space-y-4">
              {forgotError && (
                <Alert variant="destructive">
                  <AlertDescription>{forgotError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Usuario o Email</Label>
                <Input
                  placeholder="Ingresa tu usuario o email"
                  defaultValue={form.getValues('username')}
                  onChange={(e) => form.setValue('username', e.target.value)}
                  disabled={forgotLoading}
                />
              </div>
              <DialogFooter>
                <Button
                  className="w-full"
                  onClick={async () => {
                    setForgotLoading(true);
                    setForgotError(null);
                    try {
                      const resp = await authService.forgotVerify(form.getValues('username'));
                      if (resp.success && resp.data) {
                        setIdentifiedUser(resp.data);
                        if (!resp.data.hasSecurityQuestion) {
                          setForgotError('El usuario no tiene configurada una pregunta de seguridad. Contacta al administrador.');
                        } else {
                          setForgotStep('question');
                        }
                      } else {
                        setForgotError(resp.message || 'No se pudo verificar el usuario');
                      }
                    } catch (err) {
                      setForgotError(err instanceof Error ? err.message : 'Error de conexión');
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  disabled={forgotLoading || !form.getValues('username')}
                >
                  {forgotLoading ? 'Verificando...' : 'Continuar'}
                </Button>
              </DialogFooter>
            </div>
          )}

          {forgotStep === 'question' && identifiedUser && (
            <div className="space-y-4">
              {forgotError && (
                <Alert variant="destructive">
                  <AlertDescription>{forgotError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Pregunta de seguridad</Label>
                <div className="text-sm text-muted-foreground">
                  {identifiedUser.securityQuestion}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tu respuesta</Label>
                <Input
                  placeholder="Escribe tu respuesta"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={forgotLoading}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setForgotStep('identify')}
                  disabled={forgotLoading}
                >
                  Atrás
                </Button>
                <Button
                  onClick={async () => {
                    if (!identifiedUser) return;
                    setForgotLoading(true);
                    setForgotError(null);
                    try {
                      const resp = await authService.verifySecurityAnswer({ userId: identifiedUser.userId, answer: answer.trim().toLowerCase() });
                      if (resp.success && resp.resetToken) {
                        setResetToken(resp.resetToken);
                        setForgotStep('reset');
                      } else {
                        setForgotError(resp.message || 'Respuesta incorrecta');
                      }
                    } catch (err) {
                      setForgotError(err instanceof Error ? err.message : 'Error de conexión');
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  disabled={forgotLoading || !answer}
                >
                  {forgotLoading ? 'Verificando...' : 'Validar respuesta'}
                </Button>
              </DialogFooter>
            </div>
          )}

          {forgotStep === 'reset' && resetToken && (
            <div className="space-y-4">
              {forgotError && (
                <Alert variant="destructive">
                  <AlertDescription>{forgotError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Nueva contraseña</Label>
                <Input
                  type="password"
                  placeholder="Ingresa la nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={forgotLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar nueva contraseña</Label>
                <Input
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={forgotLoading}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setForgotStep('question')}
                  disabled={forgotLoading}
                >
                  Atrás
                </Button>
                <Button
                  onClick={async () => {
                    if (!resetToken) return;
                    if (!newPassword || newPassword.length < 6) {
                      setForgotError('La nueva contraseña debe tener al menos 6 caracteres');
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      setForgotError('Las contraseñas no coinciden');
                      return;
                    }
                    setForgotLoading(true);
                    setForgotError(null);
                    try {
                      const resp = await authService.resetPasswordWithToken({ resetToken, newPassword });
                      if (resp.success) {
                        setForgotOpen(false);
                      } else {
                        setForgotError(resp.message || 'No se pudo restablecer la contraseña');
                      }
                    } catch (err) {
                      setForgotError(err instanceof Error ? err.message : 'Error de conexión');
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Guardando...' : 'Restablecer contraseña'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;