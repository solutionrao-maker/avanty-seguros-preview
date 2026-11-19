(function () {
  /* Menu no celular e dropdown "Seguros" */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');

  var fecharDropdowns = function () {
    if (!nav) return;
    nav.querySelectorAll('.nav-dropdown[open]').forEach(function (d) { d.open = false; });
  };
  var definirMenu = function (aberto) {
    nav.classList.toggle('open', aberto);
    toggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    if (!aberto) fecharDropdowns();
  };

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      definirMenu(!nav.classList.contains('open'));
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { definirMenu(false); });
    });
    /* Esc fecha o menu e o dropdown; o foco volta para o botão do menu */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var menuAberto = nav.classList.contains('open');
      fecharDropdowns();
      if (menuAberto) { definirMenu(false); toggle.focus(); }
    });
    /* Clique ou toque fora fecha o dropdown e o menu */
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-dropdown')) fecharDropdowns();
      if (nav.classList.contains('open') && !e.target.closest('#siteHeader')) definirMenu(false);
    });
  }

  /* Chat rápido (botão flutuante do WhatsApp) */
  var chatToggle = document.getElementById('chatToggle');
  var chatPanel = document.getElementById('chatPanel');
  var chatClose = document.getElementById('chatPanelClose');
  if (chatToggle && chatPanel) {
    var definirChat = function (aberto) {
      chatPanel.classList.toggle('open', aberto);
      chatPanel.setAttribute('aria-hidden', aberto ? 'false' : 'true');
      chatToggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    };
    var fecharChat = function () {
      /* se o foco estava dentro do painel, devolve ao botão antes de esconder */
      if (chatPanel.contains(document.activeElement)) chatToggle.focus();
      definirChat(false);
    };
    chatToggle.addEventListener('click', function () {
      if (chatPanel.classList.contains('open')) fecharChat(); else definirChat(true);
    });
    if (chatClose) chatClose.addEventListener('click', fecharChat);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && chatPanel.classList.contains('open')) fecharChat();
    });
    document.addEventListener('click', function (e) {
      var widget = document.getElementById('chatWidget');
      if (widget && !widget.contains(e.target) && chatPanel.classList.contains('open')) definirChat(false);
    });
  }

  /* Cotação em 3 perguntas: tipo de seguro, para quem, nome. Termina no WhatsApp. */
  var cot = document.getElementById('cotador');
  if (cot) {
    cot.classList.add('is-js');
    /* Validação própria: a nativa trava o Enter nos passos 1 e 2, onde o campo "nome" está oculto */
    cot.noValidate = true;
    var passos = [].slice.call(cot.querySelectorAll('.cotador-passo'));
    var barras = [].slice.call(cot.querySelectorAll('.cotador-progresso span'));
    var contagem = cot.querySelector('.cotador-contagem');
    var campo = cot.querySelector('input[name="nome"]');
    var erro = document.getElementById('cotador-erro');
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

    if (campo) {
      campo.addEventListener('input', function () {
        campo.removeAttribute('aria-invalid');
        if (erro) erro.hidden = true;
      });
    }

    /* No celular o WhatsApp abre na mesma aba (a aba nova fica em branco no iOS). No computador, em aba nova;
       o clique num link real é aceito pelos bloqueadores de pop-up, ao contrário do window.open. */
    var abrirWhatsApp = function (url) {
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        window.location.href = url;
        return;
      }
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    cot.addEventListener('submit', function (e) {
      e.preventDefault();
      /* Enter nos passos 1 e 2 avança, como o botão "Continuar" */
      if (atual < passos.length - 1) {
        var avancar = passos[atual].querySelector('.cotador-continuar');
        if (avancar && !avancar.disabled) ir(atual + 1, true);
        return;
      }
      var nome = campo ? campo.value.trim() : '';
      if (!nome) {
        if (campo) { campo.setAttribute('aria-invalid', 'true'); campo.focus(); }
        if (erro) erro.hidden = false;
        return;
      }
      var msg = 'Olá! Meu nome é ' + nome + '. Quero cotar ' +
        (escolhido('tipo') || 'um seguro') + (escolhido('para') ? ' ' + escolhido('para') : '') + '.';
      abrirWhatsApp('https://wa.me/5561992713443?text=' + encodeURIComponent(msg));
    });

    ir(0, false);
  }
})();
