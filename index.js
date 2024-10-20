import express from "express";
import cors from "cors";
import { initializeDataFiles } from "./faker.js";
import { db } from "./DB.js";

const PORT = 3333;
const app = express();
app.use(express.json());
app.use(cors());

app.get("/node/:id", (req, res) => {
  try {
    const { id } = req.params;
    const node = db.getNodeWithLinks(Number(id));
    if (node) {
      res.json({ error: null, payload: node });
    } else {
      res.json({ error: "NOT FOUND", payload: null });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: "SERVER ERROR", payload: null });
  }
});

app.listen(PORT, async () => {
  console.log(`creating data files`);
  const nodeCount = 12;
  const edgeCount = 20;
  await initializeDataFiles(nodeCount, edgeCount);
  console.log(`data files created`);
  console.log(`listening on port ${PORT}`);
});
