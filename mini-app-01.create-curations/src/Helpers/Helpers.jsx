import { store } from "../Store/Store";
import { finalizeEvent, nip19 } from "nostr-tools";
import axios from "axios";
import { ndkInstance } from "./NDKInstance";

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

export const getSubData = async (filter, timeout = 1000) => {
  if (!filter || filter.length === 0) return { data: [], pubkeys: [] };

  return new Promise((resolve, reject) => {
    let events = [];
    let pubkeys = [];

    let filter_ = filter.map((_) => {
      let temp = { ..._ };
      if (!_["#t"]) {
        delete temp["#t"];
        return temp;
      }
      return temp;
    });

    let sub = ndkInstance.subscribe(filter_, {
      cacheUsage: "CACHE_FIRST",
      groupable: false,
      skipVerification: true,
      skipValidation: true,
    });
    let timer;

    const startTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        sub.stop();
        resolve({
          data: sortEvents(events),
          pubkeys: [...new Set(pubkeys)],
        });
      }, timeout);
    };

    sub.on("event", (event) => {
      pubkeys.push(event.pubkey);
      events.push(event.rawEvent());
      startTimer();
    });

    startTimer();
  });
};

export const getUser = (pubkey) => {
  const store_ = store.getState();
  const nostrAuthors = store_.nostrAuthors;
  return nostrAuthors.find((item) => item.pubkey === pubkey);
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

  event = finalizeEvent(event, pubkey);

  let encodeB64 = encodeBase64URL(JSON.stringify(event));
  let fd = new FormData();
  fd.append("file", file);
  try {
    let imageURL = await axios.post(endpoint, fd, {
      headers: {
        "Content-Type": "multipart/formdata",
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
    store.dispatch(
      setToast({
        type: 2,
        desc: t("AOKDMRt"),
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
            borderRadius: "var(--border-r-18)",
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
            borderRadius: "var(--border-r-18)",
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
        className="sc-s-18"
        style={{ border: "none", aspectRatio: "16/9" }}
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

export const sortByKeyword = (array, keyword) => {
  return array
    .filter((_) => _.display_name || _.name)
    .sort((a, b) => {
      const aHasNip05 = a.nip05 ? 1 : 0;
      const bHasNip05 = b.nip05 ? 1 : 0;

      const nameA = a.display_name?.toLowerCase() || a.name?.toLowerCase();
      const nameB = b.display_name?.toLowerCase() || b.name?.toLowerCase();

      const aKeywordPriority = nameA
        .toLowerCase()
        .startsWith(keyword.toLowerCase())
        ? 2
        : nameA.toLowerCase().includes(keyword.toLowerCase())
        ? 1
        : 0;
      const bKeywordPriority = nameB
        .toLowerCase()
        .startsWith(keyword.toLowerCase())
        ? 2
        : nameB.toLowerCase().includes(keyword.toLowerCase())
        ? 1
        : 0;

      const scoreA = getLevenshteinDistance(nameA, keyword.toLowerCase());
      const scoreB = getLevenshteinDistance(nameB, keyword.toLowerCase());

      const aScore = 0 + aKeywordPriority + aHasNip05;
      const bScore = 0 + bKeywordPriority + bHasNip05;

      if (aScore !== bScore) return bScore - aScore;
      if (aHasNip05 !== bHasNip05) return bHasNip05 - aHasNip05;
      return scoreB - scoreA;
    });
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

const getLevenshteinDistance = (a, b) => {
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const matrix = Array.from({ length: lenA + 1 }, (_, i) =>
    Array(lenB + 1).fill(0)
  );

  for (let i = 0; i <= lenA; i++) matrix[i][0] = i;
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[lenA][lenB];
};

export const getParsedRepEvent = (event) => {
  try {
    let content = {
      id: event.id,
      pubkey: event.pubkey,
      kind: event.kind,
      content: event.content,
      created_at: event.created_at,
      tags: event.tags,
      author: getEmptyuserMetadata(event.pubkey),
      title: [34235, 34236, 30033].includes(event.kind) ? event.content : "",
      description: "",
      image: "",
      imagePP: "",
      published_at: event.created_at,
      contentSensitive: false,
      d: "",
      client: "",
      items: [],
      tTags: [],
      seenOn: event.onRelays
        ? [...new Set(event.onRelays.map((relay) => relay.url))]
        : [],
    };
    for (let tag of event.tags) {
      if (tag[0] === "title") {
        content.title = tag[1];
      }
      if (["image", "thumbnail", "thumb"].includes(tag[0])) {
        content.image = tag[1];
      }
      if (["description", "excerpt", "summary"].includes(tag[0])) {
        content.description = tag[1];
      }
      if (tag[0] === "d") {
        content.d = tag[1];
      }
      if (tag[0] === "published_at") {
        content.published_at = parseInt(tag[1]);
      }
      if (tag[0] === "client") {
        if (tag.length >= 3 && tag[2].includes("31990")) {
          content.client = tag[2];
        }
        if ((tag.length >= 3 && !tag[2].includes("31990")) || tag.length < 3)
          content.client = tag[1];
      }
      if (tag[0] === "L" && tag[1] === "content-warning")
        content.contentSensitive = true;
      if (
        tag[0] === "a" ||
        tag[0] === "e" ||
        tag[0] === "r" ||
        tag[0] === "t"
      ) {
        content.items.push(tag[1]);
      }
      if (tag[0] === "t") {
        content.tTags.push(tag[1]);
      }
    }
    content.naddr = content.d
      ? nip19.naddrEncode({
          pubkey: event.pubkey,
          identifier: content.d,
          kind: event.kind,
        })
      : "";
    content.naddrData = {
      pubkey: event.pubkey,
      identifier: content.d,
      kind: event.kind,
    };
    content.aTag = `${event.kind}:${event.pubkey}:${content.d}`;

    return content;
  } catch (err) {
    console.log(err);
    return false;
  }
};
