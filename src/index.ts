import {ChildProcess, exec, spawn} from "child_process";
import * as argv from 'yargs';

const DEBUG = false;

function forceKillProcess(p: ChildProcess) { process.kill(-p.pid, 'SIGKILL'); }

const args =
    argv.usage(
            'Usage: ./index.js --cmd [string] --arguments [string] --cwd [string] --nodeProcessWrapperTimeout [milliseconds]')
        .option('cmd', {required : true, string : true})
        .option('arguments', {required : true, string : true})
        .option('cwd', {required : true, string : true})
        .option('nodeProcessWrapperTimeout', {required : true, number : true})
        .argv;

// arguments are passed to node-process-wrappel as as [args....]
const pArgs = args.arguments.substring(1, args.arguments.length - 1);
if (DEBUG) {
  console.log(`Calling ${args.cmd} ${pArgs.split(" ")} with cwd ${args.cwd}`);
  console.log(`Timeout set to ${args.nodeProcessWrapperTimeout}`);
}

const spawnArgs = [ '-c', `${args.cmd} ${pArgs}` ];
if (process.env.INJECT_NODEPROF){
  process.env.PATH = `${process.env.INSTRUMENTED_NODE_LOC}:${process.env.PATH}`;
}

//@ts-ignore
const p = spawn('bash', spawnArgs,
                {cwd : args.cwd, env : process.env, detached : true});

p.stdout.on('data', (data) => { process.stdout.write(`${data}`); });

p.stderr.on('data', (data) => { process.stderr.write(`${data}`); });

p.on('close', (code) => {
  if (DEBUG) {
    console.log('close event fired');
  }
  if (p.connected) {
    forceKillProcess(p);
  }
  process.exit(code);
});

setTimeout(() => {
  console.log(
      'nodeProcessWrapperTimeout event fired. Forcing termination of process');
  forceKillProcess(p);
}, args.nodeProcessWrapperTimeout);

process.on('SIGTERM', () => {forceKillProcess(p)});

process.on('SIGINT', () => {forceKillProcess(p)});

process.on('SIGHUP', () => {forceKillProcess(p)});

// Call to get debug output from spawns
function debugSpawn() {
  var childProcess = require("child_process");
  var oldSpawn = childProcess.spawn;
  function mySpawn() {
    console.log('spawn called');
    console.log(arguments);
    //@ts-ignore
    var result = oldSpawn.apply(this, arguments);
    return result;
  }
  childProcess.spawn = mySpawn;
};
