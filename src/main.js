import './style.css';

const API_KEY = import.meta.env.VITE_NASA_API_KEY;

document.querySelector("#app").innerHTML = "<p>loading...</p>";

fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
  .then(response => response.json())
  .then(data => {
    let media;

    if (data.media_type === "image") {
      media = `<img class="nasa-media" src="${data.url}" alt="${data.title}" />`;
    } else {
      media = `<video class="nasa-media" src="${data.url}" controls></video>`; 
    }

    document.querySelector("#app").innerHTML = `
      <h1>${data.title}</h1>
      ${media}
      <p>${data.explanation}</p>
    `;
  })
  .catch(err => {
    document.querySelector("#app").innerHTML = `<p>Error: ${err.message}</p>`;
  });

async function lookupWord() {
  const word = document.getElementById('word').value.trim();
  if (!word) return;

  try {
    const res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${word}`);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();

    // The response has language keys. "en" is English.
    const english = data.en;
    if (!english || !english.length) throw new Error('not found');

    // First part of speech, first definition
    const entry = english[0];
    const definition = entry.definitions[0].definition;

    // Strip out the HTML tags Wikipedia adds
    const clean = definition.replace(/<[^>]+>/g, '');

    document.getElementById('result').textContent =
      `${word} (${entry.partOfSpeech}): ${clean}`;
  } catch {
    document.getElementById('result').textContent = 'Word not found';
  }
}

document.getElementById('lookup').onclick = lookupWord;
document.getElementById('word').onkeydown = (e) => e.key === 'Enter' && lookupWord();

