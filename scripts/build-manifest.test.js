'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  extractTitle,
  titleFromFilename,
  getGameTitle,
  scanGamesDir,
} = require('./build-manifest');

function makeTempGamesDir(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'games-test-'));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

test('extractTitle finds a <title> tag', () => {
  assert.equal(extractTitle('<html><head><title>My Game</title></head></html>'), 'My Game');
});

test('extractTitle returns null when there is no title tag', () => {
  assert.equal(extractTitle('<html><head></head></html>'), null);
});

test('titleFromFilename converts kebab/snake case to Title Case', () => {
  assert.equal(titleFromFilename('space_invaders.html'), 'Space Invaders');
  assert.equal(titleFromFilename('tic-tac-toe.html'), 'Tic Tac Toe');
});

test('getGameTitle falls back to filename when title is missing', () => {
  assert.equal(getGameTitle('<html></html>', 'space_invaders.html'), 'Space Invaders');
});

test('getGameTitle prefers the <title> tag when present', () => {
  const html = '<html><head><title>Space Race</title></head></html>';
  assert.equal(getGameTitle(html, 'space_invaders.html'), 'Space Race');
});

test('scanGamesDir handles special characters in titles', () => {
  const dir = makeTempGamesDir({
    'fun.html': "<title>Bob's Adventure & Friends</title>",
  });
  const games = scanGamesDir(dir);
  assert.deepEqual(games, [{ title: "Bob's Adventure & Friends", file: 'fun.html' }]);
});

test('scanGamesDir sorts games alphabetically by title and ignores non-html files', () => {
  const dir = makeTempGamesDir({
    'z.html': '<title>Alpha Quest</title>',
    'a.html': '<title>Zeta Run</title>',
    'games.json': '[]',
    'notes.txt': 'not a game',
  });
  const games = scanGamesDir(dir);
  assert.deepEqual(games, [
    { title: 'Alpha Quest', file: 'z.html' },
    { title: 'Zeta Run', file: 'a.html' },
  ]);
});
