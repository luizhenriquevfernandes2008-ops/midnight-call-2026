// difficulty.js — uma dificuldade unica para o jogo inteiro.
//
// Ela muda comportamento, quantidade e margem de erro. Nao existe uma
// dificuldade separada para puzzle ou "terror psicologico": o capitulo tem
// uma direcao so, e o jogador escolhe apenas quanta pressao quer suportar.

export const DIFFICULTIES = {
  story: {
    id: 'story', name: 'diff_story', desc: 'diff_story_desc',
    enemySpeed: 0.78, enemyDamage: 0.65, enemyHp: 0.78,
    spawnRate: 0.66, maxEnemies: -1, frenzyChance: 0.14,
    chaseSpeed: 0.86, chaseDamage: 0.72, qte: 0.82,
  },
  normal: {
    id: 'normal', name: 'diff_normal', desc: 'diff_normal_desc',
    enemySpeed: 1.00, enemyDamage: 0.95, enemyHp: 1.00,
    spawnRate: 1.00, maxEnemies: 0, frenzyChance: 0.32,
    chaseSpeed: 0.99, chaseDamage: 0.96, qte: 0.96,
  },
  hard: {
    id: 'hard', name: 'diff_hard', desc: 'diff_hard_desc', recommended: true,
    enemySpeed: 1.12, enemyDamage: 1.12, enemyHp: 1.10,
    spawnRate: 1.16, maxEnemies: 1, frenzyChance: 0.44,
    chaseSpeed: 1.06, chaseDamage: 1.10, qte: 1.06,
  },
  mind: {
    id: 'mind', name: 'diff_mind', desc: 'diff_mind_desc',
    enemySpeed: 1.25, enemyDamage: 1.34, enemyHp: 1.26,
    spawnRate: 1.42, maxEnemies: 2, frenzyChance: 0.62,
    chaseSpeed: 1.15, chaseDamage: 1.28, qte: 1.18,
  },
};

export const DIFFICULTY_ORDER = ['story', 'normal', 'hard', 'mind'];

export function difficulty(id) {
  return DIFFICULTIES[id] || DIFFICULTIES.hard;
}

export function cycleDifficulty(id, dir) {
  const i = Math.max(0, DIFFICULTY_ORDER.indexOf(id));
  return DIFFICULTY_ORDER[(i + dir + DIFFICULTY_ORDER.length) % DIFFICULTY_ORDER.length];
}
