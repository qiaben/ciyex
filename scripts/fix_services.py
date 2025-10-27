#!/usr/bin/env python3
"""
Script to remove orgId parameters from service method calls to repositories.
Since this is single tenant per instance, orgId filtering is not needed.
"""

import re
import sys
from pathlib import Path

def fix_service_file(file_path):
    """Remove orgId parameters from repository method calls."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Fix repository method calls - remove orgId parameter
    # Pattern: .findByOrgIdAndSomething(orgId, otherParam) -> .findBySomething(otherParam)
    # Pattern: .findAllByOrgIdAndSomething(orgId, otherParam) -> .findAllBySomething(otherParam)
    # Pattern: .countByOrgId(orgId) -> .count()
    # Pattern: .findByOrgId(orgId) -> .findAll()
    # Pattern: .findAllByOrgId(orgId) -> .findAll()
    
    # Replace .findByOrgIdAnd with .findBy and remove first parameter
    content = re.sub(
        r'\.findByOrgIdAnd(\w+)\([^,)]+,\s*',
        r'.findBy\1(',
        content
    )
    
    # Replace .findAllByOrgIdAnd with .findAllBy and remove first parameter
    content = re.sub(
        r'\.findAllByOrgIdAnd(\w+)\([^,)]+,\s*',
        r'.findAllBy\1(',
        content
    )
    
    # Replace .countByOrgId(anything) with .count()
    content = re.sub(
        r'\.countByOrgId\([^)]*\)',
        r'.count()',
        content
    )
    
    # Replace .findByOrgId(anything) with .findAll()
    content = re.sub(
        r'\.findByOrgId\([^)]*\)',
        r'.findAll()',
        content
    )
    
    # Replace .findAllByOrgId(orgId) with .findAll()
    content = re.sub(
        r'\.findAllByOrgId\([^,)]+\)(?!\s*\.)',
        r'.findAll()',
        content
    )
    
    # Replace .findAllByOrgId(orgId, pageable) with .findAll(pageable)
    content = re.sub(
        r'\.findAllByOrgId\([^,)]+,\s*',
        r'.findAll(',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    service_dir = Path(__file__).parent.parent / 'src' / 'main' / 'java' / 'com' / 'qiaben' / 'ciyex' / 'service'
    
    if not service_dir.exists():
        print(f"Service directory not found: {service_dir}")
        return 1
    
    fixed_count = 0
    for java_file in service_dir.glob('*.java'):
        if fix_service_file(java_file):
            print(f"Fixed: {java_file.name}")
            fixed_count += 1
    
    print(f"\nTotal files fixed: {fixed_count}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
