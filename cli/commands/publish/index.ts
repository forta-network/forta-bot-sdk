import { CommandHandler } from "../..";
import { assertExists } from "../../utils";
import { GetCredentials } from "../../utils/get.credentials";
import { UploadImage } from "./upload.image";
import { UploadManifest } from "./upload.manifest";
import { PushToRegistry } from "./push.to.registry";
import { Wallet } from "ethers";

export default function providePublish(
  getCredentials: GetCredentials,
  uploadImage: UploadImage,
  uploadManifest: UploadManifest,
  pushToRegistry: PushToRegistry,
  external: boolean
): CommandHandler {
  assertExists(getCredentials, "getCredentials");
  assertExists(uploadImage, "uploadImage");
  assertExists(uploadManifest, "uploadManifest");
  assertExists(pushToRegistry, "pushToRegistry");

  return async function publish() {
    let imageReference;
    // external bots do not have docker images so no need to upload one
    if (!external) {
      imageReference = await uploadImage();
    }
    const { privateKey } = await getCredentials();
    const manifestReference = await uploadManifest(imageReference, privateKey);
    await pushToRegistry(manifestReference, new Wallet(privateKey));
  };
}
