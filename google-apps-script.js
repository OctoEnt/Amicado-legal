// Google Apps Script for Amicado Waitlist
// This code goes in your Google Sheets Apps Script editor

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);

    // Get the active spreadsheet and sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
      return createResponse(false, 'Invalid email address');
    }

    // Check for duplicates
    if (emailExists(sheet, data.email)) {
      return createResponse(false, 'Already signed up', true);
    }

    // Add the new signup
    const timestamp = new Date().toISOString();
    const source = data.source || 'Landing Page';
    const ipAddress = e.parameter.user_ip || 'N/A';

    sheet.appendRow([
      data.email,
      timestamp,
      source,
      ipAddress
    ]);

    // Return success response
    return createResponse(true, 'Successfully added to waitlist');

  } catch (error) {
    console.error('Error:', error);
    return createResponse(false, 'Server error occurred');
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: 'Amicado Waitlist API is running'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Check if email already exists
function emailExists(sheet, email) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === email.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Create JSON response with CORS headers
function createResponse(success, message, alreadyExists = false) {
  const response = {
    success: success,
    message: message,
    alreadyExists: alreadyExists
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}