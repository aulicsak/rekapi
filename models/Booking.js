const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  over18: { type: Boolean, required: true },
  tattoo_amount: { type: Number, min: 1, required: true },
  tattoo_idea: { type: String, required: true },
  tattoo_min: { type: Number, min: 1, required: true },
  tattoo_max: { type: Number, min: 2, required: true },
  body_part: { type: String, required: true },
  tattoo_color: { type: String, required: true },
  first_date: { type: Date, required: true },
  second_date: { type: Date, default: null },
  third_date: { type: Date, default: null },
  photos: [{ data: Buffer, contentType: String }],
  terms: { type: Boolean, required: true },
});

const BookingModel = mongoose.model("Booking", BookingSchema);

module.exports = BookingModel;
