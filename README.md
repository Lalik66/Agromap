# Agromap

A modern web platform for agricultural suppliers with dark-white minimalist design. This platform enables suppliers to register, manage their products, create offers, process orders, and interact with managers.

## Features

- User Management (registration, authorization, profiles)
- Product Management (catalog, offers)
- Order Management (orders, deliveries, mixed orders)
- Offer Templates
- Interactions (notifications, communications, event feed)
- Manager Contacts
- Settings and Administration
- Analytics and Reporting
- Integration with external systems

## Tech Stack

- **Frontend**: Next.js with TypeScript, modern UI libraries
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Hosting**: Render

## Project Structure

```
agromap/
├── client/              # Next.js frontend application
├── server/              # Express backend API
├── package.json         # Root package.json for project scripts
└── README.md            # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm run install-all
   ```
3. Set up environment variables:
   - Create `.env` files in both client and server directories

### Development

```
npm run dev
```

### Production Build

```
npm run build
```

## Deployment on Render

See the [deployment documentation](./docs/deployment.md) for detailed instructions.

## Architecture

The application follows a modular architecture with separate frontend and backend services, communicating through RESTful APIs.

## Database Schema

See the [database schema documentation](./docs/db-schema.md) for details. 