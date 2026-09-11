const API_KEY = import.meta.env.VITE_NASA_API_KEY;


document.querySelector("#app").innerHTML = "<p>loading...</p>";

fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
.then(response => response.json()).then(data => {
    console.log(data);
})