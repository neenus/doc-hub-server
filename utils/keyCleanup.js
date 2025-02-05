import Key from "../models/Key.js";

const keyCleanup = async (req, res, next) => {
  console.log("Running key cleanup");
  const keys = await Key.find();
  const keysToDelete = [];
  const now = new Date();

  console.log({ keys });

  keys.forEach(async key => {
    if (Date.parse(key.expiresAt) < Date.parse(now)) {
      console.log(`Deleting key ${key.key}`);
      keysToDelete.push(key.key);
    }
  });

  if (keysToDelete.length > 0) {
    try {
      await Key.deleteMany({ key: { $in: keysToDelete } });
    } catch (error) {
      return next(new ErrorResponse(error.message, 500));
    }
  }

  return res.status(200).json({
    success: true,
    data: keys,
  });
};

export default keyCleanup;