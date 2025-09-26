"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getPB } from "../../lib/pocketbase";
import type { PostRecord, CommentRecord, UserRecord } from "../../lib/pocketbase";
import { Button, Card, Input, Textarea, Avatar } from "../../components/ui";
import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Edit, Trash2 } from "lucide-react";
import { timeAgo } from "../../lib/utils";
import { CommentItem } from "../../components/comment-item";
import Link from "next/link";

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qc = useQueryClient();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const pb = getPB();
      return pb.collection("posts").getOne<PostRecord & { expand?: { user?: UserRecord } }>(id, { expand: "user" });
    },
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const pb = getPB();
      const list = await pb.collection("comments").getList<CommentRecord & { expand?: { user?: UserRecord } }>(1, 200, {
        filter: `post = "${id}"`,
        sort: "created",
        expand: "user",
      });
      return list.items;
    },
  });

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const pb = getPB();
  const isOwner = pb.authStore.record?.id && post?.user ? pb.authStore.record?.id === post.user : false;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState("");

  async function addComment() {
    const pb = getPB();
    try {
      if (!pb.authStore.isValid) {
        return toast.error("Silakan masuk untuk berkomentar");
      }
      const created = await pb.collection("comments").create<CommentRecord>({
        post: id,
        user: pb.authStore.record?.id,
        content,
        image_url: imageUrl || undefined,
      });
      setContent("");
      setImageUrl("");
      // update cache with expand.user so UI shows username immediately
      const authUser = pb.authStore.record as UserRecord | null;
      const newRec: CommentRecord & { expand?: { user?: UserRecord } } = {
        ...(created as CommentRecord),
        expand: { user: authUser || undefined },
      };
      qc.setQueryData<((CommentRecord & { expand?: { user?: UserRecord } })[]) | undefined>(["comments", id], (old) => {
        return old ? [...old, newRec] : [newRec];
      });
      toast.success("Komentar ditambahkan");
    } catch (e: unknown) {
      console.error(e);
      toast.error("Failed to add comment");
    }
  }

  async function onDeletePost() {
    if (!isOwner || !post) return;
    const ok = window.confirm("Hapus post ini? Tindakan ini tidak dapat dibatalkan.");
    if (!ok) return;
    try {
      await pb.collection("posts").delete(post.id);
      toast.success("Post dihapus");
      router.push("/");

    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus post");
    }
  }

  function startEdit() {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content || "");
    setEditImage(post.image_url || "");
    setIsEditing(true);
  }

  async function saveEdit() {
    if (!isOwner || !post) return;
    try {
      await pb.collection("posts").update<PostRecord>(post.id, {
        title: editTitle,
        content: editContent || undefined,
        image_url: editImage || undefined,
      });
      toast.success("Post diperbarui");
      // force refetch
      qc.invalidateQueries({ queryKey: ["post", post.id] });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memperbarui post");
    }
  }

  if (isLoading) {
    return <Card className="p-6 animate-pulse h-40" />;
  }
  if (isError || !post) {
    return <div className="p-6 text-sm h-full animate-pulse flex flex-col items-center justify-center text-center">
      <div>
        <Image width={500} height={500} src="/404.webp" alt="404" />
        <Link href="/" className="text-3xl pt-4">Kembali ke Home</Link>
      </div>
    </div>;
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        {/* Title first, then meta + actions */}
        {isEditing ? (
          <Input
            aria-label="Judul"
            placeholder="Judul"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-xl sm:text-2xl font-bold"
          />
        ) : (
          <h1 className="text-2xl font-bold">{post.title}</h1>
        )}
        <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs opacity-70 min-w-0">
            <Avatar alt={post.expand?.user?.username} />
            <span className="font-medium truncate max-w-[40ch]">{post.expand?.user?.username || "anonim"}</span>
            <span>•</span>
            <span>{timeAgo(post.created)}</span>
          </div>
          {isOwner ? (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button type="button" aria-label="Simpan" onClick={saveEdit} className="px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/10"><Edit className="h-4 w-4" />Simpan</button>
                  <button type="button" aria-label="Batal" onClick={() => setIsEditing(false)} className="px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/10">Batal</button>
                </>
              ) : (
                <>
                  <button type="button" aria-label="Ubah" onClick={startEdit} className="px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/10"><Edit className="h-4 w-4" />Ubah</button>
                  <button type="button" aria-label="Hapus" onClick={onDeletePost} className="px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/10"><Trash2 className="h-4 w-4" />Hapus</button>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Media */}
        {isEditing ? (
          <div className="mt-3 space-y-2">
            <Input aria-label="URL Gambar (opsional)" placeholder="URL Gambar (opsional)" value={editImage} onChange={(e) => setEditImage(e.target.value)} />
            <Textarea aria-label="Isi (opsional)" placeholder="Isi (opsional)" rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
          </div>
        ) : (
          <>
            {post.image_url ? (
              <div className="mt-3 overflow-hidden rounded-xl">
                <Image src={post.image_url} alt={post.title} width={1200} height={800} className="h-auto w-full object-cover" />
              </div>
            ) : null}
            {post.content ? <p className="mt-3 whitespace-pre-wrap break-words">{post.content}</p> : null}
            <div className="mt-3 text-xs opacity-70 inline-flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> {comments?.length ?? 0} komentar
            </div>
          </>
        )}
      </Card>

      <Card className="p-4 border-none shadow-none">
        <h2 className="text-lg font-semibold mb-3 inline-flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Komentar</h2>

        <div className="space-y-2 pb-4">
          <Textarea className="rounded-none border-t-0 border-x-0 " placeholder="Tulis komentar Anda..." value={content} onChange={(e) => setContent(e.target.value)} />
          <Input className="rounded-none border-t-0 border-x-0" placeholder="URL gambar (opsional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <div className="flex justify-end pt-2">
            <Button onClick={addComment} disabled={!content.trim()}>Kirim</Button>
          </div>

        </div>

        <div className="space-y-3">
          {isLoadingComments ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl animate-pulse bg-black/5 dark:bg-white/10" />
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c as CommentRecord & { expand?: { user?: UserRecord } }}
                onDeleted={(cid) =>
                  qc.setQueryData<CommentRecord[] | undefined>(["comments", id], (old) => old?.filter((x) => x.id !== cid))
                }
              />
            ))
          ) : (
            <div className="text-sm opacity-70">Belum ada komentar.</div>
          )}
        </div>
      </Card>


    </div>
  );
}
