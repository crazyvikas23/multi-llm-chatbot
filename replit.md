# LLM Comparison Tool

## Overview

This is a React-based web application that allows users to compare responses from multiple Large Language Model (LLM) providers simultaneously. Users can input a query and select from OpenAI, Anthropic, Google, and Cohere APIs to get side-by-side comparisons of their responses. The application features a clean interface built with shadcn/ui components and provides real-time status updates as each LLM processes the query.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server for fast hot module replacement
- React Router (wouter) for lightweight client-side routing
- TanStack Query for server state management and caching
- shadcn/ui component library built on Radix UI primitives for consistent design
- Tailwind CSS for utility-first styling with CSS variables for theming
- Support for both light and dark themes

**Backend Architecture**
- Express.js server with TypeScript for API endpoints
- RESTful API design with `/api/query` endpoint for LLM interactions
- Memory-based storage using Map for query history (easily replaceable with database)
- Concurrent LLM querying with Promise.allSettled for parallel processing
- Error handling with status tracking (waiting, loading, complete, error)
- Development-only Vite integration for seamless full-stack development

**Database Design**
- Drizzle ORM configured for PostgreSQL with migrations support
- Schema defines queries table with id, query text, responses JSON, and timestamps
- Prepared for Neon Database serverless PostgreSQL integration
- Currently using in-memory storage with interface for easy database migration

**LLM Integration Service**
- Unified LLMService class handling multiple providers:
  - OpenAI GPT (latest model: gpt-5)
  - Anthropic Claude (latest model: claude-sonnet-4-20250514)
  - Google Gemini (latest model: gemini-2.5-flash)
  - Cohere (planned integration)
- Provider-agnostic error handling and response formatting
- API key management per provider for secure access

**Authentication & Security**
- API key validation per LLM provider
- Environment variable configuration for database connection
- CORS and security headers for production deployment
- Input validation using Zod schemas

**State Management**
- React Query for server state with automatic caching and invalidation
- Local React state for form inputs and UI interactions
- Context API for theme management
- Custom hooks for LLM querying and mobile responsiveness

## External Dependencies

**LLM Provider APIs**
- OpenAI API (@openai/api) for GPT models
- Anthropic SDK (@anthropic-ai/sdk) for Claude models
- Google Generative AI (@google/genai) for Gemini models
- Cohere API integration (planned)

**Database Services**
- Neon Database (@neondatabase/serverless) for PostgreSQL hosting
- Drizzle ORM (drizzle-orm) for database queries and migrations
- Connection pooling and serverless optimization

**UI Framework & Styling**
- Radix UI primitives for accessible components
- Tailwind CSS for utility-based styling
- Lucene React and React Icons for iconography
- Class Variance Authority for component variant management

**Development Tools**
- Vite for development server and build process
- TypeScript for static type checking
- ESBuild for production bundling
- Replit-specific plugins for development environment integration

**Form & Validation**
- React Hook Form for form state management
- Zod for runtime type validation and schema definition
- Hookform resolvers for form validation integration

**Utility Libraries**
- date-fns for date manipulation
- clsx and tailwind-merge for conditional CSS classes
- nanoid for unique ID generation
- cmdk for command palette functionality