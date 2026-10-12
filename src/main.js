import './style.css';

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY;
const app = document.querySelector('#app');

if (app) {
  app.innerHTML = '<p>Loading...</p>';
}

if (NASA_API_KEY) {
  async function fetchApod(attempt = 0) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`, {
        signal: controller.signal,
      });

      if ([503, 504].includes(response.status) && attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchApod(attempt + 1);
      }

      if (!response.ok) {
        throw new Error(`NASA request failed (${response.status})`);
      }
      return await response.json();
    } catch (error) {
      if (attempt === 0 && (error.name === 'AbortError' || error instanceof TypeError)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchApod(attempt + 1);
      }
      if (error.name === 'AbortError') {
        throw new Error('NASA request timed out. Please refresh to try again.');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  fetchApod()
    .then((data) => {
      if (!app) return;

      const media = data.media_type === 'image'
        ? `<img class="nasa-media" src="${data.url}" alt="${data.title}" />`
        : `<video class="nasa-media" src="${data.url}" controls></video>`;

      app.innerHTML = `
        <h3>${data.title}</h3>
        ${media}
        <p class="explanation">${data.explanation}</p>
      `;
    })
    .catch((err) => {
      if (app) {
        const message = err.name === 'AbortError'
          ? 'NASA request timed out. Please refresh to try again.'
          : `Error loading NASA photo: ${err.message}`;
        app.innerHTML = `<p>${message}</p>`;
      }
    })
    .finally(() => {
      clearTimeout(timeout);
    });
} else if (app) {
  app.innerHTML = '<p>Add VITE_NASA_API_KEY to your .env file to load the NASA photo.</p>';
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
    setDictionaryResult('Not found', true);
  }
}

document.getElementById('lookup')?.addEventListener('click', lookupWord);
document.getElementById('word')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    lookupWord();
  }
});
