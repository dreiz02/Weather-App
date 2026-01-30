const form = document.getElementById("weatherForm");
const input = document.querySelector(".city-input");
const card = document.getElementById("displayCard");


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cityQuery = input.value.trim();
  if (!cityQuery) return;

  card.innerHTML = `<p class="loading-display">Loading...</p>`;

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=1&language=en&format=json`;

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error("Geocoding request failed");
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      card.innerHTML = `<p class="loading-display">No results found for "${cityQuery}".</p>`;
      return;
    }

    const place = geoData.results[0];
    const { name, admin1, country, latitude, longitude, timezone } = place;

    const weatherUrl =`https://api.open-meteo.com/v1/forecast` + `?latitude=${latitude}` + `&longitude=${longitude}` 
                    + `&timezone=${encodeURIComponent(timezone)}` + `&current=temperature_2m,wind_speed_10m`;

    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error("Weather request failed");
    const weatherData = await weatherRes.json();

    const temp = weatherData.current.temperature_2m;
    const wind = weatherData.current.wind_speed_10m;
    const time = weatherData.current.time;

    const readableTime = new Date(time).toLocaleString("en-CA", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

    card.innerHTML = `
      <div class="weather-result">
        <h2>${name}${admin1 ? ` ${admin1}` : ""}${country ? `, ${country}` : ""}</h2>
        <div class="weather-info">
            <div class="time-zone">
                <i class="fa-solid fa-clock"></i>
                <p>Time Zone: <br> ${readableTime}</p> 
            </div>
            <div class="temp-section">
                <i class="fa-solid fa-temperature-half"></i>
                <p>TEMP: ${temp} °C</p>
            </div>
            <div class="wind-section">
                <i class="fa-solid fa-wind"></i>
                <p>WIND: ${wind} km/h</p>
            </div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    card.innerHTML = `<p>Something went wrong. Try again.</p>`;
  }
});

document.querySelectorAll(".city-select").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.textContent.trim();
      form.requestSubmit();
  
      setTimeout(() => {
        card.scrollIntoView({ behavior: "smooth" });
      }, 400);
    });
  });