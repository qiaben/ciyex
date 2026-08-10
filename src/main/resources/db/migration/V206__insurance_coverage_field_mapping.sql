-- =====================================================
-- Insurance tab: add real Coverage field mappings.
-- The 'insurance' tab's field_config only ever mapped fields to the
-- Organization (payer) resource -- despite fhir_resources declaring both
-- Organization and Coverage, POST /api/coverages had no field that wrote
-- to a Coverage attribute at all (policy number, group number, subscriber
-- relationship, coverage type, or effective dates), so every created
-- Coverage record was effectively empty besides the patient link and
-- default status. Adds a new "Coverage Details" section mapped to
-- resource=Coverage for exactly those fields, alongside the existing
-- payer-directory sections (left unchanged).
-- =====================================================

UPDATE tab_field_config
SET field_config = '{
    "sections": [
        {
            "key": "company-info",
            "title": "Insurance Company",
            "fields": [
                {
                    "key": "name",
                    "type": "text",
                    "label": "Company Name",
                    "colSpan": 2,
                    "required": true,
                    "fhirMapping": {
                        "path": "name",
                        "type": "string",
                        "resource": "Organization"
                    },
                    "placeholder": "Insurance company name",
                    "showInTable": true
                },
                {
                    "key": "active",
                    "type": "toggle",
                    "label": "Active",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "active",
                        "type": "boolean",
                        "resource": "Organization"
                    },
                    "showInTable": true
                },
                {
                    "key": "payerId",
                    "type": "text",
                    "label": "Payer ID",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "identifier.where(system=''urn:oid:2.16.840.1.113883.4.6'').value",
                        "type": "string",
                        "resource": "Organization"
                    },
                    "placeholder": "EDI Payer ID",
                    "showInTable": true
                },
                {
                    "key": "phone",
                    "type": "text",
                    "label": "Phone",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "telecom.where(system=''phone'').value",
                        "type": "string",
                        "resource": "Organization"
                    },
                    "placeholder": "(555) 123-4567",
                    "showInTable": true
                },
                {
                    "key": "fax",
                    "type": "text",
                    "label": "Fax",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "telecom.where(system=''fax'').value",
                        "type": "string",
                        "resource": "Organization"
                    },
                    "placeholder": "(555) 123-4568"
                },
                {
                    "key": "email",
                    "type": "email",
                    "label": "Email",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "telecom.where(system=''email'').value",
                        "type": "string",
                        "resource": "Organization"
                    },
                    "placeholder": "claims@insurance.com"
                },
                {
                    "key": "website",
                    "type": "text",
                    "label": "Website",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "telecom.where(system=''url'').value",
                        "type": "string",
                        "resource": "Organization"
                    },
                    "placeholder": "https://provider.insurance.com"
                }
            ],
            "columns": 3,
            "collapsed": false,
            "collapsible": true
        },
        {
            "key": "address",
            "title": "Claims Address",
            "fields": [
                {
                    "key": "address.line1",
                    "type": "text",
                    "label": "Address Line 1",
                    "colSpan": 2,
                    "required": false,
                    "fhirMapping": {
                        "path": "address[0].line[0]",
                        "type": "string",
                        "resource": "Organization"
                    },
                    "placeholder": "Street address"
                },
                {
                    "key": "address.line2",
                    "type": "text",
                    "label": "Address Line 2",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "address[0].line[1]",
                        "type": "string",
                        "resource": "Organization"
                    },
                    "placeholder": "Suite, PO Box"
                },
                {
                    "key": "address.city",
                    "type": "text",
                    "label": "City",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "address[0].city",
                        "type": "string",
                        "resource": "Organization"
                    }
                },
                {
                    "key": "address.state",
                    "type": "text",
                    "label": "State",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "address[0].state",
                        "type": "string",
                        "resource": "Organization"
                    }
                },
                {
                    "key": "address.zip",
                    "type": "text",
                    "label": "ZIP Code",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "address[0].postalCode",
                        "type": "string",
                        "resource": "Organization"
                    }
                }
            ],
            "columns": 3,
            "collapsed": false,
            "collapsible": true
        },
        {
            "key": "coverage-details",
            "title": "Coverage Details",
            "fields": [
                {
                    "key": "policyNumber",
                    "type": "text",
                    "label": "Policy Number",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "identifier[1].value",
                        "type": "string",
                        "resource": "Coverage"
                    }
                },
                {
                    "key": "groupNumber",
                    "type": "text",
                    "label": "Group Number",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "class[0].value",
                        "type": "string",
                        "resource": "Coverage"
                    }
                },
                {
                    "key": "subscriberRelationship",
                    "type": "select",
                    "label": "Subscriber Relationship",
                    "colSpan": 1,
                    "required": false,
                    "options": [
                        {
                            "label": "Self",
                            "value": "self"
                        },
                        {
                            "label": "Spouse",
                            "value": "spouse"
                        },
                        {
                            "label": "Child",
                            "value": "child"
                        },
                        {
                            "label": "Other",
                            "value": "other"
                        }
                    ],
                    "fhirMapping": {
                        "path": "relationship.coding[0].code",
                        "type": "code",
                        "resource": "Coverage"
                    }
                },
                {
                    "key": "coverageType",
                    "type": "select",
                    "label": "Coverage Type",
                    "colSpan": 1,
                    "required": false,
                    "options": [
                        {
                            "label": "Primary",
                            "value": "primary"
                        },
                        {
                            "label": "Secondary",
                            "value": "secondary"
                        },
                        {
                            "label": "Tertiary",
                            "value": "tertiary"
                        }
                    ],
                    "fhirMapping": {
                        "path": "type.coding[0].code",
                        "type": "code",
                        "resource": "Coverage"
                    }
                },
                {
                    "key": "startDate",
                    "type": "date",
                    "label": "Coverage Start Date",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "period.start",
                        "type": "date",
                        "resource": "Coverage"
                    }
                },
                {
                    "key": "endDate",
                    "type": "date",
                    "label": "Coverage End Date",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "period.end",
                        "type": "date",
                        "resource": "Coverage"
                    }
                }
            ],
            "columns": 2,
            "collapsed": false,
            "collapsible": true
        }
    ]
}'::jsonb
WHERE tab_key = 'insurance' AND practice_type_code = '*' AND org_id = '*';
