# 🎮 Itay's World of Games

A page that lists every game Itay makes, as plain HTML files.

## How to add a new game

1. Create your game as a single `.html` file (put a `<title>Your Game Name</title>`
   in it so it shows up with the right name).
2. Save it into the `games/` folder — either with `git push`, or by using
   GitHub's "Add file" button on the `games` folder on github.com.
3. That's it! Within about a minute the game will show up on the main page.

## How it works

A GitHub Action watches the `games/` folder. Whenever a game is added, it
automatically rebuilds `games/games.json` (the list of games) — nothing to
edit by hand.

Look at `games/example-game.html` for a simple starting template you can
copy.
