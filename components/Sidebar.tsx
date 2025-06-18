"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { EditIcon } from "./EditIcon";
import { TrashCanIcon } from "./TrashCanIcon";
import { CheckIcon } from "./CheckIcon";
import { LoadingIcon } from "./LoadingIcon";
import { NewChatIcon } from "./NewChatIcon";


interface Conversation {
  id: string;
  title: string;
}

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user, logout } = useAuth();
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get("/conversations/");
      setConversations(response.data);
      console.log("[Sidebar]: Conversations fetched")
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  const handleEditClick = (conversation: Conversation) => {
    setEditingConversationId(conversation.id);
    setEditedTitle(conversation.title);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleSave = async (conversationId: string) => {
    if(editedTitle.trim() === '') return;
    try {
      await api.patch(`/conversations/${conversationId}`, { title: editedTitle });
      setEditingConversationId(null);
      fetchConversations(); // Refetch to get the updated list
    } catch (error) {
      console.error("Failed to update conversation title", error);
    }
  };

  const handleDelete = async (conversationId: string) => {
    setDeletingConversationId(conversationId);
    try {
        await api.delete(`/conversations/${conversationId}`);
        setConversations(conversations.filter(c => c.id !== conversationId));
    } catch (error) {
        console.error("Failed to delete conversation", error);
    } finally {
        setDeletingConversationId(null);
    }
  };


  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col">
      <Link href="/c/new" legacyBehavior>
        <a className="mb-4 w-full text-center p-2 rounded-md bg-transparent hover:bg-gray-700 flex items-center justify-center">
          <NewChatIcon />
          <span className="ml-2">New Chat</span>
        </a>
      </Link>
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">History</h2>
        <nav className="space-y-2">
          {conversations.map((convo) => (
            <div key={convo.id} className="flex items-center group">
              {editingConversationId === convo.id ? (
                <>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={handleTitleChange}
                    onBlur={() => handleTitleSave(convo.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTitleSave(convo.id);
                      if (e.key === "Escape") setEditingConversationId(null);
                    }}
                    className="bg-gray-700 text-white p-2 rounded-md w-full"
                    autoFocus
                  />
                  <button onClick={() => handleTitleSave(convo.id)} className="p-1 hover:bg-gray-600 rounded ml-2">
                    <CheckIcon />
                  </button>
                </>
              ) : (
                <>
                <Link href={`/c/${convo.id}`} legacyBehavior>
                    <a className="block p-2 rounded-md hover:bg-gray-700 truncate flex-1">
                        {convo.title}
                    </a>
                </Link>
                 <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(convo)} className="p-1 hover:bg-gray-600 rounded">
                      <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(convo.id)} className="p-1 hover:bg-gray-600 rounded" disabled={deletingConversationId === convo.id}>
                      {deletingConversationId === convo.id ? <LoadingIcon /> : <TrashCanIcon />}
                    </button>
                  </div>
                </>
              )}
            </div>
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