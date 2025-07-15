import { store } from "../Store/store";
import { finalizeEvent, nip19 } from "nostr-tools";
import axios from "axios";
import { addToast } from "../Store/toastSlice";

export const getEmptyuserMetadata = (pubkey) => {
  return {
    name: nip19.npubEncode(pubkey).substring(0, 10),
    display_name: nip19.npubEncode(pubkey).substring(0, 10),
    picture: "",
    banner: "",
    about: "",
    lud06: "",
    lud16: "",
    nip05: "",
    website: "",
    pubkey,
    created_at: 0,
  };
};

export const getParsedAuthor = (data) => {
  let content = JSON.parse(data.content) || {};
  let tempAuthor = {
    display_name:
      content?.display_name || content?.name || data.pubkey.substring(0, 10),
    name:
      content?.name || content?.display_name || data.pubkey.substring(0, 10),
    picture: content?.picture || "",
    pubkey: data.pubkey,
    banner: content?.banner || "",
    about: content?.about || "",
    lud06: content?.lud06 || "",
    lud16: content?.lud16 || "",
    website: content?.website || "",
    nip05: content?.nip05 || "",
  };
  return tempAuthor;
};

export const sortEvents = (events) => {
  return events.sort((ev_1, ev_2) => ev_2.created_at - ev_1.created_at);
};

export const FileUpload = async (file, pubkey, cb) => {
  let endpoint = "https://nostr.build/api/v2/nip96/upload";
  let event = {
    kind: 27235,
    content: "",
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["u", endpoint],
      ["method", "POST"],
    ],
  };

  // Convert hex pubkey to Uint8Array for finalizeEvent
  const pubkeyBytes = new Uint8Array(
    pubkey.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );

  event = finalizeEvent(event, pubkeyBytes);

  let encodeB64 = encodeBase64URL(JSON.stringify(event));
  let fd = new FormData();
  fd.append("file", file);
  try {
    let imageURL = await axios.post(endpoint, fd, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Nostr ${encodeB64}`,
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (cb) cb(percentCompleted);
      },
    });

    return imageURL.data.nip94_event.tags.find((tag) => tag[0] === "url")[1];
  } catch (err) {
    console.error("File upload error:", err);
    store.dispatch(
      addToast({
        type: "error",
        message: "Failed to upload file. Please try again.",
      })
    );
    return false;
  }
};

export const getVideoFromURL = (url) => {
  const isURLVid = isVid(url);

  if (isURLVid) {
    if (isURLVid.isYT) {
      return (
        <iframe
          style={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "var(--border-radius-lg)",
          }}
          src={`https://www.youtube.com/embed/${isURLVid.videoId}`}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      );
    }
    if (!isURLVid.isYT)
      return (
        <iframe
          style={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "var(--border-radius-lg)",
          }}
          src={`https://player.vimeo.com/video/${isURLVid.videoId}`}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      );
  }
  if (!isURLVid) {
    return (
      <video
        controls={true}
        autoPlay={false}
        name="media"
        width={"100%"}
        style={{
          border: "none",
          aspectRatio: "16/9",
          borderRadius: "var(--border-radius-lg)",
        }}
      >
        <source src={url} type="video/mp4" />
      </video>
    );
  }
};

const isVid = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?|vimeo\.com\/)([^\?&]+)/;

  const match = url.match(regex);

  if (match) {
    const videoId = match[1];
    let platform = "";
    if (match[0].startsWith("https://vimeo.com")) platform = "Vimeo";
    if (match[0].includes("youtu")) platform = "YouTube";

    if (platform === "YouTube") {
      return {
        isYT: true,
        videoId,
      };
    }
    if (platform === "Vimeo") {
      return {
        isYT: false,
        videoId,
      };
    }
    return false;
  }
  return false;
};

export const getAuthPubkeyFromNip05 = async (nip05Addr) => {
  try {
    let addressParts = nip05Addr.split("@");
    if (addressParts.length === 1) {
      addressParts.unshift("_");
    }
    const data = await axios.get(
      `https://${addressParts[1]}/.well-known/nostr.json?name=${addressParts[0]}`
    );
    return data.data.names[addressParts[0]];
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const isHex = (str) => {
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(str) && str.length % 2 === 0;
};

const encodeBase64URL = (string) => {
  return btoa(string)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

// Relay connectivity check function
export const checkRelayConnectivity = async (relayUrl) => {
  return new Promise((resolve) => {
    const ws = new WebSocket(relayUrl);
    const timeout = setTimeout(() => {
      ws.close();
      resolve(false);
    }, 5000); // 5 second timeout

    ws.onopen = () => {
      clearTimeout(timeout);
      ws.close();
      resolve(true);
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
  });
};

// Check multiple relays and return healthy ones
export const getHealthyRelays = async (relays) => {
  const healthyRelays = [];
  const checks = relays.map(async (relay) => {
    const isHealthy = await checkRelayConnectivity(relay);
    if (isHealthy) {
      healthyRelays.push(relay);
    }
    return { relay, isHealthy };
  });

  await Promise.all(checks);
  return healthyRelays;
};

// Simplified event structure for fallback
export const createSimplifiedEvent = (content, tags = []) => {
  return {
    kind: 1,
    content,
    tags,
    created_at: Math.floor(Date.now() / 1000),
  };
};
