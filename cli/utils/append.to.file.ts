import { ShellString } from "shelljs"

export type AppendToFile = (msg: string, file: string) => void

export default function provideAppendToFile() {
  return function appendToFile(msg: string, filename: string) {
    new ShellString(`${msg}\n`).toEnd(filename)
  }
}