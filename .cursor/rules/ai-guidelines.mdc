---
type: always
name: ai-guidelines
description: Complete AI collaboration guidelines and project-specific rules
alwaysApply: true
applyTo: '**'

---
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
