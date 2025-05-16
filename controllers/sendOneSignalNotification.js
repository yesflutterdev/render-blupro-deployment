// utils/sendOneSignalNotification.js
const axios = require("axios");

const sendOneSignalNotification = async ({ playerId, message, senderName }) => {
    try {
        const response = await axios.post(
            "https://onesignal.com/api/v1/notifications",
            {
                app_id: "f4f1a863-69f0-4f6c-b839-c7e597b5ac09",
                include_player_ids: [playerId],
                headings: { en: `New message` },
                contents: { en: message },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Basic os_v2_app_6ty2qy3j6bhwzobzy7szpnnmbg2uas5k5nxubqefeyfn5jzfvxcuazulx3be2b5qvmdq32of4wwss2e7fgnuqsckppirke7chvzoybi",
                },
            }
        );

        console.log("Notification sent:", response.data);
    } catch (error) {
        console.error("Notification error:", error.response?.data || error.message);
    }
};

module.exports = sendOneSignalNotification;
