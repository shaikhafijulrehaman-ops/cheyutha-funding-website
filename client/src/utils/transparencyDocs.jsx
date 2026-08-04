import React from 'react';
import { FileText, ShieldCheck, Award, Landmark, CheckCircle, Eye, Download } from 'lucide-react';

import certRegistration from '../assets/certificates/Cheyutha_Helping_Society.pdf';
import certCSR from '../assets/certificates/CSR_Certificate_CHS.pdf';
import cert80G from '../assets/certificates/80G.pdf';
import cert12A from '../assets/certificates/12A.pdf';
import certPAN from '../assets/certificates/pan-funding.jpeg';

export const STANDARD_DOCUMENTS = [
    {
        key: "Society Registration Certificate",
        title: "Society Registration Certificate",
        category: "Registration",
        urn: "Reg No: 250 of 2025",
        authority: "Registrar of Societies, AP Govt",
        description: "Official legal incorporation certificate under Andhra Pradesh Societies Registration Act, 2001.",
        iconType: "file-text",
        defaultAsset: certRegistration
    },
    {
        key: "PAN Certificate",
        title: "Society PAN Certificate",
        category: "Tax Identity",
        urn: "PAN: AAHAC7594D",
        authority: "Income Tax Department, Govt of India",
        description: "Permanent Account Number tax identity card issued by Income Tax Department, Government of India.",
        iconType: "landmark",
        defaultAsset: certPAN
    },
    {
        key: "12A Registration",
        title: "Section 12A Registration Certificate",
        category: "Tax Exemption",
        urn: "URN: AAHAC7594DE20251",
        authority: "Income Tax Department",
        description: "Form 10AC order granting 100% tax-exempt status for society income under Section 12A.",
        iconType: "shield-check",
        defaultAsset: cert12A
    },
    {
        key: "80G Certificate",
        title: "Section 80G Tax Exemption Certificate",
        category: "Tax Exemption",
        urn: "URN: AAHAC7594DF20251",
        authority: "Income Tax Department",
        description: "Form 10AC order enabling 50% tax deduction benefits for donors under Section 80G.",
        iconType: "award",
        defaultAsset: cert80G
    },
    {
        key: "Trust Deed",
        title: "NGO Trust Deed & Bylaws",
        category: "Governance",
        urn: "Deed No: 250/2025",
        authority: "Sub-Registrar Office, Vijayawada",
        description: "Official constitutional deed defining non-proprietary bylaws, governance, and founding objectives.",
        iconType: "file-text",
        defaultAsset: null
    },
    {
        key: "Annual Report",
        title: "Latest Annual Activity Report",
        category: "Annual Report",
        urn: "FY 2025-26 Report",
        authority: "Executive Committee",
        description: "Detailed summary of educational supply distributions, medical camps, and vocational programs.",
        iconType: "check-circle",
        defaultAsset: null
    },
    {
        key: "Audit Report",
        title: "Independent CA Audit Financial Report",
        category: "Audit Report",
        urn: "CA Audit 2025-26",
        authority: "Chartered Accountant",
        description: "Audited financial balance sheet and income-expenditure statement certified by independent CA.",
        iconType: "landmark",
        defaultAsset: null
    },
    {
        key: "CSR Certificate",
        title: "Ministry of Corporate Affairs CSR Registration",
        category: "Corporate Clearance",
        urn: "CSR Reg: CSR00104010",
        authority: "Ministry of Corporate Affairs (MCA)",
        description: "Form CSR-1 approval authorizing corporate CSR grants and institutional donation allocations.",
        iconType: "check-circle",
        defaultAsset: certCSR
    },
    {
        key: "FCRA Certificate (Optional)",
        title: "FCRA Foreign Contribution Approval",
        category: "Foreign Compliance",
        urn: "FCRA Status: Optional / Pending",
        authority: "Ministry of Home Affairs, New Delhi",
        description: "Ministry of Home Affairs clearance for receiving international donations and foreign grants.",
        iconType: "shield-check",
        defaultAsset: null
    }
];

export function getDocIcon(iconType, size = 24) {
    switch (iconType) {
        case 'shield-check':
            return <ShieldCheck size={size} />;
        case 'award':
            return <Award size={size} />;
        case 'landmark':
            return <Landmark size={size} />;
        case 'check-circle':
            return <CheckCircle size={size} />;
        case 'file-text':
        default:
            return <FileText size={size} />;
    }
}

export function getResolvedDocuments(dbCerts = []) {
    const matchedDbIds = new Set();

    const resolved = STANDARD_DOCUMENTS.map((stdDoc, index) => {
        const dbMatch = (dbCerts || []).find(c => {
            if (!c) return false;
            const cTitle = (c.title || '').toLowerCase();
            const cCat = (c.category || '').toLowerCase();
            const sKey = stdDoc.key.toLowerCase();
            const sTitle = stdDoc.title.toLowerCase();
            const sCat = stdDoc.category.toLowerCase();

            return cTitle.includes(sKey) || 
                   sTitle.includes(cTitle) || 
                   (cCat.length > 3 && (cCat === sCat || cTitle.includes(sCat)));
        });

        if (dbMatch) {
            matchedDbIds.add(dbMatch.id);
            return {
                id: dbMatch.id,
                title: dbMatch.title || stdDoc.title,
                category: dbMatch.category || stdDoc.category,
                urn: dbMatch.urn || stdDoc.urn,
                authority: stdDoc.authority,
                description: stdDoc.description,
                file_url: dbMatch.file_url || stdDoc.defaultAsset,
                created_at: dbMatch.created_at,
                status: 'Verified',
                isUploaded: true,
                iconType: stdDoc.iconType
            };
        }

        const hasDefault = !!stdDoc.defaultAsset;

        return {
            id: `std-${index}`,
            title: stdDoc.title,
            category: stdDoc.category,
            urn: stdDoc.urn,
            authority: stdDoc.authority,
            description: stdDoc.description,
            file_url: stdDoc.defaultAsset,
            created_at: null,
            status: hasDefault ? 'Verified' : 'Pending Upload',
            isUploaded: hasDefault,
            iconType: stdDoc.iconType
        };
    });

    (dbCerts || []).forEach(c => {
        if (!matchedDbIds.has(c.id)) {
            resolved.push({
                id: c.id,
                title: c.title,
                category: c.category || 'Legal Compliance',
                urn: c.urn || 'Verified',
                authority: 'Government / Regulatory Body',
                description: 'Official verified compliance document uploaded by society administrators.',
                file_url: c.file_url,
                created_at: c.created_at,
                status: 'Verified',
                isUploaded: true,
                iconType: 'file-text'
            });
        }
    });

    return resolved.filter(doc => doc.isUploaded && !!doc.file_url);
}
