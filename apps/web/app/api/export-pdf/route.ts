import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface Option {
    text: string;
    correct: boolean;
}

interface Question {
    id: string;
    text: string;
    marks: number;
    options?: Option[];
}

interface PaperData {
    title: string;
    institution?: string;
    duration: string;
    totalMarks: string;
    questions: Question[];
    font: string;
    fontSize: number;
    margin: string;
    template: string;
    // New fields
    logo?: string;
    logoPosition?: 'left' | 'center' | 'right';
    layout?: 'single' | 'double';
    lineHeight?: number;
    answerSpace?: 'none' | 'lines' | 'box';
    separator?: 'none' | 'solid' | 'double' | 'dashed';
    pageBorder?: 'none' | 'border-simple' | 'border-double';
    metaFontSize?: number;
    
    date?: string;
    instructions?: string;
    watermark?: string;
    studentName?: boolean;
    rollNumber?: boolean;
    classSection?: boolean;
    dateField?: boolean;
    invigilatorSign?: boolean;
    footerText?: string;
    roughWorkArea?: 'none' | 'right';
    pageNumbering?: 'hidden' | 'page-x-of-y' | 'x-slash-y';
}

function getTemplateStyles(template: string): { headerBorder: string; headerAlign: string; titleColor: string } {
    switch (template) {
        case 'modern':
            return {
                headerBorder: 'border-bottom: 4px solid #4f46e5;',
                headerAlign: 'text-align: left;',
                titleColor: 'color: #4f46e5;'
            };
        case 'minimal':
            return {
                headerBorder: 'border-bottom: none;',
                headerAlign: 'text-align: left;',
                titleColor: 'color: #000;'
            };
        case 'classic':
        default:
            return {
                headerBorder: 'border-bottom: 2px solid #000;',
                headerAlign: 'text-align: center;',
                titleColor: 'color: #000;'
            };
    }
}

function generatePaperHTML(data: PaperData): string {
    const fontFamily = data.font === 'jakarta' 
        ? "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        : "'Merriweather', Georgia, serif";
    
    const templateStyles = getTemplateStyles(data.template);
    
    const questionsHTML = data.questions.map((q, index) => `
        <div class="paper-item">
            <div class="question-row">
                <span class="q-num">${index + 1}.</span>
                <div class="q-content">
                    <div class="q-text">
                        ${q.text}
                        ${q.marks ? `<span class="q-marks">[${q.marks} marks]</span>` : ''}
                    </div>
                    ${q.options && q.options.length > 0 ? `
                        <div class="options-grid">
                            ${q.options.map((opt, optIdx) => `
                                <div class="option">
                                    <span class="opt-label">(${String.fromCharCode(65 + optIdx)})</span>
                                    <span class="opt-text">${opt.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

    const studentDetailsHTML = `
        <div class="student-details-grid">
            ${data.studentName ? '<div class="detail-item"><span>Name:</span> <span class="line"></span></div>' : ''}
            ${data.rollNumber ? '<div class="detail-item"><span>Roll No:</span> <span class="line"></span></div>' : ''}
            ${data.classSection ? '<div class="detail-item"><span>Class/Sec:</span> <span class="line"></span></div>' : ''}
            ${data.dateField ? `<div class="detail-item"><span>Date:</span> <span class="line">${data.date || ''}</span></div>` : ''}
            ${data.invigilatorSign ? '<div class="detail-item"><span>Invigilator:</span> <span class="line"></span></div>' : ''}
        </div>
    `;

    const instructionsHTML = (data.instructions && data.instructions.replace(/<[^>]*>/g, '').trim().length > 0) ? `
        <div class="instructions-section">
            <div class="inst-label">Instructions</div>
            <div class="inst-content">${data.instructions}</div>
        </div>
    ` : '';

    const contentWrapperClass = data.layout === 'double' ? 'layout-double' : (data.roughWorkArea === 'right' ? 'layout-with-rough-col' : '');
    const logoStyle = (() => {
        if (!data.logo) return '';
        const base = 'position: absolute; width: 60px; height: 60px; object-fit: contain; display: block;';
        if (data.logoPosition === 'center') return `${base} position: relative; margin: 0 auto; top: -10px;`;
        if (data.logoPosition === 'left') return `${base} top: 0; left: 0;`;
        return `${base} top: 0; right: 0;`;
    })();
    
    const logoHTML = data.logo ? `<img src="${data.logo}" style="${logoStyle}">` : '';
    
    const watermarkHTML = data.watermark ? `
        <div class="watermark-overlay">
            <div class="watermark-text">${data.watermark}</div>
        </div>
    ` : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${fontFamily}; font-size: ${data.fontSize}px; line-height: ${data.lineHeight || 1.5}; color: #000; background: #fff; }
        
        .paper-sheet { width: 100%; padding: 0; background: white; position: relative; }
        
        /* Watermark */
        .watermark-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            z-index: -1; pointer-events: none; opacity: 0.04;
        }
        .watermark-text {
            transform: rotate(-45deg); font-size: 80px; font-weight: 800; 
            border: 4px solid #000; padding: 20px 40px; border-radius: 20px; text-transform: uppercase;
        }

        /* Header */
        .paper-header { margin-bottom: 24px; border-bottom: 1px solid #ddd; padding-bottom: 12px; position: relative; }
        .p-institution { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 4px; display: ${data.institution ? 'block' : 'none'}; }
        .p-title { font-size: 18px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; }
        .p-meta { display: flex; justify-content: space-between; font-weight: 600; font-size: 12px; border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 12px; }
        
        /* Template Styles */
        .t-modern .paper-header { ${templateStyles.headerBorder} ${templateStyles.headerAlign} }
        .t-modern .p-title { ${templateStyles.titleColor} }
        .t-minimal .paper-header { ${templateStyles.headerBorder} ${templateStyles.headerAlign} }
        .t-classic .paper-header { ${templateStyles.headerBorder} ${templateStyles.headerAlign} }

        /* Student Details */
        .student-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 40px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; font-size: ${data.metaFontSize || 12}px; }
        .detail-item { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; }
        .detail-item span:first-child { font-weight: 600; color: #334155; }
        .detail-item .line { flex: 1; text-align: right; }

        /* Instructions */
        .instructions-section { margin-bottom: 16px; page-break-inside: avoid; text-align: left; }
        .inst-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
        .inst-content { font-size: ${data.metaFontSize || 12}px; text-align: left; }
        .inst-content ul, .inst-content ol { padding-left: 20px; }

        /* Layout with Rough Column */
        .layout-with-rough-col { display: flex; }
        .layout-with-rough-col .questions-area { width: 75%; padding-right: 20px; border-right: 1px dashed #ccc; }
        .layout-with-rough-col .rough-area { width: 25%; padding-left: 20px; }
        .rough-header { text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-top: 10px; }

        /* Questions */
        .paper-item { margin-bottom: 16px; page-break-inside: avoid; }
        .question-row { display: flex; gap: 8px; }
        .q-num { font-weight: 700; min-width: 24px; }
        .q-content { flex: 1; }
        .q-text { margin-bottom: 6px; }
        .q-marks { float: right; font-weight: 500; color: #64748b; font-size: 0.9em; margin-left: 8px; }
        .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; margin-top: 4px; font-size: 0.95em; }
        .option { color: #334155; }
        .opt-label { font-weight: 600; margin-right: 4px; }
        .opt-text { color: #333; }

        /* Answer Space & Separators */
        .q-wrapper { page-break-inside: avoid; }
        .q-separator-solid { border-bottom: 1px solid #cbd5e1; padding-bottom: 15px; margin-bottom: 15px; }
        .q-separator-double { border-bottom: 3px double #cbd5e1; padding-bottom: 15px; margin-bottom: 15px; }
        .q-separator-dashed { border-bottom: 1px dashed #cbd5e1; padding-bottom: 15px; margin-bottom: 15px; }
        
        .answer-space-lines { height: 50px; border-top: 1px dotted #94a3b8; border-bottom: 1px dotted #94a3b8; margin: 10px 0 20px 0; }
        .answer-space-box { height: 80px; border: 1px solid #cbd5e1; margin: 10px 0 20px 0; }
        
        /* Layouts */
        .layout-double .questions-area { column-count: 2; column-gap: 40px; column-rule: 1px solid #e2e8f0; }
        
        /* Page Border */
        .paper-sheet.border-simple { border: 1px solid #0f172a; margin: 20px auto; padding: 20px; box-sizing: border-box; }
        .paper-sheet.border-double { border: 4px double #0f172a; margin: 20px auto; padding: 20px; box-sizing: border-box; }

        @media print {
            body { -webkit-print-color-adjust: exact; }
            .paper-sheet { margin: 0; padding: 0; border: none !important; } /* Page borders usually for preview, but user might want printable? Browsers handle print margins separately. */
        }
    </style>
</head>
<body class="t-${data.template}">
    ${watermarkHTML}
    <div class="paper-sheet ${data.pageBorder || ''}">
        <div class="paper-header">
            ${logoHTML}
            <div class="p-institution" style="text-align: center;">${data.institution}</div>
            <div class="p-title" style="text-align: center;">${data.title}</div>
            <div class="p-meta">
                <span>Duration: ${data.duration}</span>
                <span>Max Marks: ${data.totalMarks}</span>
            </div>
            ${studentDetailsHTML}
            ${instructionsHTML}
        </div>

        <div class="${contentWrapperClass}">
            <div class="questions-area">
                ${data.questions.map((q, index) => `
                    <div class="q-wrapper ${data.separator !== 'none' ? 'q-separator-' + data.separator : ''}">
                        <div class="paper-item">
                            <div class="question-row">
                                <span class="q-num">${index + 1}.</span>
                                <div class="q-content">
                                    <div class="q-text">
                                        ${q.text}
                                        ${q.marks ? `<span class="q-marks">[${q.marks} marks]</span>` : ''}
                                    </div>
                                    ${q.options && q.options.length > 0 ? `
                                        <div class="options-grid">
                                            ${q.options.map((opt, optIdx) => `
                                                <div class="option">
                                                    <span class="opt-label">(${String.fromCharCode(65 + optIdx)})</span>
                                                    <span class="opt-text">${opt.text}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        ${data.answerSpace && data.answerSpace !== 'none' ? `<div class="answer-space-${data.answerSpace}"></div>` : ''}
                    </div>
                `).join('')}
            </div>
            ${data.roughWorkArea === 'right' && data.layout !== 'double' ? `
                <div class="rough-area">
                     <div class="rough-header">Rough Work</div>
                </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
    `;
}

export async function POST(req: Request) {
    try {
        const data: PaperData = await req.json();

        const html = generatePaperHTML(data);
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const getMarginMM = (m: string) => {
             switch(m) {
                 case 'S': return '7mm';   // ~24px (Preview padding)
                 case 'M': return '12.7mm'; // ~48px (Preview padding)
                 case 'L': return '19mm';  // ~72px (Preview padding)
                 default: return '12.7mm';
             }
        };
        const marginValue = getMarginMM(data.margin);

        // Footer template
        const footerStyle = 'font-size: 10px; width: 100%; padding: 0 20px; color: #666; border-top: 1px solid #ddd; margin-top: 10px; display: flex; justify-content: space-between; align-items: center;';
        let footerTemplate = `<div style="${footerStyle}">`;
        
        // Left side: Footer Text
        footerTemplate += `<span>${data.footerText || ''}</span>`;
        
        // Right side: Page Numbering
        if (data.pageNumbering === 'page-x-of-y') {
            footerTemplate += '<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>';
        } else if (data.pageNumbering === 'x-slash-y') {
            footerTemplate += '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span>';
        } else {
            footerTemplate += '<span></span>';
        }
        
        footerTemplate += '</div>';

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: footerTemplate,
            margin: {
                top: data.pageBorder && data.pageBorder !== 'none' ? '15mm' : marginValue, // Adjust for border
                bottom: '15mm',
                left: marginValue,
                right: marginValue
            }
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${data.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
            },
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
