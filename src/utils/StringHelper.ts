import { CommonValidator } from './RegexValidator'

export class StringHelper {
  public static getBio(longText: string, numberOfWord = 20): string {
    if (CommonValidator.isNullOrEmpty(longText)) {
      return ''
    }
    const words = longText.trim().split(' ')
    let result = ''
    for (let i = 0; i < words.length; i++) {
      result += words[i]
      if (i >= numberOfWord) {
        break
      }
    }
    return result
  }
}
