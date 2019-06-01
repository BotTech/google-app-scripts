import GmailLabel = GoogleAppsScript.Gmail.GmailLabel
import GmailMessage = GoogleAppsScript.Gmail.GmailMessage;
import GmailAttachment = GoogleAppsScript.Gmail.GmailAttachment;

const INVOICES_FOLDER = 'Invoices'
// This currently only works if the label is the same as the invoices folder.
const INVOICES_LABEL_PREFIX = INVOICES_FOLDER + '/'
const ATTACHMENT_OPTIONS = {
  includeInlineImages: false,
  includeAttachments: true
}

function isInvoiceLabel(label: GmailLabel): boolean {
  return label.getName().indexOf(INVOICES_LABEL_PREFIX) === 0
}

function getInvoiceLabels(): GmailLabel[] {
  const labels = GmailApp.getUserLabels()
  const invoiceLabels = labels.filter(isInvoiceLabel)
  invoiceLabels.forEach((label): void => {
    // @ts-ignore
    console.log('Invoice label: %s', label.getName())
  })
  return invoiceLabels
}

function getAttachmentsForLabel(label: string, start: string, end: string): GmailAttachment[] {
  const messages = getMessagesForLabel(label, start, end);
  const attachments = messages.reduce(
    (attachments, message): GmailAttachment[] =>
      attachments.concat(message.getAttachments(ATTACHMENT_OPTIONS)),
    []
  )
  attachments.forEach((attachment): void => {
    // @ts-ignore
    console.log('Attachment: %s', attachment.getName())
  })
  return attachments;
}

function getMessagesForLabel(label: string, start: string, end: string): GmailMessage[] {
  const query = 'label:"' + label + '" after:' + start + ' -after:' + end + '';
  // @ts-ignore
  console.log('Searching for: %s', query);
  const threads = GmailApp.search(query);
  // @ts-ignore
  console.log('Found %s results.', threads.length);
  return threads.reduce(
    (messages, thread): GmailMessage[] => messages.concat(thread.getMessages()),
    []
  )
}

