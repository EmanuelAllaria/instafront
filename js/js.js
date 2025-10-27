// Estado persistente
const STORE_KEY = "instafront_posts";
const THEME_KEY = "instafront_theme";

function savePosts(posts) {
  localStorage.setItem(STORE_KEY, JSON.stringify(posts));
}
function loadPosts() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  } catch {
    return [];
  }
}

// Tema (modo oscuro)
function applyTheme(theme) {
  if (theme === "dark") document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(saved);
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.textContent = saved === "dark" ? "☀️" : "🌙";
    btn.addEventListener("click", () => {
      const current = document.body.classList.contains("dark")
        ? "dark"
        : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      btn.textContent = next === "dark" ? "☀️" : "🌙";
      localStorage.setItem(THEME_KEY, next);
    });
  }
}

// Modelo de publicación
function defaultPosts() {
  return [
    {
      id: "post-1",
      authorName: "Abril González",
      authorAvatar: "img/fotoPerfil.jpg",
      image: "img/fotoPerfil.jpg",
      caption: "Primera publicación en InstaFront ✨",
      likes: 0,
      liked: false,
      comments: [],
    },
  ];
}

// Render de tarjeta
function renderPostCard(post) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.postId = post.id;
  article.innerHTML = `
    <div class="logo_publi">
      <div class="cuenta">
        <img class="foto_uni" src="${post.authorAvatar}" alt="Perfil">
        <p>${post.authorName}</p>
      </div>
      <button class="icon more" aria-label="Más">•••</button>
    </div>
    <div class="publi">
      <img class="post-image" src="${post.image}" alt="Publicación">
    </div>
    <div class="iconos">
      <button class="icon like" aria-label="Me gusta"><img class="corazon" src="${
        post.liked ? "img/cora_rojo.png" : "img/heart.png"
      }" alt="Me gusta"></button>
      <button class="icon toggle-comments" aria-label="Comentarios"><img class="iconos_left" src="img/comment.png" alt="Comentarios"></button>
      <button class="icon share" aria-label="Compartir"><img class="iconos_left" src="img/paper.png" alt="Compartir"></button>
      <button class="icon show-emoji" aria-label="Emojis"><img class="iconos_left emoji" src="img/smile.png" alt="Emoji"></button>
    </div>
    <div class="mgs">
      <p class="likes-text">A ${post.likes} personas les gusta esto</p>
    </div>
    <div class="comentarios">
      <p class="tds_coments">Ver los ${post.comments.length} comentarios</p>
      <div class="comentarios-list">
        ${post.comments.map((c) => `<p>${c}</p>`).join("")}
      </div>
      <form class="comentario-form">
        <div class="emoji-picker" hidden>
          <button type="button" class="emoji-btn">🙂</button>
          <button type="button" class="emoji-btn">😃</button>
          <button type="button" class="emoji-btn">❤️</button>
          <button type="button" class="emoji-btn">🔥</button>
          <button type="button" class="emoji-btn">🎉</button>
        </div>
        <input type="text" name="comentario" placeholder="Escribe un comentario..." autocomplete="off">
        <button type="submit" class="primary">Publicar</button>
      </form>
    </div>
  `;
  attachPostListeners(article);
  return article;
}

// Lógica de interacción por tarjeta
function attachPostListeners(article) {
  const postId = article.dataset.postId;
  const likeBtn = article.querySelector(".like");
  const heartImg = article.querySelector(".corazon");
  const likesText = article.querySelector(".likes-text");
  const postImage = article.querySelector(".post-image");
  const toggleCommentsBtn = article.querySelector(".toggle-comments");
  const commentsSection = article.querySelector(".comentarios");
  const commentsCount = article.querySelector(".tds_coments");
  const commentsList = article.querySelector(".comentarios-list");
  const form = article.querySelector(".comentario-form");
  const emojiPicker = article.querySelector(".emoji-picker");
  const showEmojiBtn = article.querySelector(".show-emoji");
  const shareBtn = article.querySelector(".share");

  const posts = loadPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  const post = posts[idx];

  function updateLikesUI() {
    likesText.textContent = `A ${post.likes} personas les gusta esto`;
    heartImg.src = post.liked ? "img/cora_rojo.png" : "img/heart.png";
    heartImg.classList.toggle("liked", post.liked);
  }
  function updateCommentsUI() {
    commentsCount.textContent = `Ver los ${post.comments.length} comentarios`;
    commentsList.innerHTML = post.comments.map((c) => `<p>${c}</p>`).join("");
  }

  likeBtn.addEventListener("click", () => {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : Math.max(post.likes - 1, 0) - post.likes + 1; // asegurar decremento
    post.likes = post.liked ? post.likes : Math.max(post.likes - 1, 0);
    updateLikesUI();
    savePosts(posts);
  });

  postImage.addEventListener("dblclick", () => {
    post.liked = true;
    post.likes += 1;
    updateLikesUI();
    savePosts(posts);
  });

  toggleCommentsBtn.addEventListener("click", () => {
    commentsSection.hidden = !commentsSection.hidden;
  });

  showEmojiBtn.addEventListener("click", () => {
    emojiPicker.hidden = !emojiPicker.hidden;
  });
  emojiPicker.querySelectorAll(".emoji-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = form.querySelector('input[name="comentario"]');
      input.value += btn.textContent;
      input.focus();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector('input[name="comentario"]');
    const text = input.value.trim();
    if (!text) return;
    post.comments.push(text);
    input.value = "";
    updateCommentsUI();
    savePosts(posts);
  });

  shareBtn.addEventListener("click", async () => {
    const text = `Post de ${post.authorName}: ${post.caption || ""}`;
    try {
      await navigator.clipboard.writeText(text);
      shareBtn.textContent = "Copiado!";
      setTimeout(() => (shareBtn.textContent = ""), 1200);
    } catch {}
  });

  updateLikesUI();
  updateCommentsUI();
}

// Render del feed
function renderFeed(posts) {
  const feed = document.getElementById("feed");
  if (!feed) return;
  feed.innerHTML = "";
  posts.forEach((post) => feed.appendChild(renderPostCard(post)));
}

// Nueva publicación (modal)
function initNewPostModal() {
  const modal = document.getElementById("newPostModal");
  const openBtn = document.getElementById("newPostBtn");
  const closeBtn = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelModal");
  const form = document.getElementById("newPostForm");
  const imageInput = document.getElementById("postImage");
  const captionInput = document.getElementById("postCaption");

  function open() {
    modal.hidden = false;
  }
  function close() {
    modal.hidden = true;
    form.reset();
  }

  openBtn && openBtn.addEventListener("click", open);
  closeBtn && closeBtn.addEventListener("click", close);
  cancelBtn && cancelBtn.addEventListener("click", close);

  form &&
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const file = imageInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const posts = loadPosts();
        const newPost = {
          id: `post-${Date.now()}`,
          authorName: "Tú",
          authorAvatar: "img/fotoPerfil.jpg",
          image: reader.result,
          caption: captionInput.value.trim(),
          likes: 0,
          liked: false,
          comments: [],
        };
        posts.unshift(newPost);
        savePosts(posts);
        renderFeed(posts);
        close();
      };
      reader.readAsDataURL(file);
    });
}

// Búsqueda simple por caption/autor
function initSearch() {
  const input = document.getElementById("search");
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    const posts = loadPosts();
    const filtered = posts.filter(
      (p) =>
        (p.caption || "").toLowerCase().includes(q) ||
        (p.authorName || "").toLowerCase().includes(q)
    );
    renderFeed(filtered);
  });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNewPostModal();
  initSearch();
  const stored = loadPosts();
  const posts = stored.length ? stored : defaultPosts();
  if (!stored.length) savePosts(posts);
  renderFeed(posts);
});
