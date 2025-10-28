#!/usr/bin/env python3
"""
Script to fix PatientBillingService by removing orgId from repository method calls
"""

import re
import sys

def fix_billing_service(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    original = content
    
    # Pattern 1: findByOrgIdAndPatientId(orgId, patientId) -> findByPatientId(patientId)
    content = re.sub(
        r'\.findByOrgIdAndPatientId\([^,]+,\s*([^)]+)\)',
        r'.findByPatientId(\1)',
        content
    )
    
    # Pattern 2: findAllByOrgIdAndPatientIdOrderBy... -> findAllByPatientIdOrderBy...
    content = re.sub(
        r'\.findAllByOrgIdAndPatientId([A-Za-z]+)\([^,]+,\s*([^)]+)\)',
        r'.findAllByPatientId\1(\2)',
        content
    )
    
    # Pattern 3: findByIdAndOrgIdAndPatientId(id, orgId, patientId) -> findByIdAndPatientId(id, patientId)
    content = re.sub(
        r'\.findByIdAndOrgIdAndPatientId\(([^,]+),\s*[^,]+,\s*([^)]+)\)',
        r'.findByIdAndPatientId(\1, \2)',
        content
    )
    
    # Pattern 4: findByInvoiceIdAndOrgIdAndPatientId -> findByInvoiceIdAndPatientId
    content = re.sub(
        r'\.findByInvoiceIdAndOrgIdAndPatientId\(([^,]+),\s*[^,]+,\s*([^)]+)\)',
        r'.findByInvoiceIdAndPatientId(\1, \2)',
        content
    )
    
    # Pattern 5: findByPatientIdAndTargetTypeAndTargetIdOrderBy...
    content = re.sub(
        r'\.findByPatientIdAndTargetTypeAndTargetIdOrderBy([A-Za-z]+)\(',
        r'.findByPatientIdAndTargetTypeAndTargetIdOrderBy\1(',
        content
    )
    
    if content != original:
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"✅ Fixed {file_path}")
        return True
    else:
        print(f"⏭️  No changes needed for {file_path}")
        return False

if __name__ == "__main__":
    file_path = "src/main/java/com/qiaben/ciyex/service/PatientBillingService.java"
    fix_billing_service(file_path)
