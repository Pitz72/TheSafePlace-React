# 🧪 Testing & Anti-Regression Guide - The Safe Place v0.4.1

## 📋 **Panoramica Documento**

Questo documento stabilisce le procedure di testing e anti-regressione per garantire la stabilità e qualità del progetto The Safe Place attraverso le versioni future.

---

## 🎯 **Testing Strategy**

### 🏗️ **Pyramid Testing Approach**

```
    🔺 E2E Tests (Manual)
   🔺🔺 Integration Tests (Automated)
 🔺🔺🔺🔺 Unit Tests (TestFramework)
```

#### **Unit Tests (Base)**
- **Framework**: `TestFramework.gd`
- **Coverage Target**: 80% core managers
- **Execution**: Automated via Godot editor
- **Frequency**: Every commit

#### **Integration Tests (Middle)**
- **Focus**: Manager interactions, signal chains
- **Coverage**: UI ↔ Manager communication
- **Execution**: Semi-automated
- **Frequency**: Every release

#### **E2E Tests (Top)**
- **Focus**: Complete user workflows
- **Coverage**: Game scenarios end-to-end
- **Execution**: Manual testing protocol
- **Frequency**: Major releases

---

## 🧪 **Unit Testing Framework**

### 📁 **File Structure**
```
scripts/tools/
├── TestFramework.gd          # Base testing framework
├── PlayerManagerTests.gd     # Player system tests
├── DataManagerTests.gd       # [FUTURE] Data loading tests
├── EventManagerTests.gd      # [FUTURE] Event system tests
└── TSPLogger.gd             # Logging per test results
```

### 🔧 **TestFramework Usage**

#### **Creating New Test Class**
```gdscript
# NewSystemTests.gd
extends TestFramework

func test_new_functionality():
    setup()
    
    # Test implementation
    var result = SystemManager.do_something()
    assert_not_null(result, "Result should exist")
    assert_equal(expected_value, result, "Result should match")
    
    teardown()

func setup():
    # Reset state for clean test
    pass

func teardown():
    # Cleanup after test
    pass
```

#### **Running Tests**
```gdscript
# In Godot Editor console or script
var test_runner = PlayerManagerTests.new()
var results = test_runner.run_all_tests()
print("Success Rate: %.1f%%" % results.success_rate)
```

### ✅ **Assertion Methods Available**

| Method | Purpose | Example |
|--------|---------|---------|
| `assert_true(condition, msg)` | Verify boolean true | `assert_true(player.is_alive, "Player should be alive")` |
| `assert_false(condition, msg)` | Verify boolean false | `assert_false(inventory.is_empty, "Inventory should have items")` |
| `assert_equal(expected, actual, msg)` | Value equality | `assert_equal(100, player.hp, "HP should be 100")` |
| `assert_not_equal(expected, actual, msg)` | Value inequality | `assert_not_equal(0, item_count, "Should have items")` |
| `assert_null(value, msg)` | Verify null value | `assert_null(error, "No error should occur")` |
| `assert_not_null(value, msg)` | Verify non-null | `assert_not_null(character, "Character should exist")` |
| `assert_has_key(dict, key, msg)` | Dictionary key check | `assert_has_key(stats, "forza", "Stats should have strength")` |

---

## 🔍 **Anti-Regression Checklist**

### 🚨 **Critical Systems Validation**

#### **✅ Pre-Release Checklist**

**🎮 Core Game Functions**
- [ ] Personaggio creation completata senza errori
- [ ] Movement system responsive (WASD/arrows)
- [ ] Inventory system functional (add/remove/count)
- [ ] Save/Load system operational [WHEN IMPLEMENTED]
- [ ] Event system triggering correttamente

**🔧 Manager Systems**
- [ ] PlayerManager: stats, HP, resources management
- [ ] DataManager: JSON loading, item database access
- [ ] EventManager: random events, skill checks, cooldowns
- [ ] TimeManager: day/night cycle, automatic penalties
- [ ] InputManager: keyboard input routing

**🖥️ UI Systems**
- [ ] All panels render correctly
- [ ] Keyboard navigation functional
- [ ] Popup systems working (events, inventory)
- [ ] Text rendering (Perfect DOS VGA font)
- [ ] Color coding for categories/levels

**📊 Data Integrity**
- [ ] All JSON files load without errors
- [ ] Item database validation passes
- [ ] Event files accessible per biome
- [ ] No missing asset references

### 🐛 **Known Issues Monitor**

#### **🔴 Critical Issues to Watch**
1. **Global Class Conflicts**
   - Monitor: New `class_name` declarations
   - Check: No conflicts with Godot built-ins
   - Action: Use TSPLogger pattern for utilities

2. **Infinite Initialization Loops**
   - Monitor: Signal connection retry counters
   - Check: Max attempt limits respected
   - Action: Implement circuit breakers

3. **JSON Loading Failures**
   - Monitor: DataManager file loading
   - Check: All referenced files exist
   - Action: Validate paths before loading

4. **Memory Leaks Signal Connections**
   - Monitor: Signal connection/disconnection balance
   - Check: No orphaned connections
   - Action: Proper cleanup in _exit_tree()

#### **🟡 Medium Issues to Track**
1. **Performance Degradation**
   - Monitor: FPS in large maps (>60 FPS target)
   - Check: Load times <3s
   - Action: Profile and optimize hot paths

2. **UI Responsiveness**
   - Monitor: Input lag (<16ms target)
   - Check: Keyboard navigation smooth
   - Action: Optimize input handling

---

## 🔧 **Automated Testing Procedures**

### 📋 **Test Execution Protocol**

#### **1. Pre-Commit Tests**
```bash
# Run via Godot editor or script
# Should complete in <30 seconds
PlayerManagerTests.new().run_all_tests()
```

#### **2. Pre-Release Tests**
```bash
# Full test suite execution
# Should complete in <5 minutes
var all_tests = [
    PlayerManagerTests.new(),
    # DataManagerTests.new(),    # [FUTURE]
    # EventManagerTests.new(),   # [FUTURE]
]

for test_class in all_tests:
    var results = test_class.run_all_tests()
    if results.success_rate < 100.0:
        push_error("Test failures detected!")
```

#### **3. Performance Benchmarks**
```gdscript
# Performance validation
func benchmark_core_systems():
    var start_time = Time.get_unix_time_from_system()
    
    # Test critical paths
    PlayerManager.prepare_new_character_data()  # Should be <100ms
    DataManager.get_item_by_id("water_purified")  # Should be <10ms
    EventManager.get_random_event("forest")  # Should be <50ms
    
    var total_time = Time.get_unix_time_from_system() - start_time
    assert_true(total_time < 1.0, "Core operations should complete in <1s")
```

---

## 📊 **Quality Metrics**

### 🎯 **Target Metrics**

| Metric | Target | Current v0.4.1 | Status |
|--------|--------|-----------------|--------|
| **Unit Test Coverage** | 80% | ~60% PlayerManager | 🟡 In Progress |
| **Parsing Errors** | 0 | 0 | ✅ Met |
| **Load Time** | <3s | ~1.5s | ✅ Met |
| **FPS (1080p)** | >60 | ~75 | ✅ Met |
| **Memory Usage** | <100MB | ~65MB | ✅ Met |
| **Input Lag** | <16ms | ~8ms | ✅ Met |

### 📈 **Coverage Progress Tracking**

#### **Current Test Coverage**
- **PlayerManager**: ✅ 60% (5/8 major functions)
  - ✅ Character creation
  - ✅ Inventory operations  
  - ✅ Resource management
  - ✅ Skill check system
  - ✅ Experience system
  - ❌ [Missing] Equipment system
  - ❌ [Missing] Progression system
  - ❌ [Missing] Save/load validation

#### **Future Test Targets**
- **DataManager**: 🔄 [PLANNED] Database operations, validation
- **EventManager**: 🔄 [PLANNED] Event triggering, cooldowns
- **TimeManager**: 🔄 [PLANNED] Time progression, penalties
- **UI Components**: 🔄 [PLANNED] Panel rendering, input handling

---

## 🚨 **Regression Detection**

### 🔍 **Automated Regression Checks**

#### **Critical Path Monitoring**
```gdscript
# scripts/tools/RegressionTests.gd [FUTURE]
extends TestFramework

func test_no_regression_character_creation():
    # Ensure character creation still works
    var char_data = PlayerManager.prepare_new_character_data()
    assert_not_null(char_data)
    assert_has_key(char_data, "stats")
    # Previous regression: stats not properly initialized

func test_no_regression_logging_conflicts():
    # Ensure TSPLogger accessible without conflicts
    TSPLogger.info("RegressionTest", "Testing logging accessibility")
    # Previous regression: TheSafePlaceLogger not declared

func test_no_regression_json_loading():
    # Ensure all critical JSON files load
    var items = DataManager.get_all_items()
    assert_true(items.size() > 0, "Items should load")
    # Previous regression: Missing database files
```

### 📋 **Manual Regression Protocol**

#### **🕹️ Game Flow Validation** (15 min protocol)
1. **Start Game** (2 min)
   - Launch project in Godot
   - Character creation screen appears
   - Generate stats successfully
   - Enter game world

2. **Basic Gameplay** (8 min)
   - Move in all 4 directions
   - Open/close inventory (I key)
   - Trigger at least 2 random events
   - Complete 1 skill check successfully
   - Check resource decreases (food/water)

3. **UI Validation** (3 min)
   - All text renders correctly
   - Keyboard navigation responsive
   - No error messages in console
   - CRT effects active (if enabled)

4. **System Integration** (2 min)
   - Time progression working
   - Event cooldowns functioning
   - Log messages appearing
   - No memory warnings

---

## 📚 **Test Documentation Standards**

### ✍️ **Test Method Naming**
```gdscript
# Pattern: test_{what}_{scenario}
func test_inventory_add_valid_item():
func test_inventory_add_invalid_item():
func test_skill_check_success_scenario():
func test_skill_check_failure_scenario():
```

### 📝 **Test Description Format**
```gdscript
## Test character creation generates valid stats
## Verifies that prepare_new_character_data() returns:
## - Non-null character data dictionary
## - Stats dictionary with all 6 attributes
## - HP values calculated from vigor stat
## - All stat values within valid D&D range (3-18)
func test_character_data_preparation():
    # Implementation
```

### 🏷️ **Test Categories**
- `#smoke` - Critical functionality tests
- `#regression` - Anti-regression checks
- `#integration` - Cross-system tests
- `#performance` - Benchmark validation

---

## 🔄 **Continuous Improvement**

### 📈 **Test Evolution Strategy**

#### **Phase 1**: Core Coverage (v0.4.x)
- Complete PlayerManager coverage
- Add DataManager basic tests
- Establish regression baseline

#### **Phase 2**: System Integration (v0.5.x)
- Manager interaction tests
- UI integration validation
- Performance benchmarking

#### **Phase 3**: E2E Automation (v0.6.x)
- Automated gameplay scenarios
- Save/load testing
- Stress testing framework

### 🎯 **Quality Gates**

#### **Pre-Merge Requirements**
- ✅ All existing tests pass (100%)
- ✅ New code covered by tests (>70%)
- ✅ No new parsing errors
- ✅ Performance benchmarks pass

#### **Pre-Release Requirements**
- ✅ Full test suite passes
- ✅ Manual regression protocol completed
- ✅ Performance metrics met
- ✅ Documentation updated

---

## 🚀 **Future Testing Enhancements**

### 🔮 **Planned Improvements**

#### **Test Infrastructure**
- [ ] Automated test runner integration
- [ ] CI/CD pipeline for testing
- [ ] Performance monitoring dashboard
- [ ] Test result visualization

#### **Coverage Expansion**
- [ ] UI component testing framework
- [ ] Save/load system validation
- [ ] Multiplayer testing [IF IMPLEMENTED]
- [ ] Mobile platform testing [IF IMPLEMENTED]

#### **Quality Tools**
- [ ] Static code analysis integration
- [ ] Automated performance profiling
- [ ] Memory leak detection
- [ ] Dependency validation

---

**📅 Last Updated**: 2024-12-19  
**✅ Document Version**: v0.4.1  
**👥 Maintainer**: Development Team + Claude AI  
**🔄 Review Cycle**: Every major release  

---

*Questo documento serve come guida vivente per mantenere la qualità del codice. Aggiornare ad ogni release con nuovi pattern e lesson learned.*