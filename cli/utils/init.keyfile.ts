import prompts from "prompts";
import { assertExists, assertIsNonEmptyString } from ".";
import { CreateKeyfile } from "./create.keyfile";
import { ListKeyfiles } from "./list.keyfiles";

// create keyfile if one doesnt already exist
export type InitKeyfile = () => Promise<void>;

export default function provideInitKeyfile(
  prompt: typeof prompts,
  fortaKeystore: string,
  listKeyfiles: ListKeyfiles,
  createKeyfile: CreateKeyfile
) {
  assertExists(prompt, "prompt");
  assertIsNonEmptyString(fortaKeystore, "fortaKeystore");
  assertExists(listKeyfiles, "listKeyfiles");
  assertExists(createKeyfile, "createKeyfile");

  return async function initKeyfile() {
    const keyfiles = listKeyfiles();
    if (!keyfiles.length) {
      console.log("Creating new keyfile...");
      const { password } = await prompt({
        type: "password",
        name: "password",
        message: `Enter password to encrypt new keyfile`,
      });
      await createKeyfile(password);
    } else {
      console.log(`Found existing keyfile ${keyfiles[0]} in ${fortaKeystore}`);
    }
  };
}
