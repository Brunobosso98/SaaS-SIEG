
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS_OF_WEEK = [
  { value: "1", label: "Segunda" },
  { value: "2", label: "Terça" },
  { value: "3", label: "Quarta" },
  { value: "4", label: "Quinta" },
  { value: "5", label: "Sexta" },
  { value: "6", label: "Sábado" },
  { value: "0", label: "Domingo" },
];

export function ScheduleSettings() {
  const [scheduleType, setScheduleType] = useState("daily");
  const [dailyTimes, setDailyTimes] = useState<string[]>(["08:00"]);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>(["1", "3", "5"]);
  const [weeklyTime, setWeeklyTime] = useState("10:00");
  const [monthlyDay, setMonthlyDay] = useState("1");
  const [monthlyTime, setMonthlyTime] = useState("09:00");
  const [isAutoEnabled, setIsAutoEnabled] = useState(true);

  const handleAddDailyTime = () => {
    if (dailyTimes.length < 4) { // Assuming plan limits to 4 times per day
      setDailyTimes([...dailyTimes, "12:00"]);
    } else {
      toast({
        title: "Limite atingido",
        description: "Seu plano permite no máximo 4 horários por dia.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDailyTime = (index: number) => {
    setDailyTimes(dailyTimes.filter((_, i) => i !== index));
  };

  const handleDailyTimeChange = (index: number, value: string) => {
    const newTimes = [...dailyTimes];
    newTimes[index] = value;
    setDailyTimes(newTimes);
  };

  const handleWeekdayToggle = (day: string) => {
    setSelectedWeekdays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const handleSaveSchedule = () => {
    toast({
      title: "Agendamento salvo",
      description: "Suas configurações de agendamento foram salvas com sucesso.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span>Agendamento de Downloads</span>
        </CardTitle>
        <CardDescription>
          Configure quando os downloads automáticos devem ser executados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch 
            id="auto-schedule" 
            checked={isAutoEnabled} 
            onCheckedChange={setIsAutoEnabled} 
          />
          <Label htmlFor="auto-schedule">Habilitar downloads automáticos</Label>
        </div>

        {isAutoEnabled && (
          <Tabs value={scheduleType} onValueChange={setScheduleType} className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="daily">Diário</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Horários de execução</h3>
                </div>
                
                {dailyTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => handleDailyTimeChange(index, e.target.value)}
                      className="w-36"
                    />
                    
                    {dailyTimes.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveDailyTime(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                
                {dailyTimes.length < 4 && (
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={handleAddDailyTime}
                  >
                    Adicionar Horário
                  </Button>
                )}
                
                <div className="text-xs flex items-center gap-1.5 text-muted-foreground mt-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Seu plano permite até 4 horários por dia</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="weekly" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Dias da semana</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`day-${day.value}`} 
                          checked={selectedWeekdays.includes(day.value)}
                          onCheckedChange={() => handleWeekdayToggle(day.value)}
                        />
                        <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Horário</h3>
                  <Input
                    type="time"
                    value={weeklyTime}
                    onChange={(e) => setWeeklyTime(e.target.value)}
                    className="w-36"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Dia do mês</h3>
                  <Select 
                    value={monthlyDay} 
                    onValueChange={setMonthlyDay}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Dia {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Horário</h3>
                  <Input
                    type="time"
                    value={monthlyTime}
                    onChange={(e) => setMonthlyTime(e.target.value)}
                    className="w-36"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSchedule}>
          Salvar Configurações
        </Button>
      </CardFooter>
    </Card>
  );
}
