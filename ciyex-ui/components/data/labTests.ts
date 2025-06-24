
import { LabTest } from '../models/LabTest';

export const labTests: LabTest[] = [
  {
    id: '1',
    code: '00029',
    name: 'ABO Group & RH Type',
    description: 'Find out your blood type and compatibility for blood transfusions or pregnancy',
    price: 37.99,
    category: 'Blood'
  },
  {
    id: '2',
    code: '00165',
    name: 'B-HCG, Qualitative, Serum',
    description: 'Detect pregnancy by measuring the hormone hCG in the blood.',
    price: 29.99,
    category: 'Pregnancy Test'
  },
  {
    id: '3',
    code: 'BASIC-WELLNESS',
    name: 'Basic Wellness Panel',
    description: 'Comprehensive health screening including CBC w/Diff, Comprehensive Metabolic Panel, Lipid Panel, Cortisol, Hemoglobin A1C, Microalbumin/Cre Ratio, and Thyroid Panel (Free T3, Free T4, TSH)',
    price: 128.00,
    category: 'Basic Wellness Panel'
  },
  {
    id: '4',
    code: '00595',
    name: 'STD Panel, Comprehensive',
    description: 'Comprehensive screening including HIV AB-AG SCREEN/REFLEX, RPR w/reflex, HERPES SIMPLEX V. I & II IgG, HIV Ag-Ab Screen, HIV-1 Antibody, HIV-1 Antigen, HIV-2 Antibody, N. GONORRHOEAE rRNA URINE, C. TRACHOMATIS RRNA URINE',
    price: 130.00,
    category: 'STD Tests'
  },
  {
    id: '5',
    code: '00202',
    name: 'Hemoglobin A1C',
    description: 'Shows your average blood sugar over the past 3 months.',
    price: 15.00,
    category: 'Diabetes'
  },
  {
    id: '6',
    code: '00178',
    name: 'PSA Free and Total',
    description: 'Evaluates prostate health by comparing free and total PSA levels.',
    price: 35.00,
    category: 'Prostate'
  },
  {
    id: '7',
    code: 'VITAMINS-MINERALS',
    name: 'Vitamins and Minerals Panel',
    description: 'Comprehensive panel including Vitamin B12 & Folate, Vitamin D 25-OH Total, Zinc, Phosphorus Serum, and Magnesium - checks for deficiency that may affect bones, energy, and immunity',
    price: 110.00,
    category: 'Vitamins and Minerals'
  }
];

export const getUniqueCategories = (): string[] => {
  const categories = labTests.map(test => test.category);
  return [...new Set(categories)];
};

export const DRAW_FEE = 9.99;

// Disclaimer text
export const LAB_DISCLAIMER = "Direct Consumer Lab: Fast, affordable lab tests with no doctor's visit—just order online from your patient's dashboard, receive lab slip and go straight to the lab. It's that easy.";
