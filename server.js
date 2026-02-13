const express = require("express");
const cors = require("cors");

const app = express();
const resultRoutes = require("./src/routes/resultRoutes");

app.use(cors()); // ✅ allow frontend requests
app.use(express.json());

app.use("/api/results", resultRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
