import { v4 as uuidv4 } from "uuid";

// Middleware to assign device_id cookie
export const setDeviceId = (req, res, next) => {
  if (!req.cookies?.device_id) {
    const deviceId = uuidv4(); // Generate unique device ID
    res.cookie("device_id", deviceId, {
      httpOnly: true,
      secure: true, // only send on HTTPS
      sameSite: "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
    req.device_id = deviceId;
     console.log(`[New Device] Assigned device_id: ${deviceId}`);
  } else {
    req.device_id = req.cookies.device_id;
    console.log(`[Existing Device] device_id: ${req.device_id}`);
  }
  next();
};
