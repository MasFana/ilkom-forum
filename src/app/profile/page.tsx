"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input, Avatar } from "../../components/ui";
import { getPB } from "../../lib/pocketbase";
import type { UserRecord } from "../../lib/pocketbase";
import { toast } from "sonner";

export default function ProfilePage() {
  const pb = getPB();
  const user = pb.authStore.record as UserRecord | null;
  const [username, setUsername] = useState(user?.username || "");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    setAvatarUrl(undefined);
  }, [pb, user]);

  async function saveProfile() {
    try {
      if (!user) return;
      const updated = await pb.collection("users").update<UserRecord>(user.id, { username });
      await pb.collection("users").authRefresh();
      toast.success("Profil diperbarui");
      setAvatarUrl(updated.avatar ? pb.files.getUrl(updated, updated.avatar) : undefined);
      if (pb.authStore.record) (pb.authStore.record.username = updated.username);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memperbarui profil");
    }
  }

  return (
    <Card className="p-6 space-y-4" aria-labelledby="profile-heading">
      <h1 id="profile-heading" className="text-xl font-semibold">Profil Anda</h1>
      <div className="flex items-center gap-3">
        <Avatar src={avatarUrl} alt={username} className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <label className="text-sm opacity-80" htmlFor="username">Nama Pengguna</label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan nama pengguna" />
      </div>
      <Button onClick={saveProfile}>Simpan</Button>
    </Card>
  );
}
