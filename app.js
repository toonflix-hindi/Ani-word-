// js/app.js
let allAnime = [];
let currentSlide = 0;

// Fetch Anime from Firebase
db.ref('anime').on('value', (snapshot) => {
    allAnime = [];
    const data = snapshot.val();
    if (data) {
        Object.keys(data).forEach(key => {
            allAnime.push({ id: key, ...data[key] });
        });
    }
    renderAnime();
    renderHeroSlider();
});

function renderAnime(filterText = '') {
    const container = document.getElementById('animeSections');
    container.innerHTML = '';

    const categories = {};
    allAnime.forEach(anime => {
        if (filterText && !anime.title.toLowerCase().includes(filterText.toLowerCase())) return;
        const cat = anime.category || 'Uncategorized';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(anime);
    });

    for (const [cat, animes] of Object.entries(categories)) {
        let html = `<div class="section-title">${cat}</div>`;
        html += `<div class="anime-grid">`;
        animes.forEach(anime => {
            html += `
                <div class="anime-card" onclick="openModal('${anime.id}')">
                    <img src="${anime.poster}" alt="${anime.title}">
                    <span class="rating">⭐ ${anime.rating || 'N/A'}</span>
                    ${anime.isNew ? `<span class="new-badge">NEW</span>` : ''}
                    <span class="lang-badge">${anime.language || 'Hindi'}</span>
                    <div class="card-info"><h3>${anime.title}</h3></div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML += html;
    }
}

function renderHeroSlider() {
    const hero = document.getElementById('heroSlider');
    if (allAnime.length === 0) return;

    const sliderAnimes = allAnime.slice(0, 5);
    hero.innerHTML = sliderAnimes.map((anime, index) => `
        <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${anime.poster}');">
            <div class="hero-overlay">
                <h2>${anime.title}</h2>
                <p>⭐ ${anime.rating} | ${anime.category}</p>
            </div>
        </div>
    `).join('');

    setInterval(() => {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

function searchAnime() {
    const text = document.getElementById('searchInput').value;
    renderAnime(text);
}

function openModal(id) {
    const anime = allAnime.find(a => a.id === id);
    if (!anime) return;
    document.getElementById('modalPoster').src = anime.poster;
    document.getElementById('modalTitle').innerText = anime.title;
    document.getElementById('modalDesc').innerText = anime.description || 'No description available.';
    document.getElementById('watchBtn').onclick = () => {
        window.location.href = `anime.html?id=${id}`;
    };
    document.getElementById('animeModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('animeModal').style.display = 'none';
}