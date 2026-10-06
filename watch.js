// js/watch.js
const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');
const epKey = urlParams.get('ep');

if (animeId && epKey) {
    db.ref('anime/' + animeId).on('value', (snapshot) => {
        const anime = snapshot.val();
        if (anime && anime.episodes && anime.episodes[epKey]) {
            const episode = anime.episodes[epKey];
            renderWatchPage(animeId, anime, episode);
        } else {
            document.getElementById('watchContainer').innerHTML =
                '<h2 style="text-align:center; margin-top:50px;">Episode not found!</h2>';
        }
    });
} else {
    document.getElementById('watchContainer').innerHTML =
        '<h2 style="text-align:center; margin-top:50px;">Invalid Link!</h2>';
}

function renderWatchPage(id, anime, episode) {
    const container = document.getElementById('watchContainer');

    // File-to-Link Bot wale link ko <iframe> me embed karega
    // Agar aapke paas direct MP4 link hai toh <video> tag bhi use kar sakte hain
    container.innerHTML = `
        <div style="margin-top: 20px;">
            <h2 style="margin-bottom: 15px; font-size: 22px;">${anime.title} - Episode ${episode.number}</h2>

            <!-- Responsive Video Player -->
            <div class="video-wrapper">
                <iframe src="${episode.link}"
                        allowfullscreen
                        allow="autoplay; encrypted-media"
                        scrolling="no">
                </iframe>
            </div>

            <!-- Navigation Buttons -->
            <div style="margin-top: 25px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn" onclick="window.location.href='anime.html?id=${id}'">⬅ Back to Anime Details</button>
                <button class="btn" style="background:#333;" onclick="window.location.href='index.html'">🏠 Go to Home</button>
            </div>
        </div>
    `;
}