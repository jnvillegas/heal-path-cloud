import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export type UserRole = 'paciente' | 'medico' | 'medico_evaluador' | 'gestor' | 'administrador';

interface UserRoleData {
  role: UserRole | null;
  status: 'active' | 'inactive' | null;
  isLoading: boolean;
  isAdmin: boolean;
  isMedico: boolean;
  isMedicoEvaluador: boolean;
  isGestor: boolean;
  isPaciente: boolean;
  isActive: boolean;
}

export const useUserRole = (): UserRoleData => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const role = data?.role as UserRole | null;
  const status = data?.status as 'active' | 'inactive' | null;

  return {
    role,
    status,
    isLoading,
    isAdmin: role === 'administrador',
    isMedico: role === 'medico',
    isMedicoEvaluador: role === 'medico_evaluador',
    isGestor: role === 'gestor',
    isPaciente: role === 'paciente',
    isActive: status === 'active',
  };
};
