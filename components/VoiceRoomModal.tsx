"use client";

import { createPortal } from "react-dom";
import { Room } from "livekit-client";
import { RoomContext } from "@livekit/components-react";
import { VoiceInterface } from "./VoiceInterface";
import { useEffect, useState } from "react";

interface VoiceRoomModalProps {
  room: Room;
}

export function VoiceRoomModal({ room }: VoiceRoomModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  // We need to wait for the component to mount before creating the portal
  // to avoid issues with Server-Side Rendering (SSR).
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <main
      data-lk-theme="default"
      className="fixed inset-0 z-50 grid content-center bg-gray-900"
    >
      <RoomContext.Provider value={room}>
        <div className="lk-room-container max-w-[1024px] w-[90vw] mx-auto max-h-[90vh]">
          <VoiceInterface />
        </div>
      </RoomContext.Provider>
    </main>,
    document.body
  );
}