function scanInvoices(): void {
  scanInvoiceFolder(invoicesFolder());
}

// TODO: Rename
function scanInvoiceFolder(folder: Folder): void {
  const expenseInvoicePatterns = getExpenseInvoicePatterns();
  const expenseInvoices = getConvertedExpenseInvoices(folder)
  expenseInvoices.forEach((invoices, expense): void => {
    const patterns = expenseInvoicePatterns[expense]
    if (!patterns) {
      throw `Invoice patterns missing for ${expense}`
    }
    extractInvoices(invoices, patterns)
  })
}

function extractInvoices(invoices: Invoices, patterns: InvoicePatterns): void {
  while (invoices.files.hasNext()) {
    const invoice = invoices.files.next()
    // @ts-ignore
    console.log('Extracting invoice: %s', invoice.getName())
    const text = getDocumentText(invoice.getId())
    const dateMatches = text.match(patterns.datePattern)
    // @ts-ignore
    console.log('Date: %s', dateMatches)
  }
}
