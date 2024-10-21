# Acuvity Assignment/Server

1. install dependencies
```bash
npm install
```

2. run the app
```bash
npm run dev
```

`npm run dev` will create 2 .jsonl files (nodes.jsonl & edges.jsonl) at the `/data` directory

you can adjust the values for `NODE_COUNT` and `EDGE_COUNT` at the `DB.js` file if you want. this will change the amount of nodes and links. By default we're creating 50k nodes and 100k edges

```
const NODE_COUNT = 50_000;
const EDGE_COUNT = 100_000;
```