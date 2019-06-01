const START_DATE_CELL = 'Properties!B1'
const END_DATE_CELL = 'Properties!B2'
const INVOICE_PATTERNS_RANGE = 'InvoicePatterns'
// The first must be the key and the values must be the same as the labels.
const INVOICE_PATTERNS_HEADERS = ['Expense', 'Date', 'Account', 'Invoice', 'Net', 'GST', 'Total']

function getStartDate() {
  const startDate = getCellValue(START_DATE_CELL)
  // FIXME: Remove searchString
  startDate.searchString = calendarDate(startDate)
  // @ts-ignore
  console.log('Start date: %s', startDate.searchString)
  return startDate
}

function getEndDate() {
  const endDate = getCellValue(END_DATE_CELL)
  const endOrNow = noLaterThanNow(endDate)
  // FIXME: Remove searchString
  endDate.searchString = calendarDate(endOrNow)
  // @ts-ignore
  console.log('End date: %s', endDate.searchString)
  return endDate
}

function getCellValue(cellRef): any {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  return spreadsheet.getRange(cellRef).getValue()
}

function getExpenseInvoicePatterns(): {} {
  const rows = invoicePatternRows()
  return rows.reduce(
    (expenseInvoicePatterns, row): {} => {
      const invoicePatterns = parseInvoicePatterns(row)
      if (expenseInvoicePatterns[invoicePatterns.expense]) {
        throw `Duplicate invoice patterns found for ${invoicePatterns.expense}`
      }
      expenseInvoicePatterns[invoicePatterns.expense] = invoicePatterns
      return expenseInvoicePatterns
    },
    {}
  )
}

function invoicePatternRows(): any[][] {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  // FIXME: range can be null
  const range = spreadsheet.getRangeByName(INVOICE_PATTERNS_RANGE)
  const rows = range.getValues()
  const headerRow = rows.shift()
  if (!checkInvoicePatternHeaders(headerRow)) {
    throw 'Invoice patterns do not contain the expected headers: ' + INVOICE_PATTERNS_HEADERS
  }
  return rows
}

function checkInvoicePatternHeaders(row: any[]): boolean {
  if (row.length !== INVOICE_PATTERNS_HEADERS.length) {
    return false
  }
  for (let i = 0; i < row.length; i++) {
    if (row[i] !== INVOICE_PATTERNS_HEADERS[i]) {
      return false
    }
  }
  return true
}

function parseInvoicePatterns(row): InvoicePatterns {
  return new InvoicePatterns(
    row.shift(),
    row.shift(),
    row.shift(),
    row.shift(),
    row.shift(),
    row.shift(),
    row.shift()
  )
}
