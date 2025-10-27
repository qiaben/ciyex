#!/usr/bin/env python3
"""
Comprehensive script to fix service method calls after repository changes.
Handles various patterns of orgId parameter removal.
"""

import re
import sys
from pathlib import Path

def fix_service_comprehensive(file_path):
    """Fix service method calls comprehensively."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Fix patterns where orgId is first parameter followed by others
    # Pattern: method(orgId, param1, param2, param3) -> method(param1, param2, param3)
    content = re.sub(
        r'(\w+Repository\.\w+)\(\s*orgId\s*,\s*',
        r'\1(',
        content
    )
    
    # Fix patterns where orgId is in middle: method(param1, orgId, param2)
    # This is trickier - look for common patterns
    content = re.sub(
        r'(findBy\w+)\((\w+),\s*orgId\s*,\s*',
        r'\1(\2, ',
        content
    )
    
    # Fix repo.findAll() calls that should be repo.findFirst()
    content = re.sub(
        r'(inventorySettingsRepository|documentSettingsRepository)\.findAll\(\)',
        r'\1.findFirst()',
        content
    )
    
    # Fix EncounterRepository specific patterns
    # findByPatientIdAndOrgId(patientId, orgId) -> findByPatientId(patientId)
    content = re.sub(
        r'\.findByPatientIdAndOrgId\(([^,)]+),\s*[^)]+\)',
        r'.findByPatientId(\1)',
        content
    )
    
    # findByIdAndPatientIdAndOrgId(id, patientId, orgId) -> findByIdAndPatientId(id, patientId)
    content = re.sub(
        r'\.findByIdAndPatientIdAndOrgId\(([^,)]+),\s*([^,)]+),\s*[^)]+\)',
        r'.findByIdAndPatientId(\1, \2)',
        content
    )
    
    # deleteByIdAndPatientIdAndOrgId(id, patientId, orgId) -> deleteByIdAndPatientId(id, patientId)
    content = re.sub(
        r'\.deleteByIdAndPatientIdAndOrgId\(([^,)]+),\s*([^,)]+),\s*[^)]+\)',
        r'.deleteByIdAndPatientId(\1, \2)',
        content
    )
    
    # Fix HealthcareServiceRepository patterns
    # findByIdAndOrgId(id, orgId) -> findById(id)
    content = re.sub(
        r'\.findByIdAndOrgId\(([^,)]+),\s*[^)]+\)',
        r'.findById(\1)',
        content
    )
    
    # Fix countByOrgIdAndStatus(orgId, status) -> countByStatus(status)
    content = re.sub(
        r'\.countByOrgIdAndStatus\([^,)]+,\s*([^)]+)\)',
        r'.countByStatus(\1)',
        content
    )
    
    # Fix search methods
    # search(query, orgId) -> search(query)
    content = re.sub(
        r'\.search\(([^,)]+),\s*orgId\)',
        r'.search(\1)',
        content
    )
    
    # Fix countOrdersByMonth(orgId, year, month) -> countOrdersByMonth(year, month)
    content = re.sub(
        r'\.countOrdersByMonth\(orgId,\s*([^,)]+),\s*([^)]+)\)',
        r'.countOrdersByMonth(\1, \2)',
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
        if fix_service_comprehensive(java_file):
            print(f"Fixed: {java_file.name}")
            fixed_count += 1
    
    print(f"\nTotal files fixed: {fixed_count}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
