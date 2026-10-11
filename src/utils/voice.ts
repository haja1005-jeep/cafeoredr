import { soundEffects } from './sound';
import { Order } from '../types/cafe';

export type VoiceStyle = 'standard' | 'friendly' | 'menu_detail';

class VoiceAnnouncer {
  private isEnabled: boolean = true;
  private voiceStyle: VoiceStyle = 'standard';
  private voiceSpeed: number = 0.98; // 살짝 또박또박한 속도
  private voicePitch: number = 1.05; // 친절하고 밝은 톤

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedStyle = localStorage.getItem('cafe_voice_style');
        if (savedStyle) this.voiceStyle = savedStyle as VoiceStyle;
        const savedEnabled = localStorage.getItem('cafe_voice_enabled');
        if (savedEnabled !== null) this.isEnabled = savedEnabled === 'true';
      } catch {
        // ignore
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('cafe_voice_enabled', String(enabled));
    } catch {
      // ignore
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setVoiceStyle(style: VoiceStyle) {
    this.voiceStyle = style;
    try {
      localStorage.setItem('cafe_voice_style', style);
    } catch {
      // ignore
    }
  }

  public getVoiceStyle(): VoiceStyle {
    return this.voiceStyle;
  }

  // Get preferred Korean voice
  private getKoreanVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prefer Korean natural voices
    const koVoices = voices.filter((v) => v.lang.includes('ko') || v.lang.includes('KR'));
    if (koVoices.length > 0) {
      // Prefer Google or high quality voice if available
      const preferred = koVoices.find((v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Yuna'));
      return preferred || koVoices[0];
    }
    return null;
  }

  // Speak announcement for an order
  public announceOrderReady(order: Order) {
    if (!this.isEnabled) return;

    // 1. First play pleasant chime
    soundEffects.playOrderReady();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Construct friendly message
    let text = `${order.orderNumber}번 고객님, 주문하신 음료 나왔습니다.`;

    if (this.voiceStyle === 'friendly') {
      text = `감사합니다. ${order.orderNumber}번 고객님, 주문하신 음료 픽업대에서 찾아가세요.`;
    } else if (this.voiceStyle === 'menu_detail') {
      const firstItem = order.items[0]?.menuName || '음료';
      const extraCount = order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : '';
      text = `${order.orderNumber}번 고객님, 주문하신 ${firstItem}${extraCount} 나왔습니다.`;
    }

    // Delay speech slightly to let the 4-tone chime play first
    setTimeout(() => {
      try {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = this.voiceSpeed;
        utterance.pitch = this.voicePitch;

        const voice = this.getKoreanVoice();
        if (voice) {
          utterance.voice = voice;
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback gracefully
      }
    }, 700);
  }

  // Speak arbitrary test text
  public speakCustomText(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      soundEffects.playOrderReady();
      setTimeout(() => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = this.voiceSpeed;
        utterance.pitch = this.voicePitch;
        const voice = this.getKoreanVoice();
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
      }, 600);
    } catch {
      // ignore
    }
  }

  // Test voice sample
  public testSampleAnnouncement(orderNumber = 101) {
    let sample = `${orderNumber}번 고객님, 주문하신 음료 나왔습니다.`;
    if (this.voiceStyle === 'friendly') {
      sample = `감사합니다. ${orderNumber}번 고객님, 주문하신 음료 픽업대에서 찾아가세요.`;
    } else if (this.voiceStyle === 'menu_detail') {
      sample = `${orderNumber}번 고객님, 주문하신 아이스 아메리카노 나왔습니다.`;
    }
    this.speakCustomText(sample);
  }
}

export const voiceAnnouncer = new VoiceAnnouncer();
