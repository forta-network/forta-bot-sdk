import { join } from "path";
import fs from "fs";
import shelljs from "shelljs";
import { assertExists, assertIsNonEmptyString, assertShellResult } from ".";

// create global forta.config.json if doesnt already exist
export type InitConfig = () => Promise<void>;

export default function provideInitConfig(
  shell: typeof shelljs,
  filesystem: typeof fs,
  fortaKeystore: string,
  configFilename: string
) {
  assertExists(shell, "shell");
  assertExists(filesystem, "filesystem");
  assertIsNonEmptyString(fortaKeystore, "fortaKeystore");
  assertIsNonEmptyString(configFilename, "configFilename");

  return async function initConfig() {
    if (!filesystem.existsSync(join(fortaKeystore, configFilename))) {
      console.log(`Creating ${configFilename}...`);
      const copyConfigResult = shell.cp(
        join(__dirname, configFilename),
        fortaKeystore
      );
      assertShellResult(copyConfigResult, `error creating ${configFilename}`);
    } else {
      console.log(`Found existing ${configFilename} in ${fortaKeystore}`);
    }
  };
}
