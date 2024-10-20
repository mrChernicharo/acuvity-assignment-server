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

        // console.log(":::", { nodes: this.nodes, edges: this.edges });
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

  getNodeWithLinks(nodeId) {
    if (!this.ready) {
      console.error("DB not ready yet!");
      return null;
    }

    // const node = this.nodes.find((n) => n.id === nodeId) ?? null;
    // const links = this.edges.filter((e) => [e.source, e.destination].includes(nodeId));

    // const relatedNodeIds = new Set();
    // links.forEach((link) => {
    //   relatedNodeIds.add(link.source);
    //   relatedNodeIds.add(link.destination);
    // });

    // const relatedNodes = this.nodes.filter((n) => n.id !== node.id && relatedNodeIds.has(n.id));

    // return { node, relatedNodes, links };

    const node = this.nodes.get(nodeId);
    // const node = this.nodes.find((n) => n.id === nodeId);
    const nodeIdSet = new Set();
    const edgeIdSet = new Set();
    console.log(":::getNodeWithLinks", { nodeId, name: node.name });

    const computeNode = (id, depth) => {
      if (depth <= 0) return;

      const node = this.nodes.get(id);

      if (!node) return null;

      const nodeLinks = [...this.edges.values()].filter((e) => [e.source, e.destination].includes(id));
      console.log("computeNode:::", { id, depth, nodeLinks });

      const relatedNodeIds = new Set();
      nodeLinks.forEach((link) => {
        edgeIdSet.add(link.id);
        relatedNodeIds.add(link.source);
        relatedNodeIds.add(link.destination);
      });

      //   const relatedNodes = [...this.nodes.values()].filter((n) => n.id !== node.id && relatedNodeIds.has(n.id));
      const relatedNodes = [...this.nodes.values()];
      console.log("computeNode:::", id, depth, relatedNodes);

      for (const n of relatedNodes) {
        nodeIdSet.add(n.id);
        computeNode(n.id, depth - 1);
      }
    };
    computeNode(node.id, 3);

    const links = Array.from(edgeIdSet).map((id) => this.edges.get(id));
    const relatedNodes = Array.from(nodeIdSet)
      .map((id) => this.nodes.get(id))
      .filter((n) => n.id !== nodeId);

    const res = { node, relatedNodes, links, edgeIdSet, nodeIdSet, arr: Array.from(edgeIdSet) };
    console.log("::: getNodeWithLinks", { res });
    return { node, relatedNodes, links };
  }
}

const db = new DB();

export { db };
