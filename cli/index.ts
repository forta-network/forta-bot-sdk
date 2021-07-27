#!/usr/bin/env node
import yargs, { Argv } from 'yargs';
import configureContainer from './di.container';

type CommandHandler = (args: any) => void

const diContainer = configureContainer();
const init = diContainer.resolve<CommandHandler>("init")
const run = diContainer.resolve<CommandHandler>("run")
const publish = diContainer.resolve<CommandHandler>("publish")

yargs
  .command('init', 'Initialize a Forta Agent project', 
    (yargs: Argv) => {
      yargs.option('typescript', {
        description: 'Initialize as Typescript project',
      })
    },
    init
  )
  .command('run', 'Run the Forta Agent with latest blockchain data',
    (yargs: Argv) => {
      yargs.option('tx', {
        description: 'Run with the specified transaction hash',
        type: 'string'
      }).option('block', {
        description: 'Run with the specified block hash/number',
        type: 'string'
      }).option('range', {
        description: 'Run with the specified block range (e.g. 15..20)',
        type: 'string'
      }).option('file', {
        description: 'Run with the specified json file',
        type: 'string'
      }).option('prod', {
        description: 'Run a server listening for events from a Forta Scanner'
      })
    },
    run
  )
  .command('publish', 'Publish the Forta Agent to the network',
    (yargs: Argv) => {},
    publish
  )
  .strict()
  .argv