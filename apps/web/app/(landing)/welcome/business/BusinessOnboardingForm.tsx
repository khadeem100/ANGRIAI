"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";

export function BusinessOnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    role: "",
    teamSize: "",
    goals: [] as string[],
  });

  const handleNext = () => setStep(step + 1);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call to save onboarding data
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Profile created!");

    // Redirect to dashboard or email connect
    // User wanted ability to skip email assistant
    router.push("/onboarding"); // This currently redirects to email connect, but we might want a different dashboard for business users eventually.
    // For now, I'll send them to the main app layout or a specific dashboard if it existed.
    // But since the main app revolves around email accounts, I should probably ask if they want to connect one.
    setStep(4); // Move to connect step
    setLoading(false);
  };

  if (step === 4) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">One last thing...</h3>
          <p className="text-muted-foreground">
            Inbox Zero works best when connected to your email.
          </p>
        </div>

        <div className="grid gap-4">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => router.push("/onboarding")}
          >
            <Check className="w-4 h-4" />
            Connect Email Assistant
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => router.push("/home")}
          >
            Skip for now (I'll use other tools)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              placeholder="Acme Corp"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Industry</Label>
            <Select
              onValueChange={(val) =>
                setFormData({ ...formData, industry: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="marketing">Marketing Agency</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            onClick={handleNext}
            disabled={!formData.companyName || !formData.industry}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>What is your role?</Label>
            <RadioGroup
              onValueChange={(val) => setFormData({ ...formData, role: val })}
            >
              <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="founder" id="founder" />
                <Label htmlFor="founder" className="cursor-pointer flex-1">
                  Founder / CEO
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="manager" id="manager" />
                <Label htmlFor="manager" className="cursor-pointer flex-1">
                  Manager
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="employee" id="employee" />
                <Label htmlFor="employee" className="cursor-pointer flex-1">
                  Individual Contributor
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            className="w-full"
            onClick={handleNext}
            disabled={!formData.role}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>What would you like to achieve?</Label>
            <div className="space-y-2">
              {[
                "Automate Email Sorting",
                "CRM Integration",
                "Auto-Replies",
                "Analytics",
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData((prev) => ({
                          ...prev,
                          goals: [...prev.goals, goal],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          goals: prev.goals.filter((g) => g !== goal),
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={goal} className="font-normal">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit} loading={loading}>
            Complete Setup
          </Button>
        </div>
      )}

      <div className="flex justify-center gap-1 mt-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-8 bg-primary" : s < step ? "w-4 bg-primary/50" : "w-2 bg-muted"}`}
          />
        ))}
      </div>
    </div>
  );
}
