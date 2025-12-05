# CU Marketplace

![Node](https://img.shields.io/badge/Node.js-v18+-green)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Tests](https://img.shields.io/badge/Tests-Mocha%20%26%20Chai-brightgreen)
![Deployment](https://img.shields.io/badge/Deployed-Render-purple)

## Brief Application Description
CU Marketplace is a full-stack web application built exclusively for the University of Colorado Boulder community. It provides a secure, campus-only marketplace where students can buy and sell items using their CU credentials. The platform supports user authentication, item listings, searching, and full CRUD functionality for posts.

Key features include:
- Secure user registration and login
- Posting items with images, price, category, and descriptions
- Browsing and searching listings
- Viewing seller and item details
- Editing and deleting personal listings

---

## Contributors
The following team members contributed to the development of CU Marketplace:

- **Ben Snyder** — Backend API development, database architecture & integration, seed data  
- **Ben Baumert** — Backend API development, testing, bug fixing, documentation  
- **Connor Collier** — Frontend HTML development, functionality, demo video, deployment  
- **Michael Jervis** — Frontend development (Handlebars), CSS, UI/UX design  

---

## Technology Stack
- **Node.js** – Server-side JavaScript runtime  
- **Express.js** – Web framework for backend APIs  
- **Express-Handlebars** – Templating engine for dynamic HTML  
- **PostgreSQL** – Relational database management  
- **pg-promise** – PostgreSQL database interface  
- **Docker & Docker Compose** – Containerized development environment  
- **Mocha & Chai** – Automated testing framework  
- **Render** – Cloud deployment platform  
- **GitHub** – Version control and project collaboration  

---

## Prerequisites
To run this application locally, the following must be installed:

- Node.js (v18 or higher)
- Docker
- Docker Compose
- Git
- PostgreSQL (only if running outside Docker)

---

## Instructions to Run the Application Locally
1. Clone the repository:  
`git clone https://github.com/CU-CSCI3308-Fall2025/group-project-besn8476`  
`cd group-project-besn8476`

2. Create a `.env` file in the root directory:

POSTGRES_DB=cu_marketplace  
POSTGRES_USER=postgres  
POSTGRES_PASSWORD=postgres  
DB_HOST=db  
DB_PORT=5432  
SESSION_SECRET=your_secret_here  

4. Build and start the application using Docker:  
`docker compose up --build`

5. Open the application in your browser:  
`http://localhost:4444`

---

## How to Run the Tests
All automated tests are written using Mocha and Chai.

Run tests locally with:  
`npm test`

Or run tests within the Docker container:  
`docker exec -it project_web npm test`

---

## Link to the Deployed Application
Live Application:  
https://the-cu-marketplace.onrender.com/

---

## License
This project is licensed under the ISC License.
