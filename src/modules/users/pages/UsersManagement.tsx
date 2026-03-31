import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type AppRole = "super_admin" | "generator" | "viewer_printer";

interface UserRow {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  roles: AppRole[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UsersManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentialUser, setCredentialUser] = useState<UserRow | null>(null);
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credConfirmPassword, setCredConfirmPassword] = useState("");
  const [credSaving, setCredSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleOpenCredentials = (user: UserRow) => {
    setCredentialUser(user);
    setCredEmail(user.email);
    setCredPassword("");
    setCredConfirmPassword("");
    setCredentialsOpen(true);
  };

  const handleCloseCredentials = () => {
    setCredentialsOpen(false);
    setCredentialUser(null);
    setCredPassword("");
    setCredConfirmPassword("");
  };

  const handleSaveCredentials = async () => {
    if (!credentialUser) return;

    const nextEmail = credEmail.trim().toLowerCase();
    if (!nextEmail) {
      toast.error("Email is required");
      return;
    }
    if (!EMAIL_PATTERN.test(nextEmail)) {
      toast.error("Enter a valid email address");
      return;
    }

    const pwd = credPassword.trim();
    const confirm = credConfirmPassword.trim();
    if (pwd.length > 0 || confirm.length > 0) {
      if (pwd.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      if (pwd !== confirm) {
        toast.error("Passwords do not match");
        return;
      }
    }

    const payload: { email: string; password?: string } = { email: nextEmail };
    if (pwd.length > 0) {
      payload.password = pwd;
    }

    setCredSaving(true);
    try {
      await api.updateUser(credentialUser.id, payload);
      toast.success("Login details updated");
      handleCloseCredentials();
      await loadUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update user";
      toast.error(message);
    } finally {
      setCredSaving(false);
    }
  };

  const toggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.updateUser(userId, { is_active: !currentStatus });
      toast.success(currentStatus ? "User deactivated" : "User activated");
      await loadUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update user";
      toast.error(message);
    }
  };

  const setRole = async (userId: string, role: AppRole) => {
    try {
      await api.updateUser(userId, { roles: [role] });
      toast.success("Role updated");
      await loadUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update role";
      toast.error(message);
    }
  };

  const credDialogTitleId = "user-credentials-title";
  const credEmailId = "admin-user-email";
  const credPasswordId = "admin-user-password";
  const credConfirmId = "admin-user-password-confirm";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? "default" : "secondary"}>
                        {u.is_active ? "Active" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.roles[0] ?? ""}
                        onValueChange={(val) => setRole(u.id, val as AppRole)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Assign role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="generator">Generator</SelectItem>
                          <SelectItem value="viewer_printer">Viewer/Printer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        aria-label={`Edit email and password for ${u.email}`}
                        onClick={() => handleOpenCredentials(u)}
                      >
                        Email &amp; password
                      </Button>
                      <Button
                        variant={u.is_active ? "outline" : "default"}
                        size="sm"
                        aria-label={u.is_active ? `Deactivate ${u.email}` : `Activate ${u.email}`}
                        onClick={() => toggleActive(u.id, u.is_active)}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={credentialsOpen} onOpenChange={(open) => !open && handleCloseCredentials()}>
        <DialogContent className="sm:max-w-md" aria-labelledby={credDialogTitleId}>
          <DialogHeader>
            <DialogTitle id={credDialogTitleId}>
              Login details{credentialUser ? ` — ${credentialUser.name || credentialUser.email}` : ""}
            </DialogTitle>
            <DialogDescription>
              Update this user&apos;s email and optionally set a new password. Leave password blank to keep the
              current one.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor={credEmailId}>Email</Label>
              <Input
                id={credEmailId}
                type="email"
                autoComplete="email"
                value={credEmail}
                onChange={(e) => setCredEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={credPasswordId}>New password</Label>
              <Input
                id={credPasswordId}
                type="password"
                autoComplete="new-password"
                value={credPassword}
                onChange={(e) => setCredPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={credConfirmId}>Confirm new password</Label>
              <Input
                id={credConfirmId}
                type="password"
                autoComplete="new-password"
                value={credConfirmPassword}
                onChange={(e) => setCredConfirmPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseCredentials} disabled={credSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSaveCredentials()} disabled={credSaving}>
              {credSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
