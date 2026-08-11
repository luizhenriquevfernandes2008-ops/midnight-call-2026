// audio.js — som inteiramente sintetizado em WebAudio, mais o carregador
// da narracao gravada.
//
// Por que sintetizado: nao existe nenhum arquivo de audio no projeto ainda,
// e chuva/passo/soco/porta sao exatamente o tipo de som que ruido filtrado
// faz bem. Quando entrarem samples de verdade, o resto do jogo nao muda —
// so as funcoes daqui.
//
// O contexto so nasce depois do primeiro toque de tecla: navegador bloqueia
// audio antes de interacao do usuario.

const CANDIDATE_NARRATION = [
  'assets/audio/narrator.mp3',
  'assets/audio/narrator.wav',
  'assets/audio/narrator.ogg',
  'assets/audio/narrator.m4a',
  'assets/audio/narracao.mp3',
  'assets/audio/narrador.mp3',
  'assets/audio/intro.mp3',
  'assets/audio/intro.wav',
];

// A narracao gravada e MUITO mais baixa que o som sintetizado do jogo
// (pico em -14 dBFS, media em -41 dBFS). Sem amplificar, ela some embaixo
// da chuva. O ganho abaixo e aplicado dentro do WebAudio — o volume de um
// elemento <audio> nao passa de 1.0, entao nao daria para levantar por la.
const GANHO_VOZ = 4.0;

class Audio {
  constructor() {
    this.ready = false;
    this.vol = { master: 0.8, music: 0.55, sfx: 0.85, voice: 1.0 };
    this.loops = {};
    this.narration = null;
    this.narrationEl = null;
    this.narrChain = null;
    this.sfxDuck = 1;          // 1 = normal, <1 = abafado para a voz passar
    this.musicOn = false;
    this._nextNote = 0;
    this._step = 0;
  }

  ensure() {
    if (this.ready) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    this.ctx = new AC();
    const c = this.ctx;

    this.master = c.createGain();
    this.master.gain.value = this.vol.master;
    this.master.connect(c.destination);

    this.busMusic = c.createGain(); this.busMusic.gain.value = this.vol.music;
    this.busSfx   = c.createGain(); this.busSfx.gain.value = this.vol.sfx;
    this.busVoice = c.createGain(); this.busVoice.gain.value = this.vol.voice;

    // No de abafamento SEPARADO do volume dos efeitos. Se os dois mexessem
    // no mesmo parametro, a rampa do duck e a atribuicao do controle de
    // volume brigariam — uma cancela a outra dependendo da ordem.
    this.duckSfxNode = c.createGain();
    this.duckSfxNode.gain.value = this.sfxDuck;

    this.busMusic.connect(this.master);
    this.busSfx.connect(this.duckSfxNode);
    this.duckSfxNode.connect(this.master);
    this.busVoice.connect(this.master);

    // reverb: impulso sintetico (ruido com decaimento exponencial)
    this.verb = c.createConvolver();
    this.verb.buffer = this._impulse(2.6, 2.4);
    this.verbGain = c.createGain(); this.verbGain.gain.value = 0.34;
    this.verb.connect(this.verbGain);
    this.verbGain.connect(this.master);

    this.noiseBuf = this._noise(4);
    this.ready = true;

    if (c.state === 'suspended') c.resume();
    return true;
  }

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  setVolumes(v) {
    Object.assign(this.vol, v);
    if (!this.ready) return;
    this.master.gain.value = this.vol.master;
    this.busMusic.gain.value = this.vol.music;
    this.busSfx.gain.value = this.vol.sfx;   // o duck vive no proprio no
    this.busVoice.gain.value = this.vol.voice;
    // Se a voz passa pelo WebAudio, quem manda no volume dela e o busVoice.
    // Mexer no .volume do elemento aqui aplicaria o corte duas vezes.
    if (this.narrationEl && !this.narrChain) {
      this.narrationEl.volume = Math.min(1, this.vol.master * this.vol.voice);
    }
  }

  // Abaixa os efeitos para a voz passar por cima. k = 1 volta ao normal.
  duckSfx(k, ramp = 0.8) {
    this.sfxDuck = k;
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const g = this.duckSfxNode.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(Math.max(0.0001, k), t + ramp);
  }

  _impulse(dur, decay) {
    const c = this.ctx, n = Math.floor(c.sampleRate * dur);
    const b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < n; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
      }
    }
    return b;
  }

  _noise(sec) {
    const c = this.ctx, n = Math.floor(c.sampleRate * sec);
    const b = c.createBuffer(1, n, c.sampleRate);
    const d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;   // ruido rosa/marrom de pobre
      d[i] = last * 3.2;
    }
    return b;
  }

  _env(node, t0, a, d, peak, bus) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    node.connect(g);
    g.connect(bus || this.busSfx);
    return g;
  }

  // ---------------- efeitos pontuais ----------------

  step(wet = true, vol = 1, material = null) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    material = material || (wet ? 'wet' : 'concrete');
    const mat = {
      wet:      { freq: 1120, q: 1.0, rate: 0.92, dur: 0.14, body: 112 },
      metal:    { freq: 2450, q: 5.8, rate: 1.34, dur: 0.11, body: 145 },
      ice:      { freq: 1780, q: 4.2, rate: 1.18, dur: 0.10, body: 132 },
      tile:     { freq: 1320, q: 3.5, rate: 1.08, dur: 0.09, body: 126 },
      wood:     { freq: 620,  q: 2.4, rate: 0.74, dur: 0.13, body: 96 },
      concrete: { freq: 430,  q: 2.2, rate: 0.82, dur: 0.09, body: 116 },
    }[material] || { freq: 430, q: 2.2, rate: 0.82, dur: 0.09, body: 116 };
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = mat.rate + Math.random() * 0.18;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = mat.freq + Math.random() * (material === 'metal' ? 620 : 240);
    f.Q.value = mat.q;
    src.connect(f);
    this._env(f, t, 0.004, mat.dur, (material === 'metal' ? 0.22 : 0.18) * vol);
    src.start(t, Math.random() * 3, 0.2);
    src.stop(t + 0.24);

    // corpo grave do pe no chao
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(mat.body, t);
    o.frequency.exponentialRampToValueAtTime(52, t + 0.09);
    this._env(o, t, 0.003, 0.09, 0.10 * vol);
    o.start(t); o.stop(t + 0.14);
  }

  whoosh(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 1.6;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(2200, t + 0.16);
    src.connect(f);
    this._env(f, t, 0.02, 0.18, 0.16 * vol);
    src.start(t, Math.random() * 3, 0.4); src.stop(t + 0.4);
  }

  punchHit(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    this._env(o, t, 0.002, 0.16, 0.5 * vol);
    o.start(t); o.stop(t + 0.2);
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 1400;
    src.connect(f);
    this._env(f, t, 0.002, 0.09, 0.3 * vol);
    src.start(t, Math.random() * 3, 0.2); src.stop(t + 0.2);
  }

  doorCreak(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = 0.4;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 14;
    f.frequency.setValueAtTime(420, t);
    f.frequency.linearRampToValueAtTime(760, t + 0.5);
    f.frequency.linearRampToValueAtTime(610, t + 1.0);
    src.connect(f);
    const g = this._env(f, t, 0.08, 1.0, 0.22 * vol);
    g.connect(this.verb);
    src.start(t, Math.random() * 2, 1.4); src.stop(t + 1.4);
  }

  doorSlam(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    const g = this._env(o, t, 0.002, 0.3, 0.45 * vol);
    g.connect(this.verb);
    o.start(t); o.stop(t + 0.4);
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 900;
    src.connect(f);
    this._env(f, t, 0.002, 0.14, 0.28 * vol);
    src.start(t, Math.random() * 3, 0.3); src.stop(t + 0.3);
  }

  lighterFlick(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    for (let i = 0; i < 2; i++) {
      const src = c.createBufferSource();
      src.buffer = this.noiseBuf;
      const f = c.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 3200;
      src.connect(f);
      this._env(f, t + i * 0.055, 0.001, 0.035, 0.22 * vol);
      src.start(t + i * 0.055, Math.random() * 3, 0.06);
      src.stop(t + i * 0.055 + 0.07);
    }
  }

  flameWhoosh(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(380, t + 0.35);
    src.connect(f);
    this._env(f, t, 0.03, 0.4, 0.12 * vol);
    src.start(t, Math.random() * 3, 0.6); src.stop(t + 0.6);
  }

  // Vidro de janela estourando pelo calor. Nao e o vidro de garrafa do bar:
  // e uma chapa grande cedendo de uma vez, entao tem um estalo grave por
  // baixo dos caquinhos. Os cacos sao seis toques agudos espalhados em 300ms
  // — vidro nao cai todo no mesmo instante.
  glassBreak(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = 1.6;
    const f = c.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 2600;
    src.connect(f);
    const g = this._env(f, t, 0.002, 0.5, 0.20 * vol);
    g.connect(this.verb);
    src.start(t, Math.random() * 3, 0.6); src.stop(t + 0.6);

    // a chapa cedendo
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.18);
    this._env(o, t, 0.002, 0.2, 0.13 * vol);
    o.start(t); o.stop(t + 0.25);

    // os cacos, espalhados
    for (let i = 0; i < 6; i++) {
      const dt2 = 0.04 + Math.random() * 0.3;
      const p = c.createOscillator();
      p.type = 'sine';
      p.frequency.value = 2600 + Math.random() * 2600;
      const pg = this._env(p, t + dt2, 0.001, 0.05 + Math.random() * 0.05, 0.05 * vol);
      pg.connect(this.verb);
      p.start(t + dt2); p.stop(t + dt2 + 0.14);
    }
  }

  // Madeira estourando dentro do fogo. Serve de pontuacao por cima do loop:
  // fogo constante vira chuveiro depois de dez segundos, e o que faz o
  // ouvido continuar acreditando sao os estalos irregulares.
  fireCrack(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
      const dt2 = Math.random() * 0.22;
      const src = c.createBufferSource();
      src.buffer = this.noiseBuf;
      src.playbackRate.value = 0.7 + Math.random() * 1.4;
      const f = c.createBiquadFilter();
      f.type = 'bandpass'; f.Q.value = 4 + Math.random() * 6;
      f.frequency.value = 500 + Math.random() * 2200;
      src.connect(f);
      const g = this._env(f, t + dt2, 0.001, 0.05 + Math.random() * 0.07, 0.16 * vol);
      g.connect(this.verb);
      src.start(t + dt2, Math.random() * 3, 0.2); src.stop(t + dt2 + 0.2);
    }
  }

  // O BAQUE DO FOGO PEGANDO A CASA INTEIRA. Uma coisa so, grave, com um
  // sopro por cima. E o instante em que a noite dele acaba, e ele nao ve
  // nada disso: esta de costas, no telefone.
  fireBurst(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = 0.42;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(180, t + 1.4);
    src.connect(f);
    const g = this._env(f, t, 0.03, 1.6, 0.34 * vol);
    g.connect(this.verb);
    src.start(t, Math.random() * 2, 2); src.stop(t + 2);
    this.flameWhoosh(1.2 * vol);
  }

  thunder(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime + Math.random() * 0.2;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = 0.32;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(320, t);
    f.frequency.exponentialRampToValueAtTime(90, t + 2.4);
    src.connect(f);
    const g = this._env(f, t, 0.25, 2.6, 0.30 * vol);
    g.connect(this.verb);
    src.start(t, Math.random() * 2, 3.2); src.stop(t + 3.2);
  }

  carPassBy(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = 0.6;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 0.9;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(1400, t + 0.7);
    f.frequency.exponentialRampToValueAtTime(260, t + 1.6);
    src.connect(f);
    this._env(f, t, 0.5, 1.4, 0.14 * vol);
    src.start(t, Math.random() * 2, 2.2); src.stop(t + 2.2);
  }

  // Tiro: estalo curto e agudo, corpo grave, e uma cauda de eco jogada no
  // reverb. Sem a cauda soa a estouro de balao; com ela soa a beco.
  gunshot(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;

    const estalo = c.createBufferSource();
    estalo.buffer = this.noiseBuf;
    estalo.playbackRate.value = 1.6;
    const hp = c.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 1400;
    estalo.connect(hp);
    this._env(hp, t, 0.001, 0.10, 0.55 * vol);
    estalo.start(t, Math.random() * 3, 0.2); estalo.stop(t + 0.2);

    const corpo = c.createBufferSource();
    corpo.buffer = this.noiseBuf;
    corpo.playbackRate.value = 0.5;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1800, t);
    lp.frequency.exponentialRampToValueAtTime(200, t + 0.25);
    corpo.connect(lp);
    const g1 = this._env(lp, t, 0.001, 0.28, 0.5 * vol);
    g1.connect(this.verb);
    corpo.start(t, Math.random() * 3, 0.5); corpo.stop(t + 0.5);

    const soco = c.createOscillator();
    soco.type = 'sine';
    soco.frequency.setValueAtTime(220, t);
    soco.frequency.exponentialRampToValueAtTime(40, t + 0.16);
    this._env(soco, t, 0.001, 0.2, 0.55 * vol);
    soco.start(t); soco.stop(t + 0.25);

    // cauda batendo nas paredes
    const cauda = c.createBufferSource();
    cauda.buffer = this.noiseBuf;
    cauda.playbackRate.value = 0.8;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 1.2; bp.frequency.value = 900;
    cauda.connect(bp);
    const g2 = this._env(bp, t + 0.04, 0.05, 0.9, 0.16 * vol);
    g2.connect(this.verb);
    cauda.start(t + 0.04, Math.random() * 2, 1.2); cauda.stop(t + 1.2);
  }

  dryClick() {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 9; f.frequency.value = 2600;
    s.connect(f);
    this._env(f, t, 0.001, 0.035, 0.20);
    s.start(t, Math.random() * 3, 0.06); s.stop(t + 0.08);
  }

  // couro e metal: sacar, guardar, recarregar
  leather(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.playbackRate.value = 0.9;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 1.4;
    f.frequency.setValueAtTime(500, t);
    f.frequency.exponentialRampToValueAtTime(1500, t + 0.14);
    s.connect(f);
    this._env(f, t, 0.006, 0.16, 0.13 * vol);
    s.start(t, Math.random() * 3, 0.3); s.stop(t + 0.3);
  }

  reloadClick(pitch = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 12; f.frequency.value = 1800 * pitch;
    s.connect(f);
    this._env(f, t, 0.001, 0.05, 0.16);
    s.start(t, Math.random() * 3, 0.08); s.stop(t + 0.1);
  }

  // ---------------- tensao ----------------
  // Duas serras desafinadas uma contra a outra (o batimento entre elas e o
  // que incomoda), um sopro agudo por cima e um filtro que vai abrindo.
  // Tudo controlado por um numero so: 0 = longe, 1 = em cima de voce.

  startDread() {
    if (!this.ensure()) return;
    if (this.dread) return;
    const c = this.ctx, t = c.currentTime;

    const saida = c.createGain();
    saida.gain.setValueAtTime(0.0001, t);
    saida.connect(this.busMusic);

    const filtro = c.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(240, t);
    filtro.Q.value = 3;
    filtro.connect(saida);

    const a = c.createOscillator(); a.type = 'sawtooth'; a.frequency.value = 41.2;
    const b = c.createOscillator(); b.type = 'sawtooth'; b.frequency.value = 42.1;
    const ga = c.createGain(); ga.gain.value = 0.5;
    a.connect(ga); b.connect(ga); ga.connect(filtro);
    a.start(t); b.start(t);

    // sopro agudo, quase inaudivel no comeco
    const ar = c.createBufferSource();
    ar.buffer = this.noiseBuf; ar.loop = true; ar.playbackRate.value = 1.4;
    const af = c.createBiquadFilter();
    af.type = 'bandpass'; af.Q.value = 2.2; af.frequency.value = 3200;
    const ag = c.createGain(); ag.gain.value = 0.0;
    ar.connect(af); af.connect(ag); ag.connect(saida);
    ar.start(t);

    this.dread = { saida, filtro, a, b, ar, ag };
    this.setDread(0);
  }

  setDread(k) {
    const d = this.dread;
    if (!d || !this.ready) return;
    const t = this.ctx.currentTime, r = 0.25;
    const ramp = (p, v) => {
      p.cancelScheduledValues(t); p.setValueAtTime(p.value, t);
      p.linearRampToValueAtTime(Math.max(0.0001, v), t + r);
    };
    ramp(d.saida.gain, 0.05 + k * 0.42);
    ramp(d.filtro.frequency, 240 + k * k * 1500);
    ramp(d.ag.gain, k * k * 0.05);
    // as duas serras se afastam: quanto mais perto, mais aspero o batimento
    ramp(d.b.frequency, 42.1 + k * 3.4);
  }

  // corte seco: e o silencio subito que da o susto, nao o barulho
  stopDread(fade = 0) {
    const d = this.dread;
    if (!d) return;
    const t = this.ctx.currentTime;
    d.saida.gain.cancelScheduledValues(t);
    d.saida.gain.setValueAtTime(d.saida.gain.value, t);
    d.saida.gain.linearRampToValueAtTime(0.0001, t + Math.max(0.008, fade));
    const stop = t + Math.max(0.02, fade) + 0.05;
    try { d.a.stop(stop); d.b.stop(stop); d.ar.stop(stop); } catch (e) {}
    this.dread = null;
  }

  heartbeat(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    for (let i = 0; i < 2; i++) {
      const o = c.createOscillator();
      o.type = 'sine';
      const t0 = t + i * 0.17;
      o.frequency.setValueAtTime(64, t0);
      o.frequency.exponentialRampToValueAtTime(30, t0 + 0.14);
      this._env(o, t0, 0.006, 0.16, (i ? 0.28 : 0.42) * vol, this.busMusic);
      o.start(t0); o.stop(t0 + 0.24);
    }
  }

  // pancada surda na nuca
  thud(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(28, t + 0.22);
    const g = this._env(o, t, 0.001, 0.34, 0.8 * vol);
    g.connect(this.verb);
    o.start(t); o.stop(t + 0.45);
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 700;
    s.connect(f);
    this._env(f, t, 0.001, 0.16, 0.5 * vol);
    s.start(t, Math.random() * 3, 0.3); s.stop(t + 0.3);
  }

  // zumbido de ouvido depois da pancada
  tinnitus(dur = 3) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine'; o.frequency.value = 3100;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.15);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.2);
  }

  // ---------------- sons pontuais de ambiente ----------------
  // Sao estes, e nao um loop, que dizem em que lugar voce esta: uma gota
  // que cai a cada oito segundos num galpao vazio conta mais do que
  // qualquer textura de fundo.

  drip(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(900 + Math.random() * 500, t);
    o.frequency.exponentialRampToValueAtTime(260, t + 0.09);
    const g = this._env(o, t, 0.001, 0.12, 0.12 * vol);
    g.connect(this.verb);
    o.start(t); o.stop(t + 0.2);
  }

  metalCreak(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.playbackRate.value = 0.3;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 22;
    const base = 300 + Math.random() * 500;
    f.frequency.setValueAtTime(base, t);
    f.frequency.linearRampToValueAtTime(base * 1.5, t + 0.9);
    f.frequency.linearRampToValueAtTime(base * 1.2, t + 1.8);
    s.connect(f);
    const g = this._env(f, t, 0.3, 1.6, 0.10 * vol);
    g.connect(this.verb);
    s.start(t, Math.random() * 2, 2.2); s.stop(t + 2.2);
  }

  chainRattle(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    for (let i = 0; i < 5; i++) {
      const s = c.createBufferSource();
      s.buffer = this.noiseBuf;
      const f = c.createBiquadFilter();
      f.type = 'bandpass'; f.Q.value = 16;
      f.frequency.value = 2200 + Math.random() * 1800;
      s.connect(f);
      const g = this._env(f, t + i * 0.045 * (0.6 + Math.random()), 0.001, 0.05, 0.07 * vol);
      g.connect(this.verb);
      s.start(t + i * 0.05, Math.random() * 3, 0.1); s.stop(t + i * 0.05 + 0.12);
    }
  }

  // longe, do lado de fora, alguem fechando alguma coisa pesada
  distantThump(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(34, t + 0.3);
    const g = this._env(o, t, 0.01, 0.4, 0.16 * vol);
    g.connect(this.verb);
    o.start(t); o.stop(t + 0.5);
  }

  // cano velho arrebentando: metal cedendo e depois agua com pressao
  pipeBurst(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 8;
    f.frequency.setValueAtTime(1600, t);
    f.frequency.exponentialRampToValueAtTime(420, t + 0.25);
    s.connect(f);
    const g = this._env(f, t, 0.002, 0.3, 0.4 * vol);
    g.connect(this.verb);
    s.start(t, Math.random() * 3, 0.5); s.stop(t + 0.5);
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.2);
    this._env(o, t, 0.001, 0.25, 0.4 * vol);
    o.start(t); o.stop(t + 0.35);
    // jato de agua depois
    const j = c.createBufferSource();
    j.buffer = this.noiseBuf;
    const jf = c.createBiquadFilter();
    jf.type = 'highpass'; jf.frequency.value = 2200;
    j.connect(jf);
    this._env(jf, t + 0.1, 0.15, 1.4, 0.13 * vol);
    j.start(t + 0.1, Math.random() * 2, 1.8); j.stop(t + 1.8);
  }

  // esforco: puxar, forcar, arrebentar
  strain(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.playbackRate.value = 0.35;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 12;
    f.frequency.setValueAtTime(420 + Math.random() * 200, t);
    f.frequency.linearRampToValueAtTime(700, t + 0.3);
    s.connect(f);
    this._env(f, t, 0.03, 0.34, 0.13 * vol);
    s.start(t, Math.random() * 2, 0.5); s.stop(t + 0.5);
  }

  // ---------------- Capitulo 2 ----------------

  // Ripa de palete acertando um corpo. E mais SECO e mais grave que o soco:
  // madeira nao estala como osso, ela bate e para.
  clubHit(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(34, t + 0.15);
    this._env(o, t, 0.001, 0.2, 0.55 * vol);
    o.start(t); o.stop(t + 0.25);
    // o estalo curto da madeira por cima
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 3; f.frequency.value = 900 + Math.random() * 400;
    s.connect(f);
    const g = this._env(f, t, 0.001, 0.07, 0.34 * vol);
    g.connect(this.verb);
    s.start(t, Math.random() * 3, 0.2); s.stop(t + 0.2);
  }

  // A ripa se partindo. Dois estalos, o segundo mais grave: e assim que
  // madeira racha — nunca de uma vez.
  clubBreak(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    for (const [dt, fq, pk] of [[0, 1700, 0.32], [0.05, 760, 0.4]]) {
      const s = c.createBufferSource();
      s.buffer = this.noiseBuf;
      const f = c.createBiquadFilter();
      f.type = 'bandpass'; f.Q.value = 6; f.frequency.value = fq;
      s.connect(f);
      const g = this._env(f, t + dt, 0.001, 0.13, pk * vol);
      g.connect(this.verb);
      s.start(t + dt, Math.random() * 3, 0.25); s.stop(t + dt + 0.25);
    }
  }

  // Telefone velho de campainha. Duas badaladas curtas, marteladas contra o
  // sino — e o som que o Ecoador traz consigo, e ele nao devia existir.
  phoneRing(vol = 1, longe = 0) {
    if (!this.ensure()) return;
    const c = this.ctx, t0 = c.currentTime;
    const corte = c.createBiquadFilter();
    corte.type = 'lowpass';
    corte.frequency.value = 5200 - longe * 4000;   // longe = abafado
    corte.connect(this.busSfx);
    const eco = c.createGain(); eco.gain.value = 0.5 + longe * 0.6;
    corte.connect(eco); eco.connect(this.verb);
    for (let r = 0; r < 2; r++) {
      const base = t0 + r * 0.42;
      for (let i = 0; i < 9; i++) {
        const t = base + i * 0.024;
        for (const fq of [1080, 1330]) {
          const o = c.createOscillator();
          o.type = 'sine';
          o.frequency.value = fq * (1 + (Math.random() - 0.5) * 0.01);
          const g = c.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.09 * vol, t + 0.004);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
          o.connect(g); g.connect(corte);
          o.start(t); o.stop(t + 0.16);
        }
      }
    }
  }

  // Cochicho: nao e palavra nenhuma, e ruido de banda estreita passeando na
  // faixa da voz humana. A cabeca do jogador completa o resto sozinha.
  whisper(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.playbackRate.value = 0.7 + Math.random() * 0.5;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 9;
    const f0 = 700 + Math.random() * 900;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.linearRampToValueAtTime(f0 * (0.6 + Math.random() * 0.8), t + 0.8);
    s.connect(f);
    const g = this._env(f, t, 0.18, 0.9, 0.075 * vol);
    g.connect(this.verb);
    s.start(t, Math.random() * 3, 1.3); s.stop(t + 1.3);
  }

  // O GRITO. Vem de dentro da casa, com ele de costas, no telefone.
  //
  // Nao e um efeito de terror: e uma voz. Duas serras desafinadas fazendo as
  // formantes de uma garganta, com um vibrato irregular por cima e um corte
  // de passa-baixa que simula a parede entre os dois. ABAFADO de proposito —
  // som limpo aqui viraria filme, e o ponto e que ele esta do lado de fora.
  //
  // Nada disso e mostrado na tela. Se o jogador vir, vira cena de morte.
  // ⚠ REFEITO na sessao 22. A primeira versao eram tres serras graves com
  // vibrato debaixo de um passa-baixa de 800 Hz — e isso nao e um grito, e
  // um mugido. Grito de gente tem quatro coisas que faltavam ali:
  //
  //   1. FUNDAMENTAL ALTA. Garganta gritando sai entre 600 e 1000 Hz, nao
  //      em 420. Grave le como dor surda, agudo le como panico.
  //   2. FORMANTES. A boca e um filtro com dois ou tres picos fixos. Sem
  //      eles qualquer oscilador soa a sintetizador, nao a pessoa.
  //   3. ROUQUIDAO. Voz no limite distorce. Um pouco de ruido dentro do
  //      tom e o que separa "cantando alto" de "gritando".
  //   4. A QUEBRA. Ninguem segura um grito ate o fim: a voz falha, despenca
  //      de altura e vira ar. E o detalhe que faz doer.
  //
  // A parede continua existindo, mas subiu para 1,6 kHz: abafado demais e o
  // ouvido para de reconhecer voz, e o ponto e justamente reconhecer.
  scream(vol = 1) {
    // Se existir gravacao, ela ganha: garganta humana nao se sintetiza.
    if (this.gritoArquivo(0.55 * vol)) return;
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const dur = 1.5 + Math.random() * 0.6;
    const quebra = dur * (0.62 + Math.random() * 0.12);   // onde a voz falha
    const mix = c.createGain();
    mix.gain.value = 1;

    // ---- a parede entre ele e o que esta acontecendo ----
    const parede = c.createBiquadFilter();
    parede.type = 'lowpass';
    parede.frequency.setValueAtTime(1650, t);
    parede.frequency.linearRampToValueAtTime(1150, t + dur);
    parede.Q.value = 0.6;

    // ---- a fonte: dente-de-serra com ruido por dentro (rouquidao) ----
    const base = 620 + Math.random() * 220;
    const fonte = c.createGain();

    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(base * 0.72, t);
    o.frequency.exponentialRampToValueAtTime(base * 1.12, t + 0.13);   // sobe rapido
    o.frequency.setValueAtTime(base * 1.12, t + quebra * 0.7);
    o.frequency.exponentialRampToValueAtTime(base * 0.42, t + quebra + 0.16);  // QUEBRA
    o.frequency.exponentialRampToValueAtTime(base * 0.3, t + dur);
    // vibrato irregular e fundo: garganta no limite nao segura nota
    const lfo = c.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 6.5 + Math.random() * 3.5;
    const lg = c.createGain(); lg.gain.value = base * 0.06;
    lfo.connect(lg); lg.connect(o.frequency);
    lfo.start(t); lfo.stop(t + dur + 0.1);
    o.connect(fonte);
    o.start(t); o.stop(t + dur + 0.1);

    // a rouquidao: ruido somado ao tom, nao ao lado dele
    const rouco = c.createBufferSource();
    rouco.buffer = this.noiseBuf;
    rouco.playbackRate.value = 1.6;
    const rf = c.createBiquadFilter();
    rf.type = 'bandpass'; rf.Q.value = 1.1; rf.frequency.value = base * 1.8;
    const rg = c.createGain();
    rg.gain.setValueAtTime(0.0001, t);
    rg.gain.linearRampToValueAtTime(0.5, t + 0.1);
    rg.gain.linearRampToValueAtTime(1.5, t + quebra);       // ao quebrar vira ar
    rg.gain.linearRampToValueAtTime(0.4, t + dur);
    rouco.connect(rf); rf.connect(rg); rg.connect(fonte);
    rouco.start(t, Math.random() * 2, dur + 0.2); rouco.stop(t + dur + 0.2);

    // ---- as formantes: e isto que faz o ouvido ouvir uma BOCA ----
    for (const [f0, q, amp] of [[900, 7, 1], [1480, 9, 0.62], [2600, 11, 0.3]]) {
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(f0, t);
      bp.frequency.linearRampToValueAtTime(f0 * 0.82, t + dur);   // a boca fecha
      bp.Q.value = q;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16 * amp * vol, t + 0.015);   // ataque seco
      g.gain.setValueAtTime(0.16 * amp * vol, t + quebra);
      g.gain.exponentialRampToValueAtTime(0.045 * amp * vol, t + quebra + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      fonte.connect(bp); bp.connect(g); g.connect(mix);
    }

    mix.connect(parede);
    parede.connect(this.busSfx);
    // uma copia na reverb, para o som ter a casa em volta dele
    const vg = c.createGain(); vg.gain.value = 0.6;
    parede.connect(vg); vg.connect(this.verb);
  }

  // Caneta no papel. Rabiscos curtos e irregulares — som de mao escrevendo,
  // nao de maquina de escrever.
  writing(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.playbackRate.value = 2.4 + Math.random();
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 2.4;
    f.frequency.value = 2600 + Math.random() * 1600;
    s.connect(f);
    this._env(f, t, 0.006, 0.05 + Math.random() * 0.05, 0.05 * vol);
    s.start(t, Math.random() * 3, 0.14); s.stop(t + 0.14);
  }

  pageTurn(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.playbackRate.value = 1.6;
    const f = c.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 1800;
    s.connect(f);
    this._env(f, t, 0.02, 0.16, 0.09 * vol);
    s.start(t, Math.random() * 3, 0.25); s.stop(t + 0.25);
  }

  // Todas as maquinas ligando ao mesmo tempo. Um baque de partida, e um
  // zumbido que fica. E o preco da pistola.
  machineStart(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(24, t);
    o.frequency.exponentialRampToValueAtTime(58, t + 1.2);
    const f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 320;
    o.connect(f);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.28 * vol, t + 0.5);
    g.gain.setValueAtTime(0.28 * vol, t + 2.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
    f.connect(g); g.connect(this.busSfx);
    o.start(t); o.stop(t + 3.8);
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const sf = c.createBiquadFilter();
    sf.type = 'lowpass'; sf.frequency.value = 1100;
    s.connect(sf);
    const sg = this._env(sf, t, 0.01, 0.9, 0.3 * vol);
    sg.connect(this.verb);
    s.start(t, Math.random() * 2, 1.2); s.stop(t + 1.2);
  }

  // Cano de metal raspando o chao. O jogador precisa ouvir isto ANTES de
  // ver o Credor — e a regra de ouro da perseguicao.
  dragMetal(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.playbackRate.value = 1.1;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 5;
    f.frequency.setValueAtTime(1300 + Math.random() * 500, t);
    f.frequency.linearRampToValueAtTime(2400, t + 0.4);
    s.connect(f);
    const g = this._env(f, t, 0.06, 0.5, 0.14 * vol);
    g.connect(this.verb);
    s.start(t, Math.random() * 3, 0.7); s.stop(t + 0.7);
  }

  // Porta de armario de vestiario. E o som de ser PROCURADO.
  lockerBang(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 2; f.frequency.value = 520;
    s.connect(f);
    const g = this._env(f, t, 0.001, 0.32, 0.4 * vol);
    g.connect(this.verb);
    s.start(t, Math.random() * 3, 0.5); s.stop(t + 0.5);
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.2);
    this._env(o, t, 0.001, 0.24, 0.22 * vol);
    o.start(t); o.stop(t + 0.3);
  }

  // Respiracao. `presa` sobe o filtro e encurta tudo: e o ar saindo pelo
  // nariz de quem esta com a boca fechada e nao pode fazer barulho.
  breath(vol = 1, presa = false) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.playbackRate.value = presa ? 1.4 : 0.9;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = presa ? 6 : 2.2;
    f.frequency.value = presa ? 900 : 520;
    s.connect(f);
    this._env(f, t, presa ? 0.05 : 0.14, presa ? 0.18 : 0.5, 0.1 * vol);
    s.start(t, Math.random() * 3, 0.8); s.stop(t + 0.8);
  }

  uiMove() {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(380, t + 0.06);
    this._env(o, t, 0.002, 0.07, 0.10);
    o.start(t); o.stop(t + 0.1);
  }

  uiConfirm() {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(600, t + 0.1);
    const g = this._env(o, t, 0.004, 0.24, 0.13);
    g.connect(this.verb);
    o.start(t); o.stop(t + 0.3);
  }

  uiBack() {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(420, t);
    o.frequency.exponentialRampToValueAtTime(190, t + 0.13);
    this._env(o, t, 0.004, 0.16, 0.11);
    o.start(t); o.stop(t + 0.2);
  }

  blip(pitch = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'square';
    o.frequency.value = 780 * pitch;
    this._env(o, t, 0.001, 0.022, 0.028);
    o.start(t); o.stop(t + 0.04);
  }

  // O rádio não toca uma gravação limpa: três vozes humanas achatadas em
  // frequências diferentes, enterradas em chiado. Reconhecível como grito,
  // mas impossível de entender como frase.
  radioScreams(vol = 1) {
    if (!this.ensure()) return;
    const c = this.ctx, t = c.currentTime;
    const noise = c.createBufferSource(); noise.buffer = this.noiseBuf;
    const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1800; nf.Q.value = 1.4;
    const ng = c.createGain(); ng.gain.setValueAtTime(0.0001, t);
    ng.gain.linearRampToValueAtTime(0.2 * vol, t + 0.08); ng.gain.exponentialRampToValueAtTime(0.0001, t + 2.7);
    noise.connect(nf); nf.connect(ng); ng.connect(this.verb); noise.start(t); noise.stop(t + 2.8);
    for (let i = 0; i < 3; i++) {
      const o = c.createOscillator(); o.type = i === 1 ? 'sawtooth' : 'triangle';
      o.frequency.setValueAtTime(520 + i * 170, t + i * 0.28);
      o.frequency.exponentialRampToValueAtTime(135 + i * 35, t + 1.5 + i * 0.25);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.055 * vol, t + 0.1 + i * 0.28);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8 + i * 0.25);
      o.connect(g); g.connect(this.verb); o.start(t); o.stop(t + 2.2 + i * 0.25);
    }
  }

  // ---------------- ambientes em loop ----------------

  startLoop(name, opt) {
    if (!this.ensure()) return;
    if (this.loops[name]) return;
    const c = this.ctx, t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = c.createBiquadFilter();
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(opt.gain, t + (opt.fade || 1.5));

    if (name === 'hall') {
      // ar parado de galpao: grave largo, sem chuva nenhuma
      src.playbackRate.value = 0.18;
      f.type = 'lowpass'; f.frequency.value = 150;
      src.connect(f); f.connect(g);
    } else if (name === 'rain') {
      src.playbackRate.value = 1.7;
      f.type = 'highpass'; f.frequency.value = 950;
      const f2 = c.createBiquadFilter();
      f2.type = 'lowpass'; f2.frequency.value = 6200;
      src.connect(f); f.connect(f2); f2.connect(g);
    } else if (name === 'roomtone') {
      src.playbackRate.value = 0.25;
      f.type = 'lowpass'; f.frequency.value = 220;
      src.connect(f); f.connect(g);
    } else if (name === 'static') {
      src.playbackRate.value = 1.8;
      f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 0.7;
      const f2 = c.createBiquadFilter(); f2.type = 'highpass'; f2.frequency.value = 720;
      src.connect(f); f.connect(f2); f2.connect(g);
    } else if (name === 'serra') {
      // A motosserra do Credor. Ela nao desliga: comeca quando a fuga
      // comeca, do outro lado do galpao, e so cala quando o capitulo
      // acaba. Um dente-de-serra grave batendo contra ruido filtrado — o
      // motor e a corrente.
      src.playbackRate.value = 0.9;
      f.type = 'bandpass'; f.Q.value = 3.2; f.frequency.value = 420;
      const f2 = c.createBiquadFilter();
      f2.type = 'lowpass'; f2.frequency.value = 2600;
      src.connect(f); f.connect(f2); f2.connect(g);
      // marcha lenta: o motor sobe e desce sozinho
      const lfo = c.createOscillator(); lfo.type = 'sawtooth'; lfo.frequency.value = 11;
      const lg = c.createGain(); lg.gain.value = 190;
      lfo.connect(lg); lg.connect(f.frequency); lfo.start(t);
      this.loops[name + '_lfo'] = { src: lfo, gain: lg };
    } else if (name === 'fogo') {
      // A CASA QUEIMANDO. Duas camadas: um rugido grave, que e o ar sendo
      // puxado para dentro do fogo, e um chiado alto por cima, que e a
      // chama propriamente dita. O LFO lento abre e fecha o grave — fogo
      // grande respira, e um ruido plano soa a chuveiro ligado.
      src.playbackRate.value = 0.34;
      f.type = 'lowpass'; f.frequency.value = 620;
      const f2 = c.createBiquadFilter();
      f2.type = 'peaking'; f2.frequency.value = 180; f2.Q.value = 1.4; f2.gain.value = 8;
      src.connect(f); f.connect(f2); f2.connect(g);

      const alto = c.createBufferSource();
      alto.buffer = this.noiseBuf; alto.loop = true;
      alto.playbackRate.value = 1.5;
      const fa = c.createBiquadFilter();
      fa.type = 'bandpass'; fa.Q.value = 0.6; fa.frequency.value = 2400;
      const ga = c.createGain(); ga.gain.value = 0.34;
      alto.connect(fa); fa.connect(ga); ga.connect(g);
      alto.start(t, Math.random() * 2);
      this.loops[name + '_alto'] = { src: alto, gain: ga };

      const lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.23;
      const lg = c.createGain(); lg.gain.value = 240;
      lfo.connect(lg); lg.connect(f.frequency); lfo.start(t);
      this.loops[name + '_lfo'] = { src: lfo, gain: lg };
    } else if (name === 'hum') {
      // Zumbido eletrico da sala de maquinas. O disjuntor geral esta
      // desligado e selado com arame — e mesmo assim ele existe.
      src.playbackRate.value = 0.12;
      f.type = 'bandpass'; f.Q.value = 22; f.frequency.value = 120;
      const f2 = c.createBiquadFilter();
      f2.type = 'peaking'; f2.frequency.value = 240; f2.Q.value = 14; f2.gain.value = 9;
      src.connect(f); f.connect(f2); f2.connect(g);
    } else if (name === 'freezer') {
      // Camara fria desligada ha uma decada: nao ha motor. O que sobra e o
      // ar parado de um caixao de aco, mais agudo do que deveria ser.
      src.playbackRate.value = 0.14;
      f.type = 'lowpass'; f.frequency.value = 105;
      const f2 = c.createBiquadFilter();
      f2.type = 'peaking'; f2.frequency.value = 3100; f2.Q.value = 20; f2.gain.value = 11;
      src.connect(f); f.connect(f2); f2.connect(g);
    } else if (name === 'wind') {
      src.playbackRate.value = 0.5;
      f.type = 'bandpass'; f.Q.value = 0.7; f.frequency.value = 480;
      src.connect(f); f.connect(g);
      // LFO deixa o vento respirando em vez de zumbido plano
      const lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.08;
      const lg = c.createGain(); lg.gain.value = 260;
      lfo.connect(lg); lg.connect(f.frequency); lfo.start(t);
      this.loops[name + '_lfo'] = { src: lfo, gain: lg };
    } else {
      src.connect(f); f.connect(g);
    }

    g.connect(this.master);
    src.start(t, Math.random() * 2);
    this.loops[name] = { src, gain: g, filter: f };
  }

  stopLoop(name, fade = 1.2) {
    const L = this.loops[name];
    if (!L) return;
    const t = this.ctx.currentTime;
    L.gain.gain.cancelScheduledValues(t);
    L.gain.gain.setValueAtTime(L.gain.gain.value, t);
    L.gain.gain.linearRampToValueAtTime(0.0001, t + fade);
    try { L.src.stop(t + fade + 0.1); } catch (e) { /* ja parou */ }
    delete this.loops[name];
    // Camadas presas a este loop (o LFO do vento e da serra, a chama aguda
    // do fogo). Sem isto elas continuavam tocando sozinhas depois que o som
    // principal ja tinha sumido.
    for (const suf of ['_lfo', '_alto']) {
      const extra = this.loops[name + suf];
      if (!extra) continue;
      if (extra.gain) {
        extra.gain.gain.cancelScheduledValues(t);
        extra.gain.gain.setValueAtTime(extra.gain.gain.value, t);
        extra.gain.gain.linearRampToValueAtTime(0.0001, t + fade);
      }
      try { extra.src.stop(t + fade + 0.1); } catch (e) { /* ja parou */ }
      delete this.loops[name + suf];
    }
  }

  setLoopGain(name, v, ramp = 0.6) {
    const L = this.loops[name];
    if (!L) return;
    const t = this.ctx.currentTime;
    L.gain.gain.cancelScheduledValues(t);
    L.gain.gain.setValueAtTime(L.gain.gain.value, t);
    L.gain.gain.linearRampToValueAtTime(Math.max(0.0001, v), t + ramp);
  }

  stopAllLoops() {
    for (const k of Object.keys(this.loops)) this.stopLoop(k, 0.5);
  }

  // ---------------- musica ----------------
  // Re menor, ~46 bpm. Piano sintetico (triangulo + seno) com cauda longa
  // no reverb, mais um bordao grave. Melancolia com quatro notas.

  // Tres humores, e os tres sao o mesmo piano — o que muda e a distancia
  // entre as notas. Nao existe arquivo de musica no projeto e nao vai
  // existir: o que da unidade ao jogo e todo som sair do mesmo lugar.
  //
  //   menu ....... o tema. Re menor, quatro notas, cauda longa.
  //   casa ....... o flashback. Mais lento, mais agudo, quase parado, e
  //                SEM chiado de vinil — vinil e memoria velha, e esta
  //                cena nao pode soar a lembranca enquanto ela acontece.
  //   delegacia .. quase nada: um bordao grave, um tritom bem baixo por
  //                cima e uma nota solta de vez em quando. Nao e melodia,
  //                e um lugar que nao quer voce ali.
  startMusic(mood = 'menu') {
    if (!this.ensure()) return;
    if (this.musicOn && this.mood === mood) return;
    if (this.musicOn) this.stopMusic(1.4);
    this.musicOn = true;
    this.mood = mood;
    this._step = 0;
    this._nextNote = this.ctx.currentTime + 0.2;

    const c = this.ctx, t = c.currentTime;
    const cfg = {
      menu:      { bordao: 73.42, bg: 0.055, subida: 4, vinil: 0.017, tritom: 0 },
      casa:      { bordao: 98.00, bg: 0.030, subida: 6, vinil: 0,     tritom: 0 },
      delegacia: { bordao: 55.00, bg: 0.048, subida: 5, vinil: 0.010, tritom: 0.020 },
    }[mood] || { bordao: 73.42, bg: 0.055, subida: 4, vinil: 0.017, tritom: 0 };

    // bordao
    const dr = c.createOscillator(); dr.type = 'sine'; dr.frequency.value = cfg.bordao;
    const dg = c.createGain(); dg.gain.setValueAtTime(0.0001, t);
    dg.gain.linearRampToValueAtTime(cfg.bg, t + cfg.subida);
    dr.connect(dg); dg.connect(this.busMusic); dr.start(t);
    this.drone = { osc: dr, gain: dg };

    // O TRITOM da delegacia. Meia oitava acima do bordao, desafinado de
    // proposito: as duas ondas batem uma contra a outra umas duas vezes por
    // segundo e o ouvido nunca acomoda. E o intervalo que a musica ocidental
    // passou seiscentos anos evitando, e ele funciona.
    if (cfg.tritom > 0) {
      const tr = c.createOscillator(); tr.type = 'sine';
      tr.frequency.value = cfg.bordao * Math.SQRT2 * 2 + 0.7;
      const tg = c.createGain(); tg.gain.setValueAtTime(0.0001, t);
      tg.gain.linearRampToValueAtTime(cfg.tritom, t + cfg.subida * 1.6);
      tr.connect(tg); tg.connect(this.busMusic); tr.start(t);
      this.drone2 = { osc: tr, gain: tg };
    }

    // chiado de vinil
    if (cfg.vinil > 0) {
      const vs = c.createBufferSource(); vs.buffer = this.noiseBuf; vs.loop = true;
      vs.playbackRate.value = 1.2;
      const vf = c.createBiquadFilter(); vf.type = 'highpass'; vf.frequency.value = 2600;
      const vg = c.createGain(); vg.gain.setValueAtTime(0.0001, t);
      vg.gain.linearRampToValueAtTime(cfg.vinil, t + 3);
      vs.connect(vf); vf.connect(vg); vg.connect(this.busMusic); vs.start(t);
      this.vinyl = { src: vs, gain: vg };
    }
  }

  stopMusic(fade = 2.0) {
    if (!this.musicOn) return;
    this.musicOn = false;
    this.mood = null;
    const t = this.ctx.currentTime;
    for (const n of [this.drone, this.drone2, this.vinyl]) {
      if (!n) continue;
      n.gain.gain.cancelScheduledValues(t);
      n.gain.gain.setValueAtTime(n.gain.gain.value, t);
      n.gain.gain.linearRampToValueAtTime(0.0001, t + fade);
      try { (n.osc || n.src).stop(t + fade + 0.2); } catch (e) {}
    }
    this.drone = null; this.drone2 = null; this.vinyl = null;
  }

  // Melodia agendada com antecedencia — WebAudio nao gosta de ser
  // alimentado no ritmo do requestAnimationFrame.
  updateMusic() {
    if (!this.musicOn || !this.ready) return;
    const c = this.ctx;
    // Re menor no menu. Na casa, a mesma escala uma oitava acima e com o
    // dobro de silencio entre as notas: o que faz a coisa doer nao e a
    // nota, e o vao entre uma e outra. Na delegacia quase nao ha nota.
    const MELS = {
      menu: [
        [293.66, 2.4], [349.23, 1.6], [440.00, 2.8], [392.00, 1.6],
        [349.23, 2.4], [329.63, 3.2], [293.66, 3.6], [0, 2.4],
        [440.00, 2.0], [466.16, 2.4], [392.00, 3.0], [349.23, 2.0],
        [293.66, 4.4], [0, 3.0],
      ],
      // A CASA. Sobe uma sexta e nunca resolve — a frase fica sempre
      // faltando a ultima nota, que e o que ele nao teve.
      casa: [
        [587.33, 3.2], [0, 1.6], [698.46, 2.8], [659.25, 3.6], [0, 2.4],
        [523.25, 3.0], [587.33, 4.2], [0, 3.2],
        [880.00, 2.6], [783.99, 3.4], [0, 2.0], [698.46, 3.0],
        [587.33, 5.0], [0, 4.4],
      ],
      // A DELEGACIA. Uma nota a cada oito ou dez segundos, grave, sozinha.
      // Nao e tema: e o predio respirando.
      delegacia: [
        [110.00, 6.0], [0, 4.5], [116.54, 5.0], [0, 6.0],
        [98.00, 5.5], [0, 7.0], [110.00, 4.5], [0, 8.0],
        [155.56, 3.0], [0, 9.0],
      ],
    };
    const MEL = MELS[this.mood] || MELS.menu;
    const forte = this.mood === 'casa' ? 0.55 : this.mood === 'delegacia' ? 0.8 : 1;
    while (this._nextNote < c.currentTime + 1.5) {
      const [freq, dur] = MEL[this._step % MEL.length];
      if (freq > 0) this._piano(freq, this._nextNote, dur, forte);
      this._nextNote += dur;
      this._step++;
    }
  }

  _piano(freq, t, dur, forte = 1) {
    const c = this.ctx;
    const mk = (type, f, amp, decay) => {
      const o = c.createOscillator();
      o.type = type; o.frequency.value = f;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(amp, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(g);
      g.connect(this.busMusic);
      g.connect(this.verb);
      o.start(t); o.stop(t + decay + 0.1);
    };
    const d = Math.min(dur * 1.6, 5);
    mk('triangle', freq, 0.075 * forte, d);
    mk('sine', freq * 2, 0.026 * forte, d * 0.55);
    mk('sine', freq * 0.5, 0.032 * forte, d * 0.8);
  }

  // ---------------- narracao gravada ----------------

  async findNarration() {
    // Aberto por file:// (versao JOGO_OFFLINE.html) o fetch e bloqueado
    // pelo navegador, mas um elemento <audio> ainda consegue carregar o
    // arquivo. Por isso existem dois caminhos aqui.
    const porArquivo = typeof location !== 'undefined' && location.protocol === 'file:';

    for (const url of CANDIDATE_NARRATION) {
      if (porArquivo) {
        const achou = await new Promise(resolve => {
          const el = new window.Audio();
          const limpar = () => { el.oncanplaythrough = el.onloadedmetadata = el.onerror = null; };
          const t = setTimeout(() => { limpar(); resolve(false); }, 2500);
          el.onloadedmetadata = () => { clearTimeout(t); limpar(); resolve(el.duration > 0.5); };
          el.onerror = () => { clearTimeout(t); limpar(); resolve(false); };
          el.preload = 'metadata';
          el.src = url;
        });
        if (achou) { this.narration = url; return url; }
      } else {
        try {
          const r = await fetch(url, { method: 'HEAD' });
          if (r.ok) { this.narration = url; return url; }
        } catch (e) { /* arquivo nao existe, segue */ }
      }
    }
    this.narration = null;
    return null;
  }

  // A voz vai pelo WebAudio para poder ser amplificada acima de 1.0. Um
  // limitador logo depois do ganho segura os picos: sem ele, +12 dB numa
  // fala que ja tem pico em -14 dBFS estouraria nos trechos mais altos.
  // =======================================================================
  // AUDIO VINDO DE ARQUIVO — musica da casa e gritos
  // =======================================================================
  // O jogo inteiro e sintetizado, e continua sendo: estes dois sao a
  // excecao, e a excecao existe porque nenhum sintetizador do mundo faz uma
  // garganta humana convincente e porque o Luiz quis uma musica dele na
  // casa.
  //
  // A REGRA: o arquivo e OPCIONAL. Se ele nao estiver la, o sintetizado
  // entra no lugar e ninguem percebe que faltou nada. O jogo nao pode
  // depender de um mp3 para funcionar — foi assim que ele ficou rodando com
  // dois cliques em qualquer maquina, e isso nao se perde por causa de
  // trilha sonora.
  //
  //   assets/audio/musica-casa.mp3 .. o tema da casa. BAIXO, em loop.
  //   assets/audio/grito.mp3 ........ os gritos do incendio. MEDIO.
  //
  // Procurar arquivo custa tempo, entao cada slot e procurado UMA vez e o
  // resultado fica guardado.
  async acharArquivo(chave, candidatos) {
    this._arquivos = this._arquivos || {};
    if (Object.prototype.hasOwnProperty.call(this._arquivos, chave)) {
      return this._arquivos[chave];
    }
    const porArquivo = typeof location !== 'undefined' && location.protocol === 'file:';
    for (const url of candidatos) {
      let achou = false;
      if (porArquivo) {
        // Por file:// o fetch e bloqueado, mas um <audio> ainda carrega.
        achou = await new Promise(resolve => {
          const el = new window.Audio();
          const limpar = () => { el.onloadedmetadata = el.onerror = null; };
          const t = setTimeout(() => { limpar(); resolve(false); }, 2500);
          el.onloadedmetadata = () => { clearTimeout(t); limpar(); resolve(el.duration > 0.5); };
          el.onerror = () => { clearTimeout(t); limpar(); resolve(false); };
          el.preload = 'metadata';
          el.src = url;
        });
      } else {
        try { const r = await fetch(url, { method: 'HEAD' }); achou = r.ok; } catch (e) { achou = false; }
      }
      if (achou) { this._arquivos[chave] = url; return url; }
    }
    this._arquivos[chave] = null;
    return null;
  }

  async procurarTrilha() {
    await this.acharArquivo('musicaCasa', [
      'assets/audio/musica-casa.mp3', 'assets/audio/musica-casa.ogg',
      'assets/audio/musica-casa.m4a', 'assets/audio/musica_casa.mp3',
    ]);
    await this.acharArquivo('grito', [
      'assets/audio/grito.mp3', 'assets/audio/grito.ogg', 'assets/audio/grito.wav',
      'assets/audio/gritos.mp3', 'assets/audio/scream.mp3',
    ]);
    return this._arquivos;
  }

  // ---- a musica da casa ----
  //
  // ⚠ BAIXA. Ela toca por baixo de duas conversas longas e nao pode disputar
  // leitura com elas: 0.18 do barramento de musica, que ja e o mais baixo
  // dos tres. Se ela chamar atencao para si, a cena virou videoclipe.
  tocarMusicaArquivo(vol = 0.18) {
    const url = this._arquivos && this._arquivos.musicaCasa;
    if (!url) return false;
    if (this.musicaEl) return true;
    const el = new window.Audio(url);
    el.loop = true;
    el.preload = 'auto';
    if (this.ensure()) {
      try {
        const src = this.ctx.createMediaElementSource(el);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 3.5);
        src.connect(g); g.connect(this.busMusic);
        this.musicaChain = { src, gain: g };
        el.volume = 1;
      } catch (e) {
        this.musicaChain = null;
        el.volume = Math.min(1, vol * this.vol.master);
      }
    } else {
      el.volume = Math.min(1, vol * this.vol.master);
    }
    el.play().catch(() => {});
    this.musicaEl = el;
    return true;
  }

  pararMusicaArquivo(fade = 1.8) {
    if (!this.musicaEl) return;
    const el = this.musicaEl, ch = this.musicaChain;
    this.musicaEl = null; this.musicaChain = null;
    if (ch && this.ctx) {
      const t = this.ctx.currentTime;
      ch.gain.gain.cancelScheduledValues(t);
      ch.gain.gain.setValueAtTime(ch.gain.gain.value, t);
      ch.gain.gain.linearRampToValueAtTime(0.0001, t + fade);
    }
    setTimeout(() => {
      try { el.pause(); el.currentTime = 0; } catch (e) {}
      if (ch) { try { ch.src.disconnect(); ch.gain.disconnect(); } catch (e) {} }
    }, Math.round(fade * 1000) + 60);
  }

  // ---- os gritos, se houver arquivo ----
  //
  // ⚠ MEDIO. Alto demais vira filme de terror barato; baixo demais o
  // jogador nao entende que sao pessoas. E ele continua saindo DE DENTRO
  // da casa, entao passa por um passa-baixa que e a parede.
  gritoArquivo(vol = 0.55) {
    const url = this._arquivos && this._arquivos.grito;
    if (!url) return false;
    const el = new window.Audio(url);
    el.preload = 'auto';
    if (this.ensure()) {
      try {
        const src = this.ctx.createMediaElementSource(el);
        const parede = this.ctx.createBiquadFilter();
        parede.type = 'lowpass';
        parede.frequency.value = 1700;
        parede.Q.value = 0.6;
        const g = this.ctx.createGain();
        g.gain.value = vol;
        src.connect(parede); parede.connect(g); g.connect(this.busSfx);
        const vg = this.ctx.createGain(); vg.gain.value = 0.5;
        g.connect(vg); vg.connect(this.verb);
        el.volume = 1;
      } catch (e) {
        el.volume = Math.min(1, vol * this.vol.master);
      }
    } else {
      el.volume = Math.min(1, vol * this.vol.master);
    }
    el.play().catch(() => {});
    return true;
  }

  playNarration() {
    if (!this.narration) return null;
    const el = new window.Audio(this.narration);
    el.preload = 'auto';

    if (this.ensure()) {
      try {
        const src = this.ctx.createMediaElementSource(el);
        const ganho = this.ctx.createGain();
        ganho.gain.value = GANHO_VOZ;
        const lim = this.ctx.createDynamicsCompressor();
        lim.threshold.value = -6;
        lim.knee.value = 2;
        lim.ratio.value = 12;
        lim.attack.value = 0.003;
        lim.release.value = 0.18;
        src.connect(ganho); ganho.connect(lim); lim.connect(this.busVoice);
        this.narrChain = { src, ganho, lim };
        el.volume = 1;
      } catch (e) {
        // navegador recusou o roteamento: cai no volume simples do elemento
        this.narrChain = null;
        el.volume = Math.min(1, this.vol.master * this.vol.voice);
      }
    } else {
      el.volume = Math.min(1, this.vol.master * this.vol.voice);
    }

    el.play().catch(() => {});
    this.narrationEl = el;
    return el;
  }

  stopNarration() {
    if (this.narrationEl) {
      try { this.narrationEl.pause(); this.narrationEl.currentTime = 0; } catch (e) {}
      this.narrationEl = null;
    }
    if (this.narrChain) {
      try {
        this.narrChain.src.disconnect();
        this.narrChain.ganho.disconnect();
        this.narrChain.lim.disconnect();
      } catch (e) { /* ja desconectado */ }
      this.narrChain = null;
    }
  }

  pauseAll() {
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
    if (this.narrationEl) try { this.narrationEl.pause(); } catch (e) {}
  }

  resumeAll() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.narrationEl) try { this.narrationEl.play(); } catch (e) {}
  }
}

export const audio = new Audio();
