function noLaterThanNow(date: Date): Date {
  const now = new Date()
  return now < date ? now : date
}

function calendarDate(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return year + '/' + month + '/' + day
}

function arrayContains<T>(array: T[], item: T): boolean {
  return array.indexOf(item) !== -1
}

function forEach(object: any, f: (any, string) => void) {
  for (const property in object) {
    if (object.hasOwnProperty(property)) {
      f(object[property], property)
    }
  }
}