/* Comportamento compartilhado pelos materiais de Informática (tema, barra lateral, sumário e rótulos) */
(function () {
  // 1. Botão de copiar código
  document.querySelectorAll("pre.code").forEach(function (pre) {
    var b = document.createElement("button");
    b.className = "copiar";
    b.type = "button";
    b.textContent = "Copiar";
    b.addEventListener("click", function () {
      navigator.clipboard.writeText(pre.querySelector("code").innerText).then(function () {
        b.textContent = "Copiado";
        setTimeout(function () { b.textContent = "Copiar"; }, 1400);
      });
    });
    pre.appendChild(b);
  });

  // 2. Menu no celular
  var menu = document.querySelector(".menu-btn");
  var lat = document.querySelector(".lateral");
  if (menu && lat) {
    menu.addEventListener("click", function () {
      var o = document.body.classList.toggle("menu-aberto");
      menu.setAttribute("aria-expanded", o);
    });
    lat.addEventListener("click", function (e) {
      if (e.target.closest("a")) document.body.classList.remove("menu-aberto");
    });
  }

  // 3. Alternar tema claro/escuro (salvo em localStorage e sincronizado com o site todo)
  var temaBtn = document.querySelector(".tema-btn");
  if (temaBtn) {
    temaBtn.addEventListener("click", function () {
      var r = document.documentElement;
      var escuro = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      r.dataset.theme = escuro ? "light" : "dark";
      try { localStorage.setItem("tema", r.dataset.theme); } catch (e) {}
    });
  }

  // 4. Ocultar/mostrar barra lateral (modo tela cheia)
  function setBarraOculta(oculta) {
    document.body.classList.toggle("barra-oculta", !!oculta);
    try { localStorage.setItem("barra_oculta", oculta ? "1" : "0"); } catch (e) {}
  }
  try {
    if (localStorage.getItem("barra_oculta") === "1") document.body.classList.add("barra-oculta");
  } catch (e) {}
  var btnOcultar = document.querySelector(".ocultar-barra-btn");
  var btnMostrar = document.querySelector(".mostrar-barra-btn");
  if (btnOcultar) btnOcultar.addEventListener("click", function () { setBarraOculta(true); });
  if (btnMostrar) btnMostrar.addEventListener("click", function () { setBarraOculta(false); });
  document.addEventListener("keyup", function (e) {
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "[" && innerWidth > 1100) {
      setBarraOculta(!document.body.classList.contains("barra-oculta"));
    }
  });

  // 5. Rótulos didáticos (Dica, Atenção, Na prática, Pegadinha de prova, Como cai na prova)
  var mapa = {
    "Dica.": ["quadro dica", "Dica"],
    "Atenção.": ["quadro atencao", "Atenção"],
    "Na prática.": ["quadro pratica", "Na prática"],
    "Pegadinha de prova.": ["quadro armadilha", "Pegadinha de prova"]
  };
  document.querySelectorAll("blockquote.nota").forEach(function (b) {
    var p = b.firstElementChild, s = p && p.firstElementChild;
    if (!s || s.tagName !== "STRONG") return;
    var chave = s.textContent.trim();
    if (!mapa[chave]) return;
    s.remove();
    if (p.firstChild && p.firstChild.nodeType === 3) {
      p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, "");
    }
    b.className = mapa[chave][0];
    b.setAttribute("data-label", mapa[chave][1]);
  });
  document.querySelectorAll("main p").forEach(function (p) {
    var s = p.firstElementChild;
    if (s && s.tagName === "STRONG" && p.textContent.trim() === "Como cai na prova:") {
      p.classList.add("como-cai");
    }
  });

  // 6. Barra de progresso e seção atual no sumário
  var bar = document.querySelector(".progresso span");
  var links = {};
  document.querySelectorAll(".lateral a[href^='#']").forEach(function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });
  var alvos = Array.prototype.filter.call(document.querySelectorAll("main h2[id]"), function (h) {
    return links[h.id];
  });
  var atual = null;
  function marcar() {
    var y = window.scrollY;
    var h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    var ult = null;
    for (var i = 0; i < alvos.length; i++) {
      if (alvos[i].getBoundingClientRect().top < 120) ult = alvos[i];
      else break;
    }
    if (ult !== atual) {
      if (atual && links[atual.id]) links[atual.id].classList.remove("atual");
      atual = ult;
      if (atual && links[atual.id]) {
        var a = links[atual.id];
        a.classList.add("atual");
        if (lat) {
          var r = a.getBoundingClientRect(), lr = lat.getBoundingClientRect();
          if (r.top < lr.top + 60 || r.bottom > lr.bottom - 60) {
            lat.scrollTop += r.top - lr.top - lr.height / 2;
          }
        }
      }
    }
  }
  addEventListener("scroll", marcar, { passive: true });
  marcar();
})();
