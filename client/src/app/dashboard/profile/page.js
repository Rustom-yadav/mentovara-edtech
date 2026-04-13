"use client";

import { Camera, Loader2, Mail, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { getInitials } from "@/utilities";

export default function ProfilePage() {
  const {
    user,
    fullName,
    preview,
    saving,
    setFullName,
    handleAvatarChange,
    handleSave,
  } = useProfile();

  return (
    <div className="section-container max-w-2xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your personal information
      </p>

      <Separator className="my-6" />

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="size-20">
              <AvatarImage src={preview || user?.avatar} alt={user?.fullName} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-110">
              <Camera className="size-3.5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div>
            <p className="font-semibold">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={user?.email || ""} disabled className="pl-9" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={user?.username || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex h-8 items-center gap-2 rounded-lg border border-input bg-muted/50 px-3 text-sm">
              <GraduationCap className="size-4 text-muted-foreground" />
              <span className="capitalize">{user?.role || "student"}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
}
