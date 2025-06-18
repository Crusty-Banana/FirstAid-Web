"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Room, RoomEvent } from "livekit-client";
import { VoiceRoomModal } from "@/components/VoiceRoomModal";
import { LoadingModal } from "@/components/LoadingModal";

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

  // State for the voice room
  const [room] = useState(new Room());
  const [isVoiceRoomOpen, setVoiceRoomOpen] = useState(false);
  const [loadingVoice, setLoadingVoice] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
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
    };
    fetchMessages();
  }, [params.conversationId]);

  useEffect(() => {
    const onDisconnected = () => {
      setVoiceRoomOpen(false);
    };
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [room]);

  const handleJoinVoiceSession = async () => {
    setLoadingVoice(true);
    try {
      const sessionResponse = await api.post("/voice/session/create", {
        conversation_id: params.conversationId,
        metadata: { instructions: "You are a helpful medical assistant." },
      });
      const { token } = sessionResponse.data;
      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

      if (!livekitUrl) {
          throw new Error("NEXT_PUBLIC_LIVEKIT_URL is not defined in .env.local");
      }
      
      await room.connect(livekitUrl, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setVoiceRoomOpen(true);
    } catch (error) {
      console.error("Failed to join voice session", error);
      alert("Could not join voice session. Please try again.");
    } finally {
      setLoadingVoice(false);
    }
  };

  return (
    <>
      <div className="relative flex-1 flex flex-col p-4 overflow-y-auto">
        {loadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            Loading messages...
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
                        msg.role === "user" ? "bg-blue-600" : "bg-gray-700"
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
          </>
        )}

        {/* Audio Button */}
        <div className="absolute bottom-6 right-6">
          <button
            onClick={handleJoinVoiceSession}
            disabled={loadingVoice}
            className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-500 transition-colors"
          >
            <AudioIcon />
          </button>
        </div>
      </div>

      {/* Conditionally render the modals as overlays */}
      {loadingVoice && <LoadingModal text="Joining voice session..." />}
      {isVoiceRoomOpen && <VoiceRoomModal room={room} />}
    </>
  );
}