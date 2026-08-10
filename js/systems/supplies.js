// supplies.js — suprimentos variáveis do galpão.
//
// Os pontos existem desde a montagem do mapa, mas o conteúdo só é sorteado
// quando começa um jogo novo. O sorteio fica nas flags e, portanto, faz parte
// do save: recarregar não muda uma caixa de lugar nem ressuscita o que já foi
// consumido.

const SPOTS = [
  ['ch2_corridor', 360], ['ch2_corridor', 590], ['ch2_corridor', 1125], ['ch2_corridor', 1305], ['ch2_corridor', 1510],
  ['ch2_shelves', 250], ['ch2_shelves', 570], ['ch2_shelves', 820], ['ch2_shelves', 1010], ['ch2_shelves', 1260],
  ['ch2_locker', 345], ['ch2_locker', 455], ['ch2_locker', 805], ['ch2_locker', 940],
  ['ch2_arquivo', 210], ['ch2_arquivo', 520],
  ['ch2_evidence', 250], ['ch2_evidence', 560],
  ['ch2_comms', 240], ['ch2_comms', 535],
  ['ch2_infirmary', 205], ['ch2_infirmary', 500],
  ['ch2_cold', 285], ['ch2_cold', 610],
  ['ch2_machines', 300], ['ch2_machines', 690],
];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function amount(min, max) { return min + ((Math.random() * (max - min + 1)) | 0); }

export class Supplies {
  constructor(levels) {
    this.levels = levels;
    this.spots = [];
    this.data = null;
  }

  install() {
    // A ripa e a caixa fixas da primeira versão deixam de existir. Uma ripa
    // continua garantida no corredor e uma caixa antes da pistola, só que a
    // posição e a quantidade agora mudam a cada jogo novo.
    for (const [levelKey, id] of [['ch2_corridor', 'porrete'], ['ch2_shelves', 'municao']]) {
      const lv = this.levels[levelKey];
      if (!lv) continue;
      const old = lv.interactables.find(i => i.id === id);
      if (old) old.disabled = true;
      for (const d of (lv.itemDefs || [])) if (d.id === id) d.disabled = true;
    }

    SPOTS.forEach(([levelKey, x], n) => {
      const lv = this.levels[levelKey];
      if (!lv) return;
      const it = {
        id: `supply_${n}`, x: x - 9, y: lv.groundY - 28, w: 18, h: 28,
        prompt: 'prompt_take', action: 'take_supply', range: 27,
        disabled: true, supply: null, prio: 1,
      };
      lv.interactables.push(it);
      this.spots.push({ id: it.id, levelKey, x, y: lv.groundY, it });
    });

    for (const lv of Object.values(this.levels)) {
      const mine = this.spots.filter(s => s.levelKey === lv.key);
      if (!mine.length) continue;
      const before = lv.drawProps;
      lv.drawProps = (ctx, cam) => {
        if (before) before(ctx, cam);
        for (const p of (lv.randomPallets || [])) this._drawPallet(ctx, Math.round(p - cam.ix), lv.groundY - cam.iy);
        for (const s of mine) {
          if (s.it.disabled || !s.it.supply || (lv.pego && lv.pego[s.id])) continue;
          this._drawSupply(ctx, Math.round(s.x - cam.ix), Math.round(s.y - cam.iy), s.it.supply);
        }
      };
    }
  }

  newRun() {
    const free = shuffle(this.spots.slice());
    const records = [];
    const takeSpot = (type, n, min = 1, max = 1) => {
      for (let i = 0; i < n && free.length; i++) {
        const s = free.pop();
        records.push({ id: s.id, type, amount: amount(min, max) });
      }
    };

    // Garantias de ritmo: arma improvisada no corredor e munição antes da
    // sala de máquinas. O ponto exato ainda muda.
    const corridor = shuffle(this.spots.filter(s => s.levelKey === 'ch2_corridor'))[0];
    const earlyAmmo = shuffle(this.spots.filter(s => ['ch2_shelves', 'ch2_locker'].includes(s.levelKey)))[0];
    if (corridor) {
      records.push({ id: corridor.id, type: 'club', amount: 1 });
      const i = free.indexOf(corridor); if (i >= 0) free.splice(i, 1);
    }
    if (earlyAmmo) {
      records.push({ id: earlyAmmo.id, type: 'ammo', amount: amount(4, 9) });
      const i = free.indexOf(earlyAmmo); if (i >= 0) free.splice(i, 1);
    }

    takeSpot('ammo', amount(3, 5), 3, 10);
    takeSpot('medkit', amount(2, 4));
    takeSpot('sedative', amount(2, 4));
    takeSpot('club', amount(1, 2));

    const palletPool = shuffle(this.spots.slice());
    const pallets = palletPool.slice(0, amount(8, 13)).map(s => ({ levelKey: s.levelKey, x: s.x + amount(-24, 24) }));
    const data = { records, pallets };
    this.apply(data);
    return data;
  }

  apply(data) {
    this.data = data || { records: [], pallets: [] };
    for (const s of this.spots) { s.it.disabled = true; s.it.supply = null; }
    for (const lv of Object.values(this.levels)) lv.randomPallets = [];

    for (const p of (this.data.pallets || [])) {
      const lv = this.levels[p.levelKey];
      if (lv) lv.randomPallets.push(p.x);
    }
    for (const r of (this.data.records || [])) {
      const s = this.spots.find(p => p.id === r.id);
      if (!s) continue;
      s.it.supply = { type: r.type, amount: r.amount || 1 };
      const lv = this.levels[s.levelKey];
      s.it.disabled = !!(lv && lv.pego && lv.pego[s.id]);
    }
  }

  _drawPallet(ctx, x, y) {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 0 ? '#68482c' : '#4b3321';
      ctx.fillRect(x, Math.round(y - 5 - i * 7), 34, 5);
      ctx.fillStyle = '#83603c'; ctx.fillRect(x + 2, Math.round(y - 5 - i * 7), 30, 1);
    }
    ctx.fillStyle = '#25170f'; ctx.fillRect(x + 4, y - 4, 5, 4); ctx.fillRect(x + 25, y - 4, 5, 4);
    ctx.restore();
  }

  _drawSupply(ctx, x, y, s) {
    ctx.save();
    if (s.type === 'ammo') {
      ctx.fillStyle = '#4e3b22'; ctx.fillRect(x - 7, y - 10, 14, 8);
      ctx.fillStyle = '#b2914e'; ctx.fillRect(x - 6, y - 9, 12, 2);
      ctx.fillStyle = '#d1b46d'; for (let i = 0; i < Math.min(5, s.amount); i++) ctx.fillRect(x - 5 + i * 2, y - 6, 1, 3);
    } else if (s.type === 'medkit') {
      ctx.fillStyle = '#b9b5a7'; ctx.fillRect(x - 7, y - 12, 14, 10);
      ctx.fillStyle = '#7d201b'; ctx.fillRect(x - 1, y - 10, 3, 6); ctx.fillRect(x - 3, y - 8, 7, 2);
      ctx.fillStyle = '#514d45'; ctx.fillRect(x - 3, y - 14, 6, 2);
    } else if (s.type === 'sedative') {
      ctx.fillStyle = '#6f93a8'; ctx.fillRect(x - 3, y - 12, 7, 10);
      ctx.fillStyle = '#d9d4c5'; ctx.fillRect(x - 4, y - 10, 9, 4);
      ctx.fillStyle = '#2b3339'; ctx.fillRect(x - 2, y - 14, 5, 2);
    } else {
      ctx.fillStyle = '#7b5734'; ctx.fillRect(x - 2, y - 34, 5, 32);
      ctx.fillStyle = '#a87948'; ctx.fillRect(x - 1, y - 34, 1, 32);
      ctx.fillStyle = '#9ba0a5'; ctx.fillRect(x + 1, y - 36, 1, 4);
    }
    ctx.restore();
  }
}

// Conteúdo fixo que usa a mesma camada dinâmica: documentos secretos, o
// cofre do zelador, o bilhete que cai do corpo e a recompensa do mezanino.
export function installChapterExtras(levels) {
  const defs = [
    ['ch2_arquivo', 'doc_turno', 330, 'take_document', { doc: 'd_turno' }],
    ['ch2_evidence', 'doc_caso', 550, 'take_document', { doc: 'd_caso' }],
    ['ch2_comms', 'doc_voz', 540, 'take_document', { doc: 'd_voz' }],
    ['ch2_office', 'safe_code_note', 508, 'take_safe_code', { disabled: true }],
    ['ch2_office', 'safe', 418, 'safe', { permanent: true }],
    ['ch2_mezz', 'mezz_reward', 330, 'take_mezz_reward', { disabled: true }],
    ['ch2_mezz', 'operator_drop', 638, 'take_operator_drop', { disabled: true }],
  ];

  for (const [levelKey, id, x, action, opt] of defs) {
    const lv = levels[levelKey]; if (!lv) continue;
    const it = {
      id, x: x - 12, y: lv.groundY - 34, w: 24, h: 34,
      prompt: action === 'safe' ? 'prompt_open' : 'prompt_take',
      action, range: 28, prio: 2, disabled: !!opt.disabled,
      doc: opt.doc, permanent: !!opt.permanent,
    };
    lv.interactables.push(it);
    const before = lv.drawProps;
    lv.drawProps = (ctx, cam) => {
      if (before) before(ctx, cam);
      if (action !== 'safe' && (it.disabled || (lv.pego && lv.pego[id]))) return;
      const sx = Math.round(x - cam.ix), sy = Math.round(lv.groundY - cam.iy);
      if (action === 'safe') {
        ctx.fillStyle = '#252b31'; ctx.fillRect(sx - 16, sy - 42, 32, 42);
        ctx.fillStyle = '#46515d'; ctx.fillRect(sx - 14, sy - 40, 28, 3);
        ctx.fillStyle = it.opened ? '#080a0d' : '#353e47'; ctx.fillRect(sx - 10, sy - 33, 20, 25);
        ctx.fillStyle = '#9b8146'; ctx.fillRect(sx + 5, sy - 23, 3, 3);
      } else if (action === 'take_mezz_reward') {
        ctx.fillStyle = '#30271d'; ctx.fillRect(sx - 14, sy - 18, 28, 16);
        ctx.fillStyle = '#8f7747'; ctx.fillRect(sx - 12, sy - 16, 24, 3);
        ctx.fillStyle = '#6e1f1c'; ctx.fillRect(sx - 2, sy - 13, 4, 7);
      } else if (action === 'take_operator_drop') {
        // Ficha perfurada presa a um pequeno molho de cartuchos.
        ctx.fillStyle = '#c7b98f'; ctx.fillRect(sx - 9, sy - 12, 18, 9);
        ctx.fillStyle = '#2d2520';
        for (let px = -6; px <= 6; px += 4) ctx.fillRect(sx + px, sy - 9, 1, 1);
        ctx.fillStyle = '#b18a45';
        for (let px = -5; px <= 5; px += 5) ctx.fillRect(sx + px, sy - 16, 2, 6);
      } else {
        ctx.fillStyle = '#c2b99e'; ctx.fillRect(sx - 7, sy - 12, 14, 9);
        ctx.fillStyle = '#6e6251'; for (let i = 0; i < 3; i++) ctx.fillRect(sx - 5, sy - 10 + i * 3, 10, 1);
        if (id === 'safe_code_note') { ctx.fillStyle = '#6f1d19'; ctx.fillRect(sx + 4, sy - 5, 2, 2); }
      }
    };
  }

  const locker = levels.ch2_locker;
  if (locker) {
    const radio = locker.interactables.find(i => i.lines === 'c2_radio');
    if (radio) { radio.id = 'radio'; radio.action = 'radio'; radio.lines = null; }
  }
}
