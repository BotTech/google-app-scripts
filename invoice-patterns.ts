class InvoicePatterns {

  expense: string
  datePattern: RegExp[]
  accountPattern: RegExp[]
  invoicePattern: RegExp[]
  netAmountPattern: RegExp[]
  gstAmountPattern: RegExp[]
  totalAmountPattern: RegExp[]

  constructor(
    expense: string,
    datePattern: string,
    accountPattern: string,
    totalAmountPattern: string,
    netAmountPattern?: string,
    gstAmountPattern?: string,
    invoicePattern?: string) {
    this.expense = expense
    this.datePattern = [new RegExp(datePattern)]
    this.accountPattern = [new RegExp(accountPattern)]
    this.totalAmountPattern = [new RegExp(totalAmountPattern)]
    this.netAmountPattern = []
    if (netAmountPattern) {
      this.netAmountPattern.push(new RegExp(netAmountPattern))
    }
    this.gstAmountPattern = []
    if (gstAmountPattern) {
      this.gstAmountPattern.push(new RegExp(gstAmountPattern))
    }
    this.invoicePattern = []
    if (invoicePattern) {
      this.invoicePattern.push(new RegExp(invoicePattern))
    }
  }

  combine(patterns: InvoicePatterns): void {
    this.datePattern = this.datePattern.concat(patterns.datePattern)
    this.accountPattern = this.accountPattern.concat(patterns.accountPattern)
    this.totalAmountPattern = this.totalAmountPattern.concat(patterns.totalAmountPattern)
    this.netAmountPattern = this.netAmountPattern.concat(patterns.netAmountPattern)
    this.gstAmountPattern = this.gstAmountPattern.concat(patterns.gstAmountPattern)
    this.invoicePattern = this.invoicePattern.concat(patterns.invoicePattern)
  }

  matchDate(text: string): null | string {
    return this.match(text, this.datePattern)
  }

  matchAccount(text: string): null | string {
    return this.match(text, this.accountPattern)
  }

  matchTotalAmount(text: string): null | string {
    return this.match(text, this.totalAmountPattern)
  }

  matchNetAmountPattern(text: string): null | string {
    return this.match(text, this.netAmountPattern)
  }

  matchGstAmountPattern(text: string): null | string {
    return this.match(text, this.gstAmountPattern)
  }

  matchInvoicePattern(text: string): null | string {
    return this.match(text, this.invoicePattern)
  }

  match(text: string, patterns: RegExp[]): null | string {
    for (const pattern in patterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }
}
