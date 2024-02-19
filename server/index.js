import Express from "express";
import cors from "cors";
import dotenv from "dotenv";

import binRoutes from "./routes/bin.js";
import healthRoutes from "./routes/health.js";

const app = Express();
dotenv.config();

app.use(cors());
app.use(Express.json());
app.use("/", healthRoutes);
app.use("/bin", binRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
