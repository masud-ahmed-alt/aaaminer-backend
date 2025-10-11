// config/redeemConfig.js
let redeemPaused = false; // default

export const getRedeemPaused = () => redeemPaused;
export const setRedeemPaused = (value) => {
  redeemPaused = Boolean(value);
};
