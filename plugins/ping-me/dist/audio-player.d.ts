/**
 * Audio Player for macOS using afplay command
 */
import { AudioPlaybackResult, Logger } from './types';
export declare class AudioPlayer {
    private logger;
    private currentProcess;
    constructor(logger: Logger);
    /**
     * Play audio file using macOS afplay command
     */
    playAudio(filePath: string): Promise<AudioPlaybackResult>;
    /**
     * Stop currently playing audio
     */
    stopAudio(): void;
    /**
     * Play audio in background (non-blocking)
     */
    playAudioBackground(filePath: string): Promise<void>;
    /**
     * Check if afplay command is available
     */
    isAfplayAvailable(): Promise<boolean>;
    /**
     * Get audio file info using afinfo command (if available)
     */
    getAudioInfo(filePath: string): Promise<Record<string, any> | null>;
    /**
     * Test audio playback with a short beep sound
     */
    testPlayback(): Promise<boolean>;
    /**
     * Get current playback status
     */
    isPlaying(): boolean;
    /**
     * Cleanup and stop any running audio
     */
    cleanup(): void;
}
//# sourceMappingURL=audio-player.d.ts.map