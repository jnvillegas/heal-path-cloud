import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, User, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePermissions } from "@/hooks/usePermissions";

interface Patient {
  id: string;
  document_number: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  email: string | null;
  phone: string | null;
  mobile_phone: string | null;
}

export default function Patients() {
  const { canCreatePatient, canUpdatePatient, canDeletePatient } = usePermissions();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    document_type: "DNI",
    document_number: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    gender: "Masculino",
    email: "",
    phone: "",
    mobile_phone: "",
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, document_number, first_name, last_name, birth_date, gender, email, phone, mobile_phone")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast.error("Error al cargar pacientes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPatient) {
        // Update existing patient
        const { error } = await supabase
          .from("patients")
          .update(formData)
          .eq("id", editingPatient.id);

        if (error) throw error;
        toast.success("Paciente actualizado exitosamente");
      } else {
        // Create new patient
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuario no autenticado");

        const { error } = await supabase.from("patients").insert({
          ...formData,
          created_by: user.id,
        });

        if (error) throw error;
        toast.success("Paciente creado exitosamente");
      }

      setDialogOpen(false);
      setEditingPatient(null);
      resetForm();
      loadPatients();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar paciente");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      document_type: "DNI",
      document_number: patient.document_number,
      first_name: patient.first_name,
      last_name: patient.last_name,
      birth_date: patient.birth_date,
      gender: patient.gender,
      email: patient.email || "",
      phone: patient.phone || "",
      mobile_phone: patient.mobile_phone || "",
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", patientToDelete.id);

      if (error) throw error;

      toast.success("Paciente eliminado exitosamente");
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
      loadPatients();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar paciente");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      document_type: "DNI",
      document_number: "",
      first_name: "",
      last_name: "",
      birth_date: "",
      gender: "Masculino",
      email: "",
      phone: "",
      mobile_phone: "",
    });
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingPatient(null);
      resetForm();
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.document_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Gestión de Pacientes
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra la información de tus pacientes
            </p>
          </div>
          {canCreatePatient && (
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Paciente
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPatient ? "Editar Paciente" : "Registrar Nuevo Paciente"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Documento</Label>
                    <Select
                      value={formData.document_type}
                      onValueChange={(val) => setFormData({ ...formData, document_type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                        <SelectItem value="CI">CI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Documento</Label>
                    <Input
                      value={formData.document_number}
                      onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de Nacimiento</Label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Género</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(val) => setFormData({ ...formData, gender: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Celular</Label>
                    <Input
                      value={formData.mobile_phone}
                      onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {editingPatient ? "Actualizar Paciente" : "Guardar Paciente"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por nombre, apellido o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando pacientes...</div>
        ) : filteredPatients.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="text-center py-12">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No hay pacientes registrados</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            {patient.first_name} {patient.last_name}
                          </div>
                        </TableCell>
                        <TableCell>{patient.document_number}</TableCell>
                        <TableCell>{patient.email || "-"}</TableCell>
                        <TableCell>{patient.mobile_phone || patient.phone || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canUpdatePatient && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(patient)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                            {canDeletePatient && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(patient)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al paciente{" "}
              <strong>{patientToDelete?.first_name} {patientToDelete?.last_name}</strong>. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
  );
}
