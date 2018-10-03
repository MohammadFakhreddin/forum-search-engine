import * as PythonShell from 'python-shell'
import { EnvironmentVariables, PythonExecuterAddress } from './../Config'
import { Logger } from './../utils/Logger'

export class PythonMethods {
  public static tokenize(value: string): Promise<{
    err?: any,
    res?: string[]
  }> {
    return new Promise((resolve) => {
      const options = {
        args: [value],
        mode: 'text',
        scriptPath: EnvironmentVariables.pythonScriptAddress,
        pythonOptions: ['-u'],
        pythonPath: PythonExecuterAddress
      }
      PythonShell.run(EnvironmentVariables.pythonScriptName, options, async (pythonErr, pythonRes) => {
        if (pythonErr) {
          resolve({err: pythonErr})
          return
        }
        try {
          const parsedRes = JSON.parse(pythonRes)
          resolve({res: parsedRes})
        } catch (exception) {
          Logger.handleError(exception)
          resolve({err: exception})
        }
      })
    })
  }
}
