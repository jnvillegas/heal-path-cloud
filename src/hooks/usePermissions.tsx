import { useUserRole, UserRole } from "./useUserRole";

interface PermissionsData {
  // Patients
  canViewAllPatients: boolean;
  canCreatePatient: boolean;
  canEditPatient: boolean;
  canUpdatePatient: boolean;
  canDeletePatient: boolean;
  
  // Cost Savings Cases
  canViewAllCases: boolean;
  canCreateCase: boolean;
  canEvaluateCase: boolean;
  canEditCase: boolean;
  
  // Appointments
  canViewAllAppointments: boolean;
  canCreateAppointment: boolean;
  canEditAppointment: boolean;
  
  // Medical Records
  canViewAllMedicalRecords: boolean;
  canCreateMedicalRecord: boolean;
  canEditMedicalRecord: boolean;
  
  // Prescriptions
  canViewAllPrescriptions: boolean;
  canCreatePrescription: boolean;
  canEditPrescription: boolean;
  
  // Reports
  canViewReports: boolean;
  canGenerateReports: boolean;
  
  // Users & Config
  canManageUsers: boolean;
  canManageConfiguration: boolean;
  
  // Doctors
  canViewDoctors: boolean;
  canManageDoctors: boolean;
}

export const usePermissions = (): PermissionsData & { role: UserRole | null; isLoading: boolean } => {
  const { role, isLoading, isAdmin, isMedico, isMedicoEvaluador, isGestor, isPaciente } = useUserRole();

  return {
    role,
    isLoading,
    
    // Patients permissions
    canViewAllPatients: !isPaciente, // All except patients
    canCreatePatient: isMedico || isMedicoEvaluador || isAdmin,
    canEditPatient: isMedico || isMedicoEvaluador || isAdmin,
    canUpdatePatient: isMedico || isMedicoEvaluador || isAdmin,
    canDeletePatient: isAdmin,
    
    // Cost Savings Cases permissions
    canViewAllCases: !isPaciente, // All except patients
    canCreateCase: isMedico || isMedicoEvaluador || isAdmin,
    canEvaluateCase: isMedicoEvaluador || isAdmin,
    canEditCase: isMedicoEvaluador || isAdmin,
    
    // Appointments permissions
    canViewAllAppointments: !isPaciente,
    canCreateAppointment: isMedico || isMedicoEvaluador || isAdmin,
    canEditAppointment: isMedico || isMedicoEvaluador || isAdmin,
    
    // Medical Records permissions
    canViewAllMedicalRecords: !isPaciente,
    canCreateMedicalRecord: isMedico || isMedicoEvaluador,
    canEditMedicalRecord: isMedico || isMedicoEvaluador,
    
    // Prescriptions permissions
    canViewAllPrescriptions: !isPaciente,
    canCreatePrescription: isMedico || isMedicoEvaluador,
    canEditPrescription: isMedico || isMedicoEvaluador,
    
    // Reports permissions
    canViewReports: isGestor || isAdmin,
    canGenerateReports: isGestor || isAdmin,
    
    // Users & Configuration permissions
    canManageUsers: isAdmin,
    canManageConfiguration: isAdmin,
    
    // Doctors permissions
    canViewDoctors: isAdmin || isGestor,
    canManageDoctors: isAdmin,
  };
};
