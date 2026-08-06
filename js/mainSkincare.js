document.addEventListener("DOMContentLoaded", function () {
  initSkincareCatalog();
});

function initSkincareCatalog() {
  var grid = document.getElementById("skincareGrid");
  var filtersWrap = document.getElementById("skincareFilters");
  var paginationNav = document.getElementById("skincarePagination");
  var emptyMsg = document.getElementById("skincareEmpty");
  if (!grid || !paginationNav) return;

  var ITEMS_PER_PAGE = 8;
  var currentFilter = "todos";
  var currentPage = 1;

  var allCards = Array.prototype.slice.call(grid.querySelectorAll(".product-card"));

  function getFiltered() {
    if (currentFilter === "todos") return allCards;
    return allCards.filter(function (card) {
      return card.dataset.category === currentFilter;
    });
  }

  function renderPage() {
    var filtered = getFiltered();
    var totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * ITEMS_PER_PAGE;
    var end = start + ITEMS_PER_PAGE;
    var visible = filtered.slice(start, end);
    var visibleSet = new Set(visible);

    allCards.forEach(function (card) {
      card.style.display = visibleSet.has(card) ? "" : "none";
    });

    if (emptyMsg) emptyMsg.hidden = filtered.length > 0;

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    paginationNav.innerHTML = "";
    if (totalPages <= 1) return;

    var prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "page-btn nav-arrow";
    prevBtn.textContent = "‹";
    prevBtn.disabled = currentPage === 1;
    prevBtn.setAttribute("aria-label", "Página anterior");
    prevBtn.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        renderPage();
        scrollToGrid();
      }
    });
    paginationNav.appendChild(prevBtn);

    for (var i = 1; i <= totalPages; i++) {
      (function (pageNum) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "page-btn" + (pageNum === currentPage ? " active" : "");
        btn.textContent = pageNum;
        btn.setAttribute("aria-label", "Ir a la página " + pageNum);
        if (pageNum === currentPage) btn.setAttribute("aria-current", "page");
        btn.addEventListener("click", function () {
          currentPage = pageNum;
          renderPage();
          scrollToGrid();
        });
        paginationNav.appendChild(btn);
      })(i);
    }

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "page-btn nav-arrow";
    nextBtn.textContent = "›";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.setAttribute("aria-label", "Página siguiente");
    nextBtn.addEventListener("click", function () {
      if (currentPage < totalPages) {
        currentPage++;
        renderPage();
        scrollToGrid();
      }
    });
    paginationNav.appendChild(nextBtn);
  }

  function scrollToGrid() {
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (filtersWrap) {
    var chips = filtersWrap.querySelectorAll(".filter-chip");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("active");
          c.setAttribute("aria-selected", "false");
        });
        chip.classList.add("active");
        chip.setAttribute("aria-selected", "true");

        currentFilter = chip.dataset.filter;
        currentPage = 1;
        renderPage();
      });
    });
  }

  renderPage();
}