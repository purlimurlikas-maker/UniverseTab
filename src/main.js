import './style.css';

const API_KEY = import.meta.env.VITE_NASA_API_KEY;
const app = document.querySelector('#app');

if (app) {
  app.innerHTML = '<p>loading...</p>';
}

if (API_KEY) {
  fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
    .then((response) => response.json())
    .then((data) => {
      if (!app) return;

     let media;

if (data.media_type === 'image') {
  media = `<img class="nasa-media" src="${data.url}" alt="${data.title}" />`;
} else {
  media = `<video class="nasa-media" src="${data.url}" controls></video>`;
}

      app.innerHTML = `
        <h3>${data.title}</h3>
        ${media}
        <p class="explanation">${data.explanation}</p>
      `;
    })
    .catch((err) => {
      if (app) {
        app.innerHTML = `<p>Error: ${err.message}</p>`;
      }
    });
}

function stripHtml(text = '') {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function setDictionaryResult(message = '', isVisible = false) {
  const result = document.getElementById('result');

  if (!result) return;

  result.textContent = message;
  result.style.display = isVisible ? 'block' : 'none';
}

async function lookupWord() {
  const wordInput = document.getElementById('word');
  const word = wordInput?.value.trim();

  if (!word) {
    setDictionaryResult('', false);
    return;
  }

  try {
    const res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`);
    if (!res.ok) throw new Error('word not found');

    const data = await res.json();
    const entries = Array.isArray(data?.en)
      ? data.en
      : Object.values(data || {}).flat().filter((item) => item && Array.isArray(item.definitions));

    const entry = entries.find((item) => Array.isArray(item.definitions) && item.definitions.length > 0) || entries[0];
    const definition = entry?.definitions
      ?.map((item) => item?.definition)
      .find((item) => typeof item === 'string' && item.trim());

    if (!definition) throw new Error('word not found');

    const clean = stripHtml(definition);
    setDictionaryResult(`${word} (${entry?.partOfSpeech || 'word'}): ${clean}`, true);
  } catch (error) {
    setDictionaryResult('', false);
  }
}

document.getElementById('lookup')?.addEventListener('click', lookupWord);
document.getElementById('word')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    lookupWord();
  }
});

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

async function loadVideos() {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=music&key=${API_KEY}&type=video`
  );

  const data = await res.json();
  console.log(data.items);
}

const videos = data.items;

videos.forEach(video => {
  const card = document.createElement("div");
  card.className = "video-card";

  card.innerHTML = `
    <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}" />
    <h3>${video.snippet.title}</h3>
    <p>${video.snippet.channelTitle}</p>
  `;

  card.addEventListener("click", () => {
    playVideo(video.id.videoId);
  });

  document.querySelector("#videos").appendChild(card);
});

function playVideo(videoId) {
  document.querySelector("#player").innerHTML = `
    <iframe
      width="100%"
      height="400"
      src="https://www.youtube.com/embed/${videoId}"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  `;
}