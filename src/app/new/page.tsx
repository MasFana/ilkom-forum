"use client";
import { useState } from "react";
import { Button, Card, Input, Textarea } from "../../components/ui";
import { getPB } from "../../lib/pocketbase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const router = useRouter();
  const pb = getPB();
  const isAuth = pb.authStore.isValid;

  async function createPost() {
    try {
      if (!pb.authStore.isValid) {
        return toast.error("Silakan masuk terlebih dahulu");
      }
      const rec = await pb.collection("posts").create({
        title,
        content: content || undefined,
        image_url: imageUrl || undefined,
        user: pb.authStore.record?.id,
      });
      toast.success("Post berhasil dibuat");
      router.replace(`/${rec.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Gagal membuat post");
    }
  }

  return (
    <Card className="p-6 space-y-3" aria-labelledby="newpost-heading">
      <h1 id="newpost-heading" className="text-xl font-semibold">Tulis Post</h1>
      <Input aria-label="Judul" placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea aria-label="Isi (opsional)" placeholder="Isi (opsional)" rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
      <Input aria-label="URL Gambar (opsional)" placeholder="URL Gambar (opsional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <div className="flex justify-end">
      <Button onClick={createPost} disabled={!title.trim() || !isAuth} title={!isAuth ? "Perlu masuk" : undefined}>Terbitkan</Button>
      </div>  
    
    </Card>
  );
}
