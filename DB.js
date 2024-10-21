import * as jsonl from "node-jsonl";

class DB {
  nodes = new Map();
  edges = new Map();
  ready = false;
  constructor() {
    Promise.all([this.loadJsonLData("./data/nodes.jsonl"), this.loadJsonLData("./data/edges.jsonl")]).then(
      ([nodes, edges]) => {
        for (const node of nodes) {
          this.nodes.set(node.id, node);
        }
        for (const edge of edges) {
          this.edges.set(edge.id, edge);
        }
        this.ready = true;
      }
    );
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

  getNeighbors(node) {
    const links = [...this.edges.values()].filter((e) => [e.source, e.destination].includes(node.id));
    const neighbors = links.map((link) => {
      const neighborId = link.source === node.id ? link.destination : link.source;
      return this.nodes.get(neighborId);
    });

    // console.log(":::getNeighbors", links, neighbors);
    return neighbors;
  }

  getNodeWithLinks(nodeId) {
    if (!this.ready) {
      console.error("DB not ready yet!");
      return null;
    }

    const node = this.nodes.get(nodeId) ?? null;

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

    return { node, links, relatedNodes };
  }
}

const db = new DB();

export { db };
