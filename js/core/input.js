// input.js — teclado, mouse e gamepad atras de nomes de acao.
// Nenhum sistema do jogo deve perguntar por 'KeyD'; pergunta por 'right'.

const BINDINGS = {
  left:     ['ArrowLeft', 'KeyA'],
  right:    ['ArrowRight', 'KeyD'],
  up:       ['ArrowUp', 'KeyW'],
  down:     ['ArrowDown', 'KeyS'],
  run:      ['ShiftLeft', 'ShiftRight'],
  interact: ['KeyE'],
  attack:   ['KeyJ', 'Space'],
  confirm:  ['Enter', 'NumpadEnter', 'KeyE'],
  cancel:   ['Escape', 'Backspace'],
  pause:    ['Escape'],
  skip:     ['Escape', 'Enter'],
  menuUp:   ['ArrowUp', 'KeyW'],
  menuDown: ['ArrowDown', 'KeyS'],
  menuLeft: ['ArrowLeft', 'KeyA'],
  menuRight:['ArrowRight', 'KeyD'],
  debug:    ['F1'],
  animLab:  ['F2'],
  // Capitulo 2
  journal:  ['KeyQ'],
  bag:      ['Tab'],
  map:      ['KeyM'],
  light:    ['KeyF'],
  breath:   ['ShiftLeft', 'ShiftRight'],
  struggle: ['KeyM'],
};

class Input {
  constructor() {
    this.down = new Set();
    this.pressedFrame = new Set();
    this.releasedFrame = new Set();
    this.heldTime = new Map();
    // dx/dy servem à inspeção de itens; na mira, dy move o cano e dx vira
    // David quando o jogador cruza o mouse para o lado oposto.
    this.mouse = { x: 0, y: 0, down: false, pressed: false, right: false, rightPressed: false, dx: 0, dy: 0 };
    this.anyPress = false;
    this.lastDevice = 'keyboard';
  }

  init() {
    window.addEventListener('keydown', e => {
      // ---- F11: TELA CHEIA ----
      //
      // ⚠ ELE E TRATADO AQUI DENTRO, E NAO DEIXADO PARA O NAVEGADOR, por
      // dois motivos que so aparecem quando se olha:
      //
      //   no .exe .......... a janela e um WebView2, e ali o F11 do
      //                      navegador simplesmente NAO EXISTE. Sem isto o
      //                      atalho nao faz nada no pacote que as pessoas
      //                      baixam.
      //   no navegador ..... o F11 nativo NAO e a mesma coisa que a API de
      //                      tela cheia: ele estica a janela mas deixa
      //                      `document.fullscreenElement` nulo. A opcao nas
      //                      configuracoes leria "DESLIGADO" com o jogo em
      //                      tela cheia — uma configuracao que mente.
      //
      // Tratando os dois pelo mesmo caminho, o atalho e o menu concordam
      // sempre. E como isto roda DENTRO do evento de tecla, e um gesto do
      // usuario de verdade: nenhum navegador recusa por falta de permissao.
      if (e.code === 'F11') {
        e.preventDefault();
        if (!e.repeat && this.onFullscreen) this.onFullscreen();
        return;
      }
      // F5/F12 continuam funcionando; o resto o jogo consome.
      if (!['F5', 'F12'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.down.add(e.code);
      this.pressedFrame.add(e.code);
      this.heldTime.set(e.code, 0);
      this.anyPress = true;
      this.lastDevice = 'keyboard';
    });
    window.addEventListener('keyup', e => {
      this.down.delete(e.code);
      this.releasedFrame.add(e.code);
      this.heldTime.delete(e.code);
    });
    window.addEventListener('blur', () => { this.down.clear(); this.heldTime.clear(); });
    window.addEventListener('mousedown', e => {
      this.anyPress = true;
      if (e.button === 2) { this.mouse.right = true; this.mouse.rightPressed = true; }
      else { this.mouse.down = true; this.mouse.pressed = true; }
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 2) this.mouse.right = false;
      else this.mouse.down = false;
    });
    window.addEventListener('mousemove', e => {
      this.mouse.dx += e.movementX || 0;
      this.mouse.dy += e.movementY || 0;
      // Posicao absoluta na janela. A mira usa so o movimento relativo, mas
      // o inventario precisa saber ONDE o cursor esta para arrastar item.
      this.mouse.cx = e.clientX;
      this.mouse.cy = e.clientY;
    });
    window.addEventListener('blur', () => { this.mouse.right = false; this.mouse.down = false; });
    window.addEventListener('contextmenu', e => e.preventDefault());
    return this;
  }

  update(dt) {
    for (const [k] of this.heldTime) this.heldTime.set(k, this.heldTime.get(k) + dt);
  }

  // chame no fim do frame
  flush() {
    this.pressedFrame.clear();
    this.releasedFrame.clear();
    this.mouse.pressed = false;
    this.mouse.rightPressed = false;
    this.mouse.dx = 0;
    this.mouse.dy = 0;
    this.anyPress = false;
  }

  isDown(action) {
    const keys = BINDINGS[action];
    if (!keys) return false;
    for (const k of keys) if (this.down.has(k)) return true;
    return false;
  }

  pressed(action) {
    const keys = BINDINGS[action];
    if (!keys) return false;
    for (const k of keys) if (this.pressedFrame.has(k)) return true;
    return false;
  }

  released(action) {
    const keys = BINDINGS[action];
    if (!keys) return false;
    for (const k of keys) if (this.releasedFrame.has(k)) return true;
    return false;
  }

  // Quanto tempo a acao esta segurada (o maior entre as teclas ligadas).
  held(action) {
    const keys = BINDINGS[action];
    if (!keys) return 0;
    let m = 0;
    for (const k of keys) { const t = this.heldTime.get(k); if (t !== undefined && t > m) m = t; }
    return m;
  }

  axisX() {
    return (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0);
  }
}

export const input = new Input();
