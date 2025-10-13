import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';

// Month name to number mapping
const monthMap: { [key: string]: number } = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4,
  'May': 5, 'June': 6, 'July': 7, 'August': 8,
  'September': 9, 'October': 10, 'November': 11, 'December': 12
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const monthName = searchParams.get('month');
    const year = searchParams.get('year');

    if (!employeeId || !monthName || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: employeeId, month, year' },
        { status: 400 }
      );
    }

    // Convert month name to number
    const monthNumber = monthMap[monthName];
    if (!monthNumber) {
      return NextResponse.json(
        { error: `Invalid month name: ${monthName}` },
        { status: 400 }
      );
    }

    // Fetch employee data from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const backendApiUrl = `${backendUrl}/api/payroll/payslip?employeeId=${employeeId}&month=${monthNumber}&year=${year}`;
    
    console.log('Fetching from backend:', backendApiUrl);
    
    const response = await fetch(backendApiUrl);
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const payslipData = await response.json();
    console.log('Received payslip data:', JSON.stringify(payslipData, null, 2));

    // Generate PDF using jsPDF
    const pdfBuffer = await generatePayslipPDF(payslipData, employeeId, monthName, year);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payslip-${employeeId}-${monthName}-${year}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



async function generatePayslipPDF(data: any, employeeId: string, month: string, year: string): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('PAYSLIP', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`${month} ${year}`, 105, 30, { align: 'center' });
  
  // Employee Info
  doc.setFontSize(12);
  let yPos = 50;
  
  doc.text(`Employee ID: ${employeeId}`, 20, yPos);
  yPos += 10;
  
  if (data?.employee?.employeeName) {
    doc.text(`Name: ${String(data.employee.employeeName)}`, 20, yPos);
    yPos += 10;
  }
  
  if (data?.employee?.department) {
    doc.text(`Department: ${String(data.employee.department)}`, 20, yPos);
    yPos += 10;
  }
  
  if (data?.employee?.designation) {
    doc.text(`Designation: ${String(data.employee.designation)}`, 20, yPos);
    yPos += 10;
  }
  
  // Salary Details
  yPos += 10;
  doc.setFontSize(14);
  doc.text('Salary Details:', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(12);
  
  // Table headers
  doc.text('Description', 20, yPos);
  doc.text('Amount (₹)', 120, yPos);
  yPos += 5;
  
  // Line under headers
  doc.line(20, yPos, 180, yPos);
  yPos += 10;
  
  // Salary items
  const salaryItems = [
    { label: 'Basic Salary', amount: String(data?.basicSalary || '0') },
    { label: 'Allowances', amount: String(data?.allowances || '0') },
    { label: 'Deductions', amount: String(data?.deductions || '0') },
  ];
  
  salaryItems.forEach(item => {
    doc.text(item.label, 20, yPos);
    doc.text(`₹${item.amount}`, 120, yPos);
    yPos += 10;
  });
  
  // Net salary
  yPos += 5;
  doc.line(20, yPos, 180, yPos);
  yPos += 10;
  
  doc.setFontSize(14);
  doc.text('Net Salary:', 20, yPos);
  doc.text(`₹${String(data?.netSalary || '0')}`, 120, yPos);
  
  // Footer
  yPos += 30;
  doc.setFontSize(10);
  doc.text('This is a computer-generated payslip.', 20, yPos);
  
  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}