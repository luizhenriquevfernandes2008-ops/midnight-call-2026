// combat-finishers.js — defesa contextual contra um inimigo em Frenzy.
//
// Nao e um botao de execucao livre. A oportunidade so existe quando um
// inimigo muito ferido perde o controle, corre e agarra David. Vencer o QTE
// usa o ambiente; falhar ainda encerra a ameaca, mas David paga com o corpo.

import { VW, VH, clamp, gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { text } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { t as T } from '../i18n.js';

export class CombatFinishers {
  constructor() { this.action = null; }

  reset() { this.action = null; }

  start(game, enemy) {
    if (this.action || !enemy || enemy.state !== 'frenzy') return false;
    const p = game.player;
    let kind = 'wall';
    const mat = game.level.materialAt ? game.level.materialAt(p.x) : game.level.material;
    if (game.level.key.includes('cold') || mat === 'ice') kind = 'pipe';
    else if (game.level.key.includes('shelves') || game.level.key === 'ch2_service') kind = 'rack';
    else if (game.level.key.includes('machines')) kind = 'valve';

    this.action = {
      phase: 'qte', t: 0, progress: 0, enemy, kind,
      limit: 3.25 / (game.diff.qte || 1), blood: false, failed: false,
    };
    game.journal.open = false; game.inv.open = false; game.mapaAberto = false;
    p.frozen = true; p.controllable = false; p.vx = 0;
    enemy.state = 'finisher'; enemy.vivo = true; enemy.stun = 0;
    const dir = Math.sign(p.x - enemy.x) || enemy.facing || 1;
    enemy.facing = dir; enemy.det.setFacing(dir); enemy.x = p.x - dir * 18;
    p.facing = -dir; p.det.setFacing(-dir);
    enemy.det.play('frenzyGrab', { restart: true, blend: 0.02 });
    p.det.play('finisherStruggle', { restart: true, blend: 0.02 });
    audio.punchHit(1.15); audio.strain(0.95); gfx.shake(4.6, 0.42); gfx.letterbox = 0.72;
    return true;
  }

  update(dt, game) {
    const a = this.action;
    if (!a) return;
    const p = game.player, e = a.enemy;
    a.t += dt;
    e.x = p.x - e.facing * 18;
    e.det.update(dt);

    if (a.phase === 'qte') {
      a.progress = Math.max(0, a.progress - dt * 0.075 * (game.diff.qte || 1));
      if (input.pressed('struggle')) {
        a.progress = Math.min(1, a.progress + 0.155);
        audio.strain(0.8 + a.progress * 0.4); gfx.shake(1.4, 0.1);
      }
      if (a.progress >= 1) this._resolve(game, false);
      else if (a.t >= a.limit) this._resolve(game, true);
      return;
    }

    if (a.phase === 'kill') {
      if (a.t > 0.34 && !a.blood) {
        a.blood = true;
        game.sangrarAlvo(e.x, e.y - (a.kind === 'pipe' ? 44 : 30), p.facing, a.failed ? 34 : 52, true);
        game.registrarSangue(e.x, e.y, 15);
        game.sujarDavid(e.x, 1.15);
        audio.punchHit(1.25); audio.thud(1.05); gfx.shake(5.8, 0.48);
      }
      if (a.t >= 1.18) {
        e.finalizar();
        game.director.respirar(12 + Math.random() * 7);
        p.frozen = false; p.controllable = true; p.state = 'idle'; p.det.play(p.hp < 35 ? 'woundedIdle' : 'idle', { blend: 0.16 });
        p.invuln = 1.3; gfx.letterbox = 0;
        this.action = null;
      }
    }
  }

  _resolve(game, failed) {
    const a = this.action, p = game.player, e = a.enemy;
    a.phase = 'kill'; a.t = 0; a.failed = failed;
    if (failed) {
      const dano = Math.round(16 * (game.diff.enemyDamage || 1));
      p.hp = Math.max(1, p.hp - dano);
      p.det.blood = clamp((p.det.blood || 0) + 0.14, 0, 1);
      game.sanity.drain(7, true);
      p.det.play('finisherFail', { restart: true, blend: 0.02 });
    } else {
      p.det.play('finisher' + cap(a.kind), { restart: true, blend: 0.02 });
    }
    e.det.play('finisherVictim' + cap(a.kind), { restart: true, blend: 0.02 });
    const impact = a.kind === 'pipe' ? 'metalCreak' : a.kind === 'valve' ? 'pipeBurst' : 'doorSlam';
    if (audio[impact]) audio[impact](1.15);
  }

  // O objeto usado na defesa participa da animacao. Isso faz a finalizacao
  // pertencer ao lugar: parede, estante, gancho ou valvula deixam de ser
  // apenas um nome escrito sobre o QTE.
  draw(ctx, cam, game, lv) {
    const a = this.action;
    if (!a || !lv) return;
    const p = game.player;
    const x = Math.round(p.x - cam.ix), y = Math.round(lv.groundY - cam.iy);
    const hit = a.phase === 'kill' ? clamp(a.t / 0.34, 0, 1) : 0;
    ctx.save();
    if (a.kind === 'wall') {
      const wx = x + p.facing * 25;
      ctx.fillStyle = '#38393d'; ctx.fillRect(wx - 3, y - 76, 7, 76);
      if (hit > 0.55) {
        ctx.fillStyle = '#741914'; ctx.fillRect(wx - 2, y - 42, 4, 9); ctx.fillRect(wx - p.facing * 5, y - 35, 2, 6);
      }
    } else if (a.kind === 'rack') {
      ctx.translate(x + p.facing * 31, y); ctx.rotate(p.facing * -0.52 * hit);
      ctx.fillStyle = '#59616a'; ctx.fillRect(-4, -78, 8, 78);
      for (let yy = -70; yy < -8; yy += 17) ctx.fillRect(-28, yy, 56, 5);
    } else if (a.kind === 'pipe') {
      ctx.strokeStyle = '#818991'; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(x + p.facing * 30, 0); ctx.lineTo(x + p.facing * (20 - hit * 8), y - 34); ctx.stroke();
      if (hit > 0.35) {
        ctx.fillStyle = '#8da5b9';
        for (let i = 0; i < 9; i++) ctx.fillRect(x + p.facing * (18 + i * 3), y - 44 + (i % 3) * 5, 2, 2);
      }
    } else if (a.kind === 'valve') {
      const vx = x + p.facing * 28, vy = y - 35;
      ctx.strokeStyle = '#9a4b3d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(vx, vy, 13, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#4f555b'; ctx.fillRect(vx - 2, vy - 17, 4, 34); ctx.fillRect(vx - 17, vy - 2, 34, 4);
      if (hit > 0.25) {
        ctx.globalAlpha = 0.62; ctx.fillStyle = '#d9dde0';
        const steamX = p.facing > 0 ? vx - 48 : vx + 6;
        ctx.fillRect(steamX, vy - 7, 42, 11);
      }
    }
    ctx.restore();
  }

  drawUI(ctx) {
    const a = this.action;
    if (!a || a.phase !== 'qte') return;
    const w = 190, x = (VW - w) / 2, y = VH - 50;
    ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = '#070507'; ctx.fillRect(x, y, w, 33);
    ctx.fillStyle = '#332528'; ctx.fillRect(x + 10, y + 22, w - 20, 5);
    ctx.fillStyle = '#b23b30'; ctx.fillRect(x + 10, y + 22, Math.round((w - 20) * a.progress), 5); ctx.restore();
    text(ctx, T('finisher_qte'), VW / 2, y + 6, {
      size: 9, font: 'ui', weight: 'bold', color: PAL.uiText, align: 'center', track: 2, shadow: true,
    });
    text(ctx, T('finisher_' + a.kind), VW / 2, y - 13, {
      size: 7, font: 'ui', color: '#c3a06f', align: 'center', track: 1, shadow: true,
    });
  }
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
