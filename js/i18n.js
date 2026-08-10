// i18n.js — TODO texto visivel do jogo mora aqui. Nenhuma string solta
// nos outros arquivos. Trocar de idioma no menu e so trocar `lang`.
//
// A narracao de abertura tem tempos em segundos. Se o audio do narrador
// existir em assets/audio/, as legendas seguem o audio; se nao existir,
// seguem estes tempos. Ajuste `t` e `d` para casar com a sua gravacao.

export const LANGS = ['pt', 'en'];
export let lang = 'pt';
export function setLang(l) { if (LANGS.includes(l)) lang = l; }
export function getLang() { return lang; }

const STR = {
  // ---------- menu ----------
  tagline:        { pt: 'Chamado da Meia-Noite',       en: 'A detective story' },
  menu_continue:  { pt: 'CONTINUAR',                   en: 'CONTINUE' },
  menu_new:       { pt: 'NOVO JOGO',                   en: 'NEW GAME' },
  menu_load:      { pt: 'CARREGAR',                    en: 'LOAD GAME' },
  menu_options:   { pt: 'OPCOES',                      en: 'OPTIONS' },
  menu_extras:    { pt: 'SALA DE TESTE',               en: 'TEST ROOM' },
  menu_combat_lab:{ pt: 'ARENA DE COMBATE',            en: 'COMBAT ARENA' },
  menu_back:      { pt: 'VOLTAR',                      en: 'BACK' },
  menu_hint:      { pt: 'SETAS  MOVER      ENTER  CONFIRMAR      ESC  VOLTAR',
                    en: 'ARROWS  MOVE      ENTER  CONFIRM      ESC  BACK' },
  build_tag:      { pt: 'VERSAO DE TESTE 0.1 — FATIA JOGAVEL',
                    en: 'TEST BUILD 0.1 — VERTICAL SLICE' },

  // ---------- game over ----------
  gameover_title: { pt: 'A DÍVIDA VENCEU', en: 'THE DEBT WON' },
  gameover_grab:  { pt: 'A serra encontrou o que ele veio cobrar.', en: 'The saw found what it came to collect.' },
  gameover_body:  { pt: 'David não conseguiu levantar outra vez.', en: 'David could not get up again.' },
  gameover_retry: { pt: 'M / ENTER  RECOMEÇAR A PERSEGUIÇÃO', en: 'M / ENTER  RESTART THE CHASE' },
  gameover_load:  { pt: 'L  CARREGAR UM ARQUIVO', en: 'L  LOAD A FILE' },
  gameover_menu:  { pt: 'ESC  VOLTAR AO MENU', en: 'ESC  RETURN TO MENU' },

  // ---------- saves ----------
  slots_title_save: { pt: 'SALVAR JOGO',   en: 'SAVE GAME' },
  slots_title_load: { pt: 'CARREGAR JOGO', en: 'LOAD GAME' },
  slot:             { pt: 'ARQUIVO',       en: 'FILE' },
  slot_empty:       { pt: 'vazio',         en: 'empty' },
  slot_overwrite:   { pt: 'Sobrescrever este arquivo?', en: 'Overwrite this file?' },
  slot_erase:       { pt: 'DEL  APAGAR',   en: 'DEL  ERASE' },
  slot_erase_ask:   { pt: 'Apagar este arquivo?', en: 'Erase this file?' },
  yes:              { pt: 'SIM',           en: 'YES' },
  no:               { pt: 'NAO',           en: 'NO' },
  saved:            { pt: 'JOGO SALVO',    en: 'GAME SAVED' },
  playtime:         { pt: 'TEMPO',         en: 'TIME' },

  // ---------- pausa ----------
  paused:         { pt: 'PAUSADO',            en: 'PAUSED' },
  pause_resume:   { pt: 'CONTINUAR',          en: 'RESUME' },
  pause_save:     { pt: 'SALVAR',             en: 'SAVE' },
  pause_load:     { pt: 'CARREGAR',           en: 'LOAD' },
  pause_options:  { pt: 'OPCOES',             en: 'OPTIONS' },
  pause_quit:     { pt: 'SAIR PARA O MENU',   en: 'QUIT TO MENU' },
  pause_quit_ask: { pt: 'Sair sem salvar? O progresso desde o ultimo save some.',
                    en: 'Quit without saving? Progress since the last save is lost.' },

  // ---------- opcoes ----------
  opt_title:      { pt: 'OPCOES',              en: 'OPTIONS' },
  opt_lang:       { pt: 'IDIOMA',              en: 'LANGUAGE' },
  opt_master:     { pt: 'VOLUME GERAL',        en: 'MASTER VOLUME' },
  opt_music:      { pt: 'MUSICA',              en: 'MUSIC' },
  opt_sfx:        { pt: 'EFEITOS',             en: 'SOUND FX' },
  opt_voice:      { pt: 'VOZ',                 en: 'VOICE' },
  opt_scan:       { pt: 'LINHAS DE TELA',      en: 'SCANLINES' },
  opt_grain:      { pt: 'GRAO DE FILME',       en: 'FILM GRAIN' },
  opt_shake:      { pt: 'TREMOR DE CAMERA',    en: 'CAMERA SHAKE' },
  opt_pixel:      { pt: 'ESCALA INTEIRA',      en: 'INTEGER SCALING' },
  opt_subs:       { pt: 'LEGENDAS',            en: 'SUBTITLES' },
  opt_difficulty: { pt: 'DIFICULDADE',          en: 'DIFFICULTY' },
  diff_story:     { pt: 'HISTORIA',             en: 'STORY' },
  diff_normal:    { pt: 'NORMAL',               en: 'NORMAL' },
  diff_hard:      { pt: 'DIFICIL  [RECOMENDADA]', en: 'HARD  [RECOMMENDED]' },
  diff_mind:      { pt: 'MENTE',                en: 'MIND' },
  diff_story_desc:{ pt: 'Inimigos mais lentos, menos dano, menos vida e mais espaco para reagir.', en: 'Slower enemies, less damage, less health and more room to react.' },
  diff_normal_desc:{ pt: 'Pressao equilibrada para conhecer o galpao e seus sistemas.', en: 'Balanced pressure for learning the warehouse and its systems.' },
  diff_hard_desc: { pt: 'O ritmo pretendido: agressivo, legivel e sempre por um fio.', en: 'The intended rhythm: aggressive, readable and always close.' },
  diff_mind_desc: { pt: 'A cabeca nao concede descanso: mais inimigos, dano e perseguicao.', en: 'The mind grants no rest: more enemies, damage and pursuit.' },
  on:             { pt: 'LIGADO',              en: 'ON' },
  off:            { pt: 'DESLIGADO',           en: 'OFF' },

  // ---------- jogo ----------
  prompt_open:    { pt: 'ABRIR',      en: 'OPEN' },
  prompt_look:    { pt: 'OLHAR',      en: 'LOOK' },
  prompt_talk:    { pt: 'FALAR',      en: 'TALK' },
  prompt_use:     { pt: 'USAR',       en: 'USE' },
  skip_hold:      { pt: 'SEGURE ESC PARA PULAR', en: 'HOLD ESC TO SKIP' },
  loc_street:     { pt: 'RUA HOLLAND, 2h14',    en: 'HOLLAND STREET, 2:14 AM' },
  loc_alley:      { pt: 'BECO DOS FUNDOS',      en: 'BACK ALLEY' },
  loc_bar:        { pt: 'BAR O ULTIMO TROCO',   en: 'THE LAST DIME BAR' },
  loc_back:       { pt: 'DEPOSITO DOS FUNDOS',  en: 'BACK STOREROOM' },
  loc_cell:       { pt: 'EM ALGUM LUGAR',       en: 'SOMEWHERE' },
  note_text:      { pt: 'POR QUE VOCÊ VOLTOU AQUI?',
                    en: 'WHY DID YOU COME BACK HERE?' },

  bark_blood:     { pt: 'Sangue. Fresco.',              en: 'Blood. Fresh.' },
  bark_blood2:    { pt: 'Vai para os fundos.',          en: 'It leads to the back.' },
  bark_back_door: { pt: 'A trilha para aqui.',          en: 'The trail stops here.' },
  bark_pool:      { pt: 'Alguem ficou parado sangrando aqui. Tempo demais.',
                    en: 'Someone stood here bleeding. For too long.' },
  bark_note_pre:  { pt: 'Tem um papel no meio da poça.',
                    en: 'There is a piece of paper in the middle of it.' },
  qte_hint:       { pt: 'A  +  D  ALTERNADO',           en: 'A  +  D  ALTERNATE' },
  to_be_continued:{ pt: 'CONTINUA',                     en: 'TO BE CONTINUED' },
  prompt_pry:     { pt: 'FORCAR',                       en: 'PRY' },

  bark_note_1:    { pt: 'Quem escreveu isso sabia que eu viria.',
                    en: 'Whoever wrote this knew I would come.' },
  bark_note_2:    { pt: 'Sabia ate onde eu ia parar pra ler.',
                    en: 'Knew exactly where I would stop to read it.' },
  // NAO devolver a fala antiga aqui ("Tem alguem atras de mim, nao tem?").
  // Ela entregava o susto: o detetive nao pode perceber a figura, senao o
  // jogador para de sentir que sabe mais do que ele.
  bark_note_3:    { pt: 'Essa letra... eu conheço essa letra.',
                    en: 'This handwriting... I know this handwriting.' },

  bark_free_1:    { pt: 'Cano velho. Enferrujado por dentro.',
                    en: 'Old pipe. Rusted through.' },
  bark_free_2:    { pt: 'Levaram tudo. O cigarro, a arma, a carteira.',
                    en: 'They took everything. The smokes, the gun, the wallet.' },
  bark_free_3:    { pt: 'Deixaram o casaco. Que gentileza.',
                    en: 'They left the coat. How thoughtful.' },
  bark_pipe_take: { pt: 'Serve.',                       en: 'This will do.' },
  bark_door_pry:  { pt: 'Pregada por fora. Alguem me trancou aqui.',
                    en: 'Nailed from outside. Someone locked me in.' },
  bark_out:       { pt: 'Ar. Finalmente.',              en: 'Air. Finally.' },

  bark_cell_1:    { pt: 'Cano. Frio. Sem folga.',       en: 'Pipe. Cold. No slack.' },
  bark_cell_2:    { pt: 'Nao me mataram. Isso e pior.', en: 'They did not kill me. That is worse.' },
  bark_cell_3:    { pt: 'Alguem me trouxe ate aqui. Carregado.',
                    en: 'Somebody carried me here.' },
  not_today:      { pt: 'hoje não...',          en: 'not tonight...' },

  // ---------- falas soltas em cima da cabeca ----------
  // Curtas, secas, sem ninguem para responder. Piada quando ele consegue,
  // constatacao quando nao consegue.
  bark_alley_enter:  { pt: 'Beco sem saída. Combina.',
                       en: 'Dead end. Fitting.' },
  bark_alley_rain:   { pt: 'A chuva não lava nada. Só espalha.',
                       en: 'Rain never washes anything. It just spreads it around.' },
  bark_alley_lamp:   { pt: 'Ninguém troca a lâmpada de um beco.',
                       en: 'Nobody changes the bulb in an alley.' },
  bark_alley_window: { pt: 'Alguém ainda mora aqui. Coitado.',
                       en: 'Somebody still lives here. Poor bastard.' },
  bark_alley_door:   { pt: 'Seis anos fechado. E a porta abre.',
                       en: 'Six years shut. And the door opens.' },

  bark_bar_enter:    { pt: 'Alguém chegou antes de mim.',
                       en: 'Somebody got here first.' },
  bark_bar_enter2:   { pt: 'E não veio conversar.',
                       en: 'And they did not come to talk.' },
  bark_bar_wreck:    { pt: 'Isso não foi briga de bar.',
                       en: 'This was not a bar fight.' },
  bark_bar_wreck2:   { pt: 'Briga de bar tem dois lados.',
                       en: 'A bar fight has two sides.' },
  bark_bar_chairs:   { pt: 'Empilharam as cadeiras no meio do estrago.',
                       en: 'They stacked the chairs in the middle of the wreckage.' },
  bark_bar_chairs2:  { pt: 'Quem quebra tudo não arruma depois.',
                       en: 'People who wreck a room do not tidy it after.' },
  bark_bar_dark:     { pt: 'Se tem alguém aqui, já me viu.',
                       en: 'If anyone is in here, they have seen me already.' },
  bark_bar_bottles:  { pt: 'Bebida boa, tudo no chão. Que desperdício.',
                       en: 'Good liquor, all over the floor. Waste.' },

  bark_reload:       { pt: 'Vazio. Boa hora.',
                       en: 'Empty. Great timing.' },
  bark_dry:          { pt: 'Sem bala. Como sempre.',
                       en: 'No rounds. Of course.' },

  bark_joke_1:       { pt: 'Devia ter trazido uma lanterna. E um emprego.',
                       en: 'Should have brought a flashlight. And a job.' },
  bark_joke_2:       { pt: 'Já estive em lugares piores. Morei num.',
                       en: 'I have been in worse places. I lived in one.' },
  bark_joke_3:       { pt: 'Duas e meia. Meu horário nobre.',
                       en: 'Half past two. My prime time.' },
  chapter_1:      { pt: 'CAPITULO UM',          en: 'CHAPTER ONE' },
  chapter_1_name: { pt: 'O homem que atendeu',  en: 'The man who answered' },

  // =====================================================================
  // CAPITULO 2 — "GENTILEZA"
  // =====================================================================

  chapter_2:      { pt: 'CAPITULO DOIS',        en: 'CHAPTER TWO' },
  chapter_2_name: { pt: 'Gentileza',            en: 'Kindness' },
  chapter_3:      { pt: 'CAPITULO TRES',        en: 'CHAPTER THREE' },
  chapter_3_name: { pt: 'Gaveta D',             en: 'Drawer D' },

  // ---------- CAPITULO 3: os seis setores ----------
  loc_reception:  { pt: 'RECEPCAO',             en: 'FRONT DESK' },
  loc_squad:      { pt: 'PLANTAO',              en: 'NIGHT SHIFT' },
  loc_desk:       { pt: 'A MESA DELE',          en: 'HIS DESK' },
  loc_dead_archive:{ pt: 'ARQUIVO MORTO  -1',   en: 'DEAD FILES  -1' },
  loc_seven_years:{ pt: 'SETE ANOS ATRAS',      en: 'SEVEN YEARS AGO' },
  loc_home:       { pt: 'CASA',                 en: 'HOME' },
  loc_cell:       { pt: 'CUSTODIA',             en: 'HOLDING' },

  loc_corridor:   { pt: 'CORREDOR DE CARGA',    en: 'LOADING CORRIDOR' },
  loc_office:     { pt: 'ESCRITORIO',           en: 'FRONT OFFICE' },
  loc_shelves:    { pt: 'SETOR B — ESTANTES',   en: 'SECTOR B — RACKS' },
  loc_locker:     { pt: 'VESTIARIO',            en: 'LOCKER ROOM' },
  loc_cold:       { pt: 'CAMARA FRIA',          en: 'COLD STORE' },
  loc_machines:   { pt: 'SALA DE MAQUINAS',     en: 'MACHINE ROOM' },
  loc_mezz:       { pt: 'MEZANINO',             en: 'MEZZANINE' },
  loc_dock:       { pt: 'DOCA 3',               en: 'DOCK 3' },
  loc_wc:         { pt: 'BANHEIRO',             en: 'WASHROOM' },
  loc_arquivo:    { pt: 'ARQUIVO MORTO',        en: 'DEAD FILES' },
  loc_infirmary:  { pt: 'ENFERMARIA',           en: 'INFIRMARY' },
  loc_evidence:   { pt: 'EVIDENCIAS',           en: 'EVIDENCE' },
  loc_comms:      { pt: 'COMUNICACOES',         en: 'COMMUNICATIONS' },
  loc_security:   { pt: 'SEGURANCA',            en: 'SECURITY' },
  loc_service:    { pt: 'ROTA DE SERVICO',      en: 'SERVICE ROUTE' },
  loc_service_long:{ pt: 'CORREDOR DE MANUTENCAO', en: 'MAINTENANCE CORRIDOR' },
  loc_escape_cold:{ pt: 'CAMARA DE TRANSFERENCIA', en: 'TRANSFER FREEZER' },
  loc_chainbay:   { pt: 'BAIA DE CORRENTES',    en: 'CHAIN BAY' },
  loc_yard:       { pt: 'PATIO DE CARGA',       en: 'LOADING YARD' },
  loc_combatlab:  { pt: 'ARENA DE COMBATE',     en: 'COMBAT ARENA' },

  prompt_short_route:{ pt: 'ATALHO',             en: 'SHORTCUT' },
  prompt_long_route: { pt: 'DESVIO',             en: 'DETOUR' },
  prompt_reset:      { pt: 'REINICIAR',           en: 'RESET' },
  prompt_drop_now:   { pt: 'DERRUBAR ESTANTE AGORA', en: 'TOPPLE RACK NOW' },
  sacrifice_title:  { pt: 'A ESTANTE PODE FECHAR O DEPOSITO', en: 'THE RACK CAN SEAL THE SUPPLY CAGE' },
  sacrifice_drop:   { pt: 'DERRUBAR - perde os suprimentos, ganha tempo', en: 'DROP IT - lose supplies, gain time' },
  sacrifice_keep:   { pt: 'MANTER - preserva os itens, ele se aproxima', en: 'KEEP IT - preserve items, he closes in' },
  coat_qte:          { pt: 'M  RASGAR O CASACO E SOLTAR', en: 'M  TEAR THE COAT FREE' },
  finisher_qte:      { pt: 'M  REAGIR',           en: 'M  FIGHT BACK' },
  finisher_wall:     { pt: 'USE A PAREDE',        en: 'USE THE WALL' },
  finisher_rack:     { pt: 'DERRUBE A ESTANTE',   en: 'DROP THE RACK' },
  finisher_pipe:     { pt: 'USE O GANCHO',        en: 'USE THE HOOK' },
  finisher_valve:    { pt: 'ABRA A VALVULA',      en: 'OPEN THE VALVE' },

  b2_wc_1:    { pt: 'Azulejo branco. Alguém já achou que isso aqui fosse limpo.',
                en: 'White tile. Somebody once thought this place was clean.' },
  b2_arq_1:   { pt: 'Arquivo morto. Nome apropriado.',
                en: 'Dead files. Fitting name.' },
  b2_arq_2:   { pt: 'Alguém procurou alguma coisa aqui. Com pressa.',
                en: 'Somebody searched in here. In a hurry.' },
  b2_chave_1: { pt: 'A chave do mezanino. Guardada como uma evidencia.',
                en: 'The mezzanine key. Kept like a piece of evidence.' },
  b2_chave_2: { pt: 'Tres salas e um circuito pra chegar nela. Queriam que eu merecesse.',
                en: 'Three rooms and a circuit to reach it. They wanted me to earn it.' },
  b2_trancado:{ pt: 'Trancado. Precisa de chave.',
                en: 'Locked. Needs a key.' },
  b2_security_locked: { pt: 'Fechadura magnetica. Sem energia deste lado.',
                en: 'Magnetic lock. No power on this side.' },

  // ---------- o turno de 02h14 ----------
  b2_inf_1:   { pt: 'Enfermaria. O lugar onde o turno remendava o que quebrava.',
                en: 'Infirmary. Where the shift patched up what it broke.' },
  b2_ev_1:    { pt: 'Evidencias. Nada aqui chegou a virar resposta.',
                en: 'Evidence. Nothing here ever became an answer.' },
  b2_com_1:   { pt: 'Comunicacoes. Todos os fios foram cortados do mesmo tamanho.',
                en: 'Communications. Every wire was cut to the same length.' },
  b2_sec_1:   { pt: 'Seguranca. O relogio daqui tambem parou em duas e quatorze.',
                en: 'Security. The clock here stopped at two fourteen too.' },
  b2_relay_hand_1: { pt: 'Rele de latao. Uma mao gravada.', en: 'A brass relay. A hand engraved on it.' },
  b2_relay_hand_2: { pt: 'Primeiro: o que eu nao consegui segurar.', en: 'First: what I could not hold on to.' },
  b2_relay_eye_1:  { pt: 'Outro rele. Um olho riscado no centro.', en: 'Another relay. An eye scratched into its face.' },
  b2_relay_eye_2:  { pt: 'Segundo: o que eu escolhi nao ver.', en: 'Second: what I chose not to see.' },
  b2_relay_voice_1:{ pt: 'O terceiro. Uma boca, ou um telefone.', en: 'The third. A mouth, or a telephone.' },
  b2_relay_voice_2:{ pt: 'Terceiro: a voz que eu deixei tocar.', en: 'Third: the voice I let ring.' },
  b2_relay_generic:{ pt: 'Um rele arrancado de algum quadro.', en: 'A relay torn from some panel.' },
  b2_puzzle_missing_all: { pt: 'Tres encaixes vazios: mao, olho, voz.', en: 'Three empty sockets: hand, eye, voice.' },
  b2_puzzle_missing: { pt: 'Ainda falta rele. O desenho exige os tres.', en: 'A relay is still missing. The diagram requires all three.' },
  b2_puzzle_open: { pt: 'O circuito esta fechado. O armario, aberto.', en: 'The circuit is closed. The cabinet is open.' },
  b2_puzzle_done_1: { pt: 'Mao. Olho. Voz.', en: 'Hand. Eye. Voice.' },
  b2_puzzle_done_2: { pt: 'A corrente chegou na chave.', en: 'The current reached the key.' },

  puzzle_title:    { pt: 'QUADRO DO TURNO', en: 'SHIFT PANEL' },
  puzzle_subtitle: { pt: 'RELÓGIO 02:14  /  CIRCUITO DO ARMARIO', en: '02:14 CLOCK  /  CABINET CIRCUIT' },
  puzzle_key:      { pt: 'CHAVE', en: 'KEY' },
  puzzle_hand:     { pt: 'MAO', en: 'HAND' },
  puzzle_eye:      { pt: 'OLHO', en: 'EYE' },
  puzzle_voice:    { pt: 'VOZ', en: 'VOICE' },
  puzzle_solved:   { pt: 'CORRENTE FECHADA — ARMARIO LIBERADO', en: 'CIRCUIT CLOSED — CABINET RELEASED' },
  puzzle_hint:     { pt: 'SETAS  MOVER     E / CLIQUE  GIRAR     ESC  SAIR', en: 'ARROWS  MOVE     E / CLICK  TURN     ESC  EXIT' },

  // ---------- tela de carregamento ----------
  load_1: { pt: 'Duas e quatorze da manhã.',            en: 'Two fourteen in the morning.' },
  load_2: { pt: 'O telefone tocou. Ele atendeu.',       en: 'The phone rang. He answered.' },
  load_3: { pt: 'Não existe aposentadoria pra consciência.',
            en: 'There is no retirement for a conscience.' },
  load_4: { pt: 'Ela bate ponto todos os dias.',        en: 'It clocks in every day.' },
  load_wait: { pt: 'CARREGANDO',                        en: 'LOADING' },

  hud_hp:  { pt: 'CORPO',    en: 'BODY' },
  hud_san: { pt: 'CABECA',   en: 'MIND' },
  hud_ammo:{ pt: 'MUNIÇÃO',  en: 'AMMO' },

  // ---------- o mapa ----------
  map_title:  { pt: 'PLANTA BAIXA — GALPAO',  en: 'FLOOR PLAN — WAREHOUSE' },
  map_hint:   { pt: 'M  FECHAR',              en: 'M  CLOSE' },
  map_here:   { pt: 'VOCE ESTA AQUI',         en: 'YOU ARE HERE' },
  map_none:   { pt: 'Sem mapa. Deve ter um em algum escritório.',
                en: 'No map. There must be one in an office somewhere.' },
  map_mark:   { pt: 'alguém marcou a doca 3 a lápis',
                en: 'someone pencilled a mark on dock 3' },
  map_office:    { pt: 'ESCR.',       en: 'OFFICE' },
  map_archive:   { pt: 'ARQ.',        en: 'FILES' },
  map_evidence:  { pt: 'EVID.',       en: 'EVID.' },
  map_comms:     { pt: 'COM.',        en: 'COMMS' },
  map_security:  { pt: 'SEG.',        en: 'SEC.' },
  map_corridor:  { pt: 'CORREDOR DE CARGA', en: 'LOADING CORRIDOR' },
  map_dock:      { pt: 'DOCA 3',      en: 'DOCK 3' },
  map_mezz:      { pt: 'MEZANINO',    en: 'MEZZ.' },
  map_machines:  { pt: 'MAQUINAS',    en: 'MACHINES' },
  map_shelves:   { pt: 'ESTANTES',    en: 'RACKS' },
  map_cold:      { pt: 'FRIA',        en: 'COLD' },
  map_locker:    { pt: 'VESTIARIO',   en: 'LOCKERS' },
  map_wc:        { pt: 'WC',          en: 'WC' },
  map_infirmary: { pt: 'ENF.',        en: 'INF.' },
  map_unknown:   { pt: 'SALA 0',      en: 'ROOM 0' },

  speaker_me:     { pt: 'DAVID',   en: 'DAVID' },
  talk_leave:     { pt: 'Deixa pra lá.', en: 'Never mind.' },
  prompt_take:    { pt: 'PEGAR',   en: 'TAKE' },
  prompt_read:    { pt: 'LER',     en: 'READ' },
  prompt_hide:    { pt: 'ESCONDER', en: 'HIDE' },
  prompt_talk2:   { pt: 'FALAR',   en: 'TALK' },
  prompt_force:   { pt: 'FORCAR',  en: 'FORCE' },
  prompt_valve:   { pt: 'ABRIR VAPOR', en: 'VENT STEAM' },
  prompt_squeeze: { pt: 'PASSAR', en: 'SQUEEZE THROUGH' },
  prompt_drop:    { pt: 'DERRUBAR', en: 'TOPPLE' },
  prompt_push:    { pt: 'EMPURRAR', en: 'PUSH' },
  prompt_close:   { pt: 'FECHAR', en: 'CLOSE' },
  prompt_alarm:   { pt: 'ACIONAR ALARME', en: 'TRIGGER ALARM' },
  prompt_answer:  { pt: 'ATENDER', en: 'ANSWER' },

  // ---------- corredor de carga ----------
  b2_corr_1:  { pt: 'Isso não é um galpão. Isso é um quarteirão.',
                en: 'This is not a warehouse. This is a city block.' },
  b2_corr_2:  { pt: 'Eu estava numa caixa de fósforo dentro de outra caixa.',
                en: 'I was in a matchbox inside another box.' },
  b2_corr_3:  { pt: 'Um lugar desse tamanho devia ter eco.',
                en: 'A place this size should have an echo.' },
  b2_corr_4:  { pt: 'Devia. Não tem.',
                en: 'It should. It does not.' },
  b2_club_1:  { pt: 'Um pedaço de pau do tamanho certo. Encostado numa coluna. Em pé.',
                en: 'A piece of wood exactly the right size. Leaning on a column. Upright.' },
  b2_club_2:  { pt: 'Que sorte a minha.',
                en: 'Lucky me.' },
  b2_corr_5:  { pt: 'Toda porta daqui tranca por fora.',
                en: 'Every door in this place locks from outside.' },

  // ---------- escritorio ----------
  b2_off_1:   { pt: 'Escritório. Luz acesa. Claro que sim.',
                en: 'An office. Light on. Of course.' },
  b2_diary_1: { pt: 'Um caderno em branco. E uma caneta que ainda escreve.',
                en: 'A blank notebook. And a pen that still works.' },
  b2_diary_2: { pt: 'Até parece que querem que eu anote.',
                en: 'Almost like somebody wants me taking notes.' },
  b2_diary_3: { pt: 'Ou eu estou com muita sorte, ou alguém está arrumando a casa pra mim.',
                en: 'Either I am very lucky, or somebody is tidying the house for me.' },
  b2_map_1:   { pt: 'Setor A, B, C. Câmara fria. Casa de máquinas.',
                en: 'Sector A, B, C. Cold store. Machine room.' },
  b2_map_2:   { pt: 'Pelo menos agora eu sei o tamanho do problema.',
                en: 'At least now I know how big the problem is.' },
  b2_vigia_bye: { pt: 'Ele nunca perguntou o meu nome.',
                en: 'He never asked my name.' },

  // ---------- estantes ----------
  b2_shelf_1: { pt: 'Corredor de estante. Não dá pra ver duas fileiras à frente.',
                en: 'Racking aisle. You cannot see two rows ahead.' },
  b2_shelf_2: { pt: 'Alguma coisa se mexeu ali atrás.',
                en: 'Something moved back there.' },
  b2_know:    { pt: '...eu conheço isso.',
                en: '...I know this.' },
  b2_ammo_1:  { pt: 'Munição.',
                en: 'Ammunition.' },
  b2_ammo_2:  { pt: 'Sem arma.',
                en: 'No gun.' },
  b2_ammo_3:  { pt: 'Alguém tem senso de humor.',
                en: 'Somebody has a sense of humor.' },

  // ---------- vestiario ----------
  b2_lock_1:  { pt: 'Vestiário. Luz melhor. Quase um lugar de gente.',
                en: 'Locker room. Better light. Almost a place for people.' },
  b2_lock_2:  { pt: 'Se eu fosse sentar em algum canto, seria aqui.',
                en: 'If I were going to sit down anywhere, it would be here.' },
  b2_cig_1:   { pt: '...',
                en: '...' },
  b2_cig_2:   { pt: 'Minha marca.',
                en: 'My brand.' },
  b2_cig_3:   { pt: 'Isso já não é sorte. Isso é recado.',
                en: 'This is not luck anymore. This is a message.' },
  b2_mirror_after: { pt: '...era isso que eu não queria ver.',
                en: '...that is what I did not want to see.' },

  // ---------- camara fria ----------
  b2_cold_1:  { pt: 'Frio. Depois de todos esses anos, ainda tem frio aqui dentro.',
                en: 'Cold. After all these years, it is still cold in here.' },
  b2_cold_2:  { pt: 'Isso não é possível. Já sei. Já anotei.',
                en: 'Not possible. I know. I wrote it down.' },
  b2_cold_3:  { pt: 'O isqueiro dura uns segundos. Depois esfria demais pra segurar.',
                en: 'The lighter lasts a few seconds. Then it gets too cold to hold.' },
  b2_hook_1:  { pt: 'Os ganchos estão balançando. Todos.',
                en: 'The hooks are swinging. All of them.' },
  b2_hook_2:  { pt: 'Não tem vento aqui.',
                en: 'There is no wind in here.' },
  b2_hook_3:  { pt: 'Tem alguma coisa pendurada ali.',
                en: 'There is something hanging over there.' },
  b2_hook_4:  { pt: 'Um casaco. Marrom.',
                en: 'A coat. Brown.' },
  b2_hook_5:  { pt: 'Não tem nada ali.',
                en: 'There is nothing there.' },
  b2_hook_6:  { pt: 'Nunca teve.',
                en: 'There never was.' },

  // ---------- sala de maquinas ----------
  b2_mach_1:  { pt: 'Zumbido. Num lugar sem energia.',
                en: 'A hum. In a place with no power.' },
  b2_gun_1:   { pt: 'Lá está ela.',
                en: 'There it is.' },
  b2_gun_2:   { pt: 'No meio da sala. Limpa. Apontada pra porta.',
                en: 'Middle of the room. Clean. Pointed at the door.' },
  b2_gun_3:   { pt: 'Isso não é uma arma perdida. Isso é uma arma entregue.',
                en: 'That is not a lost gun. That is a gun handed over.' },
  b2_gun_4:   { pt: 'E eu vou pegar, porque eu sou exatamente o idiota que eles precisam.',
                en: 'And I am going to take it, because I am exactly the fool they need.' },
  b2_ambush:  { pt: 'Claro.',
                en: 'Of course.' },
  b2_ambush2: { pt: 'Toda gentileza cobra na saída.',
                en: 'Every kindness bills you on the way out.' },

  // ---------- mezanino ----------
  b2_mezz_1:  { pt: '...',
                en: '...' },
  b2_mezz_2:  { pt: 'Moça?',
                en: 'Miss?' },
  b2_mezz_3:  { pt: 'Moça, eu não vou te machucar.',
                en: 'Miss, I am not going to hurt you.' },
  b2_mezz_4:  { pt: 'Cabos que não terminam em lugar nenhum.',
                en: 'Cables that do not end anywhere.' },

  // ---------- a fuga ----------
  b2_chase_1: { pt: 'As luzes estão apagando. Setor por setor.',
                en: 'The lights are going out. Sector by sector.' },
  b2_chase_2: { pt: 'Vindo pra cá.',
                en: 'Coming this way.' },
  b2_chase_3: { pt: 'Isso é metal raspando no chão.',
                en: 'That is metal dragging on concrete.' },
  b2_chase_4: { pt: 'Esse casaco é igual ao meu.',
                en: 'That coat is the same as mine.' },
  b2_chase_5: { pt: 'A doca. Chuva do outro lado.',
                en: 'The dock. Rain on the other side.' },
  b2_chase_6: { pt: 'Não adianta. Ele não cai.',
                en: 'No use. He does not go down.' },
  b2_gate_second_phase: { pt: 'Ele vai cortar o portão. Preciso continuar.', en: 'He is cutting through the gate. I need to keep moving.' },
  b2_cache_blocked: { pt: 'A estante selou a grade. O tempo custou os suprimentos.', en: 'The rack sealed the cage. Time cost the supplies.' },
  b2_cache_take: { pt: 'Ainda estavam esperando por mim.', en: 'They were still waiting for me.' },
  b2_sacrifice_drop: { pt: 'Quatro segundos. Foi isso que eu comprei.', en: 'Four seconds. That is what I bought.' },
  b2_sacrifice_keep: { pt: 'Não vou deixar mais nada aqui.', en: 'I am not leaving anything else here.' },
  b2_coat_torn: { pt: 'Fica com o pano.', en: 'Keep the cloth.' },
  b2_coat_torn_hurt: { pt: 'Levou o casaco. Quase levou o resto.', en: 'He took the coat. Almost took the rest.' },
  b2_false_silence: { pt: 'Silêncio não. Ele está cortando a parede.', en: 'Not silence. He is cutting through the wall.' },
  b2_final_pallet: { pt: 'A cinta de metal. Prende a lâmina.', en: 'The metal strap. It can catch the blade.' },
  b2_final_outside: { pt: 'Chuva. Ar. Continua andando.', en: 'Rain. Air. Keep moving.' },
  b2_escape_door: { pt: 'O portão de correr... abriu. É a rota para a doca.',
                    en: 'The rolling gate... opened. That is the route to the dock.' },
  b2_escape_steam: { pt: 'Vapor. Dois segundos, se eu tiver sorte.', en: 'Steam. Two seconds, if I am lucky.' },
  b2_escape_rack: { pt: 'Ele vai atravessar. Mas não agora.', en: 'He will get through. Just not now.' },
  b2_escape_cart: { pt: 'Desce, desce, desce.', en: 'Go, go, go.' },
  b2_escape_alarm: { pt: 'Segue o barulho. Só por um instante.', en: 'Follow the noise. Just for a moment.' },
  b2_route_blocked: { pt: 'Emperrou. O painel abriu aquela passagem de serviço.', en: 'Jammed. The panel opened that service passage.' },
  hint_crank_door: { pt: 'APERTE E — BAIXAR PORTA', en: 'PRESS E — LOWER DOOR' },
  grab_resist: { pt: 'M — RESISTIR', en: 'M — RESIST' },
  grab_gun: { pt: 'PISTOLA SACADA — DISPARO À QUEIMA-ROUPA', en: 'PISTOL DRAWN — POINT-BLANK SHOT' },
  grab_club: { pt: 'PORRETE — MAIS FORÇA, MAIS DESGASTE', en: 'CLUB — MORE FORCE, MORE WEAR' },
  b2_grab_escape: { pt: 'Larga... de mim.', en: 'Get... off me.' },
  b2_grab_learns: { pt: 'Ele apertou mais forte desta vez.', en: 'He held tighter this time.' },
  b2_phone_ring: { pt: 'Esse telefone não estava tocando antes.', en: 'That telephone was not ringing before.' },
  b2_phone_watch_1: { pt: 'A voz diz que estou com a mão direita no fone.', en: 'The voice says my right hand is on the receiver.' },
  b2_phone_watch_2: { pt: 'Agora diz que olhei para a porta.', en: 'Now it says I looked at the door.' },
  b2_phone_watch_3: { pt: 'Ela está descrevendo isso antes de eu fazer.', en: 'It is describing this before I do it.' },
  b2_punch_1: { pt: 'O relógio imprimiu um cartão.', en: 'The clock printed a card.' },
  b2_punch_2: { pt: 'DAVID. Entrada: 02h14. Saída em branco.', en: 'DAVID. Clock-in: 2:14. Clock-out blank.' },
  b2_doc_first: { pt: 'Um relatório incompleto. Sem meu nome.', en: 'An incomplete report. My name is not on it.' },
  b2_doc_changed_1: { pt: 'Eu já li esse papel.', en: 'I already read this paper.' },
  b2_doc_changed_2: { pt: 'A última linha não estava aqui.', en: 'The last line was not here.' },
  b2_corpse_echo: { pt: 'Eu matei isso em outra sala.', en: 'I killed this in another room.' },
  b2_ammo_more: { pt: 'Mais munição. Desta vez eu contei.', en: 'More ammunition. I counted it this time.' },
  b2_medkit: { pt: 'Ainda lacrado. Posso usar isso.', en: 'Still sealed. I can use this.' },
  b2_sedative: { pt: 'Ansiolítico. Não resolve a causa. Talvez cale o ruído.', en: 'Anxiolytic. It will not fix the cause. It may quiet the noise.' },
  b2_heal_full: { pt: 'Não preciso gastar isso agora.', en: 'I do not need to use this now.' },
  b2_npc_mind_vigia: { pt: 'O sangue para na borda da luz... como tinta num pensamento.', en: 'The blood stops at the edge of the light... like ink inside a thought.' },
  b2_npc_mind_operadora: { pt: 'Os fios passam por baixo dela. Não por baixo do chão.', en: 'The wires run under her. Not under the floor.' },
  b2_operator_drop: { pt: 'Uma ficha perfurada com meu número. E cartuchos contados para uma decisão.', en: 'A punch card with my number. And rounds counted for a decision.' },
  b2_code_note: { pt: 'Caiu do bolso dele. 02-14. Ele esperava que eu fizesse isso.', en: 'It fell from his pocket. 02-14. He expected me to do this.' },
  b2_safe_locked: { pt: 'Quatro discos. Sem a combinação, só aço.', en: 'Four dials. Without the combination, it is only steel.' },
  b2_safe_open: { pt: '02-14. A mesma hora. Claro que seria.', en: '02-14. The same time. Of course it would be.' },
  b2_mezz_reward: { pt: 'Um forro de campo, bolsos internos e suprimentos. Preparado para mim.', en: 'A field lining, inner pockets and supplies. Prepared for me.' },
  b2_radio_off: { pt: 'Silêncio. Finalmente.', en: 'Silence. Finally.' },
  b2_radio_dead: { pt: 'Desligado. Mesmo assim o ponteiro mexeu.', en: 'It is off. The needle moved anyway.' },
  b2_radio_scream: { pt: 'Esses gritos... estão atrás do chiado. Ou atrás de mim.', en: 'Those screams... are behind the static. Or behind me.' },
  b2_end_1:   { pt: 'Ele não veio atrás.',
                en: 'He did not follow.' },
  b2_end_2:   { pt: 'Só ficou olhando.',
                en: 'He just stood there watching.' },
  b2_end_3:   { pt: 'Não era pra cobrar hoje.',
                en: 'Tonight was not collection day.' },

  // ---------- o cigarro travado (degrau 1) ----------
  cig_no_1:   { pt: 'Não.',                      en: 'No.' },
  cig_no_2:   { pt: 'Eu não vou fumar isso.',    en: 'I am not smoking that.' },
  cig_no_3:   { pt: 'Não é hoje.',               en: 'Not today.' },
  cig_no_4:   { pt: 'Guarda isso.',              en: 'Put it away.' },

  // ---------- combate ----------
  b2_swing_tired: { pt: 'Preciso... de um segundo.',
                en: 'I need... a second.' },
  b2_club_broke:  { pt: 'Quebrou. Era madeira, afinal.',
                en: 'Snapped. It was wood, after all.' },
  b2_hurt_1:  { pt: 'Isso doeu de verdade.',     en: 'That one was real.' },
  b2_down:    { pt: 'Não. Ainda não.',           en: 'No. Not yet.' },

  // ---------- interface: caderno ----------
  jr_title:       { pt: 'CADERNO',            en: 'NOTEBOOK' },
  jr_hint:        { pt: 'SETAS  VIRAR PAGINA      Z  TROCAR ABA      Q  FECHAR',
                    en: 'ARROWS  TURN PAGE      Z  CHANGE TAB      Q  CLOSE' },
  jr_empty:       { pt: 'Nada anotado ainda.', en: 'Nothing written yet.' },
  jr_new:         { pt: 'ANOTADO NO CADERNO',  en: 'WRITTEN IN THE NOTEBOOK' },
  jr_cat_clue:    { pt: 'PISTAS',             en: 'LEADS' },
  jr_cat_people:  { pt: 'PESSOAS',            en: 'PEOPLE' },
  jr_cat_place:   { pt: 'LUGARES',            en: 'PLACES' },
  jr_cat_self:    { pt: 'EU MESMO',           en: 'MYSELF' },
  jr_cat_other:   { pt: '?',                  en: '?' },
  jr_cat_document:{ pt: 'DOCUMENTO',          en: 'DOCUMENT' },
  jr_page:        { pt: 'PAGINA',             en: 'PAGE' },
  jr_tab_notes:   { pt: 'ANOTAÇÕES',          en: 'NOTES' },
  jr_tab_docs:    { pt: 'DOCUMENTOS',         en: 'DOCUMENTS' },

  // ---------- interface: deducao (o verbo do Capitulo 3) ----------
  // Duas anotacoes marcadas ao mesmo tempo. Se as duas conversam, ele
  // escreve uma terceira. Ninguem diz quais combinam.
  jr_cat_deduc:   { pt: 'CONCLUSÃO',          en: 'CONCLUSION' },
  jr_tab_evid:    { pt: 'PROVAS',             en: 'EVIDENCE' },
  jr_slot_empty:  { pt: '— vazio —',          en: '— empty —' },
  jr_btn_join:    { pt: 'JUNTAR',             en: 'CONNECT' },
  jr_hint_evid:   { pt: 'SETAS  ESCOLHER    X  PÔR NA BANCADA    ENTER  JUNTAR    Z  ABA',
                    en: 'ARROWS  SELECT    X  PLACE ON BENCH    ENTER  CONNECT    Z  TAB' },
  jr_hint_ded:    { pt: 'SETAS  VIRAR      Z  ABA (PROVAS)      Q  FECHAR',
                    en: 'ARROWS  TURN      Z  TAB (EVIDENCE)      Q  CLOSE' },
  jr_mark:        { pt: 'SEGURANDO',          en: 'HOLDING' },
  jr_mark_hint:   { pt: 'X numa segunda página para juntar as duas.',
                    en: 'X on a second page to connect the two.' },
  jr_ded_ok:      { pt: 'FECHA.',             en: 'IT ADDS UP.' },
  jr_ded_no:      { pt: 'Não fecha.',         en: 'Does not add up.' },
  jr_ded_new:     { pt: 'CONCLUSÃO NOVA',     en: 'NEW CONCLUSION' },

  // ---------- interface: conversa ----------
  // Perguntar de novo o que ja foi respondido. Custa, e nem sempre muda
  // a resposta — mas quando muda, e a unica forma de chegar la.
  talk_press:     { pt: '(insistir)',         en: '(press)' },
  talk_more:      { pt: '·',                  en: '·' },

  // ---------- interface: inventario ----------
  inv_title:      { pt: 'O CASACO',           en: 'THE COAT' },
  inv_hint:       { pt: 'ARRASTAR  MOVER      R  GIRAR      TAB  FECHAR',
                    en: 'DRAG  MOVE      R  ROTATE      TAB  CLOSE' },
  inv_inspect_hint:{ pt: 'MOUSE/SETAS  GIRAR EM TODAS AS DIREÇÕES      BOTÃO DIREITO  VOLTAR',
                    en: 'MOUSE/ARROWS  ROTATE IN EVERY DIRECTION      RIGHT CLICK  BACK' },
  inv_use_hint:   { pt: 'E  USAR',            en: 'E  USE' },
  inv_use_button: { pt: 'USAR ITEM',           en: 'USE ITEM' },
  inv_belt:       { pt: 'CINTO',              en: 'BELT' },
  inv_pocket_l:   { pt: 'BOLSO INTERNO',      en: 'INNER POCKET' },
  inv_pocket_r:   { pt: 'BOLSO INTERNO',      en: 'INNER POCKET' },
  inv_chest:      { pt: 'PEITO',              en: 'CHEST' },
  inv_case:       { pt: 'CASO',               en: 'CASE' },
  inv_full:       { pt: 'Não cabe.',          en: 'It does not fit.' },
  inv_got:        { pt: 'GUARDADO',           en: 'STOWED' },
  inv_nohands:    { pt: 'O porrete não cabe em bolso nenhum. Fica na mão ou fica pra trás.',
                    en: 'The club fits in no pocket. It stays in your hand or stays behind.' },

  it_club:        { pt: 'RIPA DE PALETE',     en: 'PALLET SLAT' },
  it_club_d:      { pt: 'Madeira grossa, um prego torto na ponta. Vai quebrar uma hora.',
                    en: 'Thick wood, a bent nail at the tip. It will break eventually.' },
  it_ammo:        { pt: 'CAIXA DE MUNICAO',   en: 'BOX OF ROUNDS' },
  it_ammo_d:      { pt: 'Cheia. Nova. Inútil, por enquanto.',
                    en: 'Full. New. Useless, for now.' },
  it_cigs:        { pt: 'MACO DE CIGARROS',   en: 'PACK OF CIGARETTES' },
  it_cigs_d:      { pt: 'Fechado. Da minha marca.',
                    en: 'Sealed. My brand.' },
  it_lighter:     { pt: 'ISQUEIRO',           en: 'LIGHTER' },
  it_lighter_d:   { pt: 'Pesa pouco. Acende no primeiro golpe.',
                    en: 'Light in the hand. Catches on the first strike.' },
  it_gun:         { pt: 'PISTOLA',            en: 'PISTOL' },
  it_gun_d:       { pt: 'Limpa demais pra um lugar assim.',
                    en: 'Too clean for a place like this.' },
  it_map:         { pt: 'MAPA DO GALPAO',     en: 'WAREHOUSE MAP' },
  it_map_d:       { pt: 'Planta baixa. Alguém marcou a doca 3 a lápis.',
                    en: 'Floor plan. Somebody pencilled a mark on dock 3.' },
  it_note:        { pt: 'BILHETE',            en: 'THE NOTE' },
  it_note_d:      { pt: '"POR QUE VOCÊ VOLTOU AQUI?" Eu conheço essa letra.',
                    en: '"WHY DID YOU COME BACK HERE?" I know this handwriting.' },
  it_medkit:      { pt: 'KIT DE PRIMEIROS SOCORROS', en: 'FIRST AID KIT' },
  it_medkit_d:    { pt: 'Gaze, antisséptico e pontos. Recupera o corpo.', en: 'Gauze, antiseptic and sutures. Restores the body.' },
  it_sedative:    { pt: 'ANSIOLÍTICO', en: 'ANXIOLYTIC' },
  it_sedative_d:  { pt: 'Comprimidos antigos, ainda selados. Reduz o ruído na cabeça.', en: 'Old tablets, still sealed. Quiet the noise in the mind.' },
  it_relay_hand:  { pt: 'RELÉ — MÃO', en: 'RELAY — HAND' },
  it_relay_hand_d:{ pt: 'Latão pesado. Uma mão foi gravada sobre os contatos.', en: 'Heavy brass. A hand was engraved over the contacts.' },
  it_relay_eye:   { pt: 'RELÉ — OLHO', en: 'RELAY — EYE' },
  it_relay_eye_d: { pt: 'O segundo módulo. O risco no centro lembra um olho aberto.', en: 'The second module. The mark at its center resembles an open eye.' },
  it_relay_voice: { pt: 'RELÉ — VOZ', en: 'RELAY — VOICE' },
  it_relay_voice_d:{ pt: 'Três sulcos saem do centro como uma voz atravessando um fio.', en: 'Three grooves leave the center like a voice travelling through wire.' },
  it_ammo_d_low:   { pt: 'Seis promessas pequenas. Nenhuma sabe quem merece.', en: 'Six small promises. None knows who deserves one.' },
  it_cigs_d_low:   { pt: 'O selo respira quando eu não olho diretamente.', en: 'The seal breathes when I do not look straight at it.' },
  it_lighter_d_low:{ pt: 'Quente. Não usei ainda. Continua quente.', en: 'Warm. I have not used it. Still warm.' },
  it_gun_d_low:    { pt: 'Mais leve depois de cada disparo. Mais pesada depois de cada corpo.', en: 'Lighter after every shot. Heavier after every body.' },
  it_map_d_low:    { pt: 'A rota muda quando dobro o papel. A doca permanece.', en: 'The route changes when I fold it. The dock remains.' },
  it_note_d_low:   { pt: 'Minha letra termina uma frase que eu ainda não li.', en: 'My handwriting finishes a sentence I have not read yet.' },
  it_medkit_d_low: { pt: 'Gaze suficiente para esconder. Não suficiente para apagar.', en: 'Enough gauze to hide it. Not enough to erase it.' },
  it_sedative_d_low:{ pt: 'O frasco diz silêncio. O vidro diz esquecimento.', en: 'The bottle says silence. The glass says forgetting.' },
  it_relay_hand_d_low:{ pt: 'A mão gravada fecha os dedos quando volto o módulo.', en: 'The engraved hand closes its fingers when I turn the module.' },
  it_relay_eye_d_low:{ pt: 'O olho não está no metal. Está no reflexo.', en: 'The eye is not in the metal. It is in the reflection.' },
  it_relay_voice_d_low:{ pt: 'Encostado no ouvido, ele repete meu nome sem som.', en: 'Held to my ear, it repeats my name without sound.' },

  // ---------- interface: sanidade ----------
  san_1:          { pt: 'LUCIDO',             en: 'LUCID' },
  san_2:          { pt: 'RACHANDO',           en: 'CRACKING' },
  san_3:          { pt: 'VAZANDO',            en: 'LEAKING' },
  san_4:          { pt: 'RENDIDO',            en: 'SURRENDERED' },

  // ---------- interface: perseguicao ----------
  hint_hold_breath: { pt: 'SHIFT  CONTROLAR O PANICO',
                    en: 'SHIFT  CONTROL PANIC' },
  hint_hide:      { pt: 'E  PARA SAIR',       en: 'E  TO GET OUT' },
  hint_journal:   { pt: 'Q  CADERNO      TAB  CASACO',
                    en: 'Q  NOTEBOOK      TAB  COAT' },
  hint_run:       { pt: 'SHIFT  CORRER',      en: 'SHIFT  RUN' },

  // ---------- sala de teste ----------
  lab_title:      { pt: 'SALA DE TESTE',        en: 'TEST ROOM' },
  lab_hint:       { pt: 'SETAS  TROCAR ANIMACAO   Z/X  VELOCIDADE   C  ESQUELETO   V  ESPELHAR   ESC  SAIR',
                    en: 'ARROWS  CHANGE ANIM   Z/X  SPEED   C  SKELETON   V  FLIP   ESC  EXIT' },
  lab_speed:      { pt: 'VELOCIDADE',           en: 'SPEED' },
  lab_frame:      { pt: 'CICLO',                en: 'CYCLE' },
  combatlab_title:{ pt: 'TESTE DE FERIMENTOS E FRENZY', en: 'WOUNDS AND FRENZY TEST' },
  combatlab_hint: { pt: 'MIRE EM CABECA, BRACOS E PERNAS - M NO AGARRAO - E NO PAINEL REINICIA', en: 'AIM AT HEAD, ARMS AND LEGS - M WHEN GRABBED - E AT PANEL RESETS' },

  // ---------- HUD de depuracao ----------
  dbg_on:         { pt: 'DEPURACAO', en: 'DEBUG' },

  // =====================================================================
  // CAPITULO 3 — "GAVETA D"
  //
  // Nao ha combate. A arma fica no escaninho 214. O capitulo inteiro e
  // andar, olhar e conversar.
  // =====================================================================

  // ---------- seletor de capitulo ----------
  menu_chapters:  { pt: 'CAPITULOS',            en: 'CHAPTERS' },
  chapsel_title:  { pt: 'ESCOLHER CAPITULO',    en: 'SELECT CHAPTER' },
  chapsel_hint:   { pt: 'SETAS  ESCOLHER      ENTER  COMECAR      ESC  VOLTAR',
                    en: 'ARROWS  SELECT      ENTER  START      ESC  BACK' },
  chapsel_warn:   { pt: 'Comecar um capitulo nao apaga nenhum arquivo salvo.',
                    en: 'Starting a chapter does not erase any save file.' },
  chap1_name:     { pt: 'O homem que atendeu',  en: 'The man who answered' },
  chap2_name:     { pt: 'Gentileza',            en: 'Kindness' },
  chap3_name:     { pt: 'Gaveta D',             en: 'Drawer D' },
  chap1_desc:     { pt: 'O beco, o bar, a nota. Comeca pela cutscene.',
                    en: 'The alley, the bar, the note. Starts at the opening.' },
  chap2_desc:     { pt: 'O galpao inteiro. Com a ripa, sem a arma.',
                    en: 'The whole warehouse. With the slat, without the gun.' },
  chap3_desc:     { pt: 'A delegacia. Sem combate — so conversa.',
                    en: 'The precinct. No combat — talk only.' },

  // ---------- falas soltas: recepcao ----------
  b3_rec_1:   { pt: 'Sete anos sem subir essa escada.',
                en: 'Seven years since I climbed these steps.' },
  b3_rec_2:   { pt: 'E ela continua com o mesmo degrau solto.',
                en: 'And it still has the same loose step.' },
  b3_rec_3:   { pt: 'Luz acesa em tudo. Duas e quatorze da manha.',
                en: 'Every light on. Two fourteen in the morning.' },
  b3_rec_4:   { pt: '...',
                en: '...' },
  b3_rec_credor: { pt: 'Ele esta esperando a vez.',
                en: 'He is waiting his turn.' },
  b3_rec_gun:  { pt: 'Segunda vez na vida que eu entrego uma arma nesse balcao.',
                en: 'Second time in my life I hand over a gun at this desk.' },
  b3_rec_214:  { pt: 'Claro que e o duzentos e quatorze.',
                en: 'Of course it is two fourteen.' },
  b3_rec_sit:  { pt: 'Tem gente que so sabe cobrar em silencio.',
                en: 'Some people only know how to collect in silence.' },

  // ---------- falas soltas: plantao ----------
  b3_sq_1:    { pt: 'Turno cheio. Duas e quatorze da manha.',
                en: 'Full shift. Two fourteen in the morning.' },
  b3_sq_2:    { pt: 'Nunca teve turno cheio nesse horario. Nem quando o mundo prestava.',
                en: 'There was never a full shift at this hour. Not even when the world worked.' },
  b3_sq_3:    { pt: 'Todo mundo cumprimentou. Ninguem perguntou nada.',
                en: 'Everybody said hello. Nobody asked anything.' },
  b3_sq_4:    { pt: 'Alguem esta datilografando. As duas da manha.',
                en: 'Somebody is typing. At two in the morning.' },

  // ---------- falas soltas: a mesa dele ----------
  // A foto esta virada para baixo. Insistir NAO e recompensado aqui — o
  // espelho do Capitulo 2 e carta jogada uma vez so.
  c3_foto_1:  { pt: 'Está de costas.',           en: 'It is face down.' },
  c3_foto_2:  { pt: 'Não.',                      en: 'No.' },
  c3_foto_3:  { pt: 'Eu disse não.',             en: 'I said no.' },
  c3_livro_1: { pt: 'Uma linha por noite. E a assinatura é a minha em todas.',
                en: 'One line per night. And the signature is mine on every one.' },

  b3_desk_1:  { pt: 'Minha mesa.',
                en: 'My desk.' },
  b3_desk_2:  { pt: 'Ninguem sentou nela.',
                en: 'Nobody ever sat at it.' },
  b3_desk_gav:{ pt: '...',
                en: '...' },

  // ---------- falas soltas: arquivo morto ----------
  b3_arq_1:   { pt: 'Arquivo morto.',
                en: 'Dead files.' },
  b3_arq_2:   { pt: 'Nome bonito pra porao.',
                en: 'Pretty name for a basement.' },
  b3_arq_3:   { pt: 'A, B, C. E. Aqui embaixo o D existe.',
                en: 'A, B, C. E. Down here the D exists.' },
  b3_arq_volta:{ pt: 'Eu andei menos do que isso na ida.',
                en: 'I walked less than this on the way in.' },

  // ---------- falas soltas: sete anos atras ----------
  b3_past_1:  { pt: 'Boa noite pra terminar cedo.',
                en: 'Good night to knock off early.' },
  b3_past_2:  { pt: 'Peguei o cara. Peguei o cara mesmo.',
                en: 'I got him. I actually got him.' },
  b3_past_3:  { pt: 'A luz da sala esta acesa. Ainda estao acordadas.',
                en: 'The front room light is on. They are still up.' },
  b3_home_1:  { pt: 'Cheguei.',
                en: 'I am home.' },
  b3_home_2:  { pt: 'Nem tirei o casaco e ja to com fome.',
                en: 'Coat is not even off and I am already hungry.' },
  b3_past_tel:{ pt: 'Meu telefone.',
                en: 'My phone.' },
  b3_past_tel2:{ pt: 'A essa hora so pode ser da delegacia.',
                en: 'At this hour it can only be the precinct.' },
  b3_past_sair:{ pt: 'Vou atender la fora. Ja volto.',
                en: 'I will take it outside. Back in a second.' },
  b3_past_dentro:{ pt: 'Aqui dentro nao da. Vou pra varanda.',
                en: 'Not in here. I will step out to the porch.' },
  b3_past_atende:{ pt: 'Alo.',
                en: 'Hello.' },
  b3_past_espera:{ pt: '...alo?',
                en: '...hello?' },
  b3_past_grito:{ pt: '—',
                en: '—' },
  b3_past_grito2:{ pt: 'JULIE—',
                en: 'JULIE—' },

  // ---------- falas soltas: a cela ----------
  b3_cell_1:  { pt: 'Custodia.',
                en: 'Holding.' },
  b3_cell_2:  { pt: 'E tem gente dentro.',
                en: 'And there is somebody in it.' },
  b3_cell_cig:{ pt: 'Sete anos.',
                en: 'Seven years.' },
  b3_cell_cig2:{ pt: 'Sete anos sem.',
                en: 'Seven years without.' },
  b3_cell_vazia:{ pt: 'Dois cigarros acesos. Da mesma marca.',
                en: 'Two cigarettes burning. Same brand.' },
  b3_cell_porta:{ pt: 'Ela nunca esteve trancada.',
                en: 'It was never locked.' },

  // ---------- a escada do cigarro: degraus 2 e 3 ----------
  // Degrau 1 (recusa seca) ja existe no Capitulo 2. Aqui a recusa ganha
  // pausa, e depois ele chega a TIRAR um do maco e devolver.
  cig_d2_a:   { pt: '...ah. Talvez.',            en: '...ah. Maybe.' },
  cig_d2_b:   { pt: 'Nao. Melhor nao.',          en: 'No. Better not.' },
  cig_d2_c:   { pt: 'Eu podia. Ninguem ia saber.', en: 'I could. Nobody would know.' },
  cig_d2_d:   { pt: 'Eu ia saber.',              en: 'I would know.' },
  cig_d3_a:   { pt: '...',                       en: '...' },
  cig_d3_b:   { pt: 'Nao hoje. Nao ainda.',      en: 'Not today. Not yet.' },
  cig_d5:     { pt: 'Mais um. So mais um.',      en: 'One more. Just one more.' },

  // ---------- o fim do capitulo: o nome ----------
  ch3_ask_name:  { pt: 'E o nome dela, senhor. Pro cartaz.',
                   en: 'And her name, sir. For the poster.' },
  ch3_say:       { pt: 'Dizer o nome dela',      en: 'Say her name' },
  ch3_dont:      { pt: 'Nao dizer',              en: 'Say nothing' },
  ch3_said:      { pt: 'Jenna.',                 en: 'Jenna.' },
  ch3_said_2:    { pt: 'O nome dela e Jenna.',   en: 'Her name is Jenna.' },
  ch3_clerk_ok:  { pt: 'Obrigado, senhor. Boa noite.',
                   en: 'Thank you, sir. Good night.' },
  ch3_not_said:  { pt: 'Deixa pra proxima.',     en: 'Some other time.' },
  ch3_clerk_no:  { pt: 'Como o senhor preferir. Boa noite, David.',
                   en: 'As you wish. Good night, David.' },
  ch3_end_1:     { pt: 'Chamaram a senha dele.', en: 'They called his number.' },
  ch3_end_2:     { pt: 'E ele nao estava mais la.', en: 'And he was not there anymore.' },
};

export function t(key) {
  const e = STR[key];
  if (!e) return '[' + key + ']';
  return e[lang] !== undefined ? e[lang] : e.pt;
}

// ---------------------------------------------------------------------------
// NARRACAO DE ABERTURA
//
// Texto e tempos vindos de "roteiro legenda.txt", escrito pelo Luiz.
// Os tempos sao os do roteiro: cada legenda entra na marca dele e fica na
// tela ate a proxima entrar (assim nao pisca buraco entre as falas).
//
// ESCALA AUTOMATICA: estes tempos foram escritos para uma gravacao de
// NARRATION_REF_DUR segundos. Se o arquivo em assets/audio/ tiver outra
// duracao, a cutscene reescalona tudo na mesma proporcao — ver subScale em
// js/systems/cutscene.js. Se a gravacao bater com a referencia, a escala e
// 1.0 e nada muda.
//
// Para reescrever a mao: t = segundo em que a legenda aparece, d = quanto
// tempo ela fica na tela.
// ---------------------------------------------------------------------------

export const NARRATION_REF_DUR = 76.5;

// As pausas do roteiro sao respeitadas: a legenda SAI da tela no silencio
// em vez de ficar segurando ate a proxima. E o que faz o texto respirar
// junto com a voz em vez de parecer um bloco parado.
export const NARRATION = [
  { t:  0.0, d: 2.5, pt: 'Engraçado...',
                     en: 'Funny...' },
  { t:  3.2, d: 4.0, pt: 'Passei metade da vida perseguindo monstros.',
                     en: 'I spent half my life chasing monsters.' },
  { t:  8.2, d: 6.8, pt: 'E a outra metade tentando descobrir por que eles nunca saíam do meu caminho.',
                     en: 'And the other half trying to work out why they never got out of my way.' },
  { t: 16.2, d: 2.3, pt: 'Demorei anos pra entender.',
                     en: 'It took me years to understand.' },
  { t: 20.0, d: 3.5, pt: 'Eles... eles nunca estiveram na minha frente.',
                     en: 'They... they were never in front of me.' },
  { t: 24.2, d: 2.3, pt: 'Eles vinham comigo.',
                     en: 'They were walking with me.' },
  { t: 28.0, d: 4.0, pt: 'Tem gente que acredita que o tempo cura...',
                     en: 'Some people believe time heals...' },
  { t: 32.8, d: 1.0, pt: 'Mentira.',
                     en: 'It does not.' },
  { t: 34.5, d: 4.7, pt: 'O tempo só aprende a esconder as feridas... até você olhar no espelho.',
                     en: 'Time only learns to hide the wounds... until you look in a mirror.' },
  { t: 40.5, d: 3.0, pt: 'Tem noites em que eu ainda escuto.',
                     en: 'There are nights I still hear it.' },
  { t: 44.5, d: 1.7, pt: 'Não são vozes...',
                     en: 'Not voices...' },
  { t: 47.0, d: 1.5, pt: 'Silêncios.',
                     en: 'Silences.' },
  { t: 49.5, d: 2.7, pt: 'Os silêncios que eu deixei pra trás.',
                     en: 'The silences I left behind.' },
  { t: 53.0, d: 4.2, pt: 'Não... Não existe aposentadoria pra consciência.',
                     en: 'No... There is no retirement for a conscience.' },
  { t: 58.0, d: 2.5, pt: 'Ela bate ponto todos os dias.',
                     en: 'It clocks in every single day.' },
  { t: 62.0, d: 6.2, pt: 'Hoje, talvez seja o primeiro dia em muito tempo que eu parei de fugir.',
                     en: 'Tonight might be the first time in a long while that I stopped running.' },
  { t: 69.2, d: 4.0, pt: 'Se existe uma conta esperando por mim...',
                     en: 'If there is a bill waiting for me...' },
  { t: 74.2, d: 2.3, pt: 'Já passou da hora de pagar.',
                     en: 'It is long past time I paid it.' },
];

// So vale quando NAO existe arquivo de audio. Com audio, o jogo usa a
// duracao real do arquivo.
export const NARRATION_END = NARRATION_REF_DUR;

// ---------------------------------------------------------------------------
// MONOLOGOS DE EXAMINAR — testam o sistema de dialogo antes de existir NPC.
// Formato: array de falas. speaker null = pensamento do detetive.
// ---------------------------------------------------------------------------

export const LINES = {
  alley_dumpster: [
    { pt: 'Lixo de bar. Vidro, guardanapo, nada que preste.',
      en: 'Bar trash. Glass, napkins, nothing worth a damn.' },
    { pt: 'Se tem alguem morando aqui, saiu com pressa.',
      en: 'If somebody was sleeping here, they left in a hurry.' },
  ],
  alley_poster: [
    { pt: 'Um cartaz de desaparecida. A chuva ja comeu metade do rosto.',
      en: 'A missing person poster. The rain ate half the face already.' },
    { pt: 'A data e de tres semanas atras. Ninguem arrancou.',
      en: 'Dated three weeks ago. Nobody tore it down.' },
    { pt: 'Ninguem arranca o que ninguem le.',
      en: 'Nobody tears down what nobody reads.' },
  ],
  alley_puddle: [
    { pt: 'A poca me devolve uma cara que eu nao reconheco mais.',
      en: 'The puddle hands me back a face I do not recognize anymore.' },
  ],
  alley_lamp: [
    { pt: 'O poste pisca. A cidade inteira pisca, so ninguem repara.',
      en: 'The lamp flickers. The whole city flickers, nobody notices.' },
  ],
  alley_door: [
    { pt: 'A porta dos fundos. Sem cadeado.',
      en: 'The back door. No padlock.' },
    { pt: 'Um bar fechado ha seis anos nao devia estar destrancado.',
      en: 'A bar shut for six years has no business being unlocked.' },
  ],
  bar_chairs: [
    { pt: 'Cadeiras empilhadas. Empilhadas direito, uma por uma.',
      en: 'Chairs stacked. Stacked properly, one by one.' },
    { pt: 'Quem fecha um bar para sempre nao arruma as cadeiras.',
      en: 'Nobody closing a bar for good bothers stacking the chairs.' },
  ],
  bar_counter: [
    { pt: 'O balcao esta limpo. Sem poeira.',
      en: 'The counter is clean. No dust.' },
    { pt: 'Seis anos de po nao somem sozinhos.',
      en: 'Six years of dust does not just walk away.' },
  ],
  bar_phone: [
    { pt: 'Um telefone de parede. O fio esta cortado.',
      en: 'A wall phone. The cord is cut.' },
    { pt: 'Cortado ha tempo. O corte ja enferrujou.',
      en: 'Cut a long time ago. The cut has rusted over.' },
    { pt: 'Entao de onde veio a ligacao?',
      en: 'So where did the call come from?' },
  ],
  wh_gate: [
    { pt: 'Portao de enrolar. Cadeado do lado de fora.',
      en: 'Roller gate. Padlock on the outside.' },
    { pt: 'Nao fui eu que fechei.', en: 'I did not close it.' },
  ],
  wh_sky: [
    { pt: 'Claraboia quebrada. Uns oito metros de altura.',
      en: 'Broken skylight. Twenty-five feet up.' },
    { pt: 'Se eu tivesse vinte anos a menos, talvez.',
      en: 'Twenty years ago, maybe.' },
  ],
  bar_wreck: [
    { pt: 'A parede foi arrebentada de dentro para fora.',
      en: 'The wall was broken from the inside out.' },
    { pt: 'As farpas apontam para ca. Alguem bateu daquele lado.',
      en: 'The splinters point this way. Something struck from the other side.' },
    { pt: 'E do outro lado nao tem comodo nenhum. So parede.',
      en: 'And on the other side there is no room. Just wall.' },
  ],
  bar_mirror: [
    { pt: 'O espelho atras das garrafas esta trincado no meio.',
      en: 'The mirror behind the bottles is cracked down the middle.' },
    { pt: 'Nao olho. Hoje nao.',
      en: 'I do not look. Not tonight.' },
  ],

  // =====================================================================
  // CAPITULO 2
  // =====================================================================

  c2_forklift: [
    { pt: 'Chave na ignição. Bateria seca há uns dez anos.',
      en: 'Key in the ignition. Battery dead about ten years.' },
    { pt: 'Alguém saiu daqui com pressa. Ou nunca voltou.',
      en: 'Somebody left in a hurry. Or never came back.' },
  ],
  c2_dockgate: [
    { pt: 'Trancado por fora. Igual todos os outros.',
      en: 'Locked from outside. Like all the others.' },
    { pt: 'Estou começando a achar que "por fora" é o único lado que existe.',
      en: 'I am starting to think "outside" is the only side there is.' },
  ],
  c2_clock: [
    { pt: 'Relógio de ponto. Parado.',
      en: 'Punch clock. Stopped.' },
    { pt: '02h14.',
      en: '2:14 AM.' },
  ],
  c2_pallets: [
    { pt: 'Foi daqui que saiu meu pedaço de pau.',
      en: 'This is where my piece of wood came from.' },
    { pt: 'Ou pelo menos é o que eu prefiro acreditar.',
      en: 'Or that is what I would rather believe.' },
  ],
  c2_photo: [
    { pt: 'Foto do turno da noite. O vidro está trincado sobre um único rosto.',
      en: 'Night-shift photograph. The glass is cracked over a single face.' },
    { pt: 'Sou eu, ao fundo. Usando este casaco. Eu nunca trabalhei aqui.',
      en: 'That is me in the back. Wearing this coat. I never worked here.' },
  ],
  c2_cabinet: [
    { pt: 'Pastas de A a C. E de E até Z.',
      en: 'Files from A to C. And from E to Z.' },
    { pt: 'Só a gaveta do D não está aqui.',
      en: 'Only the D drawer is missing.' },
  ],
  c2_mug: [
    { pt: 'Café pela metade. Ainda morno.',
      en: 'Half a cup of coffee. Still warm.' },
    { pt: 'Isso não é possível.',
      en: 'That is not possible.' },
  ],
  c2_board: [
    { pt: 'Quadro de avisos. Aviso de segurança de dez anos atrás.',
      en: 'Notice board. A safety notice from ten years ago.' },
    { pt: '"MANTENHA AS SAIDAS DESOBSTRUIDAS". Boa piada.',
      en: '"KEEP EXITS CLEAR". Good one.' },
  ],
  c2_rack: [
    { pt: 'Isso desabou de dentro para fora. Igual a parede do bar.',
      en: 'This came down from the inside out. Same as the wall in the bar.' },
  ],
  c2_boxes: [
    { pt: 'Todas as caixas estão vazias. Todas lacradas.',
      en: 'Every box is empty. Every box is sealed.' },
    { pt: 'Ninguém lacra caixa vazia.',
      en: 'Nobody seals an empty box.' },
  ],
  c2_dragmark: [
    { pt: 'Alguma coisa foi arrastada por aqui. Pesado.',
      en: 'Something was dragged through here. Something heavy.' },
    { pt: 'E não faz muito tempo.',
      en: 'And not long ago.' },
  ],
  c2_lockers: [
    { pt: 'Marcos. Elaine. Betinho.',
      en: 'Marcos. Elaine. Betinho.' },
    { pt: 'Gente que teve nome. Deve ter ido embora.',
      en: 'People who had names. They must have left.' },
  ],
  c2_radio: [
    { pt: 'Ainda liga.',
      en: 'It still turns on.' },
    { pt: 'Estática. Em todas as estações.',
      en: 'Static. On every station.' },
    { pt: 'Achei que fosse gostar mais do silêncio.',
      en: 'I thought I liked silence more than this.' },
  ],
  c2_roster: [
    { pt: 'Escala do mês. Todo mundo com folga marcada.',
      en: 'This month’s roster. Everyone has a day off marked.' },
    { pt: 'Ninguém marcou volta.',
      en: 'Nobody marked a return.' },
  ],
  c2_coffee: [
    { pt: 'Sem copo. Sem energia. Sem chance.',
      en: 'No cup. No power. No chance.' },
  ],
  c2_locknote: [
    { pt: '"Volto às seis."',
      en: '"Back at six."' },
    { pt: 'Todo mundo volta às seis.',
      en: 'Everybody is back at six.' },
  ],
  c2_thermo: [
    { pt: 'Marca dois graus negativos.',
      en: 'It reads two below.' },
    { pt: 'O compressor está desligado há uma década.',
      en: 'The compressor has been off for a decade.' },
  ],
  c2_hooks: [
    { pt: 'Fileira de ganchos. Vinte e três.',
      en: 'A row of hooks. Twenty-three.' },
    { pt: 'Contei duas vezes. Deu vinte e quatro na segunda.',
      en: 'I counted twice. The second time it was twenty-four.' },
  ],
  c2_panel: [
    { pt: 'Disjuntor geral desligado. Selado com arame.',
      en: 'Main breaker off. Sealed with wire.' },
    { pt: 'Então de onde vem esse zumbido?',
      en: 'So where is that hum coming from?' },
  ],
  c2_overall: [
    { pt: 'Macacão de mecânico. Do meu tamanho.',
      en: 'A mechanic’s overall. My size.' },
    { pt: 'Claro que é do meu tamanho.',
      en: 'Of course it is my size.' },
  ],
  c2_boiler: [
    { pt: 'Caldeira fria. Fria de anos, não de horas.',
      en: 'Cold boiler. Cold for years, not hours.' },
    { pt: 'E mesmo assim o cano treme.',
      en: 'And the pipe is trembling anyway.' },
  ],
  c2_switchboard: [
    { pt: 'Uma mesa telefônica. Dessas de plugue e cabo.',
      en: 'A switchboard. The old plug-and-cord kind.' },
    { pt: 'Nenhum dos cabos vai a lugar nenhum.',
      en: 'None of the cords go anywhere.' },
  ],
  c2_gavetaD: [
    { pt: 'A gaveta do D. Aberta, e vazia.',
      en: 'The D drawer. Open, and empty.' },
    { pt: 'Tinha alguma coisa aqui. Não tem mais.',
      en: 'There was something in here. Not anymore.' },
  ],
  c2_railing: [
    { pt: 'Daqui dá pra ver o galpão inteiro.',
      en: 'From up here you can see the whole warehouse.' },
    { pt: 'E o galpão inteiro dá pra me ver.',
      en: 'And the whole warehouse can see me.' },
  ],
  c2_dockdoor: [
    { pt: 'Doca 3. Foi essa que estava marcada a lápis no mapa.',
      en: 'Dock 3. That is the one pencilled on the map.' },
    { pt: 'Alguém marcou a minha saída antes de eu chegar.',
      en: 'Somebody marked my way out before I got here.' },
  ],
  c2_infirmary_bed: [
    { pt: 'Correias fechadas sobre uma maca vazia.',
      en: 'Straps buckled over an empty cot.' },
    { pt: 'Tem o contorno de alguém que tentou levantar.',
      en: 'There is the outline of somebody who tried to get up.' },
    { pt: 'Eu já vi esse tipo de esforço tarde demais.',
      en: 'I have seen that kind of effort too late before.' },
  ],
  c2_infirmary_sink: [
    { pt: 'Marcas de dedos ao redor do ralo.',
      en: 'Finger marks around the drain.' },
    { pt: 'Quem lavou as mãos aqui não conseguiu terminar.',
      en: 'Whoever washed their hands here could not finish.' },
  ],
  c2_evidence_bags: [
    { pt: 'Sacos de evidência numerados. Nenhum tem número de caso.',
      en: 'Numbered evidence bags. None has a case number.' },
    { pt: 'Objeto sem caso vira só coisa guardada. Pessoa sem caso vira estatística.',
      en: 'An object without a case is just stored property. A person without one becomes a statistic.' },
  ],
  c2_evidence_photos: [
    { pt: 'Três fotos do mesmo lugar. O rosto foi raspado nas três.',
      en: 'Three photographs of the same place. The face was scraped from all three.' },
    { pt: 'Não é pra esconder quem morreu. É pra esconder quem olhou.',
      en: 'It is not hiding who died. It is hiding who looked.' },
  ],
  c2_comms_board: [
    { pt: 'Centenas de linhas. Todas cortadas depois do plugue.',
      en: 'Hundreds of lines. Every one cut past the plug.' },
    { pt: 'O painel pode receber uma chamada. Só não pode mandar ajuda.',
      en: 'The board can receive a call. It just cannot send for help.' },
  ],
  c2_comms_tape: [
    { pt: 'O gravador gira sem fita.',
      en: 'The recorder turns without tape.' },
    { pt: 'Mesmo assim, eu escuto alguém respirando entre as voltas.',
      en: 'Even so, I hear somebody breathing between each turn.' },
  ],
  c2_security_window: [
    { pt: 'O corredor está do outro lado do vidro.',
      en: 'The corridor is on the other side of the glass.' },
    { pt: 'Meu reflexo está olhando para a porta que eu ainda não abri.',
      en: 'My reflection is watching the door I have not opened yet.' },
  ],

  // =====================================================================
  // CAPITULO 3 — o que ele pode examinar
  //
  // REGRA: ele comenta a CONVENIENCIA, porque piada e a defesa dele. Mas
  // nunca junta duas migalhas em voz alta e nunca diz "isso e impossivel"
  // duas vezes seguidas. No instante em que ele suspeitar em voz alta, o
  // jogador para de saber mais do que ele.
  // =====================================================================

  c3_step: [
    { pt: 'O terceiro degrau continua solto.',
      en: 'The third step is still loose.' },
    { pt: 'Sete anos, e ninguém consertou.',
      en: 'Seven years, and nobody fixed it.' },
    { pt: 'Ou consertaram, e voltou a soltar. Dá no mesmo.',
      en: 'Or they did, and it came loose again. Same thing.' },
  ],
  c3_wall: [
    { pt: 'Quadro de homenagens. Todo mundo que passou por aqui.',
      en: 'The wall of honour. Everyone who ever worked here.' },
    { pt: 'A minha ainda está.',
      en: 'Mine is still up.' },
  ],
  c3_clock: [
    { pt: 'Duas e quatorze.',
      en: 'Two fourteen.' },
    { pt: 'O ponteiro de segundos está andando.',
      en: 'The second hand is moving.' },
  ],
  c3_cases: [
    { pt: 'Quadro de casos do mês.',
      en: 'The month’s case board.' },
    { pt: 'Todos com data de sete anos atrás.',
      en: 'Every one of them dated seven years ago.' },
  ],
  c3_blotter: [
    { pt: 'Livro de ocorrências. A última é das duas e vinte.',
      en: 'The blotter. The last entry is from two twenty.' },
    { pt: '"Homem entrando em bar fechado. Sem queixa."',
      en: '"Man entering a closed bar. No complaint filed."' },
  ],
  c3_coffee: [
    { pt: 'Máquina de café. Essa aqui funciona.',
      en: 'Coffee machine. This one works.' },
    { pt: 'A do galpão não funcionava. Essa funciona.',
      en: 'The one at the warehouse did not. This one does.' },
  ],
  c3_desk: [
    { pt: 'Minha mesa. Poeira em tudo.',
      en: 'My desk. Dust on everything.' },
    { pt: 'Menos na cadeira.',
      en: 'Except the chair.' },
  ],
  c3_ashtray: [
    { pt: 'O cinzeiro está cheio.',
      en: 'The ashtray is full.' },
    { pt: 'Sete anos de poeira em cima da mesa, e o cinzeiro está cheio.',
      en: 'Seven years of dust on this desk, and the ashtray is full.' },
  ],
  c3_badge: [
    { pt: 'Meu número, na parede.',
      en: 'My number, on the wall.' },
    { pt: 'Ainda não deram pra ninguém.',
      en: 'They never gave it to anyone else.' },
  ],
  c3_labels: [
    { pt: 'Etiquetas: A. B. C.',
      en: 'Labels: A. B. C.' },
    { pt: 'E.',
      en: 'E.' },
    { pt: 'Aqui embaixo o D existe. Lá em cima não existia.',
      en: 'Down here the D exists. Upstairs it did not.' },
  ],
  c3_boxes: [
    { pt: 'Caixa de objetos apreendidos.',
      en: 'A box of seized property.' },
    { pt: 'Coisas que pertenceram a alguém. Etiqueta, número, prateleira.',
      en: 'Things that belonged to somebody. Tag, number, shelf.' },
    { pt: 'É o que sobra.',
      en: 'That is what is left.' },
  ],
  c3_bulb: [
    { pt: 'Essa não pisca. Só está fraca.',
      en: 'This one does not flicker. It is just weak.' },
    { pt: 'Prefiro as que piscam. Pelo menos avisam.',
      en: 'I prefer the ones that flicker. At least they warn you.' },
  ],
  c3_past_precinct: [
    { pt: 'Apaguei a luz da minha sala faz dez minutos.',
      en: 'I turned my office light off ten minutes ago.' },
    { pt: 'Amanhã eu assino o resto.',
      en: 'I will sign the rest tomorrow.' },
  ],
  c3_past_car: [
    { pt: 'Meu carro. Ainda anda.',
      en: 'My car. Still runs.' },
    { pt: 'Estacionei torto de novo. Ela vai reclamar.',
      en: 'Parked it crooked again. She is going to complain.' },
  ],
  c3_past_door: [
    { pt: 'A porta está destrancada.',
      en: 'The door is unlocked.' },
    { pt: 'Ela sempre deixa destrancada quando eu estou pra chegar.',
      en: 'She always leaves it unlocked when I am on my way.' },
  ],
};

// ---------------------------------------------------------------------------
// CONVERSAS COM NPC — arvore com escolhas.
//
// Cada no tem falas e, opcionalmente, escolhas. Escolha sem `to` encerra.
// Ninguem neste jogo pergunta o nome do detetive: todos ja sabem. Isso e
// regra, nao esquecimento (ver "AS MIGALHAS" no ROTEIRO.txt).
// ---------------------------------------------------------------------------

export const TALKS = {
  vigia: {
    speaker: { pt: 'ZELADOR', en: 'CARETAKER' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: 'O senhor é da inspeção? Avisaram que vinha alguém hoje.',
            en: 'Are you the inspector? They said somebody was coming today.' },
        ],
        choices: [
          { pt: 'Que dia é hoje?', en: 'What day is it?', to: 'dia' },
          { pt: 'Quem trabalha aqui?', en: 'Who works here?', to: 'gente' },
          { pt: 'Você me viu chegar?', en: 'Did you see me come in?', to: 'chegar' },
          // So aparece depois que ele junta o telefone com o relogio de ponto.
          { pt: 'O relógio de ponto parou às duas e quatorze.',
            en: 'The punch clock stopped at two fourteen.', to: 'relogio', req: 'ded_hora' },
          // So aparece depois que ele junta as duas pessoas que sabiam o nome.
          { pt: 'Ninguém aqui me perguntou o nome.',
            en: 'Nobody here asked me my name.', to: 'nome', req: 'ded_nome' },
        ],
      },
      dia: {
        lines: [
          { pt: 'Terça.', en: 'Tuesday.' },
          { pt: 'ME|Terça de que ano?', en: 'ME|Tuesday of what year?' },
          { pt: '(ele sorri) Engraçado o senhor.', en: '(he smiles) You are a funny one.' },
        ],
        press: 'dia2',
        back: 'a',
      },
      dia2: {
        lines: [
          { pt: 'ME|Terça você já disse. Eu perguntei o ano.',
            en: 'ME|You already said Tuesday. I asked for the year.' },
          { pt: '(ele para de esfregar)', en: '(he stops mopping)' },
          { pt: 'O senhor tem que assinar na entrada.', en: 'You have to sign in at the gate.' },
          { pt: 'ME|Eu não assinei nada.', en: 'ME|I did not sign anything.' },
          { pt: 'Assinou sim. Está lá, com a sua letra.', en: 'You did. It is there, in your hand.' },
        ],
        back: 'a',
      },
      relogio: {
        lines: [
          { pt: 'Parou não, senhor. Está esperando.', en: 'It did not stop, sir. It is waiting.' },
          { pt: 'ME|Esperando o quê?', en: 'ME|Waiting for what?' },
          { pt: 'O turno virar.', en: 'For the shift to turn over.' },
        ],
        back: 'a',
      },
      nome: {
        lines: [
          { pt: '(ele continua esfregando o mesmo ponto do chão)',
            en: '(he keeps scrubbing the same patch of floor)' },
          { pt: 'Aqui ninguém precisa perguntar, senhor.', en: 'Nobody needs to ask here, sir.' },
          { pt: 'A gente só trabalha com quem está na escala.',
            en: 'We only work with whoever is on the roster.' },
        ],
        back: 'a',
      },
      gente: {
        lines: [
          { pt: 'Nós todos. Marcos na doca, Elaine no escritório. O Betinho entra às seis.',
            en: 'All of us. Marcos on the dock, Elaine in the office. Betinho clocks in at six.' },
          { pt: 'ME|E onde eles estão agora?', en: 'ME|And where are they now?' },
          { pt: 'No turno deles, ora.', en: 'On their shift, where else.' },
        ],
        back: 'a',
      },
      chegar: {
        lines: [
          { pt: 'O senhor chegou sozinho. Fui eu que abri o portão.',
            en: 'You came in on your own. I opened the gate for you.' },
          { pt: 'ME|O portão está trancado por fora.', en: 'ME|The gate is padlocked from outside.' },
          { pt: 'Então está tudo certo.', en: 'Then everything is in order.' },
        ],
        back: 'a',
      },
      fim: {
        lines: [
          { pt: 'Boa noite, David.', en: 'Good night, David.' },
        ],
      },
    },
  },

  // A TELEFONISTA. Ela e a origem da ligacao das 2h14 — e a resposta que ela
  // da e a maior pista do jogo, dita em tres palavras, sem explicar nada.
  operadora: {
    speaker: { pt: 'TELEFONISTA', en: 'OPERATOR' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: 'Um momento, vou transferir.', en: 'One moment, I will put you through.' },
          { pt: 'ME|Transferir pra quem?', en: 'ME|Put me through to who?' },
          { pt: '(sem olhar) Pro senhor.', en: '(without looking up) To you, sir.' },
        ],
        choices: [
          { pt: 'Quem foi que me ligou?', en: 'Who called me?', to: 'quem' },
          { pt: 'Que lugar é este?', en: 'What is this place?', to: 'lugar' },
          { pt: 'Esses cabos não estão ligados em nada.',
            en: 'Those cords are not plugged into anything.', to: 'cabos' },
          // So aparece depois que ele junta a letra do bilhete com a pagina
          // que ele nao escreveu — ou seja, so quando ja esta rachando.
          { pt: 'Tem uma letra no meu caderno que não é minha.',
            en: 'There is handwriting in my notebook that is not mine.',
            to: 'letra', req: 'ded_letra' },
        ],
      },
      quem: {
        lines: [
          { pt: 'O senhor mesmo.', en: 'You did.' },
          { pt: 'O senhor foi o único que atendeu.', en: 'You were the only one who answered.' },
        ],
        press: 'quem2',
        back: 'a',
      },
      quem2: {
        lines: [
          { pt: 'ME|Isso não é resposta.', en: 'ME|That is not an answer.' },
          { pt: '(ela puxa um cabo e olha para ele pela primeira vez)',
            en: '(she pulls a cord and looks at him for the first time)' },
          { pt: 'A chamada é sempre a mesma, senhor. Sempre no mesmo minuto.',
            en: 'It is always the same call, sir. Always at the same minute.' },
          { pt: 'ME|E o que ela diz?', en: 'ME|And what does it say?' },
          { pt: 'O senhor nunca ficou para ouvir.', en: 'You never stayed to listen.' },
        ],
        back: 'a',
      },
      letra: {
        lines: [
          { pt: 'É sim, senhor.', en: 'It is yours, sir.' },
          { pt: 'ME|Não é.', en: 'ME|It is not.' },
          { pt: 'Era.', en: 'It was.' },
        ],
        back: 'a',
      },
      lugar: {
        lines: [
          { pt: 'É a central, senhor. Sempre foi.', en: 'It is the exchange, sir. It always was.' },
          { pt: 'ME|Central de quê?', en: 'ME|Exchange for what?' },
          { pt: 'De chamadas que ninguém atende.', en: 'For calls nobody answers.' },
        ],
        back: 'a',
      },
      cabos: {
        lines: [
          { pt: 'Estão sim. O senhor é que não vê a outra ponta.',
            en: 'They are. You just cannot see the other end.' },
        ],
        back: 'a',
      },
      fim: {
        lines: [
          { pt: 'Se o senhor lembrar de alguma coisa, é só chamar.',
            en: 'If you remember anything, just call.' },
        ],
      },
    },
  },

  // =====================================================================
  // CAPITULO 3
  //
  // O capitulo inteiro e conversa, entao estas arvores sao as maiores do
  // jogo. REGRA DE ESCRITA: o nome da filha NAO aparece escrito em lugar
  // nenhum ate a ultima cena. Todo mundo diz "ela", "a menina", "sua
  // filha". O jogador quer ler e nao consegue — exatamente como ele nao
  // consegue dizer.
  // =====================================================================

  // ---------------------------------------------------------------------
  // O PLANTONISTA — a portaria. Educado, sem pressa, e nao pergunta quem
  // ele e. Pede a arma com formulario.
  // ---------------------------------------------------------------------
  plantonista: {
    speaker: { pt: 'PLANTONISTA', en: 'DESK OFFICER' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: 'Boa noite. A arma no escaninho, por favor.',
            en: 'Good evening. Weapon in the locker, please.' },
        ],
        choices: [
          { pt: 'Eu não sou mais daqui.', en: 'I do not work here anymore.', to: 'naosou' },
          { pt: 'Quem está de plantão hoje?', en: 'Who is on duty tonight?', to: 'plantao' },
          { pt: 'Preciso de um arquivo do subsolo.', en: 'I need a file from the basement.', to: 'arquivo' },
          { pt: 'Quem é o homem sentado ali?',
            en: 'Who is the man sitting over there?', to: 'credor' },
        ],
      },
      naosou: {
        lines: [
          { pt: 'A arma no escaninho, por favor.',
            en: 'Weapon in the locker, please.' },
        ],
        press: 'naosou2',
        back: 'a',
      },
      naosou2: {
        lines: [
          { pt: 'ME|Eu entreguei o distintivo nesse balcão.',
            en: 'ME|I handed in my badge at this desk.' },
          { pt: '(ele empurra o formulário sem levantar os olhos)',
            en: '(he slides the form across without looking up)' },
          { pt: 'Escaninho duzentos e quatorze, senhor. É o do senhor.',
            en: 'Locker two fourteen, sir. That one is yours.' },
        ],
        back: 'a',
      },
      plantao: {
        lines: [
          { pt: 'O time todo. Noite cheia.',
            en: 'The whole team. Busy night.' },
          { pt: 'ME|Cheia de quê?', en: 'ME|Busy with what?' },
          { pt: 'Do de sempre.', en: 'The usual.' },
        ],
        back: 'a',
      },
      arquivo: {
        lines: [
          { pt: 'Subsolo menos um. O senhor sabe o caminho.',
            en: 'Basement, level one. You know the way.' },
        ],
        back: 'a',
      },
      credor: {
        lines: [
          { pt: '(ele olha para as cadeiras e volta para o papel)',
            en: '(he glances at the chairs and goes back to his paperwork)' },
          { pt: 'Esse está esperando a vez dele.',
            en: 'That one is waiting his turn.' },
        ],
        press: 'credor2',
        back: 'a',
      },
      credor2: {
        lines: [
          { pt: 'ME|Esperando pra ser atendido por quem?',
            en: 'ME|Waiting to be seen by whom?' },
          { pt: 'Ninguém marca hora aqui, senhor. A senha chama sozinha.',
            en: 'Nobody books a time here, sir. The number calls itself.' },
        ],
        back: 'a',
      },
      fim: {
        lines: [
          { pt: 'Qualquer coisa, é só chamar.',
            en: 'Anything you need, just call.' },
        ],
      },
    },
  },

  // ---------------------------------------------------------------------
  // MICHAEL — o parceiro. A UNICA conversa quente do jogo.
  //
  // Trata o David como quem se viu ontem: sem espanto, sem pesames, sem o
  // tom que todo mundo usa com ele ha sete anos. NADA de sobrenatural
  // nesta conversa — ela e a unica fonte confiavel do capitulo, e tem que
  // soar confiavel. O horror e o jogador confiar nela e depois ver a
  // plaquinha da mesa.
  // ---------------------------------------------------------------------
  michael: {
    speaker: { pt: 'MICHAEL', en: 'MICHAEL' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: 'Você está ensopado.', en: 'You are soaked.' },
          { pt: 'ME|Está chovendo.', en: 'ME|It is raining.' },
          { pt: 'Está chovendo há sete anos, então.',
            en: 'Then it has been raining for seven years.' },
        ],
        choices: [
          { pt: 'Me conta aquela noite.', en: 'Tell me about that night.', to: 'noite' },
          { pt: 'O que aconteceu com o Carlos?', en: 'What happened to Carlos?', to: 'carlos' },
          { pt: 'Por que tiraram meu distintivo?', en: 'Why did they take my badge?', to: 'distintivo' },
          { pt: 'Por que nunca acharam ela?', en: 'Why did they never find her?', to: 'menina' },
          { pt: 'Você ainda trabalha aqui?', en: 'Do you still work here?', to: 'aqui' },
          { pt: 'O relógio dessa parede está parado em duas e quatorze.',
            en: 'The clock on that wall is stopped at two fourteen.',
            to: 'relogio', req: 'ded_hora' },
        ],
      },
      noite: {
        lines: [
          { pt: 'Você prendeu o Carlos às oito e doze e foi pra casa feliz da vida.',
            en: 'You booked Carlos at eight twelve and went home happy as hell.' },
          { pt: 'ME|E depois?', en: 'ME|And then?' },
          { pt: 'Depois o telefone daqui tocou, duas e quatorze, e era você.',
            en: 'Then the phone here rang at two fourteen, and it was you.' },
          { pt: 'Você não conseguia falar. Só respirava.',
            en: 'You could not talk. You were just breathing.' },
          { pt: 'Eu peguei o carro. Quando eu cheguei a porta estava aberta.',
            en: 'I took the car. When I got there the door was open.' },
          { pt: 'ME|E eu?', en: 'ME|And me?' },
          { pt: 'Você estava sentado na varanda. Com o telefone ainda na mão.',
            en: 'You were sitting on the porch. Still holding the phone.' },
        ],
        press: 'noite2',
        back: 'a',
      },
      noite2: {
        lines: [
          { pt: 'ME|Michael. Quem me ligou?',
            en: 'ME|Michael. Who called me?' },
          { pt: '(ele passa a mão na nuca)', en: '(he rubs the back of his neck)' },
          { pt: 'A companhia disse que naquela madrugada não entrou chamada nenhuma no seu número.',
            en: 'The phone company said no call came into your number that night.' },
          { pt: 'ME|Eu atendi.', en: 'ME|I answered it.' },
          { pt: 'Eu sei que você atendeu. Eu vi o telefone na sua mão.',
            en: 'I know you did. I saw the phone in your hand.' },
          { pt: 'Nunca conseguimos explicar isso, e eu parei de tentar.',
            en: 'We never explained it, and I stopped trying.' },
        ],
        back: 'a',
      },
      carlos: {
        lines: [
          { pt: 'Está aqui embaixo. Chegou hoje à noite.',
            en: 'He is downstairs. Came in tonight.' },
          { pt: 'ME|Aqui embaixo.', en: 'ME|Downstairs.' },
          { pt: 'Transferência. Audiência de manhã. Passa a noite na custódia e segue às sete.',
            en: 'Transfer. Hearing in the morning. He sits in holding overnight and moves on at seven.' },
          { pt: '(ele olha para você)', en: '(he looks at you)' },
          { pt: 'Eu ia te ligar amanhã. Você chegou antes.',
            en: 'I was going to call you tomorrow. You got here first.' },
        ],
        press: 'carlos2',
        back: 'a',
      },
      carlos2: {
        lines: [
          { pt: 'ME|Michael. Ele estava preso naquela noite.',
            en: 'ME|Michael. He was already locked up that night.' },
          { pt: 'Estava. Você mesmo o algemou às oito e doze.',
            en: 'He was. You cuffed him yourself at eight twelve.' },
          { pt: 'ME|Então a vingança nunca fechou.',
            en: 'ME|So the revenge theory never held.' },
          { pt: 'Nunca fechou, David. Nunca fechou pra ninguém aqui.',
            en: 'It never held, David. It never held for anybody here.' },
          { pt: 'Foi você que precisou que fechasse.',
            en: 'You were the one who needed it to.' },
        ],
        back: 'a',
      },
      distintivo: {
        lines: [
          { pt: 'Porque você foi atrás dele por fora, e todo mundo sabia.',
            en: 'Because you went after him off the books, and everybody knew.' },
          { pt: 'ME|Eu não encostei nele.', en: 'ME|I never laid a hand on him.' },
          { pt: 'Eu sei. Isso nunca foi o problema.',
            en: 'I know. That was never the problem.' },
          { pt: 'O problema é que você não parou. Nem pra dormir.',
            en: 'The problem is you did not stop. Not even to sleep.' },
        ],
        back: 'a',
      },
      menina: {
        lines: [
          { pt: '(ele demora)', en: '(he takes a while)' },
          { pt: 'A gente procurou onze meses. Eu estava em todas.',
            en: 'We searched for eleven months. I was on every one of them.' },
          { pt: 'ME|Onze meses e nada.', en: 'ME|Eleven months and nothing.' },
          { pt: 'Nada é diferente de morta, David. Você sabe disso melhor que eu.',
            en: 'Nothing is not the same as dead, David. You know that better than I do.' },
        ],
        press: 'menina2',
        back: 'a',
      },
      menina2: {
        lines: [
          { pt: 'ME|Você acha que ela está viva.',
            en: 'ME|You think she is alive.' },
          { pt: 'Eu acho que você nunca teve um corpo pra enterrar.',
            en: 'I think you never had a body to bury.' },
          { pt: 'E que é por isso que você ainda imprime aquele cartaz.',
            en: 'And that is why you still print that poster.' },
          { pt: 'ME|...', en: 'ME|...' },
          { pt: 'Eu vi a gaveta, David. Faz anos que eu vejo.',
            en: 'I have seen the drawer, David. For years now.' },
        ],
        back: 'a',
      },
      aqui: {
        lines: [
          { pt: 'Todo dia. Mesmo turno, mesma cadeira.',
            en: 'Every day. Same shift, same chair.' },
          { pt: 'ME|E ninguém te promoveu em sete anos?',
            en: 'ME|And nobody promoted you in seven years?' },
          { pt: '(ele ri) Alguém tinha que guardar sua mesa.',
            en: '(he laughs) Somebody had to keep your desk warm.' },
        ],
        back: 'a',
      },
      relogio: {
        lines: [
          { pt: 'Está parado desde que eu cheguei aqui.',
            en: 'It has been stopped since I started here.' },
          { pt: 'ME|O ponteiro de segundos anda.',
            en: 'ME|The second hand is moving.' },
          { pt: '(ele olha para o relógio por um tempo longo demais)',
            en: '(he looks at the clock for a beat too long)' },
          { pt: 'Anda mesmo.', en: 'So it is.' },
        ],
        back: 'a',
      },
      fim: {
        lines: [
          { pt: 'Vai lá embaixo, David. Depois volta aqui.',
            en: 'Go downstairs, David. Then come back up here.' },
        ],
      },
    },
  },

  // ---------------------------------------------------------------------
  // OS TRES COLEGAS — quatro versoes da mesma noite.
  //
  // Tres batem. Uma nao bate. A QUE NAO BATE E A QUE O DAVID LEMBRA.
  // ---------------------------------------------------------------------
  colega_a: {
    speaker: { pt: 'RUIZ', en: 'RUIZ' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: 'Detetive. Faz tempo.', en: 'Detective. Long time.' },
        ],
        choices: [
          { pt: 'Você estava aqui naquela noite?', en: 'Were you here that night?', to: 'noite' },
          { pt: 'A que horas eu saí?', en: 'What time did I leave?', to: 'hora' },
        ],
      },
      noite: {
        lines: [
          { pt: 'Estava. Turno da noite, igual hoje.',
            en: 'I was. Night shift, same as tonight.' },
        ],
        back: 'a',
      },
      hora: {
        lines: [
          { pt: 'Oito e doze. Está no livro, com a sua letra.',
            en: 'Eight twelve. It is in the book, in your own hand.' },
        ],
        press: 'hora2',
        back: 'a',
      },
      hora2: {
        lines: [
          { pt: 'ME|E eu voltei depois?', en: 'ME|And did I come back after?' },
          { pt: 'Não. Eu virei o turno inteiro nessa mesa.',
            en: 'No. I worked that whole shift at this desk.' },
          { pt: 'Você só apareceu de manhã, com o Michael.',
            en: 'You only turned up in the morning, with Michael.' },
        ],
        back: 'a',
      },
      fim: { lines: [{ pt: 'Boa noite, David.', en: 'Good night, David.' }] },
    },
  },

  colega_b: {
    speaker: { pt: 'ELAINE', en: 'ELAINE' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: '(ela não para de datilografar)', en: '(she does not stop typing)' },
        ],
        choices: [
          { pt: 'A que horas eu saí naquela noite?', en: 'What time did I leave that night?', to: 'hora' },
          { pt: 'Eu liguei pra cá depois?', en: 'Did I call in later?', to: 'ligacao' },
        ],
      },
      hora: {
        lines: [
          { pt: 'Oito e doze. Eu bati o teu ponto.',
            en: 'Eight twelve. I clocked you out myself.' },
        ],
        back: 'a',
      },
      ligacao: {
        lines: [
          { pt: 'Ligou. Duas e quatorze. Eu anotei no livro.',
            en: 'You did. Two fourteen. I logged it.' },
          { pt: 'ME|O que eu disse?', en: 'ME|What did I say?' },
          { pt: 'Nada. Só respiração. O Michael pegou o carro e saiu.',
            en: 'Nothing. Just breathing. Michael took the car and left.' },
        ],
        press: 'ligacao2',
        back: 'a',
      },
      ligacao2: {
        lines: [
          { pt: 'ME|Você anotou de onde veio a chamada?',
            en: 'ME|Did you log where the call came from?' },
          { pt: '(ela para de datilografar)', en: '(she stops typing)' },
          { pt: 'Anotei. Do ramal desta sala.',
            en: 'I did. From the extension in this room.' },
          { pt: 'ME|Como assim desta sala.', en: 'ME|What do you mean, this room.' },
          { pt: 'A chamada entrou daqui de dentro, David.',
            en: 'The call came from inside here, David.' },
          { pt: 'Foi por isso que ninguém quis assinar aquele relatório.',
            en: 'That is why nobody would sign that report.' },
        ],
        back: 'a',
      },
      fim: { lines: [{ pt: 'Boa noite, David.', en: 'Good night, David.' }] },
    },
  },

  colega_c: {
    speaker: { pt: 'BETINHO', en: 'BETINHO' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: 'Ô doutor. Café tá velho, mas tá quente.',
            en: 'Hey, boss. Coffee is old but it is hot.' },
        ],
        choices: [
          { pt: 'Você me viu sair naquela noite?', en: 'Did you see me leave that night?', to: 'saida' },
          { pt: 'Eu voltei depois?', en: 'Did I come back later?', to: 'volta' },
        ],
      },
      saida: {
        lines: [
          { pt: 'Vi. Oito e pouco, com aquele casaco marrom.',
            en: 'I did. Just past eight, in that brown coat.' },
        ],
        back: 'a',
      },
      volta: {
        lines: [
          { pt: 'Voltou. Umas duas da manhã.', en: 'You did. Around two in the morning.' },
          { pt: 'ME|Eu não voltei.', en: 'ME|I did not come back.' },
          { pt: 'Voltou sim, doutor. Ficou sentado na sua mesa até clarear.',
            en: 'You did, boss. Sat at your desk until it got light.' },
        ],
        press: 'volta2',
        back: 'a',
      },
      volta2: {
        lines: [
          { pt: 'ME|Betinho. Eu estava na minha casa. Eu estava na varanda.',
            en: 'ME|Betinho. I was at my house. I was on the porch.' },
          { pt: '(ele mexe o café devagar)', en: '(he stirs his coffee slowly)' },
          { pt: 'Eu sei o que eu vi, doutor. Casaco marrom, na sua cadeira.',
            en: 'I know what I saw, boss. Brown coat, in your chair.' },
          { pt: 'ME|Você falou comigo?', en: 'ME|Did you talk to me?' },
          { pt: 'Falei boa noite. O senhor não respondeu.',
            en: 'I said good evening. You did not answer.' },
          { pt: 'ME|...', en: 'ME|...' },
          { pt: 'Deve ter sido outra noite. Eu misturo as noites.',
            en: 'Must have been another night. I mix up the nights.' },
        ],
        back: 'a',
      },
      fim: { lines: [{ pt: 'Boa noite, David.', en: 'Good night, David.' }] },
    },
  },

  // ---------------------------------------------------------------------
  // CARLOS — a cela. O interrogatorio.
  //
  // REGRAS: nunca ameaca, nunca levanta a voz, nunca e "vilao". Nunca
  // confirma nem nega o que fez. Responde perguntas sobre DAVID com
  // precisao desconfortavel. E uma vez, uma vez so, diz algo que nao teria
  // como saber — e segue falando como se nao tivesse dito.
  //
  // O no `cigarro` e onde o DEGRAU 4 acontece. main.js escuta esse no.
  // ---------------------------------------------------------------------
  carlos: {
    speaker: { pt: 'CARLOS', en: 'CARLOS' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: '(ele está sentado no banco de concreto. Camiseta. Sem sapato.)',
            en: '(he is sitting on the concrete bench. Undershirt. No shoes.)' },
          { pt: 'Demorou sete anos.', en: 'Took you seven years.' },
        ],
        choices: [
          { pt: 'Você mandou matar a minha mulher.',
            en: 'You had my wife killed.', to: 'foi' },
          { pt: 'Onde está a minha filha?', en: 'Where is my daughter?', to: 'menina' },
          { pt: 'Por que você está aqui hoje?', en: 'Why are you here tonight?', to: 'hoje' },
          { pt: 'Cigarro?', en: 'Cigarette?', to: 'cigarro' },
          { pt: 'Alguém escreveu no meu caderno.',
            en: 'Somebody wrote in my notebook.', to: 'caderno', req: 'ded_letra' },
        ],
      },
      // O NUCLEO DA HISTORIA: o alibi dele e o registro da propria prisao.
      // David o prendeu as 20h. A familia morreu as 02h14. Ele estava numa
      // cela — e por isso a teoria da vinganca nunca fechou.
      foi: {
        lines: [
          { pt: 'O senhor me algemou às oito e doze.',
            en: 'You cuffed me at eight twelve.' },
          { pt: 'ME|Eu sei a hora.', en: 'ME|I know the time.' },
          { pt: 'Então o senhor sabe onde eu estava às duas e quatorze.',
            en: 'Then you know where I was at two fourteen.' },
          { pt: 'ME|Você tinha gente.', en: 'ME|You had people.' },
          { pt: 'Tinha. E eles foram todos ouvidos, um por um, e todos tinham onde estar.',
            en: 'I did. And every one of them was questioned, and every one of them was somewhere else.' },
          { pt: 'O senhor mesmo assinou os depoimentos.',
            en: 'You signed the statements yourself.' },
        ],
        press: 'foi2',
        back: 'a',
      },
      foi2: {
        lines: [
          { pt: 'ME|Alguém entrou na minha casa.',
            en: 'ME|Somebody came into my house.' },
          { pt: 'Alguém entrou.', en: 'Somebody did.' },
          { pt: 'ME|E não foi você.', en: 'ME|And it was not you.' },
          { pt: '(ele não responde por um tempo)', en: '(he does not answer for a while)' },
          { pt: 'O senhor estava na varanda.', en: 'You were out on the porch.' },
          { pt: 'ME|Como você sabe da varanda?',
            en: 'ME|How do you know about the porch?' },
          { pt: 'No telefone. Com um cigarro na mão.',
            en: 'On the phone. Cigarette in your hand.' },
          { pt: '(ele muda de assunto sem pausa nenhuma)',
            en: '(he changes the subject without a beat)' },
          { pt: 'Aqui dentro não tem relógio. O senhor reparou?',
            en: 'There is no clock in here. Did you notice?' },
        ],
        back: 'a',
      },
      menina: {
        lines: [
          { pt: 'Eu não sei.', en: 'I do not know.' },
          { pt: 'ME|Você sabe.', en: 'ME|You know.' },
          { pt: 'Se eu soubesse eu tinha trocado por alguma coisa. Faz sete anos que eu tenho o que trocar.',
            en: 'If I knew I would have traded it for something. I have had seven years of things to trade.' },
        ],
        press: 'menina2',
        back: 'a',
      },
      menina2: {
        lines: [
          { pt: 'ME|Nunca acharam ela.', en: 'ME|They never found her.' },
          { pt: 'Morto fica onde caiu, senhor. É a graça de morto.',
            en: 'The dead stay where they fell, sir. That is the thing about the dead.' },
          { pt: 'ME|E ela?', en: 'ME|And her?' },
          { pt: 'Ela o senhor procura até hoje.', en: 'Her you are still looking for.' },
          { pt: '(pausa)', en: '(a pause)' },
          { pt: 'Toda noite, senhor. O senhor procura toda noite.',
            en: 'Every night, sir. You look for her every night.' },
        ],
        back: 'a',
      },
      // O motivo mundano de ele estar aqui. Sem isso a cela nao se sustenta.
      hoje: {
        lines: [
          { pt: 'Transferência. Audiência de manhã.',
            en: 'Transfer. Hearing in the morning.' },
          { pt: 'Passo a noite aqui e sigo às sete.',
            en: 'I spend the night here and move on at seven.' },
          { pt: 'ME|Justo hoje.', en: 'ME|Tonight of all nights.' },
          { pt: 'Justo hoje.', en: 'Tonight of all nights.' },
        ],
        back: 'a',
      },
      caderno: {
        lines: [
          { pt: 'Letra firme?', en: 'Steady hand?' },
          { pt: 'ME|Firme.', en: 'ME|Steady.' },
          { pt: 'Então é de antes.', en: 'Then it is from before.' },
          { pt: 'ME|Antes de quê?', en: 'ME|Before what?' },
          { pt: 'De o senhor ficar assim.', en: 'Before you got like this.' },
        ],
        back: 'a',
      },
      // ---- DEGRAU 4 ----
      // Ele acende um pro cara falar. E tecnica, e oficio, ele fez isso mil
      // vezes. E ai acende um pra ele. No automatico. Sem pensar. Sem uma
      // linha de dialogo antes. O JOGO NAO PERGUNTA NADA AO JOGADOR AQUI.
      cigarro: {
        lines: [
          { pt: '(ele olha para o bolso do sobretudo)',
            en: '(he looks at the coat pocket)' },
          { pt: 'O senhor ainda carrega o maço.', en: 'You still carry the pack.' },
          { pt: 'ME|Carrego.', en: 'ME|I do.' },
          { pt: 'Me dá um.', en: 'Give me one.' },
          { pt: '(David tira dois do maço, estende um pela grade e acende com o próprio isqueiro)',
            en: '(David takes two from the pack, holds one through the bars and lights it with his own lighter)' },
          { pt: '(depois acende o outro)', en: '(then he lights the other one)' },
        ],
        back: 'a',
      },
      fim: {
        lines: [
          { pt: 'Volta quando quiser. Eu não vou a lugar nenhum.',
            en: 'Come back whenever. I am not going anywhere.' },
        ],
      },
    },
  },

  // =====================================================================
  // A CASA, SETE ANOS ATRAS
  //
  // As duas unicas conversas do jogo em que ninguem sabe de nada, ninguem
  // fala por enigma e ninguem esta morto. Sao ordinarias de proposito: e
  // isso que o jogador vai lembrar depois.
  //
  // REGRA: o nome da JENNA nao pode ser dito por ninguem aqui. A Julie
  // chama ela de "ela" e "a sua filha"; a menina se apresenta pelo que
  // esta fazendo, nunca pelo nome. O jogador termina o flashback sem
  // nunca ter lido o nome — e e por isso que a ultima cena funciona.
  // =====================================================================

  julie: {
    speaker: { pt: 'JULIE', en: 'JULIE' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: 'Você comeu?', en: 'Did you eat?' },
          { pt: 'ME|Comi um negócio lá.', en: 'ME|I had something there.' },
          { pt: 'Então não comeu.', en: 'So you did not eat.' },
        ],
        choices: [
          { pt: 'Fechei o caso hoje.', en: 'I closed the case today.', to: 'caso' },
          { pt: 'Ela ainda está acordada?', en: 'Is she still up?', to: 'menina' },
          { pt: 'Desculpa a hora.', en: 'Sorry about the hour.', to: 'hora' },
        ],
      },
      caso: {
        lines: [
          { pt: '(ela para o que estava fazendo)', en: '(she stops what she is doing)' },
          { pt: 'Aquele?', en: 'That one?' },
          { pt: 'ME|Aquele.', en: 'That one.' },
          { pt: 'David.', en: 'David.' },
          { pt: 'ME|Eu sei.', en: 'ME|I know.' },
          { pt: 'Não, você não sabe. Faz dois anos que você não dorme por causa dele.',
            en: 'No, you do not. You have not slept in two years because of him.' },
        ],
        press: 'caso2',
        back: 'a',
      },
      caso2: {
        lines: [
          { pt: 'ME|Acabou.', en: 'ME|It is over.' },
          { pt: 'Acabou mesmo?', en: 'Is it really over?' },
          { pt: 'ME|Acabou.', en: 'ME|It is over.' },
          { pt: '(ela ri, e é a primeira vez em muito tempo)',
            en: '(she laughs, and it is the first time in a long while)' },
          { pt: 'Então amanhã você me leva pra algum lugar.',
            en: 'Then tomorrow you are taking me somewhere.' },
          { pt: 'ME|Levo.', en: 'ME|I will.' },
        ],
        back: 'a',
      },
      menina: {
        lines: [
          { pt: 'Devia estar dormindo há duas horas.',
            en: 'She should have been asleep two hours ago.' },
          { pt: 'Ficou esperando você.', en: 'She stayed up for you.' },
          { pt: 'ME|Ela não precisa esperar.', en: 'ME|She does not have to wait up.' },
          { pt: 'Fala isso pra ela.', en: 'Tell her that.' },
        ],
        back: 'a',
      },
      hora: {
        lines: [
          { pt: 'Você chega a hora que chega.', en: 'You get here when you get here.' },
          { pt: 'Só me avisa. É só isso que eu peço.',
            en: 'Just tell me. That is all I ask.' },
        ],
        back: 'a',
      },
      fim: {
        lines: [
          { pt: 'Tira esse casaco molhado antes de sentar.',
            en: 'Take that wet coat off before you sit down.' },
        ],
      },
    },
  },

  jenna: {
    speaker: { pt: '—', en: '—' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: 'Eu não estou acordada.', en: 'I am not awake.' },
          { pt: 'ME|Não?', en: 'ME|No?' },
          { pt: 'Não. Isso aqui é sonho.', en: 'No. This is a dream.' },
        ],
        choices: [
          { pt: 'O que você está desenhando?', en: 'What are you drawing?', to: 'desenho' },
          { pt: 'Por que você não foi dormir?', en: 'Why did you not go to bed?', to: 'dormir' },
          { pt: 'Amanhã eu não trabalho.', en: 'I am not working tomorrow.', to: 'amanha' },
        ],
      },
      desenho: {
        lines: [
          { pt: 'É você.', en: 'It is you.' },
          { pt: 'ME|Esse aí sou eu?', en: 'ME|That is me?' },
          { pt: 'É o casaco. O resto eu não sei fazer.',
            en: 'It is the coat. I cannot do the rest.' },
        ],
        press: 'desenho2',
        back: 'a',
      },
      desenho2: {
        lines: [
          { pt: 'ME|Por que o casaco?', en: 'ME|Why the coat?' },
          { pt: 'Porque é o que dá pra ver de longe.',
            en: 'Because it is what you can see from far away.' },
          { pt: 'Quando você chega, primeiro aparece o casaco.',
            en: 'When you come home, the coat gets here first.' },
        ],
        back: 'a',
      },
      dormir: {
        lines: [
          { pt: 'Porque você ia chegar.', en: 'Because you were going to get here.' },
          { pt: 'ME|E se eu não chegasse?', en: 'ME|And if I had not?' },
          { pt: 'Aí eu ia ficar acordada mais um pouco.',
            en: 'Then I would stay up a bit longer.' },
        ],
        back: 'a',
      },
      amanha: {
        lines: [
          { pt: 'Mentira.', en: 'Not true.' },
          { pt: 'ME|Verdade.', en: 'ME|True.' },
          { pt: '(ela pensa)', en: '(she thinks about it)' },
          { pt: 'Então amanhã a gente acorda tarde.',
            en: 'Then tomorrow we sleep in.' },
        ],
        back: 'a',
      },
      fim: {
        lines: [
          { pt: 'Boa noite, pai.', en: 'Good night, dad.' },
        ],
      },
    },
  },
};

// ---------------------------------------------------------------------------
// PAGINAS DO CADERNO
//
// Ele anota sozinho. O jogador nunca digita nada. As paginas marcadas com
// `alheia` NAO foram escritas por ele: a letra e outra, mais firme, e elas
// so aparecem quando a sanidade cai. (Ver PARTE V do ROTEIRO.txt.)
// ---------------------------------------------------------------------------

export const JOURNAL = {
  j_phone:   { cat: 'clue', pt: 'O telefone do bar está com o fio cortado e poeira dentro da tomada. Mesmo assim tocou à meia-noite, e a voz sabia onde eu estava antes de eu responder. Preciso parar de chamar isso de coincidência.',
               en: 'The bar phone has a cut cord and dust inside the socket. It rang at midnight anyway, and the voice knew where I was before I answered. I need to stop calling this coincidence.' },
  j_note:    { cat: 'self', pt: 'O bilhete no depósito foi escrito com a pressão que eu faço quando estou com raiva: forte no começo, quase rasgando no fim. Reconheço o gesto, não a lembrança. Isso é pior.',
               en: 'The storeroom note was written with the pressure I use when angry: hard at first, nearly tearing at the end. I recognize the gesture, not the memory. That is worse.' },
  j_locked:  { cat: 'place', pt: 'As portas deste galpão trancam por fora, mas os puxadores do lado de dentro estão gastos. Muita gente tentou sair daqui. Ou uma pessoa tentou muitas vezes.',
               en: 'These warehouse doors lock from outside, but the inner handles are worn. Many people tried to leave. Or one person tried many times.' },
  j_clock:   { cat: 'clue', pt: 'O relógio de ponto morreu em 02h14, a mesma hora da ligação. Não é só um mostrador parado: os cartões ao redor foram batidos no mesmo minuto, em dias diferentes.',
               en: 'The punch clock died at 2:14, the same time as the call. It is not merely stopped: the surrounding cards were punched in the same minute on different days.' },
  j_vigia:   { cat: 'people', pt: 'O zelador fala de um turno encerrado há dez anos como se ainda devesse fechar o prédio esta noite. Sabe meu nome sem ter perguntado. O esfregão está seco, mas deixa um rastro escuro.',
               en: 'The caretaker talks about a shift ended ten years ago as if he still has to close tonight. He knew my name without asking. His mop is dry, but leaves a dark trail.' },
  j_conv:    { cat: 'clue', pt: 'A ripa apareceu ao lado de uma palete quebrada no exato trecho em que fiquei sem arma. O lugar não está me ajudando; está antecipando minhas escolhas e me cobrando por aceitá-las.',
               en: 'The slat appeared beside a broken pallet exactly where I had no weapon. The place is not helping me; it is anticipating my choices and charging me for accepting them.' },
  j_ammo:    { cat: 'clue', pt: 'Encontrei munição nova antes de encontrar qualquer arma compatível. A caixa não tem umidade, ferrugem ou pó. Alguém a colocou na minha rota sabendo que eu continuaria.',
               en: 'I found new ammunition before any compatible weapon. The box has no damp, rust or dust. Someone placed it on my route knowing I would continue.' },
  j_cigs:    { cat: 'self', pt: 'Um maço fechado da minha marca, no armário de um funcionário morto. O selo é recente. Não vou acender um cigarro oferecido por um lugar que conhece meus hábitos.',
               en: 'A sealed pack of my brand in a dead employee’s locker. The seal is recent. I will not light a cigarette offered by a place that knows my habits.' },
  j_mirror:  { cat: 'self', pt: 'No espelho, meu reflexo demorou uma fração de segundo para me acompanhar. Depois sorriu antes de mim. Não vou desenhar o rosto que vi atrás do meu; ainda não.',
               en: 'In the mirror, my reflection took a fraction too long to follow. Then it smiled before I did. I will not draw the face behind mine; not yet.' },
  j_cold:    { cat: 'place', pt: 'A câmara marca dois graus negativos apesar de estar desligada há dez anos. O frio não vem das paredes. Fica mais forte quando tento lembrar por que o cheiro de metal me parece familiar.',
               en: 'The cold store reads two below despite being off for ten years. The cold does not come from the walls. It grows when I try to remember why the metal smell feels familiar.' },
  j_hooks:   { cat: 'clue', pt: 'Contei os ganchos duas vezes: vinte e três, depois vinte e quatro. Na terceira tentativa parei antes do fim. Um deles balançava no ritmo da minha respiração.',
               en: 'I counted the hooks twice: twenty-three, then twenty-four. On the third attempt I stopped. One of them swung with my breathing.' },
  j_gun:     { cat: 'clue', pt: 'A pistola não estava caída; estava limpa, carregada e apontada para a porta por onde entrei. Uma arma deixada assim não é presente. É uma instrução.',
               en: 'The pistol was not dropped; it was clean, loaded and aimed at the door I entered. A weapon left that way is not a gift. It is an instruction.' },
  j_oper:    { cat: 'people', pt: 'A telefonista conecta cabos que terminam em cortes limpos sob a mesa. Disse que fui eu quem ligou. Quando neguei, procurou meu nome numa ficha que já estava aberta.',
               en: 'The operator connects cables ending in clean cuts under the desk. She said I made the call. When I denied it, she looked for my name on a card already open.' },
  j_credor:  { cat: 'self', pt: 'Máscara de porco costurada, avental de açougueiro e uma motosserra que continua funcionando longe demais para ser real. Ele não corre como quem caça. Anda como quem sabe que a dívida não pode fugir.',
               en: 'Stitched pig mask, butcher apron and a chainsaw running too far away to be real. He does not run like a hunter. He walks like something certain the debt cannot escape.' },
  j_relays:  { cat: 'clue', pt: 'Três relés arrancados do mesmo quadro: MÃO, OLHO, VOZ. O relógio de 02h14 ainda alimenta alguma coisa.',
               en: 'Three relays torn from one panel: HAND, EYE, VOICE. The 2:14 clock is still powering something.' },
  j_puzzle:  { cat: 'clue', pt: 'Fechei o circuito na ordem gravada. O armário da segurança liberou a chave do mezanino.',
               en: 'I closed the circuit in the engraved order. The security cabinet released the mezzanine key.' },

  // Documentos não são interpretações de David. São fragmentos do caso,
  // deliberadamente incompletos, encontrados longe uns dos outros.
  d_turno: { cat: 'document', pt: 'RELATÓRIO DE TURNO — trecho 1/3. “Às 02h14 o supervisor ordenou que o portão 3 permanecesse fechado. O chamado de emergência foi classificado como duplicado. Assinatura removida.”',
             en: 'SHIFT REPORT — fragment 1/3. “At 2:14 the supervisor ordered gate 3 kept shut. The emergency call was classified as duplicate. Signature removed.”' },
  d_caso: { cat: 'document', pt: 'FICHA DE EVIDÊNCIA — trecho 2/3. “Objeto pessoal recolhido: sobretudo escuro, cigarro da marca habitual, gravação sem fita. O responsável pela coleta recusou-se a identificar a vítima.”',
            en: 'EVIDENCE FORM — fragment 2/3. “Personal effects: dark overcoat, usual cigarette brand, recorder without tape. Collecting officer refused to identify the victim.”' },
  d_voz: { cat: 'document', pt: 'TRANSCRIÇÃO — trecho 3/3. “Chamador: D. [inaudível]. Operadora: senhor, esta linha vem de dentro. Chamador: eu sei. Não abra a porta quando eu pedir.” O restante foi apagado.',
           en: 'TRANSCRIPT — fragment 3/3. “Caller: D. [inaudible]. Operator: sir, this line comes from inside. Caller: I know. Do not open the door when I ask.” The remainder was erased.' },
  d_code: { cat: 'document', pt: 'PAPEL DO ZELADOR. Quatro números escritos dentro de um círculo: 0 — 2 — 1 — 4. Embaixo: “A hora nunca mudou. Você é que continua chegando tarde.”',
            en: 'CARETAKER’S PAPER. Four numbers inside a circle: 0 — 2 — 1 — 4. Below: “The hour never changed. You are the one who keeps arriving late.”' },
  d_safe: { cat: 'document', pt: 'NOTA DO COFRE. “A CULPA PRECISA DE UM ROSTO. SABIA QUE TU FARIA ISSO.” A segunda frase está na minha letra. A primeira não está em letra nenhuma que eu reconheça.',
            en: 'SAFE NOTE. “GUILT NEEDS A FACE. I KNEW YOU WOULD DO IT.” The second sentence is in my handwriting. The first is not in any hand I recognize.' },
  d_mezz: { cat: 'document', pt: 'ETIQUETA DO KIT. “Para David — quando finalmente aceitar subir.” A data foi raspada. Sob a tinta ainda aparece o contorno de sete algarismos.',
            en: 'KIT LABEL. “For David — when he finally agrees to go upstairs.” The date was scraped off. Seven digits still show beneath the ink.' },
  d_operator_drop: { cat: 'document', pt: 'FICHA DA TELEFONISTA. Campo “origem”: INTERNA. Campo “destino”: DAVID. A linha reservada para o número contém seis furos e uma mancha de sangue ainda úmida.',
                     en: 'OPERATOR CARD. “Origin”: INTERNAL. “Destination”: DAVID. The number field contains six punched holes and a still-wet blood stain.' },
  d_photo_david: { cat: 'document', pt: 'FOTOGRAFIA DO TURNO. Onze funcionários diante da doca 3. David aparece ao fundo, de sobretudo, olhando para fora do enquadramento. No verso: “ele ainda não sabe que trabalha aqui”.',
                   en: 'SHIFT PHOTOGRAPH. Eleven employees before dock 3. David stands in the back wearing his coat and looking outside the frame. On the reverse: “he does not know he works here yet”.' },
  d_punch_card: { cat: 'document', pt: 'CARTÃO DE PONTO — DAVID. Entrada: 02h14. Data: hoje. O campo de saída está vazio e o papel ainda está morno.',
                  en: 'TIME CARD — DAVID. Clock-in: 2:14. Date: today. Clock-out is blank and the card is still warm.' },
  d_shift_before: { cat: 'document', pt: 'RELATÓRIO DE INCIDENTE. “O investigador chegou depois do fechamento. Nenhum funcionário reconheceu o homem. O acesso à doca permaneceu selado.” A última linha termina rasgada.',
                    en: 'INCIDENT REPORT. “The investigator arrived after closing. No employee recognized the man. Dock access remained sealed.” The last line ends in a tear.' },
  d_shift_after: { cat: 'document', alheia: true, pt: 'RELATÓRIO DE INCIDENTE. “O investigador chegou depois do fechamento. Nenhum funcionário reconheceu o homem. O acesso à doca permaneceu selado. DAVID FECHOU O PORTÃO POR FORA.”',
                   en: 'INCIDENT REPORT. “The investigator arrived after closing. No employee recognized the man. Dock access remained sealed. DAVID LOCKED THE GATE FROM OUTSIDE.”' },

  // As que ele nao escreveu.
  j_x1: { cat: 'other', alheia: true, pt: 'VOCÊ ESTÁ QUASE LEMBRANDO.', en: 'YOU ARE ALMOST REMEMBERING.' },
  j_x2: { cat: 'other', alheia: true, pt: 'NÃO ERA CULPA DELA.',        en: 'IT WAS NOT HER FAULT.' },
  j_x3: { cat: 'other', alheia: true, pt: 'SETE ANOS. CONTA DIREITO.',  en: 'SEVEN YEARS. COUNT AGAIN.' },

  // ---------------------------------------------------------------------
  // CONCLUSOES — as paginas que so existem se o jogador juntar duas outras.
  // Sao a voz dele raciocinando, nao a voz do jogo explicando. Nenhuma
  // delas fecha nada: cada uma abre uma pergunta que da para fazer em voz
  // alta a alguem.
  // ---------------------------------------------------------------------
  c_hora: { cat: 'deduc', pt: 'O telefone tocou às 02h14. O relógio de ponto morreu às 02h14. Os cartões em volta foram batidos no mesmo minuto, em dias diferentes. Não é um relógio quebrado. É um minuto que não passa.',
            en: 'The phone rang at 2:14. The punch clock died at 2:14. The cards around it were punched in the same minute, on different days. This is not a broken clock. It is a minute that does not pass.' },
  c_letra: { cat: 'deduc', pt: 'A pressão do bilhete é a minha. O gesto é o meu. Alguém que escreve como eu escrevia sabia que eu ia parar exatamente ali para ler. Só me falta a parte em que eu escrevi.',
             en: 'The pressure on the note is mine. The gesture is mine. Someone who writes the way I used to write knew I would stop exactly there to read it. I am only missing the part where I wrote it.' },
  c_nome: { cat: 'deduc', pt: 'O zelador me chamou pelo nome. A telefonista me chamou pelo nome. Eu não disse meu nome para nenhum dos dois, e nenhum dos dois achou isso estranho. O estranho aqui sou eu.',
            en: 'The caretaker called me by name. The operator called me by name. I gave my name to neither, and neither found that strange. The strange one here is me.' },
  c_saida: { cat: 'deduc', pt: 'Toda porta tranca por fora e todo puxador de dentro está gasto. Mesmo assim tem coisa andando aqui dentro. Ou alguém abre e fecha para elas, ou elas nunca precisaram de porta.',
             en: 'Every door locks from outside and every inner handle is worn. Even so, things walk in here. Either someone opens and closes for them, or they never needed a door.' },
  c_rota:  { cat: 'deduc', pt: 'A ripa onde eu fiquei sem arma. A munição antes da pistola. A pistola limpa e apontada para a porta por onde eu ia entrar. Isso não é sorte espalhada: é uma rota, montada na ordem em que eu ia precisar.',
             en: 'The slat where I ran out of weapon. The ammunition before the pistol. The pistol clean and aimed at the door I was about to come through. This is not luck scattered around: it is a route, laid out in the order I would need it.' },

  // ---------------------------------------------------------------------
  // CAPITULO 3 — o caderno
  // ---------------------------------------------------------------------
  j3_desk:  { cat: 'self', pt: 'Minha mesa não foi esvaziada. Tem poeira em cima do tampo, dentro do teclado e nas pastas — e nenhuma na cadeira. Alguém sentou ali muito depois de eu parar de sentar.',
              en: 'My desk was never cleared out. There is dust on the top, inside the keys and over the folders — and none on the chair. Somebody sat there long after I stopped.' },
  j3_ash:   { cat: 'clue', pt: 'O cinzeiro da minha mesa está cheio. Eu larguei há sete anos e ninguém usa aquela mesa. Contei onze pontas. As onze são da minha marca.',
              en: 'The ashtray on my desk is full. I quit seven years ago and nobody uses that desk. I counted eleven butts. All eleven are my brand.' },
  j3_drawer:{ cat: 'self', pt: 'A gaveta de baixo está cheia de cartazes novos. Papel recente, tinta recente. Eu não lembro de ter mandado imprimir. Fechei a gaveta.',
              en: 'The bottom drawer is full of new posters. Fresh paper, fresh ink. I do not remember ordering them. I closed the drawer.' },
  j3_michael:{ cat: 'people', pt: 'Michael conta aquela noite sem hesitar em nenhuma parte, e o que ele conta bate com o livro. Diz que eu liguei para cá às 02h14 e que eu não conseguia falar. A plaquinha na mesa dele tem o meu nome.',
              en: 'Michael tells that night without hesitating anywhere, and what he says matches the book. He says I called in at 2:14 and could not speak. The nameplate on his desk has my name on it.' },
  j3_shift: { cat: 'people', pt: 'Três pessoas dizem que eu saí às 20h12 e não voltei. Uma diz que eu voltei de madrugada e fiquei sentado na minha mesa até clarear. As três estão de acordo. Eu estou com a quarta.',
              en: 'Three people say I left at 20:12 and did not return. One says I came back in the night and sat at my desk until dawn. The three agree. I am the fourth.' },
  j3_drawerd:{ cat: 'clue', pt: 'A gaveta do D existe, e é minha: HENRY, D. Uma pasta por ano. Contei sete. Contei de novo e deu oito. Não abri a oitava.',
              en: 'Drawer D exists, and it is mine: HENRY, D. One folder per year. I counted seven. I counted again and got eight. I did not open the eighth.' },
  j3_carlos:{ cat: 'people', pt: 'Carlos está a duzentos quilômetros daqui há sete anos, segundo Michael, e está sentado no xadrez do subsolo, segundo os meus olhos. Não ameaçou, não negou e não confirmou nada. Sabia da varanda.',
              en: 'Carlos has been two hundred kilometres away for seven years, according to Michael, and is sitting in the basement cell, according to my eyes. He did not threaten, deny or confirm anything. He knew about the porch.' },
  j3_book:  { cat: 'clue', pt: 'O livro de visitas da custódia tem uma linha por noite, sete anos de linhas, e a assinatura é a minha em todas. A caneta está presa por um barbante ao lado. O barbante está gasto no meio.',
              en: 'The holding visitor book has one line per night, seven years of lines, and the signature is mine on every one. The pen is tied beside it with string. The string is worn through in the middle.' },
  j3_cig:   { cat: 'self', pt: 'Acendi um para ele falar. É técnica, eu fiz isso mil vezes. Depois acendi outro sem pensar. Sete anos. Não decidi nada — só reparei com a coisa já na mão.',
              en: 'I lit one to get him talking. It is technique, I have done it a thousand times. Then I lit another without thinking. Seven years. I did not decide anything — I just noticed with the thing already in my hand.' },

  // As que ele nao escreveu, do Capitulo 3.
  j3_x1: { cat: 'other', alheia: true, pt: 'VOCÊ ATENDEU.',            en: 'YOU ANSWERED.' },
  j3_x2: { cat: 'other', alheia: true, pt: 'ELA AINDA ESTÁ CHAMANDO.', en: 'SHE IS STILL CALLING.' },

  // Conclusoes do Capitulo 3.
  c_turno: { cat: 'deduc', pt: 'Três pessoas me viram sair e não voltar. Uma me viu voltar e passar a noite na minha mesa. O cinzeiro está cheio e a cadeira não tem poeira. A versão que não bate com as outras três é a minha.',
             en: 'Three people saw me leave and not come back. One saw me return and spend the night at my desk. The ashtray is full and the chair has no dust. The version that does not match the other three is mine.' },
  c_gaveta:{ cat: 'deduc', pt: 'A gaveta do D não estava no galpão porque ela está aqui, e é minha. Uma pasta por ano de coisa que eu não fechei. E tem uma pasta a mais do que anos que eu passei procurando.',
             en: 'Drawer D was missing from the warehouse because it is here, and it is mine. One folder for each year of what I did not close. And there is one folder more than the years I spent looking.' },
  c_visita:{ cat: 'deduc', pt: 'Sete anos de assinaturas minhas no livro da custódia, e a porta da cela nunca esteve trancada. Ninguém me trouxe aqui. Eu venho. Toda noite. E toda noite eu esqueço que vim.',
             en: 'Seven years of my signatures in the holding book, and the cell door was never locked. Nobody brought me here. I come. Every night. And every night I forget that I came.' },
};

// ---------------------------------------------------------------------------
// DEDUCOES — o verbo que o jogo promete desde o primeiro dia.
//
// Duas anotacoes que o jogador ja tem, marcadas ao mesmo tempo no caderno,
// viram uma terceira. A combinacao NAO e dica de lugar nenhum: ou o jogador
// percebe que as duas falam da mesma coisa, ou nao percebe. Errar nao custa
// nada alem de uma linha seca.
//
// `flag` entra em game.flags e serve para destravar pergunta de conversa —
// e por isso que a deducao vale alguma coisa em vez de ser colecionavel.
// ---------------------------------------------------------------------------

export const DEDUCTIONS = {
  // 02h14 no telefone + 02h14 no relogio de ponto.
  hora:  { a: 'j_phone',  b: 'j_clock',  page: 'c_hora',  flag: 'ded_hora' },
  // A letra do bilhete + uma pagina que ele nao escreveu. Esta so fica
  // possivel abaixo de 50 de sanidade, porque e quando a segunda aparece —
  // e isso e de proposito: ele so junta as duas quando ja esta rachando.
  letra: { a: 'j_note',   b: 'j_x1',     page: 'c_letra', flag: 'ded_letra' },
  // Duas pessoas que sabiam o nome dele sem perguntar.
  nome:  { a: 'j_vigia',  b: 'j_oper',   page: 'c_nome',  flag: 'ded_nome' },
  // Portas que trancam por fora + coisa andando aqui dentro.
  saida: { a: 'j_locked', b: 'j_credor', page: 'c_saida', flag: 'ded_saida' },
  // A conveniencia deixa de ser piada e vira rota.
  rota:  { a: 'j_conv',   b: 'j_gun',    page: 'c_rota',  flag: 'ded_rota' },

  // ---- CAPITULO 3 ----
  // Tres testemunhas contra a memoria dele + a cadeira sem poeira.
  turno:  { a: 'j3_shift', b: 'j3_ash',    page: 'c_turno',  flag: 'ded_turno' },
  // A gaveta que faltava no galpao + a gaveta que sobra aqui.
  gaveta: { a: 'j_clock',  b: 'j3_drawerd', page: 'c_gaveta', flag: 'ded_gaveta' },
  // Sete anos de assinaturas + uma porta que nunca esteve trancada.
  visita: { a: 'j3_book',  b: 'j3_carlos', page: 'c_visita', flag: 'ded_visita' },
};

// Procura uma deducao para o par (ordem nao importa). Devolve { id, ...def }.
export function findDeduction(k1, k2) {
  if (!k1 || !k2 || k1 === k2) return null;
  for (const id in DEDUCTIONS) {
    const d = DEDUCTIONS[id];
    if ((d.a === k1 && d.b === k2) || (d.a === k2 && d.b === k1)) return { id, ...d };
  }
  return null;
}

// Resolve um par {pt, en} no idioma atual. Usado por conversas, caderno e
// inventario, que guardam o texto junto do dado em vez de numa chave.
export function tx(o) {
  if (!o) return '';
  return o[lang] !== undefined ? o[lang] : o.pt;
}

export function line(key, idx) {
  const arr = LINES[key];
  if (!arr || !arr[idx]) return '';
  return arr[idx][lang] !== undefined ? arr[idx][lang] : arr[idx].pt;
}

export function lineCount(key) {
  return LINES[key] ? LINES[key].length : 0;
}

export const SPEAKER = {
  self: { pt: 'EU', en: 'ME' },
};

export function speaker(id) {
  const s = SPEAKER[id];
  if (!s) return '';
  return s[lang] !== undefined ? s[lang] : s.pt;
}
