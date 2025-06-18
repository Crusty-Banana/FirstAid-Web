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

interface Conversation {
  id: string;
  title: string;
}

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user } = useAuth();
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
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
    <>
      <aside className={`bg-gray-100 text-black p-4 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20 items-center' : 'w-64'}`}>
        <div className={`w-full flex ${isCollapsed ? 'justify-center' : 'justify-end'} mb-2`}>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 hover:bg-gray-200 rounded h-[40px] w-[40px] flex items-center justify-center">
              {isCollapsed ? <ShowSidebarIcon /> : <HideSidebarIcon />}
          </button>
        </div>
        
          <Link href="/c/new" legacyBehavior>
            <a className={`h-[40px] mb-4 p-2 rounded-md bg-transparent hover:bg-gray-200 flex items-center ${isCollapsed ? 'w-[40px] justify-center' : 'w-full'}`}>  
              <div className="flex items-center">
                <NewChatIcon /> 
                {!isCollapsed && 
                  (
                    <span className="ml-2">{t("new_chat")}</span>
                  )
                }
              </div>
            </a>
          </Link>
        <div className={`flex-1 overflow-y-auto custom-scrollbar w-full ${isCollapsed ? 'hidden' : ''}`}>
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
                    <button onClick={() => handleTitleSave(convo.id)} className="p-1 hover:bg-gray-300 rounded ml-2">
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
                      <button onClick={() => handleEditClick(convo)} className="p-1 hover:bg-gray-300 rounded">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDelete(convo.id)} className="p-1 hover:bg-gray-300 rounded" disabled={deletingConversationId === convo.id}>
                        {deletingConversationId === convo.id ? <LoadingIcon /> : <TrashCanIcon />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>
        </div>
        <div className={`mt-auto w-full ${isCollapsed ? 'hidden' : ''}`}>
          {user && (
            <div 
              className="text-sm p-2 truncate cursor-pointer hover:bg-gray-200 rounded-md"
              onClick={() => setSettingsModalOpen(true)}
            >
              {user.first_name} {user.last_name}
            </div>
          )}
        </div>
      </aside>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
    </>
  );
}