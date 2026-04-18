import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WhatsApp AI Bot API",
      version: "1.0.0",
      description: "REST API for WhatsApp AI automation backend"
    },
    servers: [{ url: "/", description: "Current server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "admin@example.com" },
            password: { type: "string", example: "password123" }
          }
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" }
              }
            }
          }
        },
        Lead: {
          type: "object",
          properties: {
            _id: { type: "string" },
            phone: { type: "string" },
            name: { type: "string" },
            status: {
              type: "string",
              enum: ["new", "contacted", "converted", "lost"]
            },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" }
          }
        }
      }
    },
    paths: {
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Admin login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" }
              }
            }
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LoginResponse" }
                }
              }
            },
            401: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" }
                }
              }
            }
          }
        }
      },
      "/api/leads": {
        get: {
          tags: ["Leads"],
          summary: "Get all leads",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "List of leads",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Lead" }
                  }
                }
              }
            },
            401: { description: "Unauthorized" }
          }
        }
      },
      "/api/leads/{id}": {
        put: {
          tags: ["Leads"],
          summary: "Update lead status",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["new", "contacted", "converted", "lost"]
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Lead updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Lead" }
                }
              }
            },
            401: { description: "Unauthorized" },
            404: { description: "Lead not found" }
          }
        }
      }
    }
  },
  apis: []
};

export default swaggerJsdoc(options);
