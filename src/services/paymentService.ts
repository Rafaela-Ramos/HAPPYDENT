import { authService } from './authService';

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
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  pendingAmount: number;
  totalPayments: number;
  byMethod: Array<{ _id: string; total: number; count: number }>;
  today?: {
    revenue: number;
    transactions: number;
  };
  month?: {
    revenue: number;
    transactions: number;
  };
  year?: {
    revenue: number;
    transactions: number;
  };
  pending?: {
    amount: number;
    count: number;
  };
  paymentMethods?: {
    _id: string;
    count: number;
    total: number;
  }[];
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
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros a la URL
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.paymentMethod && params.paymentMethod !== 'all') queryParams.append('paymentMethod', params.paymentMethod);
      if (params.date) queryParams.append('date', params.date);

      const response = await fetch(`${API_BASE_URL}/payments?${queryParams.toString()}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener pagos');
      }

      return data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  // Obtener resumen de pago para una cita
  async getPaymentSummary(appointmentId: string): Promise<{ success: boolean; data: PaymentSummary }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/appointment/${appointmentId}/summary`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener resumen de pago');
      }

      return data;
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      throw error;
    }
  }

  // Aplicar descuento general a una cita
  async applyDiscount(
    appointmentId: string, 
    discountData: ApplyDiscountRequest
  ): Promise<{ success: boolean; data: { originalAmount: number; discount: number; discountAmount: number; finalAmount: number }; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/appointment/${appointmentId}/discount`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(discountData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al aplicar descuento');
      }

      return data;
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  }

  // Procesar pago de una cita
  async processPayment(
    appointmentId: string, 
    paymentData: ProcessPaymentRequest
  ): Promise<{ success: boolean; data: { appointment: any; receipt: Receipt }; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/appointment/${appointmentId}/pay`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar pago');
      }

      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Obtener comprobante de pago
  async getReceipt(appointmentId: string): Promise<{ success: boolean; data: Receipt }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/receipt/${appointmentId}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener comprobante');
      }

      return data;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      throw error;
    }
  }

  // Obtener estadísticas de pagos
  async getPaymentStats(): Promise<{ success: boolean; data: PaymentStats }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/stats`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estadísticas de pagos');
      }

      return data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }

  // Crear un nuevo pago
  async createPayment(paymentData: CreatePaymentRequest): Promise<{ success: boolean; data: Payment }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear pago');
      }

      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Actualizar un pago existente
  async updatePayment(paymentId: string, paymentData: CreatePaymentRequest): Promise<{ success: boolean; data: Payment }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar pago');
      }

      return data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  // Eliminar un pago
  async deletePayment(paymentId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar pago');
      }

      return data;
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

  calculateChange(amountPaid: number, finalAmount: number): number {
    return Math.max(0, amountPaid - finalAmount);
  }

  calculateDiscountAmount(subtotal: number, discountPercentage: number): number {
    return (subtotal * discountPercentage) / 100;
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

  // Generar PDF del comprobante (función placeholder)
  async generateReceiptPDF(receipt: Receipt): Promise<Blob> {
    // Esta función se puede implementar con librerías como jsPDF o pdfmake
    // Por ahora retornamos un placeholder
    throw new Error('Generación de PDF no implementada aún');
  }

  // Imprimir comprobante
  printReceipt(receipt: Receipt): void {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const html = this.generateReceiptHTML(receipt);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  private generateReceiptHTML(receipt: Receipt): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprobante de Pago - ${receipt.receiptNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .clinic-info { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
          .patient-info { margin-bottom: 15px; }
          .services-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .services-table th, .services-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          .services-table th { background-color: #f0f0f0; }
          .totals { text-align: right; margin-top: 20px; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="clinic-info">
          <h2>${receipt.clinicInfo.name}</h2>
          <p>${receipt.clinicInfo.address}</p>
          <p>Tel: ${receipt.clinicInfo.phone}</p>
        </div>
        
        <div class="header">
          <h3>COMPROBANTE DE PAGO</h3>
          <p><strong>N°:</strong> ${receipt.receiptNumber}</p>
          <p><strong>Fecha:</strong> ${this.formatDateTime(receipt.date)}</p>
        </div>
        
        <div class="patient-info">
          <p><strong>Paciente:</strong> ${receipt.patient.name}</p>
          <p><strong>DNI:</strong> ${receipt.patient.dni}</p>
          ${receipt.patient.phone ? `<p><strong>Teléfono:</strong> ${receipt.patient.phone}</p>` : ''}
          <p><strong>Fecha de Cita:</strong> ${this.formatDate(receipt.appointmentDate)}</p>
        </div>
        
        <table class="services-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Cant.</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
              <th>Desc.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.services.map(service => `
              <tr>
                <td>${service.serviceName}</td>
                <td>${service.quantity}</td>
                <td>${this.formatCurrency(service.unitPrice)}</td>
                <td>${this.formatCurrency(service.subtotal)}</td>
                <td>${service.discount}%</td>
                <td>${this.formatCurrency(service.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p><strong>Subtotal: ${this.formatCurrency(receipt.totals.subtotal)}</strong></p>
          ${receipt.totals.generalDiscount > 0 ? `<p>Descuento General: ${receipt.totals.generalDiscount}%</p>` : ''}
          <p><strong>TOTAL: ${this.formatCurrency(receipt.totals.finalAmount)}</strong></p>
          <p>Método de Pago: ${this.getPaymentMethodDisplayName(receipt.totals.paymentMethod)}</p>
        </div>
        
        <div class="footer">
          <p>Gracias por su confianza</p>
          <p>DocSmile Suite - Sistema de Gestión Dental</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const paymentService = new PaymentService();
export default paymentService;