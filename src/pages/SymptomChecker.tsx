import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckSymptoms = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Error",
        description: "Please describe your symptoms",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setAnalysis("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the symptom checker",
          variant: "destructive"
        });
        navigate("/chat");
        return;
      }

      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            {
              role: "system",
              content: "You are a medical symptom analysis assistant. Analyze the symptoms provided and give a preliminary assessment. Always remind users to consult with a healthcare professional for proper diagnosis."
            },
            {
              role: "user",
              content: `Please analyze these symptoms: ${symptoms}`
            }
          ]
        }
      });

      if (error) throw error;

      const reader = data.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6);
              if (jsonStr === "[DONE]") continue;
              
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices[0]?.delta?.content || "";
                setAnalysis(prev => prev + content);
              } catch (e) {
                console.error("Error parsing chunk:", e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error checking symptoms:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze symptoms",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Symptom Checker</CardTitle>
            <CardDescription>
              Describe your symptoms below and get a preliminary health assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Medical Disclaimer:</strong> This is not a substitute for professional medical advice. 
                Always consult with a qualified healthcare provider for proper diagnosis and treatment.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Textarea
                placeholder="Describe your symptoms in detail (e.g., headache for 2 days, fever, fatigue)..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="min-h-[120px]"
                disabled={isLoading}
              />

              <Button 
                onClick={handleCheckSymptoms} 
                disabled={isLoading || !symptoms.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Check Symptoms"
                )}
              </Button>
            </div>

            {analysis && (
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-xl">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{analysis}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}