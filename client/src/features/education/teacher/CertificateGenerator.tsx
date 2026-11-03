import React, { useState } from 'react';
import {
  Award,
  Download,
  Printer,
  Sparkles,
  ShieldAlert,
  User,
  Calendar,
  Building,
} from 'lucide-react';
import {
  generateCertificatePdf,
  downloadPdfBytes,
  type CertificateData,
} from '../shared/PdfExportHelper.js';

export const CertificateGenerator: React.FC = () => {
  const [data, setData] = useState<CertificateData>({
    recipientName: 'Alex Morgan',
    courseTitle: 'Full-Stack Software Development Mastery',
    achievementDescription:
      'Demonstrating exceptional proficiency in modern web architecture, algorithms, and application design.',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    instructorName: 'Professor Marcus Vance',
    institutionName: 'VexoraMods Open Learning Academy',
    templateStyle: 'classic',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      const pdfBytes = await generateCertificatePdf(data);
      downloadPdfBytes(
        pdfBytes,
        `Certificate-${data.recipientName.replace(/\s+/g, '_') || 'Achievement'}.pdf`,
      );
    } catch (e) {
      console.error('Failed to generate certificate PDF', e);
      alert('Failed to generate certificate PDF. Please check your inputs.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000]">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500 fill-amber-300" />
            Certificate of Achievement Generator
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Issue beautiful high-resolution certificates with 100% client-side PDF rendering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFD21A] disabled:opacity-50 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 transition-all"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
        <div>
          <span className="font-bold">Credential Notice:</span> Certificates generated here are
          intended strictly for motivational and informal achievement recognition. They are not
          represented as officially accredited academic degrees or government-certified diplomas.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000] space-y-4">
          <h3 className="font-black text-sm uppercase text-neutral-700">Certificate Details</h3>

          <div>
            <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
              Recipient Full Name *
            </label>
            <input
              type="text"
              value={data.recipientName}
              onChange={(e) => setData({ ...data, recipientName: e.target.value })}
              className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
              Course or Achievement Title *
            </label>
            <input
              type="text"
              value={data.courseTitle}
              onChange={(e) => setData({ ...data, courseTitle: e.target.value })}
              className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
              Achievement Description
            </label>
            <textarea
              rows={3}
              value={data.achievementDescription}
              onChange={(e) => setData({ ...data, achievementDescription: e.target.value })}
              className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Issue Date
              </label>
              <input
                type="text"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                className="w-full px-2.5 py-1.5 border-2 border-black rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                value={data.instructorName}
                onChange={(e) => setData({ ...data, instructorName: e.target.value })}
                className="w-full px-2.5 py-1.5 border-2 border-black rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
              Institution / School Name
            </label>
            <input
              type="text"
              value={data.institutionName}
              onChange={(e) => setData({ ...data, institutionName: e.target.value })}
              className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-medium"
            />
          </div>
        </div>

        {/* Live Visual Certificate Preview */}
        <div className="lg:col-span-2">
          <div className="bg-[#FAF7F2] p-8 sm:p-12 rounded-2xl border-4 border-black shadow-[8px_8px_0px_#000000] text-center relative overflow-hidden space-y-6">
            {/* Inner Decorative Border */}
            <div className="border-2 border-[#FFD21A] p-8 rounded-xl bg-white space-y-6">
              {/* Institution Header */}
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
                  {data.institutionName || 'ACADEMY OF LEARNING'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
                  Certificate of Achievement
                </h3>
              </div>

              {/* Presented To */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block">
                  PROUDLY PRESENTED TO
                </span>
                <p className="text-3xl sm:text-4xl font-serif font-black text-black border-b-2 border-[#FFD21A] inline-block px-8 pb-1">
                  {data.recipientName || 'Student Name'}
                </p>
              </div>

              {/* Course Title & Description */}
              <div className="max-w-md mx-auto space-y-1">
                <span className="text-xs text-neutral-500 font-medium block">
                  For outstanding completion and excellence in
                </span>
                <h4 className="text-lg font-black text-black">
                  {data.courseTitle || 'Specialized Curriculum'}
                </h4>
                {data.achievementDescription && (
                  <p className="text-xs text-neutral-500 italic mt-1">
                    "{data.achievementDescription}"
                  </p>
                )}
              </div>

              {/* Signatures & Date */}
              <div className="grid grid-cols-2 gap-8 pt-8 max-w-md mx-auto text-xs">
                <div className="border-t border-black pt-1.5">
                  <span className="font-bold text-black block">{data.date}</span>
                  <span className="text-[10px] uppercase font-black text-neutral-400">
                    Date Issued
                  </span>
                </div>

                <div className="border-t border-black pt-1.5">
                  <span className="font-bold text-black block">{data.instructorName}</span>
                  <span className="text-[10px] uppercase font-black text-neutral-400">
                    Instructor / Authorized
                  </span>
                </div>
              </div>

              {/* Subtext */}
              <p className="text-[9px] text-neutral-400 italic pt-2">
                Notice: This certificate is issued for educational recognition and is not an
                officially accredited credential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
