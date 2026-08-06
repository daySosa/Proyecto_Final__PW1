(function () {
  function normalize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function highlight(title, query) {
    var safeTitle = escapeHtml(title);
    var safeQuery = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!safeQuery) return safeTitle;
    var re = new RegExp("(" + safeQuery + ")", "ig");
    return safeTitle.replace(re, "<mark>$1</mark>");
  }

  function buildIndex() {
    var catalogs = [
      window.PRODUCTOS_MAQUILLAJE,
      window.PRODUCTOS_ROPA,
      window.PRODUCTOS_ACCESORIOS,
      window.PRODUCTOS_SKINCARE
    ];

    var items = [];

    catalogs.forEach(function (data) {
      if (!data) return;
      Object.keys(data).forEach(function (id) {
        var p = data[id];
        items.push({
          id: id,
          title: p.nombre,
          tag: p.categoria,
          price: "L. " + p.precio,
          image: p.img,
          searchText: normalize(p.nombre + " " + p.categoria + " " + (p.linea || ""))
        });
      });
    });

    return items;
  }

  function initSearch() {
    var trigger = document.getElementById("searchTrigger");
    var overlay = document.getElementById("searchOverlay");
    var closeBtn = document.getElementById("searchClose");
    var input = document.getElementById("searchInput");
    var resultsBox = document.getElementById("searchResults");
    if (!trigger || !overlay || !input || !resultsBox) return;

    var index = buildIndex();

    function openSearch() {
      overlay.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      setTimeout(function () { input.focus(); }, 50);
    }

    function closeSearch() {
      overlay.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    trigger.addEventListener("click", function () {
      if (overlay.classList.contains("open")) {
        closeSearch();
      } else {
        openSearch();
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", closeSearch);

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closeSearch();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay.classList.contains("open")) {
        closeSearch();
      }
    });

    input.addEventListener("input", function () {
      renderResults(input.value.trim());
    });

    function renderResults(query) {
      if (query === "") {
        resultsBox.innerHTML = '<p class="search-hint">Escribe para buscar en maquillaje, ropa, accesorios y cuidado personal.</p>';
        return;
      }

      if (index.length === 0) {
        resultsBox.innerHTML = '<p class="search-empty">No se pudo cargar el catálogo. Verifica que los scripts de productos estén incluidos en esta página.</p>';
        return;
      }

      var q = normalize(query);
      var matches = index.filter(function (item) {
        return item.searchText.indexOf(q) !== -1;
      }).slice(0, 20);

      if (matches.length === 0) {
        resultsBox.innerHTML = '<p class="search-empty">No encontramos resultados para "' + escapeHtml(query) + '". Prueba con otra palabra.</p>';
        return;
      }

      resultsBox.innerHTML = "";
      matches.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "search-result-item";
        row.innerHTML =
          '<div class="search-result-thumb"><img src="' + item.image + '" alt=""></div>' +
          '<div class="search-result-info"><strong>' + highlight(item.title, query) + '</strong><span>' + item.tag + '</span></div>' +
          '<div class="search-result-price">' + item.price + '</div>';

        row.addEventListener("click", function () {
          window.location.href = "producto.html?id=" + encodeURIComponent(item.id);
        });
        resultsBox.appendChild(row);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initSearch);
})();