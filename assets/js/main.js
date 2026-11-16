(function () {
  /* Menu no celular */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Chat rápido (botão flutuante do WhatsApp) */
  var chatToggle = document.getElementById('chatToggle');
  var chatPanel = document.getElementById('chatPanel');
  var chatClose = document.getElementById('chatPanelClose');
  if (chatToggle && chatPanel) {
    var closeChat = function () {
      chatPanel.classList.remove('open');
      chatPanel.setAttribute('aria-hidden', 'true');
      chatToggle.setAttribute('aria-expanded', 'false');
    };
    var toggleChat = function () {
      var open = chatPanel.classList.toggle('open');
      chatPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
      chatToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    chatToggle.addEventListener('click', toggleChat);
    if (chatClose) chatClose.addEventListener('click', closeChat);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeChat();
    });
    document.addEventListener('click', function (e) {
      var widget = document.getElementById('chatWidget');
      if (widget && !widget.contains(e.target)) closeChat();
    });
  }

  /* Cotação em 3 perguntas: tipo de seguro, para quem, nome. Termina no WhatsApp. */
  var cot = document.getElementById('cotador');
  if (cot) {
    cot.classList.add('is-js');
    var passos = [].slice.call(cot.querySelectorAll('.cotador-passo'));
    var barras = [].slice.call(cot.querySelectorAll('.cotador-progresso span'));
    var contagem = cot.querySelector('.cotador-contagem');
    var atual = 0;

    var ir = function (n, comFoco) {
      atual = n;
      passos.forEach(function (p, i) { p.classList.toggle('is-ativo', i === n); });
      barras.forEach(function (b, i) { b.classList.toggle('is-feito', i <= n); });
      if (contagem) contagem.textContent = 'Pergunta ' + (n + 1) + ' de ' + passos.length;
      if (comFoco) {
        var alvo = passos[n].querySelector('input:checked') || passos[n].querySelector('input');
        if (alvo) alvo.focus();
      }
    };

    var escolhido = function (nome) {
      var el = cot.querySelector('input[name="' + nome + '"]:checked');
      return el ? el.value : '';
    };

    /* Cada "Continuar" só libera depois que uma opção é marcada */
    passos.forEach(function (passo, i) {
      var avancar = passo.querySelector('.cotador-continuar');
      if (!avancar) return;
      var radios = passo.querySelectorAll('input[type="radio"]');
      avancar.disabled = !passo.querySelector('input:checked');
      radios.forEach(function (r) {
        r.addEventListener('change', function () { avancar.disabled = false; });
        /* Clique de mouse ou toque avança sozinho. Teclado (detail 0) usa o botão. */
        r.addEventListener('click', function (e) { if (e.detail > 0) ir(i + 1, true); });
      });
      avancar.addEventListener('click', function () { ir(i + 1, true); });
    });

    cot.querySelectorAll('.cotador-voltar').forEach(function (b) {
      b.addEventListener('click', function () { ir(Math.max(atual - 1, 0), true); });
    });

    cot.addEventListener('submit', function (e) {
      e.preventDefault();
      if (atual < passos.length - 1) return;
      var campo = cot.querySelector('input[name="nome"]');
      var nome = campo ? campo.value.trim() : '';
      if (!nome) { campo.focus(); return; }
      var msg = 'Olá! Meu nome é ' + nome + '. Quero cotar ' +
        (escolhido('tipo') || 'um seguro') + (escolhido('para') ? ' ' + escolhido('para') : '') + '.';
      window.open('https://wa.me/5561992713443?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });

    ir(0, false);
  }
})();
