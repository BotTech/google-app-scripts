var START_DATE_CELL = 'Properties!B1';
var END_DATE_CELL = 'Properties!B2';
var INVOICES_FOLDER = 'Invoices';
// This currently only works if the label is the same as the invoices folder.
var INVOICES_LABEL_PREFIX = INVOICES_FOLDER + '/';
var FINANCE_FOLDER = 'Finance';
var CONVERTED_PROPERTY_KEY = 'converted';
var CONVERTED_FROM_PROPERTY_KEY = 'convertedFrom';
var CONVERTED_PROPERTIES_SEARCH_STRING = 'properties has { key=\'' + CONVERTED_PROPERTY_KEY + '\' and value=\'true\' and visibility=\'PRIVATE\' }';
var LANGUAGE = 'en-NZ';
var EXPENSE_PATTERNS_RANGE = 'ExpensePatterns';
// The first must be the key and the values must be the same as the labels.
var EXPENSE_PATTERNS_HEADERS = ['Expense', 'Date', 'Account', 'Invoice', 'Net', 'GST', 'Total'];
var ATTACHMENT_OPTIONS = {
  'includeInlineImages': false,
  'includeAttachments': true
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Financials')
    .addItem('Download Invoices', 'downloadInvoices')
    .addItem('Convert Invoices', 'convertInvoices')
    .addItem('Scan Invoices', 'scanInvoices')
    .addToUi();
}

function downloadInvoices() {
  var startDate = getStartDate();
  var endDate = getEndDate();
  var financialYear = endDate.getYear();
  console.log('Financial year: %s', financialYear);
  var invoiceLabels = getInvoiceLabels();
  var financeFolder = getFinanceFolder(financialYear);
  invoiceLabels.forEach(function(label) {
    downloadInvoicesForLabel(label, startDate.searchString, endDate.searchString, financeFolder);
  });
}

function getStartDate() {
  var startDate = getCellValue(START_DATE_CELL);
  var calDate = calendarDate(startDate);
  startDate.searchString = calDate;
  console.log('Start date: %s', startDate.searchString);
  return startDate;
}

function getEndDate() {
  var endDate = getCellValue(END_DATE_CELL);
  var endOrNow = noLaterThanNow(endDate);
  var calDate = calendarDate(endOrNow);
  endDate.searchString = calDate;
  console.log('End date: %s', endDate.searchString);
  return endDate;
}

function getCellValue(cellRef) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getRange(cellRef).getValue();
}

function noLaterThanNow(date) {
  var now = new Date();
  if (now < date) {
    return now;
  } else {
    return date;
  }
}

function calendarDate(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return year + '/' + month + '/' + day;
}

function getInvoiceLabels() {
  var labels = GmailApp.getUserLabels();
  var invoiceLabels = labels.filter(function(label) {
    return label.getName().indexOf(INVOICES_LABEL_PREFIX) === 0;
  });
  invoiceLabels.forEach(function(label) {
    console.log('Invoice label: %s', label.getName());
  });
  return invoiceLabels;
}

function getFinanceFolder(financialYear) {
  var root = DriveApp.getRootFolder();
  var financeFolder = getChildFolder(root, FINANCE_FOLDER);
  var financialYearFolder = getChildFolder(financeFolder, financialYear);
  return financialYearFolder;
}

function getChildFolder(folder, name) {
  var child = getMaybeChildFolder(folder, name);
  if (child) {
    return child;
  } else {
    throw 'Folder "' + folder.getName() + '" does not have a child folder named "' + name + '".';
  }
}

function getMaybeChildFolder(folder, name) {
  var children = folder.getFoldersByName(name);
  if (!children.hasNext()) {
    return null;
  } else {
    var child = children.next();
    if (children.hasNext()) {
      throw 'Folder "' + folder.getName() + '" has multiple child folders named "' + name + '".';
    } else {
      return child;
    }
  }
}

function downloadInvoicesForLabel(label, start, end, financeFolder) {
  var attachments = getAttachments(label, start, end);
  var folder = getOrCreateFolder(financeFolder, label);
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    console.log('Existing invoice: %s', file.getName());
    attachments = attachments.filter(function(attachment) {
      return attachment.getName() != file.getName();
    });
  }
  attachments.forEach(function(attachment) {
    console.log('Saving invoice: %s', attachment.getName());
    folder.createFile(attachment);
  });
}

function getAttachments(label, start, end) {
  var messages = getMessages(label, start, end);
  var attachments = [];
  messages.forEach(function(message) {
    attachments = attachments.concat(message.getAttachments(ATTACHMENT_OPTIONS));
  });
  attachments.forEach(function(attachment) {
    console.log('Attachment: %s', attachment.getName());
  });
  return attachments;
}

function getMessages(label, start, end) {
  var query = 'label:"' + label.getName() + '" after:' + start + ' -after:' + end + '';
  console.log('Searching for: %s', query);
  var threads = GmailApp.search(query);
  console.log('Found %s results.', threads.length);
  var messages = [];
  threads.forEach(function(thread) {
    messages = messages.concat(thread.getMessages());
  });
  return messages;
}

function getOrCreateFolder(folder, label) {
  var loop = function(pathParts, result) {
    var name = pathParts.shift();
    if (name) {
      var child = getMaybeChildFolder(result, name);
      if (!child) {
        child = result.createFolder(name);
      }
      return loop(pathParts, child);
    } else {
      return result;
    }
  };
  return loop(label.getName().split('/'), folder);
}

function convertInvoices() {
  convertInvoicesInFolder(invoicesFolder());
}

function invoicesFolder() {
  var endDate = getEndDate();
  var financialYear = endDate.getYear();
  var financeFolder = getFinanceFolder(financialYear);
  return getChildFolder(financeFolder, INVOICES_FOLDER);
}

function convertInvoicesInFolder(folder) {
  var files = folder.searchFiles('not ' + CONVERTED_PROPERTIES_SEARCH_STRING);
  var converted = convertedInvoiceIds(folder);
  while (files.hasNext()) {
    var file = files.next();
    var id = file.getId();
    if (arrayContains(converted, id)) {
      console.log('Converted already: %s (%s)', file.getName(), id);
    } else {
      convertInvoice(file , file.getName() + '.txt');
    }
  }
  var childFolders = folder.getFolders();
  while (childFolders.hasNext()) {
    convertInvoicesInFolder(childFolders.next());
  }
}

function convertedInvoiceIds(folder) {
  var args = {
    q: '\'' + folder.getId() + '\' in parents and trashed=false and ' + CONVERTED_PROPERTIES_SEARCH_STRING
  }
  var conversions = Drive.Files.list(args);
  return conversions.items.map(convertedFromProperty);
}

function convertedFromProperty(file) {
  for (var i = 0; i < file.properties.length; i++) {
    var prop = file.properties[i];
    if (prop.key === CONVERTED_FROM_PROPERTY_KEY) {
      return prop.value;
    }
  }
  throw 'File "' + file.getId() + '" did not contain the ' + CONVERTED_FROM_PROPERTY_KEY + ' property but it has been converted.';
}

function arrayContains(array, item) {
  for (var i = 0; i < array.length; i++) {
    var next = array[i];
    if (next === item) {
      return true;
    }
  }
  return false;
}

function convertInvoice(file, name) {
  console.log('Converting file: %s (%s)', file.getName(), file.getId());
  var id = file.getId();
  var body = {
    title: name,
    properties: [
      {
        key: CONVERTED_PROPERTY_KEY,
        value: 'true'
      },
      {
        key: CONVERTED_FROM_PROPERTY_KEY,
        value: id
      }
    ]
  };
  var args = {
    ocr: true,
    ocrLanguage: LANGUAGE
  };
  var result = Drive.Files.copy(body, id, args);
  console.log('Converted file to: %s (%s)', name, result.id);
}

function scanInvoices() {
  scanInvoiceFolder(invoicesFolder());
}

function scanInvoiceFolder(folder) {
  var expensesMap = expensePatterns();
  var converted = conversionsInFolder(folder, expensesMap);
  // TODO
}

function expensePatterns() {
  expensesMap = {};
  expensePatternRows().forEach(function(row) {
    var expense = row.shift();
    var patternMap = expensesMap[expense];
    if (!patternMap) {
      patternMap = {};
    }
    expensesMap[expense] = addExpensePattern(row, patternMap);
  });
  return expensesMap;
}

function expensePatternRows() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var range = spreadsheet.getRangeByName(EXPENSE_PATTERNS_RANGE);
  var rows = range.getValues();
  var headerRow = rows.shift();
  if (!checkExpensePatternHeaders(headerRow)) {
    throw 'Expense patterns do not contain the expected headers: ' + EXPENSE_PATTERNS_HEADERS;
  }
  return rows;
}

function checkExpensePatternHeaders(row) {
  if (row.length !== EXPENSE_PATTERNS_HEADERS.length) {
    return false;
  }
  for (var i = 0; i < row.length; i++) {
    if (row[i] !== EXPENSE_PATTERNS_HEADERS[i]) {
      return false;
    }
  }
  return true;
}

function addExpensePattern(row, patternMap) {
  var rowPatterns = expenseRowPatterns(row);
  for (var key in rowPatterns) {
    var value = rowPatterns[key];
    if (value.trim().length > 0) {
      var patterns = patternMap[key];
      if (!patterns) {
        patterns = [];
      }
      patterns.push(value);
      patternMap[key] = patterns;
    }
  }
  return patternMap;
}

function expenseRowPatterns(row) {
  var obj = {};
  for (var i = 0; i < row.length; i++) {
    var cell = row[i];
    var header = EXPENSE_PATTERNS_HEADERS[i + 1];
    obj[header] = cell;
  }
  return obj;
}

function conversionsInFolder(folder, expensesMap) {
  var expense = folder.getName();
  var files = folder.searchFiles(CONVERTED_PROPERTIES_SEARCH_STRING);
  var patternMap = expensesMap[expense];
  if (files.hasNext() && !patternMap) {
    throw 'Patterns missing for: ' + expense;
  }
  while (files.hasNext()) {
    var file = files.next();
    scanInvoice(file.getId(), expense, patternMap);
  }
  var childFolders = folder.getFolders();
  while (childFolders.hasNext()) {
    conversionsInFolder(childFolders.next(), expensesMap);
  }
}

function scanInvoice(docId, expense, patternMap) {
  var text = invoiceText(docId);
  for (var key in patternMap) {
    var patterns = patternMap[key];
    // TODO
  }
}

function invoiceText(docId) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  return body.getText();
}
