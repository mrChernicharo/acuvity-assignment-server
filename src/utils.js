import { faker } from "@faker-js/faker";

faker.seed(894_712);

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function stringifyData(data) {
  let jsonString = "";
  data.forEach((entry) => {
    jsonString += `${JSON.stringify(entry)}\n`;
  });
  return jsonString;
}

export async function createRandomNodes(nodeCount) {
  return new Promise((resolve) => {
    let i = 0;
    function createRandomNode() {
      i++;
      return {
        id: i,
        name: faker.person.firstName(),
        category: faker.number.int({ min: 0, max: 9 }),
        avatar: faker.image.avatar(),
        birthDate: faker.date.birthdate(),
        company: faker.company.name(),
        balance: faker.finance.amount({ symbol: "$ ", min: 200, max: 100_000, autoFormat: true }),
        registeredAt: faker.date.past(),
        favoriteFood: faker.food.dish(),
      };
    }

    const nodes = faker.helpers.multiple(createRandomNode, {
      count: nodeCount,
    });
    resolve(nodes);
  });
}

export async function createRandomEdges(nodes, edgeCount) {
  return new Promise((resolve) => {
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
    resolve(edges);
  });
}
