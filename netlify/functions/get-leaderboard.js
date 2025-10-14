exports.handler = async function(event) {
    // This function only allows GET requests
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Securely get keys from Netlify environment variables
        const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
        const BIN_ID = process.env.JSONBIN_BIN_ID;

        const binUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

        // Fetch the current leaderboard from JSONBin
        const response = await fetch(binUrl, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });

        if (!response.ok) {
            // If the bin doesn't exist yet, return an empty array
            if (response.status === 404) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ scores: [] })
                };
            }
            throw new Error('Failed to fetch leaderboard data.');
        }

        const leaderboardData = await response.json();
        
        // Return the fetched data to the frontend
        return {
            statusCode: 200,
            body: JSON.stringify(leaderboardData.record) // Send back the 'scores' array
        };

    } catch (error) {
        console.error('Function Error:', error);
        return { statusCode: 500, body: 'An error occurred.' };
    }
};
