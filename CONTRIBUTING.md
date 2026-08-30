# 🤝 Contributing to Taleemkasafar

Thank you for considering contributing to Taleemkasafar! We welcome contributions from the community.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

---

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints and experiences

---

## 💡 How Can I Contribute?

### 🐛 Reporting Bugs
- Use GitHub Issues
- Include clear title and description
- Provide steps to reproduce
- Include screenshots if applicable
- Mention your environment (OS, browser, Node version)

### ✨ Suggesting Features
- Open a GitHub Issue with [Feature Request] tag
- Explain the use case clearly
- Describe expected behavior
- Consider backward compatibility

### 🔧 Code Contributions
- Fix bugs from Issues
- Implement new features
- Improve documentation
- Optimize performance
- Add tests

---

## 🛠️ Development Setup

### 1. Fork & Clone
```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR-USERNAME/taleemkasafar.git
cd taleemkasafar/Taleemkasafar
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

---

## 🔄 Pull Request Process

### Before Submitting
1. ✅ Test your changes locally
2. ✅ Run `npm run build` successfully
3. ✅ Run `npm run lint` without errors
4. ✅ Update documentation if needed
5. ✅ Add comments for complex logic

### Submission Steps
1. **Commit your changes** following commit guidelines
2. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Open Pull Request** on GitHub
4. **Fill PR template** completely
5. **Link related issues** using "Fixes #123"

### PR Review Process
- Maintainers will review within 2-3 days
- Address feedback and make requested changes
- Once approved, maintainer will merge

---

## 📏 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React/Next.js
- Use functional components with hooks
- Follow Next.js App Router conventions
- Use Server Components by default
- Client Components only when needed (`'use client'`)

### Styling
- Use Tailwind CSS utilities
- Follow existing design patterns
- Ensure mobile responsiveness
- Test on multiple screen sizes

### File Structure
```
app/
  ├── (dashboard)/       # Authenticated routes
  ├── auth/              # Authentication pages
  └── api/               # API routes
components/
  ├── auth/              # Auth-related components
  ├── dashboard/         # Dashboard components
  └── ui/                # Reusable UI components
lib/
  ├── queries/           # Database queries
  ├── supabase/          # Supabase clients
  └── utils/             # Utility functions
```

### Code Quality
- **No console.logs** in production code
- **Handle errors** gracefully with try-catch
- **Add loading states** for async operations
- **Validate user inputs** on both client and server
- **Use constants** for magic numbers/strings

---

## 📝 Commit Message Guidelines

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(quiz): add timer functionality to mock tests

- Add countdown timer component
- Show time remaining for each subject
- Auto-submit when time expires
- Display time taken after submission

Closes #45
```

```bash
fix(auth): resolve Google OAuth redirect loop

- Update callback URL handling
- Add error boundary for auth failures
- Improve error messages

Fixes #78
```

```bash
docs: update installation instructions

- Add Node.js version requirement
- Clarify Supabase setup steps
- Add troubleshooting section
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Signup/Login works
- [ ] Dashboard loads correctly
- [ ] Can start mock test
- [ ] Questions display properly
- [ ] Can submit answers
- [ ] Results page shows correctly
- [ ] Mobile responsive
- [ ] No console errors

### Before Submitting PR
```bash
# Build test
npm run build

# Lint check
npm run lint

# Type check
npm run type-check
```

---

## 📂 Project-Specific Guidelines

### Adding Questions
1. Use the admin panel or SQL scripts
2. Ensure questions have 4 options
3. Mark correct answer properly
4. Add to appropriate subject/topic
5. Validate import with test queries

### Database Changes
1. Create migration file in `supabase/migrations/`
2. Name: `YYYYMMDDHHMMSS_description.sql`
3. Test locally before pushing
4. Document changes in migration file
5. Add rollback instructions

### UI Components
1. Follow existing design system
2. Use Radix UI for complex components
3. Ensure accessibility (ARIA labels)
4. Test keyboard navigation
5. Add loading/error states

---

## 🐛 Debugging Tips

### Database Issues
```sql
-- Check test visibility
SELECT * FROM entry_test_public;

-- Verify questions count
SELECT COUNT(*) FROM questions WHERE subject_id IN (
  SELECT s.id FROM subjects s
  JOIN test_subjects ts ON ts.subject_id = s.id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
);
```

### Cache Issues
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Auth Issues
- Check Supabase redirect URLs
- Verify environment variables
- Check browser console for errors
- Test in incognito mode

---

## 📞 Getting Help

- **Questions?** Open a GitHub Discussion
- **Bug?** Create an Issue with details
- **Feature Idea?** Start a Discussion first
- **Need Clarification?** Comment on existing Issue/PR

---

## 🎉 Recognition

Contributors will be:
- Listed in project README
- Credited in release notes
- Mentioned in project documentation

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Taleemkasafar! 🚀**

Together, we're helping students succeed in their entry tests!
