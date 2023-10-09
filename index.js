const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8000;
const MONGO_DB_URL =
  "mongodb+srv://test:test123@cluster0.x45dbc8.mongodb.net/survey?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose
  .connect(MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Enable CORS for all routes
app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const Survey = mongoose.model("Survey", {
  business_name: String,
  business_type: String,
  address: String,
  zip_code: String,
  wash_fold_press_percent: Number,
  dryclean_percent: Number,
  shoe_clean_percent: Number,
  carpet_clean_percent: Number,
  average_ticket_size: Number,
  average_order_per_day: Number,
  average_revenue_monthly: Number,
  profit_margin: Number,
  work_barrier: String,
});

// Define routes and middleware here
app.get("/surveys", async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let query = {};
    // Check if startDate and endDate are provided and valid, then add them to the query
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (!isNaN(startDateObj) && !isNaN(endDateObj)) {
        endDateObj.setHours(23, 59, 59, 999);
        query.createdAt = {
          $gte: startDateObj,
          $lte: endDateObj,
        };
      }
    }
    const surveys = await Survey.find(query);
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/survey-analytics", async (req, res) => {
  try {
    const averages = await Survey.aggregate([
      {
        $group: {
          _id: null,
          average_wash_fold_press_percent: { $avg: "$wash_fold_press_percent" },
          average_dryclean_percent: { $avg: "$dryclean_percent" },
          average_shoe_clean_percent: { $avg: "$shoe_clean_percent" },
          average_carpet_clean_percent: { $avg: "$carpet_clean_percent" },
          average_ticket_size: { $avg: "$average_ticket_size" },
          average_order_per_day: { $avg: "$average_order_per_day" },
          average_revenue_monthly: { $avg: "$average_revenue_monthly" },
          average_profit_margin: { $avg: "$profit_margin" },
          min_wash_fold_press_percent: { $min: "$wash_fold_press_percent" },
          min_dryclean_percent: { $min: "$dryclean_percent" },
          min_shoe_clean_percent: { $min: "$shoe_clean_percent" },
          min_carpet_clean_percent: { $min: "$carpet_clean_percent" },
          min_ticket_size: { $min: "$average_ticket_size" },
          min_order_per_day: { $min: "$average_order_per_day" },
          min_revenue_monthly: { $min: "$average_revenue_monthly" },
          min_profit_margin: { $min: "$profit_margin" },
          max_wash_fold_press_percent: { $max: "$wash_fold_press_percent" },
          max_dryclean_percent: { $max: "$dryclean_percent" },
          max_shoe_clean_percent: { $max: "$shoe_clean_percent" },
          max_carpet_clean_percent: { $max: "$carpet_clean_percent" },
          max_ticket_size: { $max: "$average_ticket_size" },
          max_order_per_day: { $max: "$average_order_per_day" },
          max_revenue_monthly: { $max: "$average_revenue_monthly" },
          max_profit_margin: { $max: "$profit_margin" },
        },
      },
    ]);

    if (averages.length === 0) {
      return res.status(404).json({ message: "No surveys found" });
    }
    res.json(averages[0]);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
