# E-Shop: Modern E-commerce Platform

<div align="center">
  <h3>A Full-Stack E-commerce Solution with Microservices Architecture</h3>
</div>

## 🌟 Features

- **Multi-UI System**

  - 🛍️ User Interface (Next.js)
  - 🏪 Seller Dashboard (Next.js)
  - Modern, responsive design with Tailwind CSS

- **Authentication & Authorization**

  - 🔐 Secure user authentication
  - 🔑 JWT with refresh token mechanism
  - 📧 Email verification system
  - 🔄 Password reset functionality
  - 👥 Role-based access control (Users/Sellers)

- **Payment Integration**
  - 💳 Stripe Connect for seller payments
  - 🏦 Secure payment processing
  - 💰 Multi-currency support

## 🏗️ Architecture

The project follows a microservices architecture using Nx monorepo:

```
apps/
├── api-gateway/      # API Gateway service
├── auth-service/     # Authentication & user management
├── seller-ui/        # Seller dashboard frontend
└── user-ui/         # Customer-facing frontend

packages/
├── error-handler/   # Shared error handling
└── libs/           # Shared libraries
    ├── prisma/     # Database access layer
    └── redis/      # Caching layer
```

## 🚀 Technology Stack

- **Frontend**

  - Next.js 13+ (App Router)
  - TypeScript
  - Tailwind CSS
  - React Query

- **Backend**

  - Node.js
  - Express
  - Prisma (ORM)
  - Redis (Caching)
  - PostgreSQL

- **DevOps & Tools**
  - Nx (Monorepo)
  - Docker
  - Jest (Testing)

## 🛠️ Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/eshop.git
   cd eshop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy example env files
   cp .env.example .env
   ```

4. **Start development servers**

   ```bash
   # Start all services
   npx nx run-many --target=serve --projects=api-gateway,auth-service,user-ui,seller-ui --parallel=4

   # Or start individual services
   npx nx serve auth-service
   npx nx serve user-ui
   npx nx serve seller-ui
   ```

## 📚 Documentation

- API Documentation is available at `/api/docs` after starting the services
- Swagger UI for API testing and documentation
- Each microservice contains its own README with specific setup instructions

## 🧪 Testing

```bash
# Run all tests
npx nx run-many --target=test --all

# Test specific project
npx nx test auth-service
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Nx](https://nx.dev/) for the excellent monorepo tooling
- [Next.js](https://nextjs.org/) for the fantastic React framework
- [Stripe](https://stripe.com/) for payment processing
