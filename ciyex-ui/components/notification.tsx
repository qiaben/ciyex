"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import ReactDOM from "react-dom";

export interface NotificationItem {
  id: string | number;
  message: string;
  type?: "info" | "success" | "error";
  createdAt?: Date | string;
}

interface NotificationProps {
  notifications: NotificationItem[];
  onClear?: () => void;
  buttonClassName?: string;
}

export const Notification: React.FC<NotificationProps> = ({ notifications, onClear, buttonClassName }) => {
  const [open, setOpen] = useState(false);
  const [dropdownContainer] = useState(() => {
    if (typeof window !== "undefined") {
      const el = document.createElement("div");
      el.setAttribute("id", "notification-portal");
      return el;
    }
    return null;
  });

  useEffect(() => {
    if (!dropdownContainer) return;
    document.body.appendChild(dropdownContainer);
    return () => {
      if (dropdownContainer.parentNode) {
        dropdownContainer.parentNode.removeChild(dropdownContainer);
      }
    };
  }, [dropdownContainer]);

  // Optionally, close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const notif = document.getElementById("notification-dropdown");
      if (notif && !notif.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const dropdown = open && (
    <div
      id="notification-dropdown"
      className="fixed top-20 right-8 w-80 bg-white border border-emerald-100 rounded-lg shadow-lg z-[2147483647] overflow-hidden"
      style={{ zIndex: 2147483647 }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b bg-emerald-50">
        <span className="font-semibold text-emerald-700">Notifications</span>
        {onClear && notifications.length > 0 && (
          <button
            className="text-xs text-emerald-600 hover:underline"
            onClick={onClear}
          >
            Clear All
          </button>
        )}
      </div>
      <ul className="max-h-72 overflow-y-auto divide-y divide-emerald-50">
        {notifications.length === 0 ? (
          <li className="px-4 py-6 text-center text-gray-400">No notifications</li>
        ) : (
          notifications.map((notif) => (
            <li key={notif.id} className="px-4 py-3 flex flex-col gap-1 hover:bg-emerald-50/40 transition-all">
              <span className={`text-sm font-medium ${notif.type === "error" ? "text-red-600" : notif.type === "success" ? "text-emerald-700" : "text-gray-700"}`}>{notif.message}</span>
              {notif.createdAt && (
                <span className="text-xs text-gray-400">{typeof notif.createdAt === "string" ? notif.createdAt : new Date(notif.createdAt).toLocaleString()}</span>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );

  return (
    <div className="relative">
      <button
        className={buttonClassName ? buttonClassName : "p-2 rounded-lg bg-emerald-50/50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100/50 hover:border-emerald-200 transition-all duration-300 shadow-sm flex items-center relative"}
        onClick={() => setOpen((o) => !o)}
        aria-label="Show notifications"
      >
        <Bell className="size-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 size-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full text-[10px] flex items-center justify-center font-medium shadow-sm animate-bounce-subtle">
            {notifications.length}
          </span>
        )}
      </button>
      {dropdownContainer && open && ReactDOM.createPortal(dropdown, dropdownContainer)}
    </div>
  );
}; 