export const authPath = {
  "/api/v1/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register new user",
      description: "Create a new user account with email and password",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["firstName", "lastName", "email", "password"],
              properties: {
                firstName: {
                  type: "string",
                  example: "Jahid",
                },
                lastName: {
                  type: "string",
                  example: "Hasan",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "jahid@example.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "StrongPass123!",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  _id: {
                    type: "string",
                    example: "6652a8bfa21b3e9b08f77291",
                  },
                  firstName: {
                    type: "string",
                    example: "Jahid",
                  },
                  email: {
                    type: "string",
                    example: "jahid@example.com",
                  },
                  role: {
                    type: "string",
                    example: "user",
                  },
                  token: {
                    type: "string",
                    description: "JWT access token",
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "User already exists or invalid input",
        },
      },
    },
  },

  "/api/v1/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login user",
      description: "Authenticate user and return JWT token",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "jahid@example.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "StrongPass123!",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  _id: {
                    type: "string",
                    example: "6652a8bfa21b3e9b08f77291",
                  },
                  firstName: {
                    type: "string",
                    example: "Jahid",
                  },
                  email: {
                    type: "string",
                    example: "jahid@example.com",
                  },
                  role: {
                    type: "string",
                    example: "user",
                  },
                  token: {
                    type: "string",
                    description: "JWT access token",
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Invalid email or password",
        },
      },
    },
  },
};
