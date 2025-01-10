import fs from "node:fs/promises";
import * as jsonl from "node-jsonl";
import { createRandomEdges, createRandomNodes, stringifyData } from "./utils.js";

const NODE_COUNT = 50_000;
const EDGE_COUNT = 100_000;

class DB {
  nodes = new Map();
  edges = new Map();
  ready = false;

  constructor() {
    this.initializeDataFiles(NODE_COUNT, EDGE_COUNT).then(() => {
      Promise.all([this.loadJsonLData("./data/nodes.jsonl"), this.loadJsonLData("./data/edges.jsonl")]).then(
        ([nodes, edges]) => {
          for (const node of nodes) this.nodes.set(node.id, node);
          for (const edge of edges) this.edges.set(edge.id, edge);
          this.ready = true;
        }
      );
    });
  }

  async loadJsonLData(filePath) {
    const entries = [];
    const rl = jsonl.readlines(filePath);
    while (true) {
      const { value, done } = await rl.next();
      if (done) break;
      entries.push(value);
    }
    return entries;
  }

  async writeToJsonLFile(data, filename) {
    try {
      const jsonString = stringifyData(data);

      await fs.mkdir("data", { recursive: true });

      await fs.writeFile(`data/${filename}`, jsonString);

      console.log(`JSON data saved to ${filename}`);
    } catch (err) {
      console.error("Error writing to file:", err);
    }
  }

  async initializeDataFiles(nodeCount, edgeCount) {
    console.log(`creating data files...`);
    const nodes = await createRandomNodes(nodeCount);
    const edges = await createRandomEdges(nodes, edgeCount);
    await Promise.all([this.writeToJsonLFile(nodes, "nodes.jsonl"), this.writeToJsonLFile(edges, "edges.jsonl")]);
    console.log(`...data files created successfully!`);
  }

  getNeighbors(node) {
    const links = [...this.edges.values()].filter((e) => [e.source, e.destination].includes(node.id));

    const neighbors = links.map((link) => {
      const neighborId = link.source === node.id ? link.destination : link.source;
      return this.nodes.get(neighborId);
    });

    return neighbors;
  }

  getNodeWithLinks(nodeId) {
    if (!this.ready) {
      console.error("DB not ready yet!");
      return null;
    }

    const node = this.nodes.get(nodeId) ?? null;

    if (!node) return null;

    const closeNeighborIDs = new Set();
    this.getNeighbors(node).forEach((n) => {
      closeNeighborIDs.add(n.id);
    });
    const closeNeighbors = [...closeNeighborIDs].map((id) => ({ ...this.nodes.get(id), directNeighbor: true }));

    const distantNeighborIDs = new Set();
    closeNeighbors.forEach((n) => {
      this.getNeighbors(n).forEach((nn) => {
        if (nn.id === node.id || closeNeighborIDs.has(nn.id)) return;
        distantNeighborIDs.add(nn.id);
      });
    });
    const distantNeighbors = [...distantNeighborIDs.values()].map((id) => this.nodes.get(id));

    const links = [...this.edges.values()].filter(
      (ed) => closeNeighborIDs.has(ed.source) || closeNeighborIDs.has(ed.destination)
    );

    const relatedNodes = Array.from(new Set([...closeNeighbors, ...distantNeighbors]));

    return { node, links, relatedNodes, nodeCount: this.getNodeCount(), edgeCount: this.getEdgeCount() };
  }

  getNodeCount() {
    return this.nodes.size;
  }
  getEdgeCount() {
    return this.edges.size;
  }
}

const db = new DB();

export { db };
