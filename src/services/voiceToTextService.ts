import { supabase } from '@/integrations/supabase/client';

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;

  async startRecording(): Promise<void> {
    try {
      console.log('Starting voice recording...');
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm;codecs=opus' });
      this.audioChunks = [];
      this.isRecording = true;
      this.mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) this.audioChunks.push(event.data); };
      this.mediaRecorder.start(100);
      console.log('Voice recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) { reject(new Error('No recording in progress')); return; }
      this.mediaRecorder.onstop = async () => {
        try {
          console.log('Processing recorded audio...');
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const base64Audio = await this.blobToBase64(audioBlob);
          this.cleanup();
          resolve(base64Audio);
        } catch (error) {
          console.error('Error processing recording:', error);
          reject(error);
        }
      };
      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => { const result = reader.result as string; const base64 = result.split(',')[1]; resolve(base64); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private cleanup(): void {
    if (this.stream) { this.stream.getTracks().forEach(track => track.stop()); this.stream = null; }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  getRecordingState(): boolean { return this.isRecording; }
}

export class WebSpeechRecognition {
  private recognition: any = null;
  private isListening = false;
  private inactivityTimer: any = null;
  private lastActivity = 0;
  private maxSilenceMs = 3000;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    } else {
      throw new Error('Web Speech API not supported in this browser');
    }
    this.setupRecognition();
  }

  private setupRecognition(): void {
    if (!this.recognition) return;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = (navigator && (navigator as any).language) || 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  startListening(maxSilenceMs?: number): Promise<string> {
    return this.startListeningWithInterim(maxSilenceMs);
  }

  startListeningWithInterim(maxSilenceMs?: number, onInterim?: (text: string) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) { reject(new Error('Speech recognition not available')); return; }
      this.isListening = true;
      let finalTranscript = '';
      let interimTranscript = '';
      if (typeof maxSilenceMs === 'number' && maxSilenceMs > 0) this.maxSilenceMs = maxSilenceMs;
      this.lastActivity = Date.now();

      this.recognition.onstart = () => { console.log('Speech recognition started'); };

      this.recognition.onresult = (event: any) => {
        this.lastActivity = Date.now();
        interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += (finalTranscript ? ' ' : '') + res[0].transcript;
          } else {
            interimTranscript += res[0].transcript;
          }
        }
        if (onInterim) onInterim((finalTranscript + ' ' + interimTranscript).trim());
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.inactivityTimer) { clearInterval(this.inactivityTimer); this.inactivityTimer = null; }
        if (finalTranscript.trim()) { resolve(finalTranscript); } else { reject(new Error('No speech detected')); }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (this.inactivityTimer) { clearInterval(this.inactivityTimer); this.inactivityTimer = null; }
        console.error('Speech recognition error:', event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      try { this.recognition.start(); } catch (e) { console.warn('Recognition start error', e); }

      this.inactivityTimer = setInterval(() => {
        if (!this.isListening) return;
        const idle = Date.now() - this.lastActivity;
        if (idle > this.maxSilenceMs) { try { this.recognition.stop(); } catch {} }
      }, 300);
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) { try { this.recognition.stop(); } catch {} this.isListening = false; }
    if (this.inactivityTimer) { clearInterval(this.inactivityTimer); this.inactivityTimer = null; }
  }

  isSupported(): boolean { return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window; }
}

export class VoiceToTextService {
  private webSpeechRecognition: WebSpeechRecognition | null = null;

  constructor() {
    try { this.webSpeechRecognition = new WebSpeechRecognition(); }
    catch (error) { console.warn('Web Speech API not available:', error); this.webSpeechRecognition = null; }
  }

  async transcribeAudio(audioBase64: string, language = 'en'): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('voice-to-text', { body: { audio: audioBase64, language } });
      if (error) { const errorMessage = error.message || 'Edge Function returned a non-2xx status code'; throw new Error(errorMessage); }
      if (!data || !data.text) { throw new Error('No transcription received'); }
      return data.text;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      if (errorMessage.includes('status code')) throw new Error('Voice-to-text service temporarily unavailable. Please try again.');
      throw new Error(`Transcription failed: ${errorMessage}`);
    }
  }

  async startRealTimeTranscription(): Promise<string> {
    if (!this.webSpeechRecognition) throw new Error('Web Speech API not supported in this browser');
    return this.webSpeechRecognition.startListening();
  }

  async startRealTimeTranscriptionWithSilence(maxSilenceMs: number): Promise<string> {
    if (!this.webSpeechRecognition) throw new Error('Web Speech API not supported in this browser');
    return this.webSpeechRecognition.startListening(maxSilenceMs);
  }

  async startRealTimeTranscriptionStream(maxSilenceMs: number, onInterim: (text: string) => void): Promise<string> {
    if (!this.webSpeechRecognition) throw new Error('Web Speech API not supported in this browser');
    return this.webSpeechRecognition.startListeningWithInterim(maxSilenceMs, onInterim);
  }

  stopRealTimeTranscription(): void { if (this.webSpeechRecognition) this.webSpeechRecognition.stopListening(); }

  isWebSpeechSupported(): boolean { return this.webSpeechRecognition !== null; }

  async transcribeAudioBlob(audioBlob: Blob, language = 'en'): Promise<string> {
    const base64Audio = await this.blobToBase64(audioBlob);
    return this.transcribeAudio(base64Audio, language);
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => { const result = reader.result as string; const base64 = result.split(',')[1]; resolve(base64); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const voiceToTextService = new VoiceToTextService();
export default voiceToTextService;