import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { createYoga } from "graphql-yoga";

import { routes } from "./routes";
import { schema } from "./graphql/schema";
import { createContext, type GraphQLContext } from "./graphql/context";

export class App {
  private readonly elysia;

  constructor() {
   const yoga = createYoga<{}, GraphQLContext>({
      schema,
      graphqlEndpoint: "/graphql",
      context: createContext,
    });

    this.elysia = new Elysia()
      .use(swagger({ path: "/docs" }))

      .get("/health", () => ({
        status: "ok",
      }))

      .all("/graphql", ({ request }) => yoga.fetch(request))

      .use(routes);
  }

  listen(port: number): void {
    this.elysia.listen(port, () => {
      console.log(
        `⚽ nat_cup listening on http://localhost:${port}`,
      );

      console.log(
        `📚 Docs at http://localhost:${port}/docs`,
      );

      console.log(
        `🔷 GraphQL at http://localhost:${port}/graphql`,
      );
    });
  }
}

