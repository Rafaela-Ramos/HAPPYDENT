// Datos estáticos para modo presentación
export const staticPatients = [
  {
    id: "1",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@email.com",
    phone: "+52 555-123-4567",
    dateOfBirth: "1985-06-15",
    gender: "Masculino",
    address: "Calle Principal 123, Colonia Centro, Ciudad de México",
    emergencyContact: {
      name: "María Pérez",
      phone: "+52 555-987-6543",
      relationship: "Esposa"
    },
    medicalHistory: {
      allergies: "Penicilina",
      medications: "Lisinopril 10mg",
      diseases: "Hipertensión",
      notes: "Paciente regular, última visita hace 6 meses"
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-06-20T14:22:00Z"
  },
  {
    id: "2",
    firstName: "Ana",
    lastName: "García",
    email: "ana.garcia@email.com",
    phone: "+52 555-234-5678",
    dateOfBirth: "1992-03-22",
    gender: "Femenino",
    address: "Avenida Reforma 456, Colonia Polanco, Ciudad de México",
    emergencyContact: {
      name: "Carlos García",
      phone: "+52 555-345-6789",
      relationship: "Hermano"
    },
    medicalHistory: {
      allergies: "Ninguna conocida",
      medications: "Vitamina D",
      diseases: "Ninguna",
      notes: "Paciente nueva, primera consulta"
    },
    createdAt: "2024-06-10T09:15:00Z",
    updatedAt: "2024-06-10T09:15:00Z"
  },
  {
    id: "3",
    firstName: "Roberto",
    lastName: "Martínez",
    email: "roberto.martinez@email.com",
    phone: "+52 555-345-6789",
    dateOfBirth: "1978-11-08",
    gender: "Masculino",
    address: "Boulevard Insurgentes 789, Colonia Roma, Ciudad de México",
    emergencyContact: {
      name: "Laura Martínez",
      phone: "+52 555-456-7890",
      relationship: "Hija"
    },
    medicalHistory: {
      allergies: "Ibuprofeno",
      medications: "Metformina 500mg",
      diseases: "Diabetes Tipo 2",
      notes: "Paciente con sensibilidad dental, requiere anestesia local"
    },
    createdAt: "2024-02-28T16:45:00Z",
    updatedAt: "2024-07-15T11:30:00Z"
  }
];

export const staticAppointments = [
  {
    id: "1",
    patientId: "1",
    patientName: "Juan Pérez",
    date: "2024-07-25",
    time: "10:00",
    duration: 60,
    type: "Consulta general",
    status: "Programada",
    notes: "Revisión semestral de rutina",
    createdAt: "2024-07-01T08:00:00Z",
    updatedAt: "2024-07-01T08:00:00Z"
  },
  {
    id: "2",
    patientId: "2",
    patientName: "Ana García",
    date: "2024-07-25",
    time: "11:30",
    duration: 45,
    type: "Primera consulta",
    status: "Confirmada",
    notes: "Evaluación inicial y plan de tratamiento",
    createdAt: "2024-07-10T10:15:00Z",
    updatedAt: "2024-07-20T14:30:00Z"
  },
  {
    id: "3",
    patientId: "3",
    patientName: "Roberto Martínez",
    date: "2024-07-26",
    time: "09:00",
    duration: 90,
    type: "Tratamiento de conducto",
    status: "Programada",
    notes: "Segunda sesión de endodoncia",
    createdAt: "2024-07-15T16:20:00Z",
    updatedAt: "2024-07-15T16:20:00Z"
  },
  {
    id: "4",
    patientId: "1",
    patientName: "Juan Pérez",
    date: "2024-07-24",
    time: "14:00",
    duration: 30,
    type: "Limpieza dental",
    status: "Completada",
    notes: "Limpieza y pulido",
    createdAt: "2024-07-18T11:45:00Z",
    updatedAt: "2024-07-24T14:30:00Z"
  }
];

export const staticServices = [
  {
    id: "1",
    name: "Consulta general",
    description: "Examen dental completo y diagnóstico",
    duration: 60,
    price: 500.00,
    category: "Consulta",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Limpieza dental",
    description: "Profilaxis dental completa",
    duration: 45,
    price: 300.00,
    category: "Prevención",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Tratamiento de conducto",
    description: "Endodoncia para salvar diente afectado",
    duration: 120,
    price: 2500.00,
    category: "Tratamiento",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Blanqueamiento dental",
    description: "Blanqueamiento profesional con láser",
    duration: 90,
    price: 1500.00,
    category: "Estética",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "5",
    name: "Ortodoncia",
    description: "Tratamiento de alineación dental",
    duration: 30,
    price: 800.00,
    category: "Ortodoncia",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "6",
    name: "Extracción dental",
    description: "Extracción simple o quirúrgica",
    duration: 60,
    price: 800.00,
    category: "Cirugía",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

export const staticAppliedServices = [
  {
    id: "1",
    patientId: "1",
    patientName: "Juan Pérez",
    serviceId: "2",
    serviceName: "Limpieza dental",
    appointmentId: "4",
    date: "2024-07-24",
    dentistId: "1",
    dentistName: "Dr. Carlos Rodríguez",
    price: 300.00,
    status: "Completado",
    notes: "Limpieza completa sin complicaciones",
    materials: ["Pasta profiláctica", "Cepillos interdentales"],
    createdAt: "2024-07-24T14:30:00Z",
    updatedAt: "2024-07-24T14:30:00Z"
  },
  {
    id: "2",
    patientId: "3",
    patientName: "Roberto Martínez",
    serviceId: "3",
    serviceName: "Tratamiento de conducto",
    appointmentId: "3",
    date: "2024-07-20",
    dentistId: "1",
    dentistName: "Dr. Carlos Rodríguez",
    price: 2500.00,
    status: "En progreso",
    notes: "Primera sesión completada, segunda sesión programada",
    materials: ["Anestesia local", "Gutta-percha", "Cemento de obturación"],
    createdAt: "2024-07-20T16:45:00Z",
    updatedAt: "2024-07-20T16:45:00Z"
  },
  {
    id: "3",
    patientId: "2",
    patientName: "Ana García",
    serviceId: "1",
    serviceName: "Consulta general",
    appointmentId: "2",
    date: "2024-07-25",
    dentistId: "2",
    dentistName: "Dra. María López",
    price: 500.00,
    status: "Programado",
    notes: "Primera consulta del paciente",
    materials: [],
    createdAt: "2024-07-10T10:15:00Z",
    updatedAt: "2024-07-10T10:15:00Z"
  }
];

export const staticPayments = [
  {
    id: "1",
    appointmentId: "4",
    patientId: "1",
    patientName: "Juan Pérez",
    services: [
      {
        serviceId: "2",
        serviceName: "Limpieza dental",
        category: "Prevención",
        quantity: 1,
        unitPrice: 300.00,
        total: 300.00
      }
    ],
    amount: 300.00,
    date: "2024-07-24",
    paymentMethod: "tarjeta_credito",
    status: "Completado",
    transactionId: "TXN001",
    notes: "Pago completado en terminal",
    createdAt: "2024-07-24T14:35:00Z",
    updatedAt: "2024-07-24T14:35:00Z"
  },
  {
    id: "2",
    appointmentId: "3",
    patientId: "3",
    patientName: "Roberto Martínez",
    services: [
      {
        serviceId: "3",
        serviceName: "Tratamiento de conducto",
        category: "Tratamiento",
        quantity: 1,
        unitPrice: 2500.00,
        total: 1250.00
      }
    ],
    amount: 1250.00,
    date: "2024-07-20",
    paymentMethod: "transferencia",
    status: "Pagado parcial",
    transactionId: "TXN002",
    notes: "Primera de dos partes del tratamiento",
    createdAt: "2024-07-20T17:00:00Z",
    updatedAt: "2024-07-20T17:00:00Z"
  },
  {
    id: "3",
    appointmentId: "2",
    patientId: "2",
    patientName: "Ana García",
    services: [
      {
        serviceId: "1",
        serviceName: "Consulta general",
        category: "Consulta",
        quantity: 1,
        unitPrice: 500.00,
        total: 500.00
      }
    ],
    amount: 500.00,
    date: "2024-07-25",
    paymentMethod: "efectivo",
    status: "Pendiente",
    transactionId: "",
    notes: "Pago pendiente al finalizar consulta",
    createdAt: "2024-07-10T10:20:00Z",
    updatedAt: "2024-07-10T10:20:00Z"
  },
  {
    id: "4",
    appointmentId: "1",
    patientId: "1",
    patientName: "Juan Pérez",
    services: [
      {
        serviceId: "1",
        serviceName: "Consulta general",
        category: "Consulta",
        quantity: 1,
        unitPrice: 500.00,
        total: 500.00
      },
      {
        serviceId: "4",
        serviceName: "Blanqueamiento dental",
        category: "Estética",
        quantity: 1,
        unitPrice: 1500.00,
        total: 1500.00
      }
    ],
    amount: 2000.00,
    date: "2024-07-15",
    paymentMethod: "efectivo",
    status: "Completado",
    transactionId: "TXN004",
    notes: "Pago completo por consulta y blanqueamiento",
    createdAt: "2024-07-15T16:45:00Z",
    updatedAt: "2024-07-15T16:45:00Z"
  },
  {
    id: "5",
    appointmentId: "5",
    patientId: "2",
    patientName: "Ana García",
    services: [
      {
        serviceId: "6",
        serviceName: "Extracción dental",
        category: "Cirugía",
        quantity: 1,
        unitPrice: 800.00,
        total: 800.00
      }
    ],
    amount: 800.00,
    date: "2024-07-22",
    paymentMethod: "tarjeta_debito",
    status: "Completado",
    transactionId: "TXN005",
    notes: "Extracción de muela inferior",
    createdAt: "2024-07-22T11:30:00Z",
    updatedAt: "2024-07-22T11:30:00Z"
  }
];

export const staticUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@happydent.com",
    fullName: "Administrador HappyDent",
    role: "admin",
    profile: {
      phone: "+52 555-000-0000",
      address: "Consultorio Principal, Ciudad de México",
      specialty: "Administración",
      professionalLicense: "ADMIN001",
      bio: "Administrador del sistema"
    },
    lastLogin: "2024-07-24T08:00:00Z"
  },
  {
    id: "2",
    username: "doctor",
    email: "doctor@happydent.com",
    fullName: "Dr. Carlos Rodríguez",
    role: "dentist",
    profile: {
      phone: "+52 555-111-1111",
      address: "Consultorio Principal, Ciudad de México",
      specialty: "Odontología General",
      professionalLicense: "CED123456",
      bio: "Odontólogo con más de 10 años de experiencia"
    },
    lastLogin: "2024-07-24T07:30:00Z"
  }
];

// Credenciales estáticas para demo
export const staticCredentials = {
  admin: {
    username: "admin",
    password: "admin123",
    user: staticUsers[0]
  },
  doctor: {
    username: "doctor",
    password: "doctor123",
    user: staticUsers[1]
  }
};

// Datos estáticos de perfil
export const staticProfile = {
  id: "1",
  username: "doctor",
  email: "doctor@happydent.com",
  fullName: "Dr. Carlos Rodríguez",
  role: "dentist",
  profile: {
    phone: "+51 999 888 777",
    address: "Av. Arequipa 1234, Miraflores, Lima",
    specialty: "Odontología General",
    professionalLicense: "CED123456",
    bio: "Odontólogo con más de 10 años de experiencia en rehabilitación oral y estética dental. Graduado de la Universidad Nacional Mayor de San Marcos."
  },
  securityQuestion: {
    question: "¿Cuál fue tu primera mascota?"
  },
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-07-24T08:00:00Z"
};

// Configuración estática de clínica
export const staticClinicSettings = {
  name: "HappyDent - Clínica Dental",
  dentist: {
    name: "Dr. Carlos Rodríguez",
    specialty: "Odontología General",
    license: "CED123456",
    bio: "Odontólogo con más de 10 años de experiencia en rehabilitación oral y estética dental."
  },
  contact: {
    phone: "+51 999 888 777",
    address: "Av. Arequipa 1234, Miraflores, Lima",
    email: "contacto@happydent.com"
  },
  workingHours: {
    monday: { start: "09:00", end: "18:00", isWorking: true },
    tuesday: { start: "09:00", end: "18:00", isWorking: true },
    wednesday: { start: "09:00", end: "18:00", isWorking: true },
    thursday: { start: "09:00", end: "18:00", isWorking: true },
    friday: { start: "09:00", end: "18:00", isWorking: true },
    saturday: { start: "09:00", end: "14:00", isWorking: true },
    sunday: { start: "00:00", end: "00:00", isWorking: false }
  }
};

// Estadísticas estáticas de actividad
export const staticActivityStats = {
  appointments: {
    total: 156,
    thisMonth: 23
  },
  patients: {
    total: 89,
    activeThisMonth: 12
  },
  lastLogin: "2024-07-24T08:00:00Z",
  accountCreated: "2024-01-01T00:00:00Z",
  profileCompleteness: 85
};

// Estadísticas estáticas para el dashboard
export const staticDashboardStats = {
  patients: {
    total: 89,
    active: 67,
    recentlyAdded: 12,
    newThisMonth: 8,
    inactive: 22
  },
  appointments: {
    today: {
      total: 8,
      completed: 3,
      pending: 5,
      cancelled: 0
    },
    upcomingWeek: 23,
    thisMonth: 47,
    completionRate: 87.5
  },
  payments: {
    month: {
      revenue: 15420.50,
      transactions: 31,
      averageTicket: 497.43
    },
    pending: {
      amount: 2800.00,
      count: 4
    },
    today: {
      revenue: 1850.00,
      transactions: 4
    }
  },
  performance: {
    occupancyRate: 75,
    averageAppointmentValue: 328.10,
    patientRetention: 92,
    newPatientConversion: 85
  }
};

// Citas de hoy para el dashboard
export const staticTodayAppointments = [
  {
    _id: "1",
    patient: {
      _id: "1",
      dni: "1",
      firstName: "Juan",
      lastName: "Pérez",
      fullName: "Juan Pérez",
      email: "juan.perez@email.com",
      phone: "+51 999 123 456",
      address: {
        street: "Calle Principal 123",
        city: "Lima",
        state: "Lima",
        zipCode: "15001",
        country: "Perú"
      },
      dateOfBirth: "1985-06-15",
      gender: "masculino" as const,
      emergencyContact: {
        name: "María Pérez",
        relationship: "Esposa",
        phone: "+51 999 987 6543"
      },
      medicalHistory: {
        allergies: ["Penicilina"],
        medications: ["Lisinopril 10mg"],
        diseases: ["Hipertensión"],
        notes: "Paciente regular, última visita hace 6 meses"
      },
      isActive: true,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-06-20T14:22:00Z"
    },
    dentist: {
      _id: "1",
      fullName: "Dr. Carlos Rodríguez"
    },
    services: [
      {
        service: {
          _id: "1",
          name: "Consulta general",
          description: "Examen dental completo y diagnóstico",
          category: "Consulta",
          price: 500.00,
          duration: 60,
          isActive: true
        },
        quantity: 1
      }
    ],
    date: "2024-07-25",
    startTime: "09:00",
    endTime: "10:00",
    status: "completada" as const,
    type: "consulta" as const,
    notes: "Revisión semestral de rutina",
    appliedServices: [],
    payment: {
      totalAmount: 500.00,
      discount: 0,
      finalAmount: 500.00,
      isPaid: true
    },
    createdAt: "2024-07-25T09:00:00Z",
    updatedAt: "2024-07-25T10:00:00Z"
  },
  {
    _id: "2",
    patient: {
      _id: "2",
      dni: "2",
      firstName: "Ana",
      lastName: "García",
      fullName: "Ana García",
      email: "ana.garcia@email.com",
      phone: "+51 999 234 567",
      address: {
        street: "Avenida Reforma 456",
        city: "Lima",
        state: "Lima",
        zipCode: "15002",
        country: "Perú"
      },
      dateOfBirth: "1992-03-22",
      gender: "femenino" as const,
      emergencyContact: {
        name: "Carlos García",
        relationship: "Hermano",
        phone: "+51 999 345 6789"
      },
      medicalHistory: {
        allergies: [],
        medications: ["Vitamina D"],
        diseases: [],
        notes: "Paciente nueva, primera consulta"
      },
      isActive: true,
      createdAt: "2024-06-10T09:15:00Z",
      updatedAt: "2024-06-10T09:15:00Z"
    },
    dentist: {
      _id: "1",
      fullName: "Dr. Carlos Rodríguez"
    },
    services: [
      {
        service: {
          _id: "2",
          name: "Limpieza dental",
          description: "Profilaxis dental completa",
          category: "Prevención",
          price: 300.00,
          duration: 45,
          isActive: true
        },
        quantity: 1
      }
    ],
    date: "2024-07-25",
    startTime: "10:30",
    endTime: "11:15",
    status: "confirmada" as const,
    type: "tratamiento" as const,
    notes: "Primera consulta del paciente",
    appliedServices: [],
    payment: {
      totalAmount: 300.00,
      discount: 0,
      finalAmount: 300.00,
      isPaid: false
    },
    createdAt: "2024-07-10T10:15:00Z",
    updatedAt: "2024-07-20T14:30:00Z"
  },
  {
    _id: "3",
    patient: {
      _id: "3",
      dni: "3",
      firstName: "Roberto",
      lastName: "Martínez",
      fullName: "Roberto Martínez",
      email: "roberto.martinez@email.com",
      phone: "+51 999 345 678",
      address: {
        street: "Boulevard Insurgentes 789",
        city: "Lima",
        state: "Lima",
        zipCode: "15003",
        country: "Perú"
      },
      dateOfBirth: "1978-11-08",
      gender: "masculino" as const,
      emergencyContact: {
        name: "Laura Martínez",
        relationship: "Hija",
        phone: "+51 999 456 7890"
      },
      medicalHistory: {
        allergies: ["Ibuprofeno"],
        medications: ["Metformina 500mg"],
        diseases: ["Diabetes Tipo 2"],
        notes: "Paciente con sensibilidad dental, requiere anestesia local"
      },
      isActive: true,
      createdAt: "2024-02-28T16:45:00Z",
      updatedAt: "2024-07-15T11:30:00Z"
    },
    dentist: {
      _id: "1",
      fullName: "Dr. Carlos Rodríguez"
    },
    services: [
      {
        service: {
          _id: "3",
          name: "Tratamiento de conducto",
          description: "Endodoncia para salvar diente afectado",
          category: "Tratamiento",
          price: 2500.00,
          duration: 90,
          isActive: true
        },
        quantity: 1
      }
    ],
    date: "2024-07-25",
    startTime: "11:30",
    endTime: "13:00",
    status: "programada" as const,
    type: "tratamiento" as const,
    notes: "Segunda sesión de endodoncia",
    appliedServices: [],
    payment: {
      totalAmount: 2500.00,
      discount: 0,
      finalAmount: 2500.00,
      isPaid: false
    },
    createdAt: "2024-07-15T16:20:00Z",
    updatedAt: "2024-07-15T16:20:00Z"
  }
];
