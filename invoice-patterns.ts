class InvoicePatterns {

  expense: string
  datePattern: RegExp
  accountPattern: RegExp
  invoicePattern: RegExp
  totalAmountPattern: RegExp
  netAmountPattern?: RegExp
  gstAmountPattern?: RegExp

  constructor(expense: string,
              datePattern: string,
              accountPattern: string,
              invoicePattern: string,
              totalAmountPattern: string,
              netAmountPattern?: string,
              gstAmountPattern?: string) {
    this.expense = expense
    this.datePattern = new RegExp(datePattern)
    this.accountPattern = new RegExp(accountPattern)
    this.invoicePattern = new RegExp(invoicePattern)
    this.totalAmountPattern = new RegExp(totalAmountPattern)
    if (netAmountPattern) {
      this.netAmountPattern = new RegExp(netAmountPattern)
    }
    if (netAmountPattern) {
      this.gstAmountPattern = new RegExp(gstAmountPattern)
    }
  }
}
