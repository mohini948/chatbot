import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Trash2, Pill } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MedicineReminder {
  id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  time_of_day: string;
  start_date: string;
  end_date: string | null;
  notes: string;
  is_active: boolean;
}

export default function Reminders() {
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchReminders();
  }, []);

  const checkAuthAndFetchReminders = async () => {
    // Skip auth check - use guest user
    fetchReminders();
  };

  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from("medicine_reminders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reminders",
        variant: "destructive"
      });
      return;
    }

    setReminders(data || []);
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicineName || !dosage || !frequency || !timeOfDay || !startDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from("medicine_reminders").insert({
      user_id: "guest-user",
      medicine_name: medicineName,
      dosage,
      frequency,
      time_of_day: timeOfDay,
      start_date: startDate,
      end_date: endDate || null,
      notes,
      is_active: true
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add reminder",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Medicine reminder added successfully"
      });
      setMedicineName("");
      setDosage("");
      setFrequency("");
      setTimeOfDay("");
      setStartDate("");
      setEndDate("");
      setNotes("");
      fetchReminders();
    }

    setIsLoading(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("medicine_reminders")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive"
      });
    } else {
      fetchReminders();
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const { error } = await supabase.from("medicine_reminders").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Reminder deleted"
      });
      fetchReminders();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Reminder Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Medicine Reminder</CardTitle>
              <CardDescription>Never miss a dose with personalized reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddReminder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicine">Medicine Name *</Label>
                  <Input
                    id="medicine"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="Aspirin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="100mg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once-daily">Once daily</SelectItem>
                      <SelectItem value="twice-daily">Twice daily</SelectItem>
                      <SelectItem value="three-times-daily">Three times daily</SelectItem>
                      <SelectItem value="as-needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time of Day *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take with food..."
                    className="min-h-[60px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Reminder"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reminders List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Medicine Reminders</CardTitle>
              <CardDescription>Manage your medication schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No reminders set</p>
                ) : (
                  reminders.map((reminder) => (
                    <Card key={reminder.id} className={!reminder.is_active ? "opacity-50" : ""}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Pill className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{reminder.medicine_name}</p>
                              <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Switch
                              checked={reminder.is_active}
                              onCheckedChange={() => handleToggleActive(reminder.id, reminder.is_active)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteReminder(reminder.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><Badge variant="secondary">{reminder.frequency}</Badge></p>
                          <p className="text-muted-foreground">Time: {reminder.time_of_day}</p>
                          <p className="text-muted-foreground">
                            {reminder.start_date} {reminder.end_date && `- ${reminder.end_date}`}
                          </p>
                          {reminder.notes && (
                            <p className="text-muted-foreground mt-2">{reminder.notes}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}