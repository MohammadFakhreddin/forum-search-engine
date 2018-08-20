export class CommonValidator {
  public static isNullOrEmpty(value: string | number): boolean {
    if (value == null) {
      return true
    }
    if (typeof value === 'string') {
      return(String(value).trim() === '' || String(value).trim() === 'null' || String(value).trim() === 'undefined')
    }
    if (typeof value === 'number') {
      return false
    }
    return true
  }
  public static isEmptyArray(value: any[]): boolean {
    return (value == null || CommonValidator.isArray(value) === false || value.length === 0)
  }
  public static compareArray(array1: any[], array2: any[]): boolean {
    if (array1 == null) {
      if (array2 == null) {
        return true
      }
      return false
    }
    if (array1.length !== array2.length) {
      return false
    }
    for (const currentSearchValue of array1)  {
      if (array2.filter((value) => value === currentSearchValue).length === 0) {
        return false
      }
    }
    return true
  }
  public static isEmptyMap(value: Map<any, any>): boolean {
    return (value == null || value.size === 0)
  }
  public static isArray(value: any): boolean {
    return value != null && value.constructor === Array
  }
}

export class ProfileValidator {
  public static isEmail(value: string): boolean {
    return ProfileValidator.emailPattern.test(value)
  }
  public static isPhoneNumber(value: string): (boolean) {
    return ProfileValidator.phonePattern.test(value)
  }
  private static emailPattern: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  private static phonePattern: RegExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4,7})$/
}
