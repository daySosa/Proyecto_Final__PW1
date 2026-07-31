const blogFilters = document.getElementById('blogFilters');
if (blogFilters) {
  const filters = blogFilters.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('#blogGrid .blog-card');
  const featured = document.querySelector('.featured-post');
  const emptyMsg = document.getElementById('blogEmpty');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      cards.forEach(card => {
        const match = filter === 'todos' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      if (featured) {
        featured.style.display = (filter === 'todos' || featured.dataset.category === filter) ? '' : 'none';
      }

      if (emptyMsg) emptyMsg.hidden = visibleCount > 0;
    });
  });
}