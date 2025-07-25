# Mork Playground

This repository contains the Mork Playground, a Next.js application designed to provide an interactive environment for exploring and testing various commands and functionalities related to the Mork project.

## Installation and Usage

To get started with the Mork Playground, you can use the provided `run.sh` script, which handles the installation of dependencies and starts the application.

```bash
bash <(curl -s https://raw.githubusercontent.com/arist76/mork-playground/main/run.sh)
```

You must have docker installed on you machine.

This command will:
1.  Clone the repository (if not already cloned).
2.  Install the necessary Node.js dependencies using `pnpm`.
3.  Build the Next.js application.
4.  Start the development server.

Once the server is running, you can access the Mork Playground in your web browser, typically at `http://localhost:3000`.

## Project Structure

The core application is located in the `playground/` directory, which is a standard Next.js project setup.

-   `playground/app/`: Contains the main application pages and API routes.
-   `playground/components/`: Houses reusable React components, including specific command implementations.
-   `playground/lib/`: Utility functions and API integrations.

## Development

If you wish to develop on the project, navigate into the `playground` directory and use the standard Next.js commands:

```bash
cd playground
pnpm install
pnpm run dev
```
