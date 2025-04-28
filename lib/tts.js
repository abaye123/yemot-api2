const axios = require("axios").default;

/**
 * Convert text to speech using Google TTS API
 * @param {string} text - The text to convert to speech
 * @param {string} key - Google Cloud API key
 * @param {string} voice - The voice to use
 * @param {number} speed - The speaking rate
 * @returns {Promise<Buffer>} - Promise with the audio buffer
 */
async function textToSpeech(text, key, voice = 'he-IL-Wavenet-D', speed = 1.0) {
    const languageCode = voice.split('-')[0] + '-' + voice.split('-')[1];
    const rate = parseFloat(speed);
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`;
    const headers = {
        "Content-Type": "application/json; charset=utf-8"
    };

    const payload = {
        input: {
            text: text
        },
        voice: {
            languageCode: languageCode,
            name: voice
        },
        audioConfig: {
            audioEncoding: "MP3",
            speakingRate: rate
        }
    };

    try {
        const response = await axios.post(url, payload, { headers: headers });
        const audioContent = response.data.audioContent;

        if (audioContent) {
            return Buffer.from(audioContent, 'base64');
        } else {
            throw new Error('No audio content received from Google TTS API');
        }
    } catch (error) {
        throw new Error('Error synthesizing speech: ' + error.message);
    }
}

/**
 * Get first two words from text for filename generation
 * @param {string} text - The input text
 * @returns {string} - First two words joined with underscore
 */
function getFirstTwoWords(text) {
    return text.split(' ').slice(0, 2).join('_');
}

module.exports = {
    textToSpeech,
    getFirstTwoWords
};
