// main.js — maquina de estados do jogo e laco principal.
//
//   BOOT  ->  MENU  ->  CUTSCENE  ->  PLAY  <->  PAUSE
//                 \->  LAB (sala de teste)
//
// Regra de desenho respeitada em todos os estados: mundo primeiro, LUZ no
// meio, interface por ultimo. Se a interface for desenhada antes da luz,
// ela sai escura junto com o cenario.

import { VW, VH, gfx, clamp, lerp } from './core/gfx.js';
import { input } from './core/input.js';
import { audio } from './core/audio.js';
import { save, formatPlaytime } from './core/save.js';
import { text, wrap, measure, clearTextCache } from './core/text.js';
import { PAL } from './art/palette.js';
import { ANIM_NAMES } from './art/detective.js';
import { partesDe } from './art/creatures.js';
import { Camera } from './world/camera.js';
import { Rain, Fog, Particles, DustMotes } from './world/fx.js';
import { buildAlley, buildBar, buildBackroom, buildWarehouse, buildRoad, buildCar } from './world/levels.js';
import { buildChapter2 } from './world/levels-ch2.js';
import { buildChapter3 } from './world/levels-ch3.js';
import { buildChaseExtension } from './world/levels-chase.js';
import {
  degrauDoCigarro, usarCigarro, liberarCigarro, TicketBoard,
  entrarFlashback, sairFlashback, NamePrompt, esticarCorredor, Fogo,
} from './systems/chapter3.js';
import { Interrogatorio } from './systems/interrogatorio.js';
import { NoteScene } from './systems/scene-nota.js';
import { MirrorScene } from './systems/scene-espelho.js';
import { Player } from './systems/player.js';
import { Dialogue, drawPrompt, drawLocationCard, talkHasMore } from './systems/dialogue.js';
import { Opening } from './systems/cutscene.js';
import { Sanity } from './systems/sanity.js';
import { Journal } from './systems/journal.js';
import { Inventory } from './systems/inventory.js';
import { ShiftPuzzle } from './systems/puzzle-turno.js';
import { Supplies, installChapterExtras } from './systems/supplies.js';
import { ChaseIntro } from './systems/scene-chase-intro.js';
import { Director, Enemy } from './systems/enemies.js';
import { Npc, NPCS } from './systems/npc.js';
import { Chase } from './systems/chase.js';
import { ChaseSetpieces } from './systems/chase-setpieces.js';
import { ChaseSequence } from './systems/chase-sequence.js';
import { CombatFinishers } from './systems/combat-finishers.js';
import { difficulty } from './systems/difficulty.js';
import { TitleMenu } from './ui/menu.js';
import { PauseMenu } from './ui/pause.js';
import { SlotPicker, OptionsPanel, ChapterPicker, screenDim, panelBox,
         alternarTelaCheia } from './ui/panels.js';
import { t as T, setLang, getLang, LINES, line as L, TALKS } from './i18n.js';

// A planta baixa do galpao, do jeito que ela e desenhada no papel que ele
// arranca do quadro de avisos. As coordenadas sao do papel, nao do mundo:
// o mapa e um desenho de alguem, e nao uma miniatura fiel.
const MAPA_SETORES = [
  { k: 'ch2_office',    x: 22,  y: 20,  w: 48,  h: 22, n: 'map_office' },
  { k: 'ch2_arquivo',   x: 76,  y: 20,  w: 48,  h: 22, n: 'map_archive' },
  { k: 'ch2_evidence',  x: 130, y: 20,  w: 48,  h: 22, n: 'map_evidence' },
  { k: 'ch2_comms',     x: 184, y: 20,  w: 48,  h: 22, n: 'map_comms' },
  { k: 'ch2_security',  x: 238, y: 20,  w: 40,  h: 22, n: 'map_security' },
  { k: 'ch2_corridor',  x: 22,  y: 50,  w: 256, h: 22, n: 'map_corridor' },
  { k: 'ch2_dock',      x: 22,  y: 82,  w: 46,  h: 22, n: 'map_dock' },
  { k: 'ch2_mezz',      x: 74,  y: 82,  w: 56,  h: 22, n: 'map_mezz' },
  { k: 'ch2_machines',  x: 136, y: 82,  w: 62,  h: 22, n: 'map_machines' },
  { k: 'ch2_shelves',   x: 204, y: 82,  w: 74,  h: 22, n: 'map_shelves' },
  { k: 'ch2_cold',      x: 74,  y: 112, w: 56,  h: 22, n: 'map_cold' },
  { k: 'ch2_locker',    x: 136, y: 112, w: 62,  h: 22, n: 'map_locker' },
  { k: 'ch2_wc',        x: 204, y: 112, w: 34,  h: 22, n: 'map_wc' },
  { k: 'ch2_infirmary', x: 244, y: 112, w: 34,  h: 22, n: 'map_infirmary' },
];

const settings = {
  lang: 'pt',
  master: 0.8, music: 0.55, sfx: 0.85, voice: 1.0,
  subs: true, scanlines: 0.07, grain: 0.018,
  shake: true, pixelPerfect: false,
  difficulty: 'hard',
};

class Game {
  constructor() {
    this.state = 'boot';
    this.playtime = 0;
    this.transition = null;
    this.debug = false;
    this.locCard = 0;
    this.fps = 60;
    this.frames = 0; this.fpsT = 0;
  }

  // -------------------------------------------------------------------
  // arranque
  // -------------------------------------------------------------------

  async boot() {
    const msg = document.getElementById('boot-msg');
    const set = (s) => { if (msg) msg.textContent = s; };

    const st = save.loadSettings();
    if (st) Object.assign(settings, st);
    setLang(settings.lang || 'pt');

    gfx.init();
    input.init();
    // F11 alterna tela cheia. O `input` so avisa que a tecla veio; quem sabe
    // COMO entrar em tela cheia e o painel de opcoes, que e onde mora a
    // mesma opcao no menu. Assim o atalho e o menu nunca discordam.
    input.onFullscreen = alternarTelaCheia;
    this.applySettings();

    set('montando o beco...');
    await frame();
    this.levels = { alley: buildAlley() };

    set('acendendo o bar...');
    await frame();
    this.levels.bar = buildBar();

    set('abrindo os fundos...');
    await frame();
    this.levels.backroom = buildBackroom();
    this.levels.warehouse = buildWarehouse();

    // O Capitulo 2 e um galpao inteiro: sete setores mais a doca. Cada um
    // e montado uma vez, aqui, e depois so deslocado.
    set('acendendo o galpao...');
    await frame();
    Object.assign(this.levels, buildChapter2());
    Object.assign(this.levels, buildChaseExtension());

    // O Capitulo 3 e a delegacia. Sem combate: a arma fica na portaria.
    set('acendendo a delegacia...');
    await frame();
    Object.assign(this.levels, buildChapter3());

    const materiais = {
      ch2_corridor: 'concrete', ch2_office: 'wood', ch2_arquivo: 'concrete',
      ch2_evidence: 'tile', ch2_comms: 'tile', ch2_security: 'metal',
      ch2_shelves: 'concrete', ch2_locker: 'tile', ch2_infirmary: 'tile',
      ch2_wc: 'tile', ch2_cold: 'ice', ch2_machines: 'metal',
      ch2_mezz: 'metal', ch2_dock: 'metal', warehouse: 'concrete',
      ch3_reception: 'tile', ch3_plantao: 'wood', ch3_desk: 'wood',
      ch3_archive: 'concrete', ch3_past: 'concrete', ch3_cell: 'concrete',
      ch3_home: 'wood', ch3_room: 'wood',
    };
    for (const [key, mat] of Object.entries(materiais)) if (this.levels[key]) this.levels[key].material = mat;

    // Pontos sorteáveis e segredos precisam existir antes da fotografia do
    // mundo-base, para saves antigos e novos conseguirem rebobinar tudo.
    this.supplies = new Supplies(this.levels);
    this.supplies.install();
    installChapterExtras(this.levels);
    this.chaseSetpieces = new ChaseSetpieces(this.levels);
    this.chaseSequence = new ChaseSequence();

    // Fotografia imutavel do mundo antes de o jogador tocar em qualquer
    // coisa. Carregar um save precisa REBOBINAR o cenario primeiro; sem esta
    // base, um item pego depois daquele save continuava desaparecido porque
    // o carregamento apenas marcava novos estados, nunca desfazia os atuais.
    this._mundoBase = {};
    for (const key of Object.keys(this.levels)) {
      const lv = this.levels[key];
      const disabled = {};
      for (const it of (lv.interactables || [])) {
        if (it.id) disabled[it.id] = !!it.disabled;
      }
      this._mundoBase[key] = { disabled };
    }

    set('ligando o carro...');
    await frame();
    this.road = buildRoad();
    this.car = buildCar();

    set('procurando a narracao...');
    this.narrationUrl = await audio.findNarration();
    // Musica da casa e gritos vindos de arquivo, se existirem. Sao os dois
    // unicos sons do jogo que podem vir de fora — e os dois sao OPCIONAIS:
    // sem eles o sintetizado entra no lugar e nada quebra.
    await audio.procurarTrilha();

    set('afinando o titulo...');
    await frame();
    this.menu = new TitleMenu(this);
    this.menu.build();

    // mundo jogavel
    this.cam = new Camera();
    this.fx = new Particles(500);
    this.player = new Player(this.fx);
    this.rain = new Rain({ count: 210, groundY: 216 });
    this.fog = new Fog({ y: 190, alpha: 0.14, count: 6 });
    this.dust = new DustMotes(70);
    this.dialogue = new Dialogue();
    this.pause = new PauseMenu(settings, {
      onSave: (i) => this.saveSlot(i),
      onLoad: (i) => this.loadSlot(i),
      onQuit: () => this.toMenu(),
      onSettings: () => this.applySettings(),
    });
    this.menuSlots = new SlotPicker();
    this.menuOptions = new OptionsPanel(settings, () => this.applySettings());
    this.player.onInteract = (it) => this.doInteract(it);

    // ---- sistemas do Capitulo 2 ----
    this.sanity = new Sanity();
    this.journal = new Journal();
    this._ligarDeducao();
    this.inv = new Inventory();
    // ---- Capitulo 3 ----
    this.ticket = new TicketBoard();
    this.namePrompt = new NamePrompt();
    this.fogo = new Fogo();
    this.interrog = new Interrogatorio();
    // Identidade da partida em curso. Cenas roteirizadas que dependem de
    // `setTimeout` congelam este numero e conferem depois: sem isso, sair
    // para o menu, carregar um save ou trocar de capitulo no meio de uma
    // cena deixava o relogio correndo e o jogador era arrancado de onde
    // estava, segundos depois, no meio de outra partida.
    this.runId = 0;
    this.shiftPuzzle = new ShiftPuzzle();
    this.director = new Director();
    this.chase = new Chase();
    this.finishers = new CombatFinishers();
    this.director.difficulty = this.diff;
    this.chase.difficulty = this.diff;
    this.npcs = {};
    for (const id of Object.keys(NPCS)) this.npcs[id] = new Npc(id);
    this.player.onClubHit = () => this.golpeDePorrete();
    this.player.onPunchHit = () => this.golpeDeSoco();
    this.player.onShot = (x, f, a) => this.tiro(x, f, a);
    this.player.onNoise = () => {};
    this.player.onHurt = (n) => { this.sanity.drain(n * 0.35, true); };
    this.inv.onUse = (key) => this.usarItem(key);
    this.sanity.onEvent = (tipo) => this.eventoSanidade(tipo);
    this.shiftPuzzle.onChange = (rot) => { this.flags.puzzleRot = rot; };
    this.shiftPuzzle.onSolved = (rot) => {
      this.flags.puzzleRot = rot;
      this.flags.puzzle_solved = true;
      const sec = this.levels.ch2_security;
      if (sec) {
        sec.keyVisible = !this.flags.chave && !(sec.pego && sec.pego.chave);
        const key = sec.interactables.find(i => i.id === 'chave');
        if (key) key.disabled = !sec.keyVisible;
      }
      this.sanity.restore(4);
      this.anotar('j_puzzle');
    };
    this.shiftPuzzle.onClose = (solved) => {
      if (solved) this.player.sayAll(['b2_puzzle_done_1', 'b2_puzzle_done_2'], true);
    };

    set(this.narrationUrl ? 'PRESSIONE QUALQUER TECLA' : 'PRESSIONE QUALQUER TECLA');
    this.state = 'waitkey';

    // O laco engole erros de um quadro so. Um soluco isolado (um gradiente
    // com numero invalido, um sprite que ainda nao existe) nao pode matar a
    // sessao inteira; tres erros seguidos, ai sim, para e mostra a tela de
    // erro — nesse ponto o jogo esta quebrado de verdade.
    let last = performance.now();
    let seguidos = 0;
    const loop = (ts) => {
      let dt = (ts - last) / 1000;
      last = ts;
      // dt pode vir negativo no primeiro quadro (o carimbo do rAF as vezes e
      // anterior ao performance.now() lido antes dele) ou absurdo depois de a
      // aba ficar minimizada. Os dois estragam a fisica.
      if (!(dt > 0)) dt = 1 / 60;
      if (dt > 0.05) dt = 0.05;
      try {
        this.tick(dt);
        seguidos = 0;
      } catch (e) {
        seguidos++;
        this.lastError = e;
        if (seguidos >= 3) {
          if (window.__crash) {
            window.__crash('Erro no laco do jogo (3 quadros seguidos)',
              (e && e.stack) ? e.stack : String(e));
          }
          return;   // para o laco: continuar so geraria mil erros iguais
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  applySettings() {
    audio.setVolumes({
      master: settings.master, music: settings.music,
      sfx: settings.sfx, voice: settings.voice,
    });
    gfx.scanlines = settings.scanlines;
    gfx.grainAmount = settings.grain;
    gfx.pixelPerfect = settings.pixelPerfect;
    gfx.resize();
    this.diff = difficulty(settings.difficulty || 'hard');
    if (this.director) this.director.difficulty = this.diff;
    if (this.chase) this.chase.difficulty = this.diff;
    settings.lang = getLang();
    save.saveSettings(settings);
    if (this.menu) this.menu.refresh();
  }

  // -------------------------------------------------------------------
  // laco
  // -------------------------------------------------------------------

  tick(dt) {
    this.frames++; this.fpsT += dt;
    if (this.fpsT >= 0.5) { this.fps = this.frames / this.fpsT; this.frames = 0; this.fpsT = 0; }

    input.update(dt);

    if (this.state === 'waitkey') {
      if (input.anyPress || input.mouse.pressed) {
        document.getElementById('boot').classList.add('gone');
        document.body.classList.add('playing');
        audio.ensure();
        this.toMenu();
      }
      input.flush();
      return;
    }

    if (input.pressed('debug')) this.debug = !this.debug;

    if (this.transition) this.updateTransition(dt);

    switch (this.state) {
      case 'menu': this.updateMenu(dt); break;
      case 'cutscene': this.updateCutscene(dt); break;
      case 'chapcard': this.updateChapCard(dt); break;
      case 'carregando': this.updateCarregando(dt); break;
      case 'play': this.updatePlay(dt); break;
      case 'endcard': this.updateEndCard(dt); break;
      case 'gameover': this.updateGameOver(dt); break;
      case 'lab': this.updateLab(dt); break;
    }

    audio.updateMusic();
    input.flush();
  }

  updateTransition(dt) {
    const tr = this.transition;
    tr.t += dt;
    if (tr.phase === 'out') {
      gfx.fade = clamp(tr.t / tr.outDur, 0, 1);
      if (tr.t >= tr.outDur) {
        tr.phase = 'in'; tr.t = 0;
        if (tr.action) tr.action();
      }
    } else {
      gfx.fade = 1 - clamp(tr.t / tr.inDur, 0, 1);
      if (tr.t >= tr.inDur) { gfx.fade = 0; this.transition = null; }
    }
  }

  fadeTo(action, outDur = 0.55, inDur = 0.7) {
    if (this.transition) return;
    this.transition = { t: 0, phase: 'out', outDur, inDur, action };
  }

  // -------------------------------------------------------------------
  // MENU
  // -------------------------------------------------------------------

  toMenu() {
    this.runId++;   // invalida qualquer cena roteirizada ainda no relogio
    this.fogo.parar(); this.fogo.reset();
    this.interrog.reset();
    audio.pararMusicaArquivo(0.6);
    this.state = 'menu';
    this.scene = null;
    if (this.menuSlots) this.menuSlots.open = false;
    if (this.menuChapters) this.menuChapters.open = false;
    audio.stopDread(0.3);
    audio.stopAllLoops();
    audio.stopNarration();
    gfx.eyelid = 1;
    this.menu.refresh();
    this.menu.enter();
    gfx.letterbox = 0;
  }

  updateMenu(dt) {
    if (!this.menuChapters) this.menuChapters = new ChapterPicker();
    const blocked = this.menuSlots.open || this.menuOptions.open
      || this.menuChapters.open || !!this.transition;
    const act = this.menu.update(dt, blocked);

    if (this.menuSlots.open) this.menuSlots.update(dt);
    else if (this.menuOptions.open) this.menuOptions.update(dt);
    else if (this.menuChapters.open) this.menuChapters.update(dt);

    if (act === 'chapters') {
      this.menuChapters.show((n) => this.fadeTo(() => this.startChapter(n), 0.8, 0.01), () => {});
    } else if (act === 'new') this.fadeTo(() => this.startNewGame(), 0.8, 0.01);
    else if (act === 'continue') {
      const i = save.mostRecent();
      if (i >= 0) this.fadeTo(() => this.loadSlot(i), 0.7, 0.7);
    } else if (act === 'load') {
      this.menuSlots.show('load', (i) => this.fadeTo(() => this.loadSlot(i), 0.6, 0.7), () => {});
    } else if (act === 'options') {
      this.menuOptions.show(() => this.applySettings());
    } else if (act === 'lab') {
      this.fadeTo(() => this.startLab(), 0.5, 0.5);
    } else if (act === 'combatlab') {
      this.fadeTo(() => this.startCombatLab(), 0.5, 0.5);
    }

    // desenho
    gfx.begin('#000');
    this.menu.draw(gfx.s);
    gfx.beginLights('#28324a');
    this.menu.addLights();
    gfx.endLights(0.5);
    this.menu.drawUI(gfx.s);
    this.menuSlots.draw(gfx.s);
    this.menuOptions.draw(gfx.s);
    if (this.menuChapters) this.menuChapters.draw(gfx.s);
    if (this.debug) this.drawDebug(gfx.s, 'MENU');
    gfx.present(dt);
  }

  // -------------------------------------------------------------------
  // SELETOR DE CAPITULO
  //
  // Monta o estado de um capitulo do zero, em memoria, e entra. NAO toca
  // em nenhum dos dez arquivos salvos.
  // -------------------------------------------------------------------

  startChapter(n) {
    this.runId++;
    this.playtime = 0;
    this.flags = {};
    this.qte = null;
    this.grab = null;
    this.deathRetry = null;
    this._presente = null;
    this.bloodDecals = [];
    this.cigTentativas = 0;
    this.espelhoN = 0;
    audio.stopMusic(1.0);
    audio.stopAllLoops();

    if (n === 1) {
      // O Capitulo 1 comeca onde ele sempre comecou: pela cutscene.
      this.startNewGame();
      return;
    }

    // Capitulos 2 e 3 devolvem o mundo intocado antes de montar o proprio
    // estado, senao um item pego numa sessao anterior continuaria sumido.
    this._aplicarMundo(null);
    this.resetChapter2();

    if (n === 2) {
      this.flags.supplies = this.supplies.newRun();
      const p = this.player;
      // Ele acorda do sequestro sem nada: nem arma, nem cigarro, nem carteira.
      p.hasGun = false; p.ammo = 0; p.reserve = 0;
      p.det.props.gun = 'none';
      p.club = false; p.segurarPorrete(false);
      p.hp = 100; p.det.blood = 0; p.det.coatTorn = false; p.det.injury = 0;
      this.startChapter2();
      return;
    }

    // Capitulo 3.
    this.flags.supplies = this.supplies.newRun();
    this.startChapter3();
  }

  // -------------------------------------------------------------------
  // CUTSCENE
  // -------------------------------------------------------------------

  startNewGame() {
    this.runId++;
    this.playtime = 0;
    this.flags = {};
    // jogo novo: ele tem cigarro no bolso de novo, e arma no coldre
    this.player.idleMode = null;
    this.player.det.parts = null;   // e o sobretudo de sempre
    this.player.hasGun = true;
    this.player.ammo = 6;
    this.player.reserve = 18;
    this.player.det.props.gun = 'holstered';
    this.player.segurarPorrete(false);
    this.player.hp = 100;
    this.player.club = false;
    this.qte = null;
    this.grab = null;
    this.deathRetry = null;
    this.resetChapter2();
    this._aplicarMundo(null);
    this.flags.supplies = this.supplies.newRun();
    audio.stopMusic(1.2);
    audio.stopAllLoops();
    this.opening = new Opening(this.road, this.car, this.player, this.rain, this.fx);
    this.fx.clear();
    this.opening.start();
    this.state = 'cutscene';
  }

  updateCutscene(dt) {
    this.playtime += dt;
    const op = this.opening;
    op.update(dt);

    gfx.begin('#000');
    op.draw(gfx.s);
    gfx.beginLights('#333f56');
    op.addLights(gfx);
    for (const L2 of this.player.det.lights(this.player.x, this.player.y)) {
      gfx.addLight(L2.x, L2.y, L2.r, L2.color, L2.i);
    }
    gfx.endLights(0.6);
    if (settings.subs) op.drawUI(gfx.s);
    else if (op.skipHold > 0.12) op.drawUI(gfx.s);
    if (this.debug) this.drawDebug(gfx.s, 'CUTSCENE ' + op.phase);
    gfx.present(dt);

    if (op.finished) {
      this.enterLevel('alley', null, 1, true);
      this.state = 'play';
      gfx.fade = 1;
      this.transition = { t: 0, phase: 'in', outDur: 0.01, inDur: 1.1, action: null };
    }
  }

  // -------------------------------------------------------------------
  // PLAY
  // -------------------------------------------------------------------

  enterLevel(key, x, facing, firstTime) {
    const lv = this.levels[key];
    this.level = lv;
    const sp = lv.spawn;
    this.player.spawn(x === null || x === undefined ? sp.x : x, facing || sp.facing, lv.groundY);
    this.cam.setBounds(0, lv.width);
    this.cam.snapTo(this.player.x, 0);
    this.rain.on = lv.weather === 'rain';
    this.rain.groundY = lv.groundY + 2;
    this.rain.intensity = lv.rainIntensity || 1;
    this.player.det.reflect = lv.reflect;
    this.player.det.visible = true;   // a cutscene esconde; entrar numa fase sempre mostra
    this.player.wet = lv.weather === 'rain';
    this.player.stepMaterial = lv.materialAt ? lv.materialAt(this.player.x)
      : (lv.material || (this.player.wet ? 'wet' : (lv.indoor ? 'concrete' : 'wet')));
    this.fx.clear();
    this.locCard = 4.0;
    this.dialogue.active = false;
    this.dialogue.fade = 0;
    this.player.clearBarks();
    this.player.frozen = false;
    this.player.controllable = true;
    this.qte = null;
    this.flags = this.flags || {};
    this.flags.visto = this.flags.visto || {};
    this.flags.barks = this.flags.barks || {};
    this.flags.visitas = this.flags.visitas || {};
    this.flags.visitas[lv.key] = (this.flags.visitas[lv.key] || 0) + 1;
    lv.revisitStage = Math.min(3, this.flags.visitas[lv.key] - 1);
    const jaViu = !!this.flags.visto[lv.key];
    if (lv.barks) for (let i = 0; i < lv.barks.length; i++) {
      lv.barks[i].done = jaViu || !!this.flags.barks[`${lv.key}:${i}`];
    }
    // Falas de entrada pertencem à descoberta do lugar. Voltar a uma sala
    // conhecida não faz David esquecer o que acabou de dizer.
    if (!jaViu) {
      if (lv.enterBarksNow) this.player.sayAll(lv.enterBarksNow, true);
      else if (lv.enterBarks) this.player.sayAll(lv.enterBarks);
    }

    // Cada lugar tem o proprio som. Antes a chuva seguia o jogador para
    // dentro de qualquer sala, o que dizia ao ouvido que nada tinha mudado.
    audio.stopAllLoops();
    for (const a of (lv.ambience || [{ n: 'roomtone', g: 0.1 }])) {
      audio.startLoop(a.n, { gain: a.g, fade: a.f || 1.5 });
    }

    // ---- MUSICA POR LUGAR (Capitulo 3) ----
    //
    // Dois temas, e os dois entram por baixo do ambiente, nao por cima: a
    // regra do jogo continua sendo que o silencio e a arma principal e que
    // a musica so existe para ser cortada.
    //
    //   a casa .... um piano triste, muito baixo, com vaos enormes entre as
    //               notas. E a unica musica quente do jogo.
    //   delegacia . um bordao grave com um tritom quase inaudivel por cima.
    //               Nao e tema; e o predio.
    //
    // ⚠ A MUSICA E DO FLASHBACK INTEIRO, nao da sala. Ela nascia so quando
    // ele punha o pe dentro de casa, e a rua — que e onde a cena comeca,
    // com ele saindo do carro — ficava em silencio de delegacia. Agora ela
    // entra no primeiro quadro do passado e atravessa a rua, a sala e o
    // quarto sem cortar nas portas: `tocarMusicaArquivo` devolve `true` se
    // ela ja estiver tocando, entao trocar de sala nao reinicia nada.
    //
    // E ela continua morrendo no mesmo lugar de sempre: no instante em que
    // ele atende o telefone (`atenderNoPassado`). O que vem depois nao tem
    // trilha — e por isso que a flag e lida aqui, para uma sala revisitada
    // depois da ligacao nao ressuscitar o tema.
    if (this.flags.cap3) {
      const noPassado = lv.key === 'ch3_past' || lv.key === 'ch3_home' || lv.key === 'ch3_room';
      if (noPassado && !this.flags.atendeu) {
        // Se houver gravacao, ela e a musica da casa. Se nao houver, o
        // piano sintetizado faz o mesmo papel.
        if (audio.tocarMusicaArquivo(0.18)) audio.stopMusic(1.2);
        else audio.startMusic('casa');
      } else if (noPassado) {
        audio.pararMusicaArquivo(2.4);
        audio.stopMusic(2.2);
      } else {
        audio.pararMusicaArquivo(1.6);
        audio.startMusic('delegacia');
      }
    }
    if (this.chase && this.chase.ativo) {
      audio.startLoop('serra', { gain: 0.035, fade: 0.35 });
      audio.startLoop('static', { gain: 0.014, fade: 0.28 });
    }
    this.randomSfxT = [];
    if (lv.randomSfx) {
      for (const r of lv.randomSfx) this.randomSfxT.push(r.min + Math.random() * (r.max - r.min));
    }

    // Se o setor teve as luzes derrubadas por uma cena, elas voltam ao
    // entrar de novo — menos durante a perseguicao, que e quem esta
    // apagando o galpao de proposito.
    if (lv._apagada && !this.chase.ativo) {
      for (const f of lv.lightDefs) if (f.i0 !== undefined) f.i = f.i0;
      lv._apagada = false;
    }
    this.player.det.alpha = 1;
    this.mapaAberto = false;
    // A primeira fala espera o fade-in acabar, senao ela nasce e morre
    // atras da tela preta e o jogador nunca a le.
    this.player.atrasarFala(1.0);
    this.flags.visto[lv.key] = true;
    if (this.chase) this.chase.avisoEntrada(lv.key, this.player.facing);
    this.entrouCh2(lv);
    if (this.chaseSequence) this.chaseSequence.enter(this, lv);

    // O rádio do vestiário nasce ligado e só respeita o botão depois da
    // primeira interação. A flag fica no save.
    if (lv.key === 'ch2_locker' && !this.flags.radio_off) {
      audio.startLoop('static', { gain: 0.075, fade: 0.7 });
    }
  }

  updatePlay(dt) {
    const lv = this.level;
    const paused = this.pause.active;

    if (this.flags && this.flags.combat_lab && !paused && !this.transition && input.pressed('cancel')) {
      this.fadeTo(() => this.toMenu(), 0.35, 0.45);
    }

    if (!paused && !this.transition && !this.scene && !this.shiftPuzzle.open
      && !this.chaseSequence.action && !this.finishers.action && !this.flags.combat_lab
      && input.pressed('pause') && !this.dialogue.active) {
      this.pause.open();
    }

    const sim = paused ? 0 : dt;
    this.playtime += sim;
    if (this.locCard > 0) this.locCard -= sim;

    const cap2 = lv.key.slice(0, 4) === 'ch2_';
    // O Capitulo 3 usa o mesmo caderno e o mesmo casaco. Ele nao usa
    // perseguicao, puzzle, emboscada nem nada de combate.
    const cap3 = lv.key.slice(0, 4) === 'ch3_';

    // O caderno e o casaco NAO pausam o jogo. Abrir a mochila no meio do
    // galpao tem que custar alguma coisa: enquanto o casaco esta aberto,
    // ele tapa parte da tela.
    if ((cap2 || cap3) && !paused && !this.scene && !this.dialogue.active
      && !this.shiftPuzzle.open && !this.transition && !this.grab && !this.chaseSetpieces.action
      && !this.chaseSequence.action && !this.finishers.action && !this.namePrompt.ativo
      && !this.interrog.ativo) {
      if (input.pressed('journal') && this.flags.caderno) {
        this.journal.toggle(); this.inv.open = false; this.mapaAberto = false;
      }
      if (input.pressed('bag')) {
        this.inv.toggle(); this.journal.open = false; this.mapaAberto = false;
      }
      if (input.pressed('map')) {
        if (this.inv.has('map')) {
          this.mapaAberto = !this.mapaAberto;
          this.journal.open = false; this.inv.open = false;
          audio.pageTurn(0.9);
        } else this.player.say('map_none', 0, true);
      }
    }
    if (cap2 || cap3) {
      this.journal.update(paused ? 0 : dt);
      this.inv.update(paused ? 0 : dt);
    }
    if (cap2) {
      this.shiftPuzzle.update(paused ? 0 : dt);
      this.chaseSetpieces.update(paused ? 0 : dt, this);
      this.chaseSequence.update(paused ? 0 : dt, this);
      this.finishers.update(paused ? 0 : dt, this);
    }
    this.mapaFade = clamp((this.mapaFade || 0) + (this.mapaAberto ? dt * 8 : -dt * 9), 0, 1);
    const uiAberta = this.journal.open || this.inv.open || this.mapaAberto || this.shiftPuzzle.open;

    if (!paused) {
      lv.update(sim);
      this.dialogue.update(sim);
      if (this.scene) {
        this.scene.update(sim);
        if (this.scene.finished) {
          const era = this.scene;
          this.scene = null;
          // A cena da nota devolve o jogador algemado; as do Capitulo 2
          // devolvem ele de pe.
          if (era instanceof NoteScene) this.player.controllable = false;
        }
      }
      if (this.qte) this.updateQte(sim);
      if (this.grab) this.updateGrab(sim);
      if (this.emboscada > 0) {
        this.emboscada -= sim;
        if (this.emboscada <= 0) this.dispararEmboscada();
      }
      let prendendo = false;
      if (this.escondido) prendendo = this.updateEsconderijo(sim);
      const canControl = !this.dialogue.active && !this.transition && !this.scene
        && !this.qte && !this.grab && !this.chaseSetpieces.action && !this.chaseSequence.action
        && !this.finishers.action && !uiAberta && !this.escondido;
      if (lv.materialAt) this.player.stepMaterial = lv.materialAt(this.player.x);
      this.player.update(sim, lv, canControl);
      if (cap2) this.updateCh2(sim, lv, prendendo);
      if (this.flags.cap3) this.updateCh3(sim, lv);
    if (this.avisoT > 0) this.avisoT -= sim;
      // Numa conversa a camera sobe. A caixa de dialogo ocupa o terco de
      // baixo da tela, e sem isso quem esta falando com voce fica escondido
      // atras da propria fala.
      //
      // E ela sobe no incendio pelo mesmo motivo, com um agravante: a porta
      // cede e ele cai NO CHAO. Deitado, o corpo inteiro ficava atras da
      // legenda e da faixa preta de baixo — o jogador ouvia a porta ceder e
      // via um vao vazio. De quebra, com a camera mais alta cabe o telhado
      // pegando fogo, que e a unica coisa que diz que a casa acabou.
      this.cam.offsetY = this.fogo.ativo ? 30 : (this.dialogue.talk ? 40 : 0);
      this.cam.follow(this.player.x, 0, this.player.facing, sim, Math.abs(this.player.vx) > 4);
      this.checkBarks(lv);
      this.updateRandomSfx(lv, sim);
      this.rain.update(sim, this.cam.x);
      this.fog.update(sim, lv.t);
      this.fx.update(sim);
      if (lv.indoor) this.dust.update(sim, lv.t);
      // luz do beco vem de cima e da esquerda; no bar, da lampada
      this.player.det.rimColor = lv.indoor ? '#e8b46a' : '#7fa5d8';
      this.player.det.rimDX = lv.indoor ? -1 : 1;
    }

    this.pause.update(dt);

    // ---- desenho ----
    const cam = this.cam;
    gfx.begin('#05060a');
    lv.drawBack(gfx.s, cam);
    if (lv.drawProps) lv.drawProps(gfx.s, cam);
    // A casa queimando fica ATRAS do personagem: ele esta na varanda, de
    // costas para ela. O fogo e uma parede de luz entre o jogador e o que
    // aconteceu la dentro — e continua sem mostrar nada de dentro.
    if (this.fogo.ativo) this.fogo.draw(gfx.s, cam, this, lv);
    if (cap2) this.drawBloodDecals(gfx.s, cam, lv.key);
    if (cap2) this.chaseSetpieces.draw(gfx.s, cam, this, lv);
    if (cap2) this.chaseSequence.draw(gfx.s, cam, this, lv);
    if (cap2) this.finishers.draw(gfx.s, cam, this, lv);
    if (cap2) this.drawCinematicShadows(gfx.s, cam, lv);
    // Gente e inimigos vao ANTES do jogador: num corredor estreito o
    // personagem do jogador nunca pode ficar escondido atras de nada.
    //
    // 🐛 Isto estava dentro do `if (cap2)`. As pessoas do Capitulo 3
    // existiam, tinham conversa e tinham caixa de interacao — e NAO ERAM
    // DESENHADAS. O jogador conversava com o ar.
    for (const id of Object.keys(this.npcs)) {
      const n = this.npcs[id];
      if (n.cfg.level === lv.key) n.draw(gfx.s, cam, lv.groundY);
    }
    if (cap2) {
      this.director.draw(gfx.s, cam);
      this.chase.draw(gfx.s, cam, lv.key);
      if (this.credorParado) this.drawCredorParado(gfx.s, cam);
    }
    // 🐛 O JOGADOR ATRAVESSANDO A CELA E O BALCAO.
    //
    // Nao era colisao: era ORDEM DE DESENHO. A grade da custodia e a frente
    // da guarita sao camadas de primeiro plano em paralaxe 1:1 — elas
    // existem para o PRESO ficar atras das barras e o PLANTONISTA ficar
    // atras do vidro. So que a camada e desenhada depois de todo mundo, e o
    // David ia junto: parado no corredor ele aparecia por tras da grade, ou
    // seja, DENTRO da cela; parado na recepcao ele aparecia por tras do
    // balcao, ou seja, dentro da guarita.
    //
    // Colisao nao resolveria isso e ainda partiria as duas salas ao meio: o
    // corredor passa NA FRENTE da cela, e bloquear o vao da cela deixaria o
    // livro de visitas inalcancavel. O que estava errado era so quem vem
    // por cima de quem.
    //
    // Nestes setores o primeiro plano entra ANTES do jogador: os outros
    // continuam atras das barras, e ele passa na frente delas.
    if (lv.playerSobreFore) lv.drawFore(gfx.s, cam);
    this.player.draw(gfx.s, cam);
    if (this.scene) this.scene.draw(gfx.s, cam);
    this.fx.draw(gfx.s, cam.ix, cam.iy);
    if (lv.indoor) this.dust.draw(gfx.s);
    else this.fog.draw(gfx.s);
    if (lv.weather === 'rain') this.rain.draw(gfx.s);
    if (!lv.playerSobreFore) lv.drawFore(gfx.s, cam);
    if (cap2) this.chaseSequence.drawFore(gfx.s, cam, this, lv);

    gfx.beginLights(lv.ambient);
    lv.addLights(gfx, cam);
    // "Luz de heroi": um halo fraquissimo colado no personagem. Nao existe
    // no mundo, existe para o jogador nunca perder o proprio corpo de vista
    // num jogo que e quase todo escuro.
    gfx.addLight(this.player.x - cam.ix, this.player.y - cam.iy - 30, 86,
      lv.indoor ? '#a88458' : '#8f8d84', 0.26, 1.45);
    for (const L2 of this.player.lights(cam)) gfx.addLight(L2.x, L2.y, L2.r, L2.color, L2.i);
    // O isqueiro e a lanterna dele na camara fria — e ele so aguenta
    // alguns segundos aceso por vez.
    if (this.isqueiroT > 0) {
      const fx2 = this.player.x - cam.ix + this.player.facing * 8;
      const fy2 = this.player.y - cam.iy - 40;
      const tremor = 0.78 + Math.sin(lv.t * 21) * 0.1 + Math.random() * 0.12;
      const fim = clamp(this.isqueiroT, 0, 1);
      gfx.addLight(fx2, fy2, 64 * fim, PAL.flame, 0.95 * tremor * fim);
      gfx.addLight(fx2, fy2, 16, '#fff0c0', 0.9 * fim);
    }
    if (lv.casaco > 0) {
      gfx.addLight(lv.casacoX - cam.ix, lv.casacoY - cam.iy, 66,
        PAL.flame, 0.55 * lv.casaco * (this.isqueiroT > 0 ? 1 : 0.3));
    }
    if (this.scene) this.scene.addLights(cam);
    if (this.fogo.ativo) this.fogo.addLights(gfx, cam, lv);
    gfx.endLights(lv.bloom);

    // A CAMERA FECHA NO INTERROGATORIO. Entre a luz e a interface: assim o
    // mundo chega perto e o texto continua do tamanho certo. (D-10)
    if (this.interrog.ativo) {
      const alvo = this.npcs.carlos;
      const fx3 = alvo ? ((this.player.x + alvo.x) / 2 - cam.ix) : (this.player.x - cam.ix);
      gfx.aproximar(this.interrog.zoom, fx3, lv.groundY - 34 - cam.iy);
    }

    // ---- interface ----
    if (this.locCard > 0) {
      const a = clamp(Math.min(this.locCard, 4.0 - this.locCard + 3.4), 0, 1);
      drawLocationCard(gfx.s, lv.nameKey, this.flagsFirst ? 'chapter_1' : null, a);
    }

    // O balao fica acima da CABECA do detetive, nao acima do objeto: quase
    // sempre ele esta colado no objeto, e em cima do objeto o balao tapava
    // justamente o personagem.
    // 🐛 O balao de interacao aparecia DURANTE as cenas do Capitulo 3: com a
    // casa pegando fogo e o jogador sem controle nenhum, a porta continuava
    // oferecendo "ABRIR". Prompt so existe quando ha o que apertar.
    const near = (!this.dialogue.active && !paused && !this.scene && !this.qte
      && !this.grab && !this.chaseSetpieces.action && !this.chaseSequence.action
      && !this.finishers.action && !uiAberta && !this.escondido
      && !this.fogo.ativo && !this.interrog.ativo && !this.namePrompt.ativo
      && this.player.controllable)
      ? lv.nearest(this.player.x) : null;
    this.promptA = lerp(this.promptA || 0, near ? 1 : 0, 1 - Math.exp(-14 * dt));
    if (this.promptA > 0.02 && near) {
      drawPrompt(gfx.s, this.player.x - cam.ix, this.player.y - cam.iy - 70,
        near.prompt, this.promptA, lv.t);
    }

    // Fala curta como legenda de jogo. Nada flutua sobre o personagem e o
    // fundo acompanha apenas o tamanho da frase, sem cobrir o cenario.
    const fa = this.player.floatAlpha();
    if (fa > 0) {
      const ft = this.player.floatText;
      const fala = `${T('speaker_me')}: ${T(ft.key)}`;
      const estilo = { size: 9, font: 'ui', weight: 'normal' };
      const linhas = wrap(fala, VW - 48, estilo);
      const maxW = Math.max(...linhas.map(s => measure(s, estilo).w));
      const fy = VH - 31 - (linhas.length - 1) * 12;
      gfx.s.save();
      gfx.s.globalAlpha = fa * 0.62;
      gfx.s.fillStyle = '#050407';
      gfx.s.fillRect(Math.round(VW / 2 - maxW / 2 - 7), Math.round(fy - 4), maxW + 14, linhas.length * 12 + 6);
      gfx.s.restore();
      for (let i = 0; i < linhas.length; i++) {
        text(gfx.s, linhas[i], VW / 2, fy + i * 12, {
          ...estilo, color: '#f2ede4', align: 'center', alpha: fa,
          shadow: true, shadowColor: '#000000', shadowAlpha: 1,
        });
      }
    }

    if (this.scene) this.scene.drawUI(gfx.s);
    if (this.qte) this.drawQteUI(gfx.s);
    if (this.grab) this.drawGrabUI(gfx.s);
    if (cap2) this.chaseSetpieces.drawUI(gfx.s);
    if (cap2) this.chaseSequence.drawUI(gfx.s);
    if (cap2) this.finishers.drawUI(gfx.s);
    if (this.flags && this.flags.combat_lab) this.drawCombatLabUI(gfx.s);
    if (!paused && !this.scene && !this.qte && !uiAberta) this.drawGunUI(gfx.s, cam);
    if (cap2 && !this.scene) this.drawCh2UI(gfx.s);
    // 🐛 O aviso de "peguei alguma coisa" morava dentro do HUD do Capitulo
    // 2. No 3 ele nunca aparecia: pegar a calibre doze nao dizia nada, e o
    // jogador ficava sem saber se tinha pegado.
    if (this.flags.cap3 && !this.scene) {
      this.journal.drawToast(gfx.s);
      this.inv.drawToast(gfx.s);
    }
    if (!this.scene) this.drawAviso(gfx.s);
    // O painel de senha e um LED: e desenhado DEPOIS da luz, senao a
    // multiplicacao apaga o digito. O numero muda, entao ele nao pode viver
    // na camada pintada da fase.
    if (this.flags.cap3 && lv.key === 'ch3_reception') {
      this.ticket.draw(gfx.s, cam, 744, 96);
    }

    // Poupa o personagem do grao e das scanlines (ver gfx._post).
    gfx.protect = {
      x: Math.round(this.player.x - cam.ix) - 26,
      y: Math.round(this.player.y - cam.iy) - 76,
      w: 52, h: 80,
    };

    this.dialogue.draw(gfx.s);
    if (cap2 || this.flags.cap3) {
      this.journal.draw(gfx.s); this.inv.draw(gfx.s); this.drawMapa(gfx.s);
    }
    if (cap2) this.shiftPuzzle.draw(gfx.s);
    if (this.flags.cap3) this.namePrompt.draw(gfx.s);
    if (this.interrog.ativo) this.interrog.draw(gfx.s, this);
    this.pause.draw(gfx.s);
    if (this.debug) this.drawDebug(gfx.s, 'PLAY ' + lv.key);
    gfx.present(dt);
  }

  // Linha de mira e contador de balas.
  //
  // A linha existe porque nao ha mira na tela: sem ela o jogador nao tem
  // como saber para onde o cano esta apontando antes de gastar a bala.
  // Ela e pontilhada e fraca de proposito — e uma nocao, nao um laser.
  drawGunUI(ctx, cam) {
    const p = this.player;

    if (p.aiming) {
      const rad = p.aimAngle * Math.PI / 180;
      const ox = p.x - cam.ix + p.facing * 26;
      const oy = p.y - cam.iy - 48 - Math.sin(rad) * 10;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let d = 6; d < 130; d += 7) {
        const a = 0.42 * (1 - d / 130);
        ctx.globalAlpha = a;
        ctx.fillStyle = '#d8a860';
        ctx.fillRect(Math.round(ox + p.facing * d), Math.round(oy - Math.tan(rad) * d), 1, 1);
      }
      ctx.restore();
    }

    if (p.ammoHud > 0 || p.aiming) {
      const a = p.aiming ? 1 : clamp(p.ammoHud, 0, 1);
      const x = VW - 16, y = VH - 20;
      ctx.save();
      ctx.globalAlpha = a;
      for (let i = 0; i < p.clipSize; i++) {
        const bx = x - (p.clipSize - i) * 5;
        ctx.fillStyle = i < p.ammo ? '#e8c88a' : '#3a332c';
        ctx.fillRect(bx, y, 3, 6);
        if (i < p.ammo) { ctx.fillStyle = '#fff0c8'; ctx.fillRect(bx, y, 3, 1); }
      }
      text(ctx, String(p.reserve), x - p.clipSize * 5 - 6, y - 2, {
        size: 9, font: 'ui', weight: 'bold', color: PAL.uiDim, align: 'right', alpha: a,
      });
      if (p.gun === 'reloading') {
        text(ctx, 'R', x - p.clipSize * 5 - 6, y - 2, {
          size: 9, font: 'ui', weight: 'bold', color: PAL.uiAccent, align: 'right', alpha: a,
        });
      }
      ctx.restore();
    }
  }

  // Sons soltos do lugar: uma gota, uma chapa de metal cedendo, uma porta
  // longe. Espacados de forma irregular — som que chega em intervalo certo
  // deixa de ser ambiente e vira metronomo.
  updateRandomSfx(lv, dt) {
    if (!lv.randomSfx || !this.randomSfxT) return;
    for (let i = 0; i < lv.randomSfx.length; i++) {
      const r = lv.randomSfx[i];
      this.randomSfxT[i] -= dt;
      if (this.randomSfxT[i] <= 0) {
        this.randomSfxT[i] = r.min + Math.random() * (r.max - r.min);
        const fn = audio[r.fn];
        if (fn) fn.call(audio, r.vol === undefined ? 1 : r.vol);
      }
    }
  }

  // Falas de passagem: dispara quando o jogador cruza um ponto da fase.
  // Cada uma so uma vez por visita — repetir piada mata a piada.
  checkBarks(lv) {
    if (!lv.barks) return;
    for (let i = 0; i < lv.barks.length; i++) {
      const b = lv.barks[i];
      if (b.done) continue;
      if (Math.abs(this.player.x - b.x) < (b.range || 40)) {
        b.done = true;
        this.flags.barks = this.flags.barks || {};
        this.flags.barks[`${lv.key}:${i}`] = true;
        this.player.sayAll(Array.isArray(b.key) ? b.key : [b.key]);
      }
    }
  }

  doInteract(it) {
    if (it.action === 'enter_bar') {
      audio.doorCreak(0.9);
      this.fadeTo(() => {
        this.enterLevel('bar', null, 1);
        audio.doorSlam(0.5);
      }, 0.7, 0.9);
      return;
    }
    if (it.action === 'exit_bar') {
      audio.doorCreak(0.9);
      this.fadeTo(() => {
        this.enterLevel('alley', this.levels.alley.doorX - 26, -1);
      }, 0.7, 0.9);
      return;
    }
    if (it.action === 'enter_back') {
      audio.doorCreak(0.8);
      this.fadeTo(() => this.enterLevel('backroom', null, 1), 0.7, 0.9);
      return;
    }
    if (it.action === 'exit_back') {
      audio.doorCreak(0.8);
      this.fadeTo(() => this.enterLevel('bar', 900, -1), 0.7, 0.9);
      return;
    }
    if (it.action === 'read_note') {
      this.startNoteScene();
      return;
    }
    if (it.action === 'take_pipe') {
      this.flags.pipe = true;
      it.disabled = true;
      audio.reloadClick(0.6);
      this.player.say('bark_pipe_take', 2.0, true);
      return;
    }
    if (it.action === 'pry_door') {
      if (!this.flags.pipe) {
        this.player.say('bark_door_pry', 2.6, true);
        audio.doorSlam(0.35);
        gfx.shake(1.6, 0.2);
        return;
      }
      // com o cano na mao: arranca as tabuas
      audio.strain(1);
      gfx.shake(3, 0.4);
      this.fx.burst(18, () => ({
        x: this.player.x + this.player.facing * 20 + Math.random() * 10,
        y: this.level.groundY - 40 - Math.random() * 40,
        vx: this.player.facing * (30 + Math.random() * 80), vy: -40 + Math.random() * 80,
        ay: 260, life: 0.6, size: 1, color: '#43301e', a: 1, fade: 1,
      }));
      setTimeout(() => audio.doorCreak(1), 260);
      // Ele sai. E o galpao e muito maior do que ele pensava.
      this.fadeTo(() => this.startChapter2(), 1.4, 0.01);
      return;
    }
    if (it.action === 'goto') {
      // Porta que pede chave. E o que impede o jogador de topar com o
      // Credor antes de ter com que se defender.
      if (it.precisa && !this.flags[it.precisa]) {
        audio.doorSlam(0.4);
        gfx.shake(1.4, 0.18);
        this.player.say(it.semChave || 'b2_trancado', 0, true);
        // Porta que recusa por causa de um pertence explica O QUE falta.
        if (it.aviso) this.aviso(it.aviso, 0);
        return;
      }
      audio.doorCreak(it.sfx === 'heavy' ? 0.5 : 0.9);
      if (it.sfx === 'heavy') audio.metalCreak(1);
      const urgente = this.chase.ativo;
      this.fadeTo(() => {
        this.enterLevel(it.to, it.tox, it.tofacing);
        if (it.isDoor) audio.doorSlam(0.45);
      }, urgente ? 0.12 : 0.28, urgente ? 0.24 : 0.42);
      return;
    }
    if (this.doInteractCh2(it)) return;
    if (it.lines) {
      this.flags.examinado = this.flags.examinado || {};
      const vistoKey = `${this.level.key}:${it.id || it.lines}:${Math.round(it.x || 0)}`;
      if (this.flags.examinado[vistoKey]) return;
      this.flags.examinado[vistoKey] = true;
      const arr = LINES[it.lines] || [];
      this.dialogue.start(arr.map((_, i) => ({ name: null, text: L(it.lines, i) })));
    }
  }

  // -------------------------------------------------------------------
  // a cena da nota
  // -------------------------------------------------------------------

  startNoteScene() {
    this.scene = new NoteScene(this.player, this.fx);
    this.scene.onWake = () => {
      this.enterLevel('warehouse', null, 1);
      this.player.frozen = true;
      this.player.controllable = false;
      this.player.det.play('cuffed', { blend: 0 });
      // levaram tudo: nem arma, nem coldre cheio
      this.player.hasGun = false;
      this.player.gun = 'holstered';
      this.player.ammo = 0; this.player.reserve = 0;
      this.player.det.props.gun = 'none';
      this.locCard = 0;
    };
    // So depois das palpebras abrirem: antes disso as falas ficavam
    // escondidas atras do preto e ninguem lia nenhuma.
    this.scene.onAwake = () => {
      this.locCard = 4.5;
      this.player.sayAll(['bark_cell_1', 'bark_cell_2', 'bark_cell_3'], true);
      this.qte = { prog: 0, last: null, t: 0, hint: 0 };
    };
    this.scene.start(this.level);
  }

  // -------------------------------------------------------------------
  // o QTE de se soltar do cano
  // -------------------------------------------------------------------

  updateQte(dt) {
    const q = this.qte, p = this.player;
    q.t += dt;
    q.hint = Math.min(1, q.hint + dt * 1.4);

    // A alternancia e o que importa: martelar a mesma tecla nao adianta.
    const a = input.pressedFrame.has('KeyA') || input.pressedFrame.has('ArrowLeft');
    const d = input.pressedFrame.has('KeyD') || input.pressedFrame.has('ArrowRight');
    let puxou = false;
    if (a && q.last !== 'A') { q.last = 'A'; puxou = true; }
    else if (d && q.last !== 'D') { q.last = 'D'; puxou = true; }

    if (puxou) {
      // Numeros calibrados para MAO HUMANA. Antes eram 0.058 por toque
      // contra 0.20/s de queda: alternando a 4 toques por segundo o saldo
      // era +0.03/s, ou seja meio minuto de martelada. Agora 4 toques por
      // segundo enchem a barra em cerca de tres segundos.
      q.prog = clamp(q.prog + 0.085, 0, 1);
      q.pull = 0.16;
      audio.strain(0.7 + q.prog * 0.5);
      if (Math.random() < 0.4) audio.chainRattle(0.5);
      gfx.shake(0.6 + q.prog * 1.6, 0.12);
    }
    // Trava de catraca: o progresso nunca cai abaixo do quarto ja
    // conquistado. Sem isso, quem martela devagar fica preso para sempre e
    // o jogo vira um teste de dedo, nao de tensao.
    q.floor = Math.max(q.floor || 0, Math.floor(q.prog * 4) / 4);
    q.prog = Math.max(q.floor, q.prog - dt * 0.09);
    if (q.pull > 0) q.pull -= dt;

    const puxando = q.pull > 0;
    if (puxando && p.det.anim !== 'strainCuffs') p.det.play('strainCuffs', { blend: 0.08 });
    else if (!puxando && q.prog < 0.02 && p.det.anim !== 'cuffed') p.det.play('cuffed', { blend: 0.3 });
    p.det.speed = 1 + q.prog;
    p.det.update(dt);

    if (q.prog >= 1) this.breakFree();
  }

  breakFree() {
    const p = this.player, lv = this.level;
    this.qte = null;
    audio.pipeBurst(1);
    gfx.shake(4.5, 0.6);
    // ferrugem e agua saindo do cano arrebentado
    this.fx.burst(30, () => ({
      x: p.x + 8 + Math.random() * 26, y: lv.pipeY + 2,
      vx: 40 + Math.random() * 90, vy: -20 + Math.random() * 60, ay: 260,
      life: 0.5 + Math.random() * 0.7, size: 1,
      color: Math.random() > 0.5 ? '#6b8ba8' : '#6e4728', a: 0.9, fade: 1.1,
    }));

    p.frozen = false;
    p.controllable = true;
    p.det.play('idle', { blend: 0.4 });
    // De pe, mas sem nada. So a partir daqui o ocio dele vira sentar — e
    // ainda assim so depois de um tempo em pe, como quem cansa de esperar.
    p.idleMode = 'sit';
    lv.minX = lv.freeMinX;
    lv.maxX = lv.freeMaxX;
    lv.interactables = lv.interLivre;
    for (const b of (lv.barks || [])) b.done = false;
    p.sayAll(['bark_free_1', 'bark_free_2', 'bark_free_3'], true);
  }

  drawQteUI(ctx) {
    const q = this.qte;
    if (!q) return;
    const a = q.hint;
    const w = 108, h = 6;
    const x = (VW - w) / 2, y = VH - 52;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#0c0a0b';
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = '#2a2320';
    ctx.fillRect(x, y, w, h);
    const g2 = ctx.createLinearGradient(x, 0, x + w, 0);
    g2.addColorStop(0, '#7a2a22');
    g2.addColorStop(1, '#c8503a');
    ctx.fillStyle = g2;
    ctx.fillRect(x, y, Math.round(w * q.prog), h);
    ctx.restore();
    const pisca = q.last === 'A' ? 0 : 1;
    text(ctx, T('qte_hint'), VW / 2, y - 14, {
      size: 9, font: 'ui', weight: 'bold', color: pisca ? '#e8e0d2' : PAL.uiAccent,
      align: 'center', track: 3, alpha: a, shadow: true,
    });
  }

  // Fim do trecho jogavel. Cartao preto, e volta para o menu.
  endOfChapter() {
    this.state = 'endcard';
    this.endT = 0;
    this.qte = null;
    this.scene = null;
    audio.stopAllLoops();
    audio.stopDread(0.2);
  }

  updateEndCard(dt) {
    this.endT += dt;
    gfx.begin('#000');
    const a = clamp(this.endT - 0.4, 0, 1) * clamp(4.6 - this.endT, 0, 1);
    text(gfx.s, T('to_be_continued'), VW / 2, VH / 2 - 6, {
      size: 13, font: 'serif', color: PAL.uiText, align: 'center', track: 4, alpha: a,
    });
    gfx.fade = 0;
    gfx.present(dt);
    if (this.endT > 5.2) this.toMenu();
  }

  // ===================================================================
  // CAPITULO 2 — "GENTILEZA"
  // ===================================================================

  resetChapter2() {
    this.sanity.enabled = false;
    this.sanity.reset(100);
    this.journal.reset();
    this.inv.reset();
    this.shiftPuzzle.reset();
    this.director.reset();
    this.director.ligado = false;
    this.chase.parar();
    this.chaseSetpieces.reset();
    this.chaseSequence.reset(this);
    this.finishers.reset();
    this.grab = null;
    this.cigTentativas = 0;
    this.escondido = null;
    this.isqueiroT = 0;
    this.credorParado = null;
    this.fugaPendente = null;
    this.bloodDecals = [];
    if (this.player && this.player.det) this.player.det.blood = 0;
    if (this.player && this.player.det) { this.player.det.coatTorn = false; this.player.det.injury = 0; }
    for (const id of Object.keys(this.npcs)) {
      this.npcs[id].falado = false;
      this.npcs[id].reviver();
    }
  }

  // Preto, "CAPITULO DOIS", e embaixo o nome. Mesma tipografia corroida do
  // titulo do jogo.
  startChapter2() {
    this.state = 'chapcard';
    this.chapT = 0;
    this.chapNum = 2;
    this.qte = null;
    this.scene = null;
    audio.stopAllLoops();
    audio.stopDread(0.2);
    this.flags.cap2 = true;
    if (!this.flags.supplies) this.flags.supplies = this.supplies.newRun();
    else this.supplies.apply(this.flags.supplies);
    // A sanidade existia desde o Capitulo 1; e aqui que ela comeca a se
    // mexer o bastante para o jogador perceber que ela existia.
    this.sanity.enabled = true;
    this.sanity.reset(100);
    this.player.hp = 100;
    this.player.idleMode = 'sit';
  }

  // Preto, "CAPITULO TRES", e embaixo GAVETA D.
  startChapter3() {
    this.state = 'chapcard';
    this.chapT = 0;
    this.chapNum = 3;
    this.qte = null;
    this.scene = null;
    audio.stopAllLoops();
    audio.stopDread(0.2);
    this.flags.cap2 = false;
    this.flags.cap3 = true;
    this.resetChapter3();
  }

  updateChapCard(dt) {
    this.chapT += dt;
    const cap3 = this.chapNum === 3;
    gfx.begin('#000');
    const a = clamp(this.chapT - 0.5, 0, 1) * clamp(4.6 - this.chapT, 0, 1);
    text(gfx.s, T(cap3 ? 'chapter_3' : 'chapter_2'), VW / 2, VH / 2 - 16, {
      size: 9, font: 'ui', weight: 'bold', color: PAL.uiDim,
      align: 'center', track: 6, alpha: a,
    });
    text(gfx.s, T(cap3 ? 'chapter_3_name' : 'chapter_2_name'), VW / 2, VH / 2 - 2, {
      size: 20, font: 'serif', color: PAL.uiText, align: 'center', track: 2, alpha: a,
    });
    // o fio vermelho, do mesmo vermelho que so o sangue e o titulo tem
    ctxLinha(gfx.s, VW / 2, VH / 2 + 26, 46 * a, a * 0.8);
    gfx.fade = 0;
    gfx.present(dt);
    if (this.chapT > 5.0) {
      this.state = 'play';
      this.enterLevel(cap3 ? 'ch3_reception' : 'ch2_corridor', null, 1);
      this.locCard = 4.5;
      gfx.fade = 1;
      this.transition = { t: 0, phase: 'in', outDur: 0.01, inDur: 1.2, action: null };
    }
  }

  // -------------------------------------------------------------------
  // ao entrar num setor do capitulo
  // -------------------------------------------------------------------

  // O NPC daquele setor entra na lista de coisas com que da para interagir.
  // Nao ha lista separada: para o jogo, gente e cenario que responde.
  _porGenteNaFase(lv) {
    for (const id of Object.keys(this.npcs)) {
      const n = this.npcs[id];
      if (n.cfg.level !== lv.key) continue;
      n.falado = !!this.flags['npc_falado_' + id] || n.falado;
      if (this.flags['npc_morto_' + id] && n.alive) n.matar();
      let hook = lv.interactables.find(i => i.npc === id);
      if (!hook) { hook = n.gancho(); lv.interactables.push(hook); }
      hook.disabled = !n.alive;
    }
  }

  entrouCh2(lv) {
    const cap2 = lv.key.slice(0, 4) === 'ch2_';
    this.director.limpar();
    this.escondido = null;
    this.isqueiroT = 0;
    this.fugaPendente = null;
    this.frio = lv.frio ? { fase: this.flags.frioFase || 0, t: 0 } : null;
    if (!cap2) {
      this.director.ligado = false;
      // 🐛 Aqui havia um `return` seco. As pessoas do Capitulo 3 nunca
      // recebiam gancho de interacao, porque o laco que insere gente na
      // fase mora no fim desta funcao — depois da saida antecipada. Era a
      // segunda metade do mesmo bug de elas nao serem desenhadas.
      this._porGenteNaFase(lv);
      return;
    }

    // Sair do mezanino arma a fuga, mas nao congela David na soleira. Ele
    // entra e caminha um trecho da sala de maquinas antes do ataque.
    if (this.flags.telefonista && this.player.hasGun && !this.flags.fuga && lv.key === 'ch2_machines') {
      this.flags.fuga_preparada = true;
      this.fugaPendente = { level: lv.key, entryX: this.player.x };
      audio.startLoop('serra', { gain: 0.025, fade: 2.2 });
      if (!this.flags.fuga_aviso) {
        this.flags.fuga_aviso = true;
        audio.metalCreak(1.1);
        this.player.say('b2_escape_door', 0, true);
      }
    }

    this.director.ligado = !this.chase.ativo && !(this.scene instanceof ChaseIntro) && !this.fugaPendente;
    this.director.reset(lv.safe ? 999 : 4.5);

    // Pegar uma coisa e sair de uma sala ganham de ler a parede. Sem isso o
    // cartaz colado do lado da porta rouba o "E" da porta.
    for (const it of lv.interactables) {
      if (it.prio !== undefined) continue;
      if (it.action === 'goto' || it.action === 'sair') it.prio = 1;
      else if (typeof it.action === 'string' && it.action.slice(0, 5) === 'take_') it.prio = 1;
    }

    // Os tres reles vivem tanto no estado visual da sala quanto nas flags
    // do caso. Sincronizar os dois lados torna saves antigos e reloads no
    // meio da busca deterministas.
    for (const it of lv.interactables) {
      if (it.action !== 'take_relay') continue;
      const flag = 'relay_' + it.relay;
      if (lv.pego && lv.pego[it.id]) this.flags[flag] = true;
      if (this.flags[flag]) {
        it.disabled = true;
        if (lv.pego) lv.pego[it.id] = true;
      }
    }
    // Os reles sao evidencias fisicas e aparecem nos tres encaixes centrais
    // do casaco ate David instala-los no painel. Isto tambem reconstrói o
    // inventario corretamente ao carregar saves antigos.
    if (this.flags.puzzle_solved) this.flags.relays_installed = true;
    if (!this.flags.relays_installed) {
      for (const nome of ['hand', 'eye', 'voice']) {
        const key = 'relay_' + nome;
        if (this.flags[key] && !this.inv.has(key)) this.inv.add(key);
      }
    }

    // O armario da chave comeca magneticamente fechado. Depois do circuito,
    // entrar de novo na sala devolve exatamente o estado correto: chave
    // visivel se ainda nao foi pega, ausente se ja esta com o jogador.
    if (lv.key === 'ch2_security') {
      const key = lv.interactables.find(i => i.id === 'chave');
      const gone = !!this.flags.chave || !!(lv.pego && lv.pego.chave);
      lv.keyVisible = !!this.flags.puzzle_solved && !gone;
      if (key) key.disabled = !lv.keyVisible;
    }

    // O primeiro deles aparece SOZINHO, e o jogo deixa o jogador olhar
    // para ele por uns segundos antes de ele reagir.
    if (lv.key === 'ch2_shelves' && !this.flags.primeiro) {
      this.flags.primeiro = true;
      this.director.forcar('empilhado', 470, lv.groundY);
      this.director.calma = 50;
      this.primeiroVisto = false;
    }

    this._porGenteNaFase(lv);

    // O papel com a senha só existe depois da morte do zelador.
    if (lv.key === 'ch2_office') {
      const note = lv.interactables.find(i => i.id === 'safe_code_note');
      if (note) note.disabled = !this.flags.npc_morto_vigia || !!this.flags.safe_code;
      const safe = lv.interactables.find(i => i.id === 'safe');
      if (safe) { safe.opened = !!this.flags.safe_open; safe.disabled = false; }
    }

    if (lv.key === 'ch2_mezz') {
      const reward = lv.interactables.find(i => i.id === 'mezz_reward');
      if (reward) reward.disabled = !this.flags.puzzle_solved || !!this.flags.mezz_reward;
      const drop = lv.interactables.find(i => i.id === 'operator_drop');
      if (drop) drop.disabled = !this.flags.npc_morto_operadora || !!this.flags.operator_drop;
    }

    // Esconderijos: so servem quando ha de quem se esconder.
    if (lv.esconderijos && !lv._esc) {
      lv._esc = lv.esconderijos.map(x => ({
        x: x - 12, y: lv.groundY - 60, w: 24, h: 60,
        prompt: 'prompt_hide', action: 'hide', range: 26, disabled: true,
      }));
      for (const e of lv._esc) lv.interactables.push(e);
    }
    if (lv._esc) for (const e of lv._esc) e.disabled = !this.chase.ativo;

    // O portao da doca so abre quando o mapa ja virou armadilha.
    const doca = lv.interactables.find(i => i.id === 'doca');
    if (doca) {
      if (this.chase.ativo) {
        doca.prompt = 'prompt_open';
        doca.action = 'chase_gate'; doca.to = null; doca.tox = null; doca.tofacing = 1;
        doca.prio = 5;
        doca.lines = null;
      } else {
        doca.prompt = 'prompt_look';
        doca.action = null; doca.lines = 'c2_dockgate';
      }
    }
    this.chaseSetpieces.enter(this, lv);
  }

  // -------------------------------------------------------------------
  // interacoes do capitulo
  // -------------------------------------------------------------------

  doInteractCh2(it) {
    const p = this.player;
    if (this.chaseSequence.interact(this, it)) return true;
    if (this.chaseSetpieces.interact(this, it)) return true;
    switch (it.action) {
      case 'take_club':
        it.disabled = true;
        this.level.pego.porrete = true;
        this.inv.hand = 'club';
        p.segurarPorrete(true);
        audio.leather(0.7);
        // A PRIMEIRA VEZ que ele percebe a conveniencia. Ele nao entende
        // ainda — so acha estranho. A partir daqui e um tema.
        p.sayAll(['b2_club_1', 'b2_club_2'], true);
        this.anotar('j_conv');
        return true;

      case 'take_journal':
        it.disabled = true;
        this.level.pego.caderno = true;
        this.flags.caderno = true;
        audio.pageTurn(1);
        p.sayAll(['b2_diary_1', 'b2_diary_2', 'b2_diary_3'], true);
        // O caderno chega ja com o que ele carrega desde o Capitulo 1.
        this.journal.add('j_phone');
        this.journal.add('j_note');
        this.journal.add('j_locked');
        return true;

      case 'take_map':
        it.disabled = true;
        this.level.pego.mapa = true;
        this.pegar('map');
        p.sayAll(['b2_map_1', 'b2_map_2'], true);
        return true;

      case 'take_ammo':
        it.disabled = true;
        this.level.pego.municao = true;
        p.reserve += it.amount || 8;
        p.ammoHud = 4;
        // A jogada mais importante do capitulo: municao ANTES da arma. O
        // jogador vai carregar isso inutil por vinte minutos.
        p.sayAll(['b2_ammo_1', 'b2_ammo_2', 'b2_ammo_3'], true);
        this.anotar('j_ammo');
        return true;

      case 'take_supply': {
        const s = it.supply;
        if (!s) return true;
        let ok = true;
        if (s.type === 'ammo') {
          p.reserve += s.amount || 1;
          p.ammoHud = 4;
          p.say(this.flags.ammo_encontrada ? 'b2_ammo_more' : 'b2_ammo_1', 0, true);
          if (!this.flags.ammo_encontrada) { this.flags.ammo_encontrada = true; this.anotar('j_ammo'); }
        } else if (s.type === 'medkit') {
          ok = this.pegar('medkit');
          if (ok) p.say('b2_medkit', 0, true);
        } else if (s.type === 'sedative') {
          ok = this.pegar('sedative');
          if (ok) p.say('b2_sedative', 0, true);
        } else if (s.type === 'club') {
          this.inv.hand = 'club';
          this.inv.clubHp = 1;
          p.segurarPorrete(true);
          audio.leather(0.7);
          if (!this.flags.club_encontrado) {
            this.flags.club_encontrado = true;
            p.sayAll(['b2_club_1', 'b2_club_2'], true);
            this.anotar('j_conv');
          }
        }
        if (!ok) return true;
        it.disabled = true;
        if (this.level.pego) this.level.pego[it.id] = true;
        return true;
      }

      case 'take_document':
        it.disabled = true;
        if (this.level.pego) this.level.pego[it.id] = true;
        this.journal.addDocument(it.doc);
        return true;

      case 'take_safe_code':
        it.disabled = true;
        if (this.level.pego) this.level.pego[it.id] = true;
        this.flags.safe_code = true;
        this.journal.addDocument('d_code');
        p.say('b2_code_note', 0, true);
        return true;

      case 'safe':
        if (this.flags.safe_open) { audio.reloadClick(0.25); return true; }
        if (!this.flags.safe_code) {
          audio.doorSlam(0.3); p.say('b2_safe_locked', 0, true); return true;
        }
        this.flags.safe_open = true;
        it.opened = true;
        p.reserve += 8 + ((Math.random() * 7) | 0);
        this.pegar('medkit');
        this.pegar('sedative');
        this.journal.addDocument('d_safe');
        audio.metalCreak(0.8);
        p.say('b2_safe_open', 0, true);
        return true;

      case 'take_mezz_reward':
        it.disabled = true;
        if (this.level.pego) this.level.pego[it.id] = true;
        this.flags.mezz_reward = true;
        this.inv.upgrade = true;
        p.reserve += 6;
        this.pegar('medkit');
        this.pegar('sedative');
        this.journal.addDocument('d_mezz');
        p.say('b2_mezz_reward', 0, true);
        audio.uiConfirm();
        return true;

      case 'take_operator_drop':
        it.disabled = true;
        if (this.level.pego) this.level.pego[it.id] = true;
        this.flags.operator_drop = true;
        this.player.reserve += 5;
        this.player.ammoHud = 4;
        this.journal.addDocument('d_operator_drop');
        this.player.say('b2_operator_drop', 0, true);
        audio.pageTurn(0.75);
        return true;

      case 'radio': {
        this.flags.radio_touches = (this.flags.radio_touches || 0) + 1;
        if (this.flags.radio_touches === 1) {
          this.flags.radio_off = true;
          audio.stopLoop('static', 0.25);
          audio.reloadClick(0.5);
          p.say('b2_radio_off', 0, true);
        } else if (this.flags.radio_touches === 2) {
          audio.reloadClick(0.8);
          p.say('b2_radio_dead', 0, true);
        } else {
          audio.radioScreams(1.1);
          this.sanity.drain(16, true);
          p.say('b2_radio_scream', 0, true);
        }
        return true;
      }

      case 'take_cigs':
        it.disabled = true;
        this.level.pego.maco = true;
        this.pegar('cigs');
        this.pegar('lighter');
        p.sayAll(['b2_cig_1', 'b2_cig_2', 'b2_cig_3'], true);
        this.anotar('j_cigs');
        return true;

      case 'take_gun':
        it.disabled = true;
        this.level.pego.pistola = true;
        this.pegarPistola();
        return true;

      case 'take_relay': {
        it.disabled = true;
        if (this.level.pego) this.level.pego[it.id] = true;
        this.flags['relay_' + it.relay] = true;
        this.inv.add('relay_' + it.relay);
        // Se este era o terceiro rele, o telefone da mesma sala comeca a
        // tocar sem exigir que o jogador saia e volte apenas para atualizar
        // o gatilho narrativo.
        this.chaseSetpieces.enter(this, this.level);
        audio.reloadClick(0.72);
        const falas = {
          hand: ['b2_relay_hand_1', 'b2_relay_hand_2'],
          eye: ['b2_relay_eye_1', 'b2_relay_eye_2'],
          voice: ['b2_relay_voice_1', 'b2_relay_voice_2'],
        };
        p.sayAll(falas[it.relay] || ['b2_relay_generic'], true);
        this.anotar('j_relays');
        return true;
      }

      case 'puzzle_panel': {
        if (this.flags.puzzle_solved) {
          p.say('b2_puzzle_open', 0, true);
          return true;
        }
        const faltam = ['hand', 'eye', 'voice'].filter(k => !this.flags['relay_' + k]);
        if (faltam.length) {
          audio.doorSlam(0.25);
          p.say(faltam.length === 3 ? 'b2_puzzle_missing_all' : 'b2_puzzle_missing', 0, true);
          return true;
        }
        this.flags.relays_installed = true;
        for (const nome of ['hand', 'eye', 'voice']) this.inv.remove('relay_' + nome);
        this.journal.open = false;
        this.inv.open = false;
        this.mapaAberto = false;
        this.shiftPuzzle.start(this.flags.puzzleRot);
        return true;
      }

      case 'take_key':
        it.disabled = true;
        this.level.pego.chave = true;
        if (this.level.key === 'ch2_security') this.level.keyVisible = false;
        this.flags.chave = true;
        audio.reloadClick(1.2);
        p.sayAll(['b2_chave_1', 'b2_chave_2'], true);
        return true;

      case 'mirror':
        this.tentarEspelho(it);
        return true;

      case 'talk': {
        const npc = this.npcs[it.npc];
        if (!npc || !npc.alive) return true;
        const t = TALKS[npc.cfg.talk];
        if (!t) return true;
        const mem = this._talkMem(it.npc);
        // Conversa esgotada continua sem reabrir — era o ponto da correcao da
        // sessao 12. O que mudou e que "esgotada" virou uma pergunta de
        // verdade: se uma deducao nova abriu assunto, da para voltar la.
        if (npc.falado && !talkHasMore(t, mem.seen, mem.pressed, f => !!this.flags[f])) return true;
        this.dialogue.startTalk(t, {
          memory: mem.seen,
          pressed: mem.pressed,
          has: f => !!this.flags[f],
          // Insistir num assunto ja respondido cobra. E o unico jeito de
          // chegar em algumas respostas, e ele paga com a cabeca.
          onPress: () => { this.sanity.drain(5); },
          onDone: () => {
            this._salvarTalkMem(it.npc, mem);
            if (!npc.falado) {
              npc.falado = true;
              this.flags['npc_falado_' + it.npc] = true;
              if (it.npc === 'vigia') { this.anotar('j_vigia'); this.player.say('b2_vigia_bye', 3.0); }
              if (it.npc === 'operadora') {
                this.anotar('j_oper');
                this.player.say('b2_mezz_4', 3.0);
                this.flags.telefonista = true;
              }
            }
          },
        });
        return true;
      }

      case 'hide':
        this.entrarEsconderijo(it);
        return true;

      case 'sair':
        this.fimDoCapitulo2();
        return true;
    }
    if (this.acaoCh3(it)) return true;
    return false;
  }

  // ===================================================================
  // CAPITULO 3 — as interacoes proprias
  //
  // Nenhuma delas e combate. O capitulo inteiro e olhar e conversar.
  // ===================================================================

  acaoCh3(it) {
    const p = this.player;
    switch (it.action) {
      // ---- a conversa, com memoria e com os assuntos travados ----
      case 'talk3': {
        const t = TALKS[it.npc];
        if (!t) return true;
        const mem = this._talkMem(it.npc);
        if (this.flags['npc3_' + it.npc]
            && !talkHasMore(t, mem.seen, mem.pressed, f => !!this.flags[f])) return true;
        this.cam.offsetY = 40;
        this.dialogue.startTalk(t, {
          memory: mem.seen,
          pressed: mem.pressed,
          has: f => !!this.flags[f],
          onPress: () => { this.sanity.drain(5); },
          onNode: (id) => this.noDeConversa(it.npc, id),
          onDone: () => {
            this._salvarTalkMem(it.npc, mem);
            this.cam.offsetY = 0;
            if (!this.flags['npc3_' + it.npc]) {
              this.flags['npc3_' + it.npc] = true;
              if (it.npc === 'michael') this.anotar('j3_michael');
              if (it.npc === 'carlos') this.anotar('j3_carlos');
            }
            // Tres colegas ouvidos = a versao que nao bate e a dele.
            if (['colega_a', 'colega_b', 'colega_c'].every(k => this.flags['npc3_' + k])) {
              this.anotar('j3_shift');
            }
            // Fim do capitulo: com Carlos ouvido e o cigarro aceso, a saida
            // pela portaria pede o nome.
            if (this.flags.cig_livre && this.level && this.level.key === 'ch3_cell') {
              this.flags.ch3_pronto = true;
            }
          },
        });
        return true;
      }

      // ---- a arma no escaninho 214 ----
      // Nao e confisco de roteiro, e a porta. E e a segunda vez na vida dele
      // que ele entrega uma arma nesse balcao.
      // ---- O ESCANINHO 214 ----
      //
      // Nao e confisco de roteiro, e a porta: SEM DEIXAR AS COISAS AQUI ele
      // nao entra na delegacia. E na saida ele pega tudo de volta — e as
      // duas acoes avisam o que aconteceu, porque um jogo que tira coisas do
      // seu inventario sem dizer nada e um jogo que perdeu a sua confianca.
      //
      // O que fica no escaninho: a arma, a doze (se ele ja tiver pegado) e
      // o isqueiro. O maco e o caderno ficam com ele — sao pessoais, e o
      // capitulo inteiro depende dos dois.
      case 'ch3_escaninho': {
        // ---- na saida: pegar de volta ----
        if (this.flags.ch3_pronto && this.flags.arma_guardada) {
          this.flags.arma_guardada = false;
          p.hasGun = true;
          p.det.props.gun = 'holstered';
          for (const k of (this.flags.escaninho || [])) this.inv.add(k);
          const n = 1 + (this.flags.escaninho || []).length;
          this.flags.escaninho = [];
          audio.leather ? audio.leather(0.8) : audio.uiConfirm();
          this.aviso('aviso_retirou', n);
          p.say('b3_rec_volta', 3.0, true);
          return true;
        }
        if (this.flags.arma_guardada) {
          p.say('b3_rec_214', 2.6, true);
          return true;
        }
        // ---- na entrada: entregar ----
        this.flags.arma_guardada = true;
        p.hasGun = false;
        p.gun = 'holstered';
        p.det.props.gun = null;
        // tudo que e metal e fogo fica aqui
        const guardados = [];
        for (const k of ['shotgun', 'lighter']) {
          if (this.inv.has(k)) { this.inv.remove(k); guardados.push(k); }
        }
        this.flags.escaninho = guardados;
        p.say('b3_rec_gun', 3.0, true);
        p.say('b3_rec_214', 2.6);
        audio.leather ? audio.leather(0.7) : audio.uiConfirm();
        this.aviso('aviso_guardou', 1 + guardados.length);
        return true;
      }

      // ---- ATRAVESSAR A GRADE ----
      //
      // A porta da cela nunca esteve trancada, e agora isso deixa de ser uma
      // frase: da para entrar. A delegacia SAI DA TELA — o jogo troca de
      // setor para um cubiculo de 300px onde nao ha corredor, nao ha
      // profundidade e nao ha saida no quadro. E o jogador que executa.
      case 'ch3_entrar_cela': {
        if (this.interrog.quebrou) { p.say('b3_cell_vazia', 2.6, true); return true; }
        this.fadeTo(() => {
          this.enterLevel('ch3_dentro', null, 1, true);
          this.state = 'play';
          this.abrirInterrogatorio();
        }, 1.1, 0.9);
        return true;
      }

      case 'ch3_interrogar':
        this.abrirInterrogatorio();
        return true;

      // A calibre doze no armario da mesa dele. Ele NAO pega: a arma fica
      // na portaria e a regra do capitulo nao tem excecao. Ela fica ali.
      case 'ch3_shotgun': {
        if (!this.flags.viu_shotgun) {
          this.flags.viu_shotgun = true;
          this.anotar('j3_shotgun');
        }
        // ELA E PEGAVEL, e vai no cinto. A regra da portaria continua de pe
        // — o escaninho 214 e a porta de ENTRADA, e ele nao vai passar por
        // ela de novo hoje. Isto aqui e a arma do Capitulo 4, e ele guarda
        // sabendo disso.
        if (this.inv.has('shotgun')) { p.say('c3_shotgun_3', 2.6, true); return true; }
        if (!this.pegar('shotgun')) return true;
        it.disabled = true;
        if (this.level && this.level.pego) this.level.pego.shotgun = true;
        audio.leather ? audio.leather(0.8) : audio.uiConfirm();
        p.sayAll(['c3_shotgun_1', 'c3_shotgun_2', 'c3_shotgun_3'], true);
        return true;
      }

      // Olhar para a figura sentada. Ela nao responde, e ele nao insiste.
      case 'ch3_figura': {
        const n = (this.flags.figura_olhou || 0);
        this.flags.figura_olhou = n + 1;
        p.say(['c3_figura_1', 'c3_figura_2', 'c3_figura_3'][Math.min(n, 2)], 3.0, true);
        if (n === 0) { this.sanity.drain(7); this.anotar('j3_figura'); }
        return true;
      }

      case 'ch3_senha':
        p.say(this.ticket.chamado ? 'ch3_end_2' : 'b3_rec_credor', 2.8, true);
        return true;

      // Da para sentar na cadeira do lado. NAO ACONTECE NADA. E pior.
      case 'ch3_sentar':
        p.say('b3_rec_sit', 3.2, true);
        this.sanity.drain(4);
        return true;

      // A foto esta virada para baixo. Ao contrario do espelho, insistir
      // aqui NAO e recompensado: o espelho e carta jogada uma vez so, e
      // repetir o truque queimaria os dois.
      case 'ch3_foto': {
        const n = (this.flags.foto_tent || 0);
        this.flags.foto_tent = n + 1;
        p.say(['c3_foto_1', 'c3_foto_2', 'c3_foto_3'][Math.min(n, 2)], 2.6, true);
        return true;
      }

      case 'ch3_gaveta': {
        if (this.level) this.level.props.gavetaAberta = true;
        if (!this.flags.viu_cartazes) {
          this.flags.viu_cartazes = true;
          // A batida mais importante do setor, e ela e MUDA. Se ele falar
          // qualquer coisa aqui, vira explicacao.
          p.say('b3_desk_gav', 2.2, true);
          this.anotar('j3_drawer');
          this.sanity.drain(9);
          audio.pageTurn(0.7);
        }
        return true;
      }

      // ---- A GAVETA D ----
      case 'ch3_gaveta_d': {
        if (!this.flags.viu_gaveta_d) {
          this.flags.viu_gaveta_d = true;
          this.anotar('j3_drawerd');
          this.sanity.drain(12);
          audio.pageTurn(0.9);
          // O corredor fica mais longo na volta. Sem barulho, sem susto.
          esticarCorredor(this.level, this);
        }
        // Abrir a pasta e o flashback — UMA VEZ SO. Depois de voltar de la,
        // a gaveta continua abrindo e a pasta continua na mao dele, mas o
        // passado nao se revisita: ele ja viveu aquilo duas vezes.
        if (this.flags.viu_passado) { p.say('b3_arq_denovo', 3.0, true); return true; }
        this.fadeTo(() => this.entrarFlashback(), 1.6, 1.8);
        return true;
      }

      // ---- o telefone da varanda, sete anos atras ----
      // A ULTIMA ACAO DO FLASHBACK E DO JOGADOR. O jogo nao faz nada: o
      // telefone toca, e atender e a unica coisa interagivel na tela.
      case 'ch3_atender':
        this.atenderNoPassado();
        return true;

      case 'ch3_porta_cela':
        if (!this.flags.viu_porta_cela) {
          this.flags.viu_porta_cela = true;
          this.sanity.drain(8);
        }
        p.say('b3_cell_porta', 3.0, true);
        return true;

      case 'ch3_livro':
        if (!this.flags.viu_livro) {
          this.flags.viu_livro = true;
          this.anotar('j3_book');
          this.sanity.drain(10);
        }
        p.say('c3_livro_1', 3.0, true);
        return true;
    }
    return false;
  }

  // O jogo escuta a conversa. E assim que o degrau 4 acontece — sem botao,
  // sem prompt, sem escolha.
  noDeConversa(npc, nodeId) {
    if (npc === 'carlos' && nodeId === 'cigarro') {
      liberarCigarro(this);
      if (this.levels.ch3_cell) this.levels.ch3_cell.props.cigarrosNoCinzeiro = true;
    }
  }

  // -------------------------------------------------------------------
  // CAPITULO 3 — o comeco, o flashback e o fim
  // -------------------------------------------------------------------

  resetChapter3() {
    this.sanity.reset(100);
    this.sanity.enabled = true;
    this.journal.reset();
    this.inv.reset();
    this.director.reset();
    this.director.ligado = false;   // nao ha inimigo neste capitulo
    this.chase.parar();
    this.ticket.reset();
    this.namePrompt.ativo = false;
    this.fogo.parar(); this.fogo.reset();
    this.interrog.reset();
    this.cigTentativas = 0;
    // Ele chega do Patio de Carga com o que sobrou do Capitulo 2.
    const p = this.player;
    p.idleMode = null;
    // Comecar um capitulo tem que devolver o David do presente inteiro,
    // inclusive a roupa. Sem isto, sair do flashback pelo menu e entrar de
    // novo pelo seletor deixava ele de colete no meio da delegacia.
    p.det.parts = null;
    p.hasGun = true;
    p.ammo = 6; p.reserve = 12;
    p.det.props.gun = 'holstered';
    p.segurarPorrete(false);
    p.club = false;
    p.hp = 100;
    p.det.coatTorn = true;          // o rasgo do mezanino continua
    p.det.blood = 0.35;
    p.det.injury = 0;
    this.inv.add('cigs'); this.inv.add('lighter'); this.inv.add('map');
    // O caderno ja e dele desde o escritorio do galpao, e as anotacoes do
    // Capitulo 2 vem junto: sem elas as deducoes do Capitulo 3 nao teriam
    // com o que conversar.
    this.flags.caderno = true;
    for (const k of ['j_phone', 'j_clock', 'j_note', 'j_locked', 'j_vigia',
                     'j_oper', 'j_conv', 'j_gun', 'j_credor']) this.journal.add(k);
  }

  // A transicao para o passado NAO e um corte: a luz muda no meio do
  // movimento dele. `fadeTo` ja da isso de graca com um fade longo.
  entrarFlashback() {
    entrarFlashback(this);
    this.enterLevel('ch3_past', null, 1, true);
    this.state = 'play';
  }

  // A ULTIMA ACAO DO FLASHBACK E DO JOGADOR: o telefone toca e atender e a
  // unica coisa interagivel na tela. O jogo passou doze minutos ensinando
  // esse gesto — ele acende um cigarro toda vez que fica parado.
  atenderNoPassado() {
    if (this.flags.atendeu) return;
    this.flags.atendeu = true;
    const p = this.player;
    p.controllable = false;
    p.frozen = true;
    audio.stopAllLoops(1.2);
    // A musica da casa morre AQUI, no instante em que ele atende. O resto
    // da cena acontece sem tema nenhum: o que vem depois nao tem trilha.
    audio.stopMusic(1.6);
    audio.pararMusicaArquivo(1.6);
    // O que a ligacao diz: NADA que de para ouvir. Se o jogador entender uma
    // palavra que seja, o Capitulo 4 perde a revelacao.
    p.det.play('interact', { restart: true });
    p.say('b3_past_atende', 2.4, true);
    // `agora` congela a partida em que a cena comecou. Sem isso, sair para o
    // menu, carregar um save ou trocar de capitulo dentro destes 8 segundos
    // deixava o relogio correndo, e o jogador era arrancado para a cela no
    // meio de outra coisa. `state === 'play'` sozinho nao pega isso: depois
    // de carregar, o estado E 'play' — so que de outra partida.
    const agora = this.runId;
    setTimeout(() => {
      if (this.state !== 'play' || this.runId !== agora) return;
      // Ele acende. O jogador ja viu esse gesto dezenas de vezes ao longo do
      // flashback, e por isso ele nao repara que esta fazendo de novo.
      p.det.play('smokeLighter', { restart: true, blend: 0.3 });
      p.say('b3_past_espera', 3.0, true);
    }, 2400);

    // ---- OS GRITOS ----
    //
    // E aqui que o capitulo inteiro acontece, e ele acontece FORA DE QUADRO.
    // Nao ha nada para ver: ele esta de costas para a casa, no telefone, e o
    // som vem de dentro. Mostrar seria uma cena de morte; nao mostrar e o
    // que faz o jogador ficar com isso.
    setTimeout(() => {
      if (this.state !== 'play' || this.runId !== agora) return;
      audio.stopAllLoops(0.1);
      audio.scream(1.0);
      gfx.shake(3.4);
      p.say('b3_past_grito', 2.2, true);
    }, 7000);
    setTimeout(() => {
      if (this.state !== 'play' || this.runId !== agora) return;
      audio.scream(0.72);
      p.say('b3_past_grito2', 2.0, true);
      // Ele se vira para a casa. Tarde.
      p.det.setFacing(-1);
      p.det.play('lookback', { restart: true, blend: 0.12 });
    }, 9200);

    // ---- E ENTAO A CASA COMECA A QUEIMAR ----
    //
    // O fogo responde as duas perguntas que o jogo carregava sem resposta:
    // por que ele nao consegue acender um cigarro, e por que ele continua
    // imprimindo cartaz de desaparecida depois de sete anos. Ele estava com
    // um cigarro na mao, de costas, e nunca houve corpo para enterrar.
    //
    // Continua sem mostrar nada de dentro. A camera fica na varanda.
    setTimeout(() => {
      if (this.state !== 'play' || this.runId !== agora) return;
      this.anotar('j3_fogo');
      this.fogo.comecar(this,
        // Rede de seguranca: se a cena chegar ao fim sem a tela ter apagado
        // (o `onEntrou` abaixo e quem apaga), o passado acaba do mesmo jeito.
        // Sem isto, um caminho que escape do `onEntrou` deixaria o jogador
        // preso no flashback — que e o B-59 de novo.
        () => {
          if (this.state !== 'play' || this.runId !== agora) return;
          this.voltarDoFlashback();
        },
        // ---- O CORTE ----
        //
        // ⚠ A tela apaga NO INSTANTE EM QUE ELE ATRAVESSA A SOLEIRA, com a
        // casa ainda queimando atras dele. Antes ela só começava a apagar
        // depois de a cena inteira terminar, e aí era tarde: com a cena
        // encerrada o fogo para de ser desenhado, então o jogador via a casa
        // INTACTA por três segundos e meio, com o David reaparecido na porta
        // andando no lugar. O flashback tem que acabar quando ele entra —
        // não é uma cena da qual se sai, é uma porta que se atravessa.
        () => {
          if (this.state !== 'play' || this.runId !== agora) return;
          audio.tinnitus(0.85);
          this.fadeTo(() => this.voltarDoFlashback(), 1.3, 1.8);
        });
    }, 10600);
  }

  // O interrogatorio, e o que acontece quando ele acaba. O cigarro mora
  // AQUI agora: o Carlos nao tem mais arvore de conversa nenhuma, e o
  // degrau 4 acontece no fim da cena, com os dois homens ja destruidos.
  abrirInterrogatorio() {
    if (this.interrog.quebrou) return false;
    this.cam.offsetY = 24;
    // O degrau 4 acontece no meio da cena, entre a confissao e a saida.
    this.interrog.onCigarro = () => {
      liberarCigarro(this);
      if (this.level) this.level.props.cigarrosNoCinzeiro = true;
      audio.lighterFlick();
    };
    return this.interrog.comecar(this, (quebrou) => {
      this.cam.offsetY = 0;
      if (!quebrou) return;
      this.anotar('j3_conf');
      this.anotar('j3_andrade');
      this.journal.add('j3_x3');       // a que ele nao escreveu
      this.sanity.drain(14);
      this.flags.npc3_carlos = true;
      const p = this.player;
      p.say('b3_int_fim', 2.4);
      p.say('b3_int_fim2', 2.4);

      // ---- A VIRADA ----
      //
      // Aqui o Capitulo 3 deixa de ser sobre o passado. O David junta a
      // unica coisa acionavel que saiu daquela cela — "mandei deixar a
      // menina viva" — e faz o que um detetive faz: para de lamentar e vai
      // atras da ponta. E ele acabou de descobrir, na propria mao, do que
      // ele e capaz para conseguir uma resposta.
      //
      // ⚠ A REGRA DE OURO CONTINUA: ele nao especula sobre estar louco e
      // nao junta migalha nenhuma em voz alta. Ele so decide.
      this.anotar('j3_caca');
      this.flags.vai_atras = true;
      for (const k of ['b3_vira_1', 'b3_vira_2', 'b3_vira_3',
                       'b3_vira_4', 'b3_vira_5', 'b3_vira_6']) p.say(k, 3.0);

      // E a partir daqui ele tem que sair. O capitulo passa a ter fim.
      this.flags.ch3_pronto = true;
      p.say('b3_int_sair', 3.2);
    });
  }

  voltarDoFlashback() {
    // Agora ha DOIS caminhos que chamam isto — o corte, quando ele atravessa
    // a soleira, e a rede de seguranca no fim da cena. Voltar duas vezes
    // entraria na cela duas vezes, com as falas de entrada em cima das
    // outras. Quem chega primeiro fecha a porta.
    if (!this.flags.flashback) return;
    sairFlashback(this);
    this.flags.viu_passado = true;   // e nao se entra la de novo
    this.fogo.parar();
    this.fogo.reset();
    this.fx.clear();
    this.rain.on = false;
    this.anotar('j3_shift');
    this.enterLevel('ch3_cell', null, 1, true);
    this.state = 'play';
  }

  // O FIM. Nao tem inimigo, nao tem musica, nao tem tempo correndo. So um
  // homem atras de um vidro esperando uma palavra.
  fimDoCapitulo3() {
    if (this.namePrompt.ativo) return;
    const p = this.player;
    p.controllable = false;
    p.frozen = true;
    // ⚠ CONGELAR NAO PARA A ANIMACAO. `frozen` zera a velocidade e desliga a
    // maquina de estados, mas continua rodando o quadro atual — e o quadro
    // atual era `walk`, em laco, porque ele estava indo embora quando o
    // plantonista chamou. Ele ficava andando para fora, no lugar, durante a
    // pergunta inteira. Quem congela um personagem no meio de uma cena
    // precisa DIZER em que pose ele para.
    p.vx = 0;
    p.det.play('idle', { blend: 0.2 });
    // E ele se vira para quem chamou. Sair de costas enquanto respondem a
    // pergunta que fecha o capitulo era a leitura errada da cena: ele para
    // na porta e olha para tras.
    const guarita = (this.npcs && this.npcs.plantonista) ? this.npcs.plantonista.cfg.x : 310;
    const olhar = guarita >= p.x ? 1 : -1;
    p.facing = olhar;
    p.det.setFacing(olhar);
    this.ticket.chamar();
    const agora = this.runId;
    this.namePrompt.comecar(() => {
      p.say('ch3_end_1', 2.6, true);
      p.say('ch3_end_2', 3.0);
      setTimeout(() => {
        if (this.state === 'play' && this.runId === agora) {
          this.fadeTo(() => this.endOfChapter(), 2.4, 0.01);
        }
      }, 6200);
    });
  }

  pegar(key) {
    if (this.inv.add(key)) return true;
    this.player.say('inv_full', 2.2, true);
    return false;
  }

  // ---- AVISO ----
  //
  // Uma faixa curta no alto da tela quando o jogo TIRA ou DEVOLVE alguma
  // coisa. E diferente do aviso de item pego, que e discreto de proposito:
  // este existe para as trocas que o jogador nao fez com as proprias maos —
  // entregar os pertences na portaria e pegar de volta na saida. Um jogo
  // que mexe no inventario sem dizer nada perde a confianca de quem joga.
  aviso(key, n) {
    this.avisoKey = key;
    this.avisoN = n || 0;
    this.avisoT = 3.4;
  }

  drawAviso(ctx) {
    if (!(this.avisoT > 0) || !this.avisoKey) return;
    const a = clamp(Math.min(this.avisoT, 3.4 - this.avisoT + 2.6), 0, 1);
    let txt = T(this.avisoKey);
    if (txt.indexOf('%d') >= 0) txt = txt.replace('%d', String(this.avisoN));
    const est = { size: 9, font: 'ui', weight: 'bold' };
    const w = measure(txt, est).w + 22;
    const x = Math.round((VW - w) / 2), y = 20;
    ctx.save();
    ctx.globalAlpha = a * 0.86;
    ctx.fillStyle = '#08090c';
    ctx.fillRect(x, y, w, 17);
    ctx.fillStyle = '#3a4450';
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y + 16, w, 1);
    ctx.restore();
    text(ctx, txt, VW / 2, y + 5, {
      size: 9, font: 'ui', weight: 'bold', align: 'center', track: 1,
      color: PAL.uiAccent, alpha: a, shadow: true,
    });
  }

  anotar(key) {
    if (!this.flags.caderno) return false;
    if (!this.journal.add(key)) return false;
    // Escrever e organizar a cabeca. Ate o cigarro destravar, la no
    // Capitulo 3, e a principal forma de se recuperar.
    this.sanity.restore(7);
    return true;
  }

  // -------------------------------------------------------------------
  // memoria de conversa
  //
  // O que ele ja perguntou a cada pessoa fica nas flags, nao na sessao —
  // senao carregar um save devolvia todas as perguntas como se fossem
  // novas, e a lista apagada perdia o sentido.
  // -------------------------------------------------------------------

  _talkMem(id) {
    const f = this.flags.talkMem || (this.flags.talkMem = {});
    const m = f[id] || (f[id] = { seen: [], pressed: [] });
    return { seen: new Set(m.seen), pressed: new Set(m.pressed) };
  }

  _salvarTalkMem(id, mem) {
    const f = this.flags.talkMem || (this.flags.talkMem = {});
    f[id] = { seen: [...mem.seen], pressed: [...mem.pressed] };
  }

  // -------------------------------------------------------------------
  // O VERBO DE DEDUCAO
  //
  // Juntar duas anotacoes rende mais do que anotar uma: e a unica coisa
  // no jogo que ele faz com a cabeca em vez de com as maos. E a flag que
  // sai daqui abre pergunta nova em conversa — e por isso que deduzir
  // vale alguma coisa em vez de virar colecionavel.
  // -------------------------------------------------------------------

  _ligarDeducao() {
    this.journal.onDeduce = (ded) => {
      this.flags[ded.flag] = true;
      this.sanity.restore(12);
    };
  }

  // O PRECO DA PISTOLA. No instante em que ele encosta nela, as luzes de
  // emergencia apagam, TODAS as maquinas ligam ao mesmo tempo, e tres
  // deles entram pela porta por onde ele veio. Toda gentileza cobra na
  // saida.
  pegarPistola() {
    const p = this.player, lv = this.level;
    this.inv.hand = null;
    p.segurarPorrete(false);
    this.pegar('gun');
    p.hasGun = true;
    p.ammo = 6;
    // A pistola traz apenas o carregador. Toda bala recolhida no chão já
    // está na reserva e não pode ser sobrescrita por um valor fixo.
    p.reserve = Math.max(0, p.reserve);
    p.det.props.gun = 'holstered';
    p.sayAll(['b2_gun_1', 'b2_gun_2', 'b2_gun_3', 'b2_gun_4'], true);
    this.anotar('j_gun');

    this.emboscada = 2.6;
  }

  dispararEmboscada() {
    const lv = this.level, p = this.player;
    audio.machineStart(1);
    audio.stopLoop('hum', 0.2);
    audio.startLoop('hum', { gain: 0.16, fade: 0.4 });
    gfx.shake(5, 0.9);
    gfx.flash = 0.12;
    for (const f of lv.lightDefs) { if (f.i0 === undefined) f.i0 = f.i; f.i = f.i0 * 0.25; }
    lv._apagada = true;
    // pela porta por onde ele entrou
    const px = lv.portaX === undefined ? lv.minX + 20 : lv.portaX;
    for (let i = 0; i < 3; i++) this.director.forcar('semrosto', px - 20 - i * 26, lv.groundY);
    this.director.calma = 24;
    p.say('b2_ambush', 2.2, true);
    p.say('b2_ambush2', 2.6);
  }

  // O ESPELHO. Duas recusas, e na terceira o jogo inteiro muda de camera.
  tentarEspelho(it) {
    this.espelhoN = (this.espelhoN || 0) + 1;
    if (this.espelhoN === 1) { this.player.say('cig_no_1', 2.0, true); return; }
    if (this.espelhoN === 2) { this.player.say('cig_no_2', 2.2, true); return; }
    it.disabled = true;
    this.scene = new MirrorScene(this.player);
    this.scene.onEnd = () => {
      // Custa mais do que qualquer outra coisa do capitulo. O teimoso paga
      // caro — e ganha uma pagina que so existe para quem olhou.
      this.sanity.drain(30, true);
      this.journal.add('j_mirror');
      this.player.say('b2_mirror_after', 3.4, true);
      this.locCard = 0;
      // o ambiente do vestiario volta
      for (const a of (this.level.ambience || [])) audio.startLoop(a.n, { gain: a.g, fade: 2.5 });
    };
    this.scene.start();
  }

  // A ESCADA DO CIGARRO, degrau 1: ele nem tira do maco. A recusa e
  // automatica, quase reflexo. Ela vai mudar — mas so no Capitulo 3.
  usarItem(key) {
    if (key === 'medkit') {
      if (this.player.hp >= 100) { this.player.say('b2_heal_full', 0, true); return; }
      this.player.hp = clamp(this.player.hp + 45, 0, 100);
      this.inv.remove('medkit');
      audio.leather(0.7);
      audio.breath(0.45);
      return;
    }
    if (key === 'sedative') {
      if (this.sanity.value >= 100) { this.player.say('b2_heal_full', 0, true); return; }
      this.sanity.restore(38);
      this.inv.remove('sedative');
      audio.reloadClick(0.35);
      audio.tinnitus(0.6);
      return;
    }
    if (key === 'cigs') {
      // A ESCADA DO CIGARRO. Degrau 1 (recusa seca) no Capitulo 2; degraus
      // 2 e 3 na delegacia; o 4 e a cela, e ali ele nem decide. Depois do 4
      // o maco vira consumivel de verdade e some quando acaba.
      if (usarCigarro(this)) {
        this.flags.cig_usados = (this.flags.cig_usados || 0) + 1;
        if (this.flags.cig_usados >= 8) this.inv.remove('cigs');
      }
      return;
    }
    if (key === 'lighter') { audio.lighterFlick(); return; }
    if (key === 'map') {
      this.inv.inspect = null;
      this.inv.open = false;
      this.mapaAberto = true;
      audio.pageTurn(0.8);
      return;
    }
  }

  eventoSanidade(tipo) {
    if (tipo !== 'worse') return;
    // As paginas que ele nao escreveu so aparecem quando a cabeca cede.
    if (!this.flags.caderno) return;
    const st = this.sanity.state;
    if (st >= 2 && !this.journal.has('j_x1')) this.journal.add('j_x1');
    else if (st >= 3 && !this.journal.has('j_x2')) this.journal.add('j_x2');
  }

  // -------------------------------------------------------------------
  // combate
  // -------------------------------------------------------------------

  golpeDePorrete() {
    const p = this.player;
    audio.whoosh(1.1);
    // Sobreposicao de caixa, e nao "quem esta mais perto em X". A caixa do
    // golpe desce ate o chao de proposito: e assim que a ripa alcanca quem
    // rasteja, que antes era praticamente inatingivel.
    const atingidos = this.director.dentroDe(p.caixaGolpe());
    if (!atingidos.length) return;
    const alvo = atingidos[0];
    // A ripa continua sendo a melhor arma curta: quatro ou cinco impactos
    // resolvem um alvo comum, enquanto o punho é uma saída de emergência.
    const r = alvo.levarDano(2.6, p.x);
    if (r === 'fake') {
      // Nao estava la. E ele nao comenta.
      this.fx.burst(14, () => ({
        x: alvo.x + (Math.random() - 0.5) * 12, y: alvo.y - 20 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 30, ay: -10,
        life: 0.6, size: 1, color: '#2a2430', a: 0.5, fade: 1.4,
      }));
      this.sanity.drain(4);
      return;
    }
    audio.clubHit(1);
    gfx.shake(2.4, 0.22);
    this.fx.burst(8, () => ({
      x: alvo.x, y: alvo.y - 30 - Math.random() * 20,
      vx: (Math.random() - 0.5) * 80, vy: -40 - Math.random() * 40, ay: 240,
      life: 0.4, size: 1, color: '#6d1a15', a: 0.9, fade: 1.2,
    }));
    if (r === 'morreu') {
      this.director.respirar(12 + Math.random() * 8);
      this.sanity.restore(2);   // a violencia acalma, e isso e feio
      this.registrarSangue(alvo.x, alvo.y, 8);
      this.sujarDavid(alvo.x, 0.75);
    }
    // A ripa e madeira. Ela vai quebrar, e o jogo nunca disse quando.
    this.inv.clubHp -= 0.11 + Math.random() * 0.06;
    if (this.inv.clubHp <= 0) {
      this.inv.clubHp = 0;
      this.inv.hand = null;
      p.segurarPorrete(false);
      audio.clubBreak(1);
      p.say('b2_club_broke', 2.6, true);
    }
  }

  // -------------------------------------------------------------------
  // agarrão do Credor
  // -------------------------------------------------------------------

  iniciarGrab(deX) {
    if (this.grab || this.scene || this.transition || this.escondido || this.chaseSetpieces.action
        || this.chaseSequence.action || this.finishers.action) return false;
    const p = this.player, c = this.chase.credor;
    if (!c) return false;
    this.journal.open = false; this.inv.open = false; this.mapaAberto = false;
    const fugas = this.flags.grabEscapes || 0;
    const arma = p.club ? 'club'
      : ((p.gun === 'ready' || p.aiming) && p.ammo > 0 ? 'gun' : null);
    this.grab = {
      phase: 'struggle', t: 0, progress: 0,
      need: 1 + Math.min(0.36, fugas * 0.15),
      limit: Math.max(4.65, 5.55 - fugas * 0.24),
      arma, gunUsed: false, blood: false, fugas, ferido: p.hp < 35,
    };
    p.vx = 0; p.frozen = true; p.controllable = false;
    const dir = Math.sign(p.x - deX) || c.facing || 1;
    c.facing = dir; c.det.setFacing(dir);
    p.facing = -dir; p.det.setFacing(-dir);
    c.x = p.x - dir * 19;
    c.det.play('grab', { restart: true, blend: 0.025 });
    p.det.play('struggle', { restart: true, blend: 0.025 });
    p.det.speed = this.grab.ferido ? 0.72 : 1;
    audio.punchHit(1.15); audio.leather(1.1);
    gfx.shake(5.4, 0.48); gfx.letterbox = 0.72;
    this.sanity.drain(5, true);
    return true;
  }

  updateGrab(dt) {
    const g = this.grab;
    if (!g) return;
    const p = this.player, c = this.chase.credor;
    if (!c) { this.grab = null; return; }
    g.t += dt;
    c.x = p.x - c.facing * 19;
    c.det.update(dt);

    if (g.phase === 'struggle') {
      g.progress = Math.max(0, g.progress - dt * (0.045 + g.fugas * 0.008));
      if (input.pressed('struggle')) {
        let ganho = 0.17;
        if (g.arma === 'club') ganho += 0.035;
        g.progress = Math.min(g.need, g.progress + ganho);
        audio.strain(0.82 + Math.min(0.18, g.progress * 0.1));
        gfx.shake(1.6, 0.1);

        // A pistola so salva se ja estava sacada quando ele agarrou. O
        // jogador nao ganha uma arma magica no meio da animacao.
        if (g.arma === 'gun' && !g.gunUsed && g.progress >= 0.38) {
          g.gunUsed = true;
          p.ammo--;
          p.ammoHud = 4;
          g.progress = Math.min(g.need, g.progress + 0.48);
          audio.gunshot(1.15); gfx.flash = 0.08; gfx.shake(5.6, 0.34);
          c.det.blood = Math.min(1, (c.det.blood || 0) + 0.28);
          this.sangrarAlvo(c.x, p.y - 48, -c.facing, 18, false);
        }
      }
      if (g.progress >= g.need) {
        this.escaparGrab();
        return;
      }
      if (g.t >= g.limit) {
        g.phase = 'death'; g.t = 0;
        c.det.play('chainsawFinish', { restart: true, blend: 0.02 });
        p.det.play('collapse', { restart: true, blend: 0.03 });
        audio.setLoopGain('serra', 0.28, 0.08);
        gfx.shake(7.5, 0.7);
      }
      return;
    }

    if (g.phase === 'escape') {
      if (g.t >= 0.18 && !g.wallHit) {
        g.wallHit = true;
        audio.metalCreak(g.arma === 'gun' ? 0.55 : 1.05);
        gfx.shake(2.2, 0.2);
      }
      if (g.t >= 0.38 && !g.rising) {
        g.rising = true;
        p.det.play('standUp', { restart: true, blend: 0.09 });
      }
      if (g.t >= 1.15) {
        p.frozen = false; p.controllable = true; p.invuln = 2.4;
        p.det.speed = 1;
        p.state = 'idle'; p.det.play('idle', { blend: 0.12 });
        gfx.letterbox = 0;
        this.grab = null;
      }
      return;
    }

    if (g.phase === 'death') {
      if (g.t > 0.28 && !g.blood) {
        g.blood = true;
        audio.punchHit(1.35); audio.thud(1.1);
        this.sangrarAlvo(p.x, p.y - 40, c.facing, 58, true);
        this.registrarSangue(p.x, p.y, 18);
        gfx.flash = 0.16;
      }
      if (g.t >= 1.62) this.startGameOver('gameover_grab');
    }
  }

  escaparGrab() {
    const g = this.grab, p = this.player, c = this.chase.credor;
    if (!g || !c) return;
    g.phase = 'escape'; g.t = 0;
    g.rising = false;
    g.wallHit = false;
    this.flags.grabEscapes = (this.flags.grabEscapes || 0) + 1;
    p.hp = Math.max(1, p.hp - (g.arma ? 3 : 7));
    p.det.blood = clamp((p.det.blood || 0) + (p.hp < 35 ? 0.13 : 0.06), 0, 1);
    this.sanity.drain(6 + g.fugas * 2, true);
    if (g.arma === 'club') {
      this.inv.clubHp = Math.max(0, this.inv.clubHp - 0.24);
      if (this.inv.clubHp <= 0) {
        this.inv.hand = null; p.segurarPorrete(false); audio.clubBreak(1);
      }
    }
    c.x -= c.facing * 28;
    c.stun = g.arma === 'gun' ? 3.0 : 2.25;
    c.det.play('hurt', { restart: true, blend: 0.025 });
    p.x = clamp(p.x + p.facing * 18, this.level.minX, this.level.maxX);
    p.det.play('collapse', { restart: true, blend: 0.025 });
    audio.punchHit(1.2); audio.thud(0.8); gfx.shake(4.4, 0.36);
    p.say(g.fugas ? 'b2_grab_learns' : 'b2_grab_escape', 0, true);
  }

  drawGrabUI(ctx) {
    const g = this.grab;
    if (!g || g.phase === 'death') return;
    const k = clamp(g.progress / g.need, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.55; ctx.fillStyle = '#040306';
    ctx.fillRect(0, 0, VW, 28); ctx.fillRect(0, VH - 60, VW, 60);
    const w = 214, x = (VW - w) / 2, y = VH - 48;
    ctx.globalAlpha = 0.92; ctx.fillStyle = '#0b0709'; ctx.fillRect(x, y, w, 34);
    ctx.fillStyle = '#302527'; ctx.fillRect(x + 12, y + 23, w - 24, 5);
    ctx.fillStyle = '#a9362d'; ctx.fillRect(x + 12, y + 23, Math.round((w - 24) * k), 5);
    ctx.restore();
    text(ctx, T('grab_resist'), VW / 2, y + 6, {
      size: 10, font: 'ui', weight: 'bold', color: '#f1e9dc', align: 'center', track: 2, shadow: true,
    });
    if (g.arma) text(ctx, T(g.arma === 'gun' ? 'grab_gun' : 'grab_club'), VW / 2, y - 12, {
      size: 7, font: 'ui', color: '#c59c67', align: 'center', track: 1, shadow: true,
    });
  }

  golpeDeSoco() {
    const p = this.player;
    const caixa = p.caixaGolpe();
    // O punho alcança menos que a ripa e causa pouco dano, mas finalmente é
    // combate de verdade em vez de uma animação sem consequência.
    caixa.x0 += p.facing > 0 ? 0 : 12;
    caixa.x1 -= p.facing > 0 ? 12 : 0;
    const atingidos = this.director.dentroDe(caixa);
    if (!atingidos.length) return;
    const alvo = atingidos[0];
    const r = alvo.levarDano(1.25, p.x);
    audio.punchHit(0.95);
    gfx.shake(1.4, 0.14);
    this.fx.burst(5, () => ({
      x: alvo.x, y: alvo.y - 28 - Math.random() * 18,
      vx: p.facing * (16 + Math.random() * 35), vy: -18 - Math.random() * 24, ay: 220,
      life: 0.3, size: 1, color: '#6d1a15', a: 0.75, fade: 1.4,
    }));
    if (r === 'morreu') {
      this.director.respirar(10 + Math.random() * 7);
      this.registrarSangue(alvo.x, alvo.y, 7);
      this.sujarDavid(alvo.x, 0.65);
    }
  }

  // -------------------------------------------------------------------
  // esconderijo
  // -------------------------------------------------------------------

  entrarEsconderijo(it) {
    const p = this.player;
    this.escondido = it;
    p.x = it.x + it.w / 2;
    p.frozen = true;
    p.controllable = false;
    p.det.play('hide', { blend: 0.3 });
    p.det.alpha = 0.55;
    audio.leather(0.6);
    this.respiro = 1;
    this.respiroExausto = false;
    this.respiroT = 0;
  }

  sairEsconderijo() {
    const p = this.player;
    if (!this.escondido) return;
    // Empurra ele para fora do esconderijo, na direcao contraria a de quem
    // esta cacando: sair para dentro do Credor nao e sair.
    const c = this.chase.ativo && this.chase.credor && this.chase.levelKey === this.level.key
      ? this.chase.credor.x : p.x - 40;
    const fora = Math.sign(p.x - c) || 1;
    p.x = clamp(p.x + fora * 16, this.level.minX, this.level.maxX);
    p.facing = fora;
    p.det.setFacing(fora);
    this.escondido = null;
    p.frozen = false;
    p.controllable = true;
    p.lockTime = 0;
    p.state = 'idle';
    p.det.alpha = 1;
    p.det.play('idle', { blend: 0.3 });
    audio.leather(0.5);
  }

  updateEsconderijo(dt) {
    const p = this.player;
    const k = this.chase.pressao(this.level.key, p.x);
    const prendendo = input.isDown('breath') && this.respiro > 0;
    if (prendendo) {
      this.respiro = clamp(this.respiro - dt * 0.18, 0, 1);
      // Novo uso: controlar o panico. O Credor ja perdeu o rastro apenas
      // porque David se escondeu; Shift reduz a sanidade perdida enquanto
      // a motosserra e os passos passam perto.
      this.sanity.drain(dt * k * 0.08);
      if (this.respiro <= 0 && !this.respiroExausto) {
        this.respiroExausto = true;
        audio.breath(1.15);
        this.sanity.drain(3, true);
      }
    } else {
      this.respiro = clamp(this.respiro + dt * 0.30, 0, 1);
      if (this.respiro > 0.25) this.respiroExausto = false;
      this.sanity.drain(dt * k * 0.65);
      this.respiroT = (this.respiroT || 0) - dt;
      if (this.respiroT <= 0) {
        this.respiroT = lerp(1.7, 0.78, k);
        audio.breath(0.45 + k * 0.35);
      }
    }
    this.batidaT = (this.batidaT || 0) - dt;
    if (this.batidaT <= 0) {
      this.batidaT = lerp(1.15, prendendo ? 0.58 : 0.36, k);
      audio.heartbeat((0.32 + k * 0.58) * (prendendo ? 0.58 : 1));
    }
    // Sair NUNCA pode falhar. Antes so o E servia, e se ele fosse comido
    // por qualquer outra coisa o jogador ficava preso no esconderijo com
    // um Credor girando em cima dele — sem morrer e sem poder sair.
    // Agora qualquer intencao de se mexer tira ele de la.
    if (input.pressed('interact') || input.pressed('confirm')
        || input.pressed('left') || input.pressed('right')
        || input.pressed('attack') || input.pressed('cancel')) {
      this.sairEsconderijo();
    }
    return prendendo;
  }

  // -------------------------------------------------------------------
  // fim do capitulo
  // -------------------------------------------------------------------

  fimDoCapitulo2() {
    if (this.level && this.level.key === 'ch2_chainbay') {
      this.chaseSequence.startFinal(this);
      return;
    }
    const p = this.player;
    let cp = this.chase.credor;
    const estavaAqui = cp && this.chase.levelKey === this.level.key;
    if (!cp || !estavaAqui) cp = new Enemy('credor', this.level.minX - 24, this.level.groundY);
    this.chase.parar();
    this.director.limpar();
    p.controllable = false;
    p.frozen = true;
    p.say('b2_end_1', 2.6, true);
    p.say('b2_end_2', 2.6);
    p.say('b2_end_3', 3.0);
    audio.doorSlam(0.6);
    // A última imagem agora continua a posição real da perseguição. Ele
    // encara David e recua passo por passo, sem desaparecer nem reaparecer.
    cp.y = this.level.groundY;
    const face = Math.sign(p.x - cp.x) || 1;
    cp.facing = face;
    cp.det.setFacing(face);
    cp.det.flipT = 1;
    cp.det.play('dragWalk', { blend: 0.12 });
    this.credorParado = { enemy: cp, t: 0, face };
    // Mesma armadilha do Capitulo 3: `state === 'play'` nao distingue esta
    // partida de outra carregada nos 8 segundos seguintes.
    const agora = this.runId;
    setTimeout(() => {
      if (this.state === 'play' && this.runId === agora) {
        this.fadeTo(() => this.endOfChapter(), 2.2, 0.01);
      }
    }, 8200);
  }

  // -------------------------------------------------------------------
  // o laco do capitulo
  // -------------------------------------------------------------------

  iniciarFugaDoCredor(lv) {
    if (this.flags.fuga || this.scene) return;
    this.flags.fuga = true;
    if (!this.flags.chase_route) this.flags.chase_route = Math.random() < 0.36 ? 'shortcut' : 'open';
    this.flags.fuga_preparada = false;
    this.fugaPendente = null;
    this.director.limpar();
    this.director.ligado = false;
    this.chaseSetpieces.enter(this, lv);
    const intro = this.scene = new ChaseIntro(this.player, lv);
    intro.onEnd = (credor) => {
      this.chase.comecar(this.levels, lv.key, credor.x, { immediate: true, credor });
      this.chaseSetpieces.enter(this, lv);
      this.director.ligado = false;
      this.player.sayAll(['b2_chase_1', 'b2_chase_2'], true);
      this.anotar('j_credor');
      // Checkpoint apenas em memoria: nao ocupa nenhum dos dez arquivos e
      // existe para a tela de Game Over poder reiniciar a fuga inteira.
      this.deathRetry = JSON.parse(JSON.stringify(this._estadoSalvavel()));
    };
  }

  // ===================================================================
  // O LACO DO CAPITULO 3
  //
  // Curto de proposito: nao ha inimigo, nao ha perseguicao, nao ha
  // emboscada. O que muda por quadro sao tres coisas — a senha do Credor,
  // a pergunta do fim, e o corredor que cresce.
  // ===================================================================

  updateCh3(dt, lv) {
    this.ticket.update(dt);
    this.namePrompt.update(dt, this);

    // A animacao das pessoas tambem so rodava dentro do laco do Capitulo 2.
    // Sem isto elas ficavam congeladas no primeiro quadro da pose.
    for (const id of Object.keys(this.npcs)) {
      const n = this.npcs[id];
      if (n.cfg.level === lv.key) n.update(dt);
    }

    // Cada setor NOVO empurra a senha um passo. Revisitar nao conta.
    if (this.ticket.visitou(lv.key)) audio.blip(0.35);

    // O corredor do arquivo e mais longo na VOLTA. Sem barulho, sem susto,
    // sem comentario. So mais chao.
    if (lv.key === 'ch3_archive' && esticarCorredor(lv, this)) {
      this.player.say('b3_arq_volta', 3.0);
    }

    // ---- O FLASHBACK ----
    //
    // A ordem e: entra na casa, fala com as duas, o telefone DELE toca, ele
    // sai para atender, e e la fora que ele ouve.
    //
    // O telefone so toca depois das duas conversas. Enquanto ele nao falou
    // com a mulher e com a filha, o flashback e so uma noite boa — e e
    // exatamente por isso que ele precisa durar.
    if (this.flags.flashback && !this.flags.atendeu) {
      const falouComAsDuas = this.flags.npc3_julie && this.flags.npc3_jenna;
      if (falouComAsDuas && !this.flags.tocou) {
        this.flags.tocou = true;
        audio.phoneRing(0.7);
        this.player.say('b3_past_tel', 2.8, true);
        this.player.say('b3_past_tel2', 3.0);
      }
      // Ele toca de tempos em tempos ate ser atendido, e o som vem do bolso
      // dele: dentro de casa e no quarto da menina da para ouvir igual.
      if (this.flags.tocou) {
        this.ringT = (this.ringT || 0) - dt;
        if (this.ringT <= 0) { this.ringT = 4.5; audio.phoneRing(lv.key === 'ch3_past' ? 0.7 : 0.45); }
      }
      // ---- O TELEFONE E DELE, E ESTA NO BOLSO DELE ----
      //
      // Antes o "atender" era um ponto fixo da varanda, e o jogador tinha
      // que procurar o lugar certo para usar o proprio telefone. Isso e
      // errado duas vezes: e um objeto que ele esta carregando, e o gesto
      // que a cena precisa e SAIR, nao caminhar ate uma marca no chao.
      //
      // Agora, no instante em que ele poe o pe fora de casa, o interagivel
      // gruda no jogador: o botao de usar aparece em qualquer ponto da rua
      // e continua na tela ate ele atender. A varanda continua sendo onde a
      // cena acontece — porque e para la que ele anda sozinho —, mas quem
      // decide onde atender e o jogador.
      if (lv.key === 'ch3_past') {
        const at = lv.interactables.find(it => it.id === 'atender');
        if (at) {
          at.disabled = !this.flags.tocou;
          if (this.flags.tocou) {
            at.x = Math.round(this.player.x - at.w / 2);
            at.y = lv.groundY - 60;
          }
        }
      }
    }

    // O fogo tem relogio proprio: ele comeca com os gritos e nao depende de
    // mais nada do jogo para continuar queimando.
    if (this.fogo.ativo) this.fogo.update(dt, this);
    // O interrogatorio idem: enquanto ele estiver aberto, e ele que le o
    // teclado. O jogador nao anda, nao abre casaco e nao saca nada.
    if (this.interrog.ativo) this.interrog.update(dt, this);

    // ---- A PARADA NA SAIDA DA CELA ----
    //
    // Depois da confissao, atravessar a porta do arquivo nao e so trocar de
    // sala: ele para no meio do corredor, sozinho, e o jogo espera. E o
    // unico lugar do capitulo em que David comenta o que acabou de fazer —
    // e o comentario e sobre ELE, nao sobre o Carlos.
    if (lv.key === 'ch3_archive' && this.flags.carlos_quebrou && !this.flags.parou_saida
        && this.player.x > lv.maxX - 260) {
      this.flags.parou_saida = true;
      const p2 = this.player;
      p2.say('b3_int_saida', 3.2, true);
      p2.say('b3_int_quase2', 3.0);
    }

    // A saida: com Carlos ouvido e o cigarro aceso, voltar a recepcao e o
    // fim do capitulo. O plantonista pede o nome, e o jogo para.
    if (lv.key === 'ch3_reception' && this.flags.ch3_pronto
        && !this.namePrompt.ativo && !this.flags.ch3_fim) {
      if (this.player.x < 120) {
        this.flags.ch3_fim = true;
        this.fimDoCapitulo3();
      }
    }
  }

  updateCh2(dt, lv, prendendo) {
    const p = this.player;

    // A porta ja aceitou o comando. Durante os poucos quadros do fade de
    // saida nenhum golpe pode cancelar uma transicao que ja comecou.
    if (this.transition && this.transition.phase === 'out') return;

    // A sala precisa ser jogavel antes da entrada cinematografica. Depois
    // de cerca de dois segundos de caminhada, o Credor rompe o escuro.
    if (this.fugaPendente && this.fugaPendente.level === lv.key
        && Math.abs(p.x - this.fugaPendente.entryX) >= 82) {
      this.iniciarFugaDoCredor(lv);
      return;
    }

    if (this.credorParado && !this.credorParado.cinematic) {
      const f = this.credorParado;
      f.t += dt;
      const c = f.enemy;
      c.facing = f.face; c.det.setFacing(f.face);
      if (f.t < 4.1) c.x -= f.face * 15 * dt;
      else if (c.det.anim !== 'idle') c.det.play('idle', { blend: 0.35 });
      c.det.update(dt);
    }

    for (const id of Object.keys(this.npcs)) {
      const n = this.npcs[id];
      if (n.cfg.level === lv.key) n.update(dt);
    }

    // ---- o isqueiro ----
    if (this.isqueiroT > 0) {
      this.isqueiroT -= dt;
      if (this.isqueiroT <= 0) audio.blip(0.3);
    }
    if (input.pressed('light') && this.inv.has('lighter') && this.isqueiroT <= 0
        && !this.escondido && !this.dialogue.active) {
      this.isqueiroT = 6;
      audio.lighterFlick();
      audio.flameWhoosh(0.7);
    }

    // ---- o Diretor ----
    this.director.update(this.finishers.action ? 0 : dt, { player: p, level: lv, cam: this.cam, sanity: this.sanity });
    const cxP = p.caixa();
    for (const e of this.director.lista) {
      if (e.state === 'dead') continue;
      if (e.frenzyContact && !this.finishers.action) {
        e.frenzyContact = false;
        this.finishers.start(this, e);
        continue;
      }
      if (!e.acertou() || this.escondido) continue;
      // O golpe dele tambem passa a valer por caixa: quem rasteja bate na
      // canela, quem esta em pe bate no peito, e os dois contam.
      const b = e.caixa();
      const perto = Math.abs(e.x - p.x) <= e.cfg.alcance + 8;
      const alturaOk = b.y0 <= cxP.y1 && b.y1 >= cxP.y0;
      if (perto && alturaOk) {
        if (e.fake) {
          e.finalizar();
          audio.whisper(1.05);
          this.sanity.drain(6, true);
        } else p.takeDamage(Math.round(e.cfg.dano * (this.diff.enemyDamage || 1)), e.x);
      }
    }
    // Ver um deles ja custa, mesmo sem encostar.
    const dInimigo = this.director.distanciaMaisProximo(p.x);
    if (dInimigo < 170) this.sanity.drain(dt * 0.5);

    // Ele nunca diz o que aquilo e. Nunca. O jogador que se vire.
    if (this.primeiroVisto === false && dInimigo < 140) {
      this.primeiroVisto = true;
      p.say('b2_know', 3.0, true);
      this.sanity.drain(8, true);
    }

    // ---- a perseguicao ----
    if (this.chase.ativo) {
      this.chase.onDano = (n, deX) => p.takeDamage(Math.round(n * (this.diff.chaseDamage || 1)), deX);
      this.chase.onFala = (k) => p.say(k, 0, true);
      this.chase.onGrab = (deX) => this.iniciarGrab(deX);
      if (!this.grab && !this.chaseSequence.action) {
        this.chase.update(dt, {
          player: p, level: lv, levelKey: lv.key,
          escondido: !!this.escondido, prendendo,
        });
      }
    }

    // ---- a sanidade ----
    this.sanity.update(dt, {
      dark: lv.darkAt(p.x) * (this.isqueiroT > 0 ? 0.3 : 1),
      safe: !!lv.safe && !this.chase.ativo,
      chase: this.chase.ativo && !this.escondido,
    });
    // A camara fria cobra so por estar la dentro. E ela que ensina o
    // jogador a temer o proprio medidor.
    if (lv.frio) this.sanity.drain(dt * (this.isqueiroT > 0 ? 0.35 : 0.9));
    this.sanity.apply();
    this.inv.sanityState = this.sanity.state;
    if (p.hp <= 0) this.derrubado();

    this.updateFrio(dt, lv);
    if (this.flags.combat_lab) this.updateCombatLab(dt);
  }

  // A PRIMEIRA ALUCINACAO GRANDE. Os ganchos comecam a balancar. Todos. No
  // mesmo ritmo. E nao ha vento aqui dentro.
  updateFrio(dt, lv) {
    if (!lv.frio) return;
    const p = this.player;
    const f = this.frio || (this.frio = { fase: 0, t: 0 });
    f.t += dt;

    if (f.fase === 0 && p.x > 460) {
      f.fase = 1; f.t = 0;
      lv.balanco = 1;
      audio.metalCreak(1.2);
      audio.chainRattle(0.8);
      p.sayAll(['b2_hook_1', 'b2_hook_2'], true);
      this.sanity.drain(6, true);
    } else if (f.fase === 1 && f.t > 5.2) {
      f.fase = 2; f.t = 0;
      p.say('b2_hook_3', 2.8, true);
    } else if (f.fase === 2 && this.isqueiroT > 0 && Math.abs(p.x - 490) < 150) {
      f.fase = 3; f.t = 0;
      lv.casaco = 1;
      p.say('b2_hook_4', 2.8, true);
      this.sanity.drain(8, true);
    } else if (f.fase === 3 && this.isqueiroT <= 0) {
      // A chama apaga. Quando ele acende de novo, nao tem mais nada.
      f.fase = 4; f.t = 0;
      lv.casaco = 0;
    } else if (f.fase === 4 && this.isqueiroT > 0) {
      f.fase = 5; f.t = 0;
      p.sayAll(['b2_hook_5', 'b2_hook_6'], true);
      this.sanity.drain(10, true);
      this.anotar('j_cold');
      this.anotar('j_hooks');
    }
    this.flags.frioFase = f.fase;
  }

  // O tiro precisa saber em quem bateu. O jogador dispara; o jogo procura
  // alguem na frente do cano.
  sangrarAlvo(x, y, facing, quantidade = 14, brutal = false) {
    this.fx.burst(quantidade, () => ({
      x: x + (Math.random() - 0.5) * (brutal ? 18 : 8),
      y: y + (Math.random() - 0.5) * (brutal ? 14 : 7),
      vx: facing * (22 + Math.random() * (brutal ? 125 : 72)) + (Math.random() - 0.5) * 30,
      vy: -24 - Math.random() * (brutal ? 95 : 48), ay: 270,
      life: 0.55 + Math.random() * 0.55,
      size: brutal && Math.random() > 0.58 ? 2 + ((Math.random() * 2) | 0) : 1,
      color: Math.random() > 0.22 ? '#741914' : '#2a0b0b', a: 0.98, fade: 0.75,
    }));
    if (brutal) { gfx.shake(4.8, 0.34); gfx.flash = Math.max(gfx.flash, 0.035); }
  }

  registrarSangue(x, y, size = 6) {
    if (!this.level) return;
    this.bloodDecals = this.bloodDecals || [];
    this.bloodDecals.push({ level: this.level.key, x: Math.round(x), y: Math.round(y), size, seed: (Math.random() * 9999) | 0 });
    if (this.bloodDecals.length > 90) this.bloodDecals.shift();
  }

  drawBloodDecals(ctx, cam, levelKey) {
    for (const d of (this.bloodDecals || [])) {
      if (d.level !== levelKey) continue;
      const x = Math.round(d.x - cam.ix), y = Math.round(d.y - cam.iy);
      ctx.save();
      ctx.globalAlpha = 0.64;
      ctx.fillStyle = '#3d0d0d';
      ctx.fillRect(x - Math.round(d.size / 2), y - 2, d.size, 2);
      ctx.fillRect(x + (d.seed % 7) - 4, y - 4, Math.max(2, (d.size / 3) | 0), 2);
      if (d.size > 10) ctx.fillRect(x - 8, y - 1, 17, 1);
      ctx.restore();
    }
  }

  sujarDavid(enemyX, intensidade = 1) {
    const dist = Math.abs(this.player.x - enemyX);
    const perto = clamp(1 - dist / 240, 0.08, 1);
    this.player.det.blood = clamp((this.player.det.blood || 0)
      + (0.055 + perto * 0.19) * intensidade, 0, 1);
    this.flags.kills = (this.flags.kills || 0) + 1;
  }

  tiro(x, facing, ang) {
    const oy = this.player.y - 48;
    const ox = x + facing * 20;
    const tan = Math.tan(-ang * Math.PI / 180);
    const acerta = (cx, box) => {
      const dx = (cx - ox) * facing;
      if (dx < -6 || dx > 240) return null;
      const y = oy + tan * dx;
      return y >= box.y0 - 5 && y <= box.y1 + 5 ? { d: dx, y } : null;
    };
    const anatomia = (box, y) => {
      const rel = clamp((y - box.y0) / Math.max(1, box.y1 - box.y0), 0, 1);
      if (rel < 0.22) return { zona: 'head', dano: 5 };
      if (rel < 0.48) return { zona: 'torso', dano: 2.4 };
      if (rel < 0.68) return { zona: 'arms', dano: 1.6 };
      if (rel < 0.90) return { zona: 'legs', dano: 1.35 };
      return { zona: 'feet', dano: 1 };
    };

    const hits = [];
    if (this.chase.ativo && this.chase.credor && this.chase.levelKey === this.level.key) {
      const c = this.chase.credor;
      const box = c.caixa(), h = acerta(c.x, box);
      if (h) hits.push({ ...h, ...anatomia(box, h.y), tipo: 'credor', alvo: c });
    }
    for (const id of Object.keys(this.npcs)) {
      const n = this.npcs[id];
      if (!n.alive || n.cfg.level !== this.level.key) continue;
      const box = n.caixa(this.level.groundY), h = acerta(n.x, box);
      if (h) hits.push({ ...h, ...anatomia(box, h.y), tipo: 'npc', alvo: n });
    }
    for (const h of this.director.naLinhaDoTiroTodos(ox, oy, facing, ang, 240)) {
      hits.push({ ...h, tipo: 'enemy' });
    }
    hits.sort((a, b) => a.d - b.d);

    // A bala conserva energia para um segundo corpo e para ali. O segundo
    // recebe menos impacto; nunca mais atravessa uma fila inteira.
    for (let hi = 0; hi < Math.min(2, hits.length); hi++) {
      const hit = hits[hi];
      const alvo = hit.alvo;
      if (hit.tipo === 'credor') {
        const r = this.chase.levarTiro();
        alvo.det.blood = Math.min(1, (alvo.det.blood || 0) + 0.2);
        audio.punchHit(r === 'stun' ? 1.2 : 0.7);
        this.sangrarAlvo(alvo.x, hit.y, facing, 11, false);
        if (r === 'stun') this.player.say('b2_chase_6', 0, true);
        continue;
      }
      if (hit.tipo === 'npc') {
        alvo.det.blood = 1;
        this.matarNpc(alvo, facing);
        continue;
      }

      const dano = hit.dano * (hi === 0 ? 1 : 0.62);
      const r = alvo.levarDano(dano, x, hit.zona);
      if (r === 'fake') {
        this.sanity.drain(5, true);
        continue;
      }
      const cabeca = hit.zona === 'head' && r === 'morreu' && alvo.explodirCabeca();
      audio.punchHit(cabeca ? 1.05 : 0.6);
      this.sangrarAlvo(alvo.x, hit.y, facing, cabeca ? 44 : 15, cabeca);
      this.registrarSangue(alvo.x, alvo.y, cabeca ? 14 : 6);
      if (r === 'morreu') {
        this.director.respirar(12 + Math.random() * 8);
        this.sanity.restore(2);
        this.sujarDavid(alvo.x, cabeca ? 1.35 : 1);
      }
    }
  }

  matarNpc(npc, facing) {
    if (!npc.matar()) return;
    this.flags['npc_morto_' + npc.id] = true;
    const hook = this.level.interactables.find(i => i.npc === npc.id);
    if (hook) hook.disabled = true;
    audio.punchHit(1.05);
    audio.thud(0.9);
    gfx.shake(3.8, 0.34);
    this.fx.burst(24, () => ({
      x: npc.x + (Math.random() - 0.5) * 12,
      y: this.level.groundY - 22 - Math.random() * 44,
      vx: facing * (20 + Math.random() * 75), vy: -18 - Math.random() * 62, ay: 250,
      life: 0.65 + Math.random() * 0.35, size: 1,
      color: Math.random() > 0.25 ? '#651713' : '#2a1010', a: 0.95, fade: 1.0,
    }));
    this.registrarSangue(npc.x, this.level.groundY, 13);
    this.sujarDavid(npc.x, 1.15);
    this.sanity.drain(18, true);
    this.player.say(npc.id === 'vigia' ? 'b2_npc_mind_vigia' : 'b2_npc_mind_operadora', 0, true);
    if (npc.id === 'vigia') {
      const note = this.level.interactables.find(i => i.id === 'safe_code_note');
      if (note && !this.flags.safe_code) note.disabled = false;
    } else if (npc.id === 'operadora') {
      // Matar a telefonista não pode apagar o gatilho do final. A violência
      // vira uma rota alternativa — mais cara para a sanidade — e a fuga
      // continua possível ao descer do mezanino.
      this.flags.telefonista = true;
      this.flags.npc_falado_operadora = true;
      this.anotar('j_oper');
      const drop = this.level.interactables.find(i => i.id === 'operator_drop');
      if (drop && !this.flags.operator_drop) drop.disabled = false;
    }
  }

  // Vida zerada agora encerra a tentativa. A tela oferece o checkpoint em
  // memoria da fuga, qualquer um dos dez saves, ou o menu.
  derrubado() {
    this.startGameOver('gameover_body');
  }

  startGameOver(reason) {
    if (this.state === 'gameover') return;
    this.state = 'gameover';
    this.gameOverT = 0;
    this.gameOverReason = reason || 'gameover_body';
    this.grab = null;
    this.scene = null;
    this.qte = null;
    this.escondido = null;
    this.player.frozen = true;
    this.player.controllable = false;
    this.director.limpar();
    this.chase.parar();
    audio.stopAllLoops();
    audio.stopDread(0.25);
    audio.tinnitus(1.8);
    gfx.letterbox = 0;
    gfx.fade = 0;
  }

  updateGameOver(dt) {
    this.gameOverT += dt;
    if (this.menuSlots.open) this.menuSlots.update(dt);

    if (!this.menuSlots.open && !this.transition && this.gameOverT > 0.8) {
      if (input.pressed('struggle') || input.pressed('confirm')) {
        audio.uiConfirm();
        if (this.deathRetry) {
          const retry = JSON.parse(JSON.stringify(this.deathRetry));
          this.fadeTo(() => this._aplicarSave(retry), 0.45, 0.7);
        } else this.fadeTo(() => this.reiniciarCapitulo2(), 0.55, 0.5);
      } else if (input.pressedFrame.has('KeyL')) {
        this.menuSlots.show('load', (i) => this.loadSlot(i), () => {});
      } else if (input.pressed('cancel')) {
        this.fadeTo(() => this.toMenu(), 0.45, 0.55);
      }
    }

    gfx.begin('#020102');
    const ctx = gfx.s;
    const pulse = 0.12 + Math.sin(this.gameOverT * 1.7) * 0.025;
    ctx.save(); ctx.globalAlpha = pulse; ctx.fillStyle = '#6e0e0b'; ctx.fillRect(0, 0, VW, VH); ctx.restore();
    const a = clamp(this.gameOverT * 1.4, 0, 1);
    text(ctx, T('gameover_title'), VW / 2, 94, {
      size: 22, font: 'serif', color: '#c9b9ac', align: 'center', track: 4, alpha: a, shadow: true,
    });
    ctx.save(); ctx.globalAlpha = a * 0.7; ctx.fillStyle = '#7b211b'; ctx.fillRect(VW / 2 - 74, 128, 148, 1); ctx.restore();
    text(ctx, T(this.gameOverReason), VW / 2, 145, {
      size: 9, font: 'ui', color: '#a99d92', align: 'center', alpha: a,
    });
    if (this.gameOverT > 0.8) {
      text(ctx, T('gameover_retry'), VW / 2, 211, { size: 9, font: 'ui', weight: 'bold', color: '#e2d7c9', align: 'center', track: 1, alpha: a });
      text(ctx, T('gameover_load'), VW / 2, 231, { size: 8, font: 'ui', color: '#998d83', align: 'center', track: 1, alpha: a });
      text(ctx, T('gameover_menu'), VW / 2, 249, { size: 8, font: 'ui', color: '#756b64', align: 'center', track: 1, alpha: a });
    }
    this.menuSlots.draw(ctx);
    gfx.present(dt);
  }

  reiniciarCapitulo2() {
    this.flags = { cap2: true, visto: {}, barks: {}, examinado: {} };
    this.resetChapter2();
    this._aplicarMundo(null);
    this.flags.supplies = this.supplies.newRun();
    this.player.hasGun = false;
    this.player.ammo = 0; this.player.reserve = 0;
    this.player.det.props.gun = 'none';
    this.player.segurarPorrete(false);
    this.deathRetry = null;
    this.startChapter2();
  }

  // -------------------------------------------------------------------
  // interface do capitulo
  // -------------------------------------------------------------------

  // As duas barras. CORPO em vermelho seco, CABECA em azul-noite — as duas
  // únicas coisas que ele ainda tem para perder, uma de cada cor, no canto
  // de cima. Ficam sempre visíveis: sem elas o jogador não tinha como saber
  // o que estava acontecendo com ele.
  _barra(ctx, x, y, w, k, cor, corFraca, rotulo, piscar) {
    ctx.save();
    ctx.globalAlpha = 0.96;
    ctx.fillStyle = '#07060a'; ctx.fillRect(x - 2, y - 2, w + 4, 10);
    ctx.fillStyle = '#292329'; ctx.fillRect(x, y, w, 6);
    // preenchimento
    const cheio = Math.round(w * clamp(k, 0, 1));
    ctx.fillStyle = k < 0.3 ? corFraca : cor;
    if (k < 0.3 && piscar) ctx.globalAlpha = 0.55 + 0.45 * Math.sin(performance.now() * 0.009);
    ctx.fillRect(x, y, cheio, 6);
    ctx.globalAlpha *= 0.48; ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, cheio, 1);
    ctx.globalAlpha = 0.28; ctx.fillStyle = '#050408';
    for (let sx = 10; sx < w; sx += 10) ctx.fillRect(x + sx, y, 1, 6);
    ctx.restore();
    text(ctx, rotulo, x - 6, y - 1, {
      size: 7, font: 'type', weight: 'bold', color: PAL.uiFaint,
      align: 'right', track: 1, alpha: 0.85,
    });
    text(ctx, String(Math.round(k * 100)), x + w + 6, y - 1, {
      size: 7, font: 'type', weight: 'bold', color: PAL.uiDim,
      align: 'left', alpha: 0.85,
    });
  }

  drawCh2UI(ctx) {
    const p = this.player;

    this.journal.drawToast(ctx);
    this.inv.drawToast(ctx);

    ctx.save();
    ctx.globalAlpha = 0.74; ctx.fillStyle = '#08070b'; ctx.fillRect(8, 6, 132, 34);
    ctx.fillStyle = '#332a2a'; ctx.fillRect(8, 6, 132, 1); ctx.fillRect(8, 39, 132, 1);
    ctx.restore();
    const bx = 48, bw = 72;
    this._barra(ctx, bx, 12, bw, p.hp / 100, '#a8382c', '#e0503a', T('hud_hp'), true);
    this._barra(ctx, bx, 27, bw, this.sanity.shown / 100, '#4a6a9e', '#7fa5d8', T('hud_san'), true);

    // Munição sempre legível no topo, não só durante a mira. O tambor
    // mostra o carregador e o número após a barra é a reserva acumulada.
    if (p.hasGun) {
      const ax = VW - 106, ay = 7;
      ctx.save(); ctx.globalAlpha = 0.82; ctx.fillStyle = '#08070b'; ctx.fillRect(ax, ay, 98, 28);
      ctx.fillStyle = '#3b3228'; ctx.fillRect(ax, ay, 98, 1); ctx.fillRect(ax, ay + 27, 98, 1);
      ctx.restore();
      text(ctx, T('hud_ammo'), ax + 7, ay + 5, { size: 6, font: 'type', weight: 'bold', color: PAL.uiFaint, track: 1 });
      for (let i = 0; i < p.clipSize; i++) {
        ctx.fillStyle = i < p.ammo ? '#d9b66f' : '#332e2b';
        ctx.fillRect(ax + 8 + i * 7, ay + 15, 4, 8);
        if (i < p.ammo) { ctx.fillStyle = '#fff0c0'; ctx.fillRect(ax + 8 + i * 7, ay + 15, 4, 1); }
      }
      text(ctx, `+${p.reserve}`, ax + 91, ay + 13, { size: 10, font: 'type', weight: 'bold', color: PAL.uiText, align: 'right' });
    }

    // Escondido: o folego, e como sair.
    if (this.escondido) {
      const w = 92, x = (VW - w) / 2, y = VH - 46;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#0c0a0b';
      ctx.fillRect(x - 1, y - 1, w + 2, 6);
      ctx.fillStyle = this.respiro > 0.3 ? '#7fa5d8' : PAL.uiAccent;
      ctx.fillRect(x, y, Math.round(w * this.respiro), 4);
      ctx.restore();
      text(ctx, T('hint_hold_breath'), VW / 2, y - 14, {
        size: 8, font: 'ui', weight: 'bold', color: PAL.uiDim,
        align: 'center', track: 2, alpha: 0.9, shadow: true,
      });
      text(ctx, T('hint_hide'), VW / 2, y + 10, {
        size: 7, font: 'ui', color: PAL.uiFaint, align: 'center', track: 1, alpha: 0.8,
      });
    }

    // Lembrete das teclas novas, so nos primeiros segundos do setor.
    if (this.locCard > 1.4 && this.flags.caderno && !this.chase.ativo) {
      text(ctx, T('hint_journal'), VW - 14, 14, {
        size: 7, font: 'ui', color: PAL.uiFaint, align: 'right', track: 1,
        alpha: clamp(this.locCard - 1.4, 0, 1) * 0.8,
      });
    }
  }

  // -------------------------------------------------------------------
  // O MAPA
  //
  // Ele pega a planta baixa no escritorio e depois nao tinha onde olhar
  // para ela: o item existia e a tela nao. Aqui esta a tela — desenhada
  // como a planta de verdade seria, com os setores em caixinha e o vinco
  // do papel. So aparece o que ele ja pisou: mapa de galpao nao mostra o
  // que voce nunca viu.
  // -------------------------------------------------------------------

  drawMapa(ctx) {
    const a = this.mapaFade;
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a * 0.75;
    ctx.fillStyle = '#05040a';
    ctx.fillRect(0, 0, VW, VH);
    ctx.restore();

    const W = 300, H = 158;
    const ox = Math.round((VW - W) / 2), oy = Math.round((VH - H) / 2) + 6;

    ctx.save();
    ctx.globalAlpha = a;
    // o papel
    ctx.fillStyle = '#b8b09a';
    ctx.fillRect(ox, oy, W, H);
    ctx.fillStyle = '#a89f88';
    ctx.fillRect(ox, oy + H - 5, W, 5);
    // o vinco de quem dobrou em quatro e carregou no bolso
    ctx.globalAlpha = a * 0.28;
    ctx.fillStyle = '#7d7561';
    ctx.fillRect(ox + Math.round(W / 2), oy, 1, H);
    ctx.fillRect(ox, oy + Math.round(H / 2), W, 1);
    ctx.restore();

    text(ctx, T('map_title'), ox + 10, oy + 6, {
      size: 8, font: 'type', weight: 'bold', color: '#4a4234', track: 2, alpha: a,
    });

    for (const s of MAPA_SETORES) {
      const visto = this.flags.visto && this.flags.visto[s.k];
      const aqui = this.level && this.level.key === s.k;
      const x = ox + s.x, y = oy + s.y;
      ctx.save();
      ctx.globalAlpha = a * (visto ? 1 : 0.22);
      ctx.fillStyle = aqui ? '#8d3128' : '#4a4234';
      ctx.fillRect(x, y, s.w, 1);
      ctx.fillRect(x, y + s.h - 1, s.w, 1);
      ctx.fillRect(x, y, 1, s.h);
      ctx.fillRect(x + s.w - 1, y, 1, s.h);
      if (aqui) {
        ctx.globalAlpha = a * (0.25 + 0.2 * Math.sin(performance.now() * 0.005));
        ctx.fillStyle = '#8d3128';
        ctx.fillRect(x + 1, y + 1, s.w - 2, s.h - 2);
      }
      ctx.restore();
      if (visto) {
        text(ctx, T(s.n), x + s.w / 2, y + s.h / 2 - 4, {
          size: s.w < 45 ? 5 : 6, font: 'type', weight: 'bold',
          color: aqui ? '#7a1c14' : '#3f3a2e',
          align: 'center', track: s.w < 45 ? 0 : 1, alpha: a,
        });
      }
    }

    // a marca a lapis na doca 3 — estava no item desde o comeco
    // Depois da ligacao, a planta passa a mostrar uma sala que nao existe.
    // Ela nao vira objetivo nem porta: e apenas o mapa sabendo mais que ele.
    if (this.flags.phantom_room) {
      const x = ox + 12, y = oy + 119, w = 50, h = 24;
      ctx.save();
      ctx.globalAlpha = a * (0.48 + Math.sin(performance.now() * 0.004) * 0.12);
      ctx.strokeStyle = '#6f1d19';
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
      text(ctx, T('map_unknown'), x + w / 2, y + 7, {
        size: 6, font: 'ui', weight: 'bold', color: '#6f1d19', align: 'center', alpha: a * 0.8,
      });
    }

    const doca = MAPA_SETORES.find(s => s.k === 'ch2_dock');
    if (this.flags.visto && this.flags.visto.ch2_corridor) {
      const x = ox + doca.x + doca.w - 10, y = oy + doca.y + 8;
      text(ctx, '✕', x, y - 4, {
        size: 9, font: 'type', weight: 'bold', color: '#7a1c14', alpha: a * 0.9,
      });
    }

    text(ctx, T('map_hint'), VW / 2, oy + H + 8, {
      size: 7, font: 'type', color: '#5a5249', align: 'center', track: 1, alpha: a, shadow: true,
    });
  }

  // Ele parado, sem perseguir mais. Apenas olhando ele ir embora — como
  // quem sabe que vai cobrar outro dia.
  drawCredorParado(ctx, cam) {
    const c = this.credorParado;
    if (!c) return;
    c.enemy.draw(ctx, cam);
  }

  // -------------------------------------------------------------------
  // salvar / carregar
  // -------------------------------------------------------------------

  // -------------------------------------------------------------------
  // SALVAR
  //
  // A primeira versao disto nao salvava: ela anotava a fase e o X e, ao
  // carregar, TELEPORTAVA o personagem. Tudo o mais — a perseguicao, os
  // itens ja pegos nas outras salas, as portas abertas — ficava do jeito
  // que estivesse na sessao. Carregar no meio da fuga devolvia um galpao
  // apagado, com a musica de tensao tocando, sem o Credor e com o portao
  // da doca fechado: o jogo ficava impossivel de terminar.
  //
  // Agora o save carrega o MUNDO INTEIRO: o estado de cada setor, o que
  // foi pego em cada um, e a perseguicao em curso.
  // -------------------------------------------------------------------

  // Estado de todos os setores, e nao so daquele em que ele esta.
  _estadoDoMundo() {
    const out = {};
    for (const key of Object.keys(this.levels)) {
      const lv = this.levels[key];
      const usados = (lv.interactables || []).filter(i => i.disabled && i.id).map(i => i.id);
      const pego = lv.pego ? Object.keys(lv.pego).filter(k => lv.pego[k]) : [];
      if (usados.length || pego.length) out[key] = { usados, pego };
    }
    return out;
  }

  _aplicarMundo(mundo) {
    // Primeiro volta TODOS os setores ao instante em que foram construidos.
    // Isto e indispensavel quando se carrega um save antigo na mesma sessao:
    // itens apanhados depois dele precisam reaparecer no chao/cenario.
    for (const key of Object.keys(this.levels)) {
      const lv = this.levels[key];
      const base = this._mundoBase && this._mundoBase[key];

      for (const it of (lv.interactables || [])) {
        if (!it.id) continue;
        it.disabled = base && Object.prototype.hasOwnProperty.call(base.disabled, it.id)
          ? base.disabled[it.id]
          : false;
      }

      // O desenho procedural consulta `pego` para decidir se ainda desenha
      // porrete, mapa, municao, maco, pistola, chave etc. Limpar este objeto
      // e o que realmente devolve o item ao cenario.
      if (lv.pego) {
        for (const id of Object.keys(lv.pego)) delete lv.pego[id];
      }
    }

    if (!mundo) return;
    for (const key of Object.keys(mundo)) {
      const lv = this.levels[key];
      if (!lv) continue;
      const m = mundo[key];
      for (const id of (m.usados || [])) {
        const it = (lv.interactables || []).find(i => i.id === id);
        if (it) it.disabled = true;
      }
      if (lv.pego) for (const id of (m.pego || [])) lv.pego[id] = true;
    }
  }

  _estadoSalvavel() {
    const lv = this.level;
    const p = this.player;
    return {
      v: 4,
      level: lv.key,
      x: Math.round(p.x),
      facing: p.facing,
      flags: this.flags || {},
      san: this.sanity.save(),
      jr: this.journal.save(),
      inv: this.inv.save(),
      hp: Math.round(p.hp),
      gun: !!p.hasGun,
      ammo: p.ammo, res: p.reserve,
      blood: p.det.blood || 0,
      coatTorn: !!p.det.coatTorn,
      difficulty: this.diff.id,
      bloodDecals: (this.bloodDecals || []).map(d => ({ ...d })),
      cig: this.cigTentativas || 0,
      esp: this.espelhoN || 0,
      mundo: this._estadoDoMundo(),
      fuga: this.chase.save(),
      chaseSeq: this.chaseSequence.save(),
      // Capitulo 3: a senha do Credor e o estado do flashback. Sem isso,
      // carregar no meio do passado devolvia o David do presente numa fase
      // que nao existe mais nele.
      senha: this.ticket.save(),
      presente: this._presente || null,
      interrog: this.interrog.save(),
    };
  }

  saveSlot(i) {
    const lv = this.level;
    save.write(i, {
      locationName: T(lv.nameKey),
      playtime: this.playtime,
      thumb: gfx.snapshot(),
      state: this._estadoSalvavel(),
    });
    if (this.menu) this.menu.refresh();
  }

  loadSlot(i) {
    this.runId++;
    const d = save.read(i);
    if (!d || !d.state) { this.toMenu(); return; }
    this.pendente = d.state;
    this.playtime = d.playtime || 0;
    audio.stopMusic(0.8);
    audio.stopAllLoops();
    audio.stopDread(0.3);
    this.pause.active = false;
    // Nunca cair direto no jogo: a tela de carregamento existe para o
    // jogador largar o que estava fazendo antes e chegar preparado.
    this.state = 'carregando';
    this.loadT = 0;
    gfx.fade = 0;
    gfx.eyelid = 1;
    gfx.letterbox = 0;
  }

  // Aplica de verdade o estado salvo. So roda quando a tela de
  // carregamento termina.
  _aplicarSave(s) {
    const p = this.player;
    if (s.difficulty) {
      settings.difficulty = s.difficulty;
      this.applySettings();
    }
    this.flags = s.flags || {};
    this.resetChapter2();
    this.sanity.load(s.san);
    this.journal.load(s.jr);
    this.inv.load(s.inv);
    this.cigTentativas = s.cig || 0;
    this.espelhoN = s.esp || 0;

    p.hp = typeof s.hp === 'number' ? s.hp : 100;
    p.hasGun = !!s.gun;
    p.ammo = s.ammo === undefined ? 0 : s.ammo;
    p.reserve = s.res === undefined ? 0 : s.res;
    p.det.blood = clamp(s.blood || 0, 0, 1);
    p.det.coatTorn = !!s.coatTorn || !!this.flags.coat_torn;
    p.det.injury = clamp((100 - p.hp) / 100, 0, 1);
    this.bloodDecals = (s.bloodDecals || []).map(d => ({ ...d }));
    p.det.props.gun = p.hasGun ? 'holstered' : 'none';
    p.det.speed = 1;
    p.segurarPorrete(this.inv.hand === 'club');
    p.idleMode = this.flags.cap2 ? 'sit' : null;
    p.hurtT = 0; p.invuln = 0;

    // ---- Capitulo 3 ----
    this.ticket.load(s.senha);
    this.namePrompt.ativo = false;
    // A casa so queima dentro da cena. Carregar um save nunca devolve o
    // jogador para o meio de um incendio.
    this.fogo.parar(); this.fogo.reset();
    this.interrog.load(s.interrog);
    this._presente = s.presente || null;
    if (this.flags.flashback) {
      // Carregar dentro do passado tem que devolver o David do passado: sem
      // arma, sem sangue, sem sanidade, e com o ocio que ACENDE.
      p.idleMode = 'smokeFree';
      p.hasGun = false;
      p.club = false;
      p.det.coatTorn = false;
      p.det.blood = 0;
      this.sanity.enabled = false;
      // E com a roupa dele daquela noite. Sem isto, carregar um save dentro
      // do passado devolvia o homem certo vestido de sobretudo.
      p.det.parts = partesDe('david_passado');
    } else {
      p.det.parts = null;
    }
    if (this.flags.cap3) this.director.ligado = false;

    // O mundo ANTES da fase: entrar num setor lê o estado dele.
    this._aplicarMundo(s.mundo);
    this.supplies.apply(this.flags.supplies || { records: [], pallets: [] });
    // Compatibilidade com o save antigo, que so guardava a sala atual.
    if (!s.mundo && s.usados) {
      const lv0 = this.levels[s.level];
      if (lv0) for (const id of s.usados) {
        const it = (lv0.interactables || []).find(x => x.id === id);
        if (it) it.disabled = true;
        if (lv0.pego) lv0.pego[id] = true;
      }
    }

    // A perseguicao volta EXATAMENTE como estava — inclusive os setores
    // que ja estavam no escuro.
    this.chase.load(s.fuga, this.levels, s.level);
    this.chaseSequence.load(s.chaseSeq);

    this.enterLevel(s.level || 'alley', s.x, s.facing);
    if (this.chase.ativo) {
      // enterLevel troca todo o ambiente da sala e, por isso, também encerra
      // loops antigos. A perseguição carregada precisa recolocar a motosserra
      // depois dessa troca — com o mesmo estado e distância restaurados.
      audio.startDread();
      audio.startLoop('serra', { gain: 0.035, fade: 0.8 });
      this.deathRetry = JSON.parse(JSON.stringify(s));
    } else {
      this.deathRetry = null;
    }
    this.state = 'play';
    gfx.fade = 1;
    this.transition = { t: 0, phase: 'in', outDur: 0.01, inDur: 1.1, action: null };
  }

  // -------------------------------------------------------------------
  // a tela de carregamento
  // -------------------------------------------------------------------

  updateCarregando(dt) {
    this.loadT += dt;
    const DUR = 9.5;
    const k = clamp(this.loadT / DUR, 0, 1);

    gfx.begin('#000');
    const ctx = gfx.s;

    // uma frase que muda, como quem lembra o caso aos poucos
    const linhas = ['load_1', 'load_2', 'load_3', 'load_4'];
    const idx = Math.min(linhas.length - 1, Math.floor(k * linhas.length));
    const dentro = (k * linhas.length) % 1;
    const a = clamp(dentro * 6, 0, 1) * clamp((1 - dentro) * 6, 0, 1);
    text(ctx, T(linhas[idx]), VW / 2, VH / 2 - 24, {
      size: 11, font: 'type', weight: 'bold', color: '#6d6458',
      align: 'center', alpha: a * 0.9,
    });

    // o mostrador: um traco que enche, e o nome do lugar
    const w = 150, x = (VW - w) / 2, y = VH / 2 + 8;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#1a1618';
    ctx.fillRect(x, y, w, 2);
    ctx.fillStyle = PAL.uiAccent;
    ctx.fillRect(x, y, Math.round(w * k), 2);
    ctx.restore();
    const nome = this.pendente && this.levels[this.pendente.level];
    text(ctx, nome ? T(nome.nameKey) : '', VW / 2, y + 10, {
      size: 8, font: 'type', weight: 'bold', color: '#4b453d',
      align: 'center', track: 2, alpha: 0.9,
    });
    text(ctx, T('load_wait'), VW / 2, VH - 26, {
      size: 7, font: 'type', color: '#3a352f', align: 'center', track: 2, alpha: 0.8,
    });

    gfx.fade = 0;
    gfx.present(dt);

    if (this.loadT >= DUR) {
      const s = this.pendente;
      this.pendente = null;
      this._aplicarSave(s);
    }
  }

  // -------------------------------------------------------------------
  // ARENA DE COMBATE
  // -------------------------------------------------------------------

  startCombatLab() {
    this.playtime = 0;
    this.resetChapter2();
    this.flags = { cap2: true, combat_lab: true, visto: {}, barks: {}, examinado: {}, visitas: {} };
    this._aplicarMundo(null);
    this.sanity.enabled = true; this.sanity.reset(72);
    this.player.hp = 100;
    this.player.hasGun = true; this.player.ammo = 6; this.player.reserve = 90;
    this.player.det.props.gun = 'holstered'; this.player.segurarPorrete(false);
    // Quando vem do menu, a transição já entrou na fase de abertura. Não a
    // apague aqui: fazer isso congelava gfx.fade em preto e a arena rodava
    // inteira atrás de uma tela escura.
    this.state = 'play';
    audio.stopMusic(0.5); audio.stopAllLoops();
    this.enterLevel('ch2_combatlab', 120, 1);
    this.locCard = 0;
    this.spawnCombatLab(true);
  }

  spawnCombatLab(resetPlayer = false) {
    this.director.limpar(); this.director.ligado = false;
    if (resetPlayer) {
      this.player.hp = 100; this.player.ammo = 6; this.player.reserve = 90;
      this.player.det.blood = 0; this.player.det.injury = 0;
    }
    const defs = [['semrosto', 470], ['empilhado', 760], ['semrosto', 1080]];
    for (const [tipo, x] of defs) {
      const e = this.director.forcar(tipo, x, this.level.groundY);
      e.forceFrenzy = true;
    }
    this.combatRespawnT = 0;
  }

  updateCombatLab(dt) {
    if (this.finishers.action) return;
    if (this.director.vivos > 0) { this.combatRespawnT = 0; return; }
    this.combatRespawnT += dt;
    if (this.combatRespawnT > 2.2) this.spawnCombatLab(false);
  }

  drawCombatLabUI(ctx) {
    ctx.save(); ctx.globalAlpha = 0.82; ctx.fillStyle = '#070609'; ctx.fillRect(72, VH - 34, VW - 144, 27); ctx.restore();
    text(ctx, T('combatlab_title'), VW / 2, VH - 31, { size: 8, font: 'ui', weight: 'bold', color: PAL.uiAccent, align: 'center', track: 1 });
    text(ctx, T('combatlab_hint'), VW / 2, VH - 19, { size: 6, font: 'ui', color: PAL.uiDim, align: 'center', shadow: true });
  }

  // Sombras longas fazem cada lampada participar da composicao. Em sanidade
  // baixa uma segunda sombra atrasa alguns pixels; alucinacoes justas nao
  // projetam nenhuma, que e uma pista observavel antes de gastar munição.
  drawCinematicShadows(ctx, cam, lv) {
    const atores = [{ x: this.player.x, y: this.player.y, fake: false }];
    for (const e of this.director.lista) if (e.state !== 'dead') atores.push({ x: e.x, y: e.y, fake: e.fake });
    if (this.chase.ativo && this.chase.credor && this.chase.levelKey === lv.key) atores.push({ x: this.chase.credor.x, y: this.chase.credor.y, fake: false });
    ctx.save();
    for (const a of atores) {
      if (a.fake) continue;
      let light = null, bd = 1e9;
      for (const L2 of lv.lightDefs) {
        const d = Math.abs(L2.x - a.x);
        if (d < bd) { bd = d; light = L2; }
      }
      const dir = light ? Math.sign(a.x - light.x) || 1 : 1;
      const x = Math.round(a.x - cam.ix), y = Math.round(a.y - cam.iy);
      const len = clamp(34 + bd * 0.22, 38, 92);
      ctx.globalAlpha = 0.22; ctx.fillStyle = '#010102';
      for (let i = 0; i < 8; i++) ctx.fillRect(x + dir * Math.round(i * len / 8) - 4, y + i - 3, 9 - i, 2);
      if (this.sanity.state >= 2 && a.x === this.player.x) {
        ctx.globalAlpha = 0.12 + 0.04 * Math.sin(performance.now() * 0.004);
        for (let i = 0; i < 6; i++) ctx.fillRect(x - dir * 8 + dir * Math.round(i * len / 7), y + i - 4, 7 - i, 1);
      }
    }
    // Revisitas mudam pouco, mas mudam: marcas surgem onde antes havia
    // apenas parede. O terceiro retorno acrescenta um rastro no chão.
    if (lv.revisitStage > 0) {
      const mx = Math.round(lv.minX + 126 - cam.ix), my = Math.round(lv.groundY - 54 - cam.iy);
      ctx.globalAlpha = 0.34 + lv.revisitStage * 0.1; ctx.fillStyle = '#4e1714';
      ctx.fillRect(mx, my, 4, 7); ctx.fillRect(mx - 3, my + 2, 2, 5); ctx.fillRect(mx + 5, my + 1, 2, 6);
      if (lv.revisitStage >= 2) for (let i = 0; i < 5; i++) ctx.fillRect(mx + 10 + i * 9, Math.round(lv.groundY - cam.iy) - 2 + (i % 2), 5, 2);
    }
    ctx.restore();
  }

  // -------------------------------------------------------------------
  // SALA DE TESTE
  // -------------------------------------------------------------------

  startLab() {
    this.state = 'lab';
    this.labAnim = -1;      // -1 = automatico
    this.labSpeed = 1;
    this.labSkel = false;
    this.labFlip = 1;
    this.labFree = false;
    audio.stopMusic(0.6);
    audio.stopAllLoops();
    this.enterLevel('alley', 200, 1);
    this.locCard = 0;
    this.player.det.play('idle', { blend: 0 });
  }

  updateLab(dt) {
    const lv = this.level;
    if (input.pressed('cancel')) { this.fadeTo(() => this.toMenu(), 0.4, 0.5); }

    // troca de animacao
    if (input.pressedFrame.has('ArrowLeft') || input.pressedFrame.has('ArrowRight')) {
      const d = input.pressedFrame.has('ArrowRight') ? 1 : -1;
      this.labAnim = this.labAnim + d;
      if (this.labAnim < -1) this.labAnim = ANIM_NAMES.length - 1;
      if (this.labAnim >= ANIM_NAMES.length) this.labAnim = -1;
      audio.uiMove();
      if (this.labAnim >= 0) this.player.det.play(ANIM_NAMES[this.labAnim], { restart: true, blend: 0.1 });
    }
    if (input.pressedFrame.has('KeyZ')) { this.labSpeed = clamp(this.labSpeed - 0.1, 0.1, 3); audio.uiMove(); }
    if (input.pressedFrame.has('KeyX')) { this.labSpeed = clamp(this.labSpeed + 0.1, 0.1, 3); audio.uiMove(); }
    if (input.pressedFrame.has('KeyC')) { this.labSkel = !this.labSkel; audio.uiMove(); }
    if (input.pressedFrame.has('KeyV')) { this.labFlip = -this.labFlip; this.player.det.setFacing(this.labFlip); audio.uiMove(); }
    if (input.pressedFrame.has('KeyF')) { this.labFree = !this.labFree; this.cam.free = this.labFree; audio.uiMove(); }

    lv.update(dt);
    if (this.labAnim >= 0) {
      const d = this.player.det;
      d.speed = this.labSpeed;
      if (d.done && !d.loopHint) d.play(ANIM_NAMES[this.labAnim], { restart: true, blend: 0 });
      d.update(dt);
      this.player.vx = 0;
    } else {
      this.player.det.speed = this.labSpeed;
      this.player.update(dt, lv, !this.labFree);
    }

    if (this.labFree) {
      this.cam.x = clamp(this.cam.x + input.axisX() * 220 * dt, this.cam.minX, this.cam.maxX);
    } else {
      this.cam.follow(this.player.x, 0, this.player.facing, dt, Math.abs(this.player.vx) > 4);
    }
    this.rain.update(dt, this.cam.x);
    this.fog.update(dt, lv.t);
    this.fx.update(dt);

    const cam = this.cam;
    gfx.begin('#05060a');
    lv.drawBack(gfx.s, cam);
    this.player.draw(gfx.s, cam);
    this.fx.draw(gfx.s, cam.ix, cam.iy);
    this.fog.draw(gfx.s);
    this.rain.draw(gfx.s);
    lv.drawFore(gfx.s, cam);
    gfx.beginLights(lv.ambient);
    lv.addLights(gfx, cam);
    for (const L2 of this.player.lights(cam)) gfx.addLight(L2.x, L2.y, L2.r, L2.color, L2.i);
    gfx.endLights(lv.bloom);

    if (this.labSkel) this.drawSkeleton(gfx.s, cam);
    this.drawLabUI(gfx.s);
    gfx.present(dt);
  }

  drawSkeleton(ctx, cam) {
    const p = this.player;
    const x = Math.round(p.x - cam.ix), y = Math.round(p.y - cam.iy);
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#38d0ff';
    ctx.fillRect(x - 1, y - 1, 3, 3);                 // pe
    ctx.fillStyle = '#ffd24a';
    ctx.fillRect(x - 1, y - 31, 3, 3);                // quadril
    ctx.fillRect(x - 1, y - 51, 3, 3);                // ombro
    ctx.fillStyle = '#ff5a4a';
    ctx.fillRect(x - 1, y - 67, 3, 3);                // topo da cabeca
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#38d0ff';
    ctx.fillRect(x, y - 66, 1, 66);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 30, y, 60, 1);                   // linha do chao
    ctx.restore();
  }

  drawLabUI(ctx) {
    const name = this.labAnim < 0 ? (getLang() === 'en' ? 'AUTO (free control)' : 'AUTO (controle livre)')
      : ANIM_NAMES[this.labAnim].toUpperCase();
    panelBox(ctx, 8, 8, 190, 44, 1);
    text(ctx, T('lab_title'), 14, 12, { size: 9, font: 'ui', weight: 'bold', color: PAL.uiAccent, track: 2 });
    text(ctx, name, 14, 24, { size: 10, font: 'ui', weight: 'bold', color: PAL.uiText, track: 1 });
    text(ctx, `${T('lab_speed')} ${this.labSpeed.toFixed(1)}x   ${this.player.det.anim}`, 14, 37,
      { size: 8, font: 'ui', color: PAL.uiDim, track: 1 });
    text(ctx, T('lab_hint'), VW / 2, VH - 14,
      { size: 7, font: 'ui', color: '#5a5249', align: 'center', track: 1, shadow: true });
    text(ctx, this.labFree ? 'F  CAMERA LIVRE [ON]' : 'F  CAMERA LIVRE', VW - 8, 12,
      { size: 7, font: 'ui', color: this.labFree ? PAL.uiAccent : '#5a5249', align: 'right', track: 1 });
  }

  // -------------------------------------------------------------------
  // depuracao
  // -------------------------------------------------------------------

  drawDebug(ctx, label) {
    const lines = [
      `${T('dbg_on')}  ${label}`,
      `fps ${this.fps.toFixed(0)}   ${formatPlaytime(this.playtime)}`,
    ];
    if (this.player && this.state !== 'menu') {
      lines.push(`x ${this.player.x.toFixed(1)}  v ${this.player.vx.toFixed(0)}  ${this.player.state}`);
      lines.push(`anim ${this.player.det.anim}  t ${this.player.det.time.toFixed(2)}`);
      lines.push(`cam ${this.cam.x.toFixed(0)}  face ${this.player.facing}`);
    }
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 150, lines.length * 10 + 8);
    ctx.restore();
    for (let i = 0; i < lines.length; i++) {
      text(ctx, lines[i], 5, 4 + i * 10, { size: 8, font: 'mono', color: '#7ce08a' });
    }
  }
}

// Pausa curta para o navegador pintar a mensagem de carregamento. Usa
// setTimeout e nao requestAnimationFrame de proposito: rAF congela quando a
// aba esta em segundo plano e o jogo travaria no meio do boot.
function frame(ms = 24) { return new Promise(r => setTimeout(r, ms)); }

// O fio vermelho embaixo do nome do capitulo. E o unico vermelho da tela,
// e e o mesmo do titulo e do sangue — a paleta so deixa essa cor gritar.
function ctxLinha(ctx, cx, y, largura, alpha) {
  if (largura <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PAL.uiAccent;
  ctx.fillRect(Math.round(cx - largura / 2), Math.round(y), Math.round(largura), 1);
  ctx.restore();
}

const game = new Game();
window.game = game;

// Ganchos de desenvolvimento. Permitem rodar o jogo quadro a quadro e tirar
// capturas sem depender do rAF (que nao roda em aba escondida). Nao afetam
// o jogo normal — nada aqui e chamado pelo laco principal.
window.__dev = {
  step(dt = 1 / 60, n = 1) { for (let i = 0; i < n; i++) game.tick(dt); return game.state; },
  gfx,
  // O audio e um singleton POR JANELA. O teste roda o jogo dentro de um
  // iframe, entao importar `audio.js` da pagina de teste devolve OUTRA
  // instancia — a que ninguem esta usando. Sem este gancho nao da para
  // conferir a trilha sem por 110 MB de mp3 para tocar no meio da bateria.
  audio,
  // Pula direto para um setor. Existe so para testar: sem isto e preciso
  // jogar o capitulo inteiro para olhar a ultima sala.
  ir(key, x, facing = 1) {
    game.state = 'play';
    game.transition = null;
    gfx.fade = 0; gfx.eyelid = 1; gfx.letterbox = 0;
    game.scene = null; game.qte = null;
    game.enterLevel(key, x, facing);
    return key;
  },
  key(code, ms = 40) {
    window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true })), ms);
  },
  hold(code) { window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })); },
  release(code) { window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true })); },
  snap(nome) {
    const c = document.getElementById('game');
    return fetch('/snap?nome=' + nome, { method: 'POST', body: c.toDataURL('image/png') })
      .then(r => r.text());
  },
};

// Erro na construcao das fases viraria uma "promise rejeitada" sem contexto.
// Aqui ele chega na tela de erro junto com a etapa em que o boot parou.
game.boot().catch(e => {
  if (window.__crash) {
    window.__crash('Erro durante o carregamento', (e && e.stack) ? e.stack : String(e));
  } else throw e;
});
