import inquirer = require('inquirer')

export default async function promptConfirm (message = 'Do you want confirm?'): Promise<boolean> {
  const QUESTIONS = [
    {
      name: 'confirm',
      type: 'confirm',
      message: message
    }
  ]
  const { confirm } = await inquirer.prompt(QUESTIONS)
  return confirm
}
