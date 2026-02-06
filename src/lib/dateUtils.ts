/**
 * Utilidades para manejo de fechas en zona horaria de Perú
 * Frontend - DocSmile Suite
 */

/**
 * Obtiene la fecha actual en zona horaria de Perú
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export const getPeruToday = (): string => {
  const now = new Date();
  const peruTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));
  return peruTime.toISOString().split('T')[0];
};

/**
 * Obtiene la fecha y hora actual en zona horaria de Perú
 * @returns Objeto Date en zona horaria de Perú
 */
export const getPeruNow = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));
};

/**
 * Formatea un Date cualquiera a 'YYYY-MM-DD' considerando zona horaria de Perú
 */
export const formatDateToPeruYYYYMMDD = (date: Date): string => {
  const peruDate = new Date(date.toLocaleString("en-US", { timeZone: "America/Lima" }));
  return peruDate.toISOString().split('T')[0];
};

/**
 * Convierte una fecha a zona horaria de Perú
 * @param date - Fecha a convertir
 * @returns Fecha en zona horaria de Perú
 */
export const toPeruTime = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.toLocaleString("en-US", { timeZone: "America/Lima" }));
};

/**
 * Valida si una fecha es en el pasado (considerando zona horaria de Perú)
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns true si la fecha es en el pasado
 */
export const isPastDate = (dateString: string): boolean => {
  // Convertir la fecha seleccionada a zona horaria de Perú
  const selectedDate = toPeruTime(dateString);
  selectedDate.setHours(0, 0, 0, 0);
  
  // Obtener la fecha actual en Perú y establecerla al inicio del día
  const peruToday = getPeruNow();
  peruToday.setHours(0, 0, 0, 0);
  
  return selectedDate < peruToday;
};

/**
 * Valida si una fecha de nacimiento es válida (no en el futuro)
 * @param dateString - Fecha de nacimiento en formato YYYY-MM-DD
 * @returns true si la fecha es válida
 */
export const isValidBirthDate = (dateString: string): boolean => {
  if (!dateString) return true; // Fecha opcional
  const birthDate = new Date(dateString);
  const peruNow = getPeruNow();
  return birthDate <= peruNow;
};

/**
 * Calcula la edad basada en fecha de nacimiento (considerando zona horaria de Perú)
 * @param dateOfBirth - Fecha de nacimiento
 * @returns Edad calculada o null si no hay fecha
 */
export const calculateAge = (dateOfBirth?: string): number | null => {
  if (!dateOfBirth) return null;
  
  const peruNow = getPeruNow();
  const birthDate = new Date(dateOfBirth);
  
  let age = peruNow.getFullYear() - birthDate.getFullYear();
  const monthDiff = peruNow.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && peruNow.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Formatea una fecha para mostrar en la UI (formato peruano)
 * @param dateString - Fecha a formatear
 * @returns Fecha formateada
 */
export const formatDateForUI = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Lima'
  }).format(date);
};

/**
 * Formatea una fecha y hora para mostrar en la UI (formato peruano)
 * @param dateString - Fecha y hora a formatear
 * @returns Fecha y hora formateada
 */
export const formatDateTimeForUI = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima'
  }).format(date);
};

/**
 * Obtiene el valor mínimo para inputs de fecha (hoy en Perú)
 * @returns Fecha mínima en formato YYYY-MM-DD
 */
export const getMinDateForInput = (): string => {
  return getPeruToday();
};

/**
 * Valida que una hora de fin sea posterior a una hora de inicio
 * @param startTime - Hora de inicio en formato HH:MM
 * @param endTime - Hora de fin en formato HH:MM
 * @param minDuration - Duración mínima en minutos (por defecto 30)
 * @returns true si la validación es correcta
 */
export const validateTimeRange = (
  startTime: string, 
  endTime: string, 
  minDuration: number = 30
): boolean => {
  if (!startTime || !endTime) return false;
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTimeMinutes = startHours * 60 + startMinutes;
  const endTimeMinutes = endHours * 60 + endMinutes;
  
  return endTimeMinutes > startTimeMinutes && 
         (endTimeMinutes - startTimeMinutes) >= minDuration;
}; 