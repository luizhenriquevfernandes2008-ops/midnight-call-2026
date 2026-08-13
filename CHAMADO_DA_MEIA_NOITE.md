# 🕛 THE MIDNIGHT CALL — Documento Mestre do Projeto

> **Arquivo de acompanhamento oficial.** Toda sessão é registrada aqui: o que foi
> feito, o que falta, bugs encontrados, resolvidos e pendentes, o que funciona e o
> que não funciona.
> **Nunca apagar histórico** — só adicionar sessões novas e atualizar os status.

---

## 📑 ÍNDICE

1. [Identidade do Projeto](#1-identidade-do-projeto)
2. [Stack Técnica](#2-stack-técnica)
3. [Como rodar](#3-como-rodar)
4. [Estrutura de Pastas (real)](#4-estrutura-de-pastas-real)
5. [Arquitetura](#5-arquitetura)
6. [Direção de Arte](#6-direção-de-arte)
7. [ANIMAÇÃO — área completa](#7-animação--área-completa)
8. [ÁUDIO — área completa](#8-áudio--área-completa)
9. [Status Geral](#9-status-geral)
10. [O que FUNCIONA](#10-o-que-funciona)
11. [O que NÃO FUNCIONA / falta](#11-o-que-não-funciona--falta)
12. [Bugs — Registro Completo](#12-bugs--registro-completo)
13. [⚠️ RESSALVAS — o que precisa mudar](#13-️-ressalvas--o-que-precisa-mudar)
14. [Roadmap — Capítulo 2](#14-roadmap--capítulo-2)
15. [Decisões Técnicas](#15-decisões-técnicas)
16. [Dúvidas em Aberto](#16-dúvidas-em-aberto)
17. [Log de Sessões](#17-log-de-sessões)
18. [Glossário](#18-glossário)

**Legenda de status usada no documento inteiro:**

| Símbolo | Significado |
|---|---|
| 🟢 | Feito, testado, funcionando |
| 🟡 | Feito mas **não validado em jogo real** — precisa de teste humano |
| 🟠 | Precisa de atenção agora / decisão pendente |
| 🔴 | Quebrado ou bloqueado |
| ⚪ | Não começado — escopo futuro, não é pendência |
| 🔥 | Crítico |

---

## SESSÃO 31 — 12/08/2026 · Claude · a demo virou produto, e foi publicada

⚠ **Nenhum arquivo de `js/` foi tocado nesta sessão.** Havia trabalho em
andamento do Capítulo 4 na pasta (`chapter4.js` e `levels-ch4.js` novos, mais
quatro arquivos modificados, o último salvo às 21:48). Tudo o que segue
aconteceu **fora** do projeto, em `DEMOS/midnight-call-demo/`.

**A demo está no ar:**
https://github.com/luizhenriquevfernandes2008-ops/midnight-call-demo

### 1. As perguntas do Luiz, respondidas com medição

> *"só preciso enviar o executável e nada mais? qualquer um pode abrir mesmo
> sem ter Java, Python e tals?"*

**Sim, um arquivo só.** E a lista de dependências foi verificada, não
afirmada:

| | |
|---|---|
| Python | dentro do `.exe` |
| Java | nunca foi usado |
| .NET Framework 4.x | parte do Windows desde 2019 (aqui: 4.8) |
| WebView2 | vem no Win10/11 — **e se faltar, o jogo abre no navegador** |
| | Windows 10 ou 11, **64 bits** |

O caminho do navegador foi **testado de verdade** (`TMC_SEM_JANELA=1`):
servidor de pé, HTTP 200, jogo servido.

> 🐛 **E ele estava quebrado.** A versão anterior abria o navegador e dava
> `input()` num programa **sem console**: a leitura falhava, caía num
> `Event().wait()` e o processo ficava vivo **para sempre**. Quem fechasse a
> aba ficava com um jogo rodando invisível, sem janela, só matável pelo
> Gerenciador de Tarefas — numa máquina que já estava sem WebView2, ou seja,
> no pior dia possível do jogador. Agora a caixa de aviso **é** o botão de
> sair: trava ali, segura o servidor, e ao clicar OK fecha tudo.

### 2. O que faz parecer jogo comprado

- **Ficha do executável.** Propriedades → Detalhes mostra `The Midnight
  Call`, `Demo 1.0`, `© 2026 Luiz Fernandes`. Sem isso os campos ficam
  vazios, e nada denuncia mais rápido que a coisa foi empacotada às pressas.
- **Um nome só.** O executável era `Chamado da Meia-Noite.exe` enquanto a
  janela e a tela de título diziam `THE MIDNIGHT CALL`.
- **A saída arrumada.** `dist/onefile/` e `dist/onedir/` são nomes de
  ferramenta; viraram `The Midnight Call.exe` e `The Midnight Call - Demo.zip`
  na raiz, com o cru em `_bruto/`.
- **`COMO JOGAR.txt`** dentro da pasta: controles, requisitos e o aviso do
  SmartScreen.

### 3. 🔴 O que eu achei olhando, e não foi pedido

**O menu de título da demo mostrava `ARENA DE COMBATE` e `SALA DE TESTE`** —
duas salas de desenvolvimento — e o rodapé dizia `VERSAO DE TESTE 0.1 —
FATIA JOGAVEL`. Nada disso quebra o jogo; tudo isso denuncia que ele não foi
terminado, e uma demo é justamente a promessa de que vai ser.

O `construir.py` aplica dois patches **na cópia** (nunca no projeto — havia
gente trabalhando nele): tira as duas entradas e troca o rodapé por
`DEMO 1.0 — CAPITULOS 1 A 3`. Os dois **explodem o build** se não acharem o
trecho esperado: patch por texto envelhece mal, e uma substituição que falha
em silêncio mandaria a sala de teste junto com a demo.

### 4. 🔥 O susto: o build saía da pasta de trabalho

Enquanto eu empacotava, **outra frente estava implementando o Capítulo 4 nos
mesmos arquivos** — o último salvo três minutos depois de o build começar. O
pacote pegou o estado estável **por sorte**.

Agora ele sai de um **commit** (`git archive`), e diz o que ficou de fora:

```
fonte: commit 3f683c3 Capitulo 4 escrito: a casa, o cigarro e a ruina
  (8 arquivo(s) modificado(s) no disco FICARAM DE FORA)
```

### 5. 🐛 E o build achava o jogo errado

O caminho do projeto era absoluto e escrito na mão — quebrou no dia em que as
pastas foram reorganizadas. A busca que entrou no lugar aceitava *"qualquer
pasta com `index.html` e `js/main.js`"*, e isso acertou o alvo errado **duas
vezes**:

1. pegou uma **cópia velha** do próprio jogo, sem as correções — o build saiu
   inteiro e só quebrou na verificação;
2. e havia **outro jogo** na árvore (DUNGEON GOLD) com a mesma forma.
   Empacotar o jogo errado passa despercebido até alguém abrir o `.exe`.

**Forma não identifica nada.** A checagem agora procura o nome do jogo dentro
do `index.html` e o documento mestre — identidade. E quando acha mais de uma
cópia, lista as outras em vez de escolher em silêncio.

### Verificação

- `verificar.py` roda contra o **bundle empacotado** e mede efeito: 33 fases,
  `waitkey`, e a tela cheia indo **1264x681 → 1920x1080 → 1264x681** chamando
  as funções do próprio menu.
- O `.exe` publicado foi **baixado do GitHub e comparado por hash** com o que
  eu testei: `B28B50D4…` nos dois. O que está no ar é o que passou.

### O que ficou no ar

| | |
|---|---|
| Repositório | `midnight-call-demo`, **público** |
| Release | `v1.0-demo`, com o `.exe` (16,7 MB) e o `.zip` |
| Conteúdo | Capítulos 1 a 3. O 4 não entrou — está escrito e não implementado |

> ⚠ **Continua sendo teste humano:** apertar F11 e ENTER com o dedo, e mandar
> para **uma** pessoa antes de mandar para várias — é a única forma de saber o
> que o SmartScreen e o antivírus dela vão dizer.

---

## SESSÃO 31 — 12/08/2026 · Claude · o Capítulo 4 entrou no jogo

O que a sessão 30 escreveu, esta implementou. **Dá para entrar por MENU →
CAPÍTULOS → 4 e jogar do começo ao fim.**

### 1. 🔥 Os cinco setores, e cada um montado **duas vezes**

`js/world/levels-ch4.js` (~1.100 linhas). Os sete setores do papel viraram
**cinco no jogo** — a varanda e os fundos são partes do setor da rua, e o
telefone acontece na sala. Nada de conteúdo caiu; o que caiu foi tela de
carregamento no meio de uma casa que tem 40 metros.

| Setor | Largura | O que tem |
|---|---|---|
| `ch4_rua` | 1150 | a fachada, a varanda, o sapato, os fundos, o homem |
| `ch4_sala` | 820 | a Julie, o rádio, o retrato, **o telefone** |
| `ch4_cozinha` | 620 | a gaveta, e a **caixa de papéis** |
| `ch4_corredor` | 520 | **o buraco**, e a figura |
| `ch4_quarto` | 560 | a cama feita, os desenhos, **o armário** |

Cada um carrega os **dois estados prontos desde o boot** em `lv.ch4.casa` e
`lv.ch4.ruina`: camadas, luzes, ambiente, material, som e paredes. Acender um
cigarro **não constrói nada** — `aplicarEstadoCh4()` aponta o setor para o
outro conjunto. A troca custa o mesmo que trocar de sala.

### 2. A mecânica, e a tecla é o `F` de sempre

`js/systems/chapter4.js`. `Cigarro` guarda o maço, o relógio de 40s e a
troca; `Figura`, `HomemDoSobretudo` e `Julie` são silhuetas do rig do
detetive; `Marcas` são os tiros; `Telefone` é o fim.

- **`F` acende; `F` de novo joga fora.** Os dois gastam um cigarro, e jogar
  fora é a animação de ócio do Capítulo 1 — a do *"hoje não..."*. **O gesto
  que define o personagem desde a primeira tela do jogo virou um verbo, e a
  animação já existia.**
- **Sete no maço, sem contador na tela.** Para saber quantos sobraram ele
  abre o casaco e olha.
- **A ruína cobra sanidade** enquanto ele está nela; a casa não devolve, ela
  só não cobra.
- **A figura só se mexe enquanto ele não está fumando.** Sem IA nenhuma: é
  uma posição que anda quando o estado troca.

### 3. 🐛 Um softlock, e foi o teste que achou

**O setor da rua não tinha saída nenhuma no estado "casa".** A porta da
frente está trancada de propósito, e a única entrada é a parede caída — que
só existe na ruína. Quem gastasse o último cigarro na calçada ficava **do
lado de fora para sempre**, com o capítulo por terminar.

A ficção já tinha a resposta: a porta abre **por dentro** sem chave, e o fim
do capítulo conta com isso. Então **depois que ele entra uma vez, ela abre
pelo lado de fora também**.

### 4. 🐛 O relógio do cigarro desfazia a cena final

O fim da versão B derruba a casa para a ruína de propósito. Só que o relógio
— zerado — achava que o cigarro tinha acabado e devolvia a casa em pé no
quadro seguinte: **o jogador ouvia a respiração de criança com o abajur
aceso**. Depois que ele atende, o relógio para.

### 5. 🔍 M-20 — a ruína passou no teste e estava **preta**

O erro M-04 pela terceira vez no projeto, e desta vez com um agravante: **o
teste passava.** Ele conta lâmpadas, não enxerga. Foi preciso tirar captura
de tela para ver que a primeira versão da ruína era uma tela preta com um
boneco no meio.

Duas causas, e a segunda é de composição, não de luz:

1. ambiente `#141c26` e preenchimento 0.16 — números de sala escura, não de
   sala sem telhado;
2. **o topo da tela era parede.** Numa casa sem telhado, o terço de cima
   tem que ser **céu**. `paredeDescascada` começava em y=20; agora começa em
   y=92, e acima dela entra o céu com as pontas dos caibros e um fio de luz
   na linha do telhado.

Agora a ruína é escura e **legível** — que é o que o capítulo precisa, porque
tudo o que ele tem de verdade para contar está do lado destruído.

### 6. 🐛 O aviso do caderno vazava no primeiro quadro

Encher o caderno com o que veio dos capítulos anteriores dispara o aviso de
página nova, e ele estava vivo quando o capítulo abria: *"ANOTADO NO
CADERNO"* piscando em cima de uma casa que o jogador ainda não olhou.
Também foi visto na tela, não no teste.

### 7. Salvar dentro da ruína

Salvar na ruína e carregar devolvia **a casa em pé com o maço cheio** — ou
seja, o save **desfazia o puzzle inteiro**, que é a única coisa que este
capítulo tem. Agora o save leva o maço, o estado, o que resta do cigarro
aceso, o que a figura já andou e as marcas de tiro.

### Verificação

**`ferramentas/teste_capitulo4.html` — 266 checagens, todas verdes**, e
verdes **também dentro do `JOGO_OFFLINE.html`**, não só nos módulos. Cobre os
cinco setores, os dois estados de cada um (camadas diferentes, luz nos dois,
regra numérica de luz nos dois), toda porta nos dois estados, a economia do
maço, o buraco do corredor nos dois sentidos, a troca em cima do buraco, os
quatro obrigatórios, a caixa, os dois finais, a figura andando, o save/load
e o softlock da calçada.

**E uma trava de escrita virou teste:** nenhuma fala `c4_` e nenhuma página
`j4_` pode conter as palavras *lembrança, memória, alucinação* ou *sonho*. O
capítulo inteiro existe para não explicar a casa; agora o teste segura isso.

**As regressões anteriores continuam passando:** Capítulo 2 completo,
Capítulo 3 (1117 checagens — uma asserção atualizada, "três capítulos na
lista" virou quatro), dedução (628) e save de itens.

**`JOGO_OFFLINE.html` regenerado: 43 módulos, 1222 KB.**

### O que isto NÃO é

**Teste humano.** Vale o M-06 de sempre, e vale dobrado aqui:

- **40 segundos de cigarro é um chute de papel** (D-15). Curto demais vira
  corrida contra o relógio; longo demais tira a tensão. É o primeiro número
  a mexer.
- **A ruína pode continuar escura demais** mesmo depois da correção. Isso se
  decide olhando, e eu só olhei em captura estática.
- **Ninguém jogou os 45 minutos seguidos.** O que o teste diz é que a cadeia
  encadeia, não que o ritmo funciona.

---

## SESSÃO 30 — 12/08/2026 · Claude · o jogo tem seis capítulos, e o quatro foi escrito

**Nenhuma linha de código foi alterada.** Sessão de escrita e de decisão de
escopo, no mesmo formato da sessão 18. O capítulo inteiro está em
`ROTEIRO.txt`, **PARTE XI**.

### 1. 🔥 O escopo mudou: **seis capítulos**, travado pelo Luiz

O plano de 10/08 tinha cinco capítulos e o **Capítulo 4 era A CAÇADA** — a
memória da noite do Andrade. O problema era real: gastava ação e revelação
no mesmo fôlego, e deixava o resto do jogo sem ter o que dizer.

Foi levantada uma espinha de dez capítulos e **o Luiz cortou para seis**.
O que caiu era costura, não conteúdo — o capítulo do perito, o do Credor
cobrando e o das três repetições da mesma noite viraram **cenas** dentro do
4, do 5 e do 6.

| # | Capítulo | Min | Verbo | O que entrega |
|---|---|---|---|---|
| 1 | O Homem Que Atendeu | 20 | entrar | o bar, o fio cortado |
| 2 | (o galpão) | 70 | fugir | o espelho, o Credor |
| 3 | Gaveta D | 55 | perguntar | o nome ANDRADE |
| 4 | **A CASA** 🆕 | 45 | lembrar | o endereço, e duas coisas que ele não foi buscar |
| 5 | (a caçada) | 50 | caçar | ele acha o Andrade. E acha a JENNA |
| 6 | (o presente) | 30 | entender | ele é detido, e o jogo diz o que está acontecendo |

**Seis capítulos não é um jogo menor** — é o mesmo alvo de ~5 horas com
capítulos mais densos. E responde a D-07 pelo lado certo.

### 2. 🔥 O Capítulo 4 — "A CASA"

Ele volta à casa **por motivo de detetive**: precisa do endereço do Andrade,
e o único papel dele de sete anos atrás está lá. Chega, e **a casa está em
pé**.

⚠ **Isto não é flashback.** Sem cartela, sem sépia, sem troca de roupa, sem
tirar o controle da mão. O jogo nunca explica, e o David não especula — ele
constata em duas falas e volta ao serviço na terceira. É a regra de ouro
aplicada no capítulo em que ela é mais difícil de manter.

### 3. A mecânica: **o cigarro troca a casa** (ideia do Luiz)

`F` (a mesma tecla do isqueiro do Capítulo 2, que voltou do escaninho 214).

| Estado | Como se entra | O que ele vê |
|---|---|---|
| **A casa** (intacta) | é o **padrão** | luz, rádio, móveis, a Julie no corredor. Quente |
| **A ruína** | acender um cigarro | sem telhado, mato na sala, sete anos de chuva. Frio |

**A inversão importa:** o padrão é a casa boa, e a fumaça mostra a ruína.
Quem joga entra num lugar acolhedor e tem que se envenenar de propósito
para ver a verdade. Ao contrário, seria só uma lanterna.

- **Na casa intacta** ele vê e ouve, e **não pega nada** — a mão atravessa.
  A sanidade sobe. E as **paredes existem**.
- **Na ruína** está todo objeto de verdade, e só ali dá para pegar. A
  sanidade cai. As paredes caídas viraram **passagem**, e o assoalho do
  corredor virou **buraco**.

**O puzzle é de topologia, nos dois sentidos:** tem lugar que só dá para
atravessar fumando e tem lugar que só dá para atravessar **sem** fumar. O
jogador é obrigado a acender de propósito **e a apagar de propósito** — e
apagar é exatamente a animação de ócio do Capítulo 1, a do "hoje não...".
**O gesto que define o personagem virou um verbo, e a animação já existe.**

Um cigarro dura **40 segundos**. Fim do cigarro = a casa volta a ficar em
pé, no mesmo passo, sem corte de tela.

### 4. Sete cigarros — e é a conta que decide o fim

**Sete. Travado pelo Luiz.** Quatro são obrigatórios (entrar, o corredor, a
caixa de papéis, o armário). Os outros três abrem o que o capítulo tem de
melhor, **e é tudo opcional**: o sapato na soleira, o que mora na ruína, e o
homem de sobretudo na varanda.

⚠ **É aqui que a mecânica vira o tema:** tudo que o capítulo tem de verdade
para contar está do lado destruído. Saber tudo custa os sete.

**Não existe contador na tela.** Para saber quantos sobraram ele abre o
casaco e olha o maço.

**E o fim do capítulo sai dessa conta, sem tela de escolha:**

| | O telefone toca, e ele atende |
|---|---|
| **Sobrou cigarro** | atende na cozinha iluminada. **Silêncio absoluto** na linha. Sai pela porta da frente — e o último plano, da calçada, mostra a ruína atrás dele. **Ele vai embora sem saber** |
| **Maço vazio** | atende de pé na cozinha sem telhado, com o fone derretido. E tem **respiração de criança**, três segundos. Ele já sabe |

Nenhuma das duas é a certa: uma é o homem se protegendo, a outra é o homem
que olhou. E a regra de 10/08 continua de pé — **nenhuma palavra sai da
linha**. Respiração não é palavra, e é por isso que ela pode.

### 5. Ele chega com tudo — e a arma pesa

Exigência do Luiz, e paga uma promessa que o Capítulo 3 fez por escrito
("quando a arma voltar, no Capítulo 4, ela vai pesar"). Pistola, calibre
doze, isqueiro, maço e caderno: **é a primeira vez no jogo em que o casaco
está cheio**.

E arma funciona ali. Só que **tiro dado dentro da ruína estraga a casa
intacta** — vidro trincado, o rádio que emudece e não volta, mancha no papel
de parede. Permanente até o fim do capítulo, e o David não comenta nenhuma.

### 6. O que ele acha, em três camadas

1. **O que veio buscar** (e acha no primeiro terço, de propósito): a conta de
   telefone com a chamada das 02h14 vinda do ramal da delegacia, e a agenda
   dele com **ANDRADE e um endereço**.
2. **O que não queria:** o armário do quarto dela, com **marcas de unha por
   dentro** — ela se escondeu, e ficou. E o **sapato pequeno na soleira**,
   fora do alcance do fogo. Ela saiu andando, e passou pela varanda.
3. **O que não se explica:** colchão, cinzas frescas, maços vazios da marca
   dele e um bolo de **cartazes de desaparecida** empilhados na ruína.
   ⚠ O David nunca completa isso. Quem completa é quem joga.

**E isso paga a flag do fim do Capítulo 3** (dar ou não o nome para o
cartaz): se deu, tem um cartaz com o nome impresso, **novo**, numa casa onde
ele não esteve; se não deu, são todos sem nome e um está pela metade, na
letra dele. O fato é o mesmo — muda o que o Capítulo 6 pode cobrar.

### 7. Uma cena arquivada voltou

O **homem de sobretudo** da PARTE IV (opção 2), que tinha sido cortada em
06/08 por "entregar o Credor cedo demais". No Capítulo 4 já não é cedo. Ele
oferece um cigarro com o maço do David vazio: *"Eu também dizia isso." /
"Dizia o quê?" / "Hoje não."*

### 8. A figura anda quando ele não está olhando

A partir do terceiro cigarro há alguém na casa. A regra é única: **ela só se
mexe enquanto ele não está fumando.** Não precisa de IA nenhuma — é uma
posição que anda quando o estado troca — e faz o cigarro ser as duas coisas
ao mesmo tempo: o mapa e a única proteção. Os dois acabam juntos.

### 9. Capítulos 5 e 6, travados

**5 — A CAÇADA.** Ele acha o Andrade, captura e **mata**. E é matando que ele
acha a **Jenna**, viva: é a única cena do jogo em que o David está feliz,
fala pelos cotovelos e chama ela pelo nome. ⚠ **E enquanto ele conversa com
ela, corta** — outro lugar, destruído, frio, e ele está abraçado com o corpo
dela. A cena feliz tem que ser longa e boa; se for curta ou irônica, o corte
não cobra nada. É para isso que o Capítulo 4 constrói esperança durante 45
minutos.

**6 — O PRESENTE.** Ele volta à delegacia e **é detido**. Quem está preso na
delegacia é o David, e sempre esteve. ⚠ **É aqui que ele captura alguém de
verdade** — a única prisão que o jogo entrega em seis capítulos é a dele.

### 10. As travas do Capítulo 4

Uma linha em qualquer um destes pontos derruba o resto do jogo: não explicar
a casa (e **nunca** usar as palavras lembrança/memória/alucinação/sonho);
não revelar a ligação de toda noite (é do 6); não revelar que ele já matou o
Andrade (é do 6); não responder se o incêndio foi posto (D-12); não mostrar
o rosto da figura (D-14); o rosto da Jenna ilegível em todo lugar.

### O que isso custa de código

A casa **já está desenhada** — `js/world/levels-ch3.js`, setores 5a/5b/5c do
flashback. O Capítulo 4 é **a mesma geometria em segundo estado**: desenhar
a ruína, não a casa. Fogo e incêndio (`js/world/fx.js`), primeiro plano com
`playerSobreFore`, sanidade, inventário, caderno, dedução, mira e tiro:
todos prontos. A `musica-casa.mp3` já é carregada. A animação de jogar o
cigarro fora existe desde o Capítulo 1.

**Novo de verdade:** o relógio do cigarro, a troca dos dois estados (colisão
e ordem de desenho), a figura que anda na troca, e as marcas permanentes de
tiro. Nenhum é sistema grande.

### Verificação

**Nenhuma — e isso é honesto.** Não há código para testar. O que existe é
documento, e o risco desta sessão é de outra natureza: **um capítulo escrito
inteiro sem uma tela é um capítulo escrito no escuro**. Vale o M-06 de
sempre, e vale dobrado aqui: 40 segundos de cigarro pode ser curto demais ou
longo demais, e só dá para saber com o dedo na tecla.

---

## ATUALIZACAO CODEX — SESSAO 11 — 06/08/2026

### Puzzle novo do Capitulo 2: **O TURNO DE 02h14**

Implementado e validado na copia exclusiva:
`C:\Users\Vargas\Desktop\chamado da meia noite - CODEX`.
A pasta de trabalho anterior do Claude nao foi alterada.

Repositorio publico exclusivo para testes:
`https://github.com/luizhenriquevfernandes2008-ops/the-midnight-call-tester`.
O remote separado usado por esta copia e `codex-tester`; o `origin` do
repositorio anterior nao recebeu nenhum push.

A chave do mezanino nao fica mais solta no Arquivo Morto. Agora ela esta
dentro de um armario magnetico no Posto de Seguranca. Para libera-la, David
precisa investigar quatro salas novas e reconstruir um circuito alimentado
pelo relogio parado em **02h14**.

Fluxo completo:

1. **Enfermaria** — ligada ao vestiario; entrega o rele **MAO**.
2. **Sala de Evidencias** — ligada ao Arquivo Morto; entrega o rele **OLHO**.
3. **Comunicacoes** — depois das evidencias; entrega o rele **VOZ**.
4. **Posto de Seguranca** — recebe os tres reles e contem o painel e o
   armario da chave.

No painel, o jogador gira vinte placas de circuito ate a corrente sair de
02h14, atravessar **MAO -> OLHO -> VOZ** e chegar ao armario. O caminho
energizado acende em amarelo, portanto o puzzle permite raciocinio visual e
nao depende de uma senha aleatoria. Controles: setas/WASD para selecionar e
`E`, `ESPACO` ou clique para girar; `ESC` fecha o painel.

Mudancas associadas:

- atalho entre Seguranca e o Corredor de Carga, liberado somente depois do
  circuito;
- mapa redesenhado com as quatro salas novas e nomes abreviados proprios de
  planta baixa, sem sobreposicao;
- textos PT-BR/EN, falas de entrada, exames de cenario e duas paginas novas
  no caderno;
- os tres reles e a chave usam `itensSoltos`, somem ao serem pegos e fazem
  parte do estado completo do mundo;
- rotacoes do painel, puzzle resolvido, reles e chave ficam nas flags do
  save; saves antigos que ja tinham `flags.chave` continuam validos;
- `js/systems/puzzle-turno.js` concentra a interface, a propagacao eletrica,
  teclado e mouse;
- `ferramentas/teste_puzzle_turno.html` cobre montagem das salas, conexoes,
  coleta dos tres reles, solucao, entrega da chave e regressao de reload.

Validacao automatizada concluida tanto nos modulos de desenvolvimento quanto
no pacote final:

- quatro salas presentes e conectadas;
- chave antiga removida do Arquivo Morto;
- posicao inicial do circuito nao resolvida;
- solucao reconhecida pela interface real, inclusive com cliques;
- armario revela a chave somente depois da solucao;
- reload devolve ao cenario um rele pego depois do save e mantem ausente o
  rele que ja estava pego no save;
- console do jogo e do pacote sem erros;
- `JOGO_OFFLINE.html` regenerado: **31 modulos, 615 KB**.

**Status:** implementado e testado por regressao. Ainda e recomendado um
teste humano do Capitulo 2 inteiro para avaliar ritmo e dificuldade do puzzle.

---

## ATUALIZACAO CODEX — SESSAO 12 — 06/08/2026

### Correcao geral do Capitulo 2 e expansao dos sistemas

Trabalho feito somente na copia exclusiva
`C:\Users\Vargas\Desktop\chamado da meia noite - CODEX`. A pasta anterior do
Claude e o `origin` dela nao foram alterados.

#### Falas e memoria do mundo

- falas de entrada agora acontecem somente na primeira visita ao setor;
- falas disparadas ao cruzar um ponto ficam registradas em `flags.barks` e
  nao repetem ao voltar ou carregar um save;
- exames de objetos ficam registrados em `flags.examinado`; depois de visto,
  David nao repete a mesma observacao;
- conversas com zelador e telefonista tambem nao reiniciam depois de
  concluidas ou depois de um reload;
- a sequencia da camara fria grava a fase ja vista, em vez de recomecar toda
  vez que David entra na sala;
- as paginas pessoais do caderno foram reescritas com textos maiores,
  observacoes concretas e interpretacao de David, em vez de apenas repetir o
  que o jogador acabou de ver.

#### Perseguicao do Credor

- nova cutscene `scene-chase-intro.js`: primeiro se ouve o portao de correr,
  David identifica a rota da doca, o Credor sai lentamente do escuro e chuta
  David na direcao da fuga;
- a perseguicao so dispara se a telefonista ja foi encontrada e David ainda
  estiver com a pistola;
- o Credor registra o lado real pelo qual David entrou em cada sala. Ele
  aparece atras do percurso, fora da tela, e nao mais na frente por uma
  inferencia errada da posicao do jogador;
- velocidade aumentada, ainda abaixo da corrida de David;
- escondido e prendendo a respiracao: o Credor vai ao ultimo ponto visto,
  procura por pouco tempo, escolhe a saida mais proxima e abandona a sala. A
  musica e a motosserra diminuem com a distancia e voltam a crescer quando
  ele retorna;
- cada tiro reduz a velocidade do Credor. O decimo tiro produz um stun de
  3,8 segundos; o chefe continua invulneravel;
- tiros, lentidao, stun, lado de entrada e estado de busca agora fazem parte
  do save da perseguicao;
- ao carregar um save durante a fuga, a motosserra e recolocada depois da
  troca de ambiente da sala, evitando uma perseguicao restaurada em silencio;
- no fim do capitulo ele conserva a posicao da perseguicao, encara David e
  recua caminhando. A aparicao/teleporte final foi removida.

#### Combate, NPCs e municao

- o soco chama uma caixa de impacto real e causa dano;
- zelador e telefonista podem ser atingidos pela linha real da bala. Um tiro
  mata, toca uma queda dramatica, deixa sangue e dispara uma pista curta de
  que o espaco e as pessoas pertencem a mente de David;
- o estado de morte dos NPCs fica nas flags do save;
- matar a telefonista antes da conversa abre a mesma rota narrativa da fuga,
  com custo maior de sanidade, evitando softlock do capitulo;
- o zelador morto deixa um papel com a combinacao `02-14`;
- a municao encontrada no chao agora soma exatamente sua quantidade a
  reserva. Pegar a pistola nao sobrescreve mais essa reserva com `18`;
- municao sorteada varia tanto de lugar quanto de 3 a 10 projeteis por caixa;
- HUD redesenhado: painel permanente de CORPO e CABECA, barras segmentadas,
  valores numericos e painel de MUNICAO com carregador e reserva.

#### Inventario, curas e sorteio de novo jogo

- os bolsos do sobretudo foram ampliados: dois bolsos internos `4x5`, peito
  `3x2` e cinto `6x2`;
- botao direito sobre um item abre a inspecao volumetrica. Mouse ou setas
  giram o objeto nos eixos horizontal e vertical; `E` usa o item;
- kit de primeiros socorros recupera 45 de vida e e consumido;
- ansiolitico recupera 38 de sanidade e e consumido;
- cigarros continuam inspecionaveis, mas David ainda se recusa a usa-los;
- novo `supplies.js`: em cada jogo novo, municao, kits, ansioliticos e ripas
  sao distribuidos entre 26 pontos possiveis, com quantidades aleatorias;
- uma ripa continua garantida no corredor e municao continua garantida antes
  da pistola, mas o ponto exato muda;
- de 8 a 13 pilhas extras de paletes tambem mudam de lugar por jogo;
- o resultado do sorteio fica em `flags.supplies`; reload mantem os mesmos
  lugares e nao devolve consumiveis ja usados.

#### Radio, recompensa, documentos e cofre

- o radio do vestiario liga a estatica ao entrar. A primeira interacao o
  desliga, a segunda move o ponteiro apesar de desligado, e da terceira em
  diante surgem gritos enterrados no chiado, drenando 16 de sanidade;
- a recompensa do puzzle no mezanino agora e um kit de campo preparado para
  David: expansao narrativa do forro, municao, cura de vida, cura de sanidade
  e um documento;
- o caderno ganhou abas ANOTACOES e DOCUMENTOS (`Z` alterna). Tres documentos
  secretos espalhados por Arquivo, Evidencias e Comunicacoes contam a lore
  em fragmentos 1/3, 2/3 e 3/3 sem entregar a resposta de imediato;
- matar o zelador libera o papel da senha. O cofre entrega municao aleatoria,
  duas curas e uma nota: `A CULPA PRECISA DE UM ROSTO. SABIA QUE TU FARIA
  ISSO.` O texto ofensivo direcionado a um grupo real solicitado no rascunho
  nao foi usado; o easter egg foi mantido perturbador e ligado a mente de
  David, sem atacar pessoas reais.

#### David e apresentacao

- adicionado pescoco desenhado entre cabeca, gola e torso;
- a virada horizontal nao achata mais o personagem a 30% da largura. A
  compressao minima agora e 86%, preservando volume e deixando a troca de
  direcao suave;
- novo loop de estatica e novo efeito sintetico de gritos no radio;
- arquivos novos: `js/systems/supplies.js`,
  `js/systems/scene-chase-intro.js` e
  `ferramentas/teste_regressao_cap2.html`.

#### Validacao

O teste automatizado novo cobre:

- silencio ao revisitar sala, ponto de fala e objeto examinado;
- sorteio de suprimentos, quantidades e paletes;
- acumulo de municao antes e depois de pegar a pistola;
- uso e consumo das duas curas;
- os tres estados do radio;
- morte do zelador, queda da senha e abertura do cofre;
- aba de documentos;
- Credor perdendo o rastro e saindo da sala;
- entrada pelo lado correto e stun no decimo tiro;
- cutscene de saida do escuro, chute e entrega do controle a perseguicao.

`ferramentas/teste_regressao_cap2.html` e
`ferramentas/teste_puzzle_turno.html` passaram nos modulos e no pacote
offline. `JOGO_OFFLINE.html` foi regenerado com **33 modulos, 660 KB**.

**Status:** implementado, validado por sintaxe, regressao funcional e revisao
visual de HUD, inventario e inspecao. Ainda precisa do teste humano de ritmo,
principalmente a velocidade do Credor e a disponibilidade das curas.

---

## ATUALIZACAO CODEX — SESSAO 13 — 06/08/2026

### Segunda rodada de perseguicao, combate e interface

Trabalho feito somente em
`C:\Users\Vargas\Desktop\chamado da meia noite - CODEX`. Nenhuma alteracao
foi feita na pasta do Claude e esta sessao nao foi enviada para nenhum remote.

#### Credor e cutscene

- corrigida a causa real do giro sobre o esconderijo: o alvo da IA era o X
  exato de David. Ao perder o rastro, o Credor agora trava o sentido em que
  vinha, atravessa 92 pixels alem do corpo escondido e continua ate a saida;
- posicao de passagem, direcao e estado oculto entram no save da perseguicao;
- a musica e a motosserra diminuem enquanto o Credor deixa a sala e voltam a
  crescer pela proximidade;
- em perseguicao aberta a velocidade varia de 88 a 170 px/s conforme a
  distancia. David corre a 104 px/s: perto existe margem de reacao, longe o
  Credor e mais rapido e recupera terreno;
- a animacao principal da caca agora e `run`, com velocidade visual ligada a
  velocidade real; a caminhada arrastada fica para busca, saida e suspense;
- a fuga nao congela mais David na soleira. Ele entra na sala de maquinas,
  ouve o portao, identifica a rota e pode andar cerca de 82 pixels;
- depois desse trecho o Credor corre do escuro a ate 255 px/s, usa a nova
  animacao `kick`, joga David 82 pixels na direcao da fuga, faz o protagonista
  cair com `collapse` e levantar com `standUp`;
- durante a queda e a recuperacao o Credor anda devagar. Quando David termina
  de levantar, o monstro troca imediatamente para corrida e o controle volta.

#### Inventario, texto e telefonista

- a inspecao passou a atualizar o cursor e ganhou um botao clicavel
  **USAR ITEM**, alem da tecla `E`;
- kit e ansiolitico continuam consumiveis; o mapa usado pelo inventario abre
  a interface real do mapa; isqueiro responde; cigarro continua bloqueado ate
  o capitulo futuro previsto no roteiro;
- a fonte de maquina de escrever usa hastes mais limpas e um corte de alpha
  menos agressivo, preservando acentos e miolos em tamanhos pequenos;
- caixas de dialogo ficaram maiores, com corpo em 11px, maior contraste,
  espacamento de linha e peso normal;
- falas sobre a cabeca agora quebram linha dentro de um painel escuro fixo,
  sem disputar leitura com o cenario;
- a telefonista morta deixa uma ficha perfurada com cinco cartuchos. A ficha
  entra na aba DOCUMENTOS e liga a origem da chamada ao proprio David.

#### Balistica, violencia e ritmo

- a bala nao para mais no primeiro corpo: todos os inimigos e NPCs alinhados
  na reta podem ser atingidos pelo mesmo disparo;
- o ponto vertical do impacto e classificado como cabeca, torso, pernas ou
  pes, causando respectivamente 7, 3, 2 ou 1 de dano;
- headshot letal remove as pecas `head` e `headBlank` somente daquele inimigo,
  produz particulas maiores, fragmentos, flash, tremor e mancha no piso;
- todo impacto deixa sangue no rig do inimigo e particulas no ponto exato;
- manchas de piso persistem por setor e fazem parte do save;
- David acumula sangue no sobretudo a cada morte. A quantidade cresce mais
  quando a vitima esta perto e tambem persiste no save;
- o teto global subiu de 3 para 4. Salas hostis recebem um inimigo adicional
  sobre o limite anterior, o intervalo probabilistico caiu para 42% do valor
  antigo e o silencio inicial caiu para 4,5 segundos;
- o descanso depois de matar caiu de 40–60 segundos para aproximadamente
  10–20 segundos; salas marcadas com limite zero continuam seguras;
- corrigido `rastejante`, tipo inexistente em uma sala, para o Empilhado que
  o design realmente usa.

#### Validacao

`ferramentas/teste_regressao_cap2.html` agora tambem cobre:

- passagem do Credor pelo esconderijo e abandono da sala;
- caminhada antes da cutscene e entrega do controle depois de queda/levante;
- drop da telefonista, cinco cartuchos e documento;
- dois inimigos alinhados mortos pela mesma bala;
- headshots removendo as duas cabecas;
- sangue acumulando em David apos mortes proximas.

Passaram no navegador local:

- regressao completa dos sistemas do Capitulo 2 nos modulos;
- a mesma regressao no `JOGO_OFFLINE.html`;
- puzzle completo do turno de 02h14;
- regressao de save e restauracao de itens.

`JOGO_OFFLINE.html` regenerado com **33 modulos, 672 KB**. Revisao visual da
inspecao confirmou nome, descricao, instrucao de giro e botao **USAR ITEM**
separados e legiveis.

**Status:** implementado e validado por regressao automatizada e revisao
visual. A velocidade adaptativa do Credor e a nova frequencia de inimigos
ainda precisam de teste humano para ajuste fino de dificuldade.

---

## SESSÃO 29 — 11/08/2026 · Claude · a tela cheia que não enchia a tela

O Luiz jogou o pacote da sessão 28 e trouxe duas coisas. Na primeira eu
**entreguei uma opção que não funcionava**; na segunda ele apontou um erro de
desenho que era meu e estava escrito na tela.

### 1. 🐛 B-76 — a opção existia, e não fazia nada

> *"além de não ficar em tela cheia..."*

Procede, e o defeito é o pior tipo: **falha silenciosa**.
`requestFullscreen()` dentro de um WebView **embutido** — que é o caso do
`.exe` — não devolve erro, não rejeita a promessa e **não acontece nada**. A
janela fica do mesmo tamanho.

Provado com clique de verdade (gesto de usuário legítimo, não sintético):
`chamou: true`, `erro: null`, `fullscreenElement: null`, `1280x720` antes e
depois.

**Por quê:** num WebView embutido a página não manda no tamanho da janela.
Ela *avisa* o programa hospedeiro de que quer tela cheia, e é o **hospedeiro**
que tem que esticar. Se ninguém escuta do lado de fora, o pedido morre em
silêncio.

**A correção, sem quebrar a regra do projeto.** O jogo continua **não sabendo
que existe um `.exe`**. Ele passou a procurar um gancho opcional:

```js
window.__telaCheia = { ativa(), alternar() }
```

Se existir, ele manda. Se não existir — navegador, servidor de dev,
`JOGO_OFFLINE.html` — cai na API padrão, que ali funciona. É o mesmo padrão
do `musica-casa.mp3`: uma coisa opcional que, quando falta, ninguém sente.

Quem preenche o gancho é o **lançador da demo**, que é de fora do jogo: uma
ponte `js_api` do pywebview chamando `toggle_fullscreen()` na janela nativa.

> 🐛 **E a ponte nasceu quebrada também.** Guardei a janela em `self.janela`,
> atributo **público** — e o pywebview varre os atributos públicos do objeto
> para montar o espelho dele em JavaScript. Ele tentou serializar o objeto
> nativo do Windows inteiro e entrou em recursão infinita:
> `AccessibilityObject.Bounds.Empty.Empty.Empty…` umas trezentas vezes,
> terminando em `maximum recursion depth exceeded`, e a janela nem abria.
> Com `self._janela`, só os métodos atravessam a ponte.

### 2. O Esc não podia ser duas coisas

> *"não faz sentido o esc sair da tela cheia se o esc sai das opções"*

Está certíssimo, e o pior é que **eu tinha escrito isso na tela**: a dica
embaixo da opção dizia `ESC SAI DA TELA CHEIA`, dentro de um painel onde o
Esc **volta**. Eu documentei a confusão em vez de resolver.

Resolvido de graça pela correção acima: no `.exe` a tela cheia agora é estado
da **janela nativa**, não da página. Com `document.fullscreenElement` nulo, o
navegador não tem tela cheia nenhuma para o Esc desfazer — o Esc chega no jogo
limpo e só fecha o menu. **Isso é medido**, não suposto.

A dica virou `F11 ALTERNA A QUALQUER MOMENTO`, que é a única tecla que faz só
uma coisa, e agora aparece com a linha selecionada — ela ensina o atalho em
vez de avisar de um efeito colateral.

### 3. 🔍 M-19 — eu verifiquei a existência da API, não o efeito dela

O erro de método da sessão 28, e ele é grande. Minha verificação perguntava:

```
permitido: true    temApi: true    noMenu: true
```

As três verdadeiras, **e a tela cheia não funcionava**. Eu escrevi no
documento que estava "provado que a API está liberada" e mandei o pacote.

*"A API existe" nunca foi "a janela estica."* Perguntei ao sistema se ele
**tinha** a função em vez de medir o que ela **fez**. É a mesma família do
M-07 (testei que o NPC existe, nunca que ele aparece) — e eu tinha esse erro
escrito no documento, de mim mesmo, e repeti.

A verificação agora mede a **área útil da página antes e depois**:

```
janela ....... 1264 x 681
em tela cheia  1920 x 1080     <- esticou
devolvida .... 1264 x 681      <- voltou
```

E ela chama **as mesmas funções que o menu do jogo chama**, e não o gancho
direto — provar que a ponte funciona não prova que o jogo chega nela. Foi
justamente isso que pegou uma cópia velha do `panels.js` na pasta de build,
reproduzindo o bug original em cima do arquivo errado.

### Verificação

- `teste_capitulo3.html`: **1117/1117, TUDO VERDE** (o B-71 não piscou desta vez).
- No `.exe`, a corrente inteira medida: `alternarTelaCheia()` do jogo → gancho
  → Python → `toggle_fullscreen()` → **1264x681 → 1920x1080 → 1264x681**, com
  o menu lendo `false → true → false` e `document.fullscreenElement` nulo o
  tempo todo (por isso o Esc não interfere).
- O `.exe` final aberto: janela 1280x720 numa tela de 1920x1080, título
  **"The Midnight Call"**, 95 MB.

> ⚠ **O que continua sendo teste humano:** apertar ENTER e F11 com o dedo. O
> arnês entrega tecla com `code` vazio, então o jogo nunca vê um ENTER de
> verdade. Eu provei que a função do menu estica a janela; não provei que a
> tecla chega até ela.

---

## SESSÃO 28 — 11/08/2026 · Claude · tela cheia, e a voz sai da demo

Duas ressalvas do Luiz em cima do pacote da sessão 27.

### 1. A dublagem saiu da demo — e não custou uma linha de código

> *"remova a dublagem do começo da demo"*

O `narrator.mp3` saiu do pacote. **Isso é o certo, e não é só gosto:** aquela
gravação não corresponde ao roteiro — é o **B-20**, aberto desde a sessão 03.
O áudio tem 60,76s contra 77s de texto, e a correlação entre os blocos de
fala e as legendas deu 0,15, ou seja, nenhuma. Numa demo, uma voz dizendo uma
coisa enquanto a legenda diz outra é **pior do que voz nenhuma**.

Não houve mudança no jogo. O sistema já tinha sido escrito para isso lá atrás:
sem arquivo, `playNarration()` devolve `null`, a cutscene passa a correr pelo
cronômetro próprio (`narrTimer` contra `NARRATION_END`) e as legendas aparecem
nos tempos escritos em `js/i18n.js`. Uma linha na `LISTA_NEGRA` do
`construir.py`, e pronto. Quando a gravação nova existir, é só tirar o nome
de lá — não há código para desfazer.

**Verificado rodando a abertura inteira sem voz:** as **18 legendas**
aparecem na ordem, o carro freia na hora certa, e a cena entrega no beco aos
89,2s. As fases saíram `fadein → drive(77,8s) → decel → stop → dooropen →
exit → closedoor → walk → enter → JOGO`.

Saíram junto o `roteiro-narracao.srt` e o `LEIA-ME.txt` de `assets/audio/`:
material de oficina, que o jogo não lê. **A pasta de áudio do pacote agora
está vazia** — o jogo da demo é 100% som sintetizado.

### 2. Tela cheia nas opções — e o F11 que não existia

> *"adicione uma opção de tela cheia nas configs"*

Linha nova no painel de opções, entre LEGENDAS e LINHAS DE TELA.

**Ela não é uma preferência guardada, e não podia ser.** Tela cheia é estado
real da janela, e navegador nenhum entra nela sem um gesto do jogador — não dá
para restaurar sozinho ao abrir o jogo. Guardar `fullscreen: true` no arquivo
de opções criaria uma configuração que **mente**: apareceria LIGADO com o jogo
em janela. Então a linha não tem campo em `settings`: ela lê
`document.fullscreenElement` a cada quadro e mostra a verdade. Se o jogador
sair pelo Esc, a opção acompanha sozinha, porque nunca teve opinião própria.

**O F11 passou a ser tratado dentro do jogo**, e isso corrigiu duas coisas que
só apareceram olhando:

| Onde | O que acontecia |
|---|---|
| no `.exe` | o F11 do navegador **não existe** num WebView2. O atalho não fazia nada no pacote que as pessoas baixam |
| no navegador | o F11 nativo **não é** a API de tela cheia: estica a janela e deixa `fullscreenElement` nulo. A opção nova leria DESLIGADO com o jogo em tela cheia |

Tratando os dois pelo mesmo caminho, o atalho e o menu concordam sempre. E
como isso roda **dentro do evento de tecla**, é gesto de usuário de verdade —
nenhum navegador recusa por falta de permissão.

### 3. 🐛 B-75 — a lista de opções passou a bater no rodapé

Achado ao pôr a linha nova: a altura da caixa é `linhas * 16 + 16`, e a tela
tem 270px. Com 12 linhas a caixa passou a terminar em y=243, **por cima** da
descrição de dificuldade que é desenhada em y=229 — um número escrito na mão.

Agora o passo diminui sozinho quando a lista cresce (16px até 11 linhas, 15px
acima disso) e o rodapé é calculado a partir do fim da caixa. A próxima opção
nova não quebra nada.

### Verificação

- `teste_capitulo3.html`: **1116/1117**. A única falha é o **B-71**, o
  intermitente de sempre — piscou de novo nesta rodada.
- A fiação da tela cheia foi provada com espião na API: ENTER liga, ENTER
  desliga, seta alterna, o painel **continua aberto**, e — o que importava —
  **nada é escrito em `settings[undefined]`**, que era a armadilha de pôr uma
  linha sem campo no mesmo caminho do `bool`.
- Dentro da **janela do `.exe`**: `fullscreenEnabled: true`,
  `requestFullscreen` existe, a opção está no menu, e `narrationUrl: null`
  com o jogo em `waitkey` e 33 fases.
- O `.exe` final foi aberto: janela **"The Midnight Call"**, 95 MB, servindo
  em `127.0.0.1:61068`.

> ⚠ **O que eu NÃO consegui verificar sozinho:** apertar ENTER na opção e ver
> a tela encher. O arnês de automação entrega a tecla com `code` vazio, então
> o jogo nunca vê um ENTER de verdade — dá para provar que o caminho é
> percorrido e que a API está liberada, não que a janela esticou. **Isso é
> teste humano.**

### Tamanho

O pacote caiu de **17,8 MB para 16,7 MB** com a saída da dublagem.

---

## SESSÃO 27 — 11/08/2026 · Claude · o jogo virou um .exe

O Luiz pediu uma versão que rode na máquina de quem baixar. Feita **fora do
projeto**, numa oficina separada:

```
C:\Users\Vargas\Downloads\midnight-call-demo\
```

⚠ **Nada do projeto foi alterado por causa disso.** A oficina só *lê* daqui.
O `index.html` com o servidor de dev e o `JOGO_OFFLINE.html` continuam
exatamente como sempre — o empacotamento é uma casca por fora, não uma
dependência nova. A regra de ouro do projeto (o jogo tem que rodar com dois
cliques numa máquina que só tem o HTML) continua de pé.

### 1. O que foi escolhido, e por quê

A máquina não tem **node, rust nem dotnet** — só Python 3.13 (da Microsoft
Store) e o **WebView2 runtime já instalado** (151.x). Isso descartou Electron
e Tauri de saída e apontou um caminho só:

| Peça | O que faz |
|---|---|
| **PyInstaller** | vira o `.exe`. Funciona com o Python da Store, apesar de a documentação dizer que não — testado antes de prometer qualquer coisa |
| **pywebview** → WebView2 | a janela nativa. É o motor do Edge, que já vem no Windows 10/11 |
| **servidor local** | `http.server` em `127.0.0.1`, porta sorteada pelo sistema |

**Por que um servidor, e não abrir o HTML direto:** o jogo é ES modules, e
navegador nenhum carrega módulo por `file://`. É o mesmo problema que criou o
`JOGO_OFFLINE.html` lá na sessão 04 — só que num `.exe` dá para resolver
melhor, subindo um servidor de verdade dentro da própria máquina. Nada é
exposto para fora: `127.0.0.1` só a própria máquina enxerga.

**A janela não é um navegador:** sem barra de endereço, sem abas, com o ícone
e o nome do jogo. E se a máquina do jogador não tiver WebView2, o jogo **não
quebra** — avisa e abre no navegador padrão, pelo mesmo servidor local.

### 2. A música de 110 MB não entrou, e isso foi decisão

O `musica-casa.mp3` ficou **fora do pacote**, por duas razões que já estavam
escritas na ressalva R-34:

1. **Tamanho** — 110 MB contra 18 MB do pacote inteiro. Ela sozinha faria o
   download ficar seis vezes maior.
2. **Direitos** — a faixa veio do YouTube. Ouvir na própria máquina enquanto
   testa é uma coisa; **mandar para outras pessoas é outra**, e essa é a que
   estava sendo pedida.

O jogo lida com a ausência sozinho, como sempre lidou: entra o piano
sintetizado. Está documentado no `LEIA-ME.txt` da oficina como religar isso
(cortar 1–3 min em loop a 128 kbps e tirar o nome da `LISTA_NEGRA`).

Também ficaram de fora `ferramentas/`, os testes, este documento, o
`ROTEIRO.txt` e o `.git`. **O jogador recebe o jogo, não a oficina.**

### 3. O que foi entregue

| Pacote | Tamanho | Para quê |
|---|---|---|
| `dist\onefile\Chamado da Meia-Noite.exe` | 17,8 MB | mandar por link. Um arquivo, dois cliques |
| `dist\Chamado da Meia-Noite (pasta).zip` | 17,7 MB | a versão em pasta, zipada |
| `dist\onedir\Chamado da Meia-Noite\` | 36,6 MB | abre instantâneo, e dá para trocar um arquivo em `_internal\jogo\` sem reconstruir |

Mais o `icone.ico` — um relógio com os dois ponteiros de pé, em brasa sobre
preto. Gerado por `fazer_icone.py`, **em Python puro**: não há Pillow nesta
máquina e não valia exigir uma dependência para desenhar um quadrado. Um
`.ico` aceita PNG inteiro dentro, e PNG dá para escrever na mão com `zlib`.

### 4. 🔍 Como isso foi verificado — e não foi "compilou, então funciona"

Compilar não prova nada: o risco todo estava em o `pywebview` carregar o
backend do Windows **por nome, em tempo de execução**, coisa que o
PyInstaller não enxerga sozinho (daí os três `--hidden-import`). Um pacote
com essa dependência faltando compila liso e depois abre no navegador achando
que a máquina não tem WebView2.

Então existe um `verificar.py`, que **também é empacotado** e faz a pergunta
para o próprio jogo, de dentro da janela:

```
temJogo: True     estado: waitkey     fases: 33
crash: False      canvas: 480x270     audio ctx: true
```

Rodado nos dois lugares — como script e **como `.exe` empacotado**, que é o
que importa. Nos dois: `O JOGO RODA NA JANELA`. E o `.exe` final foi aberto
de verdade: dois processos (o carregador e o jogo, 97 MB), janela com título
**"The Midnight Call"**, 12 processos do WebView2 e o servidor em
`127.0.0.1:59787`.

### 5. Duas coisas que vão acontecer na distribuição

Estão no `LEIA-ME.txt` da oficina, mas ficam registradas aqui porque não são
bug e vão gerar pergunta:

- **O SmartScreen vai avisar** na primeira abertura, em qualquer máquina.
  Acontece com todo programa sem assinatura digital. Some só com certificado
  de assinatura de código (US$ 200–400/ano) — vale quando o jogo for vendido,
  não numa demo entre amigos.
- **Algum antivírus pode reclamar.** Executável de PyInstaller `onefile` é
  falso positivo clássico, porque se descompacta ao abrir. A versão em
  **pasta** costuma passar limpa, porque não se descompacta. É por isso que
  os dois formatos existem.

---

## SESSÃO 26 — 11/08/2026 · Claude · três coisas que ficam onde não deviam

Três reclamações do Luiz jogando. Todas procedentes, e **duas delas são o
mesmo defeito** com roupas diferentes.

### 1. 🐛 B-72 — a doze continuava no armário depois de pega

> *"faça a doze sumir da parede quando pegar"*

A calibre doze estava **pintada na camada do cenário** (`rect(g, …)` dentro
do `buildDeskRoom`). Tudo no jogo é pintado uma vez e depois só deslocado —
é o que faz ele rodar a 60fps sem sprite sheet. Só que **pixel pintado na
camada não some**: ela ia para o casaco e continuava encostada lá dentro do
móvel. Dois doze, um deles fantasma.

O projeto já tem a solução pronta e escrita desde o Capítulo 2 —
`itensSoltos()`, a lista de coisas desenhadas por quadro e filtradas por
`pego`. A doze e a caixa de cartuchos saíram da camada e entraram nela; o
**armário** continua pintado, porque armário não se leva embora. E o `pego`
já entra no save, então ela continua fora do armário depois de carregar, e
volta num jogo novo.

### 2. 🐛 B-73 — o David reaparecia do nada no fim do flashback

> *"apos entrar na casa no flashback o david sai do nada e fica andando ate o
> flashback acabar, faça ele nao voltar para fora, acabe o flashback assim
> que ele entrar"*

Duas linhas, no fim da cena do incêndio:

```js
this.ativo = false;
game.player.det.alpha = 1;   // <- devolve o David
```

O `alpha` voltava a 1 **no mesmo quadro** em que a cena era desligada. E como
o fogo só é desenhado enquanto a cena está ativa, o resultado era o pior
possível: a casa voltava a ser uma **casa normal, intacta**, e o David
reacendia em pé na soleira com a animação de andar ainda em laço — andando
no lugar, por 3,4 segundos, até o fade acabar.

O erro de fundo é de ordem: **a tela só começava a apagar depois de a cena
terminar**, e aí já era tarde. Agora a cena avisa no instante em que ele
atravessa a soleira (`onEntrou`), com a casa **ainda queimando**, e é esse
aviso que escurece a tela — 1,3s de fade sobre o vão em chamas. O fim da
cena virou rede de segurança e não acende mais ninguém; quem devolve o
`alpha` é o `enterLevel` do setor seguinte.

O flashback acabou de encurtar de ~3,4s de rabo para 1,3s. Ele não é uma
cena da qual se sai — é uma porta que se atravessa.

> Como agora existem **dois** caminhos para `voltarDoFlashback()` (o corte e
> a rede), ele ficou idempotente: quem chega primeiro fecha a porta. Sem
> isso, entrar na cela duas vezes empilharia as falas de entrada.

### 3. 🐛 B-74 — ele respondia a última pergunta do capítulo andando

> *"na saida da receção, na pergunta do cartaz, o david fica andando para
> fora enquanto fala, faça ele ficar parado"*

**É o mesmo defeito do B-73.** `frozen` zera a velocidade e desliga a máquina
de estados do jogador — mas **não para a animação**:

```js
if (this.frozen) { this.vx = 0; this._updateBarks(dt); d.update(dt); return; }
```

O quadro que estava rodando continua rodando, em laço. Ele chega na recepção
**andando para a saída**, o plantonista chama, o jogo congela — e ele fica
andando para fora, no lugar, durante a pergunta que fecha o capítulo.

Agora `fimDoCapitulo3()` diz em que pose ele para (`idle`) e **para onde ele
olha**: para a guarita, não para a rua. Sair de costas enquanto respondem a
última pergunta era a leitura errada da cena — ele para na porta e olha para
trás.

> **A regra que sai daqui:** quem congela um personagem no meio de uma cena
> precisa dizer em que pose ele para. `frozen` sozinho não é uma pose, é uma
> pausa na física. As outras cenas do capítulo já faziam isso por acidente
> (o interrogatório toca `intAsk`, a ligação toca `interact`) — estas duas
> não faziam, e eram justamente as duas que congelam alguém **em movimento**.

### 4. O que o teste passou a cobrir

De **1106** para **1117** asserções:

- a doze está na lista de itens desenhados **por quadro** (se voltar para a
  camada, o teste cai), o armário fica marcado como vazio, e ela volta ao
  lugar num jogo novo;
- o corte do flashback avisa na soleira, **com a casa ainda queimando**, com
  o David já invisível — e ele **não reaparece** em nenhum quadro até a cena
  acabar, nem no fim dela;
- na pergunta do cartaz ele está em `idle`, com `vx` zero, virado para a
  guarita — e o teste chega lá **andando de verdade**, que é a única forma
  de o bug existir.

### Verificação

- `teste_capitulo3.html` contra `index.html`: **1116/1117**. A única falha é
  o `as pernas dele ficam ESCONDIDAS pelo balcao` — o **B-71**, que já estava
  registrado como intermitente na sessão passada e acabou de piscar de novo.
- O mesmo contra o `JOGO_OFFLINE.html` regerado: **1117/1117, TUDO VERDE** —
  incluindo o B-71, que na mesma rodada não piscou. É exatamente o
  comportamento que o registro dele descreve, e mais uma razão para arrumar:
  uma asserção que depende de sorte não diz nada quando fica verde.
- As três cenas foram **olhadas** em captura: o armário com a doze e vazio
  depois de pega, o vão em chamas escurecendo sem o David dentro, e ele
  parado de frente para a guarita com a pergunta do cartaz na tela.

---

## SESSÃO 25 — 11/08/2026 · Claude · o chute que agora acha a porta

Duas coisas apontadas pelo Luiz jogando. As duas procedentes — e a primeira
é a **mesma** que a sessão 24 deu por resolvida.

### 1. 🐛 B-69 — o chute na porta, de novo (e agora pelo lado certo)

> *"o david no flashback não chuta a porta, ele chuta o ar e fica lá"*

A sessão 24 corrigiu **um** dos dois jeitos de errar esse chute e declarou
vitória. O que ela consertou foi o relógio: antes a cena trocava de fase por
tempo, e se a corrida não tivesse acabado o pé saía no meio do quintal.

O que ela **não** viu é que a corrida só sabia andar para a **esquerda**:

```js
if (p.x > parada + 2) { p.x -= 132 * dt; ... }   // e mais nada
const perto = Math.abs(p.x - (alvo + 20)) < 8;   // parada fixa à direita
```

A porta fica em `x=665`. Quem sai de casa pela porta da frente cai em
**`x=660`** — cinco pixels à **esquerda** dela (`levels-ch3.js:1081`,
`tox: 660`). E é exatamente aí que o telefone toca e que o jogador atende,
porque desde a sessão 21 o telefone é dele e se atende de qualquer lugar.

Resultado: `p.x > 687` era falso, ele não andava; `|660 − 685| < 8` era
falso, ele não chutava. Ele ficava plantado na calçada enquanto a cena
passava por cima dele — caía sozinho no meio da rua, levantava e sumia
andando, com a porta inteira.

**Por que o teste não pegou:** a asserção *"ele chuta A PORTA, não o ar"*
existia desde a sessão 24 e passava. Ela começava a cena em `x=780`, do lado
certo. Testava o único caso que já funcionava.

**Como ficou.** A cena agora **olha onde ele está** antes de mover um dedo:

| | |
|---|---|
| `lado` | de que lado da porta ele está, decidido no 1º quadro |
| `parada` | a marca no chão, `alvo + lado * 20` — do lado dele |
| `dir` | para onde ele olha, chuta, cai e entra |

Ele anda até a marca **venha de onde vier** (corrida, virando caminhada nos
últimos 34px, que de quebra dá desaceleração), **vira de frente** para a
porta e só então o pé sai. Queda e entrada andam no sentido de `dir`, não
mais para a esquerda fixa.

E a fase do chute deixou de ter duração: ela tem **condição**. Enquanto ele
não chutou, o relógio não avança — senão uma caminhada mais longa termina
em `queda` com a porta ainda inteira. Como condição que nunca chega prende o
jogador no passado (é o buraco do B-56, entrando por outra porta), há uma
rede: 5 segundos tentando e os pés vão para a marca de uma vez.

### 2. Duas coisas que só apareceram olhando a tela

Achadas depois, com a cena rodando quadro a quadro e capturas do
`/snap`. **Nenhuma das duas o teste pegaria** — as duas são de enquadramento.

**Ele atravessava a casa.** A fase `entra` empurrava 46px/s por 1,35s = 62px
sem limite nenhum. Ele entrava pelo vão e **saía pelo outro lado**,
meio transparente, na calçada. Agora ele para **no vão** — a porta é o fim
do caminho, é para isso que ele chutou.

**A queda acontecia atrás da legenda.** A porta cedia, ele caía no chão — e
o corpo deitado ficava inteiro atrás da caixa de fala e da faixa preta de
baixo. O jogador ouvia a porta ceder e via um vão vazio. A câmera agora
**sobe 30px durante o incêndio**, pelo mesmo motivo que ela já subia nas
conversas. De brinde, cabe o telhado pegando fogo — que é a única coisa na
tela que diz que a casa acabou.

### 3. 🐛 B-70 — a música só existia dentro de casa

> *"arrume também a música que adicionei, ela deve tocar desde o começo do
> flashback, não só na casa"*

Estava escrito setor a setor: `ch3_home` e `ch3_room` ligavam a música, e
`ch3_past` — **a rua, que é onde o flashback começa** — mandava calar. O
jogador entrava no passado em silêncio, ouvia a música nascer ao abrir a
porta de casa e morrer ao sair.

A música é do **passado inteiro**, não da sala de estar. Os três setores
agora ligam ela, e trocar de sala não reinicia nada (`tocarMusicaArquivo`
devolve `true` se já estiver tocando; `startMusic` ignora pedido do mesmo
tema). De passagem saiu um `stopMusic()` incondicional que fazia o piano
sintetizado **recomeçar do zero a cada porta** quando não há mp3.

E ela continua morrendo onde sempre morreu: **no instante em que ele
atende**. A flag `atendeu` é lida na entrada do setor, para uma sala
revisitada depois da ligação não ressuscitar o tema.

### 4. O que o teste passou a cobrir

O `teste_capitulo3.html` foi de **1068** para **1106** asserções:

- o chute roda agora de **quatro pontos de partida** — `660` (saindo de
  casa, o caso que quebrou), `780`, `1050` e `200` — e cada um confere sete
  coisas, inclusive **para que lado ele está virado** ao chutar e se ele
  reaparece visível fora do vão depois de a porta ceder;
- a música é conferida nos dois caminhos, **com e sem mp3**: nasce na rua,
  atravessa casa e quarto sem cortar, não volta depois da ligação, e o
  presente troca pelo tema da delegacia.

Para conferir a trilha sem pôr 110 MB para tocar no meio da bateria, o teste
troca as chamadas de áudio por um registro — e para isso o `window.__dev`
ganhou `audio`. **Isso era necessário:** módulo é singleton **por janela**, e
o teste roda o jogo dentro de um `<iframe>`; importar `audio.js` da página de
teste devolvia outra instância, a que ninguém estava usando. Foi assim que a
primeira versão desses testes falhou dez vezes com o registro vazio.

### 5. 🔍 M-16 e M-17 — os erros de método desta sessão (meus, e da 24)

**Um teste que só cobre o caso que funciona é pior que nenhum teste**, porque
ele dá autorização para escrever "corrigido" no documento. A sessão 24
escreveu *"O chute na porta agora acerta a porta"* com uma asserção verde que
começava do lado certo da porta. O Luiz encontrou o mesmo bug jogando, uma
sessão depois.

A regra que sai daqui (**M-16**): **quando o bug for de posição, o teste
começa de todas as posições** — principalmente da que o jogo produz sozinho.
`x=660` não é um caso de canto; é onde o jogador *sempre* está, porque é onde
a porta de casa cospe ele.

E a outra (**M-17**): o chute tinha **dois** defeitos independentes, o
relógio e a direção. A sessão 24 fechou o primeiro, viu a cena funcionar do
ponto que testou e deu o caso por encerrado. **Achar uma causa não é achar a
causa** — fechar um dos caminhos só torna o outro mais difícil de encontrar
depois, porque agora o sintoma aparece com menos frequência.

### Verificação

- `ferramentas/teste_capitulo3.html` contra `index.html`: **1106/1106,
  TUDO VERDE**.
- O mesmo contra o `JOGO_OFFLINE.html` regerado: **1106/1106, TUDO VERDE**,
  em duas rodadas seguidas.
- ⚠ No meio do caminho, duas rodadas contra o pacote acusaram `as pernas
  dele ficam ESCONDIDAS pelo balcao`. Cheguei a atribuir isso a uma
  diferença entre os dois builds — **e estava errado**: a mesma asserção
  passou nas duas rodadas seguintes, no mesmo pacote, sem mudança de código.
  É uma medição de imagem que **pisca**. Registrada como B-71 e alheia a
  esta sessão (nada aqui toca na recepção).
- A cena foi rodada quadro a quadro e **olhada** em captura nos dois
  sentidos de aproximação: corrida, chute, porta cedendo, queda no vão,
  levantar, atravessar e o vão vazio antes do corte.

---

## SESSÃO 24 — 11/08/2026 · Claude · a portaria, o chute e a virada

Oito coisas apontadas pelo Luiz jogando. Todas procedentes.

### 1. 🔥 A VIRADA — o Capítulo 3 deixou de ser sobre o passado

Era a reclamação mais importante da lista: *"está muito raso"*. E estava —
o David ouvia a confissão, ganhava o nome, e ia embora como se nada tivesse
mudado.

Agora, no fim do interrogatório, ele **decide**:

> "Ela tá viva."
> "Eu procurei sete anos um corpo que nunca existiu."
> "Andrade abriu a porta. Andrade sabe pra onde ela foi."
> "Então eu acho o Andrade."
> "E ele me diz. De um jeito ou de outro, ele me diz."
> "Depois disso eu vejo o que sobra de mim."

São as **únicas seis linhas do jogo inteiro em que o David decide alguma
coisa em voz alta**. Ele passou três capítulos reagindo; aqui ele para. E a
regra de ouro continua de pé: ele não junta migalha em voz alta e não
especula sobre estar louco — ele faz o que um detetive faz, que é pegar o
único fato acionável que tem e ir atrás dele.

A página `j3_caca` fecha com a frase que devolve o preço: *"e eu já sei o
que eu sou capaz de fazer com um homem algemado."*

### 2. 🐛 B-64 — o David atravessava a cela e a recepção

**Não era colisão, era ordem de desenho.** A grade da custódia e a frente da
guarita são camadas de primeiro plano em paralaxe 1:1 — existem para o preso
ficar atrás das barras e o plantonista atrás do vidro. Só que a camada é
desenhada **depois de todo mundo**, e o David ia junto: parado no corredor
ele aparecia por trás da grade (= dentro da cela), e na recepção por trás do
balcão (= dentro da guarita).

Colisão não resolveria e ainda partiria as duas salas ao meio: o corredor
passa **na frente** da cela, e bloquear aquele vão deixaria o livro de
visitas inalcançável. Nesses dois setores o primeiro plano passou a ser
desenhado **antes** do jogador (`playerSobreFore`).

### 3. 🐛 B-65 — a doze não avisava nada

O aviso de "peguei alguma coisa" existia desde a sessão 09 e era desenhado
dentro de `drawCh2UI()` — **só no Capítulo 2**. No 3 ele nunca aparecia.
Agora é desenhado nos dois, e existe um **aviso próprio** (`aviso()`), uma
faixa no alto da tela, para as trocas que o jogador **não** fez com as
próprias mãos.

### 4. A portaria: entregar para entrar, retirar na saída

O escaninho 214 deixou de ser botão opcional. **Sem entregar, a porta do
plantão não abre** — e a recusa diz o motivo, na fala e no aviso. Ficam lá a
arma, a doze e o isqueiro; o maço e o caderno continuam com ele, porque são
pessoais e o capítulo depende dos dois.

Na saída, com o capítulo pronto, o mesmo escaninho devolve tudo e avisa
quantos itens voltaram.

### 5. O chute na porta agora acerta a porta

Ele chutava o ar. A troca de fase era por **relógio**: se a corrida não
tivesse acabado, o pé saía no meio do quintal e ele atravessava uma porta
fechada. Agora a corrida continua dentro da fase do chute até ele estar ao
alcance, ele **vira de frente** e só então chuta — e a porta **abre**: o vão
é desenhado por cima do cenário, com o batente lascado e o clarão saindo de
dentro.

### 6. 🐛 O balão de interação aparecia no meio das cenas

Com a casa pegando fogo e o jogador sem controle nenhum, a porta continuava
oferecendo "ABRIR". Prompt só existe quando há o que apertar.

### 7. Música e gritos podem vir de arquivo

Dois slots opcionais em `assets/audio/`: `musica-casa.mp3` (baixa, em loop,
morre no instante em que ele atende o telefone) e `grito.mp3` (média, com o
passa-baixa que é a parede). **Os dois são opcionais** — sem eles o
sintetizado entra no lugar e nada quebra. Essa regra não muda: o jogo tem
que continuar rodando com dois cliques numa máquina que só tem o HTML.

> ⚠ **O `musica-casa.mp3` que está aí tem 110 MB** (48 minutos a 320 kbps —
> é uma playlist, não uma faixa). **O GitHub recusa arquivo acima de 100 MB**,
> então ele está no `.gitignore` e não vai para o repositório. Para
> versionar: cortar 1 a 3 minutos que fechem em loop e exportar a 128 kbps
> (≈2 MB). E vale a ressalva de direitos de `assets/reference/` — a faixa é
> de terceiros.

### 8. A doze ganhou desenho no casaco

Silhueta própria: cano duplo, bloco da culatra, guarda-mato e **coronha de
madeira** na ponta. Sem a coronha, uma peça 4x1 vira um cano de ferro.

---

## SESSÃO 23 — 10/08/2026 · Claude · o David entra na cela

Sessão inteira de correção em cima do que o Luiz jogou. Ele encontrou um
capítulo que **não terminava** e um interrogatório em que o David era educado
demais com o homem que mandou matar a família dele.

### 1. 🔥 O capítulo não acabava — corrigido

Fazer tudo e não acontecer nada. A causa: `ch3_pronto` exigia
`flags.cig_livre` **e** o fim de uma conversa com o Carlos que, depois da
sessão 22, deixou de existir. O jogador ficava rodando a delegacia para
sempre.

Agora o gatilho é a própria cena: quebrar o Carlos → o cigarro → *"Eu preciso
sair daqui. Agora."* → e a saída pela portaria pede o nome. O capítulo tem
fim de novo, e o fim é o que sempre foi previsto.

### 2. 🔥 O David ENTRA na cela

A porta que "nunca esteve trancada" deixou de ser só uma frase: agora ela
**abre**. E quando ele atravessa a grade, **a delegacia sai da tela**.

Setor novo **`ch3_dentro`**: 300px, o menor do jogo por muita distância. Não
tem corredor, não tem profundidade e não tem saída no quadro — só concreto,
uma lâmpada e outro homem. A grade fica **atrás** do David, em primeiro plano
1:1, para o jogador ver as barras entre a câmera e o próprio personagem e
entender quem entrou na jaula.

A distância entre os dois é o número mais importante da sala: **46px**. A
88px que eu tinha posto primeiro, o soco acertava o ar — e um soco que não
alcança ninguém não é um soco, é um gesto.

### 3. 🎬 As animações — a parte mais trabalhada até agora

Três animações novas para o David, e a escada está no corpo: cada uma é mais
baixa e mais fechada que a anterior.

| | O que o corpo diz |
|---|---|
| **`intAsk`** | peso na perna de trás, braço cruzado, cabeça inclinada. Distância profissional — ele ainda é um detetive |
| **`intPush`** | um passo à frente, o dedo subindo, o tronco entrando no espaço do outro homem. Ainda é conversa, mas já não é educada |
| **`intHit`** | não é o `punch1` de briga: é um gancho **de cima para baixo em alguém sentado**, com recuo longo e uma **parada de três quadros no impacto** — é a parada que dá peso |

E duas para o Carlos, porque `hurt` é um recuo de quem está **em pé** e um
homem sentado tocando `hurt` parece ter levantado da cadeira para apanhar:

- **`sitHurt`** — as pernas não se mexem. O que recua é o tronco, e a cabeça
  volta devagar demais, como cabeça de quem apanhou de verdade.
- **`sitFlinch`** — a reação ao PRESSIONAR. Nada bate nele; ele só fica menor.

### 4. O Carlos perdeu a árvore de conversa, e o "senhor"

Removida inteira. Tudo o que ele diz agora está na cena jogável — **inclusive
o cigarro**, que era um nó daquela árvore e virou o fim do interrogatório: ele
pede, o David acende um para ele e outro para si, no automático. O degrau 4
acontece com os dois homens já destruídos, que é onde ele sempre devia ter
acontecido.

E ele parou de chamar o David de senhor. Ele não tem medo, não tem respeito e
não tem nada a perder — tratar por você **é** o personagem. O teste agora
reprova qualquer "senhor" na boca dele.

### 5. O resto do "ele mesmo ligou" saiu

Tinha sobrado bastante, e o Luiz reparou. Varridas e reescritas:

- **Michael** agora diz que a companhia **confirmou** a chamada — origem:
  aquela sala, onze segundos — e que ninguém assumiu o telefone.
- **Elaine** tem a linha do livro: 02h13, do ramal daquela sala para a casa
  do David, e **o campo de quem discou está em branco**. É a única linha em
  branco em sete anos de livro. Foi por isso que ninguém quis assinar.
- A **transcrição** do Capítulo 2 dizia "Chamador: D." — agora é
  **"Chamador: A—[inaudível]"**, comida do mesmo jeito que os documentos
  comem o nome da filha.
- A página `j3_michael` do caderno foi reescrita junto.

### 6. A doze é pegável

Item de inventário **4x1** — ela ocupa o cinto inteiro, e é pra ocupar: é uma
arma de cano longo dentro de um sobretudo. Não vira arma jogável no Capítulo 3
(a regra da portaria continua de pé); ela só viaja com ele.

### 7. O incêndio: ele chuta a porta e ENTRA

Antes o estouro do ar jogava ele para trás — ou seja, o jogo decidia por ele
que não dava. Agora ele corre, **chuta a porta** (a animação `kick` que estava
guardada no rig desde a sessão 13), a porta cede, ele cai junto com ela, se
levanta e **atravessa a soleira**. A tela apaga com ele entrando.

A diferença não é de encenação, é de personagem: um homem jogado para trás é
uma vítima do incêndio; um homem que arrombou a própria porta e entrou é
alguém que passou sete anos sabendo que entrou — e que mesmo assim não
adiantou nada.

**E continua sem mostrar nada de dentro.**

### 8. O flashback acontece uma vez só

Abrir a gaveta D de novo não devolve ao passado: *"Já abri essa pasta hoje.
Uma vez foi mais do que suficiente."*

### 9. 🐛 B-62 — a luz da cela não chegava no chão

A lâmpada nova tinha raio 168 pendurada em y=30, e o chão está em 214: a luz
morria **40 pixels antes** de chegar nos dois homens. A sala inteira ficava
preta com duas manchas dentro. É o **B-23 pela quinta vez** no projeto, e
desta vez em uma sala de 300px. Raio para 250, mais uma poça própria na altura
do peito e um contraluz frio na grade.

---

## SESSÃO 22 — 10/08/2026 · Claude · o interrogatório, e a ligação ganha dono

### 1. 🔥 O sistema de interrogatório — `js/systems/interrogatorio.js`

A cela deixou de ser uma árvore de conversa e virou **a única coisa jogável
do Capítulo 3**.

Três verbos, uma barra de **PRESSÃO**, e nenhum número na tela:

| Verbo | Anda | Custa | E ainda |
|---|---|---|---|
| **PERGUNTAR** | 5 a 9 | — | é ofício, e é seguro |
| **PRESSIONAR** | 13 a 18 | 4 de cabeça | é o David escolhendo |
| **BATER** | 24 a 31 | 9 de cabeça | **cala o Carlos**, e a próxima pergunta não anda |

**Bater duas vezes seguidas DERRUBA a barra em 11.** Ele fecha os olhos e
para de falar. É a regra que obriga a alternar — sem ela a cena seria um
botão de socar. Repetir o mesmo verbo também rende 38% menos.

Em três degraus (30 · 58 · 82) ele vaza um pedaço, e é aí que sai a fala que
você pediu, uma por degrau: *"Eu tô quase lá."* → *"Mais um pouco. Eu preciso
sair daqui."* → *"Eu tô quase lá, porra. Fala logo."* Ele não está falando do
interrogatório.

**O que a barra mede não é a resistência do Carlos.** Ele quer contar — passou
sete anos esperando o David sentar na frente dele. A barra mede **o quanto o
David já desceu**, e é por isso que o tom das falas dele muda sozinho em
quatro degraus, do detetive ao irreconhecível, sem o jogador escolher tom
nenhum. A cor da barra acompanha o tom. Verde nunca: isso não é progresso.

**A câmera fecha** — `gfx.aproximar()`, a 1,35x, chamada entre a luz e a
interface para o mundo chegar perto e o texto continuar do tamanho certo.
Resolve a **D-10** na marra: 1,6x amplia o pixel a ponto de denunciar, 1,35x
não. O resto do capítulo continua na câmera lateral de sempre.

> ⚠ **A confissão não presta, e é de propósito.** Foi arrancada na porrada de
> um homem algemado que queria ser interrogado. O caderno registra isso com
> todas as letras, o Michael diz na cara dele, e o David acredita mesmo
> assim. Se der para confiar nela, a cena perdeu o ponto.

### 2. A ligação ganhou dono — e o "ele mesmo ligou" saiu

Você matou a coisa mais frouxa do roteiro. Três personagens repetiam que o
David tinha ligado para si próprio, o que não é mistério: é o jogo dando de
ombros. E a resposta já estava plantada desde a sessão 20 — a Elaine sempre
disse que a chamada entrou **do ramal daquela sala**.

Agora: a telefonista do Capítulo 2 responde de **onde** a chamada veio, não
de quem. O Michael conta que saiu uma chamada da delegacia para a casa do
David um minuto antes. E o Carlos entrega o nome: **ANDRADE**, um policial,
turno da noite, mesa dos fundos, sumido antes do fim do inquérito.

O que gela não é ouvir o nome. É o David **não perguntar quem é** — e o
caderno escrever sozinho, com a letra que não é dele: *"VOCÊ JÁ SABIA O
NOME."* O Michael, se pressionado, completa: os dois dividiram plantão por
quatro anos.

> 📌 **ANDRADE é um nome provisório meu.** Troque quando quiser; ele só
> aparece em três lugares (a confissão, a conversa do Michael e duas páginas
> do caderno).

### 3. 🐛 B-60 — a cadeira da sala de espera estava vazia

Você reparou jogando: o painel de senha contava, a fala dizia "ele está
esperando a vez", **e não havia ninguém desenhado ali**. É o B-57 de novo, com
outra roupa — objeto existe, pessoa não —, e nenhum teste pegou porque todos
conferiam o painel.

E quem senta ali agora, como você pediu, é **a figura negra do Capítulo 1**:
a mesma silhueta sem rosto que derrubou o David no depósito, sentada numa
cadeira de plástico com uma senha na mão, debaixo de luz fluorescente. Ela não
fala, não reage e não é explicada. Olhar três vezes só faz o David ir embora.

Ela também encaixa sozinha na sua história: se a figura é o homem que ele
matou, ela estar esperando atendimento na delegacia fecha sem uma linha de
diálogo.

### 4. 🐛 A encenação da cela estava errada

Com a câmera fechando nos dois, ficou impossível ignorar: as grades eram
pintadas na camada de fundo e as pessoas são desenhadas **depois** das
camadas — então o Carlos aparecia **na frente** da própria cela, e o David
ficava em pé dentro dela.

Grade movida para uma camada de primeiro plano em paralaxe 1:1 (o mesmo
conserto da guarita, sessão 20b), e o David agora tem uma marca fixa do lado
de fora. É o terceiro bug desta família no projeto.

### 5. A calibre doze, e a parada na saída

A **doze** está no armário da mesa dele, carregada e destrancada, sete anos
depois. **Não é pegável** — a arma fica na portaria e essa regra não tem
exceção. Ela é a promessa do Capítulo 4 deixada em cima da mesa, e ele comenta
a conveniência, que é o que ele sempre faz.

E depois da confissão, atravessar o corredor do arquivo **para o jogo**: ele
fala sozinho no meio do caminho. É o único lugar do capítulo em que o David
comenta o que acabou de fazer — e o comentário é sobre ele, não sobre o
Carlos.

> 📌 Entendi "na saída" como a saída da cela. **O fim do capítulo continua com
> duas saídas** (dizer e não dizer o nome), porque as duas são finais válidos
> e uma terceira opção ali enfraqueceria as outras duas. Se você quis dizer o
> contrário, é meia hora de trabalho.

### 6. Música, gritos e arte

- **Dois temas novos**, sintetizados como todo o resto. `casa`: o mesmo piano
  uma oitava acima, com o dobro de silêncio entre as notas, sem chiado de
  vinil — vinil é memória velha, e essa cena não pode soar a lembrança
  enquanto acontece. A frase sobe uma sexta e **nunca resolve**. `delegacia`:
  um bordão grave com um tritom desafinado quase inaudível por cima, e uma
  nota solta a cada oito segundos. Não é tema, é o prédio.
- **A música da casa morre no instante em que ele atende o telefone.** O que
  vem depois não tem trilha.
- 🔊 **Os gritos foram refeitos.** Você tinha razão: a primeira versão eram
  três serras graves debaixo de um passa-baixa de 800 Hz, e isso não é um
  grito, é um mugido. Faltavam quatro coisas: fundamental alta (620–840 Hz,
  não 420), **formantes** (a boca é um filtro com picos fixos — sem elas
  qualquer oscilador soa a sintetizador), **rouquidão** (ruído dentro do tom,
  não ao lado), e **a quebra** (a voz falha, despenca de altura e vira ar). A
  parede subiu para 1,6 kHz: abafado demais e o ouvido para de reconhecer
  voz, e o ponto é reconhecer.
- 🎨 **A roupa do David refeita.** Você tinha razão de novo — estava tudo
  enfiado dentro de tudo. O colete cobria o tronco quase inteiro e a 62px
  virava uma mancha só. O que lê como roupa social num boneco desse tamanho
  não é o tecido, são **três faixas verticais em contraste**: paletó escuro,
  lapela clara, camisa branca e a gravata por dentro. O paletó agora é aberto,
  a camisa aparece inteira do colarinho ao cinto, e a manga é de paletó com o
  punho da camisa saindo na ponta.
- 🎨 **Cabelo comprido na Julie e na menina**, caindo além do pivô da cabeça,
  por cima do ombro. O da menina é mais comprido e está solto — ela devia
  estar dormindo há duas horas.

---

## SESSÃO 21 — 10/08/2026 · Claude · o flashback reescrito, e o fogo

Sessão pedida pelo Luiz, com cinco mudanças no Capítulo 3 e uma correção que
apareceu no caminho.

### 1. Outra roupa no flashback 🟢

David não usa mais o sobretudo marrom nos doze minutos de sete anos atrás.
O sobretudo é a roupa que ele veste **há sete anos sem tirar** — se ele
aparecer com ela no passado, a distância entre os dois homens some.

Peças novas em `creatures.js` (`partesDe('david_passado')`): camisa clara,
gravata e colete de tweed. `coatSkirt: null`, `holster: null`, e um
colarinho de camisa no lugar da gola levantada. A cabeça continua sendo a
dele — quem muda é a roupa, não a pessoa.

O ganho é de silhueta: a aba do sobretudo é quase metade da área do boneco,
e sem ela o corpo fica estreito e os braços aparecem inteiros.

> ⚠ Todas as 26 letras (nas duas caixas) e todos os dez dígitos já estavam
> em uso no mapa de cores de `creatures.js`. A roupa nova usa símbolos
> (`+ = * -`) como chave de pixel. Funciona igual.

A troca entra em `entrarFlashback()` e sai em `sairFlashback()` — inclusive
quando não há estado guardado, e inclusive ao **carregar um save dentro do
passado**, que antes devolvia o homem certo vestido de sobretudo.

### 2. A menina saiu da sala 🟢

Ela não fica mais na sala junto com a mãe. Setor novo **`ch3_room`**, o
quarto dela: 560px, parede lilás, abajur, cama feita que ela nem desfez,
papel de desenho espalhado pelo chão, urso caído, e a janela de onde ela vê
o carro chegar.

A porta fica no corredor do fundo da sala, com a **luz do abajur passando
por baixo** — é ela que diz que tem alguém acordado ali antes de qualquer
fala. São duas conversas em dois cômodos, e o jogador atravessa a casa
entre uma e outra.

A regra da casa vale com mais força aqui: **nenhuma migalha**, nenhum
relógio parado, nenhum número que não fecha.

### 3. O telefone se atende de qualquer lugar 🟢

Era um ponto fixo na varanda: o jogador tinha que procurar a marca certa no
chão para usar o próprio telefone. Errado duas vezes — é um objeto que ele
está carregando, e o gesto que a cena precisa é **sair**, não caminhar até
um X.

Agora, no instante em que ele põe o pé fora de casa, o interagível gruda no
jogador e o botão de **USAR** fica na tela em qualquer ponto da rua até ele
atender. A varanda continua sendo onde a cena acontece, porque é para lá que
ele anda sozinho — mas quem decide onde atender é o jogador.

### 4. 🔥 A casa pega fogo 🟢

Depois dos gritos, a casa começa a queimar. Não é efeito: é o que responde
as duas perguntas que o jogo carregava em aberto desde o Capítulo 1.

| Pergunta | O que o fogo responde |
|---|---|
| **Por que ele não consegue fumar** | Ele estava com um cigarro **aceso na mão** quando a casa dele começou a queimar. O laudo diz origem indeterminada e o Michael diz na cara dele que não foi ele — e não muda nada. Cada "hoje não..." é aquele cigarro |
| **Por que ele acha que ela está viva** | Ele nunca viu o corpo. Tiraram a Julie de lá; da menina não apareceu nada, nem nos onze dias de busca, nem no que sobrou da casa. Sem corpo o caso não fecha — e é por isso que ele ainda manda imprimir cartaz |

`Fogo`, em `js/systems/chapter3.js`: seis fases em ~14,5s — brasa atrás das
cortinas, o vidro estourando, ele correndo até a porta, o estouro do ar
jogando ele para trás, ele se levantando, e ele parado olhando. A chama é
feita de colunas de retângulos com altura sorteada por quadro, em quatro
tons, igual ao resto do cenário do jogo. Fumaça no telhado e brasas subindo
pelo sistema de partículas.

Sons novos: loop `fogo` (rugido grave com LFO + chiado agudo por cima),
`glassBreak`, `fireCrack` e `fireBurst`.

> ⚠ **Nada de dentro da casa é mostrado**, nem antes nem depois. O fogo sai
> pelas janelas, pela porta e pelo telhado, e a câmera fica na varanda. E
> **ele grita um nome só, o da mulher** — o nome da filha não sai da boca
> dele nem com a casa queimando, e é o mesmo que o plantonista vai pedir na
> última cena.

A cena é encenada, não jogada: dar o controle ao jogador aqui seria prometer
que dá para salvar alguém.

### 5. Os diálogos do Capítulo 3 ficaram fundos 🟢

Reclamação do Luiz, procedente: um capítulo que é só conversa estava com
árvores de três perguntas.

- **Julie** foi de 3 para **7 assuntos**, com insistência em quatro deles.
  Ela deixou de ser a mulher que só reage: tem o próprio dia, a própria
  raiva ("a tua cabeça atravessa a porta uma hora depois de você"), o
  próprio medo, e uma coisa que ela quer. Nada de premonição, nada de
  despedida — ela não sabe de nada porque não há nada a saber ainda.
- **A menina** foi de 3 para **6 assuntos**. Criança de verdade: nega o
  óbvio, negocia, apaga a luz com o pé quando ele pergunta da mãe, e tem uma
  teoria própria sobre o trabalho do pai ("some gente e você acha").
- **Michael** ganhou o relatório, o que sobrou da casa, o incêndio e a
  plaquinha da mesa. E a fala dele sobre aquela noite mudou: agora ele conta
  que **viu a luz ao virar a esquina** — o jogador desce para o arquivo já
  sabendo que a casa queimou, e depois joga a noite inteira dentro dela.
- **Carlos** ganhou o que ele faz com sete anos parado, a Julie, e o
  incêndio. Continua sem ameaçar, sem negar e sem confirmar.
- **Ruiz** ganhou os bombeiros (**já estavam na rua** — migalha, e ninguém
  comenta) e a manhã seguinte. **Elaine**, as duas ligações daquela noite e
  por que ninguém quis assinar. **Betinho**, o café e os filhos dele.
  **O plantonista**, o quadro de homenagens e o livro de assinaturas.

**Duas deduções novas:** `fogo` (o incêndio + a gaveta dos cartazes → *sem
corpo o caso não fecha*) e `chama` (o incêndio + o cigarro da cela). A
primeira destrava pergunta com o Michael e com o Carlos.

### 6. 🐛 Bug encontrado de passagem — B-58

Os três objetos examináveis da sala da casa (`c3_home_tv`, `c3_home_table`,
`c3_home_photos`) eram citados pelos interagíveis desde a sessão 20 e **os
textos nunca existiram**. Examinar a televisão, a mesa posta ou os
porta-retratos abria uma **caixa de diálogo vazia**, na única sala quente do
jogo. Nenhum teste pegava porque todos conferiam que o interagível existe —
nunca que ele fala. O teste agora exige texto em PT e EN para todo
interagível com `lines` dentro da casa e do quarto.

### 7. 🐛 E um bug meu, achado pelo teste — B-59

A primeira versão do `Fogo` avançava de fase com
`idx = min(idx + 1, ultima)` e zerava o cronômetro. Na última fase isso
reentrava nela para sempre: o cronômetro voltava a zero antes de a condição
de fim ser lida, **a cena nunca terminava e o jogador ficava preso no
passado**, com a casa queimando em loop e sem controle. O fim virou ramo
próprio.

### Duas coisas ajustadas OLHANDO A TELA, não o teste

- **O colete estava sumindo.** Pintado pela regra da paleta (mais claro do
  que a lógica pede, porque a cena é multiplicada pela luz), ele ficava no
  mesmo valor da camisa que está ao lado dele, no mesmo corpo, sob a mesma
  luz — e o tronco inteiro virava uma mancha bege. Escurecido de propósito:
  é a única exceção da regra no projeto, e ela é segura porque essa roupa só
  existe nos dois setores mais claros do jogo.
- **O fogo estourava de branco.** Na primeira medição as janelas estavam
  chapadas, o bloom comia a parede de tijolo e o David sumia contra o
  próprio incêndio. As luzes caíram para cerca de dois terços e o fogo do
  telhado ganhou passo maior — na largura de coluna das janelas, 356px de
  telhado viravam um pente de dentes iguais atravessando a tela.

> Fogo grande não é fogo claro. É fogo com sombra do lado.

### Verificação

`ferramentas/teste_capitulo3.html` cobre agora, além do que já cobria: a
troca de roupa na ida e na volta, o quarto como setor com ida e volta, texto
de verdade em todo objeto da casa e do quarto, o telefone respondendo de
quatro pontos diferentes da rua, as seis fases do fogo, o fogo terminando
sozinho, o fogo não vazando para outra partida, e o percurso completo
sala → quarto → rua → incêndio → cela.

**Status:** implementado e validado por regressão automatizada.
**Falta teste humano** — e é dele que vem a validação (M-06). O que eu
preciso saber: se a conversa com a Julie dá vontade de ficar, se atravessar
a casa até o quarto é bom ritmo ou enche, e se o incêndio assusta ou parece
efeito.

---

## 1. IDENTIDADE DO PROJETO

| Campo | Valor |
|---|---|
| **Nome** | **The Midnight Call** |
| **Nome em PT** | Chamado da Meia-Noite |
| **Gênero** | Survival horror investigativo, lateral 2D (side-scroller) |
| **Referências** | Silent Hill / The Evil Within (tom) · 2Dark (paleta) · Hope 01 (câmera) · Urban Detective (sprite) |
| **Plataforma** | Navegador desktop |
| **Perspectiva** | Lateral fixa, câmera acompanha no eixo X |
| **Idiomas** | 🇧🇷 PT-BR e 🇬🇧 EN, com seletor no menu |
| **Repositório** | `github.com/luizhenriquevfernandes2008-ops/midnight-call-2026` (público) |
| **Início** | 03/08/2026 |
| **Status** | 🟡 Sessão 31 — **Capítulos 1, 2, 3 e 4 jogáveis do início ao fim.** Nada do 4 passou por teste humano. O jogo tem **6 capítulos**, travado em 12/08 |

### Pitch

Um detetive falido, sem distintivo e sem nada a perder, atende o telefone às
2h14 da manhã. Uma mulher sem nome dá o endereço de um bar fechado há seis
anos. Ele vai. Os inimigos do jogo são os medos e pesadelos da própria cabeça
dele.

### Duração pretendida

**5 horas de jogo.** Estimativa honesta de produção: 250 a 400 horas de
trabalho, ~100 a 140 sessões. Em ritmo de 3 sessões por semana: 8 a 11 meses.
Em ritmo quase diário: 4 a 6 meses.

---

## 2. STACK TÉCNICA

| Camada | Tecnologia |
|---|---|
| Estrutura | HTML5 + módulos ES6 |
| Lógica | JavaScript (ES2020), **zero dependências, zero build obrigatório** |
| Renderização | **Canvas 2D** — buffer interno de 480×270 ampliado com nearest-neighbor |
| Áudio | Web Audio API — **100% sintetizado em código**, exceto a narração gravada |
| Fontes | **Nenhum arquivo de fonte** — texto vem de fonte do sistema com corte duro de alpha |
| Sprites | **Nenhuma sprite sheet** — personagem é rig articulado montado de grades ASCII |
| Cenário | **Procedural determinístico** — tijolo, asfalto, ferrugem gerados por seed fixa |
| Persistência | `localStorage` (10 slots + configurações) |
| Distribuição | `JOGO_OFFLINE.html` — arquivo único de ~321 KB, roda com dois cliques |

### O que NÃO existe no projeto (de propósito)

- Nenhum arquivo de imagem do jogo (só as referências em `assets/reference/`)
- Nenhum arquivo de fonte
- Nenhum arquivo de som além de `narrator.mp3`
- Nenhum `node_modules`, nenhum bundler, nenhum framework

---

## 3. COMO RODAR

| Forma | O que fazer | Quando usar |
|---|---|---|
| 🟢 **Recomendada** | Clique duas vezes em **`JOGO_OFFLINE.html`** | Jogar, mandar para alguém, testar em outra máquina |
| 🔧 Desenvolvimento | `ABRIR_JOGO.bat` (Windows) ou `abrir_jogo.sh` | Editar código e apertar F5 |
| 🩺 Diagnóstico | `DIAGNOSTICO.bat` | Quando não abrir |

**Depois de mexer no código, regerar o arquivo offline:**

```
python ferramentas/gerar_offline.py
```

> ⚠️ **Nunca abrir `index.html` com dois cliques.** Ele usa módulos JavaScript, que
> todo navegador bloqueia em `file://`. A tela fica presa em "carregando...".
> Era exatamente por isso que o jogo não rodava em máquinas alheias.

### Controles

```
A / D  ou setas ....... andar                SHIFT (segurar) ..... correr
E ..................... interagir / avançar diálogo
J  ou  ESPAÇO ......... socar (com a ripa na mão, golpear)

BOTÃO DIREITO (segurar) saca a arma e mira
MOUSE ↑ / ↓ ........... levanta e abaixa o cano (horizontal é IGNORADO)
BOTÃO ESQUERDO ........ atirar               R ................... recarregar

--- Capítulo 2 ---
TAB ................... abre o casaco (inventário) — NÃO pausa o jogo
Q ..................... abre o caderno       M ................... o mapa
X (no caderno) ........ segura uma página; X numa segunda junta as duas
Z (no caderno) ........ troca entre ANOTAÇÕES e DOCUMENTOS
F ..................... isqueiro             SHIFT (escondido) ... prender a respiração
ARRASTAR / R .......... mover e girar item dentro do casaco
E (no casaco) ......... usar o item sob o cursor
E · ENTER · ESC · A · D · J ................. sair de um esconderijo

ESC ................... pausar / voltar      DELETE .............. apagar save
ESC ou ENTER (segurar)  pular a cutscene     F1 .................. depuração
```

Mirando, os pés ficam presos no chão. É de propósito: jogo de terror, não de ação.

---

## 4. ESTRUTURA DE PASTAS (REAL)

```
chamado da meia noite/
├── JOGO_OFFLINE.html          🟢 O JOGO. Arquivo único, dois cliques, sem servidor
├── index.html                 casca + tela de erro (só via servidor local)
├── ABRIR_JOGO.bat             lançador Windows (dev)
├── abrir_jogo.sh              lançador Linux/macOS (dev)
├── DIAGNOSTICO.bat            relatório copiável quando não abre
├── servidor.py                servidor local: acha porta livre, abre o navegador
├── LEIA-ME.txt                instruções para o jogador
├── README.md                  vitrine do repositório (em inglês)
├── CHAMADO_DA_MEIA_NOITE.md   ESTE ARQUIVO — documento mestre
│
├── css/style.css              casca da página, tela de boot e de erro
│
├── js/
│   ├── main.js                máquina de estados, laço principal, QTE, HUD
│   ├── i18n.js                TODO texto do jogo (PT+EN) + narração + falas
│   ├── core/
│   │   ├── gfx.js             buffers, luz, bloom, grão, vinheta, pálpebras
│   │   ├── text.js            texto pixelado a partir de fonte do sistema
│   │   ├── input.js           teclado, mouse (inclui botão direito e eixo Y)
│   │   ├── audio.js           TODO o som, sintetizado
│   │   └── save.js            10 slots + configurações
│   ├── art/
│   │   ├── palette.js         paleta fechada do jogo
│   │   ├── pixel.js           grades ASCII → sprite, rotação, silhueta, dither
│   │   └── detective.js       peças, esqueleto, TODAS as animações
│   ├── world/
│   │   ├── camera.js          câmera lateral com atraso e antecipação
│   │   ├── materials.js       pincéis: tijolo, asfalto, sangue, destroço...
│   │   ├── levels.js          as 5 fases do Cap. 1 + carro + rua da cutscene
│   │   ├── levels-ch2.js      os 8 setores do Capítulo 2
│   │   ├── levels-ch3.js      os 8 setores do Capítulo 3 (com a casa e o quarto)
│   │   ├── levels-chase.js    o segundo ato da fuga, atrás da Doca 3
│   │   └── fx.js              chuva, névoa, partículas, poeira
│   ├── systems/
│   │   ├── player.js          controle, arma, porrete, dano, falas, ócio
│   │   ├── dialogue.js        caixa de diálogo, ESCOLHAS, legendas, balão
│   │   ├── cutscene.js        abertura (carro + narração)
│   │   ├── scene-nota.js      cena da nota, figura negra, nocaute, despertar
│   │   ├── scene-espelho.js   o espelho em PRIMEIRA PESSOA (Cap. 2)
│   │   ├── scene-chase-intro.js  o Credor saindo do escuro e o chute
│   │   ├── sanity.js          o medidor que não aparece na tela
│   │   ├── journal.js         o caderno, a dedução, e as páginas alheias
│   │   ├── inventory.js       o inventário É O SOBRETUDO
│   │   ├── enemies.js         os 3 inimigos, o Credor e o DIRETOR
│   │   ├── npc.js             as pessoas dos Caps. 2 e 3
│   │   ├── chase.js           a perseguição do Credor
│   │   ├── chase-sequence.js  o clímax: portão, palete, pátio de carga
│   │   ├── chase-setpieces.js os recursos de uso único da fuga
│   │   ├── combat-finishers.js  Frenzy e as finalizações
│   │   ├── difficulty.js      HISTÓRIA · NORMAL · DIFÍCIL · MENTE
│   │   ├── supplies.js        o sorteio de munição, curas e paletes
│   │   ├── puzzle-turno.js    o circuito das 02h14
│   │   ├── interrogatorio.js  a cela: três verbos, a barra, e a confissão
│   │   └── chapter3.js        cigarro, senha do Credor, flashback, O FOGO, o nome
│   └── ui/
│       ├── menu.js            tela de título (é uma cena viva, não um cartaz)
│       ├── panels.js          slots de save e painel de opções
│       └── pause.js           menu de pausa
│
├── ferramentas/
│   ├── gerar_offline.py       empacota os 40 módulos no HTML único
│   ├── servidor_dev.py        servidor + endpoint de captura de tela (só dev)
│   ├── teste_capitulo3.html   regressão do Capítulo 3 e do seletor
│   ├── teste_regressao_cap2.html · teste_puzzle_turno.html
│   └── teste_deducao.html · teste_save_itens.html
│
├── assets/
│   ├── audio/
│   │   ├── narrator.mp3       🟠 narração — NÃO corresponde ao roteiro atual
│   │   ├── roteiro-narracao.srt  roteiro das legendas
│   │   └── LEIA-ME.txt        como trocar o áudio e reajustar
│   ├── reference/             🟠 arte de terceiros — APAGAR se o repo for público
│   └── sprites/               (vazia, para sprite sheets futuras)
│
└── docs/
    ├── GAME_DESIGN.md         plano das 5 horas, capítulos, sistemas (inglês)
    └── SESSION_LOG.md         log técnico detalhado por sessão (inglês)
```

---

## 5. ARQUITETURA

### Máquina de estados (`main.js`)

```
BOOT → WAITKEY → MENU ─┬─→ CUTSCENE (abertura) → PLAY ⇄ PAUSE
                       ├─→ PLAY (carregar save)
                       └─→ LAB (sala de teste de animação)

PLAY pode entrar em: SCENE (cena roteirizada) · QTE · ENDCARD
```

### Ordem de desenho de um quadro — **regra que não pode ser quebrada**

```
1. gfx.begin()              limpa a cena
2. camadas de paralaxe      fundo → meio → principal
3. personagem               (+ figura negra, se houver cena)
4. partículas
5. poeira / névoa / chuva   ANTES da luz, para serem iluminadas
6. camada de primeiro plano
7. gfx.beginLights(ambiente)
8. luzes da fase + do jogador + da cena
9. gfx.endLights(bloom)     multiplica a cena pela luz
10. INTERFACE               ← DEPOIS da luz, senão o menu sai escuro
11. gfx.present(dt)         grão, vinheta, scanline, pálpebras, fade, tremor
```

### Pipeline de imagem

Tudo é desenhado num buffer interno de **480×270**. O navegador só amplia o
resultado final, com nearest-neighbor — o pixel nunca borra. A cena é
**multiplicada** por um buffer de luz, com bloom em 1/4 de resolução por cima.

### Sistema de falas ("barks")

Falas curtas em cima da cabeça, uma de cada vez, com respiro entre elas.
Disparam de três formas:

| Origem | Campo | Exemplo |
|---|---|---|
| Ao entrar na fase | `level.enterBarks` | "Alguém chegou antes de mim." |
| Ao entrar, **cortando tudo** | `level.enterBarksNow` | "Alguém ficou parado sangrando aqui." |
| Ao cruzar um ponto | `level.barks[]` | "Isso não foi briga de bar." |
| Por evento de animação | `player.say()` | "hoje não..." |

---

## 6. DIREÇÃO DE ARTE

| Elemento | Decisão |
|---|---|
| **Resolução interna** | 480×270 — 4× exato em 1080p |
| **Altura do personagem** | 62 px (≈23% da tela) |
| **Paleta** | Preto esmagado · âmbar sujo `#e0b070` · vermelho seco `#a8382c` · marrom sobretudo `#6d4c2e` · azul-noite `#2e3644` |
| **Regra de cor** | Tudo dessaturado. A **única** cor com permissão de gritar é o vermelho — reservada para sangue e para o título |
| **Luz** | A cena é multiplicada pela luz. Cor "realista" vira preto: **toda a paleta é pintada mais clara do que a lógica pediria** |
| **Grão de filme** | 0.018, e **pula o personagem** (só 25% de força em cima dele) |
| **Título** | "THE MIDNIGHT CALL" em Impact, corroído pixel a pixel e escorrido, com halo vermelho e piscada de mau contato |
| **Menu** | Não é um cartaz: é uma cena viva, com chuva, poste zumbindo e o detetive acendendo um cigarro que joga fora |

### O personagem

| Parte | Decisão | Por quê |
|---|---|---|
| **Sobretudo marrom fechado** | Pano sólido, lapela dobrada, botões na beirada, cinto | Colete + camisa não formava silhueta nenhuma a 62px. E casaco **aberto** é o que se vê de frente — num jogo lateral a câmera olha o costado |
| **Aba do casaco** | Peça separada, cai até abaixo do joelho, persegue a inclinação **com atraso** e balança a cada passo | É o único lugar do personagem onde "mole" é o efeito certo: pano não acompanha osso |
| **Gola levantada** | Desenhada **atrás** da cabeça | Sem ela a cabeça pousava num pescoço de 2px e parecia recortada e colada |
| **Rosto 3/4** | **Um olho só**, nariz quebrando a silhueta, orelha marcada, cabelo jogado para trás | Dois olhos simétricos faziam ele parecer virado para a câmera — ou de costas |
| **Olho** | 4 pixels com funções diferentes: sobrancelha, esclera, pupila, sombra | Um ponto preto sozinho não é olho, é furo |
| **Cabelo quase preto** | Contraste ganhou do realismo | Cabelo castanho em cima de casaco marrom fazia a cabeça derreter no corpo |
| **Coldre no quadril** | Por **cima** do casaco | Por baixo seria mais realista e completamente invisível |

---

## 7. ANIMAÇÃO — ÁREA COMPLETA

### O sistema

**Não existe sprite sheet.** O personagem é um **boneco articulado**: 12 peças
de pixel art que giram em torno de juntas, com poses-chave interpoladas.
Rotação usa `drawImage` com `imageSmoothingEnabled = false` — o navegador
reamostra por vizinho mais próximo, então o braço continua com cara de pixel
art girando em qualquer ângulo.

**Vantagem:** movimento contínuo a 60 fps de verdade, sem desenhar 30 quadros à
mão por animação.
**Custo:** exige calibragem cuidadosa, senão vira boneco de pano.

### Medidas do esqueleto (a partir do chão)

```
Altura total ......... 62 px        Quadril ........... -28
Coxa ................. 13           Ombro ............. -48
Canela ............... 11           Braço (ombro) ..... ±6 frente / ±7 trás
Braço superior ....... 10           Perna ............. ±3
Antebraço ............. 9
```

> O braço de trás fica **mais afastado** que o da frente (7 contra 6). Com os
> dois no mesmo deslocamento ele desaparecia dentro do tronco e o personagem
> parecia ter um braço só.

### Tabela completa de animações

| Nome | Duração | Loop | Interpolação | Estado |
|---|---|---|---|---|
| `idle` | 4.2s | ✅ | suave | 🟢 respiração sutil |
| `walk` | 0.76s | ✅ | **linear** | 🟢 |
| `run` | 0.50s | ✅ | **linear** | 🟢 |
| `punch1` | 0.38s | ❌ | **linear** | 🟢 com quadro de espera no impacto |
| `punch2` | 0.46s | ❌ | **linear** | 🟢 reverso, passa para a frente do tronco |
| `interact` | 0.60s | ❌ | suave | 🟢 |
| `smoke` | 7.2s | ❌ | suave | 🟢 pega, olha, hesita, **"hoje não..."**, joga fora |
| `smokeLighter` | 10.2s | ❌ | suave | ⚪ guardada — versão com isqueiro (a chama é luz real) |
| `getout` | 1.40s | ❌ | suave | 🟢 sair do carro, subida monótona |
| `read` | 3.4s | ✅ | suave | 🟢 agachado lendo, de costas para a porta |
| `cuffed` | 4.6s | ✅ | suave | 🟢 sentado, pulsos no cano |
| `strainCuffs` | 0.44s | ✅ | **linear** | 🟢 puxando as algemas (QTE) |
| `sitDown` | 1.05s | ❌ | suave | 🟢 de pé → sentado |
| `sitImpatient` | 2.6s | ✅ | suave | 🟢 sentado batendo o pé |
| `standUp` | 0.85s | ❌ | suave | 🟢 sentado → de pé |
| `lookback` | 1.6s | ❌ | suave | ⚪ reservada para sustos |
| `swing1` | 0.62s | ❌ | **linear** | 🟡 golpe de porrete, com quadro de espera |
| `swing2` | 0.70s | ❌ | **linear** | 🟡 volta de baixo para cima |
| `hurt` | 0.44s | ❌ | **linear** | 🟡 recuo de quem apanhou |
| `collapse` | 1.05s | ❌ | suave | 🟡 cair (usada pelos inimigos) |
| `crawl` | 0.94s | ✅ | **linear** | 🟡 **os Empilhados**, de quatro |
| `shamble` | 1.30s | ✅ | **linear** | 🟡 **os Sem-Rosto**, sem pressa |
| `dragWalk` | 1.12s | ✅ | **linear** | 🟡 **o Credor**, arrastando o cano |
| `hide` | 3.4s | ✅ | suave | 🟡 agachado num esconderijo |
| `sitChair` | 5.2s | ✅ | suave | 🟡 sentado numa cadeira (o Vigia) |
| `switchboard` | 4.6s | ✅ | suave | 🟡 a Telefonista trabalhando |

### 🔑 A decisão mais importante: `ease: 'linear'`

Suavizar a entrada **e** a saída de *cada* pose-chave faz todo membro
**desacelerar em todo quadro-chave**. É exatamente isso que produz o balanço
mole de boneco de pano — foi a reclamação "braços muito moles, parece jogo de
sandbox".

Andar, correr e socar usam **interpolação reta**: o movimento tem direção e
para onde o animador mandou, não onde a curva deixou. Só parado, fumando e
sentando usam curva suave.

Outras regras aprendidas:

- **O balanço do braço vem do OMBRO.** No andar, o cotovelo quase não dobra
  (8 a 14 graus). Braço que dobra muito andando parece desarticulado.
- **Correndo o cotovelo TRAVA** num ângulo quase constante (~57°). Quem corre
  não abre e fecha o braço, leva ele preso perto do corpo.
- **Soco precisa de quadro de espera** logo após o impacto. Sem ele o braço
  volta deslizando e o golpe não tem peso nenhum.
- **A cabeça só gira em passos de 7°, máximo 14°.** Girar um rosto de 14px em
  ângulo qualquer reamostra os pixels e borra olho e nariz.
- **Interpolação passa por poses intermediárias.** O `getout` antigo tinha
  joelho a 104° e tronco a 26° ao mesmo tempo; no meio do caminho ele passava
  por posturas que corpo nenhum faz. Rebuild como subida monótona.

### Mira — sobreposição, não animação

O ângulo vem do mouse do jogador, então **não dá para guardar em quadros-chave**.
Depois que a animação normal é calculada, braço da frente, inclinação da cabeça
e do tronco são **sobrescritos** pelo ângulo de mira. O corpo continua
respirando por baixo.

### A figura negra

É o **próprio esqueleto do detetive**, pintado de preto puro via `silhouettePass`,
16% mais alta e 6% mais estreita. Anda com o mesmo rig — por isso se move como
gente e continua sem rosto. Como a cena é multiplicada pela luz, preto continua
preto debaixo de qualquer lâmpada.

### Os inimigos — a ficha médica de um detetive

**`js/art/creatures.js`.** Na sessão 09 eles eram o detetive recolorido, e o
resultado era honesto: dois NPCs que eram *a mesma pessoa*, um sentado e o
outro quase de quatro. Agora cada criatura tem **as peças dela** — cabeça,
tronco, membros — e herda as animações do rig de graça.

A regra: nenhum pode ser um monstro genérico. Cada um tem que ser
reconhecível como **uma ideia**, e a ideia tem que ser um trauma que a
profissão dele produz.

| Quem | O trauma | O desenho |
|---|---|---|
| **Os Sem-Rosto** | as pessoas que ele não conseguiu salvar, e de quem já não lembra a cara | Roupa de trabalho comum. Crânio, cabelo e silhueta de gente — e **nenhum traço dentro do rosto**. Uma mancha escura no peito, onde ele não estancou nada |
| **Os Empilhados** | os corpos. Guardados com pressa, e mal | Dobrado sobre si mesmo, andando de quatro. Lençol de necrotério ainda amarrado, costelas marcando por baixo, e uma **etiqueta amarela amarrada no pé** |
| **O Ecoador** | a ligação que chegou tarde | Vulto magro e translúcido com um **fone de telefone preto no lugar do rosto**, arrastando um fio que não termina em lugar nenhum. Não ataca: TOCA |
| **O Credor** | a conta | Avental de açougueiro ensanguentado por cima do sobretudo, **cabeça de porco costurada em pano de saco**, e uma **motosserra** que nunca desliga |

> A motosserra começa a roncar no instante em que a fuga começa, do outro
> lado do galpão, e o volume dela **é a distância dele**. O jogador ouve o
> Credor muito antes de ver — que é a regra de ouro da perseguição.

**As duas pessoas** também têm desenho próprio: o **zelador** de macacão
verde desbotado que não larga o esfregão nem sentado, e a **telefonista** de
cabelo preso e vestido vinho com gola branca.

Duas técnicas sustentam a troca:

- **`det.parts`** — o rig procura cada peça no conjunto da criatura e cai no
  detetive para o que não estiver definido. Peça `null` simplesmente não é
  desenhada: é assim que os Sem-Rosto não têm gola nem coldre.
- **`tintPass`** (`pixel.js`) — continua existindo para recolorir sem apagar
  a sombra interna, com buffer próprio para não brigar com a luz de contorno.

### Ócio: o que ele faz parado

| Situação | 3s parado | 7s parado | 9s parado | Ao andar |
|---|---|---|---|---|
| **Antes do sequestro** | `idle` | `idle` | **`smoke`** (cigarro) | anda |
| **Depois** (sem nada) | `idle` | **`sitDown`** | `sitImpatient` | **`standUp`** primeiro |

> O tempo em pé antes de sentar é obrigatório. Sentar na hora parece um comando,
> não um cansaço.

---

## 8. ÁUDIO — ÁREA COMPLETA

### Filosofia

**Tudo sintetizado em tempo real**, exceto a narração. Não há um único arquivo
de efeito sonoro no projeto. Chuva, passo, soco, porta, tiro — tudo é ruído
filtrado e osciladores, montados em `js/core/audio.js`.

### Cadeia de áudio

```
                     ┌─ busMusic ────────────────┐
osciladores ─────────┼─ busSfx → duckSfxNode ────┼─→ master → saída
                     └─ busVoice ────────────────┘
                              ↑
       reverb (impulso sintético de 2,6s) ────────┘
```

> ⚠️ O **nó de abafamento é separado** do volume dos efeitos. Se os dois
> mexessem no mesmo parâmetro, a rampa de um cancelaria a atribuição do outro
> dependendo da ordem. Isso já foi um bug (B-14).

### Catálogo de sons

| Categoria | Sons |
|---|---|
| **Passos e corpo** | `step` (seco/molhado), `strain` (esforço) |
| **Combate** | `whoosh`, `punchHit`, `gunshot`, `dryClick`, `reloadClick`, `leather` |
| **Portas e objetos** | `doorCreak`, `doorSlam`, `pipeBurst`, `chainRattle` |
| **Cigarro** | `lighterFlick`, `flameWhoosh` |
| **Ambiente pontual** | `drip`, `metalCreak`, `distantThump`, `thunder`, `carPassBy` |
| **Tensão** | `startDread` / `setDread(k)` / `stopDread`, `heartbeat`, `thud`, `tinnitus` |
| **Interface** | `uiMove`, `uiConfirm`, `uiBack`, `blip` |
| **Loops** | `rain`, `wind`, `roomtone`, `hall` |
| **Música** | piano em Ré menor com reverb longo + bordão + chiado de vinil |

### Ambiente por lugar

Cada fase declara os próprios loops e os próprios sons soltos. Antes, a chuva
seguia o jogador para dentro de qualquer sala — o que dizia ao ouvido que nada
tinha mudado.

| Fase | Loops | Sons soltos |
|---|---|---|
| Beco | `rain` 0.22 · `wind` 0.04 | trovão a cada 26–70s |
| Bar | `roomtone` 0.10 · `rain` 0.035 (abafada) | gota a cada 6–15s |
| Depósito | `roomtone` 0.09 | gota a cada 4–10s |
| **Galpão (cela)** | `hall` 0.11 · `wind` 0.022 | gota 3.5–9s · metal 11–26s · batida distante 22–50s · corrente 17–40s |
| Corredor de carga | `hall` 0.12 · `wind` 0.02 | gota · metal · batida · corrente |
| Escritório | `roomtone` 0.10 | gota a cada 8–20s |
| Estantes | `hall` 0.10 | metal 8–20s · batida 18–40s |
| Vestiário | `roomtone` 0.11 | gota a cada 9–22s |
| **Câmara fria** | `freezer` 0.13 | metal 7–18s · gota 5–13s |
| Sala de máquinas | `hall` 0.09 · **`hum` 0.05** | metal · batida |
| Mezanino | `hall` 0.10 · `wind` 0.03 | metal · corrente |
| **Doca 3** | `hall` 0.07 · **`rain` 0.05** | trovão a cada 20–50s |

> A chuva **volta a ser ouvida na doca**, abafada. É o primeiro sinal, em uma
> hora inteira de jogo, de que existe um lado de fora.

### Música por lugar (Capítulo 3)

Dois temas, e os dois entram **por baixo** do ambiente. A regra do jogo
continua sendo que o silêncio é a arma principal e que a música só existe
para ser cortada.

| Onde | O que toca | Volume |
|---|---|---|
| `ch3_past` · `ch3_home` · `ch3_room` | `assets/audio/musica-casa.mp3` se existir; senão o piano sintetizado (`startMusic('casa')`) | 0.18 |
| todo o resto do capítulo | `startMusic('delegacia')` — bordão grave e um trítono quase inaudível. Não é tema, é o prédio | — |

> **A música é do passado INTEIRO, não da casa.** Ela nasce no primeiro
> quadro do flashback — na rua, ao lado do carro dele — e atravessa a casa e
> o quarto da menina **sem cortar nas portas**: `tocarMusicaArquivo` devolve
> `true` se já estiver tocando, e `startMusic` ignora pedido do mesmo tema.
> Até a sessão 25 ela existia só dentro de casa (B-70).
>
> **E ela morre no instante em que ele atende o telefone.** Daí em diante o
> passado não tem trilha nenhuma — nem se o jogador voltar a entrar num
> setor que a tocava, porque a flag `atendeu` é lida na entrada do setor.

### Sons novos do Capítulo 2

`clubHit` (madeira em corpo, mais seca e grave que o soco) · `clubBreak` (dois
estalos, o segundo mais grave — madeira nunca racha de uma vez) · `phoneRing`
(campainha de martelo contra sino, com abafamento por distância) · `whisper` ·
`writing` · `pageTurn` · `machineStart` · `dragMetal` · `lockerBang` ·
`breath` (com modo "presa") · loops `hum` e `freezer`.

> Os intervalos são **sorteados dentro de uma faixa**. Som em batida fixa deixa
> de ser ambiente e vira metrônomo.

### O tiro

Quatro camadas: estalo agudo, corpo grave filtrado, soco de baixa frequência,
e uma **cauda jogada no reverb**. Sem a cauda soa a balão estourando; com ela
soa a beco.

### A tensão da figura negra

**É comandada pela DISTÂNCIA, não pelo relógio.** Duas serras desafinadas
batendo uma contra a outra, um filtro que abre conforme ela se aproxima, e um
batimento cardíaco cujo intervalo encurta de 1,15s para 0,34s.

No golpe, **a música é cortada em 10 milissegundos**. O silêncio súbito é o
susto; a pancada e o zumbido de ouvido são só o rescaldo.

### 🟠 A narração — situação atual

| Item | Estado |
|---|---|
| Arquivo | `assets/audio/narrator.mp3`, 60,76s |
| Nível | Pico −14,1 dBFS · média −40,7 dBFS — **muito baixo** |
| Correção aplicada | Roteada pelo WebAudio com **ganho ×4 (+12 dB) + limitador** |
| Abafamento | Chuva 0.10→0.030, vento 0.03→0.010, efeitos a 30% enquanto ela fala |
| **Problema** | 🟠 **O mp3 NÃO é a gravação do roteiro atual** |

**Prova de que não corresponde (três verificações independentes):**

1. O roteiro dura 76,5s e a fala 16 começa em 62s. O arquivo tem 60,76s.
2. Forçando o áudio a se dividir em 18 grupos e comparando a duração de cada um
   com a de cada fala: **correlação r = 0,149** (nenhuma). Se batesse, seria 0,7+.
3. A primeira fala do roteiro é uma palavra só ("Engraçado..."), mas o áudio
   abre com **8 segundos de fala contínua** em qualquer limiar testado.

**Mitigação implementada:** `NARRATION_REF_DUR = 76.5` e reescalonamento
automático — o jogo lê a duração real do arquivo e estica ou comprime todas as
legendas na mesma proporção. Salva gravação mais rápida ou mais lenta; **não
salva texto diferente**.

> 📌 **Quando exportar a gravação certa:** trocar `narrator.mp3` e, se a duração
> não for ~76,5s, ajustar `NARRATION_REF_DUR` em `js/i18n.js`. Se a gravação
> nova sair normalizada (pico perto de −3 dBFS), **baixar `GANHO_VOZ` de 4.0
> para ~1.2** em `js/core/audio.js`, senão vai soar espremido.

---

## 9. STATUS GERAL

| Módulo | Status |
|---|---|
| Documentação | 🟢 |
| Distribuição em arquivo único | 🟢 **resolve o "não roda em outras máquinas"** |
| Pipeline de render 480×270 | 🟢 validado |
| Sistema de luz + bloom | 🟢 validado |
| Pós-processamento (grão, vinheta, scanline) | 🟢 e **poupa o personagem** |
| Texto pixelado sem arquivo de fonte | 🟢 acentos PT validados |
| Localização PT / EN | 🟢 |
| Menu de título animado | 🟢 |
| Save em 10 slots com miniatura e rolagem | 🟢 regressão automática passou; falta teste humano prolongado |
| Menu de pausa e opções | 🟢 |
| Rig do personagem | 🟢 |
| Sobretudo + gola + aba | 🟢 |
| Rosto (olho detalhado, boca) | 🟢 |
| Andar / correr / socar | 🟢 |
| Animação do cigarro | 🟢 |
| Arma: sacar, mirar, atirar, recarregar | 🟡 validado por script, falta mão humana |
| Cutscene de abertura (carro) | 🟢 |
| Narração + legendas | 🟠 **áudio não corresponde ao roteiro** |
| Beco | 🟢 |
| Bar (destruído) | 🟢 |
| Depósito + nota | 🟢 |
| Cena da nota + figura negra | 🟢 |
| Galpão + QTE de fuga | 🟡 QTE recalibrado, **precisa de teste humano** |
| Sistema de falas (barks) | 🟢 |
| Sistema de diálogo com NPC | 🟢 **com escolhas, e com dois NPCs usando** |
| Sala de teste de animação | 🟢 |
| **CAPÍTULO 2 — os 8 setores** | 🟡 construídos e percorridos por script |
| **CAPÍTULO 3 — os 8 setores** | 🟡 construídos e percorridos por script, 934 checagens verdes |
| Flashback: a casa, o quarto e o fogo | 🟡 sessão 21, **nada disso foi jogado por uma pessoa** |
| Roupa de sete anos atrás | 🟢 medida na tela, com o colete escurecido para separar da camisa |
| Diálogos do Capítulo 3 | 🟡 aprofundados na 21; só leitura humana diz se prendem |
| **Interrogatório (3 verbos + pressão)** | 🟡 sessão 22/23, dentro da cela, com animação própria por verbo. **Falta mão humana** |
| Entrar na cela (`ch3_dentro`) | 🟢 setor novo de 300px, medido na tela |
| Animações do interrogatório | 🟢 três para o David, duas para o preso apanhar sentado |
| Câmera fechando (`gfx.aproximar`) | 🟢 1,35x, medida na tela. Resolve a D-10 |
| A figura negra na sala de espera | 🟢 desenhada e medida em pixel (B-60) |
| Música da casa e da delegacia | 🟡 sintetizadas; falta ouvir jogando |
| Gritos do incêndio | 🟡 refeitos com formantes e quebra de voz; **falta ouvir**. Aceitam gravação em `assets/audio/grito.mp3` |
| Música vinda de arquivo | 🟢 sistema pronto; o mp3 atual **não vai para o repositório** (110 MB) |
| A virada (ele decide caçar o Andrade) | 🟡 escrita e ligada; **falta ler jogando** |
| A portaria obrigatória | 🟢 entrega, recusa e devolução, com aviso nas três |
| Sanidade (4 estados, sem barra) | 🟡 recalibrada na 09, **falta sentir jogando** |
| Caderno / diário | 🟡 |
| Inventário (o sobretudo) | 🟡 arrastar com o mouse, **falta mão humana** |
| Inimigos (3 tipos) + Diretor | 🟡 |
| Combate com porrete | 🟡 |
| O espelho em primeira pessoa | 🟡 |
| A perseguição do Credor | 🟡 |
| A escada do cigarro (degrau 1) | 🟢 quatro recusas ciclando |

---

## 10. O QUE FUNCIONA

| # | Funcionalidade | Evidência |
|---|---|---|
| F-01 | Jogo roda por `file://` sem servidor | 21 módulos empacotados, boot → menu → cutscene testados |
| F-02 | Cutscene dirigida pela narração, não por relógio | Carro só freia quando a voz acaba; testado com relógio falso |
| F-03 | Legendas seguem o relógio do áudio | Nos segundos 1,07 / 4,68 / 11,93 / 17,37 a legenda certa estava na tela |
| F-04 | Reescalonamento automático de legenda | Escala 0,794 calculada sozinha para o arquivo de 60,76s |
| F-05 | Acentos PT no texto pixelado | `ç í ó ê ã á` renderizam limpos a 12px |
| F-06 | Rig articulado a 60 fps | 16 animações, interpolação por pose-chave |
| F-07 | Fogo de boca é fonte de luz real | Ilumina o beco inteiro por um quadro |
| F-08 | Mira só no eixo vertical | Movimento horizontal do mouse é lido e descartado |
| F-09 | Sequência completa da nota | crouch → read → approach → strike → black → wake → galpão |
| F-10 | Tensão comandada por distância | `setDread(k)` com k derivado da distância da figura |
| F-11 | Corte seco da música no golpe | 10ms de fade |
| F-12 | Pálpebras com duas piscadas | 0,22 → 0,03 → 0,55 → 0,30 → 1,0 |
| F-13 | Ambiente sonoro por lugar | Galpão não tem chuva nenhuma |
| F-14 | QTE de fuga | ~10 toques / 2–3s num ritmo de 5 toques/s |
| F-15 | Ócio muda depois do sequestro | Medido: 6s→idle, 9s→smoke antes; 7s→sitDown depois |
| F-16 | Laço sobrevive a um quadro ruim | 3 falhas seguidas param e mostram o erro |
| F-17 | Servidor acha porta livre e abre o navegador na hora certa | 8137 → 8138 → ... |
| F-18 | Os 8 setores do Cap. 2 montam no boot sem erro | 29 módulos empacotados, 521 KB |
| F-19 | Diálogo com escolhas | Vigia: 3 perguntas, "EU\|" vira fala do detetive; pergunta já feita fica apagada na lista |
| F-20 | Item pego SOME do cenário | `itensSoltos()`: ripa, munição, maço, pistola, caderno, mapa |
| F-21 | Combate com porrete fecha | Empilhado de 3 de vida morre em 3 golpes; a ripa cai para 0.62 de vida |
| F-22 | Emboscada da pistola | Luzes a 25%, `machineStart`, 3 Sem-Rosto pela porta de entrada |
| F-23 | Escada do cigarro | 4 recusas em ciclo, disparadas ao usar o maço dentro do casaco |
| F-24 | Alucinação da câmara fria | 5 fases: balanço → "tem algo ali" → isqueiro → casaco → apaga → não tem nada |
| F-25 | Perseguição entre setores | O Credor entra na fase do jogador ~6s depois, pelo lado de fora da tela |
| F-26 | Esconder e prender a respiração | Barra de fôlego, batimento pela distância, `E` para sair |
| F-27 | A câmera SOBE durante conversa com NPC | `cam.offsetY = 40`; sem isso a caixa de diálogo tapava quem estava falando |
| F-28 | Gente ganha de móvel no `nearest()` | `prio`: NPC 2, pegar/porta 1, examinar 0 |

---

## 11. O QUE NÃO FUNCIONA / FALTA

### 🔴 Bloqueado

| Item | Motivo |
|---|---|
| Sincronia real da narração | Falta a gravação que corresponde ao roteiro. **Só você pode destravar** |

### ⚪ Não começado (escopo futuro, não é pendência)

| Item | Nota |
|---|---|
| Sobrenome do David | ✅ **HENRY**, travado em 07/08 |
| Capítulo 4 — "A CASA" | ✅ **Escrito e implementado em 12/08** (sessões 30 e 31). Falta teste humano |
| Capítulos 5 e 6 | Decididos em 12/08 (a caçada e o presente), **não escritos** |
| Música original | Só o piano do menu existe |
| Dublagem | Nenhuma além da narração |
| Gamepad | Estrutura de input permite, não implementado |
| Empilhar item igual no inventário | Duas caixas de munição ocupam dois espaços |
| Mapa desenhado à mão no caderno | A categoria LUGARES existe e está vazia |

---

## 12. BUGS — REGISTRO COMPLETO

### 12.1 — 🐛 Bugs ATIVOS

| ID | Descrição | Severidade | Detectado | Notas |
|---|---|---|---|---|
| B-20 | Áudio da narração não corresponde ao roteiro | 🟠 Alto | Sessão 03 | Não é bug de código. Depende de gravação nova |
| B-21 | QTE nunca completou em loop automatizado de 60 toques, apesar de acumular corretamente em medição direta | 🟡 Médio | Sessão 08 | Recalibrado na 08b e medido soltando em 10 toques. **Provavelmente artefato do ambiente de teste — precisa de teste humano** |
| B-71 | A asserção `as pernas dele ficam ESCONDIDAS pelo balcao` falha **de vez em quando** | 🟡 Médio | Sessão 25 | **Intermitente, não determinística.** Falhou duas vezes seguidas contra o `JOGO_OFFLINE.html` (600px de diferença onde o esperado é **zero**) e depois passou duas vezes seguidas, no mesmo pacote, sem nenhuma alteração de código. Contra `index.html` sempre passou. Não é regressão desta sessão — nada aqui toca na recepção. É uma medição de imagem que exige zero pixel e depende de estado deixado por testes anteriores (é a família do M-09). **Uma asserção que pisca é pior que uma que falha:** ela ensina a ignorar vermelho. Precisa de tolerância explícita ou de isolamento de estado |

> **B-53 e B-54 foram encontrados e corrigidos na sessão 18** — ver 12.2.

### 12.2 — ✅ Bugs RESOLVIDOS

| ID | Descrição | Causa raiz | Solução | Sessão |
|---|---|---|---|---|
| B-01 | 🔥 **"O jogo travou" desde a primeira execução, sem nada para copiar** | A tela de erro é escondida pelo atributo `hidden`, que só funciona pela regra `[hidden]{display:none}` do navegador. Minha regra `#crash { display:flex }` é seletor de ID, tem prioridade maior e **cancelava o `hidden`**. A tela ficava visível para sempre, com a caixa de texto vazia, e o jogo rodava normalmente atrás dela | `#crash[hidden] { display: none !important; }` | 04 |
| B-02 | 🔥 Jogo não abria em outras máquinas mesmo com Python | O código é ES modules, que navegador nenhum carrega em `file://`. Quem baixava o ZIP e clicava no `index.html` via tela preta | `ferramentas/gerar_offline.py` empacota tudo em `JOGO_OFFLINE.html`. Módulos viram funções num registro (concatenar quebraria: `pixel.js` e `i18n.js` exportam os dois um `line`) | 04 |
| B-03 | 🔥 Navegador abria antes do servidor subir | O `.bat` fazia `start` do navegador e só depois iniciava o Python. O navegador batia numa porta morta | `servidor.py` abre o navegador ele mesmo, depois que a porta já escuta | 03 |
| B-04 | Porta ocupada falhava em silêncio | No Windows um segundo servidor "ocupa" uma porta já servida, sem erro e sem receber acesso | Servidor testa a porta e anda para frente (8137 → 8138 → ...) | 03 |
| B-05 | `code 404, message File not found` assustando no terminal | Era a busca pelo áudio da narração. `SimpleHTTPRequestHandler` registra isso por `log_error`, não `log_message` — o filtro antigo não pegava | Filtrados os dois, e o servidor passou a dizer no início se achou narração | 03 |
| B-06 | `dt` do primeiro quadro podia ser **negativo** | O carimbo de tempo do `requestAnimationFrame` às vezes precede o `performance.now()` lido logo antes dele | `if (!(dt > 0)) dt = 1/60` e teto de 0.05 | 02 |
| B-07 | Narração começava junto com o fade-in | As primeiras palavras tocavam com a tela ainda preta e a primeira legenda saía apagada | A voz espera o fade (encurtado para 1,6s) e entra com a tela em 80% | 03 |
| B-08 | Personagem parecia estar de costas | Torso simétrico e dois olhos simétricos. Simetria em vista lateral lê como "de costas" | Rosto 3/4 com um olho só, nariz na silhueta, orelha; torso assimétrico | 05 |
| B-09 | Braço esquerdo se camuflava no tronco | Ombro a 5px do centro e escurecimento a 0.62 | Ombro a 7px, escurecimento a 0.80. E pernas de trás ganharam escurecimento próprio (0.64) — braço precisa aparecer, perna precisa separar | 05 |
| B-10 | 🔥 Braços moles, "parece jogo de sandbox" | `easeInOut` em **cada** par de poses-chave: todo membro freava em todo quadro-chave | `ease: 'linear'` por animação, usado por andar, correr e socar. Amplitude de cotovelo reduzida à metade | 05 |
| B-11 | Personagem com contorno azul, "parece de neon" | Luz de contorno a 0.55 + luz de apoio azulada | Contorno para 0.30, apoio dessaturado, colete escurecido | 05 |
| B-12 | Carro saía dirigindo sozinho depois que o detetive descia | Fase `cardrive` herdada de quando o carro era táxi | Carro fica estacionado; farol apaga quando ele fecha a porta | 05 |
| B-13 | Sair do carro parecia contorção | Poses-chave com joelho a 104° e tronco a 26° simultâneos; a interpolação passava por posturas impossíveis | `getout` refeito como subida monótona | 05 |
| B-14 | Abafamento dos efeitos não funcionava | O duck e o controle de volume escreviam no **mesmo `AudioParam`**; um cancelava o outro conforme a ordem | Nó de duck separado, em série depois do barramento | 03 |
| B-15 | Voz inaudível debaixo da chuva | O arquivo tem pico em −14 dBFS e média em −41. `<audio>.volume` não passa de 1.0 | Roteada pelo WebAudio: ganho ×4 → limitador → barramento de voz | 03 |
| B-16 | Grão de filme deformava o rosto | Ruído em cima de um rosto de 14px come os pixels que desenham olho e boca | Grão e scanline **pulam o personagem** (recorte par-ímpar), 25% de força em cima dele | 06 |
| B-17 | Arma aparecia deitada | Desenhada com o cano no eixo X, mas dentro da cadeia do braço o eixo "para frente" é o **+Y local** | Girada 90°, e desenhada **antes** da mão para os dedos fecharem no cabo | 06 |
| B-18 | Rosto "desmanchava do nada" | Rotação da cabeça em ângulo qualquer reamostra um sprite de 14px e borra olho e nariz | Cabeça só gira em passos de 7°, máximo 14° | 06 |
| B-19 | Órbita vazia ao lado do olho | O rosto tinha 8px de pele com o olho no meio; a bochecha vazia lia como segunda órbita | Cabelo e costeleta trazidos para frente: 2px de bochecha, olho onde olho fica | 06 |
| B-22 | 🔥 Agachamento desfeito todo quadro | A máquina de estados do jogador via velocidade zero e forçava `idle` por cima da pose da cena | Cenas marcam `player.frozen`; `update()` só avança a animação | 07 |
| B-23 | Depósito e galpão pretos | Luz calculada para um espaço da metade do tamanho; no galpão a lâmpada estava a 150px do jogador, fora do raio | Ambiente elevado, lâmpada movida para cima de onde ele acorda, preenchimento no vão do meio | 07 / 08 |
| B-24 | 🔥 **O cano nunca quebrava (QTE invencível)** | Números calibrados contra o meu script de teste, que dispara a cada 2 quadros (30/s). Mão humana a 4 toques/s ganhava 0,232/s contra 0,20/s de queda: **saldo de +0,03/s, meio minuto de martelada** | 0,085 por toque contra 0,09/s de queda, mais catraca que impede cair abaixo do último quarto. 5 toques/s enchem em ~3s | 08b |
| B-25 | Sentar era instantâneo e vinha antes do sequestro | `idleAnim` substituía o parado por inteiro; e nunca era resetado, vazando para partidas novas | `idleMode` + o cronômetro de ócio roda primeiro (7s em pé). Transições `sitDown` / `standUp`. Reset em Novo Jogo | 08b |
| B-26 | Falas do despertar não eram lidas | Tocavam por trás das pálpebras fechadas | A cena só dispara as falas quando os olhos abrem de vez (`onAwake`) | 08 |
| B-27 | Balão "OLHAR" aparecia durante as cenas | Prompt de interação não sabia que havia cena rodando | Prompt desligado durante cena e QTE; falas sobem 16px quando o prompt está na tela | 07 / 08 |
| B-28 | Portas pequenas demais | 26×46 para um homem de 62px — ele entraria de quatro | 32×74, que é a proporção real de porta para pessoa | 08 |
| B-29 | Figura negra aparecia no galpão ao acordar | Ela continuava desenhada durante a fase `wake` e reaparecia junto com o jogador | Fica invisível ao entrar na fase `black` | 08b |
| B-30 | Fala entregava o susto | "Tem alguém atrás de mim, não tem?" — o detetive não pode perceber a figura, senão o jogador para de sentir que sabe mais que ele | Trocada por "Essa letra... eu conheço essa letra." | 08b |
| B-31 | 🔥 **Corredor de carga preto** — o setor que existe para MOSTRAR o tamanho do lugar era onde não se via nada | O mesmo erro do B-23, de novo: luz calibrada para uma sala usada num corredor de 1700px. Lâmpadas a 450px uma da outra deixam o meio do caminho preto | Ambiente de `#1c212b` para `#2a3242`; lâmpada forte a cada ~400px **mais preenchimento fraco a cada ~200px na altura do chão**. Mesma correção nas Estantes, Máquinas e Mezanino | 09 |
| B-32 | 🔥 **A sanidade zerava em meio minuto** | Escuro tirava 1,35/s e ver um inimigo 1,6/s. Trinta segundos no Setor B levavam o medidor de 100 a 16 — o capítulo acabaria no estado RENDIDO antes do vestiário | Escuro 0,45/s (e só depois de 3s parado), ver inimigo 0,5/s, câmara fria 0,9/s, escondido 1,1/s. Setor seguro devolve 1,6/s e escrever no caderno +7 | 09 |
| B-33 | Item continuava desenhado depois de pego | Cenário é pintado uma vez na camada e só deslocado — pixel pintado não some. A ripa continuava encostada na coluna depois de ele levar a ripa embora | `itensSoltos()`: esses poucos objetos passam a ser desenhados por quadro, e só enquanto ainda estão lá | 09 |
| B-34 | Inimigo tingido ficava sem luz de contorno | `tintPass` e `rimPass` gravavam no MESMO buffer auxiliar; um apagava o outro | Buffer próprio para o tingimento (`tintBuf`) | 09 |
| B-35 | Os Empilhados eram um borrão claro rastejando | Tingimento a 0.78 cobre quase toda a sombra interna do boneco e o corpo perde volume | `tintK` para 0.62, e o tom clareado (a cena é multiplicada pela luz: cor "realista" vira preto) | 09 |
| B-36 | A mesa telefônica ganhava da telefonista | `nearest()` escolhia só por distância, e o móvel estava 2px mais perto do que a mulher sentada nele. O jogador examinava a mesa a noite inteira sem conseguir falar com ela | Campo `prio`: gente 2, pegar/porta 1, examinar 0 | 09 |
| B-37 | Quem falava ficava escondido atrás da própria fala | A caixa de diálogo ocupa o terço de baixo, e o chão fica em y≈254 | `cam.offsetY = 40` enquanto há conversa com NPC | 09 |
| B-38 | Painel de escolhas cobria o nome do falante | O nome é desenhado 12px acima da caixa, e o painel começava 5px acima dela | Vão de 16px | 09 |
| B-39 | A ripa encostava no chão e sumia dentro do assoalho | Sprite de 15px saindo de uma mão que fica a ~20px do chão | 12px | 09 |
| B-40 | O casaco pendurado no gancho não aparecia | Ele era desenhado num ponto que a chama do isqueiro não alcança — o jogador ouvia "um casaco, marrom" e não via nada | Luz fraca própria no gancho enquanto `casaco > 0` | 09 |
| B-41 | O portão da doca lia "13" | Uma barra vertical desenhada ao lado do "3" | Barra removida | 09 |
| B-42 | 🔥 **O save não salvava — só teleportava** | O save guardava fase, X e os itens pegos **da sala atual**. Tudo o mais era o que estivesse na sessão. Carregar no meio da fuga devolvia o galpão apagado, com a música de tensão, **sem o Credor**, sem o porrete e com o portão da doca fechado: o capítulo ficava impossível de terminar | Save versão 2: estado de **todos** os setores (`_estadoDoMundo`), a perseguição inteira (`chase.save/load`, inclusive quais setores já estavam no escuro), inventário, caderno, sanidade, vida, munição e tentativas de cigarro | 10 |
| B-43 | 🔥 **Preso no esconderijo, com o Credor girando em cima** | Duas falhas somadas: `dir` invertia de sinal a cada quadro quando ele estava exatamente em cima do jogador, e `setFacing` refazia a virada — daí o giro. E sair só respondia ao `E` | Zona morta de 14px no alvo do Credor; sair agora aceita **E, ENTER, ESC, A, D e J**, e empurra o jogador 16px na direção contrária à de quem está caçando | 10 |
| B-44 | 🔥 **O porrete e a bala não acertavam** | Tudo era distância em X. Um bicho andando de quatro ocupa 34px de altura e não 62, e ninguém checava altura nenhuma. Pior: o tiro **descartava qualquer ângulo acima de 22°**, ou seja, mirar para baixo — o único jeito de acertar quem está no chão — era erro garantido | Cada criatura declara `altura`/`largura`; o golpe virou sobreposição de caixa (`caixaGolpe` desce até o chão) e a bala virou uma reta de verdade testada contra a caixa (`naLinhaDoTiro`) | 10 |
| B-45 | 🔥 **O Credor não matava** | `chase.onDano` nunca foi ligado no jogo. Ele chegava, encostava e não acontecia nada | Ligado, com recarga de 1,6s e um `stun` de 1,5s nele depois de acertar — é essa janela que dá para correr | 10 |
| B-46 | 🔥 **Trocar de sala não adiantava: ele já estava lá** | `chegada` era acertado uma vez, no começo. Depois da primeira chegada ficava em zero, e cada porta atravessada punha o Credor em cima do jogador no mesmo quadro | `chegada` volta a 7–11s **toda vez** que o jogador muda de setor | 10 |
| B-47 | 🔥 O efeito da perseguição tapava a tela | Vinheta chegava a 2,15 (0,9 + k·0,75 + pulso·0,5) e o tremor da sanidade disparava **a cada quadro** no estado VAZANDO | Vinheta com teto de 1,35, pulso com um quarto da força, grão pela metade, e o tremor contínuo **removido** — agora só há tremor em baque grande (≥8 de dano) | 10 |
| B-48 | **O mouse não existia no inventário** | `body.playing { cursor: none }` esconde o ponteiro do sistema, e não havia cursor desenhado. O inventário era de arrastar e ninguém via o que arrastava | Cursor de pixel desenhado dentro do jogo, vermelho enquanto arrasta; se o mouse ainda não se moveu, ele começa no meio da tela | 10 |
| B-49 | O mapa era um item sem tela | Nunca foi feita a interface | `M` abre a planta baixa: papel dobrado, setores em caixinha, só o que ele já pisou, o atual em vermelho e a marca a lápis na doca 3 | 10 |
| B-50 | O espelho ficava acima da cabeça dele | Pendurado em y=44 na parede do vestiário — dois metros do chão | Mudou de sala: agora é um **banheiro**, com o espelho em cima da pia, na altura do rosto de um homem em pé | 10 |
| B-51 | As falas sumiam antes de dar para ler | 2,6s fixos para qualquer frase, e a fila engatilhava três de uma vez ao entrar numa sala | Duração pelo **tamanho do texto** (2,6s a 7,0s), respiro de 0,9s entre falas, fila com teto de 2, e a primeira espera 1s pelo fade-in acabar | 10 |
| B-52 | Texto ilegível em várias falas | Georgia a 10px atravessa o corte duro de alpha e perde os traços finos | Fonte `type` (Courier, negrito) em toda fala, diálogo, caderno e interface — haste grossa é o que sobrevive ao corte, e é a letra de relatório policial | 10 |
| B-53 | 🔥 **O caderno voltava VAZIO ao carregar um save** | `if (Array.isArray(arr)) for (...) if (JOURNAL[k]) ...; else if (arr) { ... }` — **sem chaves, o `else` grudou no `if` de dentro do `for`, não no `Array.isArray` de fora.** Save no formato de objeto (o formato atual desde a sessão 12) reprovava no `Array.isArray`, o `for` inteiro era pulado com o `else` junto, e nenhuma página era restaurada. Passou despercebido porque o teste de save existente confere itens e inventário, não o caderno | Chaves explícitas nos dois ramos, mais `if (!arr) return`. Coberto agora por `ferramentas/teste_deducao.html` | 18 |
| B-54 | Memória de conversa vinha vazia quando o objeto cruzava janelas | `opts.memory instanceof Set` dá **falso** quando o `Set` foi criado em outro realm (página de teste × iframe do jogo). O código caía no ramo da cópia, a conversa funcionava, e quem chamou ficava sem registro nenhum do que foi perguntado | `asSet()` por *duck typing* (`typeof x.add === 'function'`) em vez de `instanceof`. Vale para qualquer código que receba objeto de outra janela | 18 |
| B-55 | 🔥 **A cela do Capítulo 3 era um beco sem saída** | O Arquivo Morto não tinha porta para a custódia: a cela só era alcançável pela volta do flashback. Sair dela uma vez trancava o jogador **fora do Carlos**, que é obrigatório para o cigarro e para o fim do capítulo. Nenhuma verificação de estrutura pegava isso porque todas checavam "a porta aponta para uma fase que existe", nunca "dá para voltar" | Porta da custódia no fim do corredor do arquivo. E o teste passou a exigir ida **e volta** entre todos os setores da rota, mais "nenhum setor pode ter zero saídas" | 19 |
| B-57 | 🔥 **As pessoas do Capítulo 3 eram invisíveis** | Duas metades do mesmo descuido: o laço que **desenha** NPC estava dentro do `if (cap2)`, e o laço que **insere o gancho de interação** ficava depois de um `return` seco em `entrouCh2()` para setores fora do Capítulo 2. Resultado: conversa escrita, caixa de colisão pendurada à mão, e ninguém na tela | Desenho para fora do `if (cap2)`, inserção extraída para `_porGenteNaFase()` e chamada pelos dois caminhos, e oito personagens desenhados de verdade em `creatures.js`. O teste agora mede **pixel na tela**, não a existência do objeto | 20 |
| B-64 | 🔥 **O jogador atravessava a cela e a guarita** | As camadas de primeiro plano em paralaxe 1:1 (a grade da custódia, a frente do balcão) são desenhadas **depois de todo mundo** — e o David ia junto. Parado no corredor ele aparecia por trás da grade, ou seja, **dentro da cela**; na recepção, dentro da guarita. Parecia falta de colisão e não era: era ordem de desenho, e colisão teria partido as duas salas ao meio | `playerSobreFore` nos dois setores: o primeiro plano entra **antes** do jogador. Os outros continuam atrás das barras e do vidro; ele passa na frente | 24 |
| B-65 | **Pegar item não avisava nada no Capítulo 3** | O aviso de item era desenhado dentro de `drawCh2UI()`, que só roda no Capítulo 2. Pegar a calibre doze não dizia absolutamente nada — o jogador ficava sem saber se tinha pegado | Os avisos passaram a ser desenhados nos dois capítulos, mais um `aviso()` próprio para as trocas que o jogador não fez com as próprias mãos (a portaria) | 24 |
| B-76 | 🔥 **A opção TELA CHEIA não enchia a tela** | `requestFullscreen()` dentro de um WebView **embutido** (o caso do `.exe`) não devolve erro, não rejeita a promessa e não faz nada — a página não manda no tamanho da janela, ela só avisa o hospedeiro, e ninguém estava escutando. **Falha silenciosa:** parecia que o código nem rodava. Achado pelo Luiz jogando o pacote | O jogo passou a procurar um gancho opcional `window.__telaCheia = { ativa(), alternar() }` e usa a API do navegador só quando ele não existe. Quem preenche é o lançador da demo, com `js_api` do pywebview chamando `toggle_fullscreen()`. O jogo continua sem saber que existe um `.exe` | 29 |
| B-77 | **A ponte pro JavaScript travava a janela antes de ela abrir** | A janela foi guardada num atributo **público** do objeto exposto como `js_api`. O pywebview varre os atributos públicos para montar o espelho em JS, tentou serializar o objeto nativo do Windows e entrou em recursão infinita (`AccessibilityObject.Bounds.Empty` ×300 → `maximum recursion depth exceeded`) | Atributos privados (`self._janela`): só os métodos atravessam a ponte | 29 |
| B-75 | **A lista de opções passou a bater no rodapé** | A altura da caixa é `linhas * 16 + 16` e a tela tem 270px. Com a linha de tela cheia virando 12 linhas, a caixa passou a terminar em y=243, por cima da descrição de dificuldade desenhada em y=229 — um número escrito na mão | O passo diminui sozinho quando a lista cresce (16px até 11 linhas, 15px acima), e o rodapé é calculado a partir do fim da caixa em vez de ser constante. A próxima opção nova não quebra nada | 28 |
| B-72 | **A calibre doze continuava no armário depois de pega** | Ela estava pintada na camada do cenário, e pixel pintado na camada não some. A arma ia para o casaco e continuava encostada dentro do móvel: dois doze, um deles fantasma. É a mesma família do porrete/mapa/maço do Capítulo 2, que já tinham solução pronta | A doze e a caixa de cartuchos saíram da camada e entraram em `itensSoltos()` — desenhadas por quadro e filtradas por `pego`, que já entra no save. O armário continua pintado, porque armário não se leva embora | 26 |
| B-73 | 🔥 **O David reaparecia do nada no fim do flashback** | O fim da cena do incêndio fazia `ativo = false` e `det.alpha = 1` no mesmo quadro. Como o fogo só é desenhado enquanto a cena está ativa, a casa voltava a ser uma **casa intacta** e o David reacendia em pé na soleira com a animação de andar em laço — andando no lugar por 3,4s até o fade acabar. A tela só começava a apagar **depois** de a cena terminar | A cena avisa quando ele atravessa a soleira (`onEntrou`), com a casa ainda queimando, e é esse aviso que escurece a tela (1,3s). O fim virou rede de segurança e não devolve mais o `alpha` — quem devolve é o `enterLevel` seguinte. `voltarDoFlashback()` ficou idempotente porque agora há dois caminhos até ele | 26 |
| B-74 | **Ele respondia a última pergunta do capítulo andando para fora** | **O mesmo defeito do B-73.** `frozen` zera a velocidade e desliga a máquina de estados, mas continua rodando a animação atual — e a atual era `walk`, em laço, porque ele chega na recepção indo embora. Ele ficava andando para a saída, no lugar, durante a pergunta do cartaz | `fimDoCapitulo3()` passou a dizer em que pose ele para (`idle`) e para onde olha (a guarita, não a rua). **Quem congela um personagem numa cena precisa dizer em que pose ele para** — `frozen` sozinho é pausa na física, não é pose | 26 |
| B-69 | 🔥 **O chute no incêndio errava a porta — pela SEGUNDA vez** | A sessão 24 corrigiu o relógio e deixou passar a geometria: a corrida só sabia andar **para a esquerda** (`if (p.x > parada + 2) p.x -= …`) e a marca era fixa à direita da porta. Quem sai de casa cai em `x=660`, cinco pixels à **esquerda** da porta em `x=665` — e é aí que o telefone toca. As duas condições davam falso: ele não andava e não chutava, ficava plantado na calçada e a cena passava por cima. **O teste da sessão 24 começava em `x=780`, do lado que já funcionava** | A cena escolhe `lado`/`parada`/`dir` no primeiro quadro, olhando onde ele está: anda até a marca venha de onde vier, vira de frente e só então chuta. A fase do chute deixou de ter duração e passou a ter **condição** (com rede de 5s contra travar). Queda e entrada andam no sentido de `dir`. Teste refeito de **quatro** posições | 25 |
| B-70 | **A música do flashback só tocava dentro de casa** | Estava escrita setor a setor: `ch3_home` e `ch3_room` ligavam, e `ch3_past` — **a rua, que é onde o flashback começa** — mandava calar. O passado abria em silêncio e a música nascia só ao abrir a porta de casa | Os três setores do passado ligam a música; trocar de sala não reinicia (`tocarMusicaArquivo` devolve `true` se já toca). Saiu junto um `stopMusic()` incondicional que reiniciava o piano sintetizado a cada porta. Ela continua morrendo quando ele atende | 25 |
| B-66 | **O balão de interação aparecia no meio das cenas** | Com a casa pegando fogo e o jogador sem controle nenhum, a porta continuava oferecendo "ABRIR" na tela | O prompt só aparece quando o jogador realmente controla alguém: fora durante fogo, interrogatório e a pergunta do nome | 24 |
| B-62 | 🔥 **O Capítulo 3 não terminava** | `ch3_pronto` exigia o fim de uma conversa com o Carlos que deixou de existir na sessão 22, quando falar com ele passou a abrir o interrogatório. O jogador fazia tudo — o flashback, a confissão, o cigarro — e ficava rodando a delegacia para sempre. Achado pelo Luiz jogando | O gatilho virou a própria cena: quebrar o Carlos marca `ch3_pronto`, o David diz que precisa sair, e a portaria pede o nome. O teste agora confere a flag no fim do interrogatório | 23 |
| B-63 | 🔥 **A luz da cela nova não chegava no chão** | Lâmpada de raio 168 pendurada em y=30, chão em y=214: a luz morria 40px antes dos dois homens e a sala ficava preta com duas manchas dentro. **É o B-23 pela quinta vez**, e desta vez numa sala de 300px — o erro não é de sensibilidade, é de nunca conferir o alcance contra a altura do chão | Raio para 250, poça própria na altura do peito e contraluz frio na grade. O teste passou a exigir que exista lâmpada forte cujo raio **alcance o chão** | 23 |
| B-60 | 🔥 **A sala de espera estava vazia** | O painel de senha contava, a fala dizia "ele está esperando a vez" e **não havia ninguém desenhado na cadeira**. Achado pelo Luiz jogando. É a mesma família do B-57 — objeto existe, pessoa não — e nenhum teste pegou porque todos conferiam o painel, que funcionava | A **figura negra do Capítulo 1** sentada ali, como silhueta (`silhouette` no rig, sem peça nenhuma e sem luz de contorno). O teste agora mede pixel na cadeira | 22 |
| B-61 | 🔥 **O preso aparecia na frente da própria cela** | As grades eram pintadas na camada de fundo, e as pessoas são desenhadas **depois** das camadas: o Carlos ficava por cima das barras e o David em pé dentro da cela. Passou dois anos-sessão despercebido porque a câmera nunca chegava perto o bastante para denunciar — e a câmera fechando no interrogatório denunciou na primeira captura | Grade movida para camada de primeiro plano em paralaxe 1:1 (`cellBack` no fundo, `cellBarsOnly` na frente), e o David ganhou marca fixa do lado de fora. É o terceiro bug desta família | 22 |
| B-58 | **Três objetos da casa do flashback abriam caixa de diálogo VAZIA** | `c3_home_tv`, `c3_home_table` e `c3_home_photos` eram citados pelos interagíveis da sala desde a sessão 20 e os textos nunca foram escritos. Na única sala quente do jogo, examinar a televisão, a mesa posta ou os porta-retratos não dizia nada. Nenhum teste pegava: todos conferiam que o interagível EXISTE, nenhum que ele FALA — é o M-07 outra vez, com outra roupa | Os três textos escritos em PT e EN, e o teste passou a exigir texto não-vazio para todo `lines` da casa e do quarto | 21 |
| B-59 | 🔥 **A cena do incêndio nunca terminava, e prendia o jogador no passado** | O avanço de fase fazia `idx = min(idx + 1, última)` e zerava o cronômetro. Na última fase a condição de avanço continuava verdadeira, então o cronômetro voltava a zero **antes** de a condição de fim ser lida: a casa queimava em loop, sem controle e sem saída. Achado pelo teste de regressão no mesmo dia em que foi escrito | O fim virou ramo próprio, antes do avanço de fase | 21 |
| B-56 | 🔥 **Cena roteirizada vazava para outra partida** | A volta do flashback é agendada com `setTimeout` de 8,2s e só conferia `state === 'play'`. Sair para o menu, carregar um save ou trocar de capítulo dentro daqueles 8 segundos deixava o relógio correndo — e depois de carregar o estado **é** `'play'`, só que de outra partida. O jogador era arrancado para a cela no meio de outra coisa. O fim do Capítulo 2 tinha exatamente o mesmo defeito, e está no jogo desde a sessão 12 | `game.runId`, incrementado em Novo Jogo, seletor de capítulo, carregar save e voltar ao menu. A cena congela o número e confere na hora de disparar. Aplicado nas três cenas agendadas | 19 |

### 12.3 — 🔍 Erros de método (meus, registrados para não repetir)

| # | Erro | Sessão | Lição |
|---|---|---|---|
| **M-20** | **Dei a ruína do Capítulo 4 por pronta porque o teste passou — e ela estava PRETA na tela.** O teste conta lâmpadas; ele não enxerga. Só apareceu na captura de tela | 31 | **Teste verde não é a mesma coisa que tela legível.** Cenário novo se confere OLHANDO, sempre — e é a terceira vez que o M-04 volta com outra roupa |

| ID | O que aconteceu |
|---|---|
| M-01 | **Afirmei que o áudio era o meu roteiro provisório** citando duas fronteiras com erro 0,00s. Aquelas duas eram zero **por construção** — a primeira e a última fronteira de um mapeamento acumulado sempre coincidem. O erro médio real era 0,94s contra ~1,8s de um chute aleatório. Não era prova, e apresentei como se fosse |
| M-02 | **Calibrei o QTE contra ritmo de script** (30 toques/s) em vez de mão humana. Resultado: mecânica tecnicamente vencível e praticamente impossível |
| M-03 | **Deixei o servidor de captura na porta 8137**, a mesma do `ABRIR_JOGO.bat`, e derrubei o jogo do jogador no meio de uma sessão. Usar 8140 |
| M-04 | **Repeti o B-23 inteiro** (sessão 09): construí o corredor de carga com luz calibrada para uma sala, num espaço 3× maior. A lição já estava escrita neste documento e eu não a apliquei. **A regra agora é numérica, não é sensibilidade:** lâmpada forte a cada ~400px e preenchimento fraco a cada ~200px na altura do chão, em qualquer fase maior que 800px |
| M-05 | **Escrevi números de sanidade sem medir** (sessão 09). Trinta segundos de jogo levavam o medidor de 100 a 16. Números de ritmo têm que ser medidos rodando, e não escolhidos porque "parecem certos" — é o mesmo erro do M-02 com outra roupa |
| M-18 | **Congelei personagens sem dizer em que pose eles param** (sessão 26). `frozen` zera a velocidade e desliga a máquina de estados, mas continua rodando a animação do quadro atual, em laço. Escrevi duas cenas que congelam alguém **em movimento** — o fim do flashback e a pergunta do cartaz — e nas duas ele ficou andando no lugar. As cenas que já funcionavam funcionavam por acidente: elas tocavam uma animação por outro motivo. **Congelar é pausa na física, não é pose.** Quem para um personagem numa cena escolhe a pose e a direção do olhar, sempre |
| M-19 | **Verifiquei que a API EXISTE, não o que ela FEZ** (sessão 28, cobrado na 29). Minha checagem da tela cheia perguntava `fullscreenEnabled`, se `requestFullscreen` era função e se a opção estava no menu. As três deram verdadeiro, escrevi no documento que estava "provado que a API está liberada", mandei o pacote — **e a tela cheia não funcionava**. *"A API existe" nunca foi "a janela estica."* Perguntei ao sistema se ele **tinha** a função em vez de medir o efeito dela. É a mesma família do M-07 (testei que o NPC existe, nunca que ele aparece) — eu tinha esse erro escrito neste documento, de mim mesmo, e repeti. **Verificação mede efeito: a área útil antes e depois** |
| M-16 | **Escrevi um teste que só cobria o caso que já funcionava** (sessão 24, cobrado na 25). A asserção *"ele chuta A PORTA, não o ar"* começava a cena em `x=780`, do lado certo da porta — e ficou verde enquanto o bug real, o jogador saindo de casa em `x=660`, continuava lá. O verde deu autorização para escrever "corrigido" no documento, e o Luiz encontrou o mesmo bug jogando uma sessão depois. **Teste que só cobre o caso que funciona é pior que nenhum teste.** Quando o bug for de posição, o teste começa de **todas** as posições — principalmente da que o jogo produz sozinho (`x=660` não é caso de canto: é onde a porta de casa cospe o jogador) |
| M-17 | **Corrigi um dos dois jeitos de errar e declarei vitória** (sessão 24, cobrado na 25). O chute tinha dois defeitos independentes: o relógio e a direção. Consertei o primeiro, vi a cena funcionar do ponto que testei e escrevi *"O chute na porta agora acerta a porta"* no documento. **Achar uma causa não é achar a causa** — quando o sintoma tem mais de um caminho para acontecer, fechar um deles só torna o outro mais difícil de encontrar da próxima vez |
| M-15 | **Li "colisão" onde o defeito era ordem de desenho** (sessão 24). O Luiz disse que o David atravessava a cela e a recepção "como se estivessem abaixo dele na hierarquia de colisão", e a descrição estava certa mas o diagnóstico era outro: o jogo não tem colisão por objeto, e o que fazia ele parecer dentro da cela era a camada de primeiro plano vindo por cima dele. **Se eu tivesse implementado colisão, teria partido as duas salas ao meio e o bug continuaria lá.** Reproduzir antes de consertar — a captura de tela respondeu em trinta segundos o que o código não respondia |
| M-13 | **Reaproveitei uma animação de "levar pancada" num personagem sentado** (sessão 23). `hurt` mexe as pernas, porque é o recuo de quem está em pé. Num homem sentado o resultado é que ele parece ter levantado da cadeira para apanhar — cômico exatamente onde não pode ser. **Animação não é intercambiável entre posturas:** quem está sentado precisa de uma versão em que as pernas não se mexem |
| M-14 | **Escrevi um teste que media a reação DEPOIS de ela acabar** (sessão 23). A checagem do soco olhava a animação do Carlos no fim da troca de falas, quando ele já tinha voltado a sentar, e reprovava algo que estava certo. **Medição de animação tem que acontecer no instante do evento**, não no fim do turno de jogo |
| M-11 | **Declarei duas variáveis com o nome de duas que já existiam** (sessão 22). O `gfx` já tinha `tmp` e `tmp2`; eu acrescentei outro `tmp` e reusei `this.t2`, que era o buffer do pós-processamento. O jogo inteiro parou de carregar com um `SyntaxError` de uma linha. **Antes de acrescentar campo em classe grande, procurar o nome primeiro** — e desconfiar de nome genérico (`tmp`, `t`, `buf`): quem já usou um provavelmente usou dois |
| M-12 | **Testei a cor de um personagem sem olhar o que passou na frente dele** (sessão 22). A medição do macacão do Carlos era média simples de uma faixa; quando a grade foi para o primeiro plano, a média passou a incluir barra de aço e reprovou a COR por causa da ENCENAÇÃO. Medição de imagem tem que saber o que está no caminho — a correção foi medir o quarto mais quente dos pixels, que é o que passa entre as barras |
| M-10 | **Escrevi uma máquina de estados que nunca saía do último estado** (sessão 21). O avanço de fase do incêndio fazia `idx = min(idx + 1, última)` e zerava o cronômetro; na última fase a condição de avanço continuava verdadeira e o cronômetro voltava a zero **antes** de a condição de fim ser lida. A cena queimava em loop e prendia o jogador. O padrão é o mesmo de sempre: **um `min()` que satura não é uma condição de parada** — quem termina tem que ser um ramo próprio, e o teste tem que perguntar "acabou?", não "chegou na última fase?" |
| M-09 | **Medi imagem com o grão de filme ligado** (sessão 20b). O grão muda ~180 pixels sozinho entre dois quadros; a medição do plantonista virou ruído puro. E no mesmo teste tratei coordenada de mundo como coordenada de tela, ignorando um `cam.iy` de −27. **Verificação de imagem precisa zerar grão e scanline, conferir o piso de ruído, e converter pelo `cam`** |
| M-07 | **Testei que o NPC EXISTE, nunca que ele APARECE** (sessão 19). O teste do Capítulo 3 tinha 393 checagens verdes com oito pessoas invisíveis na tela. Todas verificavam objeto, conversa, flag e caixa de colisão — nenhuma verificava um pixel. **Coisa que se vê precisa ser medida no canvas**, e agora é |
| M-08 | **Escrevi um interrogatório inteiro sem ancorar em fato nenhum** (sessão 19). O Carlos aparecia numa cela sem motivo e falava por enigma; a conversa soava profunda e não dizia nada. Um NPC precisa de uma razão mundana para estar onde está e de uma informação verificável para dar — senão o jogador para de acreditar no resto do jogo. **Nenhum teste pega isso; só leitura humana** |
| M-06 | **Declarei a sessão 09 "testada" tendo testado só o que não trava** (sessão 10). Meus scripts percorreram os oito setores e não acharam um erro sequer — porque script não salva no meio da fuga, não se esconde de nada, não erra um golpe e não repara que o mouse é invisível. Os quatro bugs fatais estavam todos em coisas que só uma **pessoa jogando** faz. "Zero erros no laço" nunca foi sinônimo de "funciona": só quer dizer que nada explodiu. Testar sozinho vale para regressão, não para validação — **é do jogador que vem a validação, e eu preciso dizer isso em vez de escrever ✅** |

**Severidade:** 🔥 Crítico · 🟠 Alto · 🟡 Médio · 🔵 Cosmético

---

## 13. ⚠️ RESSALVAS — O QUE PRECISA MUDAR

### 13.1 — Corrigido nas sessões 09 e 10

| # | Ressalva | Status |
|---|---|---|
| R-06 | O detetive não tinha nome | 🟢 **DAVID** (pronúncia inglesa). Sobrenome continua em aberto, e por enquanto não faz falta: ninguém neste jogo pergunta o nome dele |
| R-15 | O corredor de carga estava preto | 🟢 B-31 |
| R-16 | A sanidade zerava em meio minuto | 🟢 B-32 |
| R-17 | Item pego continuava no cenário | 🟢 B-33 |
| R-18 | O Capítulo 2 nunca tinha sido jogado por uma pessoa | 🟢 Foi, na sessão 10 — e trouxe doze problemas, quatro fatais |
| R-20 | O inventário nunca tinha visto um mouse | 🟢 B-48 |
| R-21 | Os NPCs eram o detetive com outra cor | 🟢 Zelador e telefonista com peças próprias |
| R-22 | Os inimigos não eram ideia nenhuma | 🟢 `creatures.js` — cada um é um trauma da profissão |
| R-23 | O Credor era a mesma silhueta preta do Cap. 1 | 🟢 Máscara de porco, avental e motosserra |

### 13.2 — 🟠 Precisa de atenção AGORA

| # | Ressalva | O que fazer |
|---|---|---|
| R-03 | **Áudio da narração não corresponde ao roteiro** | Exportar a gravação nova e substituir `assets/audio/narrator.mp3` |
| R-04 | **QTE precisa de teste humano** | Jogar a fuga do galpão e confirmar que o cano quebra num esforço razoável |
| R-05 | **`assets/reference/` está num repositório público** | São artes conceituais e capturas de terceiros. **Apagar** ou tornar o repositório privado |
| R-19 | **A duração de 1 hora continua sendo estimativa** | Cronometrar uma partida de verdade. Se der 25 minutos, faltam objetos para examinar, não faltam corredores |
| R-24 | 🔥 **Nada da sessão 10 foi jogado por uma pessoa ainda** | Salvar no meio da fuga, sair de um esconderijo com o Credor em cima, bater num Empilhado, arrastar item no casaco: tudo isso foi verificado por script e por captura de tela. **Foi exatamente esse tipo de coisa que escondeu os quatro bugs fatais da sessão 09** (ver M-06) |
| R-25 | **O save vive no `localStorage`, não numa pasta** | Você pediu uma pasta `saves/` no jogo. Um jogo que roda por `file://` **não pode escrever no disco** — o navegador proíbe, e é por isso que ele roda com dois cliques sem instalar nada. O `localStorage` é permanente e sobrevive a fechar o jogo, mas é do navegador: limpar dados do site apaga. **Se quiser arquivo de verdade, dá para fazer botões EXPORTAR/IMPORTAR** que baixam e leem um `.save` — diga e eu faço |
| R-26 | **O fim do capítulo nunca foi visto por uma pessoa** | Ele existe: chegar na doca 3 durante a fuga dispara as três falas e o Credor parado olhando. Só nunca foi alcançado jogando |
| R-27 | 🔥 **O flashback inteiro do Capítulo 3 nunca foi jogado por uma pessoa** | A casa, o quarto da menina, as duas conversas longas e o incêndio foram construídos e percorridos por script na sessão 21. Script não sente ritmo: ele não sabe se sete assuntos com a Julie prendem ou cansam, se atravessar a casa até o quarto é bom, nem se um incêndio de 14,5s sem controle nenhum assusta ou irrita. **É do jogador que vem a validação** (M-06) |
| R-28 | **O fogo é a única cena longa do jogo sem controle nenhum** | 14,5 segundos. Se na sua mão parecer tempo demais, o lugar de cortar é a fase `levanta` (3,6s) e a `fim` (2,6s) em `FASES`, no `chapter3.js` — as duas existem para dar o tempo de olhar, e são as primeiras a sobrar |
| R-29 | 🔥 **O interrogatório nunca foi jogado por uma pessoa** | Script alterna verbos sem sentir nada. O que só a sua mão mede: se o Carlos é insuportável na medida certa, se alternar os três verbos continua interessante depois de três voltas, e se encher a barra até o fim **dá vergonha** — que é o efeito pretendido. Se der satisfação, o problema está no tom das falas do David, não na mecânica |
| R-30 | **A confissão pode ser lida como a verdade do jogo** | Ela é a palavra de um homem espancado, e três coisas dizem isso (o caderno, o Michael e o próprio David admitindo que acredita mesmo assim). **Se na leitura humana ela soar como fato confirmado, é sinal de que o Capítulo 4 precisa desmentir alguma parte dela** — e é melhor decidir qual parte antes de escrever o 4 |
| R-31 | **ANDRADE é nome provisório meu** | Aparece na confissão, na conversa do Michael e em duas páginas do caderno. Trocar é meia hora |
| R-32 | **A cela por dentro nunca foi jogada** | Entrar pela grade, as três animações, o soco com peso, e sair com o capítulo terminando. Script não sente nada disso |
| R-34 | 🔥 **A música da casa é um mp3 de 110 MB e de terceiros** | 48 minutos a 320 kbps — é uma playlist, não uma faixa, e veio do YouTube. **O GitHub recusa arquivo acima de 100 MB**, então ela está no `.gitignore` e o repositório não a tem: quem clonar ouve o piano sintetizado. Para versionar, cortar 1 a 3 minutos que fechem em loop e exportar a 128 kbps (≈2 MB). E vale a mesma ressalva de direitos de `assets/reference/` (R-05) |
| R-35 | **Os gritos continuam sintetizados** | O slot `assets/audio/grito.mp3` está pronto e é o primeiro a ser usado se existir. Enquanto não existir, toca a versão sintetizada refeita na sessão 22 |
| R-33 | **A doze agora viaja no casaco e não faz nada no Capítulo 3** | É proposital — ela é a promessa do 4. Mas se na sua mão o jogador ficar tentando usar e não conseguir, o certo é ela **não** ser pegável até o 4 começar. Isso é decisão sua depois de jogar |

### 13.3 — 🟡 Precisa de atenção, mas não urgente

| # | Ressalva | Nota |
|---|---|---|
| R-07 | Save em 10 slots precisa de teste humano prolongado | Salvar em arquivos distantes, sair, carregar e conferir posição/progresso |
| R-08 | Sistema de diálogo com NPC existe e nunca foi usado | Só será validado quando houver o primeiro NPC |
| R-09 | Trecho do beco entre x≈550 e x≈1000 é visualmente vazio | Falta objeto de cenário nessa faixa |
| R-10 | Arma foi validada por script, não por mão humana | Mirar, atirar, recarregar, ficar sem bala |
| R-11 | O bar ainda é escuro em algumas faixas | Entre a lâmpada pendurada e o balcão |

### 13.4 — 🔵 Cosmético / mais para a frente

| # | Ressalva |
|---|---|
| R-12 | O clarão do disparo pode ainda estar forte (ajuste em `gfx.flash`, `js/systems/player.js`) |
| R-13 | Não há indicação na tela de que se pode correr com SHIFT |
| R-14 | A sala de teste só cobre animação; não há teste de áudio nem de luz |

---

## 14. ROADMAP — O QUE VEM AGORA

### 📌 PRÓXIMO PASSO (sessão 31): **jogar o Capítulo 4 inteiro, com as mãos**

> Ele está no jogo e passa em 266 checagens. O que o script não sabe:
>
> 1. **40 segundos de cigarro é o tempo certo?** É o número que eu chutei no
>    papel e o único que muda o capítulo inteiro. Curto demais vira corrida;
>    longo demais tira a tensão. **Só se decide com o dedo no F.**
> 2. **A ruína dá pra enxergar?** Eu corrigi olhando captura estática, que
>    não é a mesma coisa que jogar. Marca de unha, sapato e cartaz precisam
>    ser legíveis lá dentro.
> 3. **O tutorial se explica sozinho?** Chegar, achar a porta trancada e
>    descobrir o cigarro sem dica nenhuma é a aposta do capítulo. A única
>    dica só aparece depois de 90 segundos parado.
> 4. **A troca casa↔ruína é boa de sentir?** Ela é instantânea com um véu de
>    cinza. Se ficar seca, é aí que mexe.
> 5. **O corredor ensina que dá pra apagar de propósito?** É o único lugar
>    que exige o contrário de tudo o mais.
> 6. **E os dois finais.** Jogue uma vez economizando e uma vez abrindo
>    tudo — são cenas diferentes.
>
> ⚠ E continua de pé: **o Capítulo 3 nunca foi jogado inteiro por mão
> humana** depois das sessões 24 a 26.

### 📌 PASSO ANTERIOR (sessão 30): **decidir por onde o Capítulo 4 começa a existir**

> O capítulo está escrito inteiro (`ROTEIRO.txt`, PARTE XI) e **não tem uma
> linha de código**. Duas ordens possíveis, e a escolha é sua:
>
> **A — o sistema primeiro.** Fazer só a troca dos dois estados num setor
> só (a sala), com o cigarro de 40s, e **jogar isso antes de escrever mais
> cenário**. É o caminho que eu recomendo: 40 segundos pode ser curto ou
> longo demais, e isso não se decide no papel. Se a troca não for boa de
> sentir, o capítulo inteiro muda — melhor descobrir com um setor pronto
> do que com sete.
>
> **B — o cenário primeiro.** Desenhar a ruína por cima da geometria que já
> existe em `levels-ch3.js` e só depois ligar a mecânica. Entrega tela
> bonita mais cedo e descobre o problema de ritmo mais tarde.
>
> ⚠ E continua de pé o que **só você** pode fazer: **o Capítulo 3 nunca foi
> jogado inteiro por mão humana** depois das sessões 24 a 26. Escrever o 4
> não substitui isso.

### 📌 PASSO ANTERIOR (sessão 29): **abrir o exe novo e apertar F11**

> `dist\onefile\Chamado da Meia-Noite.exe` — **reconstruído**, o anterior
> tinha a opção quebrada.
>
> Eu medi a janela indo de 1264x681 para 1920x1080 e voltando, chamando a
> mesma função do menu. O que falta é o dedo:
>
> 1. **F11 enche a tela?** E de novo devolve para a janela?
> 2. **ENTER na opção faz o mesmo?** Se o F11 funcionar e o ENTER não, o
>    problema é a tecla chegar no menu, não a tela cheia.
> 3. **O Esc agora só fecha as opções**, sem desfazer a tela cheia. Confere.
> 4. Em tela cheia, o canvas escala inteiro ou fica com borda estranha? A
>    opção ESCALA INTEIRA é a que mexe nisso.
> 5. A abertura sem dublagem: 77s de carro com as 18 legendas e nenhuma voz.
>    Se ficar longo em silêncio, dá para encurtar os tempos em `js/i18n.js`.

### 📌 PASSO ANTERIOR (sessão 28): **apertar ENTER na TELA CHEIA**

> É a única coisa desta sessão que eu **não consigo verificar sozinho** — o
> arnês de automação entrega a tecla sem código, então o jogo nunca vê um
> ENTER de verdade. Eu provei que o caminho é percorrido e que a API está
> liberada dentro da janela do `.exe`; não provei que a janela estica.
>
> `dist\onefile\Chamado da Meia-Noite.exe` → OPCOES → TELA CHEIA → ENTER.
> Depois F11, que faz a mesma coisa.
>
> 1. Enche a tela? E o Esc devolve para a janela?
> 2. A opção mostra LIGADO/DESLIGADO **de acordo** com o que está na tela,
>    inclusive depois de sair pelo Esc?
> 3. Em tela cheia, o canvas escala inteiro ou fica com borda estranha? Se
>    ficar, a opção ESCALA INTEIRA é a que mexe nisso.
> 4. **A abertura sem dublagem funciona?** São 77s de carro com as 18
>    legendas e nenhuma voz. Se ficar longo demais em silêncio, dá para
>    encurtar os tempos em `js/i18n.js`.

### 📌 PASSO ANTERIOR (sessão 27): **abrir o .exe e jogar por ele**

> `C:\Users\Vargas\Downloads\midnight-call-demo\dist\onefile\Chamado da
> Meia-Noite.exe` — duplo clique.
>
> Eu verifiquei que ele **abre, carrega e chega na tela inicial**. O que eu
> não consigo verificar é como ele se comporta com as mãos de alguém:
>
> 1. **O tamanho da janela (1280x720) está bom?** O canvas escala sozinho, então
>    qualquer tamanho funciona — mas 720p é um chute meu.
> 2. **Falta tela cheia?** Hoje não tem. Dá para pôr F11, e vale saber se você
>    quer que a demo abra já em tela cheia.
> 3. **O som sai no volume certo pela janela nativa?** É outro caminho de áudio,
>    não é o Chrome que você usa para testar.
> 4. **A ausência da música da casa incomoda?** Sem o mp3 o flashback roda com o
>    piano sintetizado. Se ficar pobre, o caminho é cortar 1–3 min em loop.
> 5. Mande para **uma pessoa** antes de mandar para várias — é a única forma de
>    saber o que o SmartScreen e o antivírus dela vão dizer.

### 📌 PASSO ANTERIOR (sessão 26): **jogar o Capítulo 3 inteiro outra vez**

> As três correções desta sessão são de coisas que só aparecem **jogando** —
> nenhuma delas quebrava nada, todas quebravam a ilusão.
>
> 1. **A doze some do armário** quando você pega. Confere se o armário vazio
>    fica estranho — se ficar, dá para deixar a caixa de cartuchos lá.
> 2. **O flashback corta assim que ele entra na casa em chamas**, com 1,3s de
>    fade sobre o vão. Se ficar apressado demais, o número a mexer é esse
>    1,3 (e o `fim` das fases, que tem que ser maior que ele).
> 3. **Na pergunta do cartaz ele para e olha para a guarita.** Confere se
>    virar de frente é o que a cena pede, ou se ele devia responder de
>    costas, já com a mão na porta — é escolha de direção, não de código.

### 📌 PASSO ANTERIOR (sessão 25): **jogar o flashback inteiro, e olhar o chute**

> `MENU → CAPÍTULOS → 3` → subsolo → gaveta D. Fala com a Julie e com a
> Jenna, sai de casa, atende o telefone **de onde estiver**.
>
> O que eu preciso saber:
>
> 1. **O chute acerta a porta agora?** Ele foi testado dos quatro cantos da
>    rua, mas quem decide se a corrida tem o peso certo é quem está olhando.
>    Se ele parecer atrapalhado indo até a marca, o lugar de mexer é a
>    velocidade (132 px/s) e os 34px em que a corrida vira caminhada.
> 2. **A queda dá para ver?** A câmera sobe 30px durante o incêndio por
>    causa disso. Se ainda ficar escondida atrás da legenda, sobe mais.
> 3. **A música entra na hora certa?** Ela nasce no primeiro quadro do
>    passado, na rua, e não é mais cortada nas portas. Volume 0.18 — se ela
>    disputar leitura com as conversas da casa, baixa.
> 4. E o silêncio depois que ele atende: dá para sentir?

### 📌 PASSO ANTERIOR (sessão 24): **jogar o Capítulo 3 do começo ao fim**

> Ele termina agora. `MENU → CAPÍTULOS → 3` e vai até o plantonista pedir o
> nome.
>
> O que eu preciso saber:
>
> 1. A **virada** no fim do interrogatório funciona? Seis falas seguidas é
>    muito, ou é o peso certo? Se cansar, o lugar de cortar é a terceira e a
>    quinta.
> 2. Entregar os pertences na entrada **incomoda na medida certa** ou vira
>    burocracia chata na segunda vez?
> 3. A música na casa está no volume certo (0.18)? Ela some quando ele
>    atende o telefone — dá pra sentir o silêncio depois?

### 📌 PASSO ANTERIOR (sessão 23): **jogar a cela inteira, do lado de dentro**

> `MENU → CAPÍTULOS → 3` → subsolo → a porta da cela → **ENTRAR**.
>
> 1. Atravessar a grade e a delegacia sumir da tela **funciona**, ou parece
>    só uma sala menor?
> 2. As três animações se distinguem no meio da cena, ou viram a mesma
>    coisa? O soco tem peso?
> 3. Sair de lá com o capítulo terminando — o gatilho novo — chega na hora
>    certa, ou você ainda fica rodando a delegacia sem saber o que fazer?

### 📌 PASSO ANTERIOR (sessão 22): **jogar o interrogatório**

> `MENU → CAPÍTULOS → 3`, descer até a cela e sentar na frente do Carlos.
>
> As três perguntas que só a sua mão responde:
>
> 1. O **Carlos** é filho da puta o bastante? Ele tem que ser insuportável
>    sem nunca ameaçar e sem nunca implorar.
> 2. Alternar **PERGUNTAR / PRESSIONAR / BATER** é interessante, ou vira
>    mecânico depois de três voltas? Se virar, o lugar de mexer são os pesos
>    em `PESO`, no `interrogatorio.js`.
> 3. Encher a barra até o fim **dá vergonha**? É o que deveria dar. Se der
>    satisfação, a cena falhou e o problema está no tom das falas do David,
>    não na mecânica.

### 📌 PASSO ANTERIOR, AINDA EM ABERTO (sessão 21): **jogar o flashback**

> `MENU → CAPÍTULOS → 3`, descer até o Arquivo Morto e abrir a gaveta D.
>
> As três perguntas que só a sua mão responde:
>
> 1. A conversa com a **Julie** dá vontade de continuar puxando assunto, ou
>    cansa? Ela tem sete assuntos agora — se o jogador sair no terceiro, o
>    fogo não vai cobrar nada depois.
> 2. Atravessar a casa até o **quarto da menina** é bom ritmo, ou é
>    caminhada à toa?
> 3. O **incêndio** assusta, ou parece efeito? Ele dura ~14,5s e o jogador
>    não tem controle nenhum durante ele.

### 📌 PASSO ANTERIOR, AINDA EM ABERTO: **jogar o Capítulo 2 inteiro, com as mãos**

> Tudo abaixo foi construído e percorrido **por script**, não por uma pessoa.
> O que só mão humana mede: se uma hora é uma hora, se o combate é justo, se
> a sanidade incomoda na medida, e se a fuga assusta ou irrita.
>
> Abrir `JOGO_OFFLINE.html`, jogar do começo ao fim, e anotar onde entedia.

### O Capítulo 2, como ficou

```
 1 CORREDOR DE CARGA  1700px  revela a escala. O PORRETE.        Sem-Rosto
 2 ESCRITORIO          560px  o CADERNO, o MAPA, o ZELADOR.      respiro
2b ARQUIVO MORTO       620px  a gaveta do D. A CHAVE.            Sem-Rosto
 3 SETOR B: ESTANTES  1500px  primeiro combate. A MUNICAO.       Empilhados + Sem-Rosto
 4 VESTIARIO          1150px  o MACO.                            respiro
4b BANHEIRO            420px  ★ O ESPELHO.                       respiro
 5 CAMARA FRIA         900px  o isqueiro. A alucinacao.          Empilhados
 6 SALA DE MAQUINAS    950px  a PISTOLA, e a emboscada.          Sem-Rosto
 7 MEZANINO           1000px  a TELEFONISTA.                     ninguem
 8 DOCA 3              760px  a saida, e quem fica olhando.      ninguem
```

> A escada do mezanino fica **trancada**. A chave está no arquivo morto, do
> outro lado do galpão — e como a perseguição só começa quando ele desce de
> lá, isso garante que o Credor nunca apareça com o detetive de mãos vazias.

### Sistemas novos, e o que cada um ainda deve

| Sistema | Estado | O que falta |
|---|---|---|
| Sanidade (4 estados) | 🟡 | sentir jogando. Números recalibrados na 09 |
| Caderno | 🟡 | 17 páginas escritas; 3 são "as que ele não escreveu" |
| Inventário (o sobretudo) | 🟡 | arrastar com um mouse de verdade |
| Inimigos + Diretor | 🟡 | ver se o teto de 3 e os 40–60s de silêncio bastam |
| Combate com porrete | 🟡 | 3 golpes matam um Empilhado; a ripa dura ~9 golpes |
| Perseguição do Credor | 🟡 | conferir se dá para escapar sem ser injusto |
| Diálogo com escolhas | 🟢 | — |
| O espelho em 1ª pessoa | 🟡 | é uma carta que só se joga uma vez |

### Ordem sugerida depois do teste

1. **Ajustar o ritmo do Capítulo 2** com base no que a mão humana disser
2. Gravar a narração que corresponde ao roteiro (R-03 destrava sozinho)
3. ~~Escrever o Capítulo 3~~ ✅ **escrito na sessão 18** — `ROTEIRO.txt`,
   PARTE IX. "GAVETA D", seis setores, sem combate, com o degrau 4 na cela
4. **Sobrenome do David** — deixou de ser opcional: o Cap. 3 tem pasta de
   arquivo, livro de visitas, plaquinha de mesa e crachá na parede
5. Construir o **verbo de dedução** e os **tópicos de diálogo persistentes**
   — é neles que o Capítulo 3 inteiro se apoia, e nenhum dos dois existe
6. Capítulo 4 e a revelação da letra — e a ligação das 02h14

---

## 15. DECISÕES TÉCNICAS

### 1. Rig articulado em vez de sprite sheet

Movimento contínuo a 60 fps sem desenhar 30 quadros à mão por animação, e
liberdade para sobrepor a mira. **Troca:** exige calibragem, senão vira boneco
de pano. Se um dia chegarem sprite sheets de verdade, é só outra implementação
de `_renderRig()` — o resto do jogo só chama `play()` e `draw()`.

### 2. Texto pixelado sem arquivo de fonte

A frase é desenhada com fonte do sistema num buffer minúsculo, os pixels são
lidos e **toda a suavização é jogada fora** (alpha vira 0 ou 255). Borda dura
igual fonte bitmap, com acento e cedilha funcionando — o que importa muito num
jogo PT/EN. Cada frase fica em cache; sem isso a máquina de escrever derreteria
o jogo.

### 3. A paleta é mais clara do que a realidade

A cena inteira é **multiplicada** pelo buffer de luz. Cor "realista" vira preto.
Foi preciso clarear pele, roupa, tijolo e asfalto até parecerem errados no
arquivo — e certos na tela.

### 4. Empacotador próprio em vez de concatenar

Cada módulo vira uma função num registro mínimo, mantendo escopo próprio.
Concatenar quebraria: `pixel.js` e `i18n.js` exportam os dois um `line`. Os
exports são registrados como *getters*, para que reatribuições (`i18n` troca
`lang`) continuem visíveis para quem importou.

### 5. A cutscene é dirigida pela narração, não por relógio

O carro anda enquanto a voz fala e freia quando ela acaba, qualquer que seja a
duração da gravação. Se o arquivo não existir, cai numa tabela de tempos escrita
à mão e continua funcionando.

### 6. Interface DEPOIS da luz

Se a interface for desenhada antes de `endLights()`, ela é multiplicada junto
com o cenário e o menu sai escuro. É a regra mais fácil de quebrar no projeto.

### 7. Pós-processamento poupa o personagem

Grão e scanline usam recorte par-ímpar: força total no cenário, um quarto em
cima dele. Ruído em cima de um rosto de 14px come justamente os pixels que
desenham o olho e a boca.

### 8. Tensão por distância, não por tempo

`setDread(k)` recebe um número derivado da distância da figura. É isso que faz
o jogador querer olhar para trás — um tema que sobe sozinho não tem essa
propriedade.

---

## 16. DÚVIDAS EM ABERTO

| # | Dúvida | Impacto |
|---|---|---|
| ~~D-01~~ | ~~Qual o nome do detetive?~~ | ✅ **DAVID**, pronúncia inglesa. Sobrenome em aberto |
| ~~D-02~~ | ~~Ele recupera a arma no Capítulo 2?~~ | ✅ **Sim, na Sala de Máquinas** — e paga por ela |
| D-03 | A figura negra é uma pessoa ou já é um pesadelo? | Define se o horror começa aqui ou depois. O Capítulo 2 escolheu não responder |
| D-04 | Quem escreveu a nota? | "Essa letra... eu conheço essa letra". O caderno já plantou a resposta: a letra é dele mesmo, de sete anos atrás |
| D-05 | O jogo terá múltiplos finais? | Muda a estrutura de flags de save. **Em 12/08 apareceu a primeira bifurcação de verdade**: o fim do Capítulo 4 tem duas versões, decididas pela conta do maço. Não são finais, mas usam a mesma estrutura |
| D-06 | Vai existir música original ou só ambiente sintetizado? | Se sim, precisa de arquivos |
| D-07 | Manter 5 horas ou cortar para 3 horas excelentes? | Recomendação minha: prefira 3 horas boas a 5 irregulares |
| ~~D-08~~ | ~~O Credor volta no Capítulo 3?~~ | ✅ **Volta, e não persegue.** Fica sentado na sala de espera da delegacia com uma senha de atendimento na mão, motosserra desligada no colo. O número do painel sobe a cada setor. Na saída chamam a senha dele e a cadeira está vazia |
| ~~D-09~~ | ~~Onde exatamente o cigarro destrava?~~ | ✅ **Na cela, no fim do Capítulo 3** — e ele não decide nada. Acende um pro homem da cela (técnica de interrogatório, ofício) e acende um pra ele no automático. Só percebe olhando pra própria mão |
| D-10 | **A aproximação de câmera em conversa amplia o pixel do cenário** | 1,6x ajuda muito e denuncia; 1,3x ajuda pouco e não denuncia. Decisão de tela, não de papel |
| ~~D-11~~ | ~~Nomes: filha, mulher, criminoso, parceiro, e o sobrenome do David~~ | ✅ **DAVID HENRY · JENNA · JULIE · CARLOS · MICHAEL**, travados em 07/08. **ANDRADE** (o policial) entrou em 10/08 e é provisório |
| ~~D-10~~ | ~~A aproximação de câmera em conversa amplia o pixel do cenário~~ | ✅ **1,35x**, e só no interrogatório. Decidido olhando a tela: 1,6x denuncia, 1,35x não. `gfx.aproximar()`, chamada entre a luz e a interface |
| D-14 | **O Andrade aparece na tela em algum momento?** | Ele é a figura negra sentada na sala de espera, se você quiser que seja. Minha recomendação: **nunca mostrar o rosto**, nem no Capítulo 4. Um homem que o David matou e não lembra funciona melhor sem cara |
| D-12 | **O incêndio foi acidente ou foi posto?** | O laudo diz origem indeterminada, o Michael diz que não foi ele, e o Carlos não nega nem confirma. **A minha recomendação é nunca responder:** enquanto não há resposta, o cigarro na mão dele é a acusação que ele faz a si mesmo — e é isso que o Capítulo 4 tem para cobrar. Se virar "foi um curto", o personagem perde o motivo |
| D-13 | ~~**Ele acha mesmo que ela está viva, ou é só o processo aberto?**~~ | ✅ **Respondido pelo Capítulo 5**, travado em 12/08: ele acha, o jogo deixa ele achar, e o jogo desmonta na cena do corpo. O Capítulo 4 existe para construir essa esperança durante 45 minutos |
| D-15 | **40 segundos de cigarro é o tempo certo?** | Decisão de tela, não de papel — igual à D-10. Curto demais vira corrida contra o relógio, longo demais tira a tensão. **Só se resolve jogando um setor** |
| D-16 | **Dá para o jogador ficar preso por falta de cigarro?** | Hoje não: os quatro obrigatórios são exatamente quatro, e os três opcionais só abrem conteúdo. Mas se a produção mover um obrigatório, isso vira risco de softlock e precisa de rede |
| D-17 | **As marcas de tiro na casa intacta ficam entre capítulos?** | Recomendação minha: **não**. Zerar no fim do 4. Carregar isso para o 5 e o 6 é estrutura de flag que o jogo ainda não tem |

---

## 17. LOG DE SESSÕES

### Sessão 01 — 03/08/2026 · ~4h · ~350k tokens

Fundação inteira do jogo, do zero.

Motor de render 480×270 com luz, bloom, grão, vinheta, scanline e tremor.
Texto pixelado sem arquivo de fonte. Save em 10 slots com miniatura. Áudio
totalmente sintetizado. Rig do personagem com 9 peças e as primeiras
animações. Beco e bar construídos. Cutscene de abertura com carro, narração e
legendas. Menu de título como cena viva. Localização PT/EN. Sala de teste.

**Bugs corrigidos:** B-06 (dt negativo).

### Sessão 02 — 04/08/2026 · ~35min · ~60k tokens

Narração colocada no jogo. Legendas sincronizadas por análise do envelope de
volume do áudio. Projeto subiu para o GitHub (privado no início).

**Erro de método:** M-01 — afirmei que o áudio era o meu roteiro citando
fronteiras que eram zero por construção.

### Sessão 03 — 04/08/2026 · ~40min · ~70k tokens

Voz levantada +12 dB com limitador. Ambiente abafado durante a fala. Provado
com três verificações que o áudio **não** corresponde ao roteiro. Corrigido o
lançador (B-03, B-04, B-05). Criado `DIAGNOSTICO.bat`.

**Bugs corrigidos:** B-03, B-04, B-05, B-07, B-14, B-15.

### Sessão 04 — 04/08/2026 · ~1h10 · ~120k tokens

🔥 **Descoberto o B-01:** o jogo nunca tinha travado. Uma regra de CSS deixava
a tela de erro visível para sempre, com o jogo rodando atrás dela. Os três
sintomas que o jogador deu ("nada para copiar", "sai som", "o cursor some")
eram a resposta inteira.

🔥 **Resolvido o B-02:** `JOGO_OFFLINE.html`, arquivo único que roda com dois
cliques em qualquer máquina.

Personagem: rosto 3/4, torso assimétrico, braço de trás visível, contorno
reduzido. Animações: `ease: 'linear'`. Cigarro sem isqueiro, com "hoje não...".
Carro estacionado. Grão reduzido.

**Bugs corrigidos:** B-01, B-02, B-08, B-09, B-10, B-11, B-12, B-13.

### Sessão 05 — 04/08/2026 · ~50min · ~90k tokens

**Sobretudo marrom** — a maior mudança de leitura do projeto. Gola levantada
ligando cabeça e corpo. Olho com quatro pixels de funções diferentes. Sistema
de falas soltas com 19 linhas. **Bar destruído** de verdade, com o detetive
comentando a contradição das cadeiras empilhadas no meio do estrago.

### Sessão 06 — 04/08/2026 · ~40min · ~80k tokens

Sobretudo **fechado** (o aberto era vista de frente num jogo lateral).
**Arma completa**: coldre, sacar, mirar pelo mouse no eixo Y, atirar,
recarregar, contador de balas, fogo de boca como luz real, linha pontilhada de
mira. Rosto compactado, boca com cor própria, pós-processamento poupando o
personagem.

**Bugs corrigidos:** B-16, B-17, B-18, B-19.

### Sessão 07 — 04/08/2026 · ~45min · ~90k tokens

Trilha de sangue pelo bar. Depósito com a poça e a nota. **Cena da nota**:
ele lê de costas para a porta, a figura negra se aproxima, a tensão sobe com a
distância, o golpe corta a música em 10ms, pálpebras abrem com duas piscadas e
ele acorda algemado.

**Bugs corrigidos:** B-22, B-23 (parcial), B-27 (parcial).

### Sessão 08 — 04/08/2026 · ~50min · ~100k tokens

Som ambiente por lugar. Falas com prioridade. Falas durante a aproximação.
**Galpão** substituindo a sala genérica. **QTE de fuga**. Perda de todos os
pertences. Ócio virando sentar. Portas em tamanho de gente.

**Bugs corrigidos:** B-26, B-27, B-28, B-23.

### Sessão 08b — 04/08/2026 · ~30min

🔥 **B-24: o cano nunca quebrava.** Números do QTE calibrados contra ritmo de
script. Recalibrados para mão humana.

**B-25:** sentar era instantâneo e vinha antes do sequestro.

**R-01 e R-02:** fala que entregava o susto trocada; figura negra some ao
apagar a tela.

Escrito este documento mestre.

**Bugs corrigidos:** B-24, B-25, B-29, B-30.

### Sessão 09 — 04/08/2026 · ~3h

🎬 **O CAPÍTULO 2 INTEIRO — "GENTILEZA".**

Luiz entregou o roteiro (`ROTEIRO.txt`) e travou as quatro decisões que
faltavam: a **Telefonista** no mezanino, **os três inimigos**, a **emboscada**
ao pegar a pistola, e o fim na **doca com o Credor olhando**.

**Oito setores novos** (`levels-ch2.js`, ~1300 linhas): corredor de carga,
escritório, estantes, vestiário, câmara fria, sala de máquinas, mezanino,
doca. Com pincéis industriais novos — estante de três níveis, empilhadeira,
portão de doca, relógio de ponto parado em 02h14, armários de vestiário,
ganchos de açougue, caldeiras, mesa telefônica, porta de câmara fria.

**Seis sistemas novos:**

- `sanity.js` — quatro estados, **sem barra na tela**. O medidor é a própria
  imagem: a vinheta fecha, o som mente, e aparecem coisas que não estão lá.
- `journal.js` — ele anota sozinho, com animação de escrita à mão. E abaixo
  de 50 começam a aparecer **páginas que ele não escreveu**.
- `inventory.js` — o inventário **é o sobretudo**, visto por dentro. Não pausa
  o jogo. O porrete não cabe em bolso nenhum.
- `enemies.js` — Empilhados, Sem-Rosto, Ecoador e o Credor, todos feitos do
  mesmo rig do detetive usado errado. Mais o **Diretor**, que decide quando
  vale a pena pôr alguém em cena (teto de 3, nunca no campo de visão,
  40–60s de silêncio depois de uma briga).
- `chase.js` — a perseguição. As luzes apagam setor por setor vindo na
  direção dele, e o som do cano arrastando chega **antes** dele.
- `scene-espelho.js` — a única cena em primeira pessoa do jogo.

**Onze animações novas** no rig, mais `tintPass` para recolorir sem apagar a
sombra interna. **Diálogo com escolhas.** **Onze sons novos**, e os loops
`hum` e `freezer`.

**Bugs corrigidos:** B-31 a B-41.
**Erros de método:** M-04 (repeti o B-23 inteiro), M-05 (números de ritmo
escritos sem medir).

### Sessão 10 — 04/08/2026 · ~3h · a sessão do primeiro teste humano

Luiz jogou o Capítulo 2 e trouxe **doze problemas**, quatro deles capazes de
travar a partida. Esta sessão é inteira sobre eles.

🔥 **O save não salvava.** Ele anotava a fase e o X e teleportava o
personagem; o resto do mundo ficava como estivesse. Carregar no meio da fuga
devolvia um galpão apagado, com a música de tensão tocando, sem o Credor,
sem o porrete e com a saída fechada. Agora o save carrega o **mundo inteiro**
— todos os setores, todos os itens já pegos, e a perseguição em curso.
Mais uma **tela de carregamento** de 9,5s, com quatro frases da narração.

🔥 **Preso no esconderijo.** O Credor parava em cima do jogador e girava para
sempre (o sinal da direção invertia a cada quadro), e sair só respondia ao
`E`. Zona morta de 14px, e agora seis teclas diferentes tiram você de lá.

🔥 **O combate não acertava.** Tudo era distância em X — quem anda de quatro
tem 34px de altura e ninguém checava altura nenhuma. E o tiro descartava
qualquer ângulo acima de 22°, ou seja, mirar para baixo era erro garantido.
Caixas de colisão de verdade, e a bala virou uma reta.

🔥 **O Credor não matava.** O gancho de dano nunca tinha sido ligado.

🎨 **Design novo para tudo que é gente ou quase.** `js/art/creatures.js`:
os Sem-Rosto (as pessoas que ele não salvou), os Empilhados (os corpos, com
lençol e etiqueta no pé), o Ecoador (fone de telefone no lugar do rosto) e
o Credor (avental de açougueiro, cabeça de porco em pano de saco,
motosserra que nunca desliga). Mais o zelador e a telefonista.

Também: **duas barras** no topo (CORPO e CABEÇA), **o mapa** em `M`, **cursor
no inventário**, **fonte de máquina de escrever** em todo texto falado,
falas com duração pelo tamanho do texto, o efeito da perseguição reduzido,
**duas salas novas** (o banheiro — onde o espelho agora fica na altura do
rosto — e o arquivo morto), e **a chave** que tranca a escada do mezanino
até ele estar armado.

**Bugs corrigidos:** B-42 a B-52.
**Erro de método:** M-06.

### Sessão 14 — 06/08/2026 · Codex · legibilidade, inventário e perseguição

O texto foi refeito com prioridade total para leitura. As falas curtas não
flutuam mais sobre David nem usam uma caixa que cobre o cenário: agora são
**legendas compactas na base da tela**, no formato `DAVID: fala`. O desenho
das letras preserva as bordas suavizadas da fonte, os diálogos usam uma fonte
de interface mais limpa e o caderno abandonou a dobra central por uma
**página única**, com linhas mais espaçadas e corpo de texto legível.

O inventário recebeu silhuetas próprias para pistola, mapa, munição, cigarro,
isqueiro, documentos, curas e sedativos. Os três relés do puzzle — MÃO, OLHO
e VOZ — agora entram de fato no casaco ao serem recolhidos, ocupam a coluna
**CASO**, sobrevivem ao save/reload e só saem quando são instalados no painel.

A passagem por portas foi acelerada: interagir com uma saída começa a troca
de sala no mesmo quadro, e durante a perseguição o apagão dura apenas 0,12s.
Depois que a porta foi aceita, o Credor não pode mais interromper a ação com
um golpe. Se ele estava perto, cruza para a sala seguinte em menos de um
segundo; se estava longe, a demora ainda acompanha a distância. Ele continua
entrando pelo lado correto, sem se teleportar à frente de David.

**Esconder-se agora basta para quebrar o rastro.** O Credor atravessa David
sem colisão, procura adiante e abandona a sala sem exigir que o jogador prenda
a respiração. O fôlego ganhou outra função: segurar `Shift` **controla o
pânico**, reduz a perda de sanidade e evita o suspiro involuntário enquanto o
Credor passa perto; não é mais uma senha para a inteligência do monstro.

**Verificação:** regressões completas do Capítulo 2 e do puzzle passaram tanto
na versão modular quanto em `JOGO_OFFLINE.html`. O teste de save confirmou que
um item pego depois do salvamento reaparece ao recarregar, um item já pego no
save continua ausente e inventário/cenário voltam ao mesmo instante. O pacote
offline foi regenerado com 33 módulos.

### Sessão 15 — 06/08/2026 · Codex · a fuga deixa de ser só corrida

O Credor agora pode **agarrar David** quando realmente o alcança. O primeiro
agarrão só é permitido depois dos segundos iniciais da fuga; contatos seguintes
alternam golpes e agarrões, respeitam intervalo de 8–13s e o teto de três por
perseguição. A tela fecha sobre os dois corpos e pede `M — RESISTIR`. A primeira
tentativa exige aproximadamente seis pressões, com aumento pequeno depois de
cada fuga bem-sucedida. Falhar produz uma morte própria da motosserra.

O estado da arma muda a saída: pistola já sacada dispara à queima-roupa e gasta
munição; porrete na mão dá mais força, mas perde durabilidade. Sem arma David
escapa com mais dano. Depois da resistência ele cai, levanta, ganha uma janela
curta e o Credor bate a serra no metal antes de voltar à corrida. Vida baixa
usa uma luta corporal mais lenta e deixa mais sangue no sobretudo.

A rota original não ganhou salas obrigatórias. Em vez disso, recebeu recursos
**compactos e de uso único**: válvula de vapor nas máquinas, fresta estreita no
vestiário, estante derrubável, carrinho de carga, porta corta-fogo manual e
alarme de distração no corredor. Cada recurso compra somente 1–3s. O circuito
do puzzle libera uma passagem de serviço das máquinas ao corredor; em 36% das
novas fugas a porta comum emperra e o atalho vira a rota necessária. O Credor
rompe a chapa atrás de David, deixando a abertura permanentemente no mapa.

Os esconderijos agora variam sem exigir `Shift`: primeiro o Credor atravessa e
sai; depois pode golpear um esconderijo errado; numa visita posterior pode
silenciar a motosserra, fingir que foi embora, bater no armário errado e então
abandonar a sala de verdade. Sair cedo durante o silêncio permite que ele volte
a caçar. Prender a respiração continua sendo apenas controle de pânico.

Pequenos eventos espalham a duração pelo capítulo sem acrescentar corredores:
um telefone descreve os movimentos de David antes que aconteçam; a ligação põe
uma **SALA 0** inexistente no mapa; um relatório muda depois do puzzle; a foto
do escritório mostra David no turno da noite; o relógio imprime um cartão de
ponto com entrada às 02h14; o manequim do vestiário muda de lugar; e um inimigo
morto pode reaparecer sentado no escritório, sem atacar.

Vida zero agora abre a tela **A DÍVIDA VENCEU**. `M/ENTER` restaura um checkpoint
em memória criado no início da fuga, `L` abre os saves e `ESC` volta ao menu. O
checkpoint não ocupa arquivo. O seletor de saves foi ampliado de três para
**dez arquivos**, preservando os saves antigos e exibindo quatro por vez com
rolagem.

**Verificação:** regressão completa do Capítulo 2 passou na versão modular e no
pacote offline; puzzle e restauração de itens continuaram passando. O décimo
arquivo foi gravado diretamente, e agarrão, fuga, checkpoint, obstáculos,
rota variável, telefone, documento mutável e sala fantasma foram cobertos pelo
teste. O pacote offline agora contém 34 módulos.

---

### Sessão 16 — 07/08/2026 · Codex · percepção, ferimentos e fuga em dois atos

O Capítulo 2 recebeu um **pacote de percepção** que mantém as informações no
mundo em vez de transformá-las em mais medidores. Cada material agora tem
passos próprios — metal denuncia corrida por muito mais longe, concreto abafa,
gelo estala e madeira responde seca — e os inimigos reagem ao ruído recente de
David. As lâmpadas projetam sombras longas; com sanidade baixa, a sombra de
David atrasa alguns pixels. Alucinações continuam perigosas porque gastam uma
bala, mas são justas: não projetam sombra, têm contorno menos presente e som
incompleto. Revisitar uma sala pode acrescentar marcas e rastros discretos, e
as descrições dos itens mudam de modo simples quando a cabeça dele piora.

O corpo passou a contar a história do combate. Tiros distinguem **cabeça,
tronco, braços, pernas e pés**. Feridas nos braços removem membros visuais;
feridas nas pernas produzem mancar; Empilhados feridos se arrastam de outra
forma. Inimigos comuns ficaram mais agressivos e, quando sobrevivem muito
machucados, têm uma chance real de entrar em **Frenzy**: correm, agarram David
e iniciam uma defesa em `M`. Vencer usa a parede, uma estante, um gancho ou uma
válvula conforme a sala; falhar machuca David, mas o confronto termina. Foram
criadas animações próprias para corrida, agarrão, luta e quatro finalizações.
David também conserva no desenho a vida baixa, o sangue e o rasgo do casaco.

A pistola ficou menos automática. Um alvo saudável não cai com um tiro comum,
o dano depende da parte atingida, um headshot só explode a cabeça quando é
letal e a bala atravessa **no máximo dois corpos**, perdendo força no segundo.
Enquanto mira, deslocar o mouse horizontalmente para o lado oposto vira David
sem obrigar a guardar a arma. O mouse vertical continua controlando o cano.

A perseguição do Credor ganhou um **segundo ato compacto de cerca de um
minuto** atrás da Doca 3. O portão emperra na altura do peito; David desliza e
o Credor corta a passagem. Na rota de serviço, `E` derruba imediatamente uma
estante para comprar tempo — sem menu e sem interromper o clima — e sela o
depósito de suprimentos. Há duas rotas breves, uma porta cujo corte acontece
visivelmente, um guarda-corpo onde o casaco é rasgado e uma câmara fria com
falso silêncio. As lâmpadas revelam a silhueta do Credor em pulsos enquanto
ele abre a parede com a motosserra.

O encerramento agora é inteiramente físico. Na baia de correntes, David tira
um palete reforçado do carrinho e o coloca entre o próprio corpo e a serra. A
madeira se parte até a lâmina alcançar uma cinta metálica interna; David puxa
o destravamento, o portão cai sobre o carrinho e ele passa por baixo. A câmera
continua em uma área externa real, o **Pátio de Carga**, sob chuva. Atrás da
grade, o Credor arranca a serra, começa a erguer o portão e permanece olhando
David quando o capítulo corta.

O estado inteiro dessa extensão entra no save: rota, estante, casaco, ponto do
apagão, parede cortada, distância e chegada do Credor. Recarregar não reinicia
o falso silêncio nem deixa a iluminação alterada depois de sair da sala.

Foi adicionada uma dificuldade única para o jogo inteiro:

- **HISTÓRIA** — inimigos mais lentos, frágeis e menos numerosos.
- **NORMAL** — agressivo, mas com margem confortável para conhecer o mapa.
- **DIFÍCIL [RECOMENDADA]** — ritmo pretendido, com perseguição e Frenzy mais
  presentes.
- **MENTE** — maior número de inimigos, mais vida, dano, velocidade e pressão.

Não existem controles separados para puzzle ou “terror psicológico”. O menu
também ganhou a **ARENA DE COMBATE**, uma sala não canônica com três alvos,
pisos diferentes, munição ampla e Frenzy forçado para testar mira, ferimentos,
perfuração e finalizações sem refazer o capítulo.

**Verificação:** o validador leu os 38 módulos sem erro de sintaxe. A regressão
do Capítulo 2 confirmou dificuldade, dano anatômico, limite de dois corpos,
Frenzy, portão/slide, casaco rasgado, reload no falso silêncio, final com
palete/portão/pátio e abertura da arena pelo menu. A suíte completa passou tanto na versão
modular quanto em `JOGO_OFFLINE.html`; puzzle e restauração de itens também
passaram nos testes isolados.

---

### Sessão 17 — 07/08/2026 · Codex · revisão do clímax da perseguição

A tela de escolha da estante foi removida. A ação recebeu prioridade sobre os
itens próximos, alcance maior, luz vermelha pulsante e uma legenda urgente na
base da tela. O armário de suprimentos foi deslocado para não disputar o mesmo
comando; derrubar a estante acontece na hora e continua custando o conteúdo do
depósito.

A velocidade do Credor passou a usar duas faixas: perto de David ela preserva
uma margem pequena para corrida e portas; longe, cresce o suficiente para
recuperar terreno. A pressão da rota agora tem teto e não se multiplica de
forma descontrolada com a dificuldade. Cortes de porta e parede ganharam
progresso, faíscas, silhueta e destroços visíveis — nenhuma barreira troca de
inteira para destruída em um único quadro.

O antigo final da corrente foi substituído pelo palete com cinta metálica,
queda do portão, passagem de David por baixo e continuação no Pátio de Carga.
Foram criadas poses próprias para pegar e firmar o palete, serrar, passar sob a
grade e erguê-la. O Credor não teleporta nem desaparece: fica atrás da grade,
liberta a motosserra e força o portão enquanto David olha para trás na chuva.

**Verificação:** os 38 módulos passaram na validação de sintaxe e a regressão
completa confirmou a estante imediata, o corte persistente, a curva de
velocidade e a transição física até o pátio. A apresentação também foi revista
em quadros separados da estante, do palete e do olhar final.

### Sessão 18 — 07/08/2026 · Claude · o Capítulo 3 escrito, e o passado travado

Sessão de escrita e decisão. **Nenhuma linha de código foi alterada.**

**O passado de David foi definido** e está em `ROTEIRO.txt`, PARTE IX.0. Sete
anos atrás ele era bom, fechou um caso e prendeu o responsável. Naquela noite,
em casa, o telefone tocou às 02h14; ele saiu pra atender e acendeu um cigarro
na varanda. Quando voltou, a mulher estava morta e a filha tinha sumido. **O
corpo da filha nunca foi encontrado** — é esse o caso que não fecha.

Isso reescreve o sentido de três coisas que **já estão no jogo desde o
Capítulo 1, sem exigir alteração em nenhuma delas**:

- o **cartaz de desaparecida** do beco é a filha dele, e a data de "três
  semanas atrás" não bate com sete anos de propósito: ele ainda imprime
  cartaz novo;
- o **cigarro não é vício, é o álibi da ausência dele** — cada "hoje não..."
  é aquele cigarro específico;
- o **nome que ele não diz em voz alta** é o da filha, não o do criminoso.

E amarra a ligação das 02h14, o fio cortado do bar, os relógios parados e a
frase da Telefonista numa coisa só: ele atende a mesma ligação toda noite há
sete anos. **Isso é revelação do Capítulo 4** — o Capítulo 3 só planta.

**Capítulo 3 — "GAVETA D"**, seis setores, ~55 min, **sem combate nenhum**: a
arma fica no escaninho 214 da portaria. Recepção · Plantão (o Parceiro, e
quatro versões da mesma noite) · A Mesa Dele · Arquivo Morto · **flashback
jogável** de doze minutos onde ele era inteiro e fumava sem hesitar ·
A Cela. Onze migalhas, todas caladas. O capítulo termina com o plantonista
pedindo o nome da filha pro cartaz, e o jogo parando pra esperar.

**Duas ideias foram levantadas e descartadas**, e ficam registradas pra não
voltarem:

| Ideia | Por que não |
|---|---|
| Capítulo 3 (ou o jogo) em **3D**, 1ª ou 3ª pessoa | ~7.200 linhas de `js/art` + `js/world` + `gfx.js` seriam descartadas, o rig e as 26 animações refeitos do zero, e não existe pipeline de arte 3D no projeto. É um jogo novo, não um capítulo. Só ~4.100 linhas (áudio, i18n, save, inventário, caderno, sanidade, diálogo) sobreviveriam |
| **Seletor de câmera** no menu (lateral / 1ª / 3ª) | É construir e balancear o jogo duas vezes, e mata a cena do espelho — que só funciona porque o jogo **nunca** tinha sido em primeira pessoa |
| **Câmera de conversa em close** e **inspeção volumétrica de objeto de cenário** | Cortadas pelo Luiz. O peso vem por dentro da câmera lateral — ver `ROTEIRO.txt` IX.7 |

**O diagnóstico que gerou as três continua válido:** lateral a 480×270 com um
boneco de 62px achata conversa e achata ambiente, e o Capítulo 3 é 100%
conversa e ambiente. A resposta ficou em **IX.7**: aproximação suave de câmera
sem corte, encenação (os dois virados um pro outro, deslocamento vertical como
profundidade), **poses de reação no rig** — que é a atuação inteira, já que o
rosto não é canal —, a luz fechando numa poça em cima dos dois, o ambiente
abafando, silêncio como recurso de atuação, e do lado do cenário: **camada de
primeiro plano de verdade** (a maior falta hoje), salas visíveis atrás de
divisórias de vidro, gente atravessando ao fundo, máquina mexendo, e a regra
numérica de luz aplicada **desde o primeiro setor** (erro M-04, já cometido
duas vezes).

**Resolvidos:** D-08 (o Credor volta esperando a vez, sem perseguir) e D-09
(o cigarro destrava na cela, sem escolha do jogador).
**Abertos novos:** D-10 (escala da aproximação de câmera) e D-11 (os nomes —
e o sobrenome do David deixou de ser opcional).

### Sessão 18b — 07/08/2026 · Claude · o verbo de dedução e a conversa com memória

Nomes travados pelo Luiz: **DAVID HENRY**, **JENNA** (a filha), **JULIE** (a
mulher), **CARLOS** (o homem que ele prendeu) e **MICHAEL** (o parceiro). O
sobrenome fecha a gaveta D: as pastas são todas *HENRY, D.* — é por isso que a
gaveta do D não estava no arquivo do galpão.

Construídos os dois sistemas em que o Capítulo 3 inteiro se apoia. **Os dois
já valem no Capítulo 2**, então não são código parado esperando conteúdo.

#### O verbo de dedução (`journal.js` + `i18n.js`)

No caderno, `X` segura uma página com o dedo; `X` numa segunda tenta juntar as
duas. Se as duas falam da mesma coisa, ele escreve uma **terceira**, na
categoria CONCLUSÃO, e a conclusão **grava uma flag no jogo**. Cinco pares
existem hoje, todos com anotações que já estavam no Capítulo 2:

| Junta | Com | Vira |
|---|---|---|
| telefone de fio cortado | relógio de ponto parado | *um minuto que não passa* |
| a letra do bilhete | uma página que ele não escreveu | *era minha* |
| o zelador sabia o nome | a telefonista sabia o nome | *o estranho aqui sou eu* |
| portas que trancam por fora | o Credor andando lá dentro | *nunca precisaram de porta* |
| a ripa e a conveniência | a pistola apontada para a porta | *isso é uma rota* |

O jogo **não diz quais combinam** e não marca nada na tela. Errar custa uma
linha seca ("Não fecha.") e mais nada. Deduzir devolve 12 de sanidade — quase o
dobro de anotar —, porque é a única coisa no jogo que ele faz com a cabeça em
vez de com as mãos.

A dedução da letra exige uma página `alheia`, que só aparece abaixo de 50 de
sanidade. **De propósito:** ele só junta essas duas quando já está rachando.

#### Tópicos persistentes, perguntas travadas e INSISTIR (`dialogue.js`)

- **A memória do que ele já perguntou saiu da sessão e foi para as flags**
  (`flags.talkMem`), então sobrevive a salvar e carregar. Antes, a lista de
  perguntas apagadas se recompunha do zero a cada conversa.
- **Pergunta com `req` só aparece quando a flag existe.** É assim que uma
  dedução do caderno vira fala — e é o que faz deduzir valer alguma coisa em
  vez de virar colecionável.
- **INSISTIR:** um assunto já respondido cujo nó tenha `press` continua
  clicável, marcado `(insistir)` na lista. Custa 5 de sanidade, só dá para
  fazer uma vez por assunto, e é o único caminho para algumas respostas.
- **Falar duas vezes com o mesmo NPC voltou a ser permitido** — mas só quando
  `talkHasMore()` diz que existe pergunta nova ou insistência disponível.
  Conversa esgotada continua sem reabrir, que era o ponto da correção da
  sessão 12.

As duas conversas que já existem ganharam profundidade real: o zelador tem duas
perguntas novas travadas por dedução e uma segunda resposta se ele for
pressionado sobre o dia ("Assinou sim. Está lá, com a sua letra."); a
telefonista tem uma pergunta travada pela dedução da letra e uma segunda
resposta sobre a ligação ("O senhor nunca ficou para ouvir.").

#### Dois bugs encontrados pelo caminho

**B-53 é sério e é antigo:** `journal.load()` tinha um `else` sem chaves que
grudou no `if` de dentro do `for`. Save no formato de objeto — o formato atual
desde a sessão 12 — **restaurava o caderno vazio**. Nenhum teste pegava porque
o teste de save existente confere itens e inventário, não páginas.
**B-54:** `instanceof Set` dá falso entre janelas diferentes.

#### Verificação

Novo `ferramentas/teste_deducao.html`, no padrão dos outros: **122 checagens,
todas verdes** — tabela de deduções, par certo, par errado, conclusão que não
serve de insumo, aba de documentos que não marca, save/load da dedução, save
antigo, pergunta travada, insistir, cobrança de sanidade, reabertura de
conversa, memória nas flags e integridade de todos os nós das duas conversas
(destino existente, PT e EN em toda fala e toda escolha).

As três regressões que já existiam **continuam passando**: Capítulo 2 completo,
puzzle do turno de 02h14 e save de itens. `JOGO_OFFLINE.html` regenerado com
**38 módulos, 816 KB**, e a dedução foi executada dentro do pacote, não só nos
módulos. A interface nova foi conferida por leitura de pixel (faixa da página
segurada, dobra do canto e troca do rodapé), porque a captura de tela não
estava disponível.

**O que isto NÃO é:** teste humano. Vale o M-06 de sempre — script não sente
ritmo, não descobre que juntar duas páginas é confuso, e não repara se `X` é
uma tecla ruim para isso. **Precisa de mão humana:** abrir o caderno no meio do
Capítulo 2, tentar juntar páginas sem dica nenhuma, e dizer se a mecânica se
explica sozinha ou se precisa de uma linha de tutorial.

**Próximo passo:** teste humano da dedução no Capítulo 2. Depois, os seis
setores do Capítulo 3 e a camada de primeiro plano (IX.7.B.1 do roteiro).

### Sessão 19 — 07/08/2026 · Claude · o Capítulo 3 inteiro, e o seletor de capítulo

Nomes travados: **DAVID HENRY**, **JENNA**, **JULIE**, **CARLOS**, **MICHAEL**.

#### O seletor de capítulo

Item novo no menu principal. **Os três capítulos já nascem liberados** — não há
nada a destravar, e travar conteúdo num jogo que ainda está sendo feito só
atrapalha quem está fazendo. Escolher um capítulo monta o estado dele do zero,
em memória, e entra; **não toca em nenhum dos dez arquivos salvos** (coberto por
teste). O Capítulo 1 começa pela cutscene, o 2 no corredor de carga sem arma
nenhuma, o 3 na escadaria da delegacia.

#### Os seis setores — `js/world/levels-ch3.js`

```
 1 RECEPCAO        1080px  a arma no escaninho 214. O Credor esperando a vez.
 2 PLANTAO         1400px  MICHAEL. Quatro versoes da mesma noite.
 3 A MESA DELE      620px  degrau 2 do cigarro. A gaveta dos cartazes.
 4 ARQUIVO MORTO   1500px  a GAVETA D. O corredor mais longo na volta.
 5 SETE ANOS ATRAS 1250px  flashback jogavel. Sem inimigo, sem sanidade.
 6 A CELA           700px  CARLOS. DEGRAU 4. E o nome.
```

**Não há combate em nenhum deles.** A arma fica no escaninho 214 da portaria —
não é confisco de roteiro, é a porta, e é a segunda vez na vida dele que
entrega uma arma naquele balcão. Todo setor declara `maxInimigos: 0`.

Pincéis novos: divisória de vidro aramado **com salas atrás**, mesa de plantão
com máquina de escrever, fileira de arquivos de aço, grade de cela, escaninhos
de arma numerados, painel de senha, cadeiras de espera.

**A regra numérica de luz virou código.** `preencher()` coloca o preenchimento
fraco a cada 200px sozinho, e `auditarLuz()` reprova qualquer setor acima de
800px com vão maior que 400px entre lâmpadas fortes — o teste chama isso nos
seis. O erro M-04 já custou dois capítulos pretos; agora ele não depende de
alguém lembrar.

#### Peso sem trocar a câmera

**Camada de primeiro plano de verdade** em todos os seis setores: colunas,
batentes e as pontas das fileiras de arquivo passando **na frente** do
personagem. Era a maior falta apontada em `ROTEIRO.txt` IX.7.B, e é o maior
ganho de profundidade que um side-scroller tem. Mais salas visíveis atrás de
divisórias de vidro, ventilador de teto e máquina de escrever mexendo ao fundo.

#### Sistemas — `js/systems/chapter3.js`

- **A escada do cigarro**, degraus 2 a 5. O degrau 4 acontece na cela e **o
  jogo não pergunta nada ao jogador**: David acende um para o Carlos falar —
  técnica de interrogatório, ofício, ele fez isso mil vezes — e acende outro
  no automático. Só depois olha para a própria mão. Se virasse escolha,
  viraria vitória, e não é vitória.
- **O painel de senha.** O Credor volta e **não persegue**: fica sentado na
  sala de espera, motosserra desligada no colo, com uma senha na mão. O número
  sobe a cada setor novo (revisitar não conta). Na saída chamam a senha dele e
  a cadeira está vazia. Ele nunca fala.
- **O modo flashback.** Paleta muito mais clara, sem arma, sem sangue, sem
  rasgo no casaco, sem sanidade — e o ócio muda: ele **acende e fuma**, usando
  a animação `smokeLighter` que estava guardada no rig desde a sessão 04
  exatamente para isto. O jogador vê o gesto dezenas de vezes e só entende na
  cela.
- **O fim.** O plantonista pede o nome dela para o cartaz, e o jogo para. Dizer
  e não dizer são os dois finais válidos; dizer não vence nada — ele escreve,
  agradece, deseja boa noite, e nada acontece.

#### Dois bugs sérios, os dois achados jogando

**B-55:** a cela era beco sem saída — sair dela trancava o jogador fora do
Carlos. Nenhuma verificação pegava, porque todas checavam "a porta aponta para
uma fase que existe" e nunca "dá para voltar".
**B-56:** cena roteirizada vazava para outra partida via `setTimeout`. O fim do
Capítulo 2 tem o mesmo defeito **desde a sessão 12** e foi corrigido junto.

#### Verificação

Novo `ferramentas/teste_capitulo3.html`: **393 checagens, todas verdes** —
estrutura dos seis setores, ida e volta de toda porta, regra de luz, seletor de
capítulo (inclusive que ele não apaga save), escaninho, senha do Credor, os
cinco degraus do cigarro, flashback ida e volta, telefone da varanda, as duas
saídas do nome, caderno, três deduções novas, integridade das seis conversas, e
**o capítulo inteiro percorrido do começo ao fim** — andando, abrindo porta,
conversando e saindo.

Uma checagem específica garante que **o nome JENNA não aparece escrito em lugar
nenhum** — caderno, falas ou conversas — antes da última cena.

As três regressões antigas continuam passando. `JOGO_OFFLINE.html` regerado com
**40 módulos, 929 KB**, e o Capítulo 3 foi exercitado dentro do pacote.

> ⚠️ **Nada disso é teste humano.** Vale o M-06 de sempre: script não sente
> ritmo, não descobre que uma conversa é longa demais, não repara se a
> delegacia é bonita e não sabe se o degrau 4 emociona ou passa batido.
> **É do jogador que vem a validação.**

**Próximo passo:** jogar o Capítulo 3 inteiro pelo seletor e dizer três coisas —
se a conversa com o Michael prende ou cansa, se o flashback de doze minutos sem
perigo nenhum entedia, e se a cena do cigarro na cela funciona sem o jogo
apontar para ela.

### Sessão 20 — 07/08/2026 · Claude · correção do Capítulo 3

Sessão inteira de correção, em cima de quatro reclamações do Luiz. Todas
procedentes.

#### 🔥 "os NPCs são só pessoas invisíveis com interação"

Era literalmente isso, e por **dois** motivos somados:

1. O laço que **desenha** as pessoas estava dentro do `if (cap2)`.
2. O laço que **insere o gancho de interação** ficava no fim de
   `entrouCh2()`, depois de um `return` seco para setores que não fossem do
   Capítulo 2.

Então o Capítulo 3 tinha conversa escrita, caixa de colisão pendurada à mão
no cenário — e nenhuma pessoa. Corrigidos os dois, e o laço de inserção virou
`_porGenteNaFase()`, chamado pelos dois caminhos.

**Oito personagens novos desenhados** em `creatures.js`, com peças próprias:
plantonista (farda, quepe), **Michael** (camisa arregaçada, gravata frouxa,
grisalho), Ruiz (farda), Elaine (blusa vinho), Betinho (tricô, caneca na mão),
**Carlos** (camiseta de detento, sem sapato), **Julie** (vestido de casa) e
**Jenna** (pijama, e `escala: 0.72` — a cabeça dela é proporcionalmente maior
no sprite, senão criança vira adulto reduzido). As caixas de interação e de
colisão acompanham a escala.

Os interactables `talk3` escritos à mão nos setores foram removidos: quem cria
o gancho agora é o próprio NPC.

#### 🔥 "o flashback está totalmente diferente do que conversamos"

Estava. Ele ficava na calçada olhando uma fachada, e a família era barulho
atrás de uma porta. Refeito como você descreveu:

**Ele entra na casa → fala com a Julie e com a filha → o telefone DELE toca →
ele sai para atender → e ouve os gritos.**

Setor novo `ch3_home`: a única sala quente do jogo — abajur, televisão ligada
sem ninguém olhando, sofá, mesa posta, porta-retratos. **Nenhuma migalha
dentro dela**, de propósito: um detalhe errado ali e o jogador passa doze
minutos procurando o truque em vez de estar presente.

O telefone só toca **depois das duas conversas**. Dentro de casa ele se recusa
a atender ("aqui dentro não dá, vou pra varanda") — sair é o gesto que importa,
e é o jogador que executa.

Os gritos vêm **de dentro, com ele de costas**, abafados pela parede. Nada é
mostrado. Som novo `audio.scream()`: três serras fazendo formantes de garganta
com vibrato irregular, ruído de ar, e um passa-baixa que é literalmente a
parede entre os dois.

#### 🔥 "o interrogatório não faz sentido, nenhuma conversa faz com a história"

Também procedente. Reescritas todas, ancoradas em fatos:

- **Por que Carlos está lá:** transferência, audiência de manhã, passa a noite
  na custódia. Michael avisa antes, lá em cima. Banal e verificável.
- **O núcleo:** David prendeu Carlos às **20h12**; a família morreu às
  **02h14**; ele estava numa cela. **A teoria da vingança nunca fechou** — e
  Michael diz na cara: *"Nunca fechou pra ninguém aqui. Foi você que precisou
  que fechasse."*
- **Elaine** registrou a ligação das 02h14 — e anotou de onde veio: **do ramal
  daquela sala**. Foi por isso que ninguém quis assinar o relatório.
- **Ruiz** tem a hora no livro. **Betinho** viu David voltar de madrugada e
  passar a noite na mesa — e depois recua, porque não aguenta o que acabou
  de dizer.
- **Michael** conta a noite inteira sem enigma: dirigiu até lá, achou a porta
  aberta, e David sentado na varanda com o telefone na mão. E a companhia
  telefônica disse que **nenhuma chamada entrou naquele número**.

#### "faça uma aba específica pra juntar provas com algum botão"

Aba **PROVAS** no caderno (`Z` cicla ANOTAÇÕES → PROVAS → DOCUMENTOS): duas
bancadas visíveis, a lista de provas embaixo, e um botão **JUNTAR** clicável
com o mouse ou por `ENTER`. `X` põe e tira da bancada. Conclusão já tirada não
volta para a bancada. O `X`-em-duas-páginas da sessão 18 continua funcionando
na aba de anotações para quem já se acostumou.

#### Verificação

`ferramentas/teste_capitulo3.html`: **578 checagens, todas verdes**. As novas
medem **pixel na tela** para cada uma das oito pessoas — a checagem que teria
pego o bug original —, a ordem inteira do flashback (casa → duas conversas →
toca → sai → atende), e a bancada de provas com o botão. Regressões do
Capítulo 2, dedução e save continuam passando. `JOGO_OFFLINE.html` regerado
com **40 módulos, 975 KB**, e as pessoas foram medidas visíveis dentro do
pacote.

**Lição registrada:** três dos quatro problemas eram coisas que nenhum teste
meu podia pegar, porque todos verificavam que o objeto EXISTE. Ninguém
verificava que ele APARECE, e ninguém podia verificar que uma conversa faz
sentido. A checagem de pixel resolve o primeiro. O segundo continua sendo
seu.

### Sessão 20b — 07/08/2026 · Claude · o plantonista e o Carlos

Duas correções de arte, as duas apontadas pelo Luiz olhando a tela.

#### O cara sentado na recepção

Ele existia e era desenhado — e mesmo assim não dava para ver. **A encenação
estava errada, não o sprite.** O balcão inteiro estava pintado na camada de
trás, e as pessoas são desenhadas *depois* das camadas: ele flutuava na frente
do móvel. Pior, o vidro era um retângulo `#0f151b` sólido — mesmo se ele
estivesse do lado certo, não havia o que atravessar.

Refeito em três partes:

- **atrás** (camada normal): o nicho da guarita, a prateleira de fichário, a
  bancada por dentro, e o **banco alto**;
- **a pessoa**, com `yOff: -22` — sentada no banco, não no piso. Sem isso a
  cabeça dele ficava abaixo da altura do balcão;
- **na frente** (camada nova de primeiro plano em **paralaxe 1:1**): a frente
  do balcão, a moldura do vidro com montantes e dois riscos de reflexo, e a
  **abertura recortada** em frente ao rosto dele.

Medido: **286 pixels do rosto aparecem** pela abertura, e as pernas ficam
**totalmente ocultas** (0 de 680 pixels) atrás do balcão.

#### O Carlos tem que parecer preso

Estava de camiseta cinza — que num porão cinza é só mais um cinza. O que diz
"preso" não é cara de mau, é rotina: **macacão de custódia fechado até em cima
com a numeração estampada no peito, cabelo raspado rente, pulseira de papel no
punho e pé descalço.** Sem cadarço, sem cinto, sem nada que amarre.

E a cor foi **o erro clássico do projeto**: o primeiro ocre era `#9a7b46`, que
é o ocre "realista" — e chegava na tela como `(41,36,28)`, um marrom sem nome.
Repintado claro (`#d9a95c`), como a regra da paleta manda desde a sessão 01.

Medido: tronco `(51,42,31)` contra parede de cela `(15,15,15)` — **3× mais
claro e quente (R−B = 20)** contra concreto neutro. Ele separa do fundo, e a
exposição bate com a do sobretudo do David `(61,42,27)`, então ele não parece
de outro jogo.

#### Erro de método na medição

A primeira medição do plantonista deu resultado errado por **duas** razões, e
as duas ficam registradas porque valem para qualquer verificação de imagem
neste projeto:

1. **O grão de filme muda ~180 pixels sozinho entre dois quadros.** Comparar
   duas capturas com ele ligado é medir ruído. Agora o teste zera
   `gfx.grainAmount` e `gfx.scanlines` antes de medir, e confere o piso de
   ruído.
2. **`cam.iy` não é zero** (era −27). Coordenada de mundo não é coordenada de
   tela, e eu tratei como se fosse.

**Verificação:** 587 checagens verdes, incluindo as novas de oclusão da
guarita e de cor do macacão. Regressão do Capítulo 2 continua passando.
`JOGO_OFFLINE.html` regerado com 40 módulos, 980 KB, e as duas correções foram
medidas dentro do pacote.

---

## 18. GLOSSÁRIO

| Termo | O que é |
|---|---|
| **Bark** | Fala curta em cima da cabeça do personagem, sem caixa de diálogo e sem resposta |
| **Rig** | Esqueleto de peças articuladas que substitui a sprite sheet |
| **Pose-chave** | Conjunto de ângulos de todos os membros num instante; o jogo interpola entre elas |
| **`ease: 'linear'`** | Interpolação reta entre poses. É o que tira a moleza dos braços |
| **Buffer de luz** | Imagem separada onde a luz é somada; a cena é multiplicada por ela no fim |
| **Bloom** | Halo de luz, feito reduzindo o buffer de luz a 1/4 e ampliando de volta com suavização |
| **Duck** | Abaixar automaticamente um som para outro passar por cima (a chuva abaixa para a voz) |
| **Dread** | O tema de tensão comandado pela distância da figura negra |
| **QTE** | *Quick time event* — sequência de teclas sob pressão. Aqui: A + D alternado para arrebentar o cano |
| **Pálpebras** | `gfx.eyelid`, 0 fechado e 1 aberto, com borda curva |
| **Silhueta** | Personagem pintado de uma cor só; é como a figura negra é feita |
| **Catraca** | Trava que impede o progresso do QTE de cair abaixo do último quarto conquistado |
| **`enterBarksNow`** | Falas que disparam ao entrar na fase **cortando** o que estiver sendo dito |
| **Sala de teste** | Modo acessível pelo menu para percorrer todas as animações |
| **Diretor** | Quem decide quando vale a pena pôr um inimigo em cena. Não é gerador de ondas |
| **Migalha** | Uma coisa que não fecha, plantada sem comentário. Sete famílias delas, listadas no ROTEIRO |
| **A escada do cigarro** | O cigarro é item, e ele não consegue fumar até o Capítulo 3. Cada tentativa é uma recusa diferente |
| **`tintPass`** | Recolore o boneco inteiro sem apagar a sombra de dentro. É como um NPC deixa de ser o detetive |
| **`itensSoltos`** | Os poucos objetos desenhados por quadro, porque precisam sumir quando pegos |
| **Conveniência** | A regra do Capítulo 2: tudo que ele precisa aparece na hora exata. Não é preguiça de design — é enredo, e ele comenta |
| **Dedução** | Juntar duas páginas do caderno (`X` numa, `X` na outra) para gerar uma terceira. A conclusão grava uma flag, e a flag abre pergunta nova em conversa |
| **`david_passado`** | O conjunto de peças da roupa de sete anos atrás: camisa, gravata e colete, sem aba de sobretudo e sem coldre. A cabeça continua sendo a dele |
| **O fogo** | A casa queimando depois dos gritos, no flashback. Responde por que ele não fuma e por que ele acha que ela está viva — sem que ninguém diga nenhuma das duas coisas |
| **Pressão** | A barra do interrogatório. Não mede a resistência do Carlos: mede **o quanto o David já desceu**. Ele só entrega tudo quando o homem do outro lado da grade estiver irreconhecível |
| **A confissão** | O que o Carlos diz com a barra cheia. Foi arrancada na porrada e **não presta** — o caderno diz isso, o Michael diz isso, e o David acredita mesmo assim |
| **Andrade** | O policial que ligou para a casa do David às 02h14. Nome provisório. O David ouve o nome e **não pergunta quem é** |
| **`gfx.aproximar()`** | A câmera fechando, a 1,35x, chamada entre a luz e a interface — assim o mundo chega perto e o texto não vira letra de bloco |
| **`ch3_dentro`** | Dentro da cela. 300px, o menor setor do jogo. Quando o David atravessa a grade, a delegacia sai da tela |
| **`intAsk` · `intPush` · `intHit`** | Os três corpos do interrogatório. Cada um mais baixo e mais fechado que o anterior — a escada está no corpo, e ninguém comenta |
| **A virada** | As seis falas no fim do interrogatório em que o David decide ir atrás do Andrade. São as únicas do jogo inteiro em que ele decide alguma coisa em voz alta |
| **`playerSobreFore`** | Setor em que o primeiro plano é desenhado ANTES do jogador. Existe porque a grade e a guarita precisam esconder o preso e o plantonista, e não ele |
| **`aviso()`** | A faixa no alto da tela quando o jogo TIRA ou DEVOLVE alguma coisa. Diferente do aviso de item pego, que é discreto: este é para as trocas que o jogador não fez com as próprias mãos |
| **`sitHurt` · `sitFlinch`** | Apanhar sentado. Existem porque `hurt` é um recuo de quem está em pé, e um homem sentado tocando `hurt` parece ter levantado da cadeira para apanhar |
| **Conclusão** | A página que só existe se o jogador deduzir. Categoria própria no caderno |
| **Insistir** | Perguntar de novo o que já foi respondido. Custa 5 de sanidade, só dá uma vez por assunto, e às vezes é o único caminho |
| **`talkMem`** | O que ele já perguntou a cada pessoa, guardado nas flags do save em vez da sessão |
| **A gaveta D** | *HENRY, D.* — as pastas do arquivo morto. É o Capítulo 3, e é por isso que a gaveta do D faltava no galpão |
| **`runId`** | O número da partida em curso. Cena agendada com `setTimeout` congela ele e confere na hora de disparar, para não vazar para outra partida |
| **`preencher()`** | A regra numérica de luz virada em código: preenchimento fraco a cada 200px na altura do chão, em todo setor do Capítulo 3 |
| **`auditarLuz()`** | Reprova qualquer setor acima de 800px com vão maior que 400px entre lâmpadas fortes. Chamado pelo teste |
| **Degrau 4** | O momento na cela em que ele acende sem decidir. Não é botão, não é escolha: é uma fala que o jogo escuta |
| **Seletor de capítulo** | Menu que entra direto em qualquer um dos três capítulos. Não apaga nenhum save |

---

> **Última atualização:** 11/08/2026 — Sessão 24 (Claude)
> **O que mudou nela:** **a virada** (o David decide ir atrás do Andrade —
> as únicas seis linhas do jogo em que ele decide alguma coisa), a portaria
> obrigatória com devolução na saída, o chute que agora acerta a porta e a
> abre, música e gritos podendo vir de arquivo, a doze com desenho e aviso,
> e três bugs: **B-64** (ele atravessava a cela e a guarita), **B-65**
> (pegar item não avisava nada no Cap. 3) e **B-66** (o balão aparecia no
> meio das cenas).
> ⚠ **O mp3 da música tem 110 MB e não vai para o GitHub** — está no
> `.gitignore`. Ver a sessão 24 e `assets/audio/LEIA-ME.txt`.
> **Próximo passo:** jogar o Capítulo 3 do começo ao fim, agora que ele
> termina.
>
> _(as notas abaixo são das sessões 21 a 23 e continuam valendo)_
>
> **Sessão 23:** o David entra na cela
> **O que mudou nela:** o David **entra na cela** (setor novo, a delegacia
> sai da tela), três animações novas para os verbos e duas para o preso
> apanhar sentado, o Carlos perdeu a árvore de conversa e o "senhor", o
> cigarro virou o fim do interrogatório, o resto do "ele mesmo ligou" saiu,
> a doze virou item, o incêndio acaba com ele **chutando a porta e
> entrando**, e o flashback acontece uma vez só. Dois bugs: **B-62** (o
> capítulo não terminava) e **B-63** (a luz da cela não chegava no chão).
> **Próximo passo:** jogar a cela inteira — entrar, interrogar até o fim,
> sair e terminar o capítulo.
>
> _(as notas abaixo são das sessões 21 e 22 e continuam valendo)_
>
> **Sessão 22:** o sistema de interrogatório
> **O que mudou nela:** o **sistema de interrogatório** (três verbos, barra
> de pressão, a câmera fechando), a ligação ganhou dono (**ANDRADE**, e
> ninguém mais diz que o David ligou para si próprio), a **figura negra**
> sentada na sala de espera, a calibre doze na mesa dele, música na casa e
> na delegacia, os gritos refeitos, a roupa social e os cabelos compridos.
> Mais dois bugs de encenação: **B-60** e **B-61**.
> **Próximo passo:** **jogar o interrogatório.** O que eu preciso saber: o
> Carlos é filho da puta o bastante? Alternar os três verbos é interessante
> ou vira mecânico? E encher a barra até o fim dá vergonha — que é o que
> deveria dar?
>
> _(a nota abaixo é da sessão 21 e continua valendo)_
>
> **Sessão 21:** outra roupa no flashback, o quarto da menina, o
> telefone que se atende de qualquer lugar, **a casa pegando fogo**, os
> diálogos do Capítulo 3 aprofundados, e dois bugs (B-58 e B-59).
> Continua faltando **jogar o flashback com as mãos**: a conversa com a
> Julie prende ou cansa? Atravessar a casa até o quarto é bom ritmo? E o
> incêndio assusta, ou parece efeito?
>
> _(a nota abaixo é da sessão 20b e continua valendo)_
>
> **Última atualização anterior:** 07/08/2026 — Sessão 20b (Claude)
> **Próximo passo:** **jogar o Capítulo 3 pelo seletor.** O que eu preciso
> saber: as oito pessoas parecem gente na tela? O flashback dentro de casa
> funciona — as duas conversas dão vontade de ficar ali? E os depoimentos
> (Carlos preso às 20h12, a ligação saindo do ramal da própria sala) fecham
> como investigação, ou ainda soam soltos? Continuam pendentes o teste humano
> da dedução e o do Capítulo 2 nas quatro dificuldades.
