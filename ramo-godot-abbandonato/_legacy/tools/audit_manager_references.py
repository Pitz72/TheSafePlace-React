#!/usr/bin/env python3
"""
Manager Reference Audit Tool
=============================

Analizza il codebase per trovare tutti i riferimenti ai manager legacy
e genera un report dettagliato per il refactoring.

Usage:
    python audit_manager_references.py [--output report.txt]
"""

import os
import re
import sys
from pathlib import Path
from collections import defaultdict
import argparse

# Mapping dei manager legacy ai nuovi nomi consolidati
LEGACY_TO_NEW = {
    'TimeManager': 'WorldSystemManager',
    'EventManager': 'NarrativeSystemManager',
    'DataManager': 'CoreDataManager',
    'PlayerManager': 'PlayerSystemManager',
    'SkillCheckManager': 'PlayerSystemManager',
    'QuestManager': 'NarrativeSystemManager',
    'NarrativeManager': 'NarrativeSystemManager',
    'CraftingManager': 'WorldSystemManager',
    'CombatManager': 'CombatSystemManager',
    'InputManager': 'InterfaceSystemManager',
    'ThemeManager': 'InterfaceSystemManager',
    'SaveLoadManager': 'PersistenceSystemManager'
}

def audit_file(filepath):
    """Analizza un singolo file per riferimenti ai manager legacy"""
    results = defaultdict(list)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for line_num, line in enumerate(lines, 1):
            for legacy_name in LEGACY_TO_NEW.keys():
                # Pattern per trovare riferimenti tipo: ManagerName.method()
                pattern = rf'\b{legacy_name}\.'
                if re.search(pattern, line):
                    results[legacy_name].append({
                        'line': line_num,
                        'content': line.strip(),
                        'new_name': LEGACY_TO_NEW[legacy_name]
                    })
    except Exception as e:
        print(f"⚠️  Errore leggendo {filepath}: {e}", file=sys.stderr)
    
    return results

def audit_directory(root_dir='scripts'):
    """Analizza ricorsivamente tutti i file .gd"""
    all_results = {}
    total_references = 0
    
    root_path = Path(root_dir)
    if not root_path.exists():
        print(f"❌ Directory non trovata: {root_dir}", file=sys.stderr)
        return None, 0
    
    for gd_file in root_path.rglob('*.gd'):
        file_results = audit_file(gd_file)
        if file_results:
            all_results[str(gd_file)] = file_results
            total_references += sum(len(refs) for refs in file_results.values())
    
    return all_results, total_references

def generate_report(results, total_refs, output_file=None):
    """Genera report formattato"""
    
    lines = []
    lines.append("=" * 80)
    lines.append("MANAGER REFERENCE AUDIT REPORT")
    lines.append("=" * 80)
    lines.append(f"\n📊 SUMMARY")
    lines.append(f"   Total files with legacy references: {len(results)}")
    lines.append(f"   Total references to replace: {total_refs}")
    lines.append("\n" + "=" * 80)
    
    # Raggruppa per manager legacy
    by_manager = defaultdict(list)
    for filepath, file_results in results.items():
        for manager, refs in file_results.items():
            for ref in refs:
                by_manager[manager].append({
                    'file': filepath,
                    'line': ref['line'],
                    'content': ref['content']
                })
    
    lines.append("\n📋 REFERENCES BY LEGACY MANAGER:")
    lines.append("=" * 80)
    
    for legacy_name in sorted(by_manager.keys(), key=lambda x: -len(by_manager[x])):
        new_name = LEGACY_TO_NEW[legacy_name]
        refs = by_manager[legacy_name]
        
        lines.append(f"\n❌ {legacy_name} → ✅ {new_name}")
        lines.append(f"   Total occurrences: {len(refs)}")
        
        # Raggruppa per file
        by_file = defaultdict(list)
        for ref in refs:
            by_file[ref['file']].append(ref)
        
        for filepath in sorted(by_file.keys()):
            file_refs = by_file[filepath]
            lines.append(f"\n   📄 {filepath} ({len(file_refs)} occurrences)")
            
            # Mostra solo prime 5 occorrenze per brevità
            for ref in file_refs[:5]:
                lines.append(f"      Line {ref['line']}: {ref['content'][:70]}...")
            
            if len(file_refs) > 5:
                lines.append(f"      ... and {len(file_refs) - 5} more")
    
    lines.append("\n" + "=" * 80)
    lines.append("\n📝 REFACTORING CHECKLIST:")
    lines.append("=" * 80)
    
    for filepath in sorted(results.keys()):
        lines.append(f"\n[ ] {filepath}")
        for manager, refs in results[filepath].items():
            lines.append(f"    - Replace {manager} → {LEGACY_TO_NEW[manager]} ({len(refs)} times)")
    
    lines.append("\n" + "=" * 80)
    lines.append("\n🔧 SUGGESTED COMMANDS:")
    lines.append("=" * 80)
    lines.append("\n# Use with caution! Review changes before committing.")
    
    for legacy, new in sorted(LEGACY_TO_NEW.items()):
        lines.append(f"# sed -i 's/\\b{legacy}\\b/{new}/g' scripts/**/*.gd")
    
    lines.append("\n" + "=" * 80)
    lines.append(f"✅ Audit completed. {total_refs} references found in {len(results)} files.")
    lines.append("=" * 80)
    
    report = "\n".join(lines)
    
    # Output
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"✅ Report saved to: {output_file}")
    else:
        print(report)

def generate_refactor_script(results, output_file='refactor_managers.sh'):
    """Genera uno script bash per il refactoring automatico"""
    
    lines = [
        "#!/bin/bash",
        "# Auto-generated refactoring script",
        "# Review carefully before executing!",
        "",
        "echo '🔧 Starting manager refactoring...'",
        ""
    ]
    
    # Per ogni file con riferimenti
    for filepath in sorted(results.keys()):
        lines.append(f"echo '📝 Processing {filepath}...'")
        
        for legacy, new in LEGACY_TO_NEW.items():
            if legacy in results[filepath]:
                # Usa sed per sostituzione word-boundary aware
                lines.append(f"sed -i 's/\\b{legacy}\\b/{new}/g' \"{filepath}\"")
        
        lines.append("")
    
    lines.append("echo '✅ Refactoring completed!'")
    lines.append("echo '⚠️  Review changes with: git diff'")
    
    script = "\n".join(lines)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(script)
    
    # Make executable
    os.chmod(output_file, 0o755)
    
    print(f"✅ Refactoring script saved to: {output_file}")
    print(f"   Execute with: ./{output_file}")

def main():
    parser = argparse.ArgumentParser(
        description='Audit manager references in GDScript files'
    )
    parser.add_argument(
        '--output', '-o',
        help='Output file for report (default: stdout)',
        default=None
    )
    parser.add_argument(
        '--directory', '-d',
        help='Directory to scan (default: scripts)',
        default='scripts'
    )
    parser.add_argument(
        '--generate-script',
        help='Generate refactoring shell script',
        action='store_true'
    )
    
    args = parser.parse_args()
    
    print("🔍 Scanning for legacy manager references...")
    print(f"   Directory: {args.directory}")
    print()
    
    results, total_refs = audit_directory(args.directory)
    
    if results is None:
        return 1
    
    if not results:
        print("✅ No legacy manager references found!")
        return 0
    
    generate_report(results, total_refs, args.output)
    
    if args.generate_script:
        generate_refactor_script(results)
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
