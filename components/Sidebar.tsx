"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface Conversation {
  id: string;
  title: string;
}

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get("/conversations/");
        setConversations(response.data);
        console.log("[Sidebar]: Conversations fetched")
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      }
    };
    fetchConversations();
  }, []);

  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col">
      {/* Make this container scrollable */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">History</h2>
        <nav className="space-y-2">
          {conversations.map((convo) => (
            <Link key={convo.id} href={`/c/${convo.id}`} legacyBehavior>
              <a className="block p-2 rounded-md hover:bg-gray-700 truncate">
                {convo.title}
              </a>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto">
        {user && (
          <div className="text-sm p-2">
            {user.first_name} {user.last_name}
          </div>
        )}
        <button
          onClick={logout}
          className="w-full text-left p-2 rounded-md hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}