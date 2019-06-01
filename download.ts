function downloadInvoices(): void {
  const startDate = getStartDate()
  const endDate = getEndDate()
  const financialYear = endDate.getYear()
  // @ts-ignore
  console.log('Financial year: %s', financialYear)
  const invoiceLabels = getInvoiceLabels()
  const financeFolder = getFinanceFolder(financialYear)
  invoiceLabels.forEach((label): void => {
    downloadInvoicesForLabel(label.getName(), startDate.searchString, endDate.searchString, financeFolder)
  })
}

function downloadInvoicesForLabel(label: string, start: string, end: string, financeFolder: Folder): void {
  const folder = getOrCreateChildFolderPath(financeFolder, label)
  const files = folder.getFiles()
  let attachments = getAttachmentsForLabel(label, start, end)
  while (files.hasNext()) {
    const fileName = files.next().getName()
    // @ts-ignore
    console.log('Existing invoice: %s', fileName)
    attachments = attachments.filter((attachment): boolean => attachment.getName() !== fileName)
  }
  attachments.forEach((attachment): void => {
    // @ts-ignore
    console.log('Saving invoice: %s', attachment.getName())
    // FIXME: GmailAttachment does implement BlobSource.
    // @ts-ignore
    folder.createFile(attachment)
  })
}

