// Default drop down values for the "Application Status" and "Rejection Reason" columns
const DEFAULT_STATUS = 'Submitted - Pending Response';
const DEFAULT_REJECTION = 'N/A';

function testAddRow() {
  addJobRow({
    company: 'Test Company',
    role: 'Test Role',
    salary: '$100,000 - $120,000',
    link: 'https://example.com/job/123',
    notes: 'Lots of description text here...',
  });
}

function addJobRow(job) {
    // Get the spreadsheet, then the 'Tracking Template' tab
    // (step 2 will switch this to the right "1-100" tab)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Tracking Template');
    if (!sheet) throw new Error('Sheet with this name does not exist: Tracking Template');
    Logger.log(sheet.getName());


    // Read the header row into an array like this. ['Company Name', 'Application Status', ...]
    // assume headers are on row 1. start on row one col 1
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log(headers);   
    // [Company Name, Application Status, Role, Salary, Date Submitted, Link to Job Req, Rejection Reason, Notes] 

    // Build an empty row the same width as the headers,.
    const row = new Array(headers.length).fill('');

    // then put each value in the right slot by finding its header's position
    row[headers.indexOf('Company Name')]       = job.company;
    row[headers.indexOf('Application Status')] = DEFAULT_STATUS;
    row[headers.indexOf('Role')]               = job.role;
    row[headers.indexOf('Salary')]             = job.salary;
    row[headers.indexOf('Date Submitted')]     = new Date();
    row[headers.indexOf('Link to Job Req')]    = job.link;
    row[headers.indexOf('Rejection Reason')]   = DEFAULT_REJECTION;
    row[headers.indexOf('Notes')]              = job.notes;

    Logger.log(row);

    // Write the row to the next empty row (getLastRow() + 1)
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1, 1, row.length).setValues([row]);

    // Set the Notes cell's font size to 1
    const notesCol = headers.indexOf('Notes') + 1; // +1 because getRange is 1-indexed
    sheet.getRange(newRow, notesCol).setFontSize(1);
}
