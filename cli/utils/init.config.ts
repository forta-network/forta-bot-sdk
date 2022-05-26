import { join } from "path";
import fs from "fs";
import shelljs from "shelljs";
import { assertExists, assertIsNonEmptyString, assertShellResult } from ".";
import { jsonc } from 'jsonc';
import { v4 as uuidv4 } from 'uuid';
import { FortaConfig, keccak256 } from "../../sdk";

// create global forta.config.json if doesnt already exist
export type InitConfig = () => Promise<void>;

export default function provideInitConfig(
  shell: typeof shelljs,
  filesystem: typeof fs,
  fortaKeystore: string,
  configFilename: string,
  contextPath: string
) {
  assertExists(shell, "shell");
  assertExists(filesystem, "filesystem");
  assertIsNonEmptyString(fortaKeystore, "fortaKeystore");
  assertIsNonEmptyString(configFilename, "configFilename");
  assertIsNonEmptyString(contextPath, "contextPath");
  

  return async function initConfig() {
    const filePath = join(fortaKeystore, configFilename);
    const localFilePath = join(contextPath, configFilename);

    if (!filesystem.existsSync(filePath)) {
      // Create global file
      console.log(`Creating ${configFilename}...`);
      const copyConfigResult = shell.cp(
        join(__dirname, "..", "commands", "init", configFilename),
        fortaKeystore
      );
      assertShellResult(copyConfigResult, `Error creating ${configFilename}`);
    } else {
      console.log(`Found existing global ${configFilename} in ${fortaKeystore}`);
    }

    // Save random agentId in initial project forta config
    const agentId = keccak256(uuidv4())
    console.log(`Saving agentId: ${agentId} in project ${configFilename}`);

    const data: FortaConfig = { agentId };
    filesystem.writeFileSync(localFilePath, jsonc.stringify(data))
  };
}
