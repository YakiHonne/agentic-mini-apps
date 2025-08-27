import React, { useEffect, useState } from "react";
import { nip19 } from "nostr-tools";
import SWhandler from "smart-widget-handler";
import LoadingDots from "./LoadingDots";
import { useDispatch } from "react-redux";
import { setToast } from "../Store/Slides/StoreSlides";
import AddVideo from "./AddVideo";

export default function Videos() {
  const dispatch = useDispatch();
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userMetadata, setUserMetada] = useState(false);
  const [hostOrigin, setHostOrigin] = useState(false);
  const [errMsg, setErrMsg] = useState(
    "This app needs a supported NOSTR client"
  );
  const [publishedEventNaddr, setPublishedEventNaddr] = useState("");

  useEffect(() => {
    SWhandler.client.ready();
  }, []);

  useEffect(() => {
    let listener = SWhandler.client.listen((event) => {
      if (event.kind === "user-metadata") {
        setUserMetada(event.data?.user);
        setHostOrigin(event.data?.host_origin);
        setIsUserLoading(false);
      }
      if (event.kind === "err-msg") {
        setErrMsg(event.data);
        setIsUserLoading(false);
      }
      if (event.kind === "nostr-event") {
        setLoading(false);
        let { pubkey, id } = event.data?.event || {};
        if (!(pubkey && id)) {
          dispatch(
            setToast({
              type: 2,
              desc: "Falty data has been received!",
            })
          );
        } else {
          let nEvent = nip19.neventEncode({
            id,
            pubkey,
          });
          setPublishedEventNaddr(nEvent);
          SWhandler.client.sendContext(nEvent, hostOrigin);
        }
      }
    });

    let timer = setTimeout(() => {
      setIsUserLoading(false);
      clearTimeout(timer);
    }, 3000);

    return () => {
      listener?.close();
      clearTimeout(timer);
    };
  }, [hostOrigin]);

  const copyKey = () => {
    navigator.clipboard.writeText(publishedEventNaddr);
    dispatch(
      setToast({
        type: 1,
        desc: `nEvent was copied 👏`,
      })
    );
  };

  const signEvent = (tempEvent) => {
    if (hostOrigin) SWhandler.client.requestEventPublish(tempEvent, hostOrigin);
  };

  if (isUserLoading)
    return (
      <div
        className="fit-container fx-centered fx-col box-pad-h box-pad-v"
        style={{ height: "500px" }}
      >
        Connecting <LoadingDots />
      </div>
    );

  if (!isUserLoading && !userMetadata)
    return (
      <div
        className="fit-container fx-centered fx-col box-pad-h box-pad-v"
        style={{ height: "500px" }}
      >
        <div className="round-icon">
          <div className="plus-sign-24" style={{ rotate: "45deg" }}></div>
        </div>
        <h4 className="p-centered">{errMsg}</h4>
      </div>
    );

  return (
    <div
      className="fit-container fx-centered fx-col box-pad-h box-pad-v"
      style={{ gap: 0 }}
    >
      <h4 className="box-marg-s">Create a video</h4>
      {userMetadata && (
        <div className="fit-container fx-centered sc-s-18 bg-sp box-pad-h-s box-pad-v-s fx-start-h">
          <div
            style={{
              minWidth: "40px",
              minHeight: "40px",
              backgroundImage: `url(${userMetadata?.picture})`,
            }}
            className="bg-img cover-bg sc-s"
          ></div>
          <div>
            <div className="fx-centered">
              <p>{userMetadata?.display_name || userMetadata?.name}</p>
              <div className="fx-centered" style={{ gap: "5px" }}>
                <p className="green-c p-big">&#8226;</p>
                <p className="green-c p-medium">Connected</p>
              </div>
            </div>
            <p className="gray-c p-medium">
              @{userMetadata?.name || userMetadata?.display_name}
            </p>
          </div>
        </div>
      )}
      {publishedEventNaddr && (
        <div className="fit-container fx-centered fx-col box-pad-v">
          <div
            className="fx-scattered if pointer dashed-onH fit-container"
            style={{ borderStyle: "dashed" }}
            onClick={() => copyKey()}
          >
            <p className="p-one-line">{publishedEventNaddr}</p>
            <div className="copy-24"></div>
          </div>
          <button className="btn btn-normal btn-full" onClick={reset}>
            Publish another
          </button>
        </div>
      )}
      {!publishedEventNaddr && (
        <AddVideo userPubkey={userMetadata?.pubkey} signEvent={signEvent} />
      )}
    </div>
  );
}
