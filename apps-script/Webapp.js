function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        const secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
        if (!secret || data.secret !== secret) {
        return jsonOut({ ok: false, error: 'Wrong secret' });
        }

        const info = extractJobInfo(data.text, data.url);

        const lock = LockService.getScriptLock();
        lock.waitLock(30000);
        let tabName;
        try {
        tabName = addJobRow({
            company: info.company,
            role: info.role,
            salary: info.salary,
            link: data.url,
            notes: data.text.slice(0, 49000),
        });
        } finally {
        lock.releaseLock();
        }

        return jsonOut({ ok: true, company: info.company, role: info.role, salary: info.salary, tab: tabName });
    } catch (err) {
        return jsonOut({ ok: false, error: err.message });
    }
}

function jsonOut(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}
