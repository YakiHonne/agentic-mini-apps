import React, { useEffect, useState } from "react";
import Avatar from "boring-avatars";
import { useSelector } from "react-redux";
import { getUser } from "../Helpers/Helpers";

export default function UserProfilePic({ user_id, size, img }) {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [fetchedImg, setFetchedImg] = useState(false);

  useEffect(() => {
    if (user_id && nostrAuthors.length > 0 && !img) {
      let auth = getUser(user_id);
      if (auth) {
        setFetchedImg(auth.picture);
      }
    }
  }, [nostrAuthors]);

  return (
    <>
      <div style={{ position: "relative" }}>
        {(img || fetchedImg) && (
          <div
            className={`pointer fx-centered bg-img cover-bg`}
            style={{
              minWidth: `${size}px`,
              minHeight: `${size}px`,
              backgroundImage: `url(${img || fetchedImg})`,
              borderRadius: "var(--border-r-14)",
              backgroundColor: "var(--dim-gray)",
              borderColor: "black",
            }}
          ></div>
        )}
        {!(img || fetchedImg) && (
          <div
            style={{
              minWidth: `${size}px`,
              minHeight: `${size}px`,
              borderRadius: "var(--border-r-14)",
              overflow: "hidden",
            }}
            className={`pointer fx-centered`}
          >
            <Avatar
              size={size}
              name={user_id}
              square
              variant="marble"
              colors={["#0A0310", "#49007E", "#FF005B", "#FF7D10", "#FFB238"]}
            />
          </div>
        )}
      </div>
    </>
  );
}
