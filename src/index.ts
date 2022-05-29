import express from "express";
import {graphqlHTTP} from "express-graphql";
import {useServer} from "graphql-ws/lib/use/ws";
import {WebSocketServer} from "ws";
import cors from "cors";
import {PubSub} from "graphql-subscriptions";
import {root, schema} from "./schema";

export const pubsub = new PubSub();

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
    maxAge: 10000000,
  })
);

const rootValue = Object.entries(root).reduce((acc, [key, value]) => {
  acc = {...acc, ...value};
  return acc;
}, {});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: rootValue,
    context: {pubsub},
    graphiql: true,
  })
);

// Listening to our server
const server = app.listen(process.env.PORT || 4000, () => {
  const wsServer = new WebSocketServer({
    server,
    path: "/graphql",
  });
  useServer(
    {
      schema,
      roots: root,
      context: {pubsub},
    },
    wsServer
  );
  console.log(`GraphQL server with Express running on http://localhost:${process.env.PORT || 4000}/graphql`);
});
