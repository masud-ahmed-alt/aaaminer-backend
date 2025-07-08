import cron from "node-cron";
import Withdraw from "../models/Withdraw.js";
import RedeemCodes from "../models/RedeemCode.js";

export const instantRedeemCron = () => {
  cron.schedule("*/30 * * * * *", instantRedeem, {
    timezone: "Asia/Kolkata",
  });
};

const instantRedeem = async () => {
  try {
    // Fetch processing withdraws and populate user info
    const withdrawRequests = await Withdraw.find({
      status: "processing",
    }).populate({
      path: "user",
      select: "inreview",
    });

    // Filter out withdraws where user is under review
    const filteredWithdraws = withdrawRequests.filter(
      (req) => req.user && req.user.inreview === false
    );
    if (filteredWithdraws.length === 0) {
      return;
    }

    // Fetch all unused redeem codes
    const availableCodes = await RedeemCodes.find({ is_used: false });

    if (availableCodes.length === 0) {
      return;
    }

    // Group redeem codes by amount
    const codeMap = new Map(); // { amount: [redeemCode1, redeemCode2, ...] }
    for (const code of availableCodes) {
      if (!codeMap.has(code.amount)) {
        codeMap.set(code.amount, []);
      }
      codeMap.get(code.amount).push(code);
    }

    for (const request of filteredWithdraws) {
      const codeList = codeMap.get(request.amount);

      if (!codeList || codeList.length === 0) {
        continue;
      }

      const redeemCode = codeList.shift(); // use the first matching code

      // Update withdraw
      request.voucher = redeemCode.code;
      request.status = "success";
      await request.save();

      // Update redeem code
      redeemCode.is_used = true;
      await redeemCode.save();
    }
  } catch (err) {
    // Handle silently or log if needed
  }
};
