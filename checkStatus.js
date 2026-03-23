const axios = require("axios");

const FIREBASE_URL = process.env.FIREBASE_URL;
const CLIQ_TOKEN = process.env.CLIQ_TOKEN;
const BOT_NAME = process.env.BOT_NAME;

async function checkStatus() {
  const res = await axios.get(FIREBASE_URL);
  const users = res.data;

  if (!users) return;

  for (let key in users) {
    const user = users[key];

    const cliqRes = await axios.get(
      `https://cliq.zoho.com/api/v2/users/${user.target_email}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${CLIQ_TOKEN}`,
        },
      }
    );

    const currentStatus = cliqRes.data.status;

    if (user.last_status !== "available" && currentStatus === "available") {
      await axios.post(
        `https://cliq.zoho.com/api/v2/bots/${BOT_NAME}/message`,
        {
          text: `${user.target_email} is now available!`,
          to: {
            user: user.requester
          }
        },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${CLIQ_TOKEN}`,
          },
        }
      );
    }

    await axios.put(
      `${FIREBASE_URL.replace(".json","")}/${key}.json`,
      {
        ...user,
        last_status: currentStatus
      }
    );
  }
}

checkStatus();
