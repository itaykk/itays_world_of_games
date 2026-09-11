#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const GAMES_DIR = path.join(__dirname, '..', 'games');
const MANIFEST_FILE = path.join(GAMES_DIR, 'games.json');

function extractTitle(html) {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  if (!match) return null;
  const title = match[1].trim();
  return title.length > 0 ? title : null;
}

function titleFromFilename(filename) {
  const base = filename.replace(/\.html?$/i, '');
  return base
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getGameTitle(html, filename) {
  return extractTitle(html) || titleFromFilename(filename);
}

function scanGamesDir(gamesDir) {
  const files = fs.readdirSync(gamesDir).filter((name) => {
    if (name.toLowerCase() === 'games.json') return false;
    return /\.html?$/i.test(name);
  });

  const games = files.map((file) => {
    const html = fs.readFileSync(path.join(gamesDir, file), 'utf8');
    return { title: getGameTitle(html, file), file };
  });

  games.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  return games;
}

function buildManifest(gamesDir, manifestFile) {
  const games = scanGamesDir(gamesDir);
  fs.writeFileSync(manifestFile, JSON.stringify(games, null, 2) + '\n');
  return games;
}

module.exports = { extractTitle, titleFromFilename, getGameTitle, scanGamesDir, buildManifest };

if (require.main === module) {
  const games = buildManifest(GAMES_DIR, MANIFEST_FILE);
  console.log(`Wrote ${games.length} game(s) to ${path.relative(process.cwd(), MANIFEST_FILE)}`);
}
