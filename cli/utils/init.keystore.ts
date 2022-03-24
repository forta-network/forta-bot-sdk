import fs from "fs";
import shelljs from "shelljs";
import { assertExists, assertIsNonEmptyString, assertShellResult } from ".";

// ensures that keystore folder exists (~/.forta)
export type InitKeystore = () => Promise<void>;

export default function provideInitKeystore(
  shell: typeof shelljs,
  filesystem: typeof fs,
  fortaKeystore: string
): InitKeystore {
  assertExists(shell, "shell");
  assertExists(filesystem, "filesystem");
  assertIsNonEmptyString(fortaKeystore, "fortaKeystore");

  return async function initKeystore() {
    // make sure keystore folder exists
    if (!filesystem.existsSync(fortaKeystore)) {
      const createKeystoreResult = shell.mkdir(fortaKeystore);
      assertShellResult(
        createKeystoreResult,
        `Error creating keystore folder ${fortaKeystore}`
      );
    }
  };
}
