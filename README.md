# 📚 Taleem ka Safar

> A modern entry-test preparation platform for students preparing for competitive exams in Pakistan

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🎯 Features

### 📖 Smart Subject Organization
- Choose your entry test (starting with **NET Engineering**)
- Browse subjects, chapters, and topics with structured navigation
- Track your progress across all subjects

### 🎓 Flexible Practice Modes
- **Practice Mode**: Learn with instant feedback on correct answers and detailed explanations
- **Past Paper Mode**: Practice with real exam questions from previous years
- **Mock Tests**: Timed, multi-subject test papers that simulate actual exam conditions

### 📊 Performance Analytics
- Detailed accuracy tracking by subject, chapter, and topic
- Identify weak areas and monitor improvement over time
- Complete mock test history with performance trends

### 🔐 Secure Authentication
- Email/password authentication
- Google OAuth integration
- Protected user data with Row Level Security (RLS)

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and Server Components
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **Custom Design System** - Soft Brutalist aesthetic with accessible components

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service platform
- **[PostgreSQL 17](https://www.postgresql.org/)** - Robust relational database
- **Row Level Security (RLS)** - Database-level authorization
- **Real-time subscriptions** - Live data updates

### Development Tools
- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[ESLint](https://eslint.org/)** - Code linting
- **Server Actions** - Type-safe server mutations
- **Server Components** - Zero-bundle client JavaScript where possible

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **pnpm**
- A **Supabase** account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/huzaifa2964/taleemkasafar.git
   cd taleemkasafar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_anon_key
   ```

   Get these values from your Supabase project settings:
   - Go to **Project Settings** → **API**
   - Copy the **Project URL** and **anon/public key**

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
taleemkasafar/
├── app/                      # Next.js App Router pages
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── subjects/         # Subject browsing and practice
│   │   ├── mock/             # Mock test engine
│   │   ├── performance/      # Analytics dashboard
│   │   └── page.tsx          # Home/dashboard
│   └── auth/                 # Authentication flows
├── components/               # React components
│   ├── auth/                 # Sign-in, sign-up forms
│   ├── dashboard/            # Dashboard UI components
│   ├── quiz/                 # Quiz engine components
│   └── ui/                   # Reusable UI primitives
├── lib/                      # Core business logic
│   ├── queries/              # Database query functions
│   ├── quiz/                 # Quiz scoring & session logic
│   └── supabase/             # Supabase client setup
├── supabase/                 # Database migrations
│   ├── migrations/           # Versioned SQL migrations
│   └── config.toml           # Supabase configuration
└── public/                   # Static assets
```

---

## 🗄️ Database Setup

### Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Link to your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Apply migrations**
   ```bash
   supabase db push
   ```

4. **Generate TypeScript types**
   ```bash
   supabase gen types typescript --linked > lib/database.types.ts
   ```

### Database Schema

The platform uses PostgreSQL with the following core tables:
- **Catalog**: Entry tests, subjects, chapters, topics
- **Questions**: MCQs with difficulty levels and explanations
- **Mock Definitions**: Blueprint templates for mock tests
- **User Progress**: Attempts, bookmarks, and performance tracking

All tables use Row Level Security (RLS) to ensure users can only access their own data.

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Create optimized production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint code quality checks |
| `npm run test` | Run unit tests with Vitest |

---

## 🌐 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.local`

3. **Configure Supabase**
   - Add your production URL to **Supabase → Authentication → URL Configuration**
   - Update **Site URL** and **Redirect URLs**

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Tests are written using Vitest and cover:
- Quiz scoring logic
- Mock test generation
- Session state management
- Math expression parsing

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Taleem ka Safar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Authors

- **Huzaifa** - [@huzaifamw](https://github.com/huzaifamw)
- **Salah-ul-Din** - [@salah-ul-din](https://github.com/salah-ul-din)

---

## 🙏 Acknowledgments

- Built with modern React Server Components architecture
- Powered by Supabase for authentication and data persistence
- UI inspired by Soft Brutalist design principles

---

<div align="center">
  <p>Made with ❤️ for students preparing for entry tests in Pakistan</p>
  <p>
    <a href="https://github.com/huzaifa2964/taleemkasafar/issues">Report Bug</a>
    ·
    <a href="https://github.com/huzaifa2964/taleemkasafar/issues">Request Feature</a>
  </p>
</div>
