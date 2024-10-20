import express from "express";
import { db } from "./DB.js";
const PORT = 3333;
const app = express();
app.use(express.json());

app.get("/node/:id", (req, res) => {
  try {
    const { id } = req.params;
    const node = db.getNode(+id);
    if (node) {
      res.json({ error: null, data: node });
    } else {
      res.json({ error: "NOT FOUND", data: null });
    }
  } catch (err) {
    res.json({ error: "SERVER ERROR", data: null });
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
