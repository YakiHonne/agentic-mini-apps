import React, { useEffect, useState } from "react";
import SWhandler from "smart-widget-handler";
import LoadingDots from "./LoadingDots";
import { nip19 } from "nostr-tools";
import { useDispatch } from "react-redux";
import { setToast } from "../Store/Slides/Publishers";

export default function ZapPoll() {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [options, setOptions] = useState([]);
  const [tempOption, setTempOption] = useState("");
  const [minSats, setMinSats] = useState("");
  const [maxSats, setMaxSats] = useState("");
  const [closedAt, setClosedAt] = useState("");
  const [isLoading, setLoading] = useState(false);
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
        setLoading(false);
        dispatch(
          setToast({
            type: 2,
            desc: event.data
          })
        );
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

  const handleChange = (e) => {
    let value = e.target.value;
    let element = e.target;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;

    setContent(value);
    if (!value || value === "\n") {
      setContent("");
      return;
    }
  };

  const handleAddOption = () => {
    if (!tempOption) return;
    setOptions((prev) => [...prev, tempOption]);
    setTempOption("");
  };

  const handleEditOption = (value, index) => {
    let tempArray = Array.from(options);
    tempArray[index] = value;
    setOptions(tempArray);
  };

  const handleDeleteOption = (index) => {
    let tempArray = Array.from(options);
    tempArray.splice(index, 1);
    setOptions(tempArray);
  };

  const postPoll = async () => {
    let closed_at = closedAt
      ? Math.floor(new Date(closedAt).getTime() / 1000)
      : false;
    let created_at = Math.floor(new Date().getTime() / 1000);

    let tempOptions = options.filter((option) => option);
    tempOptions = tempOption ? [...tempOptions, tempOption] : tempOptions;

    if (!hostOrigin) {
      dispatch(
        setToast({
          type: 3,
          desc: "Unrecognized host app",
        })
      );
      return;
    }

    if (!content) {
      dispatch(
        setToast({
          type: 3,
          desc: "The content must not be empty",
        })
      );
      return;
    }
    if (tempOptions.length <= 1) {
      dispatch(
        setToast({
          type: 3,
          desc: "The poll should have at least two options.",
        })
      );
      return;
    }
    if (closed_at && closed_at <= created_at) {
      dispatch(
        setToast({
          type: 3,
          desc: "The poll closing time must be greater than the current time",
        })
      );
      return;
    }
    if (minSats !== "" && maxSats !== "" && minSats > maxSats) {
      dispatch(
        setToast({
          type: 3,
          desc: "The maximum satoshi must be greater than the minimum satochi",
        })
      );
      return;
    }

    let tags = options.map((option, index) => [
      "poll_option",
      `${index}`,
      option,
    ]);
    tags.push(["p", userMetadata.pubkey]);
    if (closed_at) tags.push(["closed_at", `${closed_at}`]);
    if (minSats !== "") tags.push(["value_minimum", `${minSats}`]);
    if (maxSats !== "") tags.push(["value_maximum", `${maxSats}`]);

    let tempEvent = {
      kind: 6969,
      content: content,
      tags,
    };
    setLoading(true);
    SWhandler.client.requestEventPublish(tempEvent, hostOrigin);
  };

  const reset = () => {
    setPublishedEventNaddr("");
    setContent("");
    setOptions([]);
    setTempOption("");
    setMinSats("");
    setMaxSats("");
    setClosedAt("");
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

  const copyKey = () => {
    navigator.clipboard.writeText(publishedEventNaddr);
    dispatch(
      setToast({
        type: 1,
        desc: `nEvent was copied 👏`,
      })
    );
  };

  return (
    <div className="fit-container fx-centered fx-col box-pad-h box-pad-v">
      <h4 className="box-marg-s">Create poll</h4>
      {userMetadata && (
        <div className="fit-container fx-centered fx-col">
          <div
            style={{
              minWidth: "90px",
              minHeight: "90px",
              backgroundImage: `url(${userMetadata?.picture})`,
            }}
            className="bg-img cover-bg sc-s"
          ></div>

          <h4>{userMetadata?.display_name || userMetadata?.name}</h4>
          <p className="gray-c">
            @{userMetadata?.name || userMetadata?.display_name}
          </p>
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
        <>
          <textarea
            className="txt-area fit-container"
            onChange={handleChange}
            value={content}
            placeholder={"Description"}
          />
          <input
            type="number"
            className="if ifs-full"
            placeholder={"Minimum Satoshi (optional)"}
            value={minSats}
            onChange={(e) => {
              setMinSats(parseInt(e.target.value) || "");
            }}
          />
          <input
            type="number"
            className="if ifs-full"
            placeholder={"Maximum Satoshi (optional)"}
            value={maxSats}
            onChange={(e) => setMaxSats(parseInt(e.target.value) || "")}
          />
          <input
            type="datetime-local"
            className="if ifs-full pointer"
            placeholder={"Poll close date"}
            value={closedAt}
            min={new Date().toISOString()}
            onChange={(e) => {
              setClosedAt(e.target.value);
            }}
          />
          <div className="fit-container fx-centered fx-col fx-start-v">
            <p className="p-medium gray-c">{"Options"}</p>
            {options.map((option, index) => {
              return (
                <div className="fit-container fx-centered" key={index}>
                  <input
                    type="text"
                    className="if ifs-full"
                    placeholder="Option"
                    value={option}
                    onChange={(e) => handleEditOption(e.target.value, index)}
                  />
                  <div
                    className="round-icon round-icon-tooltip"
                    data-tooltip={"Delete"}
                    onClick={() => handleDeleteOption(index)}
                  >
                    <div className="trash"></div>
                  </div>
                </div>
              );
            })}
            <div className="fit-container fx-scattered">
              <input
                type="text"
                className="if ifs-full"
                placeholder="Add option"
                value={tempOption}
                onChange={(e) => setTempOption(e.target.value)}
              />
              <div
                className={`round-icon round-icon-tooltip ${
                  tempOption ? "pointer" : "if-disabled"
                }`}
                data-tooltip={"Add option"}
                onClick={handleAddOption}
              >
                <div className="plus-sign" style={{ cursor: "unset" }}></div>
              </div>
            </div>
            <button className="btn btn-normal btn-full" onClick={postPoll}>
              {isLoading ? <LoadingDots /> : "Publish"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
