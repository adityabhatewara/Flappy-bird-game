exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const playerData = JSON.parse(event.body);
        const { name, rollNumber, score } = playerData;
        
        // You can add validation here to prevent cheating
        if (!name || !rollNumber || typeof score !== 'number') {
            return { statusCode: 400, body: 'Invalid data submitted.' };
        }

        // Securely get keys from the Netlify environment variables
        const MASTER_KEY = process.env.MASTER_KEY;
        const BIN_ID = process.env.BIN_ID;

        const binUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

        // Fetch the current leaderboard
        const responseGet = await fetch(binUrl + '/latest', {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        if (!responseGet.ok) throw new Error('Failed to fetch leaderboard data.');
        
        const leaderboardData = await responseGet.json();
        const scores = leaderboardData.record.scores || [];

        // Add the new score and sort the leaderboard
        scores.push({ name, rollNumber, score });
        scores.sort((a, b) => b.score - a.score);
        const updatedScores = scores.slice(0, 100); // Optional: Keep top 100

        // Send the updated leaderboard back to JSONBin
        const responsePut = await fetch(binUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ scores: updatedScores })
        });

        if (!responsePut.ok) throw new Error('Failed to update leaderboard.');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Score submitted successfully!' })
        };

    } catch (error) {
        console.error('Function Error:', error);
        return { statusCode: 500, body: 'An error occurred while submitting the score.' };
    }
};
