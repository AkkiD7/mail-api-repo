import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { sendEmail } from "./mailer.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10, 
});
app.use(limiter);

app.post(
  "/send-email",
  [
    body("to").isEmail(),
    body("subject").notEmpty(),
    body("html").notEmpty(),
    body("code").notEmpty(),
  ],
  async (req, res) => {
    try {
      const apiKey = req.headers["x-api-key"];
      if (!apiKey || apiKey !== process.env.EMAIL_API_KEY) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const info = await sendEmail(req.body);
      return res.json({ message: "Email sent successfully", messageId: info.messageId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
