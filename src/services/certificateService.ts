
import jsPDF from 'jspdf';

export interface CertificateData {
  userName: string;
  certificateTitle: string;
  completionDate: string;
  score?: number;
  verificationCode: string;
}

interface InterviewReportData {
  userName: string;
  interviewType: string;
  completionDate: string;
  overallScore: number;
  grade: string;
  totalQuestions: number;
  questions: string[];
  answers: string[];
  evaluations: any[];
  idealAnswers?: string[];
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const generateCertificatePDF = async (data: CertificateData): Promise<jsPDF> => {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const width = 297; const height = 210; const cx = width / 2;

  pdf.setFillColor(245, 248, 255);
  pdf.rect(0, 0, width, height, 'F');

  pdf.setDrawColor(180, 198, 252);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(8, 8, width - 16, height - 16, 4, 4);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(23, 37, 84);
  pdf.setFontSize(12);
  pdf.text('CYROBOX', 18, 18);
  pdf.setTextColor(59, 130, 246);
  pdf.text('MocKinvi', 40, 18);
  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'normal');
  pdf.text('MocKinvi is a product of CYROBOX', 18, 24);

  pdf.setTextColor(23, 37, 84);
  pdf.setFontSize(34);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Certificate of Completion', cx, 60, { align: 'center' });
  pdf.setDrawColor(59,130,246); pdf.setLineWidth(1.5); pdf.line(cx - 40, 66, cx + 40, 66);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.setFontSize(14);
  pdf.text('This certifies that', cx, 84, { align: 'center' });

  pdf.setTextColor(37, 99, 235);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.text(data.userName, cx, 100, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.setFontSize(14);
  pdf.text('has successfully completed', cx, 114, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(23, 37, 84);
  pdf.setFontSize(22);
  pdf.text(data.certificateTitle, cx, 130, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(11);
  pdf.text('Completion Date', cx - 45, 148, { align: 'center' });
  pdf.text('Final Score', cx + 45, 148, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(13);
  pdf.text(data.completionDate, cx - 45, 156, { align: 'center' });
  pdf.text(`${data.score ?? 0}%`, cx + 45, 156, { align: 'center' });

  pdf.setDrawColor(59,130,246); pdf.setFillColor(59,130,246);
  pdf.circle(cx, 178, 15, 'FD');
  pdf.setDrawColor(255,255,255);
  pdf.setLineWidth(3);
  pdf.line(cx - 6, 178, cx - 2, 182);
  pdf.line(cx - 2, 182, cx + 7, 173);
  pdf.setTextColor(255,255,255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFIED', cx, 186, { align: 'center' });

  pdf.setTextColor(100,116,139);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(`Certificate ID: ${data.verificationCode}`, 18, height - 12);
  pdf.text('Issued by MocKinvi and CYROBOX. Verify using the ID above.', width - 18, height - 12, { align: 'right' });

  return pdf;
};

export const generateInterviewReportPDF = (data: InterviewReportData): jsPDF => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  let y = 22;

  // Theme
  const primary = { r: 74, g: 105, b: 177 }; // #4A69B1
  const primaryDark = { r: 58, g: 89, b: 145 }; // #3A5991
  const text = { r: 44, g: 62, b: 80 };
  const muted = { r: 100, g: 116, b: 139 };

  const lineH = (fs: number) => fs * 0.36 + 1.4;

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = 22;
      drawHeader();
      y = 58;
    }
  };

  const drawHeader = () => {
    // Header bar
    pdf.setFillColor(primary.r, primary.g, primary.b);
    pdf.rect(0, 0, pageWidth, 44, 'F');

    // Logo (best-effort)
    try {
      // If you have a dataURI logo, replace this path
      // const logo = await loadImage('/src/assets/mockinvi-logo.png');
      // pdf.addImage(logo, 'PNG', margin, 10, 16, 16);
    } catch {}

    pdf.setTextColor(255,255,255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Interview Report', pageWidth / 2, 18, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text('MocKinvi by CYROBOX', pageWidth / 2, 26, { align: 'center' });

    // Translucent watermark (large and light)
    pdf.setTextColor(235, 239, 249);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(46);
    pdf.text('MocKinvi • CYROBOX', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 30, renderingMode: 'stroke' as any });
  };

  const title = (t: string) => {
    checkPage(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
    pdf.text(t, margin, y);
    y += 6;
    pdf.setDrawColor(220, 227, 243);
    pdf.setLineWidth(0.6);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  const paragraph = (t: string, fs = 11, color = text) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(fs);
    pdf.setTextColor(color.r, color.g, color.b);
    const lines = pdf.splitTextToSize(t, pageWidth - margin * 2);
    const h = lines.length * lineH(fs);
    checkPage(h + 2);
    pdf.text(lines, margin, y);
    y += h + 2;
  };

  const kv = (k: string, v: string) => {
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
    pdf.text(`${k}:`, margin, y);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.setTextColor(text.r, text.g, text.b);
    pdf.text(v, margin + 30, y);
    y += lineH(11);
  };

  drawHeader();
  y = 58;

  // Candidate Information
  title('Candidate Information');
  kv('Name', data.userName);
  kv('Interview Type', data.interviewType);
  kv('Date', data.completionDate);

  // Performance Summary
  title('Performance Summary');
  kv('Overall Score', `${data.overallScore.toFixed(1)}/10`);
  kv('Grade', data.grade);
  kv('Questions Answered', String(data.totalQuestions));

  // Detailed Analysis
  title('Detailed Analysis');

  const renderQA = (q: string, a: string, ideal?: string, evalObj?: any, index?: number) => {
    // Question title
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
    checkPage(lineH(12) + 2);
    pdf.text(`Question ${index! + 1}`, margin, y); y += lineH(12);

    // Question text
    paragraph(q, 10, text);

    // Answer
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
    checkPage(lineH(11)); pdf.text('Your Answer:', margin, y); y += lineH(11) - 1;
    paragraph(a || 'No answer provided', 9, muted);

    // Score + breakdown
    if (evalObj) {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
      checkPage(lineH(10)); pdf.text(`Score: ${evalObj.score || 0}/10`, margin, y); y += lineH(10);
      if (evalObj.score_breakdown) {
        const b = evalObj.score_breakdown;
        paragraph(`Correctness: ${b.correctness || 0}/10  •  Completeness: ${b.completeness || 0}/10  •  Depth: ${b.depth || 0}/10  •  Clarity: ${b.clarity || 0}/10`, 9, muted);
      }
      if (evalObj.remarks) {
        pdf.setFont('helvetica', 'italic'); pdf.setFontSize(9); pdf.setTextColor(184, 146, 31);
        paragraph(`Feedback: ${evalObj.remarks}`, 9, { r: 184, g: 146, b: 31 });
      }
    }

    // Ideal
    if (ideal) {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
      checkPage(lineH(10)); pdf.text('Ideal Answer:', margin, y); y += lineH(10) - 1;
      paragraph(ideal, 9, muted);
    }

    // Separator
    pdf.setDrawColor(230, 235, 248); pdf.setLineWidth(0.4);
    checkPage(6); pdf.line(margin, y + 2, pageWidth - margin, y + 2); y += 8;
  };

  data.questions.forEach((q, i) => {
    const evaluation = data.evaluations[i];
    const answer = data.answers[i] || 'No answer provided';
    const ideal = data.idealAnswers?.[i];
    renderQA(q, answer, ideal, evaluation, i);
  });

  // Footer branding
  const total = pdf.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text(`Page ${i} of ${total}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    pdf.text('Generated by MocKinvi • CYROBOX', margin, pageHeight - 10);
  }

  // Closing quote (font size ~13)
  const closing = '“Practice consistently, reflect deliberately, and keep growing.”';
  pdf.setPage(total);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(13);
  pdf.setTextColor(90, 102, 121);
  // Ensure spacing at bottom
  if (y < pageHeight - margin - 12) {
    pdf.text(closing, pageWidth / 2, pageHeight - margin - 12, { align: 'center' });
  } else {
    pdf.addPage();
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(13);
    pdf.setTextColor(90, 102, 121);
    pdf.text(closing, pageWidth / 2, pageHeight - margin - 12, { align: 'center' });
  }

  return pdf;
};

export const downloadInterviewReport = (data: InterviewReportData) => {
  const pdf = generateInterviewReportPDF(data);
  const fileName = `Interview_Report_${data.interviewType.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  pdf.save(fileName);
};

export const downloadCertificate = async (data: CertificateData) => {
  const pdf = await generateCertificatePDF(data);
  const fileName = `${data.certificateTitle.replace(/\s+/g, '_')}_${data.verificationCode}.pdf`;
  pdf.save(fileName);
};
