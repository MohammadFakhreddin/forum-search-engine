export const graphqlStringify = (object: any) => {
  return JSON.stringify(object).replace(/\\"/g, '\uFFFF').replace(/\"([^"]+)\":/g, '$1:').replace(/\uFFFF/g, '\\"')
}
