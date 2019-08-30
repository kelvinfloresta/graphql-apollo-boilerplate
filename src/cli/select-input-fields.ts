import inquirer = require('inquirer')

export default async function promptSelectFields (fields, fieldType: string): Promise<string[]> {
  const QUESTIONS = [
    {
      name: 'fields',
      type: 'checkbox',
      message: 'Select ' + fieldType + ' fields:',
      choices: fields.map(f => ({ name: f.name }))
    }
  ]

  const answers = await inquirer.prompt(QUESTIONS)
  return answers['fields']
}
