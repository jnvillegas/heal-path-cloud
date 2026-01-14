import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Calculator, Pill } from "lucide-react";

interface Medication {
  name: string;
  dose: string;
  frequency: string;
}

interface Step2Data {
  intervention_type: string;
  intervention_cost: number;
  current_monthly_cost: number;
  current_projected_cost: number;
  // Calculated fields
  monthly_savings: number;
  projected_savings: number;
  savings_percentage: number;
}

interface Step2CostAnalysisProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  initialMonthlyCost: number;
  projectedPeriod: number;
  initialCost: number;
  medications: Medication[];
}

export function Step2CostAnalysis({
  data,
  onChange,
  initialMonthlyCost,
  projectedPeriod,
  initialCost,
  medications,
}: Step2CostAnalysisProps) {
  // Calculate derived values when inputs change
  useEffect(() => {
    const currentMonthly = data.current_monthly_cost || 0;
    const currentProjected = currentMonthly * projectedPeriod;
    const monthlySavings = initialMonthlyCost - currentMonthly;
    const projectedSavings = initialCost - currentProjected - data.intervention_cost;
    const savingsPercentage = initialCost > 0 ? (projectedSavings / initialCost) * 100 : 0;

    onChange({
      ...data,
      current_projected_cost: currentProjected,
      monthly_savings: monthlySavings,
      projected_savings: projectedSavings,
      savings_percentage: savingsPercentage,
    });
  }, [data.current_monthly_cost, data.intervention_cost, initialMonthlyCost, projectedPeriod, initialCost]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS',
      minimumFractionDigits: 2 
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Initial vs Proposed Scheme Comparison */}
      <div className="grid grid-cols-2 gap-6">
        {/* Initial Scheme */}
        <Card className="border-2">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                <h3 className="font-semibold">Esquema Inicial</h3>
              </div>
              <Badge variant="secondary">Actual</Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Medicamento / Procedimiento</p>
                <div className="mt-1 p-2 bg-muted/50 rounded text-sm">
                  {medications.length > 0 
                    ? medications.map(m => m.name).join(", ")
                    : "Sin medicamentos"
                  }
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Costo Mensual</p>
                  <p className="font-semibold">{formatCurrency(initialMonthlyCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-semibold">{projectedPeriod} meses</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Subtotal Proyectado</p>
                <p className="text-xl font-bold">{formatCurrency(initialCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposed Scheme */}
        <Card className="border-2 border-green-500/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-600">Esquema Propuesto</h3>
              </div>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                Recomendado
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Intervención *</Label>
                <Input
                  className="mt-1"
                  placeholder="Ej: Cambio a genérico, ajuste de dosis..."
                  value={data.intervention_type}
                  onChange={(e) => onChange({ ...data, intervention_type: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Costo de Intervención ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="mt-1"
                    value={data.intervention_cost || ""}
                    onChange={(e) => onChange({ 
                      ...data, 
                      intervention_cost: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>
                <div>
                  <Label>Costo Mensual Actual ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="mt-1"
                    value={data.current_monthly_cost || ""}
                    onChange={(e) => onChange({ 
                      ...data, 
                      current_monthly_cost: parseFloat(e.target.value) || 0 
                    })}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Subtotal Proyectado</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(data.current_projected_cost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Summary Card */}
      <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700 uppercase tracking-wide">
                Ahorro Mensual Estimado
              </p>
              <p className="text-sm text-green-600/70">
                Basado en proyección de {projectedPeriod} meses
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">
                +{formatCurrency(data.projected_savings > 0 ? data.projected_savings : 0)}
              </p>
              <p className="text-sm text-green-600">
                {data.savings_percentage > 0 
                  ? `${data.savings_percentage.toFixed(1)}% de reducción en costos`
                  : "Ingrese el costo propuesto"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Calculations */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Ahorro Mensual</p>
          <p className={`text-lg font-bold ${data.monthly_savings > 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(data.monthly_savings)}
          </p>
        </div>
        <div className="text-center border-x">
          <p className="text-sm text-muted-foreground">Ahorro Total Proyectado</p>
          <p className={`text-lg font-bold ${data.projected_savings > 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(data.projected_savings)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">% Costo - Ahorratividad</p>
          <p className={`text-lg font-bold ${data.savings_percentage > 0 ? 'text-green-600' : 'text-destructive'}`}>
            {data.savings_percentage.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
