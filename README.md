# API Bun Hono Bootstrap

**api_bun_hono_bootstrap** is a GitHub template designed to help you quickly kickstart the development of a new API using modern, efficient technologies. The template leverages [Bun](https://bun.sh) for the runtime and [Hono](https://hono.dev) as the lightweight, fast framework for building APIs. It also includes essential tools and dependencies to ensure your API is production-ready from the start.

It offers a bootstrap for 

- User management 
- Authentication (with email / password and JWT)
- File storage (using an S3 like object storage)

## Getting Started

This template is intended to be a reusable starting point for developers aiming to create APIs quickly with a well-organized structure and a set of best practices. The template integrates common dependencies and sets up a basic file organization that can be easily extended and customized according to your project needs.

## Start Using It

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your_username/api_bun_hono_bootstrap.git
   cd api_bun_hono_bootstrap
   ```

2. **Install dependencies using Bun:**

   ```bash
   bun install
   ```

3. **Create the env variables:**

   ```bash
   cp .env.example .env
   # edit .env
   ```

4. **Generate db client:**

   ```bash
   bunx prisma generate
   ```

5. **Run the development server:**

   ```bash
   bun run env:start
   ```

6. **Load the db**

   ```
   bunx prisma migrate dev
   ```

7. **Run the app**

   ```
   bun run dev
   ```

Your API should now be running locally and accessible at `http://localhost:3000`.

## Structure & Dependencies

### Dependencies

- **[Bun](https://bun.sh):** A fast, modern runtime for JavaScript and TypeScript.
- **[Hono](https://hono.dev):** A small, performant, and versatile web framework for building APIs.
- **[Zod](https://zod.dev):** TypeScript-first schema validation.
- **[Zod Validator](https://github.com/darkristy/zod-validator):** Utility for integrating Zod validation with Hono routes.
- **[Prisma](https://www.prisma.io):** An ORM for working with databases in a type-safe manner.
- **[uuid](https://www.npmjs.com/package/uuid):** A helper to generate uuid v4 
- **[Amazon s3 client](https://www.npmjs.com/package/@aws-sdk/client-s3):** The official s3 connector
- **[Brevo](https://www.brevo.com/pricing/):** Email sending platform

### Structure

The project is organized with simplicity and scalability in mind:

```
api_bun_hono_bootstrap/
│
├── src/
│   ├── routes/                             # Define all your API routes here
│   |   ├── authentication/                 # Define what is needed for the /authentication route
│   |   |   ├── authentication.route.ts     # Contains the http /authentication routes
│   |   |   └── authentication.schema.ts    # Contains the payload and parameters validations for /authentication
│   |   ├── files/                          # Define what is needed for the /files route
│   |   |   ├── files.service.ts            # Contains the connector to S3 like bucket
│   |   |   ├── files.route.ts              # Contains the http /files routes
│   |   |   └── files.schema.ts             # Contains the payload and parameters validations for /files
│   |   ├── users/                          # Define what is needed for the /users route
│   |   |   ├── users.route.ts              # Contains the http /users routes
│   |   |   └── users.schema.ts             # Contains the payload and parameters validations for /users
│   ├── services/                           # Business logic and core services
│   ├── utils/                              # Helper functions and utilities
│   ├── models/                             # Prisma models and database schemas
│   └── index.ts                            # Main entry point for your application
│
├── env.sh                                  # A docker entry point for the dependencies (database, s3)
├── .eslintrc.json                          # Linting rules and configuration
├── tsconfig.json                           # TypeScript configuration
└── README.md                               # Project documentation
```

This structure keeps your code modular and easy to maintain as the project grows.

## Conventions

### File Naming

- File names should use the following syntax **[scope].[type].ts** (e.g., `users.model.ts`) to ensure consistency.
- Folder names should be descriptive of their purpose (e.g., `routes`, `services`, `utils`).

### Analysis

- The project follows strict linting rules to maintain code quality:
  - **ESLint** is configured to enforce consistent coding standards.
  - **Prettier** is used for automatic formatting.
  
To run the linter:

```bash
bun run lint
```

---

This template is designed to be flexible, allowing you to add or remove tools as your project needs evolve. Happy coding!