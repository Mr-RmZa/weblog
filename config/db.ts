import mongoose from "mongoose";
import { log } from "console-log-colors";

export default class connect {
  public static async mongodb() {
    try {
      await mongoose.connect(process.env.MONGO_URL!);
      log.green("connected to mongodb");
    } catch (error) {
      log.red(error);
      process.exit(1);
    }
  }
}
