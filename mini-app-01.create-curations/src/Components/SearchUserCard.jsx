import React, { useEffect, useState } from "react";
import { getAuthPubkeyFromNip05 } from "../Helpers/Helpers";
import UserProfilePic from "./UserProfilePic";

export default function SearchUserCard({ user }) {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      if (user.nip05) {
        let status = await getAuthPubkeyFromNip05(user.nip05);
        if (status === user.pubkey) setVerified(true);
        else setVerified(false);
      } else setVerified(false);
    };
    verifyUser();
  }, [user]);

  if (
    !(
      typeof user.nip05 === "string" &&
      typeof user.display_name === "string" &&
      typeof user.name === "string"
    )
  )
    return;
    return (
      <div className="fx-scattered fit-container pointer search-bar-post">
        <div className="fx-centered">
          <UserProfilePic
            img={user.picture || ""}
            size={36}
            allowClick={false}
            user_id={user.pubkey}
          />
          <div className="fx-centered fx-start-h">
            <div
              className="fx-centered fx-col fx-start-v "
              style={{ rowGap: 0 }}
            >
              <div className="fx-centered">
                <p className={`p-one-line ${verified ? "c1-c" : ""}`}>
                  {user.display_name || user.name}
                </p>
                {verified && <div className="checkmark-c1"></div>}
              </div>
              <p className={`${verified ? "" : "gray-c"} p-medium p-one-line`}>
                {user.nip05 || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
}
