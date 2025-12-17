"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/utils/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "@/utils/actions/profile";
import { useUser } from "@/hooks/useUser";
import { mutate } from "swr";

export function ProfileSection() {
  const { data: session } = useSession();
  const { mutate: mutateUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");

  // Update local state when session changes
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateProfileAction({ name: name.trim() });

      if (result?.serverError) {
        toast.error(result.serverError);
        setIsLoading(false);
      } else if (result?.data) {
        toast.success("Profile updated successfully");

        // Refresh all SWR cached data across the entire platform
        await mutateUser(); // Refresh user data
        await mutate(() => true); // Refresh all SWR cache including email accounts

        // Force a page reload to update session and server-side rendered content
        // This ensures the name is updated everywhere including:
        // - Navbar user display (emailAccount.name)
        // - Dashboard greeting (session.user.name)
        // - Sidebar user menu
        // - All other components
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to update profile");
      setIsLoading(false);
    }
  };

  // Use local name state for display, fallback to session
  const displayName = name || session?.user?.name || "User";
  const initials =
    displayName
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-primary/10">
          <AvatarImage src={session?.user?.image || ""} alt={displayName} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{displayName}</h3>
          <p className="text-sm text-muted-foreground">
            {session?.user?.email}
          </p>
          <Button variant="outline" size="sm" disabled>
            Change Avatar
          </Button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Email address cannot be changed
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isLoading || name === session?.user?.name || !name.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
