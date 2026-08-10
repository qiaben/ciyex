-- =====================================================
-- Documents tab: expose the attachment's real title/contentType.
-- DocumentService.create() already sets content[0].attachment.title and
-- .contentType from the upload's fileName/contentType (DocumentService.java:
-- 309-310), but no field_config entry mapped them, so GET
-- /api/fhir-resource/documents/patient/{id} never returned them -- every
-- row's Document Title column showed blank, and there was no way for the
-- frontend to tell an audio-type document apart from any other file
-- (needed to show a Play action instead of forcing a download).
-- =====================================================

UPDATE tab_field_config
SET field_config = '{
    "features": {
        "fileUpload": {
            "enabled": true,
            "preview": true,
            "dragDrop": true,
            "maxSizeMB": 10,
            "allowedTypes": [
                "pdf",
                "jpg",
                "jpeg",
                "png",
                "gif",
                "docx",
                "xlsx",
                "txt",
                "csv",
                "zip"
            ],
            "uploadEndpoint": "/api/documents/upload",
            "downloadEndpoint": "/api/documents/upload/{id}/download"
        }
    },
    "sections": [
        {
            "key": "document-details",
            "title": "Document Details",
            "fields": [
                {
                    "key": "title",
                    "type": "text",
                    "label": "Document Title",
                    "colSpan": 1,
                    "required": true,
                    "fhirMapping": {
                        "path": "description",
                        "type": "string",
                        "resource": "DocumentReference"
                    },
                    "placeholder": "Document title",
                    "showInTable": true
                },
                {
                    "key": "category",
                    "type": "select",
                    "label": "Category",
                    "colSpan": 1,
                    "options": [
                        {
                            "label": "Clinical Note",
                            "value": "clinical-note"
                        },
                        {
                            "label": "Discharge Summary",
                            "value": "discharge-summary"
                        },
                        {
                            "label": "Lab Report",
                            "value": "lab-report"
                        },
                        {
                            "label": "Imaging Report",
                            "value": "imaging"
                        },
                        {
                            "label": "Consent Form",
                            "value": "consent"
                        },
                        {
                            "label": "Referral Letter",
                            "value": "referral"
                        },
                        {
                            "label": "Insurance Document",
                            "value": "insurance"
                        },
                        {
                            "label": "Identification",
                            "value": "identification"
                        },
                        {
                            "label": "Prescription",
                            "value": "prescription"
                        },
                        {
                            "label": "Other",
                            "value": "other"
                        }
                    ],
                    "required": true,
                    "fhirMapping": {
                        "path": "category[0].text",
                        "type": "string",
                        "resource": "DocumentReference"
                    },
                    "showInTable": true
                },
                {
                    "key": "status",
                    "type": "select",
                    "label": "Status",
                    "colSpan": 1,
                    "options": [
                        {
                            "label": "Current",
                            "value": "current"
                        },
                        {
                            "label": "Superseded",
                            "value": "superseded"
                        },
                        {
                            "label": "Entered in Error",
                            "value": "entered-in-error"
                        }
                    ],
                    "required": false,
                    "fhirMapping": {
                        "path": "status",
                        "type": "code",
                        "resource": "DocumentReference"
                    },
                    "showInTable": true
                },
                {
                    "key": "date",
                    "type": "datetime",
                    "label": "Document Date",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "date",
                        "type": "instant",
                        "resource": "DocumentReference"
                    },
                    "showInTable": true
                },
                {
                    "key": "author",
                    "type": "lookup",
                    "label": "Author",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "author[0].display",
                        "type": "string",
                        "resource": "DocumentReference"
                    },
                    "lookupConfig": {
                        "endpoint": "/api/providers",
                        "searchable": true,
                        "valueField": "fhirId",
                        "displayField": "name"
                    }
                },
                {
                    "key": "file",
                    "type": "file",
                    "label": "Attachment",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "content[0].attachment.url",
                        "type": "string",
                        "resource": "DocumentReference"
                    }
                },
                {
                    "key": "fileTitle",
                    "type": "text",
                    "label": "File Name",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "content[0].attachment.title",
                        "type": "string",
                        "resource": "DocumentReference"
                    }
                },
                {
                    "key": "fileContentType",
                    "type": "text",
                    "label": "File Content Type",
                    "colSpan": 1,
                    "required": false,
                    "fhirMapping": {
                        "path": "content[0].attachment.contentType",
                        "type": "string",
                        "resource": "DocumentReference"
                    }
                }
            ],
            "columns": 3,
            "collapsed": false,
            "collapsible": false
        }
    ]
}'::jsonb
WHERE tab_key = 'documents' AND practice_type_code = '*' AND org_id = '*';
