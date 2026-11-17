function testAddRow() {
    addJobRow({
        company: 'Test Company',
        role: 'Test Role',
        salary: '$100,000 - $120,000',
        link: 'https://example.com/job/123',
        notes: 'Lots of description text here...',
    });
}

function testExtract() {
    const fakePage = `Home  Jobs  Login
        Apply now
        Acme Robotics
        Senior Firmware Engineer
        Toronto, ON · Full-time
        About the role
        We are looking for a firmware engineer to build the brains of our warehouse robots.
        What you'll do
        - Write embedded C for motor controllers
        - Debug hardware with the electrical team
        Pay: $110,000 - $140,000 CAD per year
        Acme is an equal opportunity employer.
        Similar jobs
        Junior Firmware Engineer
        © 2026 Acme Robotics · Privacy`;

    const info = extractJobInfo(fakePage, 'https://example.com/job/456');
    Logger.log(JSON.stringify(info, null, 2));
}

function testWebApp() {
    const fakeRequest = {
        postData: {
        contents: JSON.stringify({
            secret: PropertiesService.getScriptProperties().getProperty('SHARED_SECRET'),
            url: 'https://example.com/job/789',
            text: 'Careers Home\nAcme Robotics\nSenior Firmware Engineer\nPay: $110,000 - $140,000\nWe build robots.\n© 2026',
        }),
        },
    };
    const result = doPost(fakeRequest);
    Logger.log(result.getContent());
}

function makeSecret() {
    Logger.log(Utilities.getUuid());
}
