import { join } from "path";
import fs from "fs";
import shelljs from "shelljs";
import { assertExists, assertIsNonEmptyString, assertShellResult } from ".";
import {stringify, assign} from "comment-json";
import { GetFortaConfig } from "./get.forta.config";

// create global forta.config.json if doesnt already exist
export type InitConfig = () => Promise<void>;

export default function provideInitConfig(
  shell: typeof shelljs,
  filesystem: typeof fs,
  fortaKeystore: string,
  configFilename: string,
  agentId: string,
  getFortaConfig: GetFortaConfig
) {
  assertExists(shell, "shell");
  assertExists(filesystem, "filesystem");
  assertIsNonEmptyString(fortaKeystore, "fortaKeystore");
  assertIsNonEmptyString(configFilename, "configFilename");

  return async function initConfig() {
    const filePath = join(fortaKeystore, configFilename);
    if (!filesystem.existsSync(filePath)) {
      // Create file
      console.log(`Creating ${configFilename}...`);
      const copyConfigResult = shell.cp(
        join(__dirname, "..", "commands", "init", configFilename),
        fortaKeystore
      );
      assertShellResult(copyConfigResult, `Error creating ${configFilename}`);

      const fortaCon = getFortaConfig();

      // Save initial forta config
      console.log(`Saving agentId: ${agentId} in forta.congif.js`);
      
      const data = assign({agentId}, fortaCon);
      fs.writeFileSync(filePath, stringify(data, undefined, 1))
    } else {
      console.log(`Found existing ${configFilename} in ${fortaKeystore}`);
    }
  };
}
