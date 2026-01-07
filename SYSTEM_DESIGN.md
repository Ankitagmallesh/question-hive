# Question Hive - System Design Document

## 🎯 **Project Overview**

Question Hive is a comprehensive question paper generation platform designed for educational institutions. It enables professors and educators to create, manage, and generate question papers efficiently using both manual input and AI-powered question generation.

## 🚀 **Technology Stack**

### **Frontend Architecture**
- **Framework**: Next.js 15 with App Router for modern React development
- **Authentication**: NextAuth.js v5 (Auth.js) for secure user management
- **UI Framework**: shadcn/ui components with Tailwind CSS for modern design
- **State Management**: Zustand for client state + React Query (TanStack Query) for server state
- **Form Management**: React Hook Form with Zod validation for type-safe forms
- **Drag & Drop**: @dnd-kit/core for intuitive question paper building
- **PDF Generation**: @react-pdf/renderer or Puppeteer for document creation
- **Icons**: Lucide React for consistent iconography
- **Deployment**: Vercel for seamless frontend hosting

### **Application Architecture**
- **Framework**: Next.js 15 (Monorepo)
- **Database Access**: Drizzle ORM (Direct access via Server Components/Actions)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **API**: Next.js Route Handlers (`app/api/*`)
- **Validation**: Zod (Shared between Front/Back)
- **Testing**: Vitest / Playwright

### **Database & Storage Solutions**
- **Primary Database**: PostgreSQL 15+ (Supabase)
- **ORM**: Drizzle ORM (Type-safe schema & queries)
- **Caching Layer**: Redis 7+ (Optional)
- **File Storage**: AWS S3 or Cloudinary

### **External Services & AI**
- **AI Integration**: Google Gemini API for intelligent question generation
- **PDF Processing**: @react-pdf/renderer (Client-side) or Puppeteer (Server-side)
- **Email Services**: Resend or SendGrid
- **Analytics**: PostHog or Mixpanel

## 🏗️ **System Architecture**

The application follows a modern **Next.js Monolith** architecture:

**Unified Application Layer (Next.js 15)**
- **App Router**: Handles both UI pages and API endpoints
- **Server Actions**: Manages secure data mutations and server-side logic
- **NextAuth.js**: Handles authentication (Client side + Server validation)
- **shadcn/ui + Tailwind**: Responsive, accessible UI components
- **@dnd-kit**: Drag-and-drop functionality for paper builder
- **React Hook Form + Zod**: Type-safe form validation

**Data & Services Layer**
- **Drizzle ORM**: Type-safe database access and migrations
- **PostgreSQL**: Primary database (Supabase)
- **Google Gemini API**: Artificial Intelligence for question generation
- **Redis (Optional)**: Caching layer if needed for high-scale


## 🗄️ **Database Design**

### **Core Entities**

**User Management**
- Users: Professor accounts with institutional affiliations
- Institutions: Educational organizations with subscription management
- Authentication: OAuth integration with provider tracking

**Academic Structure**
- Exams: JEE, NEET, CET with configurable difficulty levels
- Subjects: Mathematics, Physics, Chemistry with class-level organization
- Chapters: Detailed topic organization with weightage tracking

**Content Management**
- Questions: Comprehensive question bank with multiple formats (MCQ, numerical, descriptive)
- Question Papers: Customizable papers with layout configuration
- Question Usage: Analytics tracking for question utilization

### **Key Relationships**
- Users belong to Institutions with role-based access control
- Questions are organized by Chapter → Subject → Exam hierarchy
- Question Papers contain multiple Questions with positional data
- Usage tracking enables analytics and recommendation systems

## 🔐 **Authentication & Security**

**Authentication Flow**
- NextAuth.js provides multiple authentication providers (Google OAuth, credentials)
- JWT tokens ensure stateless authentication with secure session management
- Role-based access control separates user permissions
- Institution-based data isolation ensures multi-tenancy

**Security Measures**
- Password hashing using industry-standard algorithms
- CORS configuration for secure cross-origin requests
- Input validation at both frontend and backend layers
- Database soft deletes for data recovery and audit trails

## 📊 **Features & Functionality**

**Question Management**
- Manual question creation with rich text editing
- AI-powered question generation using Google Gemini
- Question categorization by difficulty, type, and topic
- Bulk import/export capabilities

**Paper Generation**
- Drag-and-drop interface for intuitive paper building
- Customizable layouts with institutional branding
- PDF generation with watermarks and formatting options
- Template system for consistent paper structure

**Analytics & Insights**
- Question usage tracking and analytics
- Paper generation statistics
- User activity monitoring
- Performance metrics and reporting

## 🚀 **Deployment Strategy**

**Unified Deployment**
- Vercel hosting for optimal Next.js performance
- Automatic deployments from Git repositories
- Global CDN distribution for fast loading times
- Environment-specific configurations for different stages (Dev, Staging, Prod)

**Database & Storage**
- Managed PostgreSQL for reliability and backup
- Redis cluster for high availability caching (if needed)
- Cloud storage integration for file management
- Regular backup schedules and disaster recovery

## 📈 **Scalability Considerations**

**Performance Optimization**
- Database indexing for efficient queries
- Redis caching for frequently accessed data
- CDN integration for static asset delivery
- API rate limiting and request optimization

**Horizontal Scaling**
- Stateless backend design for easy scaling
- Database read replicas for improved performance
- Microservices architecture for independent scaling
- Load balancing for traffic distribution

## 🔮 **Future Enhancements**

**Advanced Features**
- Machine learning-powered question recommendations
- Real-time collaborative paper editing
- Advanced analytics and reporting dashboards
- Mobile application development

**Integration Possibilities**
- Learning Management System (LMS) integration
- Third-party assessment tool connectivity
- Plagiarism detection services
- Advanced AI models for question generation