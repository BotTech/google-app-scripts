function onOpen(): void {
    const ui = SpreadsheetApp.getUi()
    ui.createMenu('Financials')
        .addItem('Download Invoices', 'downloadInvoices')
        .addItem('Convert Invoices', 'convertInvoices')
        .addItem('Scan Invoices', 'scanInvoices')
        .addToUi()
}
