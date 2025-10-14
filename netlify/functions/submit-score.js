exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const playerData = JSON.parse(event.body);
        const { name, rollNumber, score } = playerData;
        console.log("--- Function Started ---");
        console.log("Received data:", playerData);

        if (!name || !rollNumber || typeof score !== 'number') {
            console.error("Validation failed: Invalid data received.");
            return { statusCode: 400, body: 'Invalid data submitted.' };
        }

        const MASTER_KEY = process.env.MASTER_KEY;
        const BIN_ID = process.env.BIN_ID;
        const binUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
        
        // This log will prove if your Netlify variables are being read correctly
        console.log("Attempting to read from BIN_ID:", BIN_ID ? BIN_ID : "BIN_ID IS MISSING!");
        
        let scores = [];
        try {
            const responseGet = await fetch(`${binUrl}/latest`, {
                headers: { 'X-Master-Key': MASTER_KEY }
            });

            console.log("JSONBin READ response status:", responseGet.status);

            if (responseGet.ok) {
                const leaderboardData = await responseGet.json();
                // This log will show us the EXACT data it got from your file
                console.log("Data read from JSONBin:", JSON.stringify(leaderboardData));
                scores = leaderboardData.record.scores || [];
            } else {
                 console.error("Failed to read from JSONBin. Status:", responseGet.statusText);
            }
        } catch (e) {
            console.error("CRITICAL ERROR during fetch:", e);
        }

        console.log("Current scores list (before update):", scores.length, "entries.");

        const playerIndex = scores.findIndex(p => p.rollNumber === rollNumber);
        console.log("Player found at index:", playerIndex);

        if (playerIndex > -1) {
            if (score > scores[playerIndex].score) {
                console.log(`Updating existing player. Old score: ${scores[playerIndex].score}, New score: ${score}`);
                scores[playerIndex].score = score;
            } else {
                 console.log(`New score is not higher. No update needed.`);
            }
        } else {
            console.log("New player detected. Adding to leaderboard.");
            scores.push({ name, rollNumber, score });
        }
        
        scores.sort((a, b) => b.score - a.score);

        // ... (The PUT request to save the data) ...
        const responsePut = await fetch(binUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ scores: scores }) 
        });

        console.log("JSONBin WRITE response status:", responsePut.status);
        if (!responsePut.ok) {
            throw new Error('Failed to update leaderboard.');
        }

        console.log("--- Function Succeeded ---");
        return { statusCode: 200, body: JSON.stringify({ message: 'Leaderboard updated!' }) };

    } catch (error) {
        console.error('--- Function Crashed ---', error);
        return { statusCode: 500, body: 'An error occurred.' };
    }
};
