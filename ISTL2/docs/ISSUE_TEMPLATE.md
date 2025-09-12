# Issue Template

Use this template when documenting new issues and their solutions.

## 📋 Quick Reference Entry
Copy this to the main table in `ISSUE_LOG_AND_FIXES.md`:

```
| YYYY-MM-DD | [Brief Issue Description] | [One-line fix summary] | [Files affected] | [Cursor prompt used] | [Status] |
```

## 📝 Detailed Issue Entry
Copy this template and fill it out for the detailed section:

### Issue #[Number]: [Issue Title]
**Date:** [YYYY-MM-DD]  
**Status:** [🔄 In Progress / ✅ Resolved / ❌ Failed]

#### Problem Description
```
[Paste the exact error message here]
```

[Describe what was happening and what the user was trying to do]

#### Root Cause
[Explain why this issue occurred]

#### Solution Applied
**Method:** [Brief description of the approach]

1. **[Step 1]:**
   ```[language]
   [Code snippet or command]
   ```

2. **[Step 2]:**
   ```[language]
   [Code snippet or command]
   ```

3. **[Step 3]:**
   ```[language]
   [Code snippet or command]
   ```

#### Files Modified
- `[file/path]` - [What was changed]
- `[file/path]` - [What was changed]

#### Cursor Prompts Used
1. **[Prompt context]:**
   ```
   "[Exact prompt used]"
   ```

2. **[Follow-up prompt]:**
   ```
   "[Exact prompt used]"
   ```

#### Prevention Measures
- [What can be done to prevent this in the future]
- [Best practices to follow]
- [Tools or processes to implement]

#### Testing
- [ ] [Test 1 description]
- [ ] [Test 2 description]
- [ ] [Test 3 description]

#### Lessons Learned
1. **[Lesson 1]**
2. **[Lesson 2]**
3. **[Lesson 3]**

---

## 🏷️ Common Tags
Use these tags when documenting issues:
- `postgresql` - Database-related issues
- `enum` - Enum type problems
- `deployment` - Vercel/deployment issues
- `prisma` - Prisma ORM issues
- `api` - API endpoint problems
- `schema` - Database schema changes
- `frontend` - UI/React issues
- `authentication` - Auth-related problems
- `payment` - Payment integration issues
- `performance` - Speed/optimization issues
- `security` - Security-related problems
- `migration` - Database migration issues
- `environment` - Environment variable issues
- `build` - Build/compilation errors
- `typescript` - TypeScript errors
- `css` - Styling issues
- `responsive` - Mobile/responsive design issues
