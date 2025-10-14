// File: netlify/functions/submit-score.js

exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const playerData = JSON.parse(event.body);
        const { name, rollNumber, score } = playerData;

        // Basic validation
        if (!name || !rollNumber || typeof score !== 'number') {
            return { statusCode: 400, body: 'Invalid data submitted.' };
        }

        // Securely get credentials from Netlify
        const MASTER_KEY = process.env.MASTER_KEY;
        const BIN_ID = process.env.BIN_ID;
        const binUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

        // --- STEP 1: READ THE EXISTING LEADERBOARD ---
        let scores = [];
        try {
            const responseGet = await fetch(`${binUrl}/latest`, {
                headers: { 'X-Master-Key': MASTER_KEY }
            });

            // If the bin exists and has data, use it. Otherwise, we start with an empty array.
            if (responseGet.ok) {
                const leaderboardData = await responseGet.json();
                scores = leaderboardData.record.scores || [];
            }
        } catch (e) {
            console.warn("Could not fetch existing bin, will create a new one.", e);
        }

        // --- STEP 2: CHECK IF PLAYER EXISTS AND UPDATE OR ADD ---
        const playerIndex = scores.findIndex(p => p.rollNumber === rollNumber);

        if (playerIndex > -1) {
            // Player exists, so we only update if the new score is higher
            if (score > scores[playerIndex].score) {
                scores[playerIndex].score = score;
            }
        } else {
            // This is a new player, so we add them to the list
            scores.push({ name, rollNumber, score });
        }
        
        // --- STEP 3: SORT THE LIST AND SAVE IT BACK ---
        scores.sort((a, b) => b.score - a.score);

        const responsePut = await fetch(binUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            // The body MUST be the full object, not just the scores array
            body: JSON.stringify({ scores: scores }) 
        });

        if (!responsePut.ok) {
            throw new Error('Failed to update leaderboard in JSONBin.');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Leaderboard updated successfully!' })
        };

    } catch (error) {
        console.error('Function Error:', error);
        return { statusCode: 500, body: 'An error occurred.' };
    }
};
