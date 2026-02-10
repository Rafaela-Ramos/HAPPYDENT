import { authService } from './authService';
import { staticPayments, staticDashboardStats } from '@/data/staticData';

const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

export interface PaymentSummary {
  appointmentId: string;
  date: string;
  patient: {
    name: string;
    dni: string;
  };
  services: {
    serviceName: string;
    category: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discount: number;
    discountAmount: number;
    total: number;
  }[];
  totals: {
    subtotal: number;
    totalDiscount: number;
    finalAmount: number;
    generalDiscount: number;
  };
  paymentStatus: {
    isPaid: boolean;
    paymentMethod?: string;
    paidAt?: string;
  };
}

export interface ApplyDiscountRequest {
  discount: number;
  reason?: string;
}

export interface ProcessPaymentRequest {
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | 'yape' | 'plin';
  amountPaid?: number;
  notes?: string;
}

export interface Receipt {
  receiptNumber: string;
  date: string;
  appointmentDate: string;
  patient: {
    name: string;
    dni: string;
    phone?: string;
  };
  dentist: {
    name?: string;
    phone?: string;
  };
  services: {
    serviceName: string;
    category: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discount: number;
    total: number;
    notes?: string;
  }[];
  totals: {
    subtotal: number;
    generalDiscount: number;
    finalAmount: number;
    paymentMethod: string;
  };
  clinicInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

export interface PaymentStats {
  success: boolean;
  data: {
    month: {
      revenue: number;
      transactions: number;
    };
    pending: {
      amount: number;
      count: number;
    };
    totalRevenue: number;
    todayRevenue: number;
    byMethod: Array<{ _id: string; total: number; count: number }>;
  };
}

export interface Payment {
  _id: string;
  appointmentId: string;
  patient: {
    _id: string;
    name: string;
    fullName: string;
    dni: string;
    phone?: string;
  };
  services: Array<{
    service?: {
      _id: string;
      name: string;
    } | string;
    serviceName: string;
    category: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  finalAmount: number;
  total: number;
  paymentMethod: string;
  paymentMethods: Array<{
    method: 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'cheque' | 'otro';
    amount: number;
    reference?: string;
  }>;
  isPaid: boolean;
  paidAt?: string;
  receipt?: string;
  receiptNumber?: string;
  notes?: string;
  date: string;
  createdAt: string;
  status: 'pending' | 'paid' | 'cancelled';
  appointment?: {
    _id: string;
  };
}

export interface CreatePaymentRequest {
  patient: string;
  appointment?: string;
  services: Array<{
    service: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  paymentMethods: Array<{
    method: 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'cheque' | 'otro';
    amount: number;
    reference?: string;
  }>;
  notes: string;
}

class PaymentService {
  // Obtener lista de pagos con paginación y filtros
  async getPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentMethod?: string;
    date?: string;
  }): Promise<{
    success: boolean;
    data: {
      payments: Payment[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    };
  }> {
    try {
      // Modo estático - usar datos locales
      let filteredPayments = staticPayments.map(payment => ({
        _id: payment.id,
        appointmentId: payment.appointmentId,
        patient: {
          _id: payment.patientId,
          name: payment.patientName,
          fullName: payment.patientName,
          dni: payment.patientId,
          phone: '',
          email: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          dateOfBirth: '',
          gender: 'masculino' as const,
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          },
          medicalHistory: {
            allergies: [],
            medications: [],
            diseases: [],
            notes: ''
          },
          isActive: true,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        },
        services: payment.services.map(service => ({
          service: {
            _id: service.serviceId,
            name: service.serviceName
          },
          serviceName: service.serviceName,
          category: service.category,
          quantity: service.quantity,
          unitPrice: service.unitPrice,
          total: service.total
        })),
        subtotal: payment.amount,
        discount: 0,
        discountType: 'percentage' as const,
        discountAmount: 0,
        finalAmount: payment.amount,
        total: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentMethods: [{
          method: payment.paymentMethod as any,
          amount: payment.amount,
          reference: payment.transactionId
        }],
        isPaid: payment.status === 'Completado',
        paidAt: payment.date,
        receipt: '',
        receiptNumber: payment.transactionId,
        notes: payment.notes,
        date: payment.date,
        createdAt: payment.createdAt,
        status: payment.status.toLowerCase() as any,
        appointment: {
          _id: payment.appointmentId
        }
      }));

      // Aplicar filtros
      if (params.status) {
        filteredPayments = filteredPayments.filter(payment => payment.status === params.status);
      }
      if (params.paymentMethod) {
        filteredPayments = filteredPayments.filter(payment => payment.paymentMethod === params.paymentMethod);
      }
      if (params.date) {
        filteredPayments = filteredPayments.filter(payment => payment.date === params.date);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredPayments = filteredPayments.filter(payment => 
          payment.patient.fullName.toLowerCase().includes(searchLower) ||
          payment.patient.dni.toLowerCase().includes(searchLower) ||
          payment.notes?.toLowerCase().includes(searchLower)
        );
      }

      // Paginación
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          payments: paginatedPayments,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredPayments.length / limit),
            totalItems: filteredPayments.length,
            itemsPerPage: limit
          }
        }
      };
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  // Obtener estadísticas de pagos
  async getPaymentStats(): Promise<PaymentStats> {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Usar datos estáticos del dashboard
      return {
        success: true,
        data: {
          month: {
            revenue: staticDashboardStats.payments.month.revenue,
            transactions: staticDashboardStats.payments.month.transactions
          },
          pending: {
            amount: staticDashboardStats.payments.pending.amount,
            count: staticDashboardStats.payments.pending.count
          },
          totalRevenue: staticPayments.reduce((total, payment) => total + payment.amount, 0),
          todayRevenue: staticDashboardStats.payments.today.revenue,
          byMethod: staticPayments.reduce((acc, payment) => {
            const method = payment.paymentMethod;
            const existing = acc.find(item => item._id === method);
            if (existing) {
              existing.total += payment.amount;
              existing.count += 1;
            } else {
              acc.push({ _id: method, total: payment.amount, count: 1 });
            }
            return acc;
          }, [])
        }
      };
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }

  // Crear un nuevo pago
  async createPayment(paymentData: CreatePaymentRequest): Promise<{
    success: boolean;
    data: Payment;
    message?: string;
  }> {
    try {
      // Modo estático - crear pago local
      const newPayment: Payment = {
        _id: `payment_${Date.now()}`,
        appointmentId: paymentData.appointment || '',
        patient: {
          _id: paymentData.patient,
          name: '', // Se llenaría con datos del paciente
          fullName: '', // Se llenaría con datos del paciente
          dni: '',
          phone: ''
        },
        services: paymentData.services.map(s => ({
          service: {
            _id: s.service,
            name: '' // Se llenaría con datos del servicio
          },
          serviceName: '', // Se llenaría con datos del servicio
          category: '',
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          total: s.total
        })),
        subtotal: paymentData.subtotal,
        discount: paymentData.discount,
        discountType: paymentData.discountType,
        discountAmount: paymentData.discountType === 'percentage' 
          ? (paymentData.subtotal * paymentData.discount) / 100 
          : paymentData.discount,
        finalAmount: paymentData.total,
        total: paymentData.total,
        paymentMethod: paymentData.paymentMethods[0]?.method || 'efectivo',
        paymentMethods: paymentData.paymentMethods,
        isPaid: true,
        paidAt: new Date().toISOString(),
        receipt: `REC${Date.now()}`,
        receiptNumber: `REC${Date.now()}`,
        notes: paymentData.notes,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        status: 'paid',
        appointment: paymentData.appointment ? { _id: paymentData.appointment } : undefined
      };

      // Agregar a los datos estáticos (simulación)
      staticPayments.push({
        id: newPayment._id,
        appointmentId: newPayment.appointmentId,
        patientId: paymentData.patient,
        patientName: newPayment.patient.fullName,
        services: paymentData.services.map(s => ({
          serviceId: s.service,
          serviceName: '', // Se llenaría con datos del servicio
          category: '',
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          total: s.total
        })),
        amount: paymentData.total,
        date: newPayment.date,
        paymentMethod: newPayment.paymentMethod,
        status: 'Completado',
        transactionId: newPayment.receiptNumber,
        notes: paymentData.notes,
        createdAt: newPayment.createdAt,
        updatedAt: newPayment.createdAt
      });

      return {
        success: true,
        data: newPayment,
        message: 'Pago creado exitosamente'
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Actualizar un pago existente
  async updatePayment(id: string, paymentData: CreatePaymentRequest): Promise<{
    success: boolean;
    data: Payment;
    message?: string;
  }> {
    try {
      // Modo estático - actualizar pago local
      const paymentIndex = staticPayments.findIndex(p => p.id === id);
      if (paymentIndex === -1) {
        throw new Error('Pago no encontrado');
      }

      const updatedPayment: Payment = {
        _id: id,
        appointmentId: paymentData.appointment || '',
        patient: {
          _id: paymentData.patient,
          name: '', // Se llenaría con datos del paciente
          fullName: '', // Se llenaría con datos del paciente
          dni: '',
          phone: ''
        },
        services: paymentData.services.map(s => ({
          service: {
            _id: s.service,
            name: ''
          },
          serviceName: '',
          category: '',
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          total: s.total
        })),
        subtotal: paymentData.subtotal,
        discount: paymentData.discount,
        discountType: paymentData.discountType,
        discountAmount: paymentData.discountType === 'percentage' 
          ? (paymentData.subtotal * paymentData.discount) / 100 
          : paymentData.discount,
        finalAmount: paymentData.total,
        total: paymentData.total,
        paymentMethod: paymentData.paymentMethods[0]?.method || 'efectivo',
        paymentMethods: paymentData.paymentMethods,
        isPaid: true,
        paidAt: new Date().toISOString(),
        receipt: `REC${Date.now()}`,
        receiptNumber: `REC${Date.now()}`,
        notes: paymentData.notes,
        date: staticPayments[paymentIndex].date,
        createdAt: staticPayments[paymentIndex].createdAt,
        status: 'paid',
        appointment: paymentData.appointment ? { _id: paymentData.appointment } : undefined
      };

      // Actualizar en datos estáticos
      staticPayments[paymentIndex] = {
        ...staticPayments[paymentIndex],
        services: paymentData.services.map(s => ({
          serviceId: s.service,
          serviceName: '',
          category: '',
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          total: s.total
        })),
        amount: paymentData.total,
        paymentMethod: updatedPayment.paymentMethod,
        notes: paymentData.notes,
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: updatedPayment,
        message: 'Pago actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  // Eliminar un pago
  async deletePayment(id: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Modo estático - eliminar pago local
      const paymentIndex = staticPayments.findIndex(p => p.id === id);
      if (paymentIndex === -1) {
        throw new Error('Pago no encontrado');
      }

      staticPayments.splice(paymentIndex, 1);

      return {
        success: true,
        message: 'Pago eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  // Métodos de utilidad
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }

  getPaymentMethodDisplayName(method: string): string {
    const methodNames: Record<string, string> = {
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta',
      'transferencia': 'Transferencia',
      'yape': 'Yape',
      'plin': 'Plin'
    };
    return methodNames[method] || method;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Lima'
    }).format(date);
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima'
    }).format(date);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
