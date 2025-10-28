#!/usr/bin/env python3
"""
Script to remove orgId fields from entities and DTOs.
Removes fields, getters, setters, and @Column annotations.
"""

import re
import sys
from pathlib import Path

def process_file(file_path):
    """Process a single entity or DTO file to remove orgId references."""
    print(f"Processing: {file_path.relative_to(file_path.parents[7])}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Pattern 1: Remove orgId field declarations
    # private Long orgId;
    # public Long orgId;
    if re.search(r'(private|public|protected)\s+Long\s+orgId\s*;', content):
        content = re.sub(r'\s*(private|public|protected)\s+Long\s+orgId\s*;', '', content)
        changes.append("Removed orgId field")
    
    # Pattern 2: Remove @Column annotation for orgId
    if re.search(r'@Column\([^)]*name\s*=\s*"org_id"[^)]*\)', content):
        content = re.sub(r'\s*@Column\([^)]*name\s*=\s*"org_id"[^)]*\)\s*\n', '', content)
        changes.append("Removed @Column for org_id")
    
    # Pattern 3: Remove getter methods
    # public Long getOrgId() { return orgId; }
    pattern_getter = r'public\s+Long\s+getOrgId\s*\(\s*\)\s*\{[^}]*\}'
    if re.search(pattern_getter, content, re.DOTALL):
        content = re.sub(pattern_getter, '', content, flags=re.DOTALL)
        changes.append("Removed getOrgId() method")
    
    # Pattern 4: Remove setter methods
    # public void setOrgId(Long orgId) { this.orgId = orgId; }
    pattern_setter = r'public\s+void\s+setOrgId\s*\([^)]*\)\s*\{[^}]*\}'
    if re.search(pattern_setter, content, re.DOTALL):
        content = re.sub(pattern_setter, '', content, flags=re.DOTALL)
        changes.append("Removed setOrgId() method")
    
    # Pattern 5: Remove orgId from builder pattern
    # .orgId(orgId)
    if re.search(r'\.orgId\s*\([^)]*\)', content):
        content = re.sub(r'\s*\.orgId\s*\([^)]*\)', '', content)
        changes.append("Removed orgId from builder")
    
    # Pattern 6: Remove orgId from constructor parameters
    if re.search(r',\s*Long\s+orgId\s*\)', content):
        content = re.sub(r',\s*Long\s+orgId\s*\)', ')', content)
        changes.append("Removed orgId from constructor")
    
    # Pattern 7: Remove this.orgId = orgId; assignments
    if re.search(r'this\.orgId\s*=\s*orgId\s*;', content):
        content = re.sub(r'\s*this\.orgId\s*=\s*orgId\s*;', '', content)
        changes.append("Removed orgId assignment")
    
    # Pattern 8: Remove orgId from Lombok @Builder
    # Remove orgId from builder includes if present
    if re.search(r'@Builder\([^)]*orgId[^)]*\)', content):
        content = re.sub(r',\s*"orgId"', '', content)
        content = re.sub(r'"orgId"\s*,', '', content)
        changes.append("Removed orgId from @Builder")
    
    # Pattern 9: Clean up empty lines (more than 2 consecutive)
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    # Only write if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Updated: {', '.join(set(changes))}")
        return True
    else:
        print(f"  ⏭️  No changes needed")
        return False

def main():
    # Get the directories
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    entity_dir = project_root / "src" / "main" / "java" / "com" / "qiaben" / "ciyex" / "entity"
    dto_dir = project_root / "src" / "main" / "java" / "com" / "qiaben" / "ciyex" / "dto"
    
    print(f"🔍 Cleaning entities and DTOs\n")
    
    # Process entities
    print("=" * 60)
    print("ENTITIES")
    print("=" * 60)
    entity_files = list(entity_dir.glob("*.java"))
    entity_updated = 0
    for entity_file in sorted(entity_files):
        if process_file(entity_file):
            entity_updated += 1
    
    print("\n" + "=" * 60)
    print("DTOs")
    print("=" * 60)
    # Process DTOs (including subdirectories)
    dto_files = list(dto_dir.rglob("*.java"))
    dto_updated = 0
    for dto_file in sorted(dto_files):
        if process_file(dto_file):
            dto_updated += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Processing Complete!")
    print(f"📊 Entities: {len(entity_files)} files, {entity_updated} updated")
    print(f"📊 DTOs: {len(dto_files)} files, {dto_updated} updated")
    print(f"📊 Total: {len(entity_files) + len(dto_files)} files, {entity_updated + dto_updated} updated")
    print("=" * 60)

if __name__ == "__main__":
    main()
