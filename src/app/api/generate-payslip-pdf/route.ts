import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
const numberToWords = require('number-to-words'); 

// --- Interface for PayslipData (Required for TypeScript) ---
interface PayItem { label: string; amount: number; }
interface PayslipData {
    company: { name: string; address: string; };
    month: string; 
    employee: {
        name: string; id: string; department: string; designation: string; uan: string; pan: string;
        workDays: number; joiningDate: string; location?: string; bank?: string; accountNo?: string;
        lop?: number;
    };
    earnings: PayItem[];
    deductions: PayItem[];
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
    printDate: string;
}
// -----------------------------------------------------------

// Helper for formatting currency (Indian style, no decimals)
const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

// ********************************************************************
// POST HANDLER (Solves the 405 Method Not Allowed error)
// ********************************************************************
export async function POST(request: NextRequest) {
    try {
        const payslipData: PayslipData = await request.json(); 
        const pdfBuffer = await generatePayslipPDF(payslipData);
        
        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="payslip-${payslipData.employee.id}-${payslipData.month.replace(' ', '_')}.pdf"`,
            },
        });
    } catch (error) {
        console.error('[PDF] Generation error (POST):', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF on the server', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}


// ********************************************************************
// PDF GENERATION UTILITY (generatePayslipPDF) - FINAL SCOPE FIX
// ********************************************************************
async function generatePayslipPDF(data: PayslipData): Promise<Buffer> {
    const doc = new jsPDF();
    
    // --- Define ALL CONSTANTS LOCALLY ---
    const Y_START = 15;
    const X_MARGIN = 10; 
    const PAGE_WIDTH = 210; 
    const CONTAINER_WIDTH = PAGE_WIDTH - 2 * X_MARGIN;
    const X_MIDDLE = PAGE_WIDTH / 2;
    const LINE_HEIGHT = 6;
    
    // Detailed positions
    const X_LEFT_LABEL = X_MARGIN + 2; 
    const X_LEFT_VALUE = X_MARGIN + 35;
    const X_RIGHT_LABEL = X_MIDDLE + 2; 
    const X_RIGHT_VALUE = X_MIDDLE + 35; // Position of right column values
    const X_TOTAL_RIGHT = X_MARGIN + CONTAINER_WIDTH - 5; // Right edge for totals
    
    let Y_POS = Y_START;
    
    // Helper functions (defined locally)
    const drawBox = (x: number, y: number, w: number, h: number, style: 'S' | 'F' = 'S', color?: number[]) => {
        if (color) doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(x, y, w, h, style);
    };
    const drawSeparator = (text: string, y: number, h: number, fill: number[]) => {
        drawBox(X_MARGIN, y, CONTAINER_WIDTH, h, 'F', fill);
        doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(0);
        doc.text(text, X_MIDDLE, y + h / 2, { align: 'center' });
        return y + h;
    };
    
    // --- 1. Company Header (Uses X_MIDDLE) ---
    doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0);
    doc.text(data.company.name, X_MIDDLE, Y_POS, { align: 'center' });
    Y_POS += 6;

    // Address
    doc.setFontSize(9).setFont('helvetica', 'normal');
    const addressLines = data.company.address.split(/, \s*/g);
    addressLines.forEach(line => {
        doc.text(line.trim(), X_MIDDLE, Y_POS, { align: 'center' });
        Y_POS += 4;
    });

    Y_POS = Math.max(Y_POS, Y_START + 25);
    
    // Payslip Title Row (Grey Separator)
    Y_POS = drawSeparator(`PAYSLIP - ${data.month.toUpperCase()}`, Y_POS, 7, [240, 240, 240]);
    
    // --- 2. Employee Details Block ---
    const DETAIL_BOX_Y = Y_POS;
    const DETAIL_BOX_H = LINE_HEIGHT * 6;
    drawBox(X_MARGIN, DETAIL_BOX_Y, CONTAINER_WIDTH, DETAIL_BOX_H); // Outer box
    
    // Vertical Separator Line 
    doc.line(X_MIDDLE, DETAIL_BOX_Y, X_MIDDLE, DETAIL_BOX_Y + DETAIL_BOX_H);
    
    let Y_DETAIL = DETAIL_BOX_Y + LINE_HEIGHT * 0.75;
    
    // Define all detail fields (Safely accesses properties of the 'data' object)
    const detailFields = [
        ['Name:', data.employee.name || 'N/A', 'Employee No:', data.employee.id || 'N/A'],
        ['Joining Date:', data.employee.joiningDate || 'N/A', 'PAN Number:', data.employee.pan || 'N/A'],
        ['Designation:', data.employee.designation || 'N/A', 'UAN:', data.employee.uan || 'N/A'],
        ['Department:', data.employee.department || 'N/A', 'Location:', data.employee.location || 'N/A'],
        ['Effective Work Days:', String(data.employee.workDays) || 'N/A', 'Bank:', data.employee.bank || 'N/A'],
        ['LOP:', String(data.employee.lop) || '0', 'Bank Account No:', data.employee.accountNo || 'N/A'],
    ];

    doc.setFontSize(8).setFont('helvetica', 'normal');
    
    detailFields.forEach(([label1, value1, label2, value2]) => {
        // Left Column (Uses X_LEFT_LABEL and X_LEFT_VALUE)
        doc.text(label1, X_LEFT_LABEL, Y_DETAIL);
        doc.text(value1, X_LEFT_VALUE, Y_DETAIL);

        // Right Column (Uses X_RIGHT_LABEL and X_RIGHT_VALUE)
        doc.text(label2, X_MIDDLE + 2, Y_DETAIL);
        doc.text(value2, X_RIGHT_VALUE, Y_DETAIL);

        Y_DETAIL += LINE_HEIGHT;
    });

    Y_POS = DETAIL_BOX_Y + DETAIL_BOX_H + 5;
    
    // --- 3. Earnings and Deductions Table ---
    
    // Header Row 
    drawBox(X_MARGIN, Y_POS, CONTAINER_WIDTH, LINE_HEIGHT);
    doc.line(X_MIDDLE, Y_POS, X_MIDDLE, Y_POS + LINE_HEIGHT);
    
    doc.setFontSize(9).setFont('helvetica', 'bold');
    doc.text('Earnings', X_LEFT_LABEL, Y_POS + LINE_HEIGHT * 0.7);
    doc.text('Actual', X_MIDDLE - 5, Y_POS + LINE_HEIGHT * 0.7, { align: 'right' });
    
    doc.text('Deductions', X_RIGHT_LABEL, Y_POS + LINE_HEIGHT * 0.7);
    doc.text('Actual', X_TOTAL_RIGHT, Y_POS + LINE_HEIGHT * 0.7, { align: 'right' });
    
    Y_POS += LINE_HEIGHT;
    
    // Item Rows 
    doc.setFontSize(8).setFont('helvetica', 'normal');
    
    const MAX_ITEMS = Math.max(data.earnings.length, data.deductions.length);
    for (let i = 0; i < MAX_ITEMS; i++) {
        drawBox(X_MARGIN, Y_POS, CONTAINER_WIDTH, LINE_HEIGHT);
        doc.line(X_MIDDLE, Y_POS, X_MIDDLE, Y_POS + LINE_HEIGHT);
        
        // Earnings
        const earning = data.earnings[i];
        if (earning) {
            doc.text(`${earning.label}:`, X_LEFT_LABEL, Y_POS + LINE_HEIGHT * 0.7);
            doc.text(formatCurrency(earning.amount), X_MIDDLE - 5, Y_POS + LINE_HEIGHT * 0.7, { align: 'right' });
        }

        // Deductions
        const deduction = data.deductions[i];
        if (deduction) {
            doc.text(`${deduction.label}:`, X_RIGHT_LABEL, Y_POS + LINE_HEIGHT * 0.7);
            doc.text(formatCurrency(deduction.amount), X_TOTAL_RIGHT, Y_POS + LINE_HEIGHT * 0.7, { align: 'right' });
        }
        Y_POS += LINE_HEIGHT;
    }

    // --- Totals Row ---
    drawBox(X_MARGIN, Y_POS, CONTAINER_WIDTH, LINE_HEIGHT, 'F', [240, 240, 240]);
    doc.line(X_MIDDLE, Y_POS, X_MIDDLE, Y_POS + LINE_HEIGHT);

    doc.setFontSize(9).setFont('helvetica', 'bold');
    doc.text('Total Earnings:', X_LEFT_LABEL, Y_POS + LINE_HEIGHT * 0.7);
    doc.text(formatCurrency(data.totalEarnings), X_MIDDLE - 5, Y_POS + LINE_HEIGHT * 0.7, { align: 'right' });

    doc.text('Total Deductions:', X_RIGHT_LABEL, Y_POS + LINE_HEIGHT * 0.7);
    doc.text(formatCurrency(data.totalDeductions), X_TOTAL_RIGHT, Y_POS + LINE_HEIGHT * 0.7, { align: 'right' });
    Y_POS += LINE_HEIGHT;

    // --- 4. Net Pay Summary ---
    Y_POS += 5;
    drawBox(X_MARGIN, Y_POS, CONTAINER_WIDTH, LINE_HEIGHT * 2, 'S'); // Net Pay Box

    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text('NET PAY (Total Earnings - Total Deductions):', X_LEFT_LABEL, Y_POS + LINE_HEIGHT * 0.7);
    // Uses netPay property
    doc.text(`${formatCurrency(data.netPay)}/-`, X_TOTAL_RIGHT, Y_POS + LINE_HEIGHT * 0.7, { align: 'right' }); 

    doc.setFontSize(8).setFont('helvetica', 'normal');
    // Uses netPay property
    const netPayWords = numberToWords.toWords(Math.round(data.netPay || 0)).toUpperCase(); 
    doc.text(`(${netPayWords} ONLY)`, X_LEFT_LABEL, Y_POS + LINE_HEIGHT * 1.5);
    Y_POS += LINE_HEIGHT * 2 + 5;

    // --- 5. Footer ---
    doc.setFontSize(7).setFont('helvetica', 'normal');
    doc.text('This is a system-generated payslip and does not require signature.', X_LEFT_LABEL, Y_POS);
    // Uses printDate property
    doc.text(`Print Date: ${data.printDate}`, X_TOTAL_RIGHT + 5, Y_POS, { align: 'right' }); 

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
}