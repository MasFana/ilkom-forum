"use client";
import { useEffect, useState, useCallback } from "react";
import { getPB } from "./pocketbase";
import type { NotificationRecord } from "./pocketbase";

export function useNotifications() {
    const pb = getPB();
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!pb.authStore.isValid) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        const userId = ((pb.authStore.record as unknown) as { id?: string })?.id;
        if (!userId) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        try {
            const list = await pb.collection("notifications").getList<NotificationRecord>(1, 50, {
                sort: "-created",
                expand: "post,comment",
            });
            setNotifications(list.items as NotificationRecord[]);
            setUnreadCount(list.items.filter((n) => !n.is_read).length ?? 0);
        } catch (e) {
            // Ignore auto-cancel errors from PocketBase (they happen on route change/unmount)
            const msg = (e as Error)?.message ?? String(e);
            if (typeof msg === "string" && msg.toLowerCase().includes("autocancel")) {
                // silently ignore
                return;
            }
            console.error("fetch notifications", e);
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [pb]);

    useEffect(() => {
        fetchNotifications();
        // subscribe to realtime notifications for this collection
        if (!pb.authStore.isValid) return;
        const userId = ((pb.authStore.model as unknown) as { id?: string })?.id;

        const onRealtime = (event: unknown) => {
            const rec = (event as { record?: unknown })?.record ?? event;
            // only update if it belongs to current user
            if (!rec) return;
            const owner = (rec as { owner?: string }).owner;
            if (owner !== userId) return;
            // if new or updated, refetch (simple and safe)
            fetchNotifications();
        };

        try {
            pb.collection("notifications").subscribe("*", onRealtime);
        } catch {
            // fallback: use realtime root subscribe
            try {
                // subscribe with an unknown typed handler
                pb.realtime?.subscribe(`notifications/*`, onRealtime as unknown as (d: unknown) => void);
            } catch { }
        }

        return () => {
            try {
                pb.collection("notifications").unsubscribe("*");
            } catch {
                try {
                    pb.realtime?.unsubscribeByPrefix?.("notifications");
                } catch { }
            }
        };
    }, [pb, fetchNotifications]);

    async function markAsRead(id: string) {
        try {
            await pb.collection("notifications").update(id, { is_read: true });
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch (e) {
            console.error("markAsRead", e);
        }
    }

    async function markAllAsRead() {
        try {
            const unread = notifications.filter((n) => !n.is_read);
            await Promise.all(unread.map((n) => pb.collection("notifications").update(n.id, { is_read: true })));
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error("markAllAsRead", e);
        }
    }

    async function deleteNotification() {
        try {
            notifications.forEach(async (n) => {
                await pb.collection("notifications").delete(n.id);
            });
            setNotifications([]);
        } catch (e) {
            console.error("deleteNotification", e);
        }
    }

    return { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, refetch: fetchNotifications };
}
