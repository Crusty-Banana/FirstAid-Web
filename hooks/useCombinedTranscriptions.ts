import { useTrackTranscription, useVoiceAssistant } from "@livekit/components-react";
import { useEffect, useMemo, useRef } from "react";
import useLocalMicTrack from "./useLocalMicTrack";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import { TranscriptionSegment } from "livekit-client";

export default function useCombinedTranscriptions() {
  const { agentTranscriptions } = useVoiceAssistant();
  const micTrackRef = useLocalMicTrack();
  const { segments: userTranscriptions } = useTrackTranscription(micTrackRef);
  const savedSegmentIds = useRef(new Set<string>());
  const params = useParams();
  const conversationId = params.conversationId as string;

  useEffect(() => {
    const handleFinalSegment = async (segment: TranscriptionSegment, role: "user" | "assistant") => {
      if (segment.final && segment.text && !savedSegmentIds.current.has(segment.id)) {
        savedSegmentIds.current.add(segment.id);
        try {
          if (conversationId && conversationId !== 'new') {
            await api.post(`/conversations/${conversationId}/messages`, {
              role: role,
              content: segment.text,
              message_type: "text",
            });
          }
        } catch (error) {
          console.error("Failed to save transcription message", error);
          savedSegmentIds.current.delete(segment.id);
        }
      }
    };

    agentTranscriptions.forEach(segment => handleFinalSegment(segment, "assistant"));
    userTranscriptions.forEach(segment => handleFinalSegment(segment, "user"));
  }, [agentTranscriptions, userTranscriptions, conversationId]);

  const combinedTranscriptions = useMemo(() => {
    return [
      ...agentTranscriptions.map((val) => {
        return { ...val, role: "assistant" };
      }),
      ...userTranscriptions.map((val) => {
        return { ...val, role: "user" };
      }),
    ].sort((a, b) => a.firstReceivedTime - b.firstReceivedTime);
  }, [agentTranscriptions, userTranscriptions]);

  return combinedTranscriptions;
}