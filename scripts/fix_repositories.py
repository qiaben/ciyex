#!/usr/bin/env python3
"""
Script to remove orgId parameters from repository methods.
Since this is single tenant per instance, orgId filtering is not needed.
"""

import re
import sys
from pathlib import Path

def fix_repository_file(file_path):
    """Remove orgId parameters from repository method signatures."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern to match method signatures with orgId parameters
    # Examples:
    # - findByOrgIdAndPatientId(Long orgId, Long patientId)
    # - findAllByOrgId(Long orgId)
    # - countByOrgId(Long orgId)
    
    # Replace findByOrgIdAnd... with findBy...
    content = re.sub(
        r'\bfindByOrgIdAnd(\w+)',
        r'findBy\1',
        content
    )
    
    # Replace findAllByOrgIdAnd... with findAllBy...
    content = re.sub(
        r'\bfindAllByOrgIdAnd(\w+)',
        r'findAllBy\1',
        content
    )
    
    # Replace standalone findByOrgId with findAll
    content = re.sub(
        r'\bfindByOrgId\s*\(',
        r'findAll(',
        content
    )
    
    # Replace standalone findAllByOrgId with findAll
    content = re.sub(
        r'\bfindAllByOrgId\s*\(',
        r'findAll(',
        content
    )
    
    # Replace countByOrgId with count
    content = re.sub(
        r'\bcountByOrgId\s*\(',
        r'count(',
        content
    )
    
    # Remove Long orgId parameter from method signatures
    # Pattern 1: (Long orgId, ...) -> (...)
    content = re.sub(
        r'\(Long orgId,\s*',
        r'(',
        content
    )
    
    # Pattern 2: (..., Long orgId) -> (...)
    content = re.sub(
        r',\s*Long orgId\)',
        r')',
        content
    )
    
    # Pattern 3: (Long orgId) -> ()
    content = re.sub(
        r'\(Long orgId\)',
        r'()',
        content
    )
    
    # Fix @Query annotations that reference orgId
    # Remove WHERE p.orgId = :orgId AND -> WHERE
    content = re.sub(
        r'WHERE\s+\w+\.orgId\s*=\s*:orgId\s+AND\s+',
        r'WHERE ',
        content
    )
    
    # Remove AND p.orgId = :orgId from middle of WHERE clause
    content = re.sub(
        r'\s+AND\s+\w+\.orgId\s*=\s*:orgId',
        r'',
        content
    )
    
    # Remove standalone WHERE p.orgId = :orgId
    content = re.sub(
        r'WHERE\s+\w+\.orgId\s*=\s*:orgId\s*"',
        r'"',
        content
    )
    
    # Remove @Param("orgId") annotations
    content = re.sub(
        r'@Param\("orgId"\)\s*Long orgId,?\s*',
        r'',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    repo_dir = Path(__file__).parent.parent / 'src' / 'main' / 'java' / 'com' / 'qiaben' / 'ciyex' / 'repository'
    
    if not repo_dir.exists():
        print(f"Repository directory not found: {repo_dir}")
        return 1
    
    fixed_count = 0
    for java_file in repo_dir.glob('*.java'):
        if fix_repository_file(java_file):
            print(f"Fixed: {java_file.name}")
            fixed_count += 1
    
    print(f"\nTotal files fixed: {fixed_count}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
