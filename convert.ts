import SchemaFile = GoogleAppsScript.Drive.Schema.File;
import File = GoogleAppsScript.Drive.File;
import FileIterator = GoogleAppsScript.Drive.FileIterator;

const CONVERTED_PROPERTY_KEY = 'converted';
const CONVERTED_FROM_PROPERTY_KEY = 'convertedFrom';
const CONVERTED_PROPERTIES_SEARCH_STRING = 'properties has { key=\'' + CONVERTED_PROPERTY_KEY + '\' and value=\'true\' and visibility=\'PRIVATE\' }';
const LANGUAGE = 'en-NZ';

function convertInvoices(): void {
  convertInvoicesInFolder(invoicesFolder());
}

function invoicesFolder(): Folder {
  const endDate = getEndDate();
  const financialYear = endDate.getYear();
  const financeFolder = getFinanceFolder(financialYear);
  return getChildFolder(financeFolder, INVOICES_FOLDER);
}

function convertInvoicesInFolder(folder): void {
  const files = folder.searchFiles('not ' + CONVERTED_PROPERTIES_SEARCH_STRING);
  const converted = convertedInvoiceIds(folder);
  while (files.hasNext()) {
    const file = files.next();
    const id = file.getId();
    if (arrayContains(converted, id)) {
      // @ts-ignore
      console.log('Converted already: %s (%s)', file.getName(), id);
    } else {
      convertInvoice(file , file.getName() + '.txt');
    }
  }
  const childFolders = folder.getFolders();
  while (childFolders.hasNext()) {
    convertInvoicesInFolder(childFolders.next());
  }
}

function convertedInvoiceIds(folder: Folder): string[] {
  const args = {
    q: '\'' + folder.getId() + '\' in parents and trashed=false and ' + CONVERTED_PROPERTIES_SEARCH_STRING
  };
  const conversions = Drive.Files.list(args);
  return conversions.items.map(convertedFromProperty);
}

function convertedFromProperty(file: SchemaFile): string {
  const property = file.properties.find((property): boolean => property.key === CONVERTED_FROM_PROPERTY_KEY)
  if (property) {
    return property.value
  } else {
    throw 'File "' + file.id + '" did not contain the ' + CONVERTED_FROM_PROPERTY_KEY + ' property but it has been converted.';
  }
}

function convertInvoice(file: File, name: string): void {
  const id = file.getId();
  // @ts-ignore
  console.log('Converting file: %s (%s)', file.getName(), id);
  const body = {
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
  const args = {
    ocr: true,
    ocrLanguage: LANGUAGE
  };
  const result = Drive.Files.copy(body, id, args);
  // @ts-ignore
  console.log('Converted file to: %s (%s)', name, result.id);
}

class Invoices {

  expense: string
  folder: Folder
  files: FileIterator

  constructor(expense: string, folder: Folder, files: FileIterator) {
    this.expense = expense
    this.folder = folder
    this.files = files
  }
}

function getConvertedExpenseInvoices(folder: Folder): {} {
  const loop = (folder: Folder, results: {}): {} => {
    const expense = folder.getName()
    const files = folder.searchFiles(CONVERTED_PROPERTIES_SEARCH_STRING)
    if (files.hasNext()) {
      results[expense] = new Invoices(expense, folder, files)
    }
    const childFolders = folder.getFolders()
    while (childFolders.hasNext()) {
      loop(childFolders.next(), results)
    }
    return results
  }
  return loop(folder, {})
}
