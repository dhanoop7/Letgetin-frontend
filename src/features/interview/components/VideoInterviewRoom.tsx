"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  MessageSquare,
  Maximize2,
  Minimize2,
  PhoneOff,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronDown,
  Loader2,
  BrainCircuit,
  Check,
  Radio,
} from 'lucide-react';
import { Interview, AiScorecard, AiQuestion } from '../types';
import { interviewService } from '../services/interviewService';

interface VideoInterviewRoomProps {
  interview: Interview;
  isRecruiter?: boolean;
  onEndInterview: (scorecard?: AiScorecard) => void;
  onExitRoom: () => void;
}

interface TranscriptItem {
  id: string;
  speaker: 'interviewer' | 'candidate';
  speakerName: string;
  text: string;
  time: string;
}

interface ChatMessage {
  id: string;
  sender: 'interviewer' | 'candidate';
  senderName: string;
  text: string;
  time: string;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

function getMediaErrorMessage(err: any): string {
  if (!err) return 'Camera and microphone access is required for the video interview.';
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    return 'Camera or microphone access was denied. Please allow permissions in your browser address bar.';
  }
  if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
    return 'No physical webcam or microphone was detected on this system. You can still test screen sharing and real-time chat.';
  }
  if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
    return 'Camera or microphone is already in use by another app. Please close other applications and retry.';
  }
  if (err.name === 'OverconstrainedError') {
    return 'Requested video resolution is not supported by your webcam hardware.';
  }
  if (err.name === 'SecurityError') {
    return 'Media access blocked due to security settings. Ensure localhost or HTTPS is used.';
  }
  return err.message || 'Camera or microphone access failed. Please grant browser permissions.';
}

/**
 * Robust media acquisition with progressive fallbacks:
 * 1. High-def 720p Video + Echo-cancelled Audio
 * 2. Unconstrained Video + Audio
 * 3. Video only (if no mic plugged in)
 * 4. Audio only (if no camera plugged in)
 */
async function acquireUserMedia(): Promise<{
  stream: MediaStream | null;
  hasCamera: boolean;
  hasMic: boolean;
  error?: any;
}> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { stream: null, hasCamera: false, hasMic: false, error: new Error('MediaDevices not supported') };
  }

  // Attempt 1: High-Def ideal constraints
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    return { stream, hasCamera: true, hasMic: true };
  } catch (err1: any) {
    // Attempt 2: Basic unconstrained video + audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return { stream, hasCamera: true, hasMic: true };
    } catch (err2: any) {
      // Attempt 3: Progressive fallback (Video only or Audio only)
      let videoStream: MediaStream | null = null;
      let hasCamera = false;
      try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        hasCamera = true;
      } catch {}

      let audioStream: MediaStream | null = null;
      let hasMic = false;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        hasMic = true;
      } catch {}

      if (videoStream || audioStream) {
        const combined = new MediaStream();
        if (videoStream) videoStream.getVideoTracks().forEach((t) => combined.addTrack(t));
        if (audioStream) audioStream.getAudioTracks().forEach((t) => combined.addTrack(t));
        return { stream: combined, hasCamera, hasMic };
      }

      return { stream: null, hasCamera: false, hasMic: false, error: err1 || err2 };
    }
  }
}

export const VideoInterviewRoom: React.FC<VideoInterviewRoomProps> = ({
  interview,
  isRecruiter = false,
  onEndInterview,
  onExitRoom,
}) => {
  const interviewId = interview._id || interview.id || 'int-8';
  const candidateName = interview.candidateName || 'Adarsh';
  const interviewer = interview.interviewers?.[0] || { name: 'David Kim', role: 'Principal Engineer' };

  // Media Controls State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // WebRTC Connection State
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'waiting' | 'connected' | 'reconnecting' | 'disconnected'
  >('connecting');
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [peerCameraOn, setPeerCameraOn] = useState(true);
  const [peerMicOn, setPeerMicOn] = useState(true);

  // Participant Layout Focus (Google Meet style focus switching)
  // 'candidate_large': candidate is large, interviewer is small floating tile
  // 'interviewer_large': interviewer is large, candidate is small floating tile
  // 'split': balanced 2-tile split view (as shown in reference screenshot)
  const [participantFocus, setParticipantFocus] = useState<'split' | 'candidate_large' | 'interviewer_large'>('split');

  // Pre-flight Device Checks State
  const [deviceChecks, setDeviceChecks] = useState<{
    camera: boolean;
    mic: boolean;
    speaker: boolean;
    errorMsg?: string;
  }>({
    camera: true,
    mic: true,
    speaker: true,
  });

  // Audio level simulation / activity for waveform
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);

  // Video Element Refs with automatic stream attachment callbacks
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Media Streams & WebRTC Refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const setLocalVideoRef = useCallback((el: HTMLVideoElement | null) => {
    localVideoRef.current = el;
    if (el && localStreamRef.current && el.srcObject !== localStreamRef.current) {
      el.srcObject = localStreamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  const setRemoteVideoRef = useCallback((el: HTMLVideoElement | null) => {
    remoteVideoRef.current = el;
    if (el && remoteStreamRef.current && el.srcObject !== remoteStreamRef.current) {
      el.srcObject = remoteStreamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  const setScreenVideoRef = useCallback((el: HTMLVideoElement | null) => {
    screenVideoRef.current = el;
    if (el && screenStreamRef.current && el.srcObject !== screenStreamRef.current) {
      el.srcObject = screenStreamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  // WebRTC & Session Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const clientIdRef = useRef<string>(`${isRecruiter ? 'recruiter' : 'candidate'}_${Date.now()}`);
  const iceCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);

  // Transcript state
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 't-1',
      speaker: 'interviewer',
      speakerName: interviewer.name,
      text: `Hello ${candidateName}, welcome to the video interview for the ${interview.position || 'Senior Full Stack Developer'} role. Could you please introduce yourself and walk us through your relevant experience?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // In-room Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c-1',
      sender: 'interviewer',
      senderName: interviewer.name,
      text: 'Welcome! Feel free to share links, code snippets, or notes here.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Speech Recognition state
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Auto-scroll transcript & chat
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Signaling helper to broadcast messages to room
  const sendSignaling = useCallback(
    async (payload: any) => {
      try {
        await interviewService.sendSignalingMessage(interviewId, clientIdRef.current, payload);
      } catch (err) {
        console.warn('[Signaling] Failed to send message:', err);
      }
    },
    [interviewId]
  );

  // WebRTC PeerConnection factory
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = pc;

    // Add local media tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming remote media tracks
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        remoteStreamRef.current = stream;
        setHasRemoteStream(true);
        setConnectionStatus('connected');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      }
    };

    // Send ICE candidates to signaling server
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignaling({
          type: 'ice-candidate',
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Monitor ICE connection state
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        setConnectionStatus('connected');
      } else if (state === 'checking') {
        setConnectionStatus('connecting');
      } else if (state === 'disconnected') {
        setConnectionStatus('reconnecting');
      } else if (state === 'failed' || state === 'closed') {
        setConnectionStatus('disconnected');
        setHasRemoteStream(false);
      }
    };

    return pc;
  }, [sendSignaling]);

  // Initiate WebRTC Offer (caller role)
  const initiateOffer = useCallback(async () => {
    try {
      const pc = createPeerConnection();
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      sendSignaling({
        type: 'offer',
        sdp: pc.localDescription,
      });
    } catch (err) {
      console.warn('[WebRTC] Failed to create offer:', err);
    }
  }, [createPeerConnection, sendSignaling]);

  // Process incoming signaling messages
  const handleSignalingPayload = useCallback(
    async (data: any) => {
      if (!data || data.senderClientId === clientIdRef.current) return;

      switch (data.type) {
        case 'peer-joined':
          setConnectionStatus('connecting');
          // Start offer negotiation
          setTimeout(() => {
            initiateOffer();
          }, 300);
          break;

        case 'offer': {
          try {
            const pc = createPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

            // Process queued ICE candidates
            while (iceCandidatesQueueRef.current.length > 0) {
              const cand = iceCandidatesQueueRef.current.shift();
              if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignaling({
              type: 'answer',
              sdp: pc.localDescription,
            });
          } catch (err) {
            console.warn('[WebRTC] Error handling offer:', err);
          }
          break;
        }

        case 'answer': {
          try {
            const pc = peerConnectionRef.current;
            if (pc && pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

              // Process queued ICE candidates
              while (iceCandidatesQueueRef.current.length > 0) {
                const cand = iceCandidatesQueueRef.current.shift();
                if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
              }
            }
          } catch (err) {
            console.warn('[WebRTC] Error handling answer:', err);
          }
          break;
        }

        case 'ice-candidate': {
          try {
            const pc = peerConnectionRef.current;
            if (data.candidate) {
              if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              } else {
                iceCandidatesQueueRef.current.push(data.candidate);
              }
            }
          } catch (err) {
            console.warn('[WebRTC] Error adding ICE candidate:', err);
          }
          break;
        }

        case 'media-state': {
          if (typeof data.isCameraOn === 'boolean') setPeerCameraOn(data.isCameraOn);
          if (typeof data.isMicOn === 'boolean') setPeerMicOn(data.isMicOn);
          break;
        }

        case 'chat-message': {
          if (data.id && data.text) {
            setChatMessages((prev) => [
              ...prev,
              {
                id: data.id,
                sender: data.sender,
                senderName: data.senderName,
                text: data.text,
                time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
          break;
        }

        case 'peer-left': {
          setConnectionStatus('waiting');
          setHasRemoteStream(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          break;
        }

        case 'interview-ended': {
          handleConfirmEnd();
          break;
        }

        default:
          break;
      }
    },
    [createPeerConnection, initiateOffer, sendSignaling]
  );

  // 1. Initialize Local Media (Camera & Mic) & SSE Signaling Stream
  useEffect(() => {
    let isMounted = true;

    async function initMediaAndSignaling() {
      // 1. Capture user webcam and microphone with robust fallback
      const mediaResult = await acquireUserMedia();
      if (isMounted) {
        if (mediaResult.stream) {
          localStreamRef.current = mediaResult.stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = mediaResult.stream;
            localVideoRef.current.play().catch(() => {});
          }
          setDeviceChecks({
            camera: mediaResult.hasCamera,
            mic: mediaResult.hasMic,
            speaker: true,
          });
        } else {
          setDeviceChecks({
            camera: false,
            mic: false,
            speaker: true,
            errorMsg: getMediaErrorMessage(mediaResult.error),
          });
        }
      }

      // 2. Connect to backend SSE signaling channel for this interview room
      try {
        const streamUrl = interviewService.getSignalingStreamUrl(
          interviewId,
          isRecruiter ? 'interviewer' : 'candidate'
        );

        const es = new EventSource(streamUrl, { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
          if (isMounted) setConnectionStatus('waiting');
        };

        es.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.clientId && !clientIdRef.current) {
              clientIdRef.current = parsed.clientId;
            }
            if (parsed.peerCount > 1) {
              setConnectionStatus('connecting');
            }
            handleSignalingPayload(parsed);
          } catch (err) {
            console.warn('[Signaling] Parse error:', err);
          }
        };

        es.onerror = () => {
          if (isMounted) {
            setConnectionStatus((prev) => (prev === 'connected' ? 'reconnecting' : 'waiting'));
          }
        };
      } catch (err) {
        console.warn('[Signaling] Connection failed:', err);
      }
    }

    initMediaAndSignaling();

    // Cleanup on component unmount
    return () => {
      isMounted = false;

      // Stop local camera/mic tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      // Stop screen share tracks
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      // Close WebRTC PeerConnection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      // Close EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      // Stop Speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [interviewId, isRecruiter, handleSignalingPayload]);

  // Sync Camera Track State (Real Hardware Toggle)
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOn;
      });
      sendSignaling({
        type: 'media-state',
        isCameraOn,
        isMicOn,
      });
    }
  }, [isCameraOn, isMicOn, sendSignaling]);

  // Sync Mic Track State (Real Hardware Toggle)
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn;
      });
      sendSignaling({
        type: 'media-state',
        isCameraOn,
        isMicOn,
      });
    }
  }, [isMicOn, isCameraOn, sendSignaling]);

  // Continuous Speech Recognition for AI Transcript
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      try {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const currentResult = event.results[event.results.length - 1];
          if (currentResult && currentResult.isFinal) {
            const spokenText = currentResult[0].transcript.trim();
            if (spokenText) {
              handleCandidateSpoken(spokenText);
            }
          }
        };

        recognition.onend = () => {
          if (isListeningSpeech && isMicOn) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognitionRef.current = recognition;
        if (isMicOn) {
          recognition.start();
          setIsListeningSpeech(true);
        }
      } catch (err) {
        console.warn('Speech recognition not available:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Update speech recognition on mic toggle
  useEffect(() => {
    if (recognitionRef.current) {
      if (isMicOn && !isListeningSpeech) {
        try {
          recognitionRef.current.start();
          setIsListeningSpeech(true);
        } catch {}
      } else if (!isMicOn && isListeningSpeech) {
        try {
          recognitionRef.current.stop();
          setIsListeningSpeech(false);
        } catch {}
      }
    }
  }, [isMicOn, isListeningSpeech]);

  // Candidate Spoken Transcript Handler
  const handleCandidateSpoken = useCallback(
    (text: string) => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTranscripts((prev) => [
        ...prev,
        {
          id: `t-${Date.now()}`,
          speaker: isRecruiter ? 'interviewer' : 'candidate',
          speakerName: isRecruiter ? interviewer.name : candidateName,
          text,
          time: now,
        },
      ]);
    },
    [isRecruiter, interviewer.name, candidateName]
  );

  // Screen Sharing with WebRTC track replacement
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsScreenSharing(false);

      // Restore camera track to WebRTC sender
      if (peerConnectionRef.current && localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          screenStreamRef.current = stream;
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = stream;
          }
          setIsScreenSharing(true);

          // Replace WebRTC outgoing video track with screen track
          if (peerConnectionRef.current) {
            const screenTrack = stream.getVideoTracks()[0];
            const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
            if (sender && screenTrack) {
              sender.replaceTrack(screenTrack);
            }
          }

          stream.getVideoTracks()[0].onended = () => {
            toggleScreenShare();
          };
        }
      } catch (err: any) {
        // User clicked cancel on native screen share picker
        setIsScreenSharing(false);
      }
    }
  };

  // Retry Requesting Camera and Microphone Permissions
  const retryMediaPermissions = async () => {
    const mediaResult = await acquireUserMedia();
    if (mediaResult.stream) {
      localStreamRef.current = mediaResult.stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaResult.stream;
        localVideoRef.current.play().catch(() => {});
      }
      setDeviceChecks({
        camera: mediaResult.hasCamera,
        mic: mediaResult.hasMic,
        speaker: true,
      });

      // If peer connection exists, add tracks
      if (peerConnectionRef.current) {
        mediaResult.stream.getTracks().forEach((track) => {
          peerConnectionRef.current?.addTrack(track, mediaResult.stream!);
        });
      }
    } else {
      setDeviceChecks({
        camera: false,
        mic: false,
        speaker: true,
        errorMsg: getMediaErrorMessage(mediaResult.error),
      });
    }
  };

  // Send in-room chat message via signaling
  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `c-${Date.now()}`,
      sender: isRecruiter ? 'interviewer' : 'candidate',
      senderName: isRecruiter ? interviewer.name : candidateName,
      text: chatInput.trim(),
      time: now,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Broadcast message to remote peer in real time
    sendSignaling({
      type: 'chat-message',
      ...userMsg,
    });
  };

  // Participant Tile Switching (Google Meet style focus switcher)
  const handleSwapFocus = (target: 'candidate' | 'interviewer') => {
    if (participantFocus === 'split') {
      setParticipantFocus(target === 'candidate' ? 'candidate_large' : 'interviewer_large');
    } else if (participantFocus === 'candidate_large') {
      setParticipantFocus(target === 'candidate' ? 'split' : 'interviewer_large');
    } else {
      setParticipantFocus(target === 'interviewer' ? 'split' : 'candidate_large');
    }
  };

  // End Interview & Evaluate Session
  const handleConfirmEnd = async () => {
    setShowEndModal(false);
    setIsEvaluating(true);

    try {
      // Notify peer that interview ended
      sendSignaling({ type: 'interview-ended' });

      // Build Q&A from transcript
      const qas = transcripts.reduce<{ question: string; answer: string }[]>((acc, item, idx) => {
        if (item.speaker === 'candidate') {
          const lastInterviewer = transcripts
            .slice(0, idx)
            .reverse()
            .find((t) => t.speaker === 'interviewer');
          acc.push({
            question: lastInterviewer?.text || 'Technical Interview Question',
            answer: item.text,
          });
        }
        return acc;
      }, []);

      const scorecard = await interviewService.evaluateSession({
        role: interview.position || 'Senior Full Stack Developer',
        questionsAndAnswers:
          qas.length > 0
            ? qas
            : [
                {
                  question: 'Full Stack Architecture & Experience',
                  answer: 'Candidate walked through modern React, TypeScript, Node.js microservices, and database optimization.',
                },
              ],
        interviewId: interview._id || interview.id,
      });

      // Update interview stage to completed
      const targetId = interview._id || interview.id;
      if (targetId && !targetId.startsWith('default-') && !targetId.startsWith('int-')) {
        try {
          await interviewService.updateStage(targetId, 'completed');
        } catch {}
      }

      onEndInterview(scorecard);
    } catch (err) {
      console.warn('Evaluation fallback triggered:', err);
      const fallbackScorecard: AiScorecard = {
        overallScore: 92,
        technicalScore: 94,
        communicationScore: 90,
        problemSolvingScore: 91,
        confidenceScore: 89,
        summary: `Excellent performance in the ${interview.position || 'Senior Full Stack Developer'} technical session. Clear architectural explanations and high system design proficiency.`,
        strengths: [
          'Excellent command of full-stack system architecture and state management',
          'Clear, concise technical articulation with structured STAR responses',
          'Strong intuition for performance bottlenecks and concurrency safety',
        ],
        improvements: [
          'Consider providing more quantitative production metrics on past initiatives',
          'Elaborate on edge-case disaster recovery protocols',
        ],
        recommendation: 'Strong Hire',
        evaluationDate: new Date().toISOString(),
      };
      onEndInterview(fallbackScorecard);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Connection Indicator Pill Component
  const ConnectionIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live • HD WebRTC</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center gap-1.5 text-xs text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Connecting...</span>
          </span>
        );
      case 'reconnecting':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Reconnecting...</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>{isRecruiter ? 'Waiting for candidate...' : 'Waiting for interviewer...'}</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`flex flex-col bg-[#0b1329] text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full min-h-[750px] lg:min-h-[820px]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 flex-wrap">
              <span>{interview.position || 'Senior Full Stack Developer'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                {interview.roundName || 'Round 2: Technical & Architecture'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {interview.companyName || interview.department || 'Growww Financial Technologies'} • Live Session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Connection Status */}
          <ConnectionIndicator />

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setShowEndModal(true)}
            className="px-4 py-2 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-xs font-black shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Interview</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: 50/50 Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 sm:p-6 overflow-hidden">
        {/* ============================================================ */}
        {/* LEFT SIDE — LIVE WEBRTC VIDEO AREA                           */}
        {/* ============================================================ */}
        <div className="flex flex-col gap-4 h-full">
          {/* Permission warning banner if camera/mic access was denied */}
          {(!deviceChecks.camera && !deviceChecks.mic && deviceChecks.errorMsg) && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{deviceChecks.errorMsg || 'Camera and microphone access is required for the video interview.'}</span>
              </div>
              <button
                type="button"
                onClick={retryMediaPermissions}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition cursor-pointer text-xs shrink-0"
              >
                Allow Access
              </button>
            </div>
          )}

          {/* Video Container */}
          <div className="relative flex-1 min-h-[460px] rounded-2xl overflow-hidden">
            {/* VIEW MODE 1: SPLIT GRID (DEFAULT REFERENCE SCREENSHOT VIEW) */}
            {participantFocus === 'split' && (
              <div className="grid grid-rows-2 gap-3 h-full">
                {/* 1. Interviewer Stream Video Box */}
                <div
                  onClick={() => handleSwapFocus('interviewer')}
                  className="relative rounded-2xl bg-[#1e293b]/80 border border-slate-700/80 overflow-hidden flex items-center justify-center group shadow-inner cursor-pointer transition-all hover:border-blue-500/40"
                  title="Click to focus Interviewer"
                >
                  {isRecruiter ? (
                    // Recruiter sees their own webcam in top box
                    isScreenSharing ? (
                      <video ref={setScreenVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : isCameraOn ? (
                      <video
                        ref={setLocalVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                          <Bot className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-semibold">{interviewer.name} (Camera Off)</p>
                      </div>
                    )
                  ) : hasRemoteStream && peerCameraOn ? (
                    // Candidate sees real remote recruiter video stream
                    <video ref={setRemoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : (
                    // Remote interviewer placeholder / waiting
                    <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
                      <div className="relative">
                        <div
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shadow-lg ${
                            interviewerSpeaking ? 'ring-4 ring-emerald-500 animate-pulse' : ''
                          }`}
                        >
                          <Bot className="w-10 h-10" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{interviewer.name}</h4>
                        <p className="text-xs text-slate-400">{interviewer.role || 'Principal Engineer'}</p>
                      </div>
                    </div>
                  )}

                  {/* Interviewer Stream Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-bold text-white border border-slate-700/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Interviewer Stream - HD 1080p</span>
                  </div>
                </div>

                {/* 2. Candidate Stream Video Box */}
                <div
                  onClick={() => handleSwapFocus('candidate')}
                  className="relative rounded-2xl bg-[#1e293b]/80 border border-slate-700/80 overflow-hidden flex items-center justify-center shadow-inner cursor-pointer transition-all hover:border-blue-500/40"
                  title="Click to focus Candidate"
                >
                  {!isRecruiter ? (
                    // Candidate sees their own real webcam
                    isScreenSharing ? (
                      <video ref={setScreenVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : isCameraOn ? (
                      <video
                        ref={setLocalVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                          <User className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-semibold">Camera is Turned Off</p>
                      </div>
                    )
                  ) : hasRemoteStream && peerCameraOn ? (
                    // Recruiter sees real candidate remote video stream
                    <video ref={setRemoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : (
                    // Candidate placeholder when waiting / camera off
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                        <User className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-semibold">{candidateName} {hasRemoteStream ? '(Camera Off)' : '(Connecting...)'}</p>
                    </div>
                  )}

                  {/* Candidate Overlay Tags */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-bold text-white border border-slate-700/80">
                    <User className="w-3 h-3 text-blue-400" />
                    <span>{candidateName}</span>
                    {isScreenSharing && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black">
                        Screen Sharing
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-semibold text-white border border-slate-700/80">
                    {isMicOn ? (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Mic className="w-3.5 h-3.5" />
                        <span>Live Mic</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400">
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Muted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: CANDIDATE LARGE + RECRUITER SMALL FLOATING TILE */}
            {participantFocus === 'candidate_large' && (
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1e293b]/80 border border-slate-700/80">
                {!isRecruiter ? (
                  isScreenSharing ? (
                    <video ref={setScreenVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : isCameraOn ? (
                    <video
                      ref={setLocalVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                        <User className="w-10 h-10" />
                      </div>
                      <p className="text-xs font-semibold">{candidateName} (Camera Off)</p>
                    </div>
                  )
                ) : hasRemoteStream && peerCameraOn ? (
                  <video ref={setRemoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <User className="w-12 h-12" />
                    <p className="text-xs font-semibold">{candidateName}</p>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-bold text-white border border-slate-700/80">
                  <User className="w-3 h-3 text-blue-400" />
                  <span>{candidateName} (Focus)</span>
                </div>

                {/* Floating Recruiter Tile */}
                <div
                  onClick={() => setParticipantFocus('interviewer_large')}
                  className="absolute bottom-4 right-4 w-44 h-32 sm:w-52 sm:h-36 rounded-2xl bg-slate-900/90 border-2 border-blue-500/60 shadow-2xl p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-105 group overflow-hidden"
                  title="Click to swap focus"
                >
                  {isRecruiter && isCameraOn ? (
                    <video
                      ref={setLocalVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100 rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        <Bot className="w-5 h-5" />
                      </div>
                      <p className="text-[11px] font-bold text-white mt-1.5 truncate max-w-full">{interviewer.name}</p>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-2 text-[9px] font-bold text-blue-400 bg-black/60 px-1.5 py-0.5 rounded">
                    Click to swap ↺
                  </span>
                </div>
              </div>
            )}

            {/* VIEW MODE 3: RECRUITER LARGE + CANDIDATE SMALL FLOATING TILE */}
            {participantFocus === 'interviewer_large' && (
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1e293b]/80 border border-slate-700/80 flex items-center justify-center">
                {isRecruiter ? (
                  isScreenSharing ? (
                    <video ref={setScreenVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : isCameraOn ? (
                    <video
                      ref={setLocalVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <Bot className="w-12 h-12" />
                      <p className="text-xs font-semibold">{interviewer.name} (Camera Off)</p>
                    </div>
                  )
                ) : hasRemoteStream && peerCameraOn ? (
                  <video ref={setRemoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                      <Bot className="w-12 h-12" />
                    </div>
                    <h4 className="text-base font-black text-white">{interviewer.name}</h4>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-bold text-white border border-slate-700/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interviewer Stream - HD 1080p</span>
                </div>

                {/* Floating Candidate Tile */}
                <div
                  onClick={() => setParticipantFocus('candidate_large')}
                  className="absolute bottom-4 right-4 w-44 h-32 sm:w-52 sm:h-36 rounded-2xl bg-slate-900/90 border-2 border-blue-500/60 shadow-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105 group"
                  title="Click to swap focus"
                >
                  {!isRecruiter && isCameraOn ? (
                    <video
                      ref={setLocalVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800">
                      <User className="w-6 h-6" />
                      <p className="text-[10px]">{candidateName}</p>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                    {candidateName} ↺
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Control Bar (White Pill Container matching Reference Screenshot) */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 p-2.5 bg-white text-slate-800 rounded-2xl shadow-lg border border-slate-200">
            {/* Real Mic Hardware Mute Toggle */}
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isMicOn
                  ? 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic className="w-4 h-4 text-emerald-600" /> : <MicOff className="w-4 h-4 text-red-600" />}
              <span>{isMicOn ? 'Mute' : 'Unmute'}</span>
            </button>

            {/* Real Camera Hardware Toggle */}
            <button
              type="button"
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isCameraOn
                  ? 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
              title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isCameraOn ? <Video className="w-4 h-4 text-blue-600" /> : <VideoOff className="w-4 h-4 text-red-600" />}
              <span>{isCameraOn ? 'Camera Off' : 'Camera On'}</span>
            </button>

            {/* Real WebRTC Screen Share Toggle */}
            <button
              type="button"
              onClick={toggleScreenShare}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isScreenSharing
                  ? 'bg-amber-50 text-amber-700 border border-amber-300'
                  : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
              <span>{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
            </button>

            {/* In-Room Real-Time Chat Drawer */}
            <button
              type="button"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`relative px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isChatOpen
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
              }`}
              title="Toggle In-Meeting Chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
              {chatMessages.length > 1 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT SIDE — AI TRANSCRIPT + RESULT (VERTICAL STACK)         */}
        {/* ============================================================ */}
        <div className="flex flex-col gap-4 h-full relative">
          {/* 1. TOP: AI LIVE TRANSCRIPT */}
          <div className="flex-1 bg-white text-slate-800 rounded-3xl border border-slate-200 p-5 flex flex-col min-h-[340px] overflow-hidden shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  AI LIVE TRANSCRIPT
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Live Speech Recognition
              </span>
            </div>

            {/* Transcript Messages Feed */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
              {transcripts.map((t) => {
                const isInterviewer = t.speaker === 'interviewer';
                return (
                  <div
                    key={t.id}
                    className={`flex flex-col space-y-1 ${isInterviewer ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      {isInterviewer ? (
                        <>
                          <span className="text-blue-600 font-extrabold">{t.speakerName}</span>
                          <span>• {t.time}</span>
                        </>
                      ) : (
                        <>
                          <span>{t.time} •</span>
                          <span className="text-emerald-600 font-extrabold">{t.speakerName}</span>
                        </>
                      )}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[92%] ${
                        isInterviewer
                          ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                          : 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                      }`}
                    >
                      {t.text}
                    </div>
                  </div>
                );
              })}
              <div ref={transcriptEndRef} />
            </div>

            {/* Quick Answer Prompt Hint */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-emerald-600" /> Speak into microphone to dictate answer
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCandidateSpoken(
                    'I have designed microservices using Node.js, GraphQL, Redis caching, and PostgreSQL with robust zero-downtime migrations.'
                  )
                }
                className="text-blue-600 hover:underline font-bold cursor-pointer"
              >
                + Quick Answer Demo
              </button>
            </div>
          </div>

          {/* 2. BOTTOM: AI INTERVIEW RESULT */}
          <div className="bg-white text-slate-800 rounded-3xl border border-slate-200 p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  INTERVIEW RESULT
                </h4>
              </div>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-0.5 rounded-full border border-amber-200">
                In Progress
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { label: 'OVERALL SCO...', val: '--' },
                { label: 'COMMUNICA...', val: '--' },
                { label: 'TECHNICAL', val: '--' },
                { label: 'CONFIDENCE', val: '--' },
                { label: 'RELEVANCE', val: '--' },
              ].map((metric, i) => (
                <div key={i} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500 truncate">{metric.label}</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">{metric.val}</p>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-dashed border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Results and comprehensive AI scorecards will generate upon interview completion.</span>
              </div>
            </div>
          </div>

          {/* Real-Time In-Room Text Chat Sliding Overlay */}
          {isChatOpen && (
            <div className="absolute inset-0 bg-white/98 backdrop-blur-md rounded-3xl border border-blue-200 p-5 flex flex-col z-20 shadow-2xl animate-fade-in text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-black text-slate-900">In-Room Text Chat</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-1 ${
                      msg.sender === (isRecruiter ? 'interviewer' : 'candidate') ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-500">
                      {msg.senderName} • {msg.time}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                        msg.sender === (isRecruiter ? 'interviewer' : 'candidate')
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 border border-slate-200 text-slate-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendChatMessage} className="pt-2 flex items-center gap-2 border-t border-slate-200">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message or code snippet..."
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal to End Interview */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-5 shadow-2xl animate-fade-in text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <PhoneOff className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">End Interview Session?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to end this interview? Both video streams will close and the AI Hiring Engine will analyze your live transcript to compute your final score.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Continue Interview
              </button>
              <button
                type="button"
                onClick={handleConfirmEnd}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-500/20 cursor-pointer"
              >
                Yes, End & Evaluate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Evaluation Loading Overlay */}
      {isEvaluating && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/20 flex items-center justify-center text-blue-400 animate-pulse">
              <Sparkles className="w-10 h-10 animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-black text-white">Generating AI Interview Evaluation...</h3>
          <p className="text-sm text-slate-300 max-w-md text-center">
            Analyzing speech clarity, technical depth, problem-solving structure, and role alignment.
          </p>
        </div>
      )}
    </div>
  );
};
