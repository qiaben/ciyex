#!/usr/bin/env python3
"""
Script to remove orgId from repository methods and queries.
Updates @Query annotations to remove org_id from WHERE clauses.
"""

import re
import sys
from pathlib import Path

def process_repository(file_path):
    """Process a single repository file to remove orgId references."""
    print(f"Processing: {file_path.name}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Pattern 1: Remove org_id from WHERE clauses in @Query
    # AND CAST(org_id AS TEXT) = :orgIdTxt
    if re.search(r'AND\s+CAST\(org_id\s+AS\s+TEXT\)\s*=\s*:orgIdTxt', content):
        content = re.sub(r'\s*AND\s+CAST\(org_id\s+AS\s+TEXT\)\s*=\s*:orgIdTxt', '', content)
        changes.append("Removed org_id from WHERE clauses")
    
    # Pattern 2: Remove WHERE org_id = :orgId (entire WHERE clause if it's the only condition)
    if re.search(r'WHERE\s+org_id\s*=\s*:orgId\s*ORDER', content):
        content = re.sub(r'WHERE\s+org_id\s*=\s*:orgId\s*', '', content)
        changes.append("Removed org_id WHERE clause")
    
    # Pattern 3: Remove @Param("orgId") or @Param("orgIdTxt") parameters
    if re.search(r',\s*@Param\("orgId(?:Txt)?"\)\s+\w+\s+\w+', content):
        content = re.sub(r',\s*@Param\("orgId(?:Txt)?"\)\s+\w+\s+\w+', '', content)
        changes.append("Removed orgId parameters")
    
    # Pattern 4: Remove orgId parameter if it's the only one
    if re.search(r'\(@Param\("orgId(?:Txt)?"\)\s+\w+\s+\w+\)', content):
        content = re.sub(r'\(@Param\("orgId(?:Txt)?"\)\s+\w+\s+\w+\)', '()', content)
        changes.append("Removed orgId only parameter")
    
    # Pattern 5: Rename methods with "ByOrgId" to remove it
    if re.search(r'findByOrgId\w*\(', content):
        content = re.sub(r'findByOrgId(\w*)\(', r'findAll\1(', content)
        changes.append("Renamed findByOrgId methods")
    
    # Pattern 6: Rename methods with "AndOrgId" to remove it
    if re.search(r'(\w+)AndOrgId\(', content):
        content = re.sub(r'(\w+)AndOrgId\(', r'\1(', content)
        changes.append("Renamed methods removing AndOrgId")
    
    # Pattern 7: Remove org_id from SELECT WHERE clauses
    if re.search(r'WHERE\s+CAST\(org_id\s+AS\s+TEXT\)\s*=\s*:orgIdTxt', content):
        content = re.sub(r'WHERE\s+CAST\(org_id\s+AS\s+TEXT\)\s*=\s*:orgIdTxt\s*', '', content)
        changes.append("Removed org_id from SELECT WHERE")
    
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
    # Get the repository directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    repo_dir = project_root / "src" / "main" / "java" / "com" / "qiaben" / "ciyex" / "repository"
    
    if not repo_dir.exists():
        print(f"❌ Repository directory not found: {repo_dir}")
        sys.exit(1)
    
    print(f"🔍 Scanning repositories in: {repo_dir}\n")
    
    # Process all repository files
    repo_files = list(repo_dir.glob("*Repository.java"))
    total_files = len(repo_files)
    updated_files = 0
    
    for repo_file in sorted(repo_files):
        if process_repository(repo_file):
            updated_files += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Processing Complete!")
    print(f"📊 Total repositories: {total_files}")
    print(f"📝 Updated: {updated_files}")
    print(f"⏭️  Unchanged: {total_files - updated_files}")
    print("=" * 60)
    print("\n⚠️  Note: AllergyIntoleranceRepository was manually updated")
    print("  with new single-tenant methods.")

if __name__ == "__main__":
    main()
