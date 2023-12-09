import {exec} from "child_process";

export const execute = (cmd: string, options?: object): Promise<void> =>
  new Promise((resolve, reject) => {
    exec(cmd, options, (err, stdout, stderr) => {
      if (err) {
        reject(stderr);
      } else {
        resolve();
      }
    });
  });