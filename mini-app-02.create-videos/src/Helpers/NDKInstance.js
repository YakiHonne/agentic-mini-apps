import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import relaysOnPlatform from "../Content/Relays";

const ndkInstance = new NDK({
  explicitRelayUrls: relaysOnPlatform,
});

await ndkInstance.connect();

ndkInstance.cacheAdapter = new NDKCacheAdapterDexie({ dbName: "ndk-store" });

export { ndkInstance };

export const addExplicitRelays = (relayList) => {
  try {
    if (!Array.isArray(relayList)) return;
    let tempRelayList = relayList.filter(
      (relay) => !ndkInstance.explicitRelayUrls.includes(`${relay}`)
    );
    if (tempRelayList.length === 0) return;
    for (let relay of tempRelayList) {
      ndkInstance.addExplicitRelay(relay, undefined, true);
    }
  } catch (err) {
    console.log(err);
  }
};
