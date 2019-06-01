class InvoicePatterns {

  expense: string
  datePattern: RegExp
  accountPattern: RegExp
  totalAmountPattern: RegExp
  netAmountPattern?: RegExp
  gstAmountPattern?: RegExp
  invoicePattern?: RegExp

  constructor(expense: string,
              datePattern: string,
              accountPattern: string,
              totalAmountPattern: string,
              netAmountPattern?: string,
              gstAmountPattern?: string,
              invoicePattern?: string) {
    this.expense = expense
    this.datePattern = new RegExp(datePattern)
    this.accountPattern = new RegExp(accountPattern)
    this.totalAmountPattern = new RegExp(totalAmountPattern)
    if (netAmountPattern) {
      this.netAmountPattern = new RegExp(netAmountPattern)
    }
    if (netAmountPattern) {
      this.gstAmountPattern = new RegExp(gstAmountPattern)
    }
    if (invoicePattern) {
      this.invoicePattern = new RegExp(invoicePattern)
    }
  }
}
