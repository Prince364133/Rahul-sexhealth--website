function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Get data from the request
  var date = e.parameter.DATE || new Date().toLocaleString();
  var name = e.parameter.NAME || 'N/A';
  var phone = e.parameter.PHONENO || 'N/A';
  var address = e.parameter.ADDRESS || 'N/A';
  var ip = e.parameter.IP_ADDRESS || 'N/A';
  var browser = e.parameter.BROWSER || 'N/A';
  
  // Append a new row to the sheet (Date, Name, Phone, Address, IP, Browser)
  sheet.appendRow([date, name, phone, address, ip, browser]);
  
  // Return success response in JSON format
  return ContentService.createTextOutput(JSON.stringify({
    "status": "success",
    "message": "Data saved successfully"
  })).setMimeType(ContentService.MimeType.JSON);
}
