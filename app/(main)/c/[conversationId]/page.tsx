"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Room, RoomEvent } from "livekit-client";
import { VoiceRoomModal } from "@/components/VoiceRoomModal";
import { LoadingModal } from "@/components/LoadingModal";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@/components/CheckIcon";
import { EditIcon } from "@/components/EditIcon";
import { useTranslation } from "@/hooks/useTranslation";

// Define a simple Audio Icon component
function AudioIcon() {
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
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

// Define a simple Plus Icon component
function PlusIcon() {
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
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface PageParams {
  conversationId: string;
}

export default function ConversationPage({ params }: { params: PageParams }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [conversationTitle, setConversationTitle] = useState("New Chat");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // State for the voice room
  const [room] = useState(new Room());
  const [isVoiceRoomOpen, setVoiceRoomOpen] = useState(false);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  const fetchMessages = useCallback(async () => {
    if (params.conversationId && params.conversationId !== 'new') {
      setLoadingMessages(true);
      try {
        const response = await api.get(
          `/conversations/${params.conversationId}/messages`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setLoadingMessages(false);
      }
    } else {
      setLoadingMessages(false);
      setMessages([]);
    }
  }, [params.conversationId]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (params.conversationId && params.conversationId !== 'new') {
        try {
          const response = await api.get(`/conversations/${params.conversationId}`);
          setConversationTitle(response.data.title);
        } catch (error) {
          console.error("Failed to fetch conversation details", error);
        }
      } else {
        setConversationTitle(t("new_conversation_title"));
      }
    };

    fetchConversation();
    fetchMessages();
  }, [params.conversationId, t, fetchMessages]);

  useEffect(() => {
    const onDisconnected = async () => {
      setVoiceRoomOpen(false);
      if (sessionId) {
        try {
          await api.delete(`/voice/session/${sessionId}`);
          setSessionId(null);
        } catch (error) {
          console.error("Failed to delete voice session", error);
        }
      }
      fetchMessages();
    };
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [room, fetchMessages, sessionId]);

  const handleJoinVoiceSession = async () => {
    setLoadingVoice(true);
    try {
      let currentConversationId = params.conversationId;
      if (params.conversationId === 'new') {
        const convResponse = await api.post("/conversations/", {
          title: conversationTitle,
        });
        currentConversationId = convResponse.data.id;
        router.push(`/c/${currentConversationId}`);
      }

      const sessionResponse = await api.post("/voice/session/create", {
        conversation_id: currentConversationId
      });
      const { token, session_id } = sessionResponse.data;
      setSessionId(session_id);
      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

      if (!livekitUrl) {
          throw new Error("NEXT_PUBLIC_LIVEKIT_URL is not defined in .env.local");
      }
      
      await room.connect(livekitUrl, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setVoiceRoomOpen(true);
    } catch (error) {
      console.error("Failed to join voice session", error);
      alert(t("could_not_join_voice_session"));
    } finally {
      setLoadingVoice(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConversationTitle(e.target.value);
  };

  const handleTitleSave = async () => {
    if (params.conversationId && params.conversationId !== 'new') {
      try {
        await api.patch(`/conversations/${params.conversationId}`, { title: conversationTitle });
        setIsEditingTitle(false);
      } catch (error) {
        console.error("Failed to update conversation title", error);
      }
    } else {
        setIsEditingTitle(false);
    }
  };

  return (
    <>
      <div className="relative flex-1 flex flex-col overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-center p-4 bg-gray-100 border-b border-gray-200">
          {isEditingTitle ? (
            <div className="flex items-center">
              <input
                type="text"
                value={conversationTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSave();
                }}
                className="bg-gray-200 text-black text-lg font-semibold px-2 py-1 rounded"
                autoFocus
              />
              <button onClick={handleTitleSave} className="ml-2 p-1 hover:bg-gray-300 rounded">
                <CheckIcon />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold">{conversationTitle}</h1>
              <button onClick={() => setIsEditingTitle(true)} className="ml-2">
                <EditIcon />
              </button>
            </>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col">
          {loadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              {t("loading_messages")}
            </div>
          ) : (
            <>
              <div className="flex-1" />
              <div className="w-full max-w-4xl mx-auto space-y-4 mb-20">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`p-4 rounded-lg max-w-[80%] ${
                          msg.role === "user"
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    {t("no_messages_yet")}
                  </div>
                )}
              </div>
            </>
          )}
        </div>


        {/* Audio Button */}
        <div className="absolute bottom-6 right-6">
          <button
            onClick={handleJoinVoiceSession}
            disabled={loadingVoice}
            className="p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:bg-gray-400 transition-colors"
          >
            {params.conversationId === 'new' ? <PlusIcon /> : <AudioIcon />}
          </button>
        </div>
      </div>

      {/* Conditionally render the modals as overlays */}
      {loadingVoice && <LoadingModal text={params.conversationId === 'new' ? t("creating_new_conversation") : t("joining_voice_session")} />}
      {isVoiceRoomOpen && <VoiceRoomModal room={room} />}
    </>
  );
}