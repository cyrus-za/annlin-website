# Annlin Church Website

A modern church website built with Next.js 15+, migrated from WordPress to provide better performance, maintainability, and user experience for the Gereformeerde Kerk Pretoria-Annlin community.

## 🚀 Features

- **Modern Tech Stack**: Next.js 16 with TypeScript, Turbopack, and Tailwind CSS
- **Content Management**: Rich text editor for news articles and announcements
- **Event Calendar**: Interactive calendar with recurring events support
- **Service Groups**: Showcase ministry groups with contact information
- **Reading Materials**: PDF and document management system
- **Contact Forms**: Multiple contact forms for different inquiries
- **Mobile-First Design**: Responsive design optimized for all devices
- **SEO Optimized**: Built-in SEO features and structured data
- **Performance**: Optimized images, lazy loading, and fast loading times

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: NeonDB (PostgreSQL) with Prisma ORM
- **Authentication**: better-auth for secure admin access
- **File Storage**: Cloudflare R2 for the WordPress media archive and Vercel Blob for new admin uploads
- **Email**: Resend for transactional emails
- **Rich Text**: Tiptap editor with Markdown storage
- **Deployment**: Vercel with automatic deployments

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/cyrus-za/annlin-website.git
cd annlin-website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` - NeonDB connection string
- `BETTER_AUTH_SECRET` - 32-character secret for authentication
- `RESEND_API_KEY` - Resend API key for emails
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed setup instructions.

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # Reusable React components
│   ├── ui/               # Base UI components
│   ├── admin/            # Admin dashboard components
│   └── public/           # Public website components
├── lib/                  # Utility functions and configurations
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
├── prisma/               # Database schema and migrations
├── scripts/              # Migration and utility scripts
└── public/               # Static assets
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Run TypeScript type checking

### Code Quality

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Configured for Next.js with strict rules
- **Prettier**: Code formatting (configure in your editor)
- **Husky**: Git hooks for pre-commit checks (optional)

## 🗄️ Database

The application uses Prisma ORM with PostgreSQL (NeonDB) for data management:

- **Users**: Admin user management with roles
- **Service Groups**: Ministry groups and contact information
- **Events**: Calendar events with categories and recurrence
- **Articles**: News articles with rich text content
- **Reading Materials**: Documents and resources
- **Contact Submissions**: Form submissions and inquiries
- **Audit Logs**: Track all content changes

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push to main branch

### Manual Deployment

```bash
npm run build
npm run start
```

## 🔄 WordPress Migration

The project includes migration scripts to import content from the existing WordPress site:

1. Import structured content from the WordPress REST APIs.
2. Archive the complete WordPress media library to Cloudflare R2.
3. Rewrite database media and internal-page references.
4. Run the migration, inline-asset, and public-link audits before shutdown.

See migration scripts in the `scripts/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏛️ About Gereformeerde Kerk Pretoria-Annlin

This website serves the Gereformeerde Kerk Pretoria-Annlin community, providing information about services, events, ministry groups, and resources for spiritual growth.

---

Built with ❤️ for the Annlin church community
