import fs from "node:fs/promises";
import { faker } from "@faker-js/faker";

faker.seed(210_382);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function createRandomNodes(nodeCount) {
  let i = 0;
  function createRandomNode() {
    i++;
    return {
      id: i,
      name: faker.person.firstName(),
      category: faker.number.int({ min: 0, max: 9 }),
      userId: faker.string.uuid(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      password: faker.internet.password(),
      birthdate: faker.date.birthdate(),
      company: faker.company.name(),
      balance: faker.finance.amount({ symbol: "$", min: 200, max: 100_000 }),
      registeredAt: faker.date.past(),
      favoritteFood: faker.food.dish(),
    };
  }

  const nodes = faker.helpers.multiple(createRandomNode, {
    count: nodeCount,
  });
  return nodes;
}

function createRandomEdges(nodes, edgeCount) {
  const nodeIds = nodes.map((n) => n.id);
  const edgeStrings = new Set();

  let i = 0;
  while (i <= edgeCount) {
    let nodeA = 0;
    let nodeB = 0;
    do {
      nodeA = getRandomInt(1, nodeIds.length);
      nodeB = getRandomInt(1, nodeIds.length);
    } while (nodeA === nodeB && edgeStrings.has(`${nodeA}:::${nodeB}`) && edgeStrings.has(`${nodeB}:::${nodeA}`));

    edgeStrings.add(`${nodeA}:::${nodeB}`);
    i++;
  }

  const edges = Array.from(edgeStrings).map((edgeStr, i) => {
    const [source, destination] = edgeStr.split(":::");
    return {
      id: i + 1,
      source: +source,
      destination: +destination,
    };
  });
  //   console.log(edgeStrings, edges);
  return edges;
}

function stringifyData(data) {
  let jsonString = "";
  data.forEach((entry) => {
    jsonString += `${JSON.stringify(entry)}\n`;
  });
  return jsonString;
}

async function writeToJsonLFile(data, filename) {
  try {
    const jsonString = stringifyData(data);

    await fs.mkdir("data", { recursive: true });

    await fs.writeFile(`data/${filename}.jsonl`, jsonString);

    console.log(`JSON data saved to ${filename}.jsonl`);
  } catch (err) {
    console.error("Error writing to file:", err);
  }
}

async function initializeDataFiles(nodeCount, edgeCount) {
  const nodes = createRandomNodes(nodeCount);
  const edges = createRandomEdges(nodes, edgeCount);
  await Promise.all([writeToJsonLFile(nodes, "nodes"), writeToJsonLFile(edges, "edges")]);
}

export { initializeDataFiles };
