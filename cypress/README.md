# E2E Testing with Cypress

This directory contains End-to-End (E2E) tests for The Safe Place using Cypress.

## Test Structure

### `e2e/game-flow.cy.ts`
Tests the main game flow from menu to gameplay:
- Main menu loading
- New game startup
- Game UI elements display
- Basic movement
- Inventory operations
- Pause menu functionality
- Game over conditions

### `e2e/critical-journeys.cy.ts`
Tests critical user journeys:
- Complete game startup sequence
- Inventory operations
- Character sheet operations
- Level up screen
- Shelter operations
- Save/load functionality
- Options screen
- Story screen
- Instructions screen

## Running Tests

### Headless (CI/CD)
```bash
npm run test:e2e
```

### Interactive GUI
```bash
npm run test:e2e:open
```

### Headed (visible browser)
```bash
npm run test:e2e:headed
```

## Test Prerequisites

1. Development server must be running on `http://localhost:5173`
2. Start the dev server first:
   ```bash
   npm run dev
   ```

## Test Coverage

The E2E tests cover:
- ✅ Main menu navigation
- ✅ Character creation flow
- ✅ Game loading sequence
- ✅ UI element visibility
- ✅ Keyboard input handling
- ✅ Screen transitions
- ✅ Save/load operations
- ✅ Menu system functionality

## Configuration

- **Base URL**: `http://localhost:5173`
- **Test Timeout**: 10 seconds for loading operations
- **Browser**: Electron (headless), Chrome (headed)

## Custom Commands

Located in `cypress/support/commands.ts`:
- `cy.startNewGame()` - Starts a new game
- `cy.waitForGameLoad()` - Waits for game loading to complete
- `cy.movePlayer(direction)` - Moves player in specified direction
- `cy.checkPlayerPosition(x, y)` - Verifies player position
- `cy.checkPlayerHP(hp)` - Verifies player HP
- `cy.openInventory()` - Opens inventory screen
- `cy.checkEventDisplayed(title)` - Checks if event is displayed
- `cy.selectEventChoice(index)` - Selects event choice by index

## Best Practices

1. **Wait for Loading**: Always wait for loading screens to disappear
2. **Keyboard Navigation**: Test uses keyboard-only navigation (no mouse)
3. **State Verification**: Check UI elements rather than internal state
4. **Timeouts**: Use appropriate timeouts for async operations
5. **Isolation**: Each test should be independent

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:
- No external dependencies beyond the application itself
- Deterministic test execution
- Clear pass/fail criteria
- Comprehensive coverage of critical paths