#!/usr/bin/env node

import { Command } from 'commander';
import inquirer, { InputQuestion, PasswordQuestion, ListQuestion } from 'inquirer';

const program = new Command();

program
  .name('cli-poc')
  .description('A POC for a CLI app')
  .version('1.0.0');

program
  .command('cli')
  .description('Operator Cli')
  .action(async () => {
    const questions:(InputQuestion | PasswordQuestion | ListQuestion)[] = [
      {
        type: 'input',
        name: 'username',
        message: 'What is your name',
      } as InputQuestion,
      {
        type: 'password',
        name: 'password',
        message: 'Enter your password:',
      }as PasswordQuestion,
      {
        type: 'list',
        name: 'command',
        message: 'What would you like to do?',
        choices: ['Start Operator', 'Start Challenger', 'Data Sync'],
      }as ListQuestion,
      {
        type: 'list',
        name: 'network',
        message: 'What network would you like to use?',
        choices: ['Arbitrum One', 'Arbitrum Sepolia'],
      }as ListQuestion,
    ];

    const answers = await inquirer.prompt(questions);

    console.log(`Hello, ${answers.username}!`);
    console.log(`You successfully ran the ${answers.command} command on ${answers.network}.`);
  });

program.parse(process.argv);
