// chase-setpieces.js — escolhas curtas para a fuga e assombracoes discretas.
//
// O mapa nao cresce: as ferramentas vivem na rota que ja existe. Cada uma
// funciona uma vez e compra no maximo alguns segundos. O Credor continua
// sendo a ameaca; o cenario apenas deixa o jogador tomar decisoes.

import { clamp, VW, VH, gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { text } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { Enemy } from './enemies.js';
import { t as T, LINES, line as L } from '../i18n.js';

const DEFS = [
  ['ch2_machines', 'escape_steam', 438, 'chase_steam', 'prompt_valve'],
  ['ch2_machines', 'escape_shortcut', 790, 'chase_shortcut', 'prompt_squeeze'],
  ['ch2_locker', 'escape_gap', 930, 'chase_gap', 'prompt_squeeze'],
  ['ch2_shelves', 'escape_rack', 760, 'chase_rack', 'prompt_drop'],
  ['ch2_corridor', 'escape_cart', 900, 'chase_cart', 'prompt_push'],
  ['ch2_corridor', 'escape_firedoor', 1260, 'chase_firedoor', 'prompt_close'],
  ['ch2_corridor', 'escape_alarm', 1480, 'chase_alarm', 'prompt_alarm'],
  ['ch2_corridor', 'shortcut_return', 790, 'chase_shortcut_return', 'prompt_squeeze'],
  ['ch2_comms', 'watch_phone', 390, 'watch_phone', 'prompt_answer'],
  ['ch2_evidence', 'changing_document', 620, 'changing_document', 'prompt_read'],
  ['ch2_office', 'corpse_echo', 365, 'corpse_echo', 'prompt_look'],
];

function add(levels, levelKey, id, x, action, prompt) {
  const lv = levels[levelKey];
  if (!lv || lv.interactables.some(it => it.id === id)) return null;
  const it = {
    id, x: x - 15, y: lv.groundY - 58, w: 30, h: 58,
    action, prompt, range: 34, prio: 4, disabled: true,
  };
  lv.interactables.push(it);
  return it;
}

export class ChaseSetpieces {
  constructor(levels) {
    this.levels = levels;
    this.items = new Map();
    this.action = null;
    this.lockerVisits = 0;
    this.corpse = new Enemy('semrosto', 365, 214);
    this.corpse.det.play('sitChair', { blend: 0 });
    this.corpse.alpha = 0.58;
    this.install();
  }

  install() {
    for (const d of DEFS) {
      const it = add(this.levels, ...d);
      if (it) this.items.set(it.id, it);
    }

    // A fotografia e o relogio ja existiam. Agora deixam evidencia fisica
    // em vez de repetirem apenas duas linhas de exame.
    const office = this.levels.ch2_office;
    const photo = office && office.interactables.find(it => it.lines === 'c2_photo');
    if (photo) { photo.id = 'case_photo'; photo.action = 'case_photo'; photo.lines = null; photo.prio = 3; }
    const corridor = this.levels.ch2_corridor;
    const clock = corridor && corridor.interactables.find(it => it.lines === 'c2_clock');
    if (clock) { clock.id = 'punch_card'; clock.action = 'punch_card'; clock.lines = null; clock.prio = 3; }
  }

  reset() {
    this.action = null;
    this.lockerVisits = 0;
    this.corpse.det.play('sitChair', { restart: true, blend: 0 });
  }

  enter(game, lv) {
    const chase = !!game.chase.ativo;
    for (const it of this.items.values()) it.disabled = true;

    for (const id of ['escape_steam', 'escape_gap', 'escape_rack', 'escape_cart', 'escape_firedoor', 'escape_alarm']) {
      const it = this.items.get(id);
      if (it && it.action && lv.interactables.includes(it)) it.disabled = !chase || !!game.flags['used_' + id];
    }
    const shortcut = this.items.get('escape_shortcut');
    if (shortcut && lv.interactables.includes(shortcut)) {
      shortcut.disabled = !chase || !game.flags.puzzle_solved || !!game.flags.used_escape_shortcut;
    }
    const back = this.items.get('shortcut_return');
    if (back && lv.interactables.includes(back)) back.disabled = !game.flags.shortcut_broken;

    // Em parte das partidas a porta normal emperra quando a fuga começa.
    // Como o puzzle e obrigatorio para chegar ao mezanino, o atalho sempre
    // existe e a variacao nunca cria um beco sem saida.
    if (lv.key === 'ch2_machines') {
      const normal = lv.interactables.find(it => it.action === 'goto' && it.to === 'ch2_locker');
      if (normal) {
        if (chase && game.flags.chase_route === 'shortcut') {
          normal.precisa = 'chase_normal_open';
          normal.semChave = 'b2_route_blocked';
        } else if (normal.precisa === 'chase_normal_open') {
          delete normal.precisa; delete normal.semChave;
        }
      }
    }

    if (lv.key === 'ch2_comms') {
      const phone = this.items.get('watch_phone');
      const relays = game.flags.relay_hand && game.flags.relay_eye && game.flags.relay_voice;
      phone.disabled = !relays || !!game.flags.phone_watched;
      if (!phone.disabled && !game.flags.phone_rang) {
        game.flags.phone_rang = true;
        audio.phoneRing(0.95);
        game.player.say('b2_phone_ring', 0, true);
      }
    }

    if (lv.key === 'ch2_evidence') {
      const doc = this.items.get('changing_document');
      doc.disabled = !!game.flags.doc_changed || (!!game.flags.doc_seen && !game.flags.puzzle_solved);
    }

    if (lv.key === 'ch2_locker') {
      this.lockerVisits++;
      game.flags.mannequin_stage = Math.min(3, Math.max(game.flags.mannequin_stage || 0, this.lockerVisits));
    }

    if (lv.key === 'ch2_office') {
      const echo = this.items.get('corpse_echo');
      const pode = (game.flags.kills || 0) > 0 && !game.flags.corpse_echo_done;
      echo.disabled = !pode;
      if (pode) {
        this.corpse.x = 365;
        this.corpse.y = lv.groundY;
        this.corpse.det.play('sitChair', { restart: true, blend: 0 });
      }
    }
  }

  _dialogue(game, key) {
    const arr = LINES[key] || [];
    game.dialogue.start(arr.map((_, i) => ({ name: null, text: L(key, i) })));
  }

  interact(game, it) {
    const p = game.player;
    switch (it.action) {
      case 'case_photo':
        if (game.flags.case_photo) return true;
        game.flags.case_photo = true;
        game.journal.addDocument('d_photo_david');
        this._dialogue(game, 'c2_photo');
        return true;

      case 'punch_card':
        if (game.flags.punch_card) return true;
        game.flags.punch_card = true;
        game.journal.addDocument('d_punch_card');
        audio.reloadClick(0.8);
        p.sayAll(['b2_punch_1', 'b2_punch_2'], true);
        return true;

      case 'watch_phone':
        it.disabled = true;
        game.flags.phone_watched = true;
        game.flags.phantom_room = true;
        audio.phoneRing(0.45);
        audio.radioScreams(0.34);
        p.sayAll(['b2_phone_watch_1', 'b2_phone_watch_2', 'b2_phone_watch_3'], true);
        game.sanity.drain(9, true);
        return true;

      case 'changing_document':
        if (!game.flags.doc_seen) {
          game.flags.doc_seen = true;
          game.journal.addDocument('d_shift_before');
          p.say('b2_doc_first', 0, true);
          it.disabled = !game.flags.puzzle_solved;
        } else if (game.flags.puzzle_solved && !game.flags.doc_changed) {
          game.flags.doc_changed = true;
          game.journal.replaceDocument('d_shift_before', 'd_shift_after');
          p.sayAll(['b2_doc_changed_1', 'b2_doc_changed_2'], true);
          game.sanity.drain(7, true);
          it.disabled = true;
        }
        return true;

      case 'corpse_echo':
        game.flags.corpse_echo_done = true;
        it.disabled = true;
        audio.tinnitus(1.1);
        game.sanity.drain(12, true);
        p.say('b2_corpse_echo', 0, true);
        return true;

      case 'chase_steam':
        return this._use(game, it, 2.25, 'steam', 'b2_escape_steam');
      case 'chase_rack':
        return this._use(game, it, 2.55, 'metal', 'b2_escape_rack');
      case 'chase_cart':
        return this._use(game, it, 2.35, 'metal', 'b2_escape_cart');
      case 'chase_alarm':
        game.flags['used_' + it.id] = true; it.disabled = true;
        game.chase.desviar(3.1); audio.phoneRing(1.2);
        p.say('b2_escape_alarm', 0, true);
        return true;
      case 'chase_gap': {
        game.flags['used_' + it.id] = true; it.disabled = true;
        const dir = p.facing || 1;
        this.action = { type: 'gap', t: 0, from: p.x, to: clamp(p.x + dir * 96, game.level.minX, game.level.maxX) };
        p.frozen = true; p.controllable = false; p.det.play('interact', { restart: true, blend: 0.05 });
        game.chase.atrasar(1.05, 'metal');
        return true;
      }
      case 'chase_firedoor':
        this.action = { type: 'door', t: 0, presses: 0, need: 3, it };
        p.frozen = true; p.controllable = false; p.vx = 0;
        game.chase.atrasar(0.65, 'metal');
        return true;
      case 'chase_shortcut':
        game.flags.used_escape_shortcut = true;
        game.flags.shortcut_broken = true;
        it.disabled = true;
        audio.metalCreak(1.2); gfx.shake(3.4, 0.35);
        game.chase.atrasar(0.8, 'metal');
        game.fadeTo(() => game.enterLevel('ch2_corridor', 790, 1), 0.14, 0.22);
        return true;
      case 'chase_shortcut_return':
        game.fadeTo(() => game.enterLevel('ch2_machines', 790, -1), 0.18, 0.26);
        return true;
    }
    return false;
  }

  _use(game, it, delay, kind, bark) {
    game.flags['used_' + it.id] = true;
    it.disabled = true;
    game.chase.atrasar(delay, kind);
    game.player.say(bark, 0, true);
    gfx.shake(kind === 'steam' ? 2.4 : 3.2, 0.32);
    return true;
  }

  update(dt, game) {
    this.corpse.det.update(dt);
    const a = this.action;
    if (!a) return;
    const p = game.player;
    a.t += dt;
    if (a.type === 'gap') {
      const k = clamp(a.t / 0.58, 0, 1);
      p.x = a.from + (a.to - a.from) * (1 - Math.pow(1 - k, 3));
      if (k >= 1) this._releasePlayer(game);
      return;
    }
    if (a.type === 'door') {
      if (input.pressed('interact')) {
        a.presses++;
        audio.reloadClick(0.55 + a.presses * 0.14);
        gfx.shake(1.1, 0.12);
      }
      if (a.presses >= a.need) {
        game.flags['used_' + a.it.id] = true;
        a.it.disabled = true;
        game.chase.atrasar(2.75, 'metal');
        audio.doorSlam(1.05);
        this._releasePlayer(game);
      } else if (a.t > 2.8 || input.pressed('cancel')) {
        this._releasePlayer(game);
      }
    }
  }

  _releasePlayer(game) {
    game.player.frozen = false;
    game.player.controllable = true;
    game.player.state = 'idle';
    game.player.det.play('idle', { blend: 0.12 });
    this.action = null;
  }

  draw(ctx, cam, game, lv) {
    const f = game.flags;
    const sx = x => Math.round(x - cam.ix);
    const gy = Math.round(lv.groundY - cam.iy);
    ctx.save();

    if (lv.key === 'ch2_machines') {
      // valvula e jato usado
      ctx.strokeStyle = '#756750'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx(438), gy - 54, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#8b2c22'; ctx.fillRect(sx(435), gy - 57, 7, 7);
      // alcapao do atalho: inteiro antes, rasgado para sempre depois.
      ctx.fillStyle = f.shortcut_broken ? '#050608' : '#30363d'; ctx.fillRect(sx(774), gy - 66, 34, 66);
      ctx.fillStyle = '#59616b'; ctx.fillRect(sx(776), gy - 64, f.shortcut_broken ? 8 : 30, 3);
      if (f.shortcut_broken) { ctx.fillStyle = '#24282e'; ctx.fillRect(sx(769), gy - 8, 14, 4); ctx.fillRect(sx(801), gy - 18, 10, 5); }
    } else if (lv.key === 'ch2_locker') {
      ctx.fillStyle = '#090b0e'; ctx.fillRect(sx(916), gy - 74, 27, 74);
      ctx.fillStyle = '#525963'; ctx.fillRect(sx(916), gy - 74, 3, 74); ctx.fillRect(sx(940), gy - 74, 3, 74);
      this._drawMannequin(ctx, sx([330, 545, 780, 1080][f.mannequin_stage || 0] || 330), gy, f.mannequin_stage || 0);
    } else if (lv.key === 'ch2_shelves') {
      const used = f.used_escape_rack;
      ctx.fillStyle = '#3b424a';
      if (used) { ctx.save(); ctx.translate(sx(760), gy); ctx.rotate(-0.58); ctx.fillRect(-3, -72, 6, 76); ctx.restore(); }
      else { ctx.fillRect(sx(757), gy - 72, 6, 72); ctx.fillRect(sx(742), gy - 65, 36, 4); }
    } else if (lv.key === 'ch2_corridor') {
      ctx.fillStyle = '#4a3524'; ctx.fillRect(sx(880), gy - 20, 42, 18);
      ctx.fillStyle = '#222830'; ctx.fillRect(sx(1248), gy - 74, 24, 74);
      ctx.fillStyle = f.used_escape_firedoor ? '#15191e' : '#4f5964'; ctx.fillRect(sx(1253), gy - 48, 14, 4);
      ctx.fillStyle = '#76271e'; ctx.fillRect(sx(1475), gy - 58, 12, 15);
      if (f.shortcut_broken) { ctx.fillStyle = '#050608'; ctx.fillRect(sx(774), gy - 62, 34, 62); }
    } else if (lv.key === 'ch2_comms' && !f.phone_watched) {
      ctx.fillStyle = '#17191d'; ctx.fillRect(sx(384), gy - 50, 15, 25);
      ctx.fillStyle = '#555b63'; ctx.fillRect(sx(386), gy - 47, 11, 5);
    } else if (lv.key === 'ch2_evidence' && !f.doc_changed) {
      ctx.fillStyle = '#c6b997'; ctx.fillRect(sx(612), gy - 28, 18, 12);
      ctx.fillStyle = '#625746'; for (let i = 0; i < 3; i++) ctx.fillRect(sx(615), gy - 25 + i * 3, 12, 1);
    }
    ctx.restore();

    if (lv.key === 'ch2_office' && (f.kills || 0) > 0 && !f.corpse_echo_done) {
      this.corpse.draw(ctx, cam);
    }
  }

  _drawMannequin(ctx, x, gy, stage) {
    if (!stage) return;
    ctx.save(); ctx.globalAlpha = 0.72;
    ctx.fillStyle = '#80796e'; ctx.fillRect(x - 5, gy - 58, 10, 13);
    ctx.fillStyle = '#676158'; ctx.fillRect(x - 8, gy - 45, 16, 29);
    ctx.fillRect(x - 7, gy - 16, 5, 16); ctx.fillRect(x + 2, gy - 16, 5, 16);
    if (stage >= 3) { ctx.fillStyle = '#5d1714'; ctx.fillRect(x - 3, gy - 53, 2, 1); ctx.fillRect(x + 2, gy - 53, 2, 1); }
    ctx.restore();
  }

  drawUI(ctx) {
    const a = this.action;
    if (!a || a.type !== 'door') return;
    const k = clamp(a.presses / a.need, 0, 1);
    const w = 170, x = (VW - w) / 2, y = VH - 54;
    ctx.save(); ctx.globalAlpha = 0.86; ctx.fillStyle = '#070609'; ctx.fillRect(x, y, w, 30);
    ctx.fillStyle = '#2e2928'; ctx.fillRect(x + 9, y + 19, w - 18, 4);
    ctx.fillStyle = PAL.uiAccent; ctx.fillRect(x + 9, y + 19, Math.round((w - 18) * k), 4); ctx.restore();
    text(ctx, T('hint_crank_door'), VW / 2, y + 6, { size: 8, font: 'ui', weight: 'bold', color: PAL.uiText, align: 'center', track: 1 });
  }
}
