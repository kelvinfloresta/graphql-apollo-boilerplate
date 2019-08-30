import chalk from 'chalk'
import figlet = require('figlet')
import clear = require('clear')

export function isProduction (): boolean {
  return process.env.NODE_ENV === 'production'
}

export function displayStart (text): void {
  figlet('On Fire', {
    font: 'Fire Font-k'
  }, (err: Error, data: any) => {
    if (err) throw err
    clear()
    console.log(chalk.red(data))
    console.log(`RESTful API server started on: ${chalk.bgYellow.black(` ${text} `)}`)
    if (isProduction()) {
      console.log(chalk.bold.bgRed.white(' PRODUCTION '))
    }
  })
}
