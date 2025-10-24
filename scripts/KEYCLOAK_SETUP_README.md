# Keycloak Setup Scripts

Automatically configure Keycloak with groups, attributes, and users based on database seed files.

## Quick Start

```bash
cd /home/siva/git/ciyex/scripts

# Make executable
chmod +x setup_keycloak.py setup_keycloak.sh

# Edit admin password
nano setup_keycloak.py  # Change ADMIN_PASSWORD

# Run Python script (recommended)
python3 setup_keycloak.py

# OR run Bash script
./setup_keycloak.sh
```

## What Gets Created

**Groups:**
- `/Apps/Ciyex`, `/Apps/Aran`
- `/Tenants/Qiaben Health` (org_id: 1)
- `/Tenants/MediPlus` (org_id: 2)
- `/Tenants/CareWell` (org_id: 3)

**Users (Password: Password@123):**
- alice@example.com → Qiaben Health, CareWell
- bob@example.com → Qiaben Health, MediPlus
- carol@example.com → Qiaben Health, CareWell

## Next Steps

1. Run setup script
2. Configure client mapper (see KEYCLOAK_GROUP_ATTRIBUTES_SETUP.md)
3. Test login and verify JWT token contains group_attributes
