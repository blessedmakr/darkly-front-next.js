import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env.local manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env.local");
const envLines = readFileSync(envPath, "utf-8").split("\n");
const env = Object.fromEntries(
    envLines
        .filter((l) => l.includes("="))
        .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()])
);

const TOKEN = env["TMDB_READ_ACCESS_TOKEN"];
if (!TOKEN) {
    console.error("TMDB_READ_ACCESS_TOKEN not found in .env.local");
    process.exit(1);
}

const FILMS = [
    { title: "The Passenger",         year: 2023 },
    { title: "Ginger Snaps",          year: 2000 },
    { title: "Let the Right One In",  year: 2008 },
    { title: "Let Me In",             year: 2010 },
    { title: "Alien",                 year: 1979 },
    { title: "Aliens",                year: 1986 },
    { title: "Tee Yod",               year: 2023 },
    { title: "Sick",                  year: 2022 },
    { title: "Haunt",                 year: 2019 },
    { title: "Eden Lake",             year: 2008 },
    { title: "Alone",                 year: 2007 },
    { title: "Smile",                 year: 2022 },
    { title: "Cobweb",                year: 2023 },
    { title: "Longlegs",              year: 2024 },
    { title: "Companion",             year: 2025 },
    { title: "The Monkey",            year: 2025 },
    { title: "The Silence of the Lambs", year: 1991 },
    { title: "The Shining",           year: 1980 },
    { title: "The Fly",               year: 1986 },
    { title: "Night of the Living Dead", year: 1968 },
    { title: "Scream",                year: 1996 },
    { title: "The Blair Witch Project", year: 1999 },
    { title: "28 Days Later",         year: 2002 },
    { title: "The Descent",           year: 2005 },
    { title: "[REC]",                 year: 2007 },
    { title: "The Witch",             year: 2015 },
    { title: "It Follows",            year: 2014 },
    { title: "Get Out",               year: 2017 },
    { title: "Hereditary",            year: 2018 },
    { title: "Paranormal Activity",   year: 2007 },
    { title: "The Thing",             year: 1982 },
    { title: "Event Horizon",         year: 1997 },
    { title: "The Wailing",           year: 2016 },
    { title: "Doctor Sleep",          year: 2019 },
];

async function search(title, year) {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&year=${year}&language=en-US&page=1`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!res.ok) throw new Error(`TMDB error ${res.status} for "${title}"`);
    const data = await res.json();
    return data.results?.[0] ?? null;
}

console.log("\nLooking up films on TMDB...\n");
console.log(
    "Title".padEnd(36) +
    "Year".padEnd(6) +
    "TMDB ID".padEnd(12) +
    "Poster Path".padEnd(36) +
    "Backdrop Path"
);
console.log("-".repeat(110));

const results = [];

for (const film of FILMS) {
    try {
        const match = await search(film.title, film.year);
        if (match) {
            results.push({ ...film, tmdbId: match.id, posterPath: match.poster_path, backdropPath: match.backdrop_path });
            console.log(
                film.title.padEnd(36) +
                String(film.year).padEnd(6) +
                String(match.id).padEnd(12) +
                (match.poster_path ?? "null").padEnd(36) +
                (match.backdrop_path ?? "null")
            );
        } else {
            results.push({ ...film, tmdbId: null, posterPath: null, backdropPath: null });
            console.log(film.title.padEnd(36) + String(film.year).padEnd(6) + "NOT FOUND");
        }
    } catch (e) {
        console.error(`Error looking up "${film.title}": ${e.message}`);
    }
    // Small delay to be respectful of rate limits
    await new Promise((r) => setTimeout(r, 100));
}

console.log("\n--- SQL MIGRATION PREVIEW ---\n");
console.log("-- Step 1: Add tmdb_id column");
console.log("ALTER TABLE motion_pictures ADD COLUMN IF NOT EXISTS tmdb_id INTEGER;\n");

console.log("-- Step 2: Populate image paths and tmdb_id");
for (const r of results) {
    if (!r.tmdbId) {
        console.log(`-- SKIPPED (not found): ${r.title}`);
        continue;
    }
    console.log(
        `UPDATE motion_pictures SET tmdb_id = ${r.tmdbId}, poster_path = '${r.posterPath ?? ""}', backdrop_path = '${r.backdropPath ?? ""}' WHERE original_title = '${r.title.replace(/'/g, "''")}' AND EXTRACT(YEAR FROM release_date) = ${r.year};`
    );
}
