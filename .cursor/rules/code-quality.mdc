---
type: always
name: code-quality
description: Code quality standards
alwaysApply: true
applyTo: '**'

---
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
