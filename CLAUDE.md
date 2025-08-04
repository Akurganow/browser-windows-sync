# CLAUDE.md

This document contains comprehensive guidelines for Claude Code when working with this codebase. These instructions help maintain consistency, quality, and adherence to project standards.

## Core Principles

1. **NEVER try to find a bypass, ALWAYS find the root cause and resolve it**
   - Understand the underlying issue before attempting to fix it
   - Don't implement workarounds that mask the real problem
   - Investigate thoroughly to identify the true source of the issue

2. **NEVER take the easiest way, ALWAYS take the right way, there's no rush**
   - Prioritize correctness and maintainability over quick fixes
   - Consider the long-term implications of your changes

3. **ALWAYS respect project architecture and configuration**
   - Follow the established patterns and structures
   - Maintain separation of concerns

4. **ALWAYS strictly adhere to existing project practices, patterns, and conventions**
   - Follow the coding style used in the project
   - Maintain consistency with the rest of the codebase

5. **ALWAYS follow the best development practices and avoid antipatterns**
   - Write clean, readable, and maintainable code
   - Avoid code duplication
   - Write comprehensive tests

6. **ALWAYS be honest about limitations and potential issues in proposed
   solutions**
   - Document known limitations
   - Be transparent about potential edge cases

7. **NEVER hide mistakes or problems — be transparent and explain challenges clearly**
   - If you make a mistake, acknowledge it and learn from it

# Quality

## Code Quality Standards

### Quality Rules
1. **Delete dead code** - No commented "safety nets" or legacy conditions
2. **One implementation per feature** - Remove "old" methods when implementing "new" ones  
3. **Never suppress errors silently** - Let failures happen early and explicitly
4. **Avoid excessive conditionals** - Fix data preparation instead of adding more checks
5. **Complete refactoring, not partial** - Remove A + implement B in one PR
6. **No speculative code** - Forbidden: "might need", "backup", "temporary fix"

### Anti-Patterns to Avoid
```typescript
// ❌ BAD: Implicit side effects
function processUser(user: User) {
  updateCache(user);     // Hidden side effect
  sendNotification(user); // Hidden side effect
  return transformUser(user);
}

// ✅ GOOD: Explicit operations
function transformUser(user: User): TransformedUser { }
function updateUserCache(user: User): void { }
function sendUserNotification(user: User): Promise<void> { }
```

### Refactoring Guidelines
**When to refactor**:
- Remove unused code → delete immediately
- Consolidate duplicate code → merge & delete extras

**How to refactor**:
1. Snapshot tests first (if they exist)
2. Replace entire module in one branch
3. Remove legacy path in same commit  
4. Verify external behavior unchanged

# AI Guidelines

## General LLM Guidelines

As an AI assistant working with this codebase:

1. **Analyze before suggesting** - Thoroughly explore codebase structure first
2. **Follow existing patterns** - Identify and maintain established code patterns  
3. **Consider broader context** - Think about implications of suggested changes
4. **Be specific** - Provide exact file paths and line numbers when referencing code
5. **Present alternatives** - Offer multiple approaches with pros/cons when appropriate
6. **Explain reasoning** - Provide clear explanations for recommendations
7. **Search efficiently** - Use targeted queries to find relevant code sections
8. **Reference documentation** - Use existing docs when available

DO NOT run `npm run dev`!

## Script Execution Restrictions

- You may **ONLY** run scripts that are defined in `package.json` or located in the `scripts` directory
- For any other script execution, explicit permission must be requested
- **AVOID universal solutions** - Always implement solutions strictly tailored to current requirements
- **AVOID decreasing versions** - Do not decrease dependency versions unless explicitly required

## AI-Rules Maintenance

**CRITICAL - Auto-Generated Files**:
- **NEVER manually edit** auto-generated AI instruction files (CLAUDE.md, AGENTS.md, .junie, .cursor, etc.)
- **Source of truth**: Only `.rules/` directory files should be edited for AI instructions
- **Auto-sync process**: AI instruction files are generated automatically from `.rules/`
- **Manual edits will be lost** on next sync - always update source files in `.rules/`
- **README.md and documentation**: SHOULD be maintained and kept up-to-date manually

**When to update .rules**:
- Adding new services or utilities
- Changing project architecture
- Establishing new development conventions
- Modifying import patterns or project structure
- Creating new coding standards

**Requirements**:
- Review .rules updates as part of code review
- Remove outdated or conflicting information
- Include practical examples when helpful
- Reference related files when appropriate
- Keep files concise but preserve meaning

## Pattern Recognition Guidelines

### AI-Friendly Code Patterns
- **Searchable exports**: Use named exports, avoid `export *`
- **Meaningful constants**: `JIRA_API_TIMEOUT_MS = 30000` not magic numbers
- **Predictable structure**: Follow established service/util patterns
- **Self-documenting code**: Prefer descriptive names over comments

### Context Awareness
- Pattern recognition: Identify and follow existing patterns in the code
- Context awareness: Consider the broader implications of suggested changes
- Precision in references: When referring to code, be specific about file paths and line numbers
- Multiple solutions: Present alternative approaches when appropriate, with pros and cons
- Code search efficiency: Use targeted search queries to find relevant code sections
- Documentation integration: Reference existing documentation when available


---

*This document is automatically generated from rule definitions. Please refer to the source rules for the most up-to-date information.*