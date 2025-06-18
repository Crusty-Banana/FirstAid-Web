"use client";

import { CloseIcon } from "@/components/CloseIcon";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import TranscriptionView from "@/components/TranscriptionView";
import {
  BarVisualizer,
  DisconnectButton,
  RoomAudioRenderer,
  VideoTrack,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { motion } from "framer-motion";

export function VoiceInterface() {
  const { state: agentState } = useVoiceAssistant();
  return (
    <motion.div
      key="connected"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
      className="flex flex-col items-center justify-evenly h-full"
    >
      <div>
        <AgentVisualizer />
        <div className="w-full">
          <TranscriptionView />
        </div>
      </div>
      <div className="w-full">
        <ControlBar />
      </div>
      <RoomAudioRenderer />
      <NoAgentNotification state={agentState} />
    </motion.div>
  );
}

function AgentVisualizer() {
  const { state: agentState, videoTrack, audioTrack } = useVoiceAssistant();

  if (videoTrack) {
    return (
      <div className="h-[512px] w-[512px] rounded-lg overflow-hidden">
        <VideoTrack trackRef={videoTrack} />
      </div>
    );
  }
  return (
    <div className="h-[300px] w-full">
      <BarVisualizer
        state={agentState}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

function ControlBar() {
  return (
    <div className="relative h-[60px] flex justify-center items-center">
      <VoiceAssistantControlBar controls={{ leave: false }} />
      <DisconnectButton>
        <CloseIcon />
      </DisconnectButton>
    </div>
  );
}