import Folder = GoogleAppsScript.Drive.Folder;

const FINANCE_FOLDER = 'Finance'

function getFinanceFolder(financialYear: string): Folder {
  const root = DriveApp.getRootFolder()
  const financeFolder = getChildFolder(root, FINANCE_FOLDER)
  return getChildFolder(financeFolder, financialYear)
}

function getChildFolder(folder: Folder, name: string): Folder {
  const child = getMaybeChildFolder(folder, name)
  if (child) {
    return child
  } else {
    throw 'Folder "' + folder.getName() + '" does not have a child folder named "' + name + '".'
  }
}

function getOrCreateChildFolder(folder: Folder, name: string): Folder {
  const child = getMaybeChildFolder(folder, name)
  return child ? child : folder.createFolder(name)
}

function getMaybeChildFolder(folder: Folder, name: string): null | Folder {
  const children = folder.getFoldersByName(name)
  if (children.hasNext()) {
    const child = children.next()
    if (children.hasNext()) {
      throw 'Folder "' + folder.getName() + '" has multiple child folders named "' + name + '".'
    } else {
      return child
    }
  } else {
    return null
  }
}

function getOrCreateChildFolderPath(folder: Folder, path: string): Folder {
  return path.split('/').reduce(getOrCreateChildFolder, folder)
}

function getDocumentText(docId: string): string {
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();
  return body.getText();
}
