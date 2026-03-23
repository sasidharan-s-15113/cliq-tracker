const axios = require("axios");

const FIREBASE_URL = process.env.FIREBASE_URL;
const BOT_NAME = process.env.BOT_NAME;

async function getAccessToken() {
  const res = await axios.post(
    "https://accounts.zoho.com/oauth/v2/token",
    null,
    {
      params: {
        refresh_token: process.env.REFRESH_TOKEN,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "refresh_token",
      },
    }
  );

  return res.data.access_token;
}

async function checkStatus() {
  const token = await getAccessToken(); // 🔥 auto-generated every run

  const res = await axios.get(FIREBASE_URL);
  const users = res.data;

  if (!users) return;

  for (let key in users) {
    const user = users[key];

    const cliqRes = await axios.get(
      `https://cliq.zoho.com/api/v2/users/${user.target_email}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
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
            Authorization: `Zoho-oauthtoken ${token}`,
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

async function getAccessToken() {
  const res = await axios.post(
    "https://accounts.zoho.com/oauth/v2/token",
    null,
    {
      params: {
        refresh_token: process.env.REFRESH_TOKEN,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "refresh_token",
      },
    }
  );

  return res.data.access_token;
}
