// chase-sequence.js — a fuga em dois atos e o encerramento cinematografico.
//
// O Chase continua cuidando da inteligencia do Credor. Este modulo cuida
// apenas dos acontecimentos que precisam de encenacao: portao emperrado,
// rasgo do casaco, estante de emergencia, apagao e fuga para o patio.

import { VW, VH, clamp, gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { text } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { Enemy } from './enemies.js';
import { t as T } from '../i18n.js';

export class ChaseSequence {
  constructor() {
    this.action = null;
    this.cold = null;
    this.flash = 0;
    this.pendingLoad = null;
    this.rackHint = 0;
    this._coldBase = null;
    this._coldLevel = null;
  }

  reset(game = null) {
    this._restoreCold(game);
    this.action = null;
    this.cold = null;
    this.flash = 0;
    this.pendingLoad = null;
    this.rackHint = 0;
  }

  save() {
    return { cold: this.cold ? { t: this.cold.t, burst: this.cold.burst, wall: this.cold.wall } : null };
  }

  load(d) { this.pendingLoad = d || null; }

  enter(game, lv) {
    if (!lv || !game.flags) return;
    if (lv.key !== 'ch2_escape_cold') this._restoreCold(game);
    if (lv.key === 'ch2_service') {
      game.flags.chase_phase2 = true;
      const rack = lv.interactables.find(i => i.id === 'service_rack');
      const cache = lv.interactables.find(i => i.id === 'escape_cache');
      if (rack) rack.disabled = game.flags.escape_rack_choice === 'drop';
      if (cache) cache.disabled = !!game.flags.escape_cache || !!game.flags.escape_cache_blocked;
    }
    if (lv.key === 'ch2_service_long') {
      game.flags.chase_route2 = 'long';
      game.chase.routePressure = 1.02;
    }
    if (lv.key === 'ch2_escape_cold') {
      game.flags.chase_phase2 = true;
      this.cold = { t: 0, burst: false, wall: 0 };
      const restoring = !!(this.pendingLoad && this.pendingLoad.cold);
      if (restoring) Object.assign(this.cold, this.pendingLoad.cold);
      this._coldLevel = lv.key;
      this._coldBase = lv.lightDefs.map(L => L.i);
      // A porta acabou de fechar. O silencio parece uma vitoria por alguns
      // segundos, mas o Credor esta cortando a chapa do outro lado.
      if (game.chase.ativo && !restoring) {
        game.chase.chegada = Math.max(game.chase.chegada || 0, 4.4);
        game.chase.levelKey = '__parede_da_camara__';
      }
      audio.setLoopGain('serra', 0.001, 0.16);
      audio.setDread(0.01);
    }
    this.pendingLoad = null;
    if (lv.key === 'ch2_chainbay') {
      game.flags.chase_phase2 = true;
      game.chase.routePressure = 1.02;
      this.cold = null;
    }
  }

  interact(game, it) {
    switch (it.action) {
      case 'chase_gate':
        this.startGate(game);
        return true;
      case 'chase_sacrifice':
        if (game.flags.escape_rack_choice !== 'drop') this._dropRack(game, it);
        return true;
      case 'take_escape_cache':
        if (game.flags.escape_cache_blocked) {
          game.player.say('b2_cache_blocked', 0, true);
          return true;
        }
        it.disabled = true;
        game.flags.escape_cache = true;
        game.player.reserve += 6;
        game.player.ammoHud = 4;
        game.pegar('medkit');
        game.player.say('b2_cache_take', 0, true);
        audio.reloadClick(0.8);
        return true;
      case 'chase_route_short':
        game.flags.chase_route2 = 'short';
        game.chase.routePressure = 1.08;
        game.fadeTo(() => game.enterLevel('ch2_escape_cold', 78, 1), 0.12, 0.22);
        return true;
      case 'chase_route_long':
        game.flags.chase_route2 = 'long';
        game.chase.routePressure = 1.02;
        game.fadeTo(() => game.enterLevel('ch2_service_long', 74, 1), 0.12, 0.22);
        return true;
      case 'combatlab_reset':
        game.spawnCombatLab(true);
        return true;
    }
    return false;
  }

  startGate(game) {
    if (this.action || game.flags.chase_gate_done) return;
    const p = game.player, c = game.chase.credor;
    game.flags.chase_gate_done = true;
    p.frozen = true; p.controllable = false; p.vx = 0;
    p.det.play('gateSlide', { restart: true, blend: 0.04 });
    if (c) {
      c.facing = Math.sign(p.x - c.x) || 1; c.det.setFacing(c.facing);
      c.det.play('run', { restart: true, blend: 0.05 });
    }
    this.action = { type: 'gate', t: 0, changed: false, cut: false, c };
    gfx.letterbox = 0.72;
    audio.doorSlam(1.05);
    audio.setLoopGain('serra', 0.18, 0.12);
  }

  startCoatGrab(game) {
    if (this.action || game.flags.coat_torn || !game.chase.ativo) return;
    const p = game.player;
    const c = game.chase.credor || new Enemy('credor', p.x - 30, game.level.groundY);
    game.chase.levelKey = game.level.key;
    game.chase.credor = c;
    const dir = p.facing || 1;
    c.x = p.x - dir * 22; c.y = game.level.groundY;
    c.facing = dir; c.det.setFacing(dir); c.det.play('coatGrab', { restart: true, blend: 0.02 });
    p.frozen = true; p.controllable = false; p.vx = 0;
    p.det.play('coatStruggle', { restart: true, blend: 0.02 });
    this.action = { type: 'coat', t: 0, progress: 0, c, hit: false };
    gfx.letterbox = 0.7;
    audio.leather(1.3); audio.chainRattle(0.7); gfx.shake(4.2, 0.35);
  }

  startFinal(game) {
    if (this.action && this.action.type === 'final') return;
    const p = game.player;
    let c = game.chase.credor;
    if (!c || game.chase.levelKey !== game.level.key) c = new Enemy('credor', p.x - 112, game.level.groundY);
    c.y = game.level.groundY;
    c.x = Math.min(c.x, p.x - 112);
    c.facing = 1; c.det.setFacing(1); c.det.flipT = 1;
    c.det.play('run', { restart: true, blend: 0.04 });
    game.chase.ativo = false;
    game.director.limpar(); game.director.ligado = false;
    p.frozen = true; p.controllable = false; p.vx = 0;
    p.facing = -1; p.det.setFacing(-1);
    p.det.play('palletGrab', { restart: true, blend: 0.035 });
    game.credorParado = { enemy: c, t: 0, face: c.facing, cinematic: true };
    this.action = {
      type: 'final', t: 0, c, pStart: p.x, palletX: p.x - 38, palletCut: 0,
      spark: false, gateDrop: false, outside: false, rip: false,
      gateLift: false, spoke: false, ending: false,
    };
    gfx.letterbox = 0.85;
    audio.setLoopGain('serra', 0.22, 0.12);
  }

  update(dt, game) {
    const lv = game.level, p = game.player;

    // A porta nao muda de inteira para quebrada num unico quadro. A serra
    // abre um rasgo crescente, cospe faiscas e so entao a chapa cai. O
    // progresso fica nas flags para continuar correto depois de um reload.
    if (!this.action && lv && lv.key === 'ch2_service' && p.x > 455
        && !game.flags.chase_door_broken && !game.flags.chase_door_cut) {
      game.flags.chase_door_cut = 0.01;
      const c = game.chase.credor;
      if (c) { c.det.play('sawBarrier', { restart: true, blend: 0.04 }); c.stun = Math.max(c.stun, 1.38); }
      audio.chainRattle(1.25); audio.metalCreak(1.15); gfx.shake(3.4, 0.32);
    }
    if (lv && lv.key === 'ch2_service' && game.flags.chase_door_cut
        && !game.flags.chase_door_broken) {
      game.flags.chase_door_cut = clamp(game.flags.chase_door_cut + dt / 1.38, 0.01, 1);
      if (game.flags.chase_door_cut >= 1) {
        game.flags.chase_door_broken = true;
        delete game.flags.chase_door_cut;
        audio.doorSlam(1.25); audio.metalCreak(1.25); gfx.shake(5.2, 0.48);
      }
    }

    const rackActive = lv && lv.key === 'ch2_service'
      && game.flags.escape_rack_choice !== 'drop' && p.x > 490 && p.x < 770;
    this.rackHint = clamp(this.rackHint + (rackActive ? dt * 5 : -dt * 7), 0, 1);

    if (!this.action && lv && lv.key === 'ch2_service' && p.x > 1010 && !game.flags.coat_torn) {
      this.startCoatGrab(game);
    }

    this._updateCold(dt, game);

    const a = this.action;
    if (!a) return;
    a.t += dt;
    if (a.type === 'gate') this._updateGate(dt, game, a);
    else if (a.type === 'coat') this._updateCoat(dt, game, a);
    else if (a.type === 'final') this._updateFinal(dt, game, a);
  }

  _updateGate(dt, game, a) {
    const p = game.player, c = a.c;
    if (c && a.t < 0.86) {
      const alvo = p.x - (p.facing || 1) * 42;
      c.x += Math.sign(alvo - c.x) * 188 * dt;
      c.det.speed = 1.55; c.det.update(dt);
    }
    if (a.t >= 0.72 && !a.cut) {
      a.cut = true;
      if (c) c.det.play('sawGate', { restart: true, blend: 0.025 });
      audio.chainRattle(1.2); audio.metalCreak(1.2); gfx.shake(5.5, 0.55);
    }
    if (c && a.t >= 0.86) c.det.update(dt);
    if (a.t >= 1.42 && !a.changed) {
      a.changed = true;
      game.enterLevel('ch2_service', 96, 1);
      p.frozen = true; p.controllable = false; p.det.play('standUp', { restart: true, blend: 0.09 });
      if (c) {
        c.x = game.level.minX - 8; c.y = game.level.groundY; c.facing = 1; c.det.setFacing(1);
        c.det.play('sawGate', { restart: true, blend: 0.02 });
        game.chase.levelKey = game.level.key; game.chase.jogadorLevel = game.level.key;
      }
      audio.startLoop('serra', { gain: 0.16, fade: 0.08 });
      audio.startLoop('static', { gain: 0.035, fade: 0.2 });
    }
    if (a.t >= 3.55) {
      if (c) { c.stun = 1.4; c.det.play('hurt', { restart: true, blend: 0.08 }); }
      p.frozen = false; p.controllable = true; p.state = 'idle'; p.det.play('idle', { blend: 0.1 });
      gfx.letterbox = 0;
      this.action = null;
      game.player.say('b2_gate_second_phase', 0, true);
    }
  }

  _dropRack(game, it) {
    if (game.flags.escape_rack_choice === 'drop') return;
    game.flags.escape_rack_choice = 'drop';
    game.flags.escape_cache_blocked = true;
    it.disabled = true;
    const cache = game.level.interactables.find(i => i.id === 'escape_cache');
    if (cache) cache.disabled = true;
    // A acao e imediata e curta: E derruba. Nao existe uma janela modal no
    // meio da corrida e David nunca perde o controle por causa de um menu.
    game.player.det.play('interact', { restart: true, blend: 0.04 });
    game.player.lockTime = Math.max(game.player.lockTime || 0, 0.28);
    game.chase.atrasar(3.45, 'metal');
    audio.metalCreak(1.35); audio.doorSlam(1.1); gfx.shake(5.4, 0.55);
    game.player.say('b2_sacrifice_drop', 0, true);
    this.rackHint = 0;
  }

  _updateCoat(dt, game, a) {
    const p = game.player, c = a.c;
    c.x = p.x - c.facing * 22; c.det.update(dt);
    a.progress = Math.max(0, a.progress - dt * 0.08);
    if (input.pressed('struggle')) {
      a.progress = Math.min(1, a.progress + 0.16);
      audio.strain(0.8 + a.progress * 0.35); gfx.shake(1.4, 0.1);
    }
    if (a.progress >= 1 || a.t >= 3.8) {
      const venceu = a.progress >= 1;
      game.flags.coat_torn = true;
      p.det.coatTorn = true;
      audio.leather(1.45); audio.metalCreak(0.9); gfx.shake(4.8, 0.38);
      if (!venceu) {
        p.hp = Math.max(1, p.hp - 14);
        p.det.blood = clamp((p.det.blood || 0) + 0.12, 0, 1);
      }
      p.det.play('standUp', { restart: true, blend: 0.08 });
      c.x -= c.facing * 38; c.stun = 2.5; c.det.play('hurt', { restart: true, blend: 0.03 });
      game.chase.grabCooldown = Math.max(game.chase.grabCooldown, 4.2);
      game.player.say(venceu ? 'b2_coat_torn' : 'b2_coat_torn_hurt', 0, true);
      this._release(game);
    }
  }

  _updateCold(dt, game) {
    if (!this.cold || !game.level || game.level.key !== 'ch2_escape_cold') return;
    const f = this.cold;
    f.t += dt;
    // Lampadas falham em grupos curtos. A silhueta do Credor so ganha
    // alpha no claro; no intervalo resta apenas o motor que ainda nao voltou.
    const pulse = Math.max(0, Math.sin(f.t * 8.7) - 0.38) / 0.62;
    this.flash = pulse;
    for (let i = 0; i < game.level.lightDefs.length; i++) {
      const L = game.level.lightDefs[i];
      L.i = 0.035 + pulse * (0.18 + (i % 2) * 0.05);
    }
    const c = game.chase.credor;
    if (c) {
      c.det.silhouette = '#08090b'; c.det.alpha = 0.08 + pulse * 0.92;
      if (f.t >= 2.35 && c.det.anim !== 'sawBarrier') c.det.play('sawBarrier', { restart: true, blend: 0.03 });
      c.det.update(dt);
    }
    if (f.t < 2.35) {
      audio.setLoopGain('serra', 0.001, 0.08);
      audio.setLoopGain('static', 0.002, 0.08);
      return;
    }
    if (!f.burst) {
      f.burst = true;
      audio.startLoop('serra', { gain: 0.2, fade: 0.06 });
      audio.startLoop('static', { gain: 0.08, fade: 0.06 });
      audio.metalCreak(1.35); audio.chainRattle(1.1); gfx.shake(6.2, 0.7);
      game.player.say('b2_false_silence', 0, true);
    }
    f.wall = clamp((f.t - 2.35) / 1.65, 0, 1);
    if (f.t >= 4.0 && game.chase.levelKey === '__parede_da_camara__') {
      game.chase.levelKey = '__corredor_escuro__';
      game.chase.chegada = 0.35;
    }
  }

  _restoreCold(game) {
    if (this._coldBase && game && game.levels) {
      const lv = game.levels[this._coldLevel || 'ch2_escape_cold'];
      if (lv) for (let i = 0; i < lv.lightDefs.length; i++) {
        if (this._coldBase[i] !== undefined) lv.lightDefs[i].i = this._coldBase[i];
      }
    }
    const c = game && game.chase && game.chase.credor;
    if (c && c.det) {
      c.det.silhouette = null;
      c.det.alpha = c.alpha === undefined ? 1 : c.alpha;
    }
    this._coldBase = null;
    this._coldLevel = null;
    this.flash = 0;
  }

  _updateFinal(dt, game, a) {
    const p = game.player, c = a.c;
    c.facing = 1; c.det.setFacing(1);
    if (a.t < 0.58) {
      const alvo = a.palletX - 26;
      c.x = Math.min(alvo, c.x + 154 * dt);
      if (c.det.anim !== 'run') c.det.play('run', { blend: 0.05 });
      if (p.det.anim !== 'palletGrab') p.det.play('palletGrab', { blend: 0.04 });
    } else if (a.t < 2.78) {
      c.x = a.palletX - 26;
      a.palletCut = clamp((a.t - 0.58) / 2.2, 0, 1);
      if (c.det.anim !== 'sawPallet') c.det.play('sawPallet', { restart: true, blend: 0.025 });
      if (p.det.anim !== 'palletBrace') p.det.play('palletBrace', { restart: true, blend: 0.03 });
      if (!a.spark) {
        a.spark = true; audio.chainRattle(1.25); audio.metalCreak(1.1);
        audio.setLoopGain('serra', 0.25, 0.05); gfx.shake(4.8, 0.42);
        p.say('b2_final_pallet', 2.2, true);
      }
    } else if (a.t < 3.68) {
      if (!a.gateDrop) {
        a.gateDrop = true;
        p.facing = 1; p.det.setFacing(1); p.det.play('gateDuck', { restart: true, blend: 0.025 });
        c.det.play('hurt', { restart: true, blend: 0.02 });
        audio.doorSlam(1.55); audio.chainRattle(1.4); audio.metalCreak(1.5);
        gfx.shake(8.4, 0.72); gfx.flash = 0.08;
      }
      const q = clamp((a.t - 2.78) / 0.9, 0, 1);
      p.x = a.pStart + q * 48;
      audio.setLoopGain('serra', 0.065, 0.22);
    } else if (a.t < 5.15) {
      if (!a.outside) {
        a.outside = true;
        game.enterLevel('ch2_yard', 126, 1);
        p.frozen = true; p.controllable = false; p.vx = 0;
        p.facing = 1; p.det.setFacing(1); p.det.play('gateDuck', { restart: true, blend: 0.03 });
        c.x = 68; c.y = game.level.groundY; c.facing = 1; c.det.setFacing(1);
        c.det.rimColor = '#d29a68'; c.det.rimAlpha = 0.52; c.det.rimDX = 1;
        c.det.play('sawPallet', { restart: true, blend: 0.03 });
        if (game.credorParado) game.credorParado.face = 1;
        audio.startLoop('serra', { gain: 0.085, fade: 0.08 });
        audio.startLoop('static', { gain: 0.018, fade: 0.18 });
        p.say('b2_final_outside', 2.2, true);
      }
      const q = clamp((a.t - 3.68) / 1.34, 0, 1);
      p.x = 126 + (1 - Math.pow(1 - q, 2)) * 176;
      if (a.t > 4.34 && p.det.anim !== 'standUp') p.det.play('standUp', { blend: 0.08 });
    } else if (a.t < 6.30) {
      if (c.det.anim !== 'chainRipFree') c.det.play('chainRipFree', { restart: true, blend: 0.02 });
      if (!a.rip) {
        a.rip = true; audio.chainRattle(1.8); audio.pipeBurst(1.1);
        audio.setLoopGain('serra', 0.19, 0.06); gfx.shake(6.2, 0.62); gfx.flash = 0.1;
      }
      p.facing = -1; p.det.setFacing(-1);
      if (p.det.anim !== 'idle') p.det.play('idle', { blend: 0.18 });
    } else if (a.t < 8.05) {
      a.gateLift = true;
      c.x = Math.min(92, c.x + 17 * dt);
      if (c.det.anim !== 'gateLift') c.det.play('gateLift', { restart: true, blend: 0.04 });
      audio.setLoopGain('serra', 0.075, 0.28);
      p.facing = -1; p.det.setFacing(-1);
    } else {
      if (c.det.anim !== 'idle') c.det.play('idle', { blend: 0.2 });
      audio.setLoopGain('serra', 0.055, 0.5);
      if (!a.spoke) {
        a.spoke = true;
        p.say('b2_end_1', 2.6, true); p.say('b2_end_2', 2.6); p.say('b2_end_3', 3.0);
      }
    }
    c.det.update(dt);
    if (game.credorParado) game.credorParado.t = a.t;
    if (a.t >= 11.8 && !a.ending) {
      a.ending = true;
      audio.stopLoop('serra', 1.4); audio.stopLoop('static', 0.8); audio.stopDread(1);
      game.fadeTo(() => game.endOfChapter(), 1.8, 0.01);
    }
  }

  _release(game) {
    const p = game.player;
    p.frozen = false; p.controllable = true; p.state = 'idle'; p.det.play('idle', { blend: 0.12 });
    gfx.letterbox = 0; this.action = null;
  }

  draw(ctx, cam, game, lv) {
    if (!lv) return;
    const sx = x => Math.round(x - cam.ix), gy = Math.round(lv.groundY - cam.iy);
    ctx.save();
    if (lv.key === 'ch2_corridor' && game.flags.chase_gate_done) {
      // O primeiro portao ficou preso na altura do peito.
      ctx.fillStyle = '#59616a';
      for (let y = gy - 106; y < gy - 38; y += 9) ctx.fillRect(sx(982), y, 100, 2);
      ctx.fillStyle = '#171b20'; ctx.fillRect(sx(982), gy - 39, 100, 6);
    }
    if (lv.key === 'ch2_service') {
      const cut = game.flags.chase_door_cut || 0;
      if (cut > 0 && !game.flags.chase_door_broken) {
        const y0 = gy - 66, h = Math.round(58 * cut);
        ctx.fillStyle = '#07080a'; ctx.fillRect(sx(442), y0, 5, h);
        ctx.fillStyle = '#efad58';
        for (let i = 0; i < 7; i++) {
          const yy = y0 + ((i * 11 + Math.round(lv.t * 90)) % Math.max(2, h));
          ctx.fillRect(sx(447 + (i % 3) * 3), yy, 2, 1);
        }
      }
      if (game.flags.chase_door_broken) {
        ctx.fillStyle = '#07090b'; ctx.fillRect(sx(420), gy - 78, 48, 78);
        ctx.fillStyle = '#252a30'; ctx.fillRect(sx(420), gy - 78, 4, 78); ctx.fillRect(sx(464), gy - 78, 4, 78);
        ctx.translate(sx(444), gy); ctx.rotate(-0.42);
        ctx.fillStyle = '#444c54'; ctx.fillRect(-18, -72, 8, 74); ctx.fillRect(6, -66, 7, 66);
        ctx.rotate(0.42); ctx.translate(-sx(444), -gy);
      }
      if (game.flags.escape_rack_choice === 'drop') {
        ctx.translate(sx(648), gy); ctx.rotate(-0.68);
        ctx.fillStyle = '#49515a'; ctx.fillRect(-4, -82, 8, 86);
        for (let y = -75; y < -8; y += 17) ctx.fillRect(-32, y, 66, 5);
      } else {
        const pulse = 0.35 + Math.sin(lv.t * 8) * 0.18;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#c74732'; ctx.fillRect(sx(635), gy - 158, 18, 8);
        ctx.fillStyle = '#e6b069'; ctx.fillRect(sx(641), gy - 151, 6, 34);
        ctx.globalAlpha = 1;
      }
    }
    if (lv.key === 'ch2_escape_cold' && this.cold) {
      const cut = this.cold.wall;
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = '#050608'; ctx.fillRect(sx(30), gy - 80, Math.round(34 * cut), 78);
      ctx.fillStyle = '#9fa7ae';
      for (let i = 0; i < 8 * cut; i++) ctx.fillRect(sx(58 + i * 3), gy - 70 + ((i * 13) % 58), 2, 2);
      const c = game.chase.credor;
      if (c && cut > 0.02) {
        ctx.save();
        ctx.beginPath(); ctx.rect(sx(26), gy - 86, Math.max(8, Math.round(52 * cut)), 86); ctx.clip();
        c.det.draw(ctx, sx(49), gy);
        ctx.restore();
      }
    }
    if (lv.key === 'ch2_chainbay' && this.action && this.action.type === 'final') {
      const a = this.action, x = sx(a.palletX);
      ctx.fillStyle = '#343b42'; ctx.fillRect(x - 31, gy - 7, 64, 7);
      ctx.fillStyle = '#626b72'; ctx.fillRect(x - 25, gy - 13, 4, 10); ctx.fillRect(x + 22, gy - 13, 4, 10);
      ctx.fillStyle = '#5d4028';
      for (let y = gy - 76; y < gy - 13; y += 14) ctx.fillRect(x - 27, y, 54, 8);
      ctx.fillStyle = '#392717'; ctx.fillRect(x - 24, gy - 72, 5, 61); ctx.fillRect(x + 18, gy - 72, 5, 61);
      // A cinta interna e a leitura visual de por que a serra prende.
      ctx.fillStyle = '#899198'; ctx.fillRect(x - 28, gy - 47, 56, 3);
      if (a.palletCut > 0) {
        const cx = x - 28 + Math.round(a.palletCut * 31);
        ctx.fillStyle = '#090909'; ctx.fillRect(x - 29, gy - 60, Math.max(3, cx - x + 29), 14);
        ctx.fillStyle = '#f0b45e';
        for (let i = 0; i < 10; i++) ctx.fillRect(cx + ((i * 7 + Math.round(lv.t * 90)) % 25), gy - 58 + (i % 5) * 4, 2, 1);
        ctx.fillStyle = '#8b5c32';
        for (let i = 0; i < 7; i++) ctx.fillRect(cx + i * 4, gy - 62 + ((i * 9) % 21), 3, 2);
      }
    }
    if (lv.key === 'ch2_yard' && this.action && this.action.type === 'final') {
      // O palete continua presente atras do portao: madeira rasgada, cinta
      // torcida e a serra ainda presa ate o Credor arranca-la.
      const a = this.action, x = sx(104);
      ctx.save(); ctx.translate(x, gy - 9); ctx.rotate(-0.28);
      ctx.fillStyle = '#4f3521';
      for (let y = -62; y < -4; y += 13) ctx.fillRect(-24, y, 51, 7);
      ctx.fillStyle = '#818991'; ctx.fillRect(-26, -38, 55, 3);
      ctx.fillStyle = '#08090a'; ctx.fillRect(-26, -52, 31, 13);
      ctx.restore();
    }
    ctx.restore();
  }

  drawFore(ctx, cam, game, lv) {
    const a = this.action;
    if (!a || a.type !== 'final' || !lv) return;
    const sx = x => Math.round(x - cam.ix), gy = Math.round(lv.groundY - cam.iy);
    let x0, x1, top, lift = 0;
    if (lv.key === 'ch2_chainbay' && a.gateDrop) {
      x0 = sx(936); x1 = sx(1022); top = gy - 105;
      const fall = clamp((a.t - 2.78) / 0.32, 0, 1);
      top += Math.round((1 - fall) * -88);
    } else if (lv.key === 'ch2_yard' && a.outside) {
      x0 = sx(12); x1 = sx(138); top = gy - 128;
      lift = a.gateLift ? clamp((a.t - 6.30) / 1.35, 0, 1) * 31 : 0;
      top -= Math.round(lift);
    } else return;
    ctx.save();
    ctx.fillStyle = '#59636d';
    for (let y = top; y < top + 94; y += 9) ctx.fillRect(x0, y, x1 - x0, 3);
    ctx.fillStyle = '#242b31'; ctx.fillRect(x0, top + 91, x1 - x0, 7);
    if (lv.key === 'ch2_yard' && a.gateLift) {
      ctx.globalAlpha = 0.65; ctx.fillStyle = '#d2a45f';
      for (let i = 0; i < 5; i++) ctx.fillRect(x0 + 20 + i * 17, top + 96 + (i % 2) * 3, 2, 2);
    }
    ctx.restore();
  }

  drawUI(ctx) {
    const a = this.action;
    if (this.rackHint > 0.02 && !a) {
      const w = 194, x = (VW - w) / 2, y = VH - 57;
      ctx.save(); ctx.globalAlpha = this.rackHint * 0.82;
      ctx.fillStyle = '#100708'; ctx.fillRect(x, y, w, 26);
      ctx.fillStyle = '#a63a2e'; ctx.fillRect(x, y, 4, 26); ctx.fillRect(x + w - 4, y, 4, 26);
      ctx.restore();
      text(ctx, `E  ${T('prompt_drop_now')}`, VW / 2, y + 7, {
        size: 9, font: 'ui', weight: 'bold', color: '#f3e7d7', align: 'center', track: 1,
        alpha: this.rackHint, shadow: true,
      });
    }
    if (!a) return;
    if (a.type === 'coat') {
      const w = 174, x = (VW - w) / 2, y = VH - 49;
      ctx.fillStyle = '#080608'; ctx.fillRect(x, y, w, 30);
      ctx.fillStyle = '#302326'; ctx.fillRect(x + 10, y + 20, w - 20, 5);
      ctx.fillStyle = '#a8382c'; ctx.fillRect(x + 10, y + 20, Math.round((w - 20) * a.progress), 5);
      text(ctx, T('coat_qte'), VW / 2, y + 5, { size: 9, font: 'ui', weight: 'bold', color: PAL.uiText, align: 'center', track: 2, shadow: true });
    }
  }
}
