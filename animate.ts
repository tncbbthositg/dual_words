import { Command } from 'commander';
import { mkdirSync, rmSync, existsSync } from 'fs';
import * as Path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

type AnimateOptions = {
  frames: number;
};

const program = new Command();

const OUTPUT_FOLDER = Path.join('.', 'output');
const TMP_FOLDER = Path.join('.', 'tmp');

function removeTempFolder() {
  rmSync(TMP_FOLDER, { force: true, recursive: true });
}

function prepareOutputFolder() {
  if (!existsSync(OUTPUT_FOLDER)) {
    mkdirSync(OUTPUT_FOLDER);
  }

  removeTempFolder();
  mkdirSync(TMP_FOLDER);
}

async function execCommand(...parts: string[]) {
  const command = parts.join(' ');
  console.log(command);

  const { stderr, stdout } = await exec(command);
  if (stderr) { console.error(stderr); }
  if (stdout ) { console.log(stdout); }
}

async function renderFrames(firstWord: string, secondWord: string, options: AnimateOptions) {
  const { frames } = options;

  const distance = -firstWord.length * 60;
  const framePattern = Path.join(TMP_FOLDER, `Frame.png`);

  const commonCommandParts = [
    'openscad',
    '--render',
    '--view axes',
    '--projection o',
    `--camera 0,${distance},50,0,0,0`,
    '--imgsize 1920,1080',
    `-D 'first_word=\"${firstWord}\"'`,
    `-D 'second_word=\"${secondWord}\"'`,
    'DualWords.scad',
  ];

  const finalFrame = `${frames - 1}`.padStart(5, '0');
  const finalFrameFile = Path.join(TMP_FOLDER, `Frame${finalFrame}.png`);

  await execCommand(...commonCommandParts, `-o ${framePattern}`, `--animate ${frames - 1}`);
  await execCommand(...commonCommandParts, `-o ${finalFrameFile}`, `-D '$t=1'`);
}

async function createVideo(firstWord: string, secondWord: string) {
  const inputFileName = Path.join(TMP_FOLDER, `Frame%5d.png`);
  const outputFileName = Path.join(OUTPUT_FOLDER, `${firstWord}_${secondWord}.mp4`);

  rmSync(outputFileName, { force: true });

  const command = [
    'ffmpeg',
    '-framerate 30',
    `-i ${inputFileName}`,
    outputFileName
  ];

  await execCommand(...command);
};

async function animate(firstWord: string, secondWord: string, options: AnimateOptions) {
  prepareOutputFolder();

  const { frames } = options;
  if (frames < 1) { throw new Error('Must export at least 1 frame.'); }

  await renderFrames(firstWord, secondWord, options);
  await createVideo(firstWord, secondWord);

  removeTempFolder();
}

program
  .name('Dual Words Animator')
  .description('Animate the dual words model.')
  .argument('<firstWord>', 'First word')
  .argument('<secondWord>', 'Second word')
  .option('-n, --frames <frames>', 'number of frames',(v: string, _: any) => parseInt(v), 90)
  .action(animate);

program.parse();
