# Contributing to TrackCart

Thank you for your interest in contributing to **TrackCart – Intelligent Order & Delivery Tracking Platform**!

---

## 1. Branching & Git Workflow

We adhere to standard Gitflow principles:

- `main`: Production release branch. Only merged from `develop` via tagged releases.
- `develop`: Primary integration branch. All feature branches merge here via reviewed Pull Requests.
- `feature/*`: Specific feature branches (e.g., `feature/order-management`, `feature/shipment-tracking`).
- `bugfix/*`: Bug fixes created from `develop`.
- `hotfix/*`: Emergency patches created directly from `main`.

---

## 2. Commit Message Standards

We follow Conventional Commits formatting:

```text
<type>(<scope>): <subject>

[optional body]
[optional footer(s)]
```

### Allowed Types:
- `feat`: A new feature for users
- `fix`: A bug fix
- `docs`: Documentation updates
- `style`: Code formatting changes (whitespace, missing semi-colons, etc.)
- `refactor`: Code refactoring without behavioral alterations
- `test`: Adding or correcting automated tests
- `chore`: Tooling, build scripts, or dependencies

---

## 3. Pull Request Guidelines

Every Pull Request must:
1. Reference a clear, scoped objective.
2. Ensure backend passes `mvn test -Dtest=TrackCartDomainTest -o`.
3. Ensure frontend passes `npm test` and `npm run build`.
4. Include descriptions of changes and testing evidence.
5. Contain zero dead code or placeholder buttons.

---

## 4. Code Standards

- **Backend (Java / Spring Boot)**:
  - Follow clean architecture: Controller -> Service -> Repository.
  - Never put domain logic directly inside Controllers.
  - Wrap database mutations inside `@Transactional`.
  - Validate all incoming DTO requests using `@Valid`.
- **Frontend (React / Vite / Tailwind)**:
  - Do not use generic AI templates or excessive blue themes.
  - All buttons must perform real actions or trigger verified dialogs.
  - Keep styling consistent with Slate / Emerald accents.
