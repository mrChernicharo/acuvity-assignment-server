import * as jsonl from "node-jsonl";

class DB {
  nodes;
  edges;
  ready = false;
  constructor() {
    Promise.all([this.loadJsonLData("./data/nodes.jsonl"), this.loadJsonLData("./data/edges.jsonl")]).then(
      ([nodes, edges]) => {
        this.nodes = nodes;
        this.edges = edges;
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

  getNodeWithLinks(id) {
    if (!this.ready) {
      console.log("not ready yet!");
      return null;
    }

    const node = this.nodes.find((n) => n.id === id) ?? null;
    const links = this.edges.filter((e) => [e.source, e.destination].includes(id));

    const relatedNodeIds = new Set();
    links.forEach((link) => {
      relatedNodeIds.add(link.source);
      relatedNodeIds.add(link.destination);
    });

    const relatedNodes = this.nodes.filter((n) => n.id !== node.id && relatedNodeIds.has(n.id));

    return { node, relatedNodes, links };
  }
}

const db = new DB();

export { db };
