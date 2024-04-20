const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingArraySchema = new Schema({
  available_dates: [{ date: Date }],
  bookings: [{ booking: { type: mongoose.Schema.Types.ObjectId } }],
});

const BookingArrayModel = mongoose.model("BookingArray", BookingArraySchema);

module.exports = BookingArrayModel;
