# Flappy Bird: The Saarang EDM Night Reveal

A custom-built Flappy Bird clone used as an interactive publicity stunt to reveal the headlining artist for Saarang's EDM Night. 

## The Motivation: Why build this?
Standard PR posters get ignored, and simply dropping a name on an Instagram story felt anti-climactic. We wanted the student body to actually *earn* the EDM night reveal. 

The idea was simple: instead of just telling people who was coming, we made them play a custom-themed Flappy Bird game. Once a player hit a specific high score, the game would finally unlock and display the official artist reveal graphic. It turned a regular announcement into a campus-wide competition.

## 📸 What it Looks Like
*(Replace this with a GIF of you playing the game!)*
![Gameplay Preview](./assets/your-gameplay-gif.gif)

## The Chaos: Defending Against My Friends
The funniest (and most stressful) part of this project wasn't building the physics engine—it was keeping the artist a secret. 

The minute the link went live, my friends from cybersecurity club immediately stopped playing the game normally and started trying to hack it. They were opening the browser console, trying to spoof score variables, inspecting the network requests, and doing everything they could to bypass the game and find the reveal image hidden in the code.

What was supposed to be a simple frontend game turned into an accidental, high-stakes game of cat-and-mouse. I spent the actual reveal window scrambling to push live hotfixes:
* Moving the reveal logic away from the client-side and hiding it behind **Netlify Functions**.
* Patching exploits where people figured out how to freeze the bird's gravity.
* Validating scores on the backend so someone couldn't just type `score = 9999` in the console.

It was chaotic, but it ended up being an incredible crash course in live deployment and defensive programming.

## How It Was Built
* **Frontend:** Vanilla JavaScript and the HTML5 Canvas API for the game loop, gravity, and collision detection. (Kept it lightweight so it would load fast on hostel Wi-Fi).
* **Backend:** Netlify Functions to securely handle the final reveal trigger and keep the artist's name out of the public source code.
* **Hosting:** Netlify (which thankfully handled the massive traffic spike without crashing).

## Run It Yourself
If you want to try the game (or try to hack it yourself):
1. Clone this repo: `git clone https://github.com/adityabhatewara/Flappy-bird-game.git`
2. Open `index.html` in your browser.
3. Tap to fly!
