import React, { useEffect, useState } from "react";
import LoadingDots from "./LoadingDots";
import UserSearchBar from "./UserSearchBar";
import NProfilePreviewer from "./NProfilePreviewer";
import UploadFile from "./UploadFile";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "nanoid";
import { setToast } from "../Store/Slides/StoreSlides";

export default function ToPublishVideo({
  videoURL,
  videoTitle,
  videoDesc,
  videoMetadata,
  userPubkey,
  signEvent,
}) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [thumbnailPrev, setThumbnailPrev] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tempTag, setTempTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [zapSplit, setZapSplit] = useState([]);
  const [zapSplitEnabled, setZapSplitEnabled] = useState(false);

  useEffect(() => {
    if (userKeys) {
      setZapSplit([["zap", userKeys.pub, "", "100"]]);
    }
  }, [userKeys]);

  const handleImageUpload = (file) => {
    if (file && !file.type.includes("image/")) {
      dispatch(
        setToast({
          type: 2,
          desc: "Image type is unsupported",
        })
      );
      return;
    }
    if (file) {
      setThumbnailPrev(URL.createObjectURL(file));
      setThumbnailUrl("");
    }
  };

  const initThumbnail = async () => {
    setThumbnailPrev("");
    setThumbnailUrl("");
  };

  const Submit = async () => {
    try {
      if (!(videoURL && videoTitle)) {
        dispatch(
          setToast({
            type: 2,
            desc: "Please provide a video URL and title",
          })
        );
        return;
      }
      setIsLoading(true);
      let tags = [
        ["d", nanoid()],
        [
          "imeta",
          `url ${videoURL}`,
          `image ${thumbnailUrl}`,
          videoMetadata ? `m ${videoMetadata.type}` : "m video/mp4",
        ],
        ["url", videoURL],
        ["title", videoTitle],
        ["summary", videoDesc],
        ["published_at", `${Math.floor(Date.now() / 1000)}`],
        ["m", videoMetadata ? videoMetadata.type : "video/mp4"],
        ["duration", "0"],
        ["size", videoMetadata ? `${videoMetadata.size}` : "0"],
      ];
      if (zapSplit) tags = [...tags, ...zapSplit];
      for (let cat of selectedCategories) {
        tags.push(["t", cat]);
      }
      tags.push(["thumb", thumbnailUrl]);
      tags.push(["image", thumbnailUrl]);

      let eventInitEx = {
        kind: 34235,
        content: videoDesc,
        tags,
      };
      signEvent(eventInitEx);
    } catch (err) {
      dispatch(
        setToast({
          type: 2,
          desc: "An error has occurred!",
        })
      );
      setIsLoading(false);
    }
  };
  const removeCategory = (cat) => {
    let index = selectedCategories.findIndex((item) => item === cat);
    let tempArray = Array.from(selectedCategories);
    tempArray.splice(index, 1);
    setSelectedCategories(tempArray);
  };

  const handleThumbnailValue = (e) => {
    let value = e.target.value;
    setThumbnailUrl(value);
    setThumbnailPrev(value);
  };

  const handleAddZapSplit = (pubkey, action) => {
    console.log(pubkey);
    if (action === "add") {
      let findPubkey = zapSplit.find((item) => item[1] === pubkey);
      if (!findPubkey)
        setZapSplit((prev) => [...prev, ["zap", pubkey, "", "1"]]);
    }
    if (action === "remove") {
      let findPubkeyIndex = zapSplit.findIndex((item) => item[1] === pubkey);
      if (findPubkeyIndex !== -1) {
        let tempZapSplit = Array.from(zapSplit);
        tempZapSplit.splice(findPubkeyIndex, 1);
        setZapSplit(tempZapSplit);
      }
    }
  };

  const handleZapAmount = (amount, pubkey) => {
    let findPubkeyIndex = zapSplit.findIndex((item) => item[1] === pubkey);
    if (findPubkeyIndex !== -1) {
      let tempZapSplit = Array.from(zapSplit);
      tempZapSplit[findPubkeyIndex][3] = `${amount}`;
      setZapSplit(tempZapSplit);
    }
  };
  const calculatePercentage = (amount) => {
    let allAmount =
      zapSplit.reduce((total, item) => (total += parseInt(item[3])), 0) || 1;
    return Math.floor((amount * 100) / allAmount);
  };
  return (
    <div className="fit-container box-pad-h-m fx-centered fx-col">
      <div className=" fx-centered fx-start-v fx-stretch fit-container">
        <div className="fx-centered fx-col fit-container">
          <div
            className="fit-container fx-centered fx-col sc-s-18 box-pad-h bg-img cover-bg"
            style={{
              position: "relative",
              height: "200px",
              backgroundImage: `url(${thumbnailPrev})`,
              backgroundColor: "var(--dim-gray)",
            }}
          >
            {thumbnailPrev && (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  position: "absolute",
                  right: "16px",
                  top: "16px",
                  backgroundColor: "var(--dim-gray)",
                  borderRadius: "var(--border-r-50)",
                  zIndex: 10,
                }}
                className="fx-centered pointer"
                onClick={initThumbnail}
              >
                <div className="trash"></div>
              </div>
            )}

            {!thumbnailPrev && (
              <>
                <p className="gray-c p-medium">(Thumbnail preview)</p>
              </>
            )}
          </div>
          <div className="fit-container fx-centered">
            <input
              type="text"
              className="if ifs-full"
              placeholder={"Image url"}
              value={thumbnailUrl}
              onChange={handleThumbnailValue}
              disabled={isLoading}
            />
            <UploadFile
              round={true}
              setFileMetadata={handleImageUpload}
              setImageURL={setThumbnailUrl}
              setIsUploadsLoading={setIsLoading}
              userPubkey={userPubkey}
            />
          </div>
          <div style={{ position: "relative" }} className="fit-container">
            <form
              className="fit-container fx-scattered"
              onSubmit={(e) => {
                e.preventDefault();
                tempTag.replace(/\s/g, "").length
                  ? setSelectedCategories([
                      ...selectedCategories,
                      tempTag.trim(),
                    ])
                  : dispatch(
                      setToast({
                        type: 3,
                        desc: "Your tag contains only spaces!",
                      })
                    );
                setTempTag("");
              }}
              style={{ position: "relative" }}
            >
              <input
                type="text"
                className="if ifs-full"
                placeholder={"Keyword (optional)"}
                value={tempTag}
                onChange={(e) => setTempTag(e.target.value)}
                disabled={isLoading}
              />
              {tempTag && (
                <button
                  className="btn btn-normal"
                  style={{ minWidth: "max-content" }}
                  disabled={isLoading}
                >
                  Add tag
                </button>
              )}
            </form>
          </div>
          {selectedCategories.length > 0 && (
            <div className="fit-container box-pad-v-m fx-centered fx-col fx-start-h">
              <p className="p-medium gray-c fit-container p-left">
                Selected categories
              </p>
              <div className="fit-container  fx-scattered fx-wrap fx-start-h">
                {selectedCategories.map((item, index) => {
                  return (
                    <div
                      key={`${item}-${index}`}
                      className="sticker sticker-gray-c1"
                      style={{ columnGap: "8px" }}
                    >
                      <span>{item}</span>
                      <p
                        className="p-medium pointer"
                        onClick={() => removeCategory(item)}
                      >
                        &#10005;
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <label
        htmlFor="zap-split"
        className="if ifs-full fx-centered fx-start-h"
        style={{
          borderColor: zapSplitEnabled ? "var(--blue-main)" : "",
        }}
      >
        <input
          type="checkbox"
          id="zap-split"
          checked={zapSplitEnabled}
          onChange={() => !isLoading && setZapSplitEnabled(!zapSplitEnabled)}
        />
        <p className={zapSplitEnabled ? "" : "gray-c"}>
          I want to share this article's revenues
        </p>
      </label>
      {zapSplitEnabled && (
        <>
          <UserSearchBar
            full={true}
            onClick={(pubkey) => handleAddZapSplit(pubkey, "add")}
          />
          <div
            className="fit-container fx-wrap fx-centered"
            style={{ maxHeight: "30vh", overflow: "scroll" }}
          >
            {zapSplit.map((item, index) => {
              const percentage = calculatePercentage(item[3]) || 0;
              return (
                <div
                  className="fit-container fx-scattered fx-stretch"
                  key={item[1]}
                >
                  <NProfilePreviewer
                    pubkey={item[1]}
                    margin={false}
                    close={zapSplit.length > 1}
                    onClose={() =>
                      zapSplit.length > 1 &&
                      handleAddZapSplit(item[1], "remove")
                    }
                  />
                  <div
                    style={{ width: "35%" }}
                    className="sc-s-18 fx-centered fx-col fx-start-v"
                  >
                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      <input
                        type="number"
                        className="if ifs-full if-no-border"
                        placeholder={"Portion"}
                        value={item[3]}
                        max={100}
                        style={{ height: "100%" }}
                        onChange={(e) =>
                          handleZapAmount(e.target.value, item[1])
                        }
                      />
                    </div>
                    <hr />
                    <p className="orange-c p-medium box-pad-h-m">
                      {percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="fit-container fx-centered box-marg-s">
        <button
          className="btn fx  btn-normal"
          onClick={() => !isLoading && Submit()}
          disabled={isLoading}
        >
          {isLoading ? <LoadingDots /> : "Publish"}
        </button>
      </div>
    </div>
  );
}
