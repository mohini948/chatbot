import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  provider_name: string;
  appointment_date: string;
  appointment_type: string;
  notes: string;
  status: string;
}

export default function Appointments() {
  const [date, setDate] = useState<Date>();
  const [providerName, setProviderName] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [notes, setNotes] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Example doctors list (realistic data)
  const doctors = [
    { name: "Dr. Rohan Mehta", specialization: "Cardiologist" },
    { name: "Dr. Anjali Sharma", specialization: "Dermatologist" },
    { name: "Dr. Kiran Patel", specialization: "Neurologist" },
    { name: "Dr. Sneha Kulkarni", specialization: "General Physician" },
    { name: "Dr. Aarav Deshmukh", specialization: "Orthopedic Surgeon" }
  ];

  // Fixed time slots
  const allTimeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  useEffect(() => {
    checkAuthAndFetchAppointments();
  }, []);

  const checkAuthAndFetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage appointments",
        variant: "destructive"
      });
      navigate("/chat");
      return;
    }
    fetchAppointments();
  };

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive"
      });
      return;
    }

    setAppointments(data || []);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !providerName || !appointmentType || !selectedSlot) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const appointmentDateTime = new Date(date);
    const [hour, minute, meridiem] = selectedSlot.split(/[: ]/);
    let hourNum = parseInt(hour);
    if (meridiem === "PM" && hourNum !== 12) hourNum += 12;
    if (meridiem === "AM" && hourNum === 12) hourNum = 0;
    appointmentDateTime.setHours(hourNum, parseInt(minute), 0, 0);

    const { error } = await supabase.from("appointments").insert({
      user_id: user?.id,
      provider_name: providerName,
      appointment_date: appointmentDateTime.toISOString(),
      appointment_type: appointmentType,
      notes: notes,
      status: "scheduled"
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Appointment booked successfully"
      });
      setDate(undefined);
      setProviderName("");
      setAppointmentType("");
      setNotes("");
      setSelectedSlot("");
      fetchAppointments();
    }

    setIsLoading(false);
  };

  const handleDeleteAppointment = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Appointment deleted"
      });
      fetchAppointments();
    }
  };

  // Filter booked slots for selected doctor and date
  const bookedSlots = appointments
    .filter(
      (a) =>
        a.provider_name === providerName &&
        date &&
        format(new Date(a.appointment_date), "PPP") === format(date, "PPP")
    )
    .map((a) => format(new Date(a.appointment_date), "hh:mm a"));

  const availableSlots = allTimeSlots.filter((slot) => !bookedSlots.includes(slot));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>Schedule a new appointment with a healthcare provider</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Doctor *</Label>
                  <Select value={providerName} onValueChange={setProviderName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doc) => (
                        <SelectItem key={doc.name} value={doc.name}>
                          {doc.name} — {doc.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Appointment Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {date && providerName && (
                  <div className="space-y-2">
                    <Label>Available Time Slots *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {allTimeSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedSlot === slot ? "default" : "outline"}
                          className={cn(
                            "text-sm",
                            bookedSlots.includes(slot) && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => !bookedSlots.includes(slot) && setSelectedSlot(slot)}
                        >
                          <Clock className="w-3 h-3 mr-1" /> {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Appointment Type *</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="checkup">Check-up</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information..."
                    className="min-h-[80px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Booking..." : "Book Appointment"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Appointment List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Appointments</CardTitle>
              <CardDescription>View and manage your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No appointments scheduled</p>
                ) : (
                  appointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{appointment.provider_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.appointment_date), "PPP hh:mm a")}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <Badge className="mb-2">{appointment.appointment_type}</Badge>
                        {appointment.notes && <p className="text-sm mt-2">{appointment.notes}</p>}
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
