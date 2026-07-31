const blogFilters = document.getElementById('blogFilters');
if (blogFilters) {
  const filters = blogFilters.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('#blogGrid .blog-card');
  const featured = document.querySelector('.featured-post');
  const featuredSection = document.querySelector('.featured-post-section');
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

      const featuredMatch = featured && (filter === 'todos' || featured.dataset.category === filter);
      if (featuredSection) {
        featuredSection.style.display = featuredMatch ? '' : 'none';
      }

      if (emptyMsg) emptyMsg.hidden = visibleCount > 0;
    });
  });
}