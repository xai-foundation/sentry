import mongoose from "mongoose";
import IBanList from "../types/IBanList";

const BanListSchema = new mongoose.Schema<IBanList>({
  bannedWord: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
}
});

const BanListModel = mongoose.models.BanList || mongoose.model<IBanList>("BanList", BanListSchema);
export default BanListModel;
