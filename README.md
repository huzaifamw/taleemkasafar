# 📚 Taleemkasafar - Entry Test Preparation Platform

**A comprehensive Next.js-based platform for Pakistani entry test preparation with mock tests, practice modes, and performance analytics.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🎯 Overview

Taleemkasafar helps students prepare for university entry tests with:
- **2 Complete Tests**: NET Engineering & PU Lahore
- **1,444+ Questions**: Comprehensive question bank
- **Mock Test Mode**: Simulated exam environment (100 questions, 80 minutes)
- **Practice Mode**: Subject-wise practice with instant feedback
- **Performance Analytics**: Track progress and identify weak areas
- **Past Papers**: Previous year questions for exam preparation

---

## ✨ Features

### 🎓 For Students
- ✅ **Mock Tests**: Full-length practice tests with timer
- ✅ **Subject Practice**: Practice by subject (English, Urdu, Math, IQ, GK)
- ✅ **Chapter-wise Practice**: Targeted practice by chapter
- ✅ **Past Papers**: Previous year questions
- ✅ **Performance Dashboard**: View scores, time taken, accuracy
- ✅ **Answer Review**: Review correct/incorrect answers after test
- ✅ **Progress Tracking**: Monitor improvement over time

### 👨‍💼 For Admins
- ✅ **Question Management**: Add/edit/delete questions
- ✅ **Test Configuration**: Configure mock test blueprints
- ✅ **User Management**: View registered users
- ✅ **Analytics Dashboard**: Platform-wide statistics

### 🔐 Authentication & Security
- ✅ **Supabase Auth**: Secure email/password authentication
- ✅ **Google OAuth**: Sign in with Google
- ✅ **Row Level Security**: Database-level access control
- ✅ **Protected Routes**: Authenticated-only access

---

## 🚀 Live Demo

**Production:** [https://taleemkasafar-chi.vercel.app](https://taleemkasafar-chi.vercel.app)

**Admin Panel:** [https://taleemkasafar-chi.vercel.app/admin](https://taleemkasafar-chi.vercel.app/admin)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Hosting** | Vercel |
| **UI Components** | Radix UI, Lucide Icons |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Git installed

### 1. Clone Repository
```bash
git clone https://github.com/huzaifamw/taleemkasafar.git
cd taleemkasafar/Taleemkasafar
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
GEMINI_API_KEY=your-gemini-key (optional)
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📊 Database Schema

### Core Tables
- **`entry_tests`** - Entry test definitions (NET, PU)
- **`subjects`** - Subjects (English, Math, etc.)
- **`chapters`** - Subject chapters
- **`topics`** - Chapter topics
- **`questions`** - Question bank
- **`question_options`** - Multiple choice options
- **`mock_test_blueprints`** - Mock test structure
- **`mock_test_attempts`** - User test attempts
- **`user_answers`** - Submitted answers

### Views
- **`entry_test_public`** - Public entry test catalog
- **`mock_attempt_summary`** - Test result aggregation

---

## 📖 Available Entry Tests

### 1. NET Engineering Test
- **Total Questions:** 200+
- **Subjects:** English, Math, Physics, Chemistry, IQ
- **Mock Test:** 100 questions, 80 minutes
- **Target:** NUST, PIEAS, GIKI, UET

### 2. PU Lahore Test
- **Total Questions:** 1,444
- **Subjects:** English, Urdu, Math, IQ, General Knowledge
- **Mock Test:** 100 questions, 80 minutes
- **Target:** Punjab University admissions

---

## 🎯 Mock Test Structure

| Subject | Questions | Marks | Time |
|---------|-----------|-------|------|
| English | 20 | 20 | 16 min |
| Urdu | 20 | 20 | 16 min |
| Mathematics | 20 | 20 | 16 min |
| IQ | 20 | 20 | 16 min |
| General Knowledge | 20 | 20 | 16 min |
| **Total** | **100** | **100** | **80 min** |

---

## 🚀 Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import repository
4. Add environment variables
5. Deploy!

See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for detailed instructions.

---

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT-GUIDE.md)** - Complete deployment instructions
- **[Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)** - Step-by-step deployment
- **[PU Test Setup](./docs/PU_TEST_SETUP.md)** - PU test configuration
- **[Admin Guide](./docs/PU_ADMIN_GUIDE.md)** - Admin panel usage

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 👥 Team

**Developed by:**
- **Huzaifa** - Lead Developer ([whuzaifa64@gmail.com](mailto:whuzaifa64@gmail.com))
- **Salah-ul-Din** - Co-Developer ([huzaifa83941@gmail.com](mailto:huzaifa83941@gmail.com))

---

## 📧 Support

- **Email:** whuzaifa64@gmail.com
- **Repository:** [github.com/huzaifamw/taleemkasafar](https://github.com/huzaifamw/taleemkasafar)
- **Issues:** [github.com/huzaifamw/taleemkasafar/issues](https://github.com/huzaifamw/taleemkasafar/issues)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Supabase for database and authentication
- Vercel for hosting
- Next.js team for the amazing framework
- All contributors and testers

---

**Made with ❤️ in Pakistan**
