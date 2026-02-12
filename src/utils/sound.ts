/**
 * Web Audio API 기반 자연 배경음 합성 엔진
 * 오디오 파일 없이 코드로 rain, wind, forest, ocean, rumble, steam 사운드를 생성
 */

export type AmbientSoundType = 'rain' | 'wind' | 'forest' | 'ocean' | 'rumble' | 'steam';
export type OneShotType = 'waterDrop';

interface SoundLayer {
  gainNode: GainNode;
  nodes: AudioNode[];          // 정리할 노드들
  timers: number[];            // 정리할 타이머들 (setInterval/setTimeout)
  cleanup: () => void;
}

/* ───────── 노이즈 생성 유틸 ───────── */

function createWhiteNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createPinkNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

/* ───────── AmbientSound 클래스 ───────── */

class AmbientSound {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private layers = new Map<string, SoundLayer>();
  private _isMuted = false;
  private _isAvailable = true;
  private _sessionId = 0;    // 세션 ID — stale cleanup 방지용

  /* ── 세션 ID 관리 ── */
  get sessionId() { return this._sessionId; }
  nextSession() { return ++this._sessionId; }

  /* ── 초기화 ── */

  async init(): Promise<boolean> {
    // 기존 ctx가 closed 상태면 폐기 후 재생성
    if (this.ctx && this.ctx.state === 'closed') {
      this.ctx = null;
      this.masterGain = null;
    }

    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        try { await this.ctx.resume(); } catch { /* ignore */ }
      }
      return true;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        this._isAvailable = false;
        return false;
      }
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return true;
    } catch {
      this._isAvailable = false;
      return false;
    }
  }

  get isAvailable() { return this._isAvailable; }
  get isMuted() { return this._isMuted; }

  /* ── 음소거 ── */

  setMuted(muted: boolean) {
    this._isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 0.3);
    }
  }

  toggleMute() {
    this.setMuted(!this._isMuted);
  }

  /* ── 레이어 재생 ── */

  play(type: AmbientSoundType, volume = 0.3): void {
    if (!this.ctx || !this.masterGain) return;
    // 이미 재생 중이면 볼륨만 조절
    if (this.layers.has(type)) {
      this.setLayerVolume(type, volume, 0.5);
      return;
    }

    let layer: SoundLayer | null = null;
    switch (type) {
      case 'rain':    layer = this.createRain(volume); break;
      case 'wind':    layer = this.createWind(volume); break;
      case 'forest':  layer = this.createForest(volume); break;
      case 'ocean':   layer = this.createOcean(volume); break;
      case 'rumble':  layer = this.createRumble(volume); break;
      case 'steam':   layer = this.createSteam(volume); break;
    }
    if (layer) {
      this.layers.set(type, layer);
    }
  }

  /* ── 볼륨 조절 ── */

  setLayerVolume(type: string, volume: number, rampTime = 0.1): void {
    const layer = this.layers.get(type);
    if (!layer || !this.ctx) return;
    const now = this.ctx.currentTime;
    layer.gainNode.gain.cancelScheduledValues(now);
    layer.gainNode.gain.setValueAtTime(layer.gainNode.gain.value, now);
    layer.gainNode.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume)), now + rampTime);
  }

  /* ── 일회성 효과음 ── */

  playOneShot(type: OneShotType): void {
    if (!this.ctx || !this.masterGain || this._isMuted) return;
    switch (type) {
      case 'waterDrop': this.playWaterDrop(); break;
    }
  }

  /* ── 레이어 중지 ── */

  stopLayer(type: string, fadeTime = 0.5): void {
    const layer = this.layers.get(type);
    if (!layer || !this.ctx) return;

    const now = this.ctx.currentTime;
    layer.gainNode.gain.cancelScheduledValues(now);
    layer.gainNode.gain.setValueAtTime(layer.gainNode.gain.value, now);
    layer.gainNode.gain.linearRampToValueAtTime(0, now + fadeTime);

    setTimeout(() => {
      layer.cleanup();
      this.layers.delete(type);
    }, fadeTime * 1000 + 100);
  }

  stopAll(fadeTime = 0.5): void {
    for (const type of this.layers.keys()) {
      this.stopLayer(type, fadeTime);
    }
  }

  /* ── 레이어만 정리 (AudioContext 유지) ── */

  reset(): void {
    for (const layer of this.layers.values()) {
      layer.cleanup();
    }
    this.layers.clear();
  }

  /* ── 전체 정리 (앱 종료 시만 사용) ── */

  destroy(): void {
    this.reset();
    if (this.ctx && this.ctx.state !== 'closed') {
      try { this.ctx.close(); } catch { /* ignore */ }
    }
    this.ctx = null;
    this.masterGain = null;
  }

  /* ═══════════ 사운드 합성 메서드 ═══════════ */

  /* ── 비 (Rain) ── */
  private createRain(volume: number): SoundLayer {
    const ctx = this.ctx!;
    const buffer = createWhiteNoiseBuffer(ctx, 2);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2000;
    bandpass.Q.value = 0.5;

    const highShelf = ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 4000;
    highShelf.gain.value = -6;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(bandpass);
    bandpass.connect(highShelf);
    highShelf.connect(gain);
    gain.connect(this.masterGain!);
    source.start();

    // 페이드 인
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);

    return {
      gainNode: gain,
      nodes: [source, bandpass, highShelf, gain],
      timers: [],
      cleanup: () => {
        try { source.stop(); } catch { /* ignore */ }
        source.disconnect();
        bandpass.disconnect();
        highShelf.disconnect();
        gain.disconnect();
      },
    };
  }

  /* ── 바람 (Wind) ── */
  private createWind(volume: number): SoundLayer {
    const ctx = this.ctx!;
    const buffer = createPinkNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;
    lowpass.Q.value = 0.7;

    // LFO: 느린 바람 세기 변화
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = volume * 0.4;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    source.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain!);

    source.start();
    lfo.start();

    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);

    return {
      gainNode: gain,
      nodes: [source, lowpass, lfo, lfoGain, gain],
      timers: [],
      cleanup: () => {
        try { source.stop(); } catch { /* ignore */ }
        try { lfo.stop(); } catch { /* ignore */ }
        source.disconnect();
        lowpass.disconnect();
        lfo.disconnect();
        lfoGain.disconnect();
        gain.disconnect();
      },
    };
  }

  /* ── 숲/새소리 (Forest chirps) ── */
  private createForest(volume: number): SoundLayer {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(this.masterGain!);

    const timers: number[] = [];
    let active = true;

    const scheduleChirp = () => {
      if (!active || !this.ctx || ctx.state === 'closed') return;

      const now = ctx.currentTime;
      const startFreq = 1800 + Math.random() * 1500;
      const endFreq = startFreq + 500 + Math.random() * 1000;

      // 더블 chirp (자연스러운 새소리)
      for (let c = 0; c < 2; c++) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const t = now + c * 0.1;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.08);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0, t);
        chirpGain.gain.linearRampToValueAtTime(0.06, t + 0.01);
        chirpGain.gain.linearRampToValueAtTime(0.03, t + 0.04);
        chirpGain.gain.linearRampToValueAtTime(0.05, t + 0.06);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(chirpGain);
        chirpGain.connect(gain);
        osc.start(t);
        osc.stop(t + 0.15);
      }

      const nextDelay = 2000 + Math.random() * 4000;
      timers.push(window.setTimeout(scheduleChirp, nextDelay));
    };

    // 첫 chirp 약간 딜레이
    timers.push(window.setTimeout(scheduleChirp, 1000 + Math.random() * 2000));

    return {
      gainNode: gain,
      nodes: [gain],
      timers,
      cleanup: () => {
        active = false;
        timers.forEach(t => clearTimeout(t));
        gain.disconnect();
      },
    };
  }

  /* ── 파도 (Ocean) ── */
  private createOcean(volume: number): SoundLayer {
    const ctx = this.ctx!;
    const buffer = createWhiteNoiseBuffer(ctx, 3);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 600;
    lowpass.Q.value = 1.0;

    // 파도 리듬 LFO (볼륨)
    const waveLfo = ctx.createOscillator();
    waveLfo.type = 'sine';
    waveLfo.frequency.value = 0.12;
    const waveLfoGain = ctx.createGain();
    waveLfoGain.gain.value = volume * 0.6;

    // 필터 주파수도 동시 모듈레이션 (파도가 칠 때 고주파 증가)
    const filterLfo = ctx.createOscillator();
    filterLfo.type = 'sine';
    filterLfo.frequency.value = 0.12;
    const filterLfoGain = ctx.createGain();
    filterLfoGain.gain.value = 400;

    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(lowpass.frequency);

    const gain = ctx.createGain();
    gain.gain.value = 0;

    waveLfo.connect(waveLfoGain);
    waveLfoGain.connect(gain.gain);

    source.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain!);

    source.start();
    waveLfo.start();
    filterLfo.start();

    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);

    return {
      gainNode: gain,
      nodes: [source, lowpass, waveLfo, waveLfoGain, filterLfo, filterLfoGain, gain],
      timers: [],
      cleanup: () => {
        try { source.stop(); } catch { /* ignore */ }
        try { waveLfo.stop(); } catch { /* ignore */ }
        try { filterLfo.stop(); } catch { /* ignore */ }
        source.disconnect();
        lowpass.disconnect();
        waveLfo.disconnect();
        waveLfoGain.disconnect();
        filterLfo.disconnect();
        filterLfoGain.disconnect();
        gain.disconnect();
      },
    };
  }

  /* ── 럼블 (Rumble - 화산) ── */
  private createRumble(volume: number): SoundLayer {
    const ctx = this.ctx!;
    const buffer = createWhiteNoiseBuffer(ctx, 3);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 150;
    lowpass.Q.value = 2.0;

    // WaveShaper: tanh 디스토션으로 그릿 추가
    const waveshaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = Math.tanh(x * 2);
    }
    waveshaper.curve = curve;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(lowpass);
    lowpass.connect(waveshaper);
    waveshaper.connect(gain);
    gain.connect(this.masterGain!);

    source.start();
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5);

    return {
      gainNode: gain,
      nodes: [source, lowpass, waveshaper, gain],
      timers: [],
      cleanup: () => {
        try { source.stop(); } catch { /* ignore */ }
        source.disconnect();
        lowpass.disconnect();
        waveshaper.disconnect();
        gain.disconnect();
      },
    };
  }

  /* ── 스팀 (Steam hiss - 고강도 화산) ── */
  private createSteam(volume: number): SoundLayer {
    const ctx = this.ctx!;
    const buffer = createWhiteNoiseBuffer(ctx, 2);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 3000;
    highpass.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.masterGain!);

    source.start();
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.3);

    // 크래클링: 랜덤 gain 미세 변동
    const timers: number[] = [];
    let active = true;
    const crackle = () => {
      if (!active || !this.ctx || ctx.state === 'closed') return;
      const now = ctx.currentTime;
      for (let i = 0; i < 10; i++) {
        const t = now + i * 0.05;
        const v = volume * (0.6 + Math.random() * 0.4);
        gain.gain.setValueAtTime(v, t);
      }
      timers.push(window.setTimeout(crackle, 500));
    };
    timers.push(window.setTimeout(crackle, 200));

    return {
      gainNode: gain,
      nodes: [source, highpass, gain],
      timers,
      cleanup: () => {
        active = false;
        timers.forEach(t => clearTimeout(t));
        try { source.stop(); } catch { /* ignore */ }
        source.disconnect();
        highpass.disconnect();
        gain.disconnect();
      },
    };
  }

  /* ── 물방울 OneShot ── */
  private playWaterDrop(): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 1200, now);
    osc.frequency.exponentialRampToValueAtTime(300 + Math.random() * 200, now + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 0.1);
  }
}

/* ── 싱글턴 인스턴스 ── */
export const ambientSound = new AmbientSound();
