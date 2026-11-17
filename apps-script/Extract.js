const MODEL = 'gemini-flash-lite-latest';
const EXTRACT_PROMPT = `You extract details from the text of a job posting web page.
The text was copied from a browser, so the posting is surrounded by navigation, buttons and other page clutter.

Return:
- company: the hiring company's name.
- role: the job title, as written.
- salary: every pay range or rate in the posting, copied as written, separated by "; " if there are several. Empty string if none.`;


function extractJobInfo(pageText, url) {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY in Script Properties');

    const body = {
        systemInstruction: { parts: [{ text: EXTRACT_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: 'URL: ' + url + '\n\nPage text:\n' + pageText }] }],
        generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: 'OBJECT',
            properties: {
            company: { type: 'STRING' },
            role: { type: 'STRING' },
            salary: { type: 'STRING' },
            },
            required: ['company', 'role', 'salary'],
        },
        },
    };

    let response;
    for (let attempt = 1; attempt <= 4; attempt++) {
        response = UrlFetchApp.fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent',
        {
            method: 'post',
            contentType: 'application/json',
            headers: { 'x-goog-api-key': apiKey },
            payload: JSON.stringify(body),
            muteHttpExceptions: true,
        }
        );
        const code = response.getResponseCode();
        if (code !== 503 && code !== 429) break;
        Logger.log('Gemini busy (' + code + '), retrying... attempt ' + attempt);
        Utilities.sleep(3000 * attempt);
    }

    if (response.getResponseCode() !== 200) {
        throw new Error('Gemini API error ' + response.getResponseCode() + ': ' + response.getContentText());
    }

    const data = JSON.parse(response.getContentText());
    Logger.log('Model used: ' + data.modelVersion);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned no answer: ' + response.getContentText());
    return JSON.parse(text);
}
