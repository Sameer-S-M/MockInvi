import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { VoiceRecorder, voiceToTextService } from '@/services/voiceToTextService';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscription, 
  disabled = false, 
  className = '' 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUsingWebSpeech, setIsUsingWebSpeech] = useState(false);
  // Manual text inside VoiceInput removed; use separate Text Input tab
  const { toast } = useToast();
  const recorderRef = useRef<VoiceRecorder | null>(null);

  const startRecording = async () => {
    toast({ title: 'Disabled', description: 'Record Audio is removed. Use Real-time Speech or Text Input.' });
  };

  const stopRecording = async () => {};

  const startWebSpeechRecognition = async () => {
    try {
      setIsUsingWebSpeech(true);
      setIsProcessing(true);
      
      toast({
        title: "Listening...",
        description: "Speak clearly into your microphone",
      });

      // Allow longer pauses: pass 8000ms (8s) max silence window
      const transcription = await voiceToTextService.startRealTimeTranscriptionWithSilence?.(4000)
        ?? await (voiceToTextService as any).webSpeechRecognition?.startListening(4000)
        ?? await voiceToTextService.startRealTimeTranscription();
      
      if (transcription.trim()) {
        onTranscription(transcription);
        toast({
          title: "Transcription Complete",
          description: "Speech converted to text successfully",
        });
      } else {
        toast({
          title: "No Speech Detected",
          description: "Please try again",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('Web Speech recognition failed:', error);
      toast({
        title: "Recognition Failed",
        description: error.message || "Could not recognize speech",
        variant: "destructive",
      });
    } finally {
      setIsUsingWebSpeech(false);
      setIsProcessing(false);
    }
  };

  const stopWebSpeechRecognition = () => {
    voiceToTextService.stopRealTimeTranscription();
    setIsUsingWebSpeech(false);
    setIsProcessing(false);
  };

  // Manual submission removed

  const handleToggleRecording = () => { startRecording(); };

  const handleToggleWebSpeech = () => {
    if (isUsingWebSpeech) {
      stopWebSpeechRecognition();
    } else {
      startWebSpeechRecognition();
    }
  };

  // Manual toggle removed

  const isWebSpeechSupported = voiceToTextService.isWebSpeechSupported();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Voice Input - Real-time Speech only */}
      <div className="flex flex-wrap gap-2">
        {/* Web Speech API Button */}
        {isWebSpeechSupported && (
          <Button
            onClick={handleToggleWebSpeech}
            disabled={disabled || isProcessing}
            variant={isUsingWebSpeech ? "default" : "outline"}
            size="sm"
            className={`${isUsingWebSpeech ? 'animate-pulse' : ''}`}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isUsingWebSpeech ? (
              <MicOff className="h-4 w-4 mr-2" />
            ) : (
              <Volume2 className="h-4 w-4 mr-2" />
            )}
            
            {isProcessing 
              ? 'Processing...' 
              : isUsingWebSpeech 
                ? 'Stop Listening' 
                : 'Real-time Speech'
            }
          </Button>
        )}
      </div>

      {/* Status Messages */}
      {isRecording && (
        <p className="text-sm text-blue-600 flex items-center gap-2">
          <Mic className="h-4 w-4 animate-pulse" />
          Recording... Speak clearly into your microphone
        </p>
      )}
      
      {isUsingWebSpeech && (
        <p className="text-sm text-green-600 flex items-center gap-2">
          <Volume2 className="h-4 w-4 animate-pulse" />
          Listening... Speak now
        </p>
      )}
      
      {isProcessing && (
        <p className="text-sm text-yellow-600 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing your speech...
        </p>
      )}
    </div>
  );
};

export default VoiceInput;