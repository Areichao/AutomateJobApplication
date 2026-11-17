async function saveJob() {
    const status = document.getElementById('status');
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const [{ result: text }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText,
        });

        const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ secret: SHARED_SECRET, url: tab.url, text: text }),
        });
        const result = await response.json();

        if (result.ok) {
        status.textContent = '✓ Added: ' + result.company + ' — ' + result.role + ' (tab ' + result.tab + ')';
        } else {
        status.textContent = '✗ ' + result.error;
        }
    } catch (err) {
        status.textContent = '✗ ' + err.message;
    }
}

saveJob();
