// js/anime.js
const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');

if (animeId) {
    db.ref('anime/' + animeId).on('value', (snapshot) => {
        const anime = snapshot.val();
        if (anime) {
            renderDetails(animeId, anime);
        } else {
            document.getElementById('detailsContainer').innerHTML = '<h2>Anime not found!</h2>';
        }
    });
}

function renderDetails(id, anime) {
    const container = document.getElementById('detailsContainer');

    let episodesHtml = '';
    if (anime.episodes) {
        episodesHtml = Object.keys(anime.episodes).map(epKey => `
            <div style="background:#1a1a1a; padding:15px; margin:10px 0; border-radius:5px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold;">Episode ${anime.episodes[epKey].number}</span>
                <!-- Watch button ab watch.html par bhejega -->
                <a href="watch.html?id=${id}&ep=${epKey}" class="btn" style="padding:8px 15px; margin:0;">▶ Watch Now</a>
            </div>
        `).join('');
    }

    container.innerHTML = `
        <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:20px;">
            <img src="${anime.poster}" style="width:250px; border-radius:10px; box-shadow: 0 4px 8px rgba(0,0,0,0.5);">
            <div style="flex:1; min-width:300px;">
                <h1 style="font-size:28px; margin-bottom:10px;">${anime.title}</h1>
                <div style="margin:10px 0; color:#f1c40f; font-weight:bold;">⭐ ${anime.rating} | ${anime.category} | ${anime.language}</div>
                <p style="line-height:1.6; color:#ccc;">${anime.description || 'No description.'}</p>
            </div>
        </div>
        <div style="margin-top:30px;">
            <h2 class="section-title">Episodes</h2>
            ${episodesHtml || '<p style="color:#aaa;">No episodes added yet.</p>'}
        </div>
    `;
}