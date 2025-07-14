import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import relaysOnPlatform from "./relays";

const ndkInstance = new NDK({ explicitRelayUrls: relaysOnPlatform });
ndkInstance.connect();
ndkInstance.cacheAdapter = new NDKCacheAdapterDexie({ dbName: "ndk-store" });

export default ndkInstance; 