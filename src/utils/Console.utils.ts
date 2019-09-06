import chalk from 'chalk'
import { isProduction } from 'apollo-utilities'
import figlet = require('figlet')
import clear = require('clear')

export function displayStart (text): void {
  figlet('Application Name', {
    font: 'Fire Font-k'
  }, (err: Error, data: any) => {
    if (err) throw err
    clear()
    console.log(chalk.red(data))
    console.log(`Graphql server started on: ${chalk.bgYellow.black(` ${text} `)}`)
    if (isProduction()) {
      console.log(chalk.bold.bgRed.white(' PRODUCTION '))
    }
  })
}
