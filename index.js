import express from "express";
import cors from "cors";
import { db } from "./DB.js";

const PORT = 3333;
const app = express();
app.use(express.json());
app.use(cors());

app.get("/node/:id", (req, res) => {
  try {
    const { id } = req.params;
    const payload = db.getNodeWithLinks(Number(id));
    if (payload) {
      res.json({ error: null, payload });
    } else {
      res.json({ error: "NOT FOUND", payload: null });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: "SERVER ERROR", payload: null });
  }
});

app.listen(PORT, async () => {
  console.log(`listening on port ${PORT}`);
});
