#!/usr/bin/env python3
"""
Quick Project Health Check
===========================

Analisi rapida dello stato del progetto per identificare problemi critici.

Usage:
    python quick_health_check.py
"""

import os
import re
from pathlib import Path
from collections import defaultdict

class Colors:
    """ANSI color codes"""
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(80)}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}\n")

def print_section(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{text}{Colors.RESET}")
    print(f"{Colors.BLUE}{'-'*60}{Colors.RESET}")

def check_project_godot():
    """Verifica configurazione project.godot"""
    print_section("📋 Checking project.godot")
    
    if not os.path.exists('project.godot'):
        print(f"{Colors.RED}❌ project.godot not found!{Colors.RESET}")
        return False
    
    with open('project.godot', 'r') as f:
        content = f.read()
    
    # Conta autoload
    autoload_pattern = r'^\w+=".*"$'
    autoloads = re.findall(autoload_pattern, content, re.MULTILINE)
    
    # Manager consolidati attesi
    expected_managers = [
        'CoreDataManager',
        'PlayerSystemManager',
        'WorldSystemManager',
        'NarrativeSystemManager',
        'CombatSystemManager',
        'InterfaceSystemManager',
        'PersistenceSystemManager'
    ]
    
    # Manager legacy (alias)
    legacy_managers = [
        'TimeManager', 'EventManager', 'DataManager',
        'PlayerManager', 'SkillCheckManager', 'QuestManager',
        'NarrativeManager', 'CraftingManager', 'CombatManager',
        'InputManager', 'ThemeManager', 'SaveLoadManager'
    ]
    
    found_managers = []
    found_legacy = []
    
    for autoload in autoloads:
        name = autoload.split('=')[0]
        if name in expected_managers:
            found_managers.append(name)
        elif name in legacy_managers:
            found_legacy.append(name)
    
    print(f"Total autoloads: {Colors.CYAN}{len(autoloads)}{Colors.RESET}")
    print(f"Expected managers (7): {Colors.GREEN if len(found_managers) == 7 else Colors.YELLOW}{len(found_managers)}{Colors.RESET}")
    print(f"Legacy aliases: {Colors.RED if found_legacy else Colors.GREEN}{len(found_legacy)}{Colors.RESET}")
    
    if found_legacy:
        print(f"\n{Colors.YELLOW}⚠️  Legacy aliases found:{Colors.RESET}")
        for legacy in found_legacy:
            print(f"   - {legacy}")
        print(f"\n{Colors.RED}❌ CRITICAL: Project has legacy aliases (19 total vs 7 expected){Colors.RESET}")
        return False
    
    if len(found_managers) == 7:
        print(f"{Colors.GREEN}✅ GOOD: All 7 consolidated managers found{Colors.RESET}")
        return True
    else:
        print(f"{Colors.YELLOW}⚠️  WARNING: Manager count mismatch{Colors.RESET}")
        return False

def check_manager_references():
    """Quick check di riferimenti ai manager legacy"""
    print_section("🔍 Checking Legacy Manager References")
    
    legacy_managers = [
        'TimeManager', 'EventManager', 'DataManager',
        'PlayerManager', 'SkillCheckManager', 'QuestManager'
    ]
    
    references = defaultdict(int)
    file_count = 0
    
    for gd_file in Path('scripts').rglob('*.gd'):
        file_count += 1
        try:
            with open(gd_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for manager in legacy_managers:
                pattern = rf'\b{manager}\.'
                matches = re.findall(pattern, content)
                if matches:
                    references[manager] += len(matches)
        except:
            pass
    
    total_refs = sum(references.values())
    
    print(f"Files scanned: {Colors.CYAN}{file_count}{Colors.RESET}")
    print(f"Legacy references found: {Colors.RED if total_refs > 0 else Colors.GREEN}{total_refs}{Colors.RESET}")
    
    if total_refs > 0:
        print(f"\n{Colors.YELLOW}References by manager:{Colors.RESET}")
        for manager, count in sorted(references.items(), key=lambda x: -x[1]):
            print(f"   {Colors.RED}❌{Colors.RESET} {manager}: {count}")
        print(f"\n{Colors.RED}❌ CRITICAL: Code uses legacy manager names{Colors.RESET}")
        return False
    else:
        print(f"{Colors.GREEN}✅ GOOD: No legacy references in code{Colors.RESET}")
        return True

def check_documentation():
    """Verifica coerenza documentazione"""
    print_section("📚 Checking Documentation")
    
    critical_docs = [
        'README.md',
        'CHANGELOG.md',
        'Progetto/01_ARCHITETTURA_GENERALE.md',
        'Progetto/03_SINGLETON_MANAGERS.md'
    ]
    
    found = 0
    for doc in critical_docs:
        if os.path.exists(doc):
            found += 1
            
            # Quick check se menziona i numeri giusti
            with open(doc, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Cerca menzioni di "7 manager" o simili
            has_seven = bool(re.search(r'7\s+manager', content, re.IGNORECASE))
            has_nineteen = bool(re.search(r'19\s+manager', content, re.IGNORECASE))
            has_twelve = bool(re.search(r'12\s+manager', content, re.IGNORECASE))
            
            status = f"{Colors.GREEN}✓{Colors.RESET}"
            if has_nineteen:
                status = f"{Colors.RED}✗ (mentions 19){Colors.RESET}"
            elif has_twelve and not has_seven:
                status = f"{Colors.YELLOW}⚠ (mentions 12, not 7){Colors.RESET}"
            elif has_seven:
                status = f"{Colors.GREEN}✓ (mentions 7){Colors.RESET}"
            else:
                status = f"{Colors.YELLOW}? (unclear){Colors.RESET}"
            
            print(f"   {status} {doc}")
        else:
            print(f"   {Colors.RED}✗{Colors.RESET} {doc} - NOT FOUND")
    
    print(f"\nDocumentation files found: {Colors.CYAN}{found}/{len(critical_docs)}{Colors.RESET}")
    
    if found < len(critical_docs):
        print(f"{Colors.YELLOW}⚠️  WARNING: Some documentation missing{Colors.RESET}")
        return False
    
    return True

def check_database_files():
    """Verifica presenza file database JSON"""
    print_section("🗄️  Checking Database Files")
    
    critical_databases = [
        'data/items/weapons.json',
        'data/items/armor.json',
        'data/items/consumables.json',
        'data/events/biomes/forest_events.json',
        'data/enemies/enemies.json',
        'data/crafting/recipes.json'
    ]
    
    found = 0
    for db in critical_databases:
        exists = os.path.exists(db)
        status = f"{Colors.GREEN}✓{Colors.RESET}" if exists else f"{Colors.RED}✗{Colors.RESET}"
        print(f"   {status} {db}")
        if exists:
            found += 1
    
    print(f"\nDatabase files found: {Colors.CYAN}{found}/{len(critical_databases)}{Colors.RESET}")
    
    if found == len(critical_databases):
        print(f"{Colors.GREEN}✅ GOOD: All critical databases present{Colors.RESET}")
        return True
    else:
        print(f"{Colors.RED}❌ CRITICAL: Missing database files{Colors.RESET}")
        return False

def generate_health_score(checks):
    """Genera health score del progetto"""
    print_header("🏥 PROJECT HEALTH SCORE")
    
    passed = sum(checks.values())
    total = len(checks)
    percentage = (passed / total) * 100 if total > 0 else 0
    
    print(f"Checks passed: {Colors.CYAN}{passed}/{total}{Colors.RESET}")
    print(f"Health score: ", end="")
    
    if percentage >= 80:
        print(f"{Colors.GREEN}{Colors.BOLD}{percentage:.1f}%{Colors.RESET} {Colors.GREEN}(HEALTHY){Colors.RESET}")
    elif percentage >= 50:
        print(f"{Colors.YELLOW}{Colors.BOLD}{percentage:.1f}%{Colors.RESET} {Colors.YELLOW}(NEEDS ATTENTION){Colors.RESET}")
    else:
        print(f"{Colors.RED}{Colors.BOLD}{percentage:.1f}%{Colors.RESET} {Colors.RED}(CRITICAL){Colors.RESET}")
    
    print()
    
    # Detailed results
    for check_name, passed in checks.items():
        status = f"{Colors.GREEN}✅ PASS{Colors.RESET}" if passed else f"{Colors.RED}❌ FAIL{Colors.RESET}"
        print(f"   {status} - {check_name}")
    
    return percentage

def generate_recommendation(score, checks):
    """Genera raccomandazione basata su health score"""
    print_header("💡 RECOMMENDATIONS")
    
    if score >= 80:
        print(f"{Colors.GREEN}✅ Project is in good health!{Colors.RESET}")
        print("   No critical issues detected.")
        print("   Continue with regular development.")
        return
    
    if not checks.get('project_godot', True):
        print(f"{Colors.RED}🚨 CRITICAL: Legacy manager aliases detected!{Colors.RESET}")
        print(f"   {Colors.YELLOW}Action required:{Colors.RESET}")
        print("   1. Read REFACTORING_DECISION.md")
        print("   2. Choose Option B (recommended) or Option A")
        print("   3. Execute RECOVERY_PLAN_OPTION_B.md")
        print()
    
    if not checks.get('manager_references', True):
        print(f"{Colors.RED}🚨 CRITICAL: Code uses legacy manager names!{Colors.RESET}")
        print(f"   {Colors.YELLOW}Action required:{Colors.RESET}")
        print("   1. Run: python scripts/tools/audit_manager_references.py")
        print("   2. Review full list of references to refactor")
        print("   3. Follow refactoring plan step-by-step")
        print()
    
    if not checks.get('database_files', True):
        print(f"{Colors.RED}⚠️  WARNING: Missing database files!{Colors.RESET}")
        print("   Restore from backup or regenerate")
        print()
    
    print(f"{Colors.YELLOW}Overall: Project needs refactoring work{Colors.RESET}")
    print("   Estimated effort: 160 hours (4 weeks)")
    print("   See RECOVERY_PLAN_OPTION_B.md for details")

def main():
    print_header("🏥 THE SAFE PLACE - PROJECT HEALTH CHECK")
    
    print(f"{Colors.MAGENTA}Running quick diagnostics...{Colors.RESET}\n")
    
    # Run all checks
    checks = {
        'project_godot': check_project_godot(),
        'manager_references': check_manager_references(),
        'documentation': check_documentation(),
        'database_files': check_database_files()
    }
    
    # Generate score
    score = generate_health_score(checks)
    
    # Generate recommendations
    generate_recommendation(score, checks)
    
    print_header("END OF HEALTH CHECK")
    
    # Exit code based on health
    if score >= 80:
        return 0  # Success
    elif score >= 50:
        return 1  # Warning
    else:
        return 2  # Critical

if __name__ == '__main__':
    import sys
    sys.exit(main())
