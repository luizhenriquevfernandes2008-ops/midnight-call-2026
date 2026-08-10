// Entrada do Credor. David ja caminhou para dentro da sala quando a coisa
// explode do escuro, corre, chuta e o derruba. A perseguicao so devolve o
// controle depois de ele cair e se levantar de verdade.

import { Enemy } from './enemies.js';
import { audio } from '../core/audio.js';
import { gfx, clamp } from '../core/gfx.js';

export class ChaseIntro {
  constructor(player, level) {
    this.player = player;
    this.level = level;
    this.t = 0;
    this.afterHit = 0;
    this.finished = false;
    this.onEnd = null;
    this.hit = false;
    this.falling = false;
    this.rising = false;

    // A entrada do mezanino fica a direita: ele vem de tras, nunca nasce
    // adiante da rota de fuga.
    this.credor = new Enemy('credor', level.maxX + 42, level.groundY);
    this.credor.facing = -1;
    this.credor.det.setFacing(-1);
    this.credor.det.flipT = 1;
    this.credor.det.play('run', { blend: 0 });
    this.credor.det.speed = 1.72;

    this.startX = player.x;
    player.vx = 0;
    player.frozen = true;
    player.controllable = false;
    audio.doorSlam(0.72);
    audio.startLoop('serra', { gain: 0.09, fade: 0.18 });
  }

  update(dt) {
    this.t += dt;
    const p = this.player, c = this.credor;

    if (!this.hit) {
      // Um quadro curto de silhueta no limite da sala, seguido de uma
      // corrida brutal. O alvo fica atras de David para o chute empurra-lo
      // na direcao da porta de fuga.
      const alvo = p.x + 27;
      const dist = Math.abs(alvo - c.x);
      const v = dist > 150 ? 255 : 205;
      c.x += Math.sign(alvo - c.x) * v * dt;
      c.det.speed = clamp(v / 118, 1.35, 2.1);
      if (c.det.anim !== 'run') c.det.play('run', { blend: 0.06 });
      c.det.update(dt);
      audio.setLoopGain('serra', clamp(0.08 + (1 - dist / 360) * 0.09, 0.08, 0.17), 0.08);

      if (dist <= 30) {
        this.hit = true;
        this.afterHit = 0;
        this.kickFrom = p.x;
        this.kickTo = clamp(p.x - 82, this.level.minX + 12, this.level.maxX - 12);
        c.det.play('kick', { restart: true, blend: 0.025 });
        p.det.play('hurt', { restart: true, blend: 0.02 });
        audio.punchHit(1.35);
        audio.thud(1.15);
        gfx.shake(6.2, 0.55);
        gfx.flash = 0.09;
      }
      return;
    }

    this.afterHit += dt;
    const a = this.afterHit;

    // O corpo e arremessado, bate no chao e permanece caido tempo suficiente
    // para o jogador ler a acao. Nao e apenas um slide com a pose de dano.
    if (a < 0.52) {
      const k = clamp(a / 0.52, 0, 1);
      p.x = this.kickFrom + (this.kickTo - this.kickFrom) * (1 - Math.pow(1 - k, 3));
    }
    if (a >= 0.16 && !this.falling) {
      this.falling = true;
      p.det.play('collapse', { restart: true, blend: 0.035 });
    }

    // Enquanto David esta no chao e se levanta, o Credor saboreia a
    // vantagem: anda devagar. Quando o controle volta, ele arranca correndo.
    if (a >= 0.42 && a < 2.65) {
      const dir = Math.sign((p.x + 45) - c.x) || -1;
      c.facing = dir; c.det.setFacing(dir);
      c.x += dir * 24 * dt;
      c.det.speed = 0.9;
      if (c.det.anim !== 'dragWalk') c.det.play('dragWalk', { blend: 0.16 });
    }
    if (a >= 1.58 && !this.rising) {
      this.rising = true;
      p.det.play('standUp', { restart: true, blend: 0.12 });
    }
    c.det.update(dt);

    if (a >= 2.65) {
      c.det.play('run', { restart: true, blend: 0.08 });
      c.det.speed = 1.35;
      this.finished = true;
      p.frozen = false;
      p.controllable = true;
      p.state = 'idle';
      p.det.play('idle', { blend: 0.1 });
      if (this.onEnd) this.onEnd(c);
    }
  }

  draw(ctx, cam) { this.credor.draw(ctx, cam); }
  drawUI() {}
  addLights() {}
}
