# Contributing to BuddyRide

Thank you for contributing to **BuddyRide**! This document provides practical engineering guidelines to ensure code quality, repository integrity, and smooth collaboration.

---

## 1. Branch Naming Conventions

All contributions must originate from a dedicated, descriptive Git branch created from the latest `main` branch. Use the following prefix conventions:

| Prefix | Usage | Example |
| :--- | :--- | :--- |
| `feat/` | New feature implementation | `feat/passenger-notification-bell` |
| `fix/` | Bug or defect resolution | `fix/admin-dashboard-auth-header` |
| `docs/` | Documentation additions or edits | `docs/buddyride-project-docs` |
| `refactor/`| Code refactoring without behavioral change | `refactor/fare-engine-types` |
| `test/` | Adding or updating test suites | `test/add-corridor-matching-cases` |
| `chore/` | Tooling, build config, or dependency updates | `chore/update-postcss-config` |

### Branch Lifecycle Workflow:
```powershell
# 1. Fetch latest changes from origin
git fetch origin main

# 2. Create and switch to your feature or documentation branch
git checkout -b <prefix>/<brief-hyphenated-description> origin/main
```

---

## 2. Commit Message Standards

BuddyRide adheres to the **Conventional Commits** specification:

```
<type>(<optional-scope>): <clear, imperative description>

[optional body providing technical rationale]

[optional footer referencing issues or pull requests]
```

### Types:
- `feat`: A new user-facing or API feature
- `fix`: A defect or bug fix
- `docs`: Documentation updates only
- `style`: Changes that do not affect code logic (formatting, white-space)
- `refactor`: Code restructuring without fixing a bug or adding a feature
- `test`: Adding or correcting tests
- `chore`: Changes to build process, package scripts, or repository configuration

### Examples:
- `docs: add BuddyRide project documentation`
- `fix(admin): forward auth header to stats endpoint`
- `feat(matching): add cross-track projection bounding`

---

## 3. Keeping Changes Focused & Atomic

- **Atomic Commits:** Each commit should represent a single logical change. Do not bundle unrelated bug fixes, feature work, and formatting changes into one commit.
- **Isolate Scope:** Touch only the files necessary to complete the task. Never stage auto-generated scratch files, local editor settings (`.vscode/` or `.idea/`), or system logs.
- **Preserve Unrelated Changes:** If your local working tree contains unrelated modifications, leave them unstaged or use Git stash to keep the submission clean.

---

## 4. Running Pre-Submission Checks

Before staging and committing changes, always run the relevant quality and integrity checks locally.

### Pre-Submission Checklist:

1. **Static Type Validation:**
   ```powershell
   npm.cmd run typecheck
   ```
   Must pass with 0 TypeScript errors under strict mode.

2. **Linting & Code Style:**
   ```powershell
   npm.cmd run lint
   ```
   Must pass with no ESLint errors or unhandled warnings.

3. **Algorithm Unit Tests:**
   ```powershell
   npm.cmd test
   ```
   Ensure all Vitest test suites execute and pass.

4. **Integration & Smoke Verification (if modifying routes/APIs):**
   ```powershell
   # With dev server running on port 3000:
   node tests/test-routes.mjs
   node tests/test-lifecycle.mjs
   ```

5. **Diff Cleanliness Check:**
   ```powershell
   # Check for trailing whitespace, merge conflict markers, or unintended diffs
   git diff --check
   ```

---

## 5. Opening Pull Requests

Once local verification is complete, push your branch and open a GitHub Pull Request (PR) targeted against `main`.

### Pull Request Title & Summary Structure
- **Title:** Match the conventional commit format (e.g., `docs: add BuddyRide project documentation`).
- **Description Template:**
  ```markdown
  ### Summary
  Brief explanation of the problem solved or documentation added.

  ### Changes Introduced
  - List of modified or added files and their specific role.

  ### Local Validation Results
  - [x] TypeScript type checking (`npm.cmd run typecheck`) passed
  - [x] Linting (`npm.cmd run lint`) passed
  - [x] Unit tests (`npm.cmd test`) passed
  - [x] Git diff check (`git diff --check`) clean

  ### SCM Classification
  - [x] Documentation-only change
  - [ ] Non-breaking functional change
  - [ ] Breaking change
  ```

---

## 6. Code Review Guidelines Before Merging

All Pull Requests require peer or maintainer review prior to merging:
1. **Verification of Acceptance Criteria:** Reviewers verify that changes fulfill requirements without introducing regressions.
2. **Architecture Compliance:** Code must adhere to existing architectural layers (e.g., domain logic in `features/`, database interactions behind `IRideRepository`, server actions in `app/api/`).
3. **Never Force-Push:** Do not force-push (`git push --force`) to shared branches.
4. **Preserve History:** Use standard merge commits or squash-and-merge depending on project maintainer guidelines.

---

## 7. Protecting Credentials & Sensitive Configuration

Maintaining security is an essential responsibility for all contributors:

- **Never Commit Secrets:** Never commit `.env`, `.env.local`, `.env.production`, private keys (`*.pem`, `*.key`), API tokens, or database passwords.
- **Use Environment Templates:** Document new environment variables in [`.env.example`](file:///d:/Projects/BuddyRide/.env.example) with sanitized dummy placeholders (e.g., `https://your-project.supabase.co`).
- **Inspect Staged Files:** Before committing, always run `git status` and `git diff --staged` to verify that no secret files or credentials have been staged.
- **Accidental Commit Protocol:** If secrets are accidentally committed, immediately notify project maintainers, rotate the exposed credentials, and follow repository remediation protocols.
