// Footer year
document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

// Fetch JSON helper
async function getBlogs() {
  const res = await fetch('blogs.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load blogs.json');
  return res.json();
}

/* ---------- Listing Page ---------- */
const gridEl = document.getElementById('blogGrid');
if (gridEl) {
  const searchEl = document.getElementById('searchInput');
  const catEl = document.getElementById('categoryFilter');

  let BLOGS = [];

  const escapeHtml = (str) => String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");

  const renderCards = (list) => {
    gridEl.innerHTML = list.map(b => `
      <article class="card">
        <img class="thumb" src="${b.image}" alt="${escapeHtml(b.title)}"/>
        <div class="card-body">
          <span class="category-badge">${escapeHtml(b.category)}</span>
          <h3>${escapeHtml(b.title)}</h3>
          <p>${escapeHtml(b.description)}</p>
          <div class="tags">
            ${b.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
          </div>
          <a class="read-more" href="blog.html?id=${encodeURIComponent(b.id)}" aria-label="Read ${escapeHtml(b.title)}">Read More →</a>
        </div>
      </article>
    `).join('');
  };

  const applyFilters = () => {
    const q = (searchEl.value || '').toLowerCase().trim();
    const cat = (catEl.value || '').trim();

    const filtered = BLOGS.filter(b => {
      const matchesText =
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);
      const matchesCat = !cat || b.category === cat;
      return matchesText && matchesCat;
    });
    renderCards(filtered);
  };

  getBlogs().then(data => {
    BLOGS = data;
    renderCards(BLOGS);
  }).catch(err => {
    gridEl.innerHTML = `<p style="color:#ffb4b4">Error: ${err.message}</p>`;
  });

  searchEl && searchEl.addEventListener('input', applyFilters);
  catEl && catEl.addEventListener('change', applyFilters);
}

/* ---------- Detail Page ---------- */
const detailEl = document.getElementById('blogDetail');
if (detailEl) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  getBlogs().then(list => {
    const blog = list.find(b => String(b.id) === String(id));
    if (!blog) {
      detailEl.innerHTML = `<p style="color:#ffb4b4">Blog not found.</p>`;
      return;
    }

    detailEl.innerHTML = `
      <img class="detail-hero" src="${blog.image}" alt="${escapeHtml(blog.title)}"/>
      <div class="detail-meta">
        <span class="category-badge">${escapeHtml(blog.category)}</span>
        ${blog.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>
      <h1 class="detail-title">${escapeHtml(blog.title)}</h1>
      <div class="detail-content">
        ${blog.content}
      </div>
    `;
  }).catch(err => {
    detailEl.innerHTML = `<p style="color:#ffb4b4">Error: ${err.message}</p>`;
  });
}

// small helper for detail page too
function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}
