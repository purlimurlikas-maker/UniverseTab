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
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();

const entry = data[0];
    const meaning = entry.meanings[0];
    const definition = meaning.definitions[0].definition;
  
    document.getElementById('result').textContent =
      `${entry.word}: ${definition}`;
  }  catch (err) {
  document.getElementById('result').textContent = 'Error: ' + err.message;
}

document.getElementById('lookup').onclick = lookupWord;
document.getElementById('word').onkeydown = (e) => e.key === 'Enter' && lookupWord();
}