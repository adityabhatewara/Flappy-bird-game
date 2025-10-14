// File: netlify/functions/get-leaderboard.js

exports.handler = async function(event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const MASTER_KEY = process.env.MASTER_KEY;
        const BIN_ID = process.env.BIN_ID;
        const binUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

        const response = await fetch(binUrl, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });

        // If the bin doesn't exist yet (404), return an empty scores array.
        if (response.status === 404) {
            return {
                statusCode: 200,
                body: JSON.stringify({ scores: [] }) // Always return a scores array
            };
        }
        
        if (!response.ok) throw new Error('Failed to fetch from JSONBin.');

        const data = await response.json();
        
        // Ensure we always have a scores array to send back
        const scores = data.record.scores || [];

        return {
            statusCode: 200,
            body: JSON.stringify({ scores: scores }) // Always return an object with a scores property
        };

    } catch (error) {
        console.error('Function Error:', error);
        return { statusCode: 500, body: 'An error occurred.' };
    }
};
