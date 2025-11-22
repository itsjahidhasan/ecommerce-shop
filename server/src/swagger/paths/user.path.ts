export const userPaths = {
  "/api/v1/users/profile": {
    get: {
      tags: ["User"],
      summary: "Get user profile",
      description: "Retrieve logged-in user's profile information",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "User profile data",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserProfileResponse",
              },
            },
          },
        },
        404: {
          description: "User not found",
        },
      },
    },

    put: {
      tags: ["User"],
      summary: "Update user profile",
      description: "Update logged-in user's profile details",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateUserProfileRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  firstName: { type: "string" },
                  email: { type: "string" },
                  message: {
                    type: "string",
                    example: "Profile updated successfully",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "User not found",
        },
      },
    },
  },

  "/api/v1/users/addresses": {
    post: {
      tags: ["User"],
      summary: "Add new address",
      description: "Add address to user's profile",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AddressRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Address added successfully",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Address" },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/products/user/wishlist": {
    get: {
      tags: ["Wishlist"],
      summary: "Get wishlist",
      description: "Get logged-in user's wishlist",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "Wishlist products",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Product" },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/products/user/wishlist/{productId}": {
    post: {
      tags: ["Wishlist"],
      summary: "Toggle wishlist product",
      description: "Add or remove product from wishlist",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Wishlist updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  wishlist: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/products/{id}/reviews": {
    post: {
      tags: ["Reviews"],
      summary: "Add product review",
      description: "Add rating & review to a product",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ProductReviewRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Review added",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  averageRating: { type: "number", example: 4.5 },
                },
              },
            },
          },
        },
        400: {
          description: "Product already reviewed",
        },
      },
    },
  },
};
