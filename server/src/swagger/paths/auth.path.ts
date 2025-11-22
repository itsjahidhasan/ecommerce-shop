export const authPath = {
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a new user",
      description: "Register for a new user using ai services",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["firebaseToken"],
              properties: {
                firebaseToken: {
                  type: "string",
                  description: "Firebase authentication token for the user.",
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
            "application/json": {},
          },
        },
      },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login a user",
      description: "login for a user using ai services",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["firebaseToken"],
              properties: {
                firebaseToken: {
                  type: "string",
                  description: "Firebase authentication token for the user.",
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
                  accessToken: {
                    type: "string",
                    description: "JWT access token for the user.",
                  },
                  refreshToken: {
                    type: "string",
                    description: "JWT access token for the user.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
