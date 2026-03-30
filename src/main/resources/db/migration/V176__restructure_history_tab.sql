-- =====================================================
-- Restructure history tab:
-- 1. Add "Past Medical History" section (notes field)
-- 2. Add "Past Surgical History" section (notes field)
-- 3. Rename "General History" → "Social History"
-- =====================================================

UPDATE tab_field_config
SET field_config = '{
    "sections": [
      {
        "key": "past-medical-history",
        "title": "Past Medical History",
        "columns": 1,
        "collapsible": true,
        "collapsed": false,
        "fields": [
          {"key":"pastMedicalHistoryNotes","label":"Notes","type":"textarea","required":false,"colSpan":1,"placeholder":"Enter past medical history notes...","fhirMapping":{"resource":"QuestionnaireResponse","path":"item.where(linkId=''past-medical-history-notes'').answer[0].valueString","type":"string"}}
        ]
      },
      {
        "key": "past-surgical-history",
        "title": "Past Surgical History",
        "columns": 1,
        "collapsible": true,
        "collapsed": false,
        "fields": [
          {"key":"pastSurgicalHistoryNotes","label":"Notes","type":"textarea","required":false,"colSpan":1,"placeholder":"Enter past surgical history notes...","fhirMapping":{"resource":"QuestionnaireResponse","path":"item.where(linkId=''past-surgical-history-notes'').answer[0].valueString","type":"string"}}
        ]
      },
      {
        "key": "social-history",
        "title": "Social History",
        "columns": 3,
        "collapsible": true,
        "collapsed": false,
        "fields": [
          {"key":"smokingStatus","label":"Smoking Status","type":"select","required":false,"colSpan":1,"options":[{"value":"current","label":"Current Smoker"},{"value":"former","label":"Former Smoker"},{"value":"never","label":"Never Smoker"}],"fhirMapping":{"resource":"QuestionnaireResponse","path":"item.where(linkId=''smoking-status'').answer[0].valueCoding.code","type":"code"}},
          {"key":"alcoholUse","label":"Alcohol Use","type":"select","required":false,"colSpan":1,"options":[{"value":"none","label":"None"},{"value":"social","label":"Social"},{"value":"moderate","label":"Moderate"},{"value":"heavy","label":"Heavy"}],"fhirMapping":{"resource":"QuestionnaireResponse","path":"item.where(linkId=''alcohol-use'').answer[0].valueCoding.code","type":"code"}},
          {"key":"exerciseFrequency","label":"Exercise","type":"select","required":false,"colSpan":1,"options":[{"value":"none","label":"None"},{"value":"occasional","label":"Occasional"},{"value":"regular","label":"Regular"},{"value":"daily","label":"Daily"}],"fhirMapping":{"resource":"QuestionnaireResponse","path":"item.where(linkId=''exercise'').answer[0].valueCoding.code","type":"code"}},
          {"key":"additionalHistory","label":"Additional History","type":"textarea","required":false,"colSpan":3,"fhirMapping":{"resource":"QuestionnaireResponse","path":"item.where(linkId=''additional-notes'').answer[0].valueString","type":"string"}}
        ]
      },
      {
        "key": "family-history",
        "title": "Family History",
        "columns": 2,
        "collapsible": true,
        "collapsed": true,
        "fields": [
          {"key":"fatherHistory","label":"Father","type":"text","required":false,"colSpan":1,"placeholder":"Known conditions","fhirMapping":{"resource":"QuestionnaireResponse","path":"item.where(linkId=''father-history'').answer[0].valueString","type":"string"}},
          {"key":"motherHistory","label":"Mother","type":"text","required":false,"colSpan":1,"placeholder":"Known conditions","fhirMapping":{"resource":"QuestionnaireResponse","path":"item.where(linkId=''mother-history'').answer[0].valueString","type":"string"}},
          {"key":"siblingsHistory","label":"Siblings","type":"text","required":false,"colSpan":1,"placeholder":"Known conditions","fhirMapping":{"resource":"QuestionnaireResponse","path":"item.where(linkId=''siblings-history'').answer[0].valueString","type":"string"}},
          {"key":"offspringHistory","label":"Offspring","type":"text","required":false,"colSpan":1,"placeholder":"Known conditions","fhirMapping":{"resource":"QuestionnaireResponse","path":"item.where(linkId=''offspring-history'').answer[0].valueString","type":"string"}}
        ]
      }
    ]
  }',
  updated_at = now()
WHERE tab_key = 'history' AND practice_type_code = '*' AND org_id = '*';
