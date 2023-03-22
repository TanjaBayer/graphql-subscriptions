import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { SampleResolver } from './resolver/subscription.resolver';

import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';

import ws from 'ws';
import expressPlayground from 'graphql-playground-middleware-express';
import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';
async function bootstrap() {
  const app = express();

  const httpServer = createServer(app);

  // Build the TypeGraphQL schema
  const schema = await buildSchema({
    resolvers: [SampleResolver],
  });

  const server = new ApolloServer({
    schema,
  });

  await server.start();

  server.applyMiddleware({ app, path: '/graphql' });

  app.get(
    '/playground',
    expressPlayground({
      endpoint: '/graphql',
    })
  );

  httpServer.listen({ port: 8000 }, () => {
    const ws_server = new ws.Server({
      server: httpServer,
      path: '/graphql',
    });

    useServer({ schema }, ws_server);

    console.log('Apollo Server on http://localhost:8000/graphql');
  });
  //console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
