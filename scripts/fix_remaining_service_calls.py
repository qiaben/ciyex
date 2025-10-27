#!/usr/bin/env python3
"""
Fix remaining service calls that still pass orgId to repository methods.
"""

import re
import sys
from pathlib import Path

def fix_service_file(file_path):
    """Fix remaining orgId parameter issues in service files."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Fix specific patterns found in errors
    
    # GlobalCodeService: search(orgId, codeType, active, q) -> search(codeType, active, q)
    content = re.sub(
        r'\.search\(orgId,\s*([^,)]+),\s*([^,)]+),\s*([^)]+)\)',
        r'.search(\1, \2, \3)',
        content
    )
    
    # OrderService: countOrdersByMonth(orgId) -> countOrdersByMonth()
    content = re.sub(
        r'\.countOrdersByMonth\(orgId\)',
        r'.countOrdersByMonth()',
        content
    )
    
    # PatientService: searchByOrgId(orgId, query) -> search(query)
    content = re.sub(
        r'\.searchByOrgId\(orgId,\s*([^)]+)\)',
        r'.search(\1)',
        content
    )
    
    # PatientCodeListService: findAllByOrgIdOrderByOrderIndexAsc(orgId) -> findAllOrderByOrderIndexAsc()
    content = re.sub(
        r'\.findAllByOrgIdOrderByOrderIndexAsc\(orgId\)',
        r'.findAllOrderByOrderIndexAsc()',
        content
    )
    
    # clearDefaultsExcept(orgId, id) -> clearDefaultsExcept(id)
    content = re.sub(
        r'\.clearDefaultsExcept\(orgId,\s*([^)]+)\)',
        r'.clearDefaultsExcept(\1)',
        content
    )
    
    # deleteByIdAndOrgId(id, orgId) -> deleteById(id)
    content = re.sub(
        r'\.deleteByIdAndOrgId\(([^,)]+),\s*orgId\)',
        r'.deleteById(\1)',
        content
    )
    
    # clearAllDefaults(orgId) -> clearAllDefaults()
    content = re.sub(
        r'\.clearAllDefaults\(orgId\)',
        r'.clearAllDefaults()',
        content
    )
    
    # EncounterFeeScheduleService: search(orgId, patientId, encounterId, ...) -> search(patientId, encounterId, ...)
    content = re.sub(
        r'\.search\(orgId,\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*([^)]+)\)',
        r'.search(\1, \2, \3, \4, \5)',
        content
    )
    
    # searchInEncounter(orgId, patientId, encounterId, ...) -> searchInEncounter(patientId, encounterId, ...)
    content = re.sub(
        r'\.searchInEncounter\(orgId,\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*([^)]+)\)',
        r'.searchInEncounter(\1, \2, \3, \4, \5)',
        content
    )
    
    # PatientClaimRepository: findAllByInvoiceIdAndOrgIdAndPatientIdOrderByIdDesc(invoiceId, orgId, patientId)
    # -> findAllByInvoiceIdAndPatientIdOrderByIdDesc(invoiceId, patientId)
    content = re.sub(
        r'\.findAllByInvoiceIdAndOrgIdAndPatientIdOrderByIdDesc\(([^,)]+),\s*orgId,\s*([^)]+)\)',
        r'.findAllByInvoiceIdAndPatientIdOrderByIdDesc(\1, \2)',
        content
    )
    
    # findAllByInvoiceIdAndOrgIdAndPatientId(invoiceId, orgId, patientId)
    # -> findAllByInvoiceIdAndPatientId(invoiceId, patientId)
    content = re.sub(
        r'\.findAllByInvoiceIdAndOrgIdAndPatientId\(([^,)]+),\s*orgId,\s*([^)]+)\)',
        r'.findAllByInvoiceIdAndPatientId(\1, \2)',
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
