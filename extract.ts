function scanInvoices(): void {
  scanInvoiceFolder(invoicesFolder());
}

// TODO: Rename
function scanInvoiceFolder(folder: Folder): void {
  const expenseInvoicePatterns = getExpenseInvoicePatterns();
  const expenseInvoices = getConvertedExpenseInvoices(folder)
  forEach(expenseInvoices, (invoices, expense): void => {
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
    extractInvoice(invoice, patterns)
  }
}

function extractInvoice(invoice: File, patterns: InvoicePatterns): void {
  // @ts-ignore
  console.log('Extracting invoice: %s', invoice.getName())
  const text = getDocumentText(invoice.getId())
  const date = patterns.matchDate(text)
  // @ts-ignore
  console.log('Date: %s', date)
}
