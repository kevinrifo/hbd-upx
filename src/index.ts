import express from "express";
import cron from "node-cron";
import { birthDayMessage } from "./crons/birthday-job";
import router from "./routes/user-route";
import { cronRule } from "./utils/constants";

//Express
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

//Routes registration
app.use("/api", router);

//Scheduler
cron.schedule(cronRule, birthDayMessage)

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
