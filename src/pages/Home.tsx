import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Calendar, Pill, Stethoscope, MessageSquare, Activity } from "lucide-react";

export default function Home() {
  const services = [
    {
      icon: Bot,
      title: "AI Health Assistant",
      description: "Get instant answers to your health questions from our intelligent chatbot assistant.",
      link: "/chat",
      buttonText: "Chat Now"
    },
    {
      icon: Stethoscope,
      title: "Symptom Checker",
      description: "Analyze your symptoms and get preliminary health assessments and recommendations.",
      link: "/symptom-checker",
      buttonText: "Check Symptoms"
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Schedule appointments with healthcare providers quickly and easily.",
      link: "/appointments",
      buttonText: "Book Appointment"
    },
    {
      icon: Pill,
      title: "Medicine Reminders",
      description: "Never miss a dose with personalized medication reminders and tracking.",
      link: "/reminders",
      buttonText: "Set Reminders"
    }
  ];

  const testimonials = [
    {
      name: "John Doe",
      role: "Patient",
      initials: "JD",
      feedback: "MediCare+ has transformed how I manage my health. The medication reminders have been a lifesaver for my daily medications."
    },
    {
      name: "Jane Smith",
      role: "Healthcare Professional",
      initials: "JS",
      feedback: "The symptom checker helped me identify a potential issue that needed medical attention. I'm grateful for this tool!"
    },
    {
      name: "Robert Johnson",
      role: "Business Executive",
      initials: "RJ",
      feedback: "Booking appointments has never been easier. I love how I can manage all my healthcare needs in one place."
    }
  ];

  const stats = [
    { value: "500+", label: "Healthcare Providers" },
    { value: "10,000+", label: "Active Users" },
    { value: "50+", label: "Partner Hospitals" },
    { value: "4.8/5", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">
              MediCare+
            </Link>
            <div className="flex gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
              <Link to="/symptom-checker" className="text-sm font-medium hover:text-primary">Symptom Checker</Link>
              <Link to="/appointments" className="text-sm font-medium hover:text-primary">Appointments</Link>
              <Link to="/reminders" className="text-sm font-medium hover:text-primary">Reminders</Link>
              <Link to="/feedback" className="text-sm font-medium hover:text-primary">Feedback</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Your Personal Healthcare Assistant</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Get instant health advice, manage appointments, track medications, and more with our intelligent healthcare platform.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/chat">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary">Our Services</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-medium transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-center">{service.title}</CardTitle>
                <CardDescription className="text-center">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild className="w-full">
                  <Link to={service.link}>{service.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-sm">{testimonial.feedback}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary">Trusted by Healthcare Professionals</h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 MediCare+. Your Personal Healthcare Assistant.</p>
        </div>
      </footer>
    </div>
  );
}