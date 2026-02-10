// Servicios estáticos para modo presentación
import { staticServices, staticAppliedServices, staticPayments } from '@/data/staticData';

// Services Service
export class ServicesService {
  async getServices() {
    return {
      success: true,
      data: staticServices.map(service => ({
        _id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        duration: service.duration,
        code: service.id,
        isActive: service.isActive
      }))
    };
  }

  async getServiceById(id: string) {
    const service = staticServices.find(s => s.id === id);
    if (!service) {
      throw new Error('Servicio no encontrado');
    }

    return {
      success: true,
      data: {
        _id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        duration: service.duration,
        code: service.id,
        isActive: service.isActive
      }
    };
  }
}

// Applied Services Service
export class AppliedServicesService {
  async getAppliedServices() {
    return {
      success: true,
      data: staticAppliedServices.map(service => ({
        _id: service.id,
        patientId: service.patientId,
        patientName: service.patientName,
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        appointmentId: service.appointmentId,
        date: service.date,
        dentistId: service.dentistId,
        dentistName: service.dentistName,
        price: service.price,
        status: service.status,
        notes: service.notes,
        materials: service.materials,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }))
    };
  }

  async getAppliedServiceById(id: string) {
    const service = staticAppliedServices.find(s => s.id === id);
    if (!service) {
      throw new Error('Servicio aplicado no encontrado');
    }

    return {
      success: true,
      data: {
        _id: service.id,
        patientId: service.patientId,
        patientName: service.patientName,
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        appointmentId: service.appointmentId,
        date: service.date,
        dentistId: service.dentistId,
        dentistName: service.dentistName,
        price: service.price,
        status: service.status,
        notes: service.notes,
        materials: service.materials,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }
    };
  }
}

// Payments Service
export class PaymentsService {
  async getPayments() {
    return {
      success: true,
      data: staticPayments.map(payment => ({
        _id: payment.id,
        patientId: payment.patientId,
        patientName: payment.patientName,
        appliedServiceId: payment.appliedServiceId,
        appliedServiceName: payment.appliedServiceName,
        amount: payment.amount,
        date: payment.date,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        transactionId: payment.transactionId,
        notes: payment.notes,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }))
    };
  }

  async getPaymentById(id: string) {
    const payment = staticPayments.find(p => p.id === id);
    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    return {
      success: true,
      data: {
        _id: payment.id,
        patientId: payment.patientId,
        patientName: payment.patientName,
        appliedServiceId: payment.appliedServiceId,
        appliedServiceName: payment.appliedServiceName,
        amount: payment.amount,
        date: payment.date,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        transactionId: payment.transactionId,
        notes: payment.notes,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    };
  }
}

export const servicesService = new ServicesService();
export const appliedServicesService = new AppliedServicesService();
export const paymentsService = new PaymentsService();
