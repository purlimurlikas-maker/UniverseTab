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
        <h2>${data.title}</h2>
        ${media}
        <p>${data.explanation}</p>
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

async function lookupWord() {
  const wordInput = document.getElementById('word');
  const result = document.getElementById('result');
  const word = wordInput?.value.trim();

  if (!word) {
    if (result) result.textContent = 'Please enter a word';
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
    if (result) {
      result.textContent = `${word} (${entry?.partOfSpeech || 'word'}): ${clean}`;
    }
  } catch (error) {
    if (result) {
      result.textContent = 'Word not found';
    }
  }
}

document.getElementById('lookup')?.addEventListener('click', lookupWord);
document.getElementById('word')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    lookupWord();
  }
});
