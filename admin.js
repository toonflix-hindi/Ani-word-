// js/admin.js

// Auth Check
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadAdminList();
    } else {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }
});

function loginAdmin() {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPass').value;
    auth.signInWithEmailAndPassword(email, pass)
        .catch(err => alert("Login Failed: " + err.message));
}

function logoutAdmin() {
    auth.signOut();
}

// AniList API Fetch
async function fetchAniList() {
    const search = document.getElementById('anilistSearch').value;
    if (!search) return alert("Please enter an anime name");

    const query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        title { romaji english }
        coverImage { large }
        description
        averageScore
        genres
      }
    }`;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: query, variables: { search: search } })
        });
        const data = await response.json();
        const anime = data.data.Media;

        if (anime) {
            document.getElementById('title').value = anime.title.english || anime.title.romaji;
            document.getElementById('poster').value = anime.coverImage.large;
            document.getElementById('rating').value = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
            document.getElementById('description').value = anime.description ? anime.description.replace(/<[^>]*>?/gm, '') : '';
            document.getElementById('category').value = anime.genres ? anime.genres.join(', ') : 'Action';
            document.getElementById('language').value = "Hindi";
            alert("AniList se details mil gayi! Ab aap edit karke Save kar sakte hain.");
        } else {
            alert("Anime AniList par nahi mila.");
        }
    } catch (error) {
        alert("Error fetching from AniList: " + error.message);
    }
}

// Save Anime
function saveAnime() {
    const editId = document.getElementById('editId').value;
    const animeData = {
        title: document.getElementById('title').value,
        poster: document.getElementById('poster').value,
        rating: document.getElementById('rating').value,
        language: document.getElementById('language').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        isNew: document.getElementById('isNew').checked,
    };

    if (!animeData.title || !animeData.poster) return alert("Title aur Poster URL zaroori hai!");

    if (editId) {
        db.ref('anime/' + editId).update(animeData).then(() => {
            alert("Anime Update ho gaya!");
            clearForm();
        });
    } else {
        db.ref('anime').push(animeData).then(() => {
            alert("Naya Anime Add ho gaya!");
            clearForm();
        });
    }
}

// Load Admin List
function loadAdminList() {
    db.ref('anime').on('value', snapshot => {
        const list = document.getElementById('adminList');
        list.innerHTML = '';
        const data = snapshot.val();
        if (!data) {
            list.innerHTML = '<p style="color:#aaa;">Abhi tak koi anime add nahi kiya gaya.</p>';
            return;
        }

        Object.keys(data).forEach(key => {
            const anime = data[key];
            list.innerHTML += `
                <div class="admin-item">
                    <img src="${anime.poster}" alt="poster">
                    <div style="flex:1; margin-left:15px;">
                        <h4>${anime.title}</h4>
                        <p style="font-size:12px; color:#aaa; margin-top:5px;">${anime.category} | ⭐ ${anime.rating}</p>
                    </div>
                    <div class="admin-actions">
                        <button class="btn-edit" onclick="editAnime('${key}')">Edit</button>
                        <button class="btn-episode" onclick="addEpisode('${key}')">+ Ep</button>
                        <button class="btn-delete" onclick="deleteAnime('${key}')">Delete</button>
                    </div>
                </div>
            `;
        });
    });
}

// Edit Anime
function editAnime(id) {
    db.ref('anime/' + id).once('value').then(snapshot => {
        const anime = snapshot.val();
        document.getElementById('editId').value = id;
        document.getElementById('title').value = anime.title || '';
        document.getElementById('poster').value = anime.poster || '';
        document.getElementById('rating').value = anime.rating || '';
        document.getElementById('language').value = anime.language || '';
        document.getElementById('category').value = anime.category || '';
        document.getElementById('description').value = anime.description || '';
        document.getElementById('isNew').checked = anime.isNew || false;
        window.scrollTo(0, 0);
    });
}

// Delete Anime
function deleteAnime(id) {
    if (confirm("Kya aap sach mein is anime ko delete karna chahte hain?")) {
        db.ref('anime/' + id).remove();
    }
}

// Add Episode (⭐ Yahan aap File-to-Link Bot ka link daalenge)
function addEpisode(id) {
    const epNum = prompt("Episode Number daalein (e.g., 1, 2, 3):");
    if (!epNum) return;
    const epLink = prompt("Episode ka Video Link daalein (e.g., https://canon-filetolink-go.vercel.app/watch/xxxxx):");
    if (!epLink) return;

    db.ref('anime/' + id + '/episodes').push({
        number: epNum,
        link: epLink
    }).then(() => alert("Episode Add ho gaya!"));
}

// Clear Form
function clearForm() {
    document.getElementById('editId').value = '';
    document.getElementById('title').value = '';
    document.getElementById('poster').value = '';
    document.getElementById('rating').value = '';
    document.getElementById('language').value = '';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
    document.getElementById('isNew').checked = false;
}