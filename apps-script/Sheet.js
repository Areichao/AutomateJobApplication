// Default drop down values for the "Application Status" and "Rejection Reason" columns
const DEFAULT_STATUS = 'Submitted - Pending Response';
const DEFAULT_REJECTION = 'N/A';
const ROW_PER_TAB = 100;

function addJobRow(job) {
    // Get the spreadsheet, then the 'Tracking Template' tab
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getTargetSheet(ss);
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
    const newRow = getLastJobRow(sheet) + 1;
    sheet.getRange(newRow, 1, 1, row.length).setValues([row]);

    // Set the Notes cell's font size to 1
    const notesCol = headers.indexOf('Notes') + 1; // +1 because getRange is 1-indexed
    sheet.getRange(newRow, notesCol).setFontSize(1);
}

function getTargetSheet(ss) {
    // find next numbered tab like "101-200" or something
    let newest = null;
    let newestStart = 0;
    for (const s of ss.getSheets()){
        const match = s.getName().match(/^(\d+)-(\d+)$/);
        if (match && Number(match[1]) > newestStart) {
            newest = s;
            newestStart = Number(match[1]);
        }
    }

    // if it exists and isnt full yet, use the current tab
    if (newest && getLastJobRow(newest) - 1 < ROW_PER_TAB) {
        return newest;
    }

    // otherwise copy the original template into a new tab
    const template = ss.getSheetByName('Tracking Template');
    if (!template) throw new Error('Sheet with this name does not exist: Tracking Template');

    const start = newest ? newestStart + ROW_PER_TAB : 1;
    const newSheet = template.copyTo(ss);
    newSheet.setName(start + '-' + (start + ROW_PER_TAB - 1));

    // move the tab to the far right so they stay in the proper order
    ss.setActiveSheet(newSheet);
    ss.moveActiveSheet(ss.getNumSheets());
    return newSheet;
}

// Last row that has a Company Name (column A). Returns 1 if only the header exists.
function getLastJobRow(sheet) {
    const values = sheet.getRange(1, 1, sheet.getMaxRows(), 1).getValues();
    for (let i = values.length - 1; i >= 0; i--) {
        if (values[i][0] !== '') return i + 1;
    }
    return 1;
}

