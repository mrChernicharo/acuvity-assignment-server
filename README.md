# Acuvity Assignment/Server

1. clone repository
```bash
git clone https://github.com/mrChernicharo/acuvity-assignment-server

cd acuvity-assignment-server
```
2. install dependencies
```bash
npm install
```

3. run the app
```bash
# create 2 .jsonl files (nodes.jsonl & edges.jsonl) at the `/data` directory
# start web api as soon as data is created
npm run dev
```
---

- tip:
  
you can adjust the values for `NODE_COUNT` and `EDGE_COUNT` at the `DB.js` file if you want. 

this will change the amount of nodes and links. By default we're creating 50k nodes and 100k edges

```
const NODE_COUNT = 50_000;
const EDGE_COUNT = 100_000;
```


## Technologies used:
- node.js
- express
- faker
- node-jsonl