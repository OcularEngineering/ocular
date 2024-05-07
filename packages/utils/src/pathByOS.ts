const fg = require("fast-glob");

export function pathByOS(path: string): string {
  if (process.platform === "win32") {
    return fg.convertPathToPattern(path);
  }
  return path;
}
