import mongoose, { Document, Schema } from 'mongoose';

interface BonusSystem extends Document {
    path: string;
    legalId?: mongoose.Types.ObjectId;
    physicalId?: mongoose.Types.ObjectId;
    time?: Date;
}


const bonusSystemSchema: Schema = new Schema({
    path: { type: String, required: true },
    legalId: { type: mongoose.Schema.Types.ObjectId, ref: 'LUser', required: false },
    physicalId: { type: mongoose.Schema.Types.ObjectId, ref: 'PUser', required: false },
    time: { type: Date, required: false, default: Date.now },
});

const BonusSystem = mongoose.model<BonusSystem>('BonusSystem', bonusSystemSchema);
export default BonusSystem;
export { BonusSystem };