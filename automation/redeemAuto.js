import cron from "node-cron";
import Withdraw from "../models/Withdraw.js";
import RedeemCodes from "../models/RedeemCode.js";

export const instantRedeemCron = () => {
  // Run every 30 seconds
  cron.schedule("*/30 * * * * *", instantRedeem, {
    timezone: "Asia/Kolkata",
  });
};

const instantRedeem = async () => {
  try {
    // Step 1: Get all processing withdraws with user info
    const withdrawRequests = await Withdraw.find({ status: "processing" }).populate({
      path: "user",
      select: "inreview",
    });

    // Step 2: Filter withdraws where user is not under review
    const filteredWithdraws = withdrawRequests.filter(
      (req) => req.user && req.user.inreview === false
    );

    if (filteredWithdraws.length === 0) return;

    // Step 3: Get all unused redeem codes
    const availableCodes = await RedeemCodes.find({ is_used: false });

    if (availableCodes.length === 0) return;

    // Step 4: Group redeem codes by "amount-type" (e.g., "100-0")
    const codeMap = new Map();
    for (const code of availableCodes) {
      const key = `${code.amount}-${code.type}`; // type: "0" or "1"
      if (!codeMap.has(key)) {
        codeMap.set(key, []);
      }
      codeMap.get(key).push(code);
    }

    // Step 5: Match withdraw requests with redeem codes
    for (const request of filteredWithdraws) {
      const amount = request.amount;
      const type = request.redeemOption; // should be "0" or "1"

      const key = `${amount}-${type}`;
      const codeList = codeMap.get(key);

      if (!codeList || codeList.length === 0) {
        continue; // No matching code available
      }

      const redeemCode = codeList.shift(); 

      // Update withdraw request
      request.voucher = redeemCode.code;
      request.status = "success";
      await request.save();

      // Mark redeem code as used
      redeemCode.is_used = true;
      await redeemCode.save();
    }
  } catch (err) {
    console.error("Instant Redeem Cron Error:", err.message);
  }
};
