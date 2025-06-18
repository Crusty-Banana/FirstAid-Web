"use client";

import { VoiceInterface } from "@/components/VoiceInterface";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { RoomContext } from "@livekit/components-react";
import { motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
  const [room] = useState(new Room());
  const [isVoiceSessionActive, setVoiceSessionActive] = useState(false);
  const router = useRouter();

  const onConnectButtonClicked = useCallback(async () => {
    try {
      // 1. Create a new conversation
      const convResponse = await api.post("/conversations", {
        title: "New Voice Chat",
      });
      const conversationId = convResponse.data.id;

      // 2. Create a voice session for that conversation
      const sessionResponse = await api.post("/voice/session/create", {
        conversation_id: conversationId,
        metadata: { instructions: "You are a helpful medical assistant." },
      });
      const { livekit_url, livekit_token } = sessionResponse.data;

      // 3. Connect to LiveKit Room
      await room.connect(livekit_url, livekit_token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setVoiceSessionActive(true);

      // 4. Navigate to the new conversation page in the background
      router.push(`/c/${conversationId}`);
    } catch (error) {
      console.error("Failed to start voice session:", error);
      alert("Could not start voice session. Please try again.");
    }
  }, [room, router]);

  useEffect(() => {
    const onDisconnected = () => setVoiceSessionActive(false);
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);
    room.on(RoomEvent.Disconnected, onDisconnected);

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [room]);

  return (
    <main
      data-lk-theme="default"
      className="h-full grid content-center bg-gray-900"
    >
      <RoomContext.Provider value={room}>
        <div className="lk-room-container max-w-[1024px] w-[90vw] mx-auto max-h-[90vh]">
          {isVoiceSessionActive ? (
            <VoiceInterface />
          ) : (
            <div className="grid items-center justify-center h-full">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
                onClick={onConnectButtonClicked}
              >
                Start New Voice Chat
              </motion.button>
            </div>
          )}
        </div>
      </RoomContext.Provider>
    </main>
  );
}

function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}