import { getTags } from "../swagger/tags";
import { authPath } from "../swagger/paths/auth.path";
import { userPaths } from "../swagger/paths/user.path";
import { securitySchemes } from "../swagger/security.schemes";

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Backend API",
      version: "1.0.0",
      description: "API documentation for the AI Backend project.",
    },
    // security: [{ BearerAuth: [] }],
    tags: [...getTags],
    paths: { ...authPath, ...userPaths },
    components: {
      schemas: {},
      securitySchemes: {
        ...securitySchemes,
      },
    },
  },
  apis: [], // You can add paths to files with JSDoc comments if needed
};

console.log("Swagger documentation initialized", swaggerOptions);

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwaggerDocs = (app: any) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger docs available at /api-docs`);
};
