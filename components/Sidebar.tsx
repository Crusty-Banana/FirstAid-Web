"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Add this import
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { EditIcon } from "./EditIcon";
import { TrashCanIcon } from "./TrashCanIcon";
import { CheckIcon } from "./CheckIcon";
import { LoadingIcon } from "./LoadingIcon";
import { NewChatIcon } from "./NewChatIcon";
import { SettingsModal } from "./SettingsModal";
import { useTranslation } from "@/hooks/useTranslation";

function HideSidebarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function ShowSidebarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.44,0.17-0.48,0.41L9.2,5.29C8.61,5.53,8.08,5.85,7.58,6.23L5.2,5.27C4.98,5.19,4.73,5.26,4.61,5.48l-1.92,3.32 C2.58,9.02,2.63,9.29,2.81,9.43l2.03,1.58C4.82,11.36,4.8,11.68,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94 l0.36,2.48c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.48-0.41l0.36-2.48c0.59-0.24,1.12-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0.01,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

interface Conversation {
  id: string;
  title: string;
}

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user } = useAuth();
  const [editingConversationId, setEditingConversationId] = useState<
    string | null
  >(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [deletingConversationId, setDeletingConversationId] = useState<
    string | null
  >(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get("/conversations/");
      setConversations(response.data);
      console.log("[Sidebar]: Conversations fetched");
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
    if (editedTitle.trim() === "") return;
    try {
      await api.patch(`/conversations/${conversationId}`, {
        title: editedTitle,
      });
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
      setConversations(conversations.filter((c) => c.id !== conversationId));
    } catch (error) {
      console.error("Failed to delete conversation", error);
    } finally {
      setDeletingConversationId(null);
    }
  };

  return (
    <>
      <aside
        className={`bg-gray-100 text-black p-4 flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-20 items-center" : "w-64"
        }`}
      >
        <div
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          } mb-2`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Image src="/firstAidLogo.png" alt="Logo 1" width={40} height={40} />
              <Image src="/Logo2.webp" alt="Logo 2" width={40} height={40} />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-200 rounded h-[40px] w-[40px] flex items-center justify-center"
          >
            {isCollapsed ? <ShowSidebarIcon /> : <HideSidebarIcon />}
          </button>
        </div>

        <Link href="/c/new" legacyBehavior>
          <a
            className={`h-[40px] mb-4 p-2 rounded-md bg-transparent hover:bg-gray-200 flex items-center ${
              isCollapsed ? "w-[40px] justify-center" : "w-full"
            }`}
          >
            <div className="flex items-center">
              <NewChatIcon />
              {!isCollapsed && <span className="ml-2">{t("new_chat")}</span>}
            </div>
          </a>
        </Link>
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar w-full ${
            isCollapsed ? "hidden" : ""
          }`}
        >
          <h2 className="text-lg font-semibold mb-4">{t("history")}</h2>
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
                      className="bg-gray-200 text-black p-2 rounded-md w-full"
                      autoFocus
                    />
                    <button
                      onClick={() => handleTitleSave(convo.id)}
                      className="p-1 hover:bg-gray-300 rounded ml-2"
                    >
                      <CheckIcon />
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={`/c/${convo.id}`} legacyBehavior>
                      <a className="block p-2 rounded-md hover:bg-gray-200 truncate flex-1">
                        {convo.title}
                      </a>
                    </Link>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(convo)}
                        className="p-1 hover:bg-gray-300 rounded"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(convo.id)}
                        className="p-1 hover:bg-gray-300 rounded"
                        disabled={deletingConversationId === convo.id}
                      >
                        {deletingConversationId === convo.id ? (
                          <LoadingIcon />
                        ) : (
                          <TrashCanIcon />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-auto w-full">
          {user && (
            <div
              className={`h-[40px] p-2 rounded-md bg-transparent hover:bg-gray-200 flex items-center cursor-pointer ${
                isCollapsed ? "w-[40px] justify-center" : "w-full"
              }`}
              onClick={() => setSettingsModalOpen(true)}
            >
              <div className="flex items-center">
                <SettingsIcon />
                {!isCollapsed && (
                  <span className="ml-2 truncate">
                    {user.first_name} {user.last_name}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </>
  );
}