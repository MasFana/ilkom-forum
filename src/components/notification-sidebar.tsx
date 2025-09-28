"use client";
import { Dropdown, DropdownItem, Avatar } from "./ui";
import { Bell, CheckIcon, TrashIcon } from "lucide-react";
import { useNotifications } from "../lib/use-notifications";
import { useRouter } from "next/navigation";
import { timeAgo } from "../lib/utils";

export default function NotificationSidebar() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const router = useRouter();
  return (
    <Dropdown
      ariaLabel="Notifikasi"
      hideChevron={true}
      label={
        <span className="inline-flex items-center w-full md:w-auto">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 ? <span className="ml-1 inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" /> : null}
        </span>
      }
    >
      <div className="px-2 py-1">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-semibold">Notifikasi</h3>
          <div className="text-xs opacity-70">{unreadCount} belum dibaca</div>
        </div>

        <div className="mt-2 max-h-[48vh] w-[340px] overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-3 text-sm opacity-70">Tidak ada notifikasi.</div>
          ) : (
            notifications.map((n, idx) => {
              // build avatar url if available
              const avatarUrl = n.expand?.comment?.user;
              const title = n.expand?.post?.title ? `Komentar di ${n.expand.post.title}` : n.post ? `Post ${n.post}` : "Notifikasi";
              const body = n.expand?.comment?.content ?? "";
              return (
                <div key={n.id} className={`${idx > 0 ? "border-t border-black/5 dark:border-white/5" : ""}`}>
                  <DropdownItem
                    onClick={async () => {
                      try {
                        if (n.post) {
                          await router.push(`/${n.post}`);
                        } else if (n.comment) {
                          await router.push(`/${n.post || n.comment}`);
                        }
                        if (!n.is_read) await markAsRead(n.id);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar src={avatarUrl} alt={n.expand?.owner?.username} className="h-9 w-9" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium truncate">{title}</div>
                          <div className="text-[11px] opacity-60 whitespace-nowrap ml-2">{timeAgo(n.created)}</div>
                        </div>
                        {body ? <div className="mt-1 text-sm text-neutral-700 dark:text-neutral-300 truncate">{body}</div> : null}
                      </div>
                    </div>
                  </DropdownItem>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-2 px-2">
          <hr className="border-t opacity-20 mb-2" />
          <div className="flex justify-between">
            <DropdownItem onClick={deleteNotification}> <div className="inline-flex items-center gap-2"><TrashIcon className="h-4 w-4" />Hapus</div></DropdownItem>

            <DropdownItem onClick={markAllAsRead}>
              <div className="inline-flex items-center gap-2 w-full justify-end text-end">
                <CheckIcon className="h-4 w-4" />
                Tandai dibaca
              </div>
            </DropdownItem>
          </div>
        </div>
      </div>
    </Dropdown>
  );
}
