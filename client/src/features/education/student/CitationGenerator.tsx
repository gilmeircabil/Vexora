import React, { useState } from 'react';
import { Quote, Copy, Check, Book, Globe, FileText, AlertCircle, Sparkles } from 'lucide-react';

export type CitationStyle = 'apa' | 'mla' | 'ieee' | 'chicago';
export type SourceType = 'book' | 'journal' | 'website';

export const CitationGenerator: React.FC = () => {
  const [style, setStyle] = useState<CitationStyle>('apa');
  const [sourceType, setSourceType] = useState<SourceType>('book');
  const [copiedBib, setCopiedBib] = useState(false);
  const [copiedInText, setCopiedInText] = useState(false);

  const [formData, setFormData] = useState({
    authorLast: 'Smith',
    authorFirst: 'John',
    additionalAuthors: '',
    title: 'Principles of Modern Computing',
    publisher: 'Academic Press',
    journalName: 'Journal of Software Science',
    volume: '14',
    issue: '2',
    pages: '45-62',
    year: '2023',
    url: 'https://doi.org/10.1016/j.jss.2023.01.002',
    accessDate: new Date().toISOString().split('T')[0],
  });

  // Generate bibliography string based on style
  const generateBibliography = (): string => {
    const {
      authorLast,
      authorFirst,
      additionalAuthors,
      title,
      publisher,
      journalName,
      volume,
      issue,
      pages,
      year,
      url,
    } = formData;

    const authorStr = authorLast
      ? `${authorLast}, ${authorFirst ? authorFirst[0] + '.' : ''}${
          additionalAuthors ? `, & ${additionalAuthors}` : ''
        }`
      : 'Unknown Author';

    const mlaAuthorStr = authorLast
      ? `${authorLast}, ${authorFirst || ''}${
          additionalAuthors ? `, and ${additionalAuthors}` : ''
        }.`
      : '';

    switch (style) {
      case 'apa': // APA 7th
        if (sourceType === 'book') {
          return `${authorStr} (${year || 'n.d.'}). ${title}. ${publisher || ''}. ${
            url ? url : ''
          }`.trim();
        }
        if (sourceType === 'journal') {
          const volIssue = volume ? (issue ? `${volume}(${issue})` : volume) : '';
          return `${authorStr} (${year || 'n.d.'}). ${title}. ${
            journalName || 'Journal'
          }, ${volIssue}${pages ? `, ${pages}` : ''}. ${url ? url : ''}`.trim();
        }
        // Website
        return `${authorStr} (${year || 'n.d.'}). ${title}. ${
          publisher ? publisher + '. ' : ''
        }${url ? url : ''}`.trim();

      case 'mla': // MLA 9th
        if (sourceType === 'book') {
          return `${mlaAuthorStr} *${title}*. ${publisher || ''}, ${year || 'n.d.'}.`.trim();
        }
        if (sourceType === 'journal') {
          return `${mlaAuthorStr} "${title}." *${journalName || 'Journal'}*, vol. ${
            volume || '1'
          }, no. ${issue || '1'}, ${year || 'n.d.'}, pp. ${pages || ''}. ${url ? url : ''}`.trim();
        }
        return `${mlaAuthorStr} "${title}." *${publisher || 'Website'}*, ${
          year || 'n.d.'
        }, ${url ? url : ''}.`.trim();

      case 'ieee': // IEEE
        const firstInit = authorFirst ? authorFirst[0] + '. ' : '';
        const ieeeAuthor = `${firstInit}${authorLast}${additionalAuthors ? ' et al.' : ''}`;
        if (sourceType === 'book') {
          return `${ieeeAuthor}, *${title}*, ${publisher ? publisher + ', ' : ''}${
            year || 'n.d.'
          }.`.trim();
        }
        if (sourceType === 'journal') {
          return `${ieeeAuthor}, "${title}," *${journalName || 'Journal'}*, vol. ${
            volume || '1'
          }, no. ${issue || '1'}, pp. ${pages || ''}, ${year || 'n.d.'}.`.trim();
        }
        return `${ieeeAuthor}, "${title}," [Online]. Available: ${url || ''}. [Accessed: ${
          formData.accessDate
        }].`.trim();

      case 'chicago': // Chicago 17th Notes & Bib
        if (sourceType === 'book') {
          return `${authorLast}, ${authorFirst || ''}. *${title}*. ${
            publisher ? publisher + ', ' : ''
          }${year || 'n.d.'}.`.trim();
        }
        if (sourceType === 'journal') {
          return `${authorLast}, ${authorFirst || ''}. "${title}." *${
            journalName || 'Journal'
          }* ${volume || '1'}, no. ${issue || '1'} (${year || 'n.d.'}): ${pages || ''}.`.trim();
        }
        return `${authorLast}, ${authorFirst || ''}. "${title}." ${publisher || ''}. Accessed ${
          formData.accessDate
        }. ${url || ''}.`.trim();

      default:
        return `${authorLast}, ${authorFirst}. ${title}. (${year}).`;
    }
  };

  // Generate in-text citation
  const generateInText = (): string => {
    const { authorLast, year } = formData;
    const author = authorLast || 'Author';
    const y = year || 'n.d.';

    switch (style) {
      case 'apa':
        return `(${author}, ${y})`;
      case 'mla':
        return `(${author} ${formData.pages ? formData.pages.split('-')[0] : ''})`.trim();
      case 'ieee':
        return `[1]`;
      case 'chicago':
        return `(${author} ${y})`;
      default:
        return `(${author}, ${y})`;
    }
  };

  const bibliography = generateBibliography();
  const inText = generateInText();

  const handleCopy = (text: string, isBib: boolean) => {
    navigator.clipboard.writeText(text);
    if (isBib) {
      setCopiedBib(true);
      setTimeout(() => setCopiedBib(false), 2000);
    } else {
      setCopiedInText(true);
      setTimeout(() => setCopiedInText(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Quote className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Academic Citation Generator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant citations formatted in APA, MLA, IEEE, and Chicago styles.
          </p>
        </div>

        {/* Style selector */}
        <div className="flex bg-[var(--theme-surface-raised)] p-1 rounded-xl border border-black text-xs font-black">
          {(['apa', 'mla', 'ieee', 'chicago'] as CitationStyle[]).map((st) => (
            <button
              key={st}
              onClick={() => setStyle(st)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                style === st ? 'bg-black text-white shadow-sm' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="p-3.5 bg-[var(--theme-surface-raised)] rounded-xl border border-[var(--theme-gray-border)] flex items-start gap-2.5 text-xs text-[var(--theme-dirty-white)]">
        <AlertCircle className="w-4 h-4 shrink-0 text-[var(--theme-gray-muted)] mt-0.5" />
        <div>
          <span className="font-bold">Academic Style Notice:</span> Citation formatting rules vary
          by edition and university department. Always verify punctuation, capitalization, and
          formatting against the applicable official style guide handbook before final submission.
        </div>
      </div>

      {/* Source Type Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSourceType('book')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
            sourceType === 'book'
              ? 'border-black bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-sm'
              : 'border-neutral-300 bg-[var(--theme-surface)] hover:border-black'
          }`}
        >
          <Book className="w-4 h-4" />
          Book
        </button>

        <button
          onClick={() => setSourceType('journal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
            sourceType === 'journal'
              ? 'border-black bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-sm'
              : 'border-neutral-300 bg-[var(--theme-surface)] hover:border-black'
          }`}
        >
          <FileText className="w-4 h-4" />
          Journal Article
        </button>

        <button
          onClick={() => setSourceType('website')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
            sourceType === 'website'
              ? 'border-black bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-sm'
              : 'border-neutral-300 bg-[var(--theme-surface)] hover:border-black'
          }`}
        >
          <Globe className="w-4 h-4" />
          Website
        </button>
      </div>

      {/* Form Fields & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Details */}
        <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-4">
          <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider">
            Source Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                Author Last Name
              </label>
              <input
                type="text"
                value={formData.authorLast}
                onChange={(e) => setFormData({ ...formData, authorLast: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                Author First Name
              </label>
              <input
                type="text"
                value={formData.authorFirst}
                onChange={(e) => setFormData({ ...formData, authorFirst: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-300 mb-1">
              Additional Authors (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Jane Doe, Alan Turing"
              value={formData.additionalAuthors}
              onChange={(e) => setFormData({ ...formData, additionalAuthors: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-300 mb-1">
              Title of Work
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
            />
          </div>

          {sourceType === 'book' && (
            <div>
              <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                Publisher
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>
          )}

          {sourceType === 'journal' && (
            <>
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Journal / Periodical Name
                </label>
                <input
                  type="text"
                  value={formData.journalName}
                  onChange={(e) => setFormData({ ...formData, journalName: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Volume
                  </label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    className="w-full px-2 py-1.5 border border-black rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Issue
                  </label>
                  <input
                    type="text"
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    className="w-full px-2 py-1.5 border border-black rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Pages
                  </label>
                  <input
                    type="text"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    className="w-full px-2 py-1.5 border border-black rounded-lg text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                Publication Year
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                URL or DOI
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Formatted Citation Preview */}
        <div className="space-y-4">
          {/* Full Reference Card */}
          <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400">
                Bibliography / Works Cited ({style.toUpperCase()})
              </span>
              <button
                onClick={() => handleCopy(bibliography, true)}
                className="flex items-center gap-1 text-xs font-black bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] px-2.5 py-1 rounded-lg border border-black transition-colors cursor-pointer"
              >
                {copiedBib ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedBib ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-4 bg-[var(--theme-surface-raised)] rounded-xl border border-black/10 font-serif text-sm leading-relaxed text-slate-100 break-words select-all">
              {bibliography}
            </div>
          </div>

          {/* In-Text Citation Card */}
          <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400">
                In-Text Citation ({style.toUpperCase()})
              </span>
              <button
                onClick={() => handleCopy(inText, false)}
                className="flex items-center gap-1 text-xs font-black bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] px-2.5 py-1 rounded-lg border border-black transition-colors cursor-pointer"
              >
                {copiedInText ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedInText ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-4 bg-[var(--theme-surface-raised)] rounded-xl border border-black/10 font-mono text-sm text-slate-100 select-all">
              {inText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
