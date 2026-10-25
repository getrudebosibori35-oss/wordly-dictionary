const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";


const form = document.querySelector("#search-form");
const input = document.querySelector("#word-input");
const results = document.querySelector("#results-section");
const details = document.querySelector("#word-details");
const status = document.querySelector("#status-message");
const favoriteBtn = document.querySelector("#favorite-button");
const favoritesList = document.querySelector("#favorites-list");
const favoritesEmpty = document.querySelector("#favorites-empty");
const themeBtn = document.querySelector("#theme-toggle");


console.log("Favorite list:",favoritesList);
console.log("Favorites empty:",favoritesEmpty);

let currentWord = null;
let favorites = JSON.parse(localStorage.getItem("wordly-favorites") || "[]");


form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const word = input.value.trim();

    if (!word) {
        status.textContent = "Please enter a word.";
        return;
    }

    status.textContent = "Searching...";
    results.hidden = true;

    try {
        const response = await fetch(API_URL + encodeURIComponent(word));

        if (!response.ok) {
            throw new Error(
                response.status === 404
                    ? "Word not found. Try another word."
                    : "Something went wrong. Please try again."
            );
        }

        const data = await response.json();
        currentWord = data[0];

        displayWord(currentWord);
        results.hidden = false;
        status.textContent = "Word found!";
        updateFavoriteButton();

    } catch (error) {
    console.error("API error:", error);

    status.textContent = error.message.includes("Failed to fetch")
        ? "Unable to connect. Check your internet connection."
        : error.message;

    results.hidden = true;
}
    
});


function displayWord(entry) {
    details.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = entry.word;
    details.append(heading);

    const phonetic = document.createElement("p");
    phonetic.textContent =
        entry.phonetics?.find(p => p.text)?.text ||
        "Pronunciation unavailable";
    details.append(phonetic);

    
    const audioUrl = entry.phonetics?.find(p => p.audio)?.audio;

    if (audioUrl) {
        const audioBtn = document.createElement("button");
        audioBtn.textContent = "🔊 Play pronunciation";

        audioBtn.addEventListener("click", () => {
            new Audio(audioUrl).play().catch(() => {
                status.textContent = "Audio could not be played.";
            });
        });

        details.append(audioBtn);
    }

    
    entry.meanings?.forEach(meaning => {
        const section = document.createElement("section");

        const partOfSpeech = document.createElement("h3");
        partOfSpeech.textContent = meaning.partOfSpeech;
        section.append(partOfSpeech);

        meaning.definitions?.forEach(def => {
            const definition = document.createElement("p");
            definition.textContent = def.definition;
            section.append(definition);

            if (def.example) {
                const example = document.createElement("p");
                example.textContent = "Example: " + def.example;
                section.append(example);
            }

            if (def.synonyms?.length) {
                const synonyms = document.createElement("p");
                synonyms.textContent =
                    "Synonyms: " + def.synonyms.join(", ");
                section.append(synonyms);
            }
        });

        details.append(section);
    });

    
    entry.sourceUrls?.forEach(url => {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View source";
        details.append(link);
    });
}


favoriteBtn.addEventListener("click", function () {
    if (!currentWord) return;

    const word = currentWord.word;
    const exists = favorites.some(
        item => item.toLowerCase() === word.toLowerCase()
    );

    favorites = exists
        ? favorites.filter(item => item.toLowerCase() !== word.toLowerCase())
        : [...favorites, word];

    localStorage.setItem("wordly-favorites", JSON.stringify(favorites));

    showFavorites();
    updateFavoriteButton();
})
function updateFavoriteButton() {
    if (!currentWord) return;

    const saved = favorites.some(
        word => word.toLowerCase() === currentWord.word.toLowerCase()
    );

    favoriteBtn.textContent = saved ? "♥ Saved" : "♡ Save word";
    favoriteBtn.setAttribute("aria-pressed", String(saved));
}


function showFavorites() {
    favoritesList.replaceChildren();
    favoritesEmpty.hidden = favorites.length > 0;

    favorites.forEach(word => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.textContent = word;

        button.addEventListener("click", () => {
            input.value = word;
            form.requestSubmit();
        });

        item.append(button);
        favoritesList.append(item);
    });
}


themeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");

    const dark = document.body.classList.contains("dark-theme");
    themeBtn.textContent = dark ? "Light mode" : "Dark mode";

    localStorage.setItem("wordly-theme", dark ? "dark" : "light");
});


if (localStorage.getItem("wordly-theme") === "dark") {
    document.body.classList.add("dark-theme");
    themeBtn.textContent = "Light mode";
}

showFavorites();
