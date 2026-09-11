async function loadGames() {
  const grid = document.getElementById('games-grid');
  try {
    const res = await fetch('games/games.json');
    if (!res.ok) throw new Error('Failed to load games.json: ' + res.status);
    const games = await res.json();
    renderGames(grid, games);
  } catch (err) {
    console.error(err);
    renderEmptyState(grid);
  }
}

function renderGames(grid, games) {
  grid.innerHTML = '';
  if (!Array.isArray(games) || games.length === 0) {
    renderEmptyState(grid);
    return;
  }
  for (const game of games) {
    grid.appendChild(createGameCard(game));
  }
}

function createGameCard(game) {
  const link = document.createElement('a');
  link.className = 'game-card';
  link.href = 'games/' + encodeURIComponent(game.file);
  const titleEl = document.createElement('span');
  titleEl.textContent = game.title;
  link.appendChild(titleEl);
  return link;
}

function renderEmptyState(grid) {
  grid.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'empty-state';
  p.textContent = 'No games yet — add one to the games folder!';
  grid.appendChild(p);
}

loadGames();
