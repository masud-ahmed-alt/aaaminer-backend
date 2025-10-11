// config/redeemConfig.js
let redeemPaused = true; // default

export const getRedeemPaused = () => redeemPaused;
export const setRedeemPaused = (value) => {
  redeemPaused = Boolean(value);
};
