import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';
import { useToast } from '../../../context/ToastContext.js';

export interface CardItem {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  box: number;
  nextReviewDate?: string;
  intervalDays?: number;
  repetitions?: number;
}

export interface DeckItem {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  isPublic: boolean;
  cards: CardItem[];
}

export const FlashcardMaker: React.FC = () => {
  const { showToast } = useToast();
  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState<DeckItem | null>(null);

  // Study Mode State
  const [isStudying, setIsStudying] = useState(false);
  const [studyCards, setStudyCards] = useState<CardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);

  // Deck Create Modal
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [newDeck, setNewDeck] = useState({
    title: '',
    subject: '',
    description: '',
    isPublic: false,
  });

  // Card Add Modal
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    question: '',
    answer: '',
    hint: '',
  });

  const loadDecks = async () => {
    try {
      setIsLoading(true);
      const res = await educationApi.getFlashcardDecks();
      if (res.success && Array.isArray(res.data)) {
        setDecks(res.data);
      }
    } catch (e) {
      console.error('Failed to load flashcard decks', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDecks();
  }, []);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeck.title.trim() || !newDeck.subject.trim()) return;
    const res = await educationApi.createFlashcardDeck({ ...newDeck, cards: [] });
    if (res.success) {
      setIsDeckModalOpen(false);
      setNewDeck({ title: '', subject: '', description: '', isPublic: false });
      loadDecks();
    }
  };

  const handleDeleteDeck = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this flashcard deck and all its cards?')) {
      await educationApi.deleteFlashcardDeck(id);
      if (activeDeck?._id === id) setActiveDeck(null);
      loadDecks();
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeck || !newCard.question.trim() || !newCard.answer.trim()) return;

    const updatedCards: CardItem[] = [
      ...activeDeck.cards,
      {
        id: 'card-' + Date.now(),
        question: newCard.question.trim(),
        answer: newCard.answer.trim(),
        hint: newCard.hint.trim(),
        box: 1,
      },
    ];

    const res = await educationApi.updateFlashcardDeck(activeDeck._id, { cards: updatedCards });
    if (res.success) {
      setActiveDeck(res.data);
      setNewCard({ question: '', answer: '', hint: '' });
      setIsCardModalOpen(false);
      loadDecks();
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!activeDeck) return;
    const updatedCards = activeDeck.cards.filter((c) => c.id !== cardId);
    const res = await educationApi.updateFlashcardDeck(activeDeck._id, { cards: updatedCards });
    if (res.success) {
      setActiveDeck(res.data);
      loadDecks();
    }
  };

  const startStudy = (deck: DeckItem) => {
    if (deck.cards.length === 0) {
      showToast('Add at least one card to this deck before studying.', 'info');
      return;
    }
    setActiveDeck(deck);
    setStudyCards([...deck.cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setKnownCount(0);
    setLearningCount(0);
    setIsStudying(true);
  };

  const handleShuffle = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleReviewAction = async (known: boolean) => {
    if (!activeDeck || studyCards.length === 0) return;
    const currentCard = studyCards[currentIndex];
    if (!currentCard) return;

    // Spaced repetition update on backend
    await educationApi.reviewCard(activeDeck._id, currentCard.id, known);

    if (known) {
      setKnownCount((k) => k + 1);
    } else {
      setLearningCount((l) => l + 1);
    }

    if (currentIndex + 1 < studyCards.length) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      // Completed session
      showToast(
        `Session Complete! Known Cards: ${knownCount + (known ? 1 : 0)}, Still Learning: ${
          learningCount + (known ? 0 : 1)
        }`,
        'success',
      );
      setIsStudying(false);
      loadDecks();
    }
  };

  // Study Interface
  if (isStudying && activeDeck && studyCards.length > 0) {
    const currentCard = studyCards[currentIndex];
    if (!currentCard) {
      return null;
    }
    const progress = Math.round(((currentIndex + 1) / studyCards.length) * 100);

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Study Header */}
        <div className="flex items-center justify-between bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-gray-border)] shadow-sm">
          <button
            onClick={() => setIsStudying(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Study Mode
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black">
              Card {currentIndex + 1} of {studyCards.length}
            </span>
            <button
              onClick={handleShuffle}
              className="p-1.5 rounded-lg border border-black hover:bg-neutral-100 text-xs flex items-center gap-1 font-bold"
              title="Shuffle Cards"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 h-2.5 rounded-full border border-black overflow-hidden">
          <div
            className="h-full bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Interactive Flip Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`min-h-[280px] p-8 rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] cursor-pointer select-none transition-all flex flex-col justify-between ${
            isFlipped
              ? 'bg-[var(--theme-surface)] shadow-[4px_4px_0px_var(--theme-gray-border)]'
              : 'shadow-[4px_4px_0px_var(--theme-gray-border)] hover:-translate-y-1'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span className="uppercase tracking-widest text-[10px] text-slate-400 font-black">
              {isFlipped ? 'ANSWER (CLICK TO FLIP)' : 'QUESTION (CLICK TO FLIP)'}
            </span>
            <span className="px-2 py-0.5 rounded bg-black/5 text-slate-300">
              Box {currentCard.box || 1}
            </span>
          </div>

          <div className="text-center py-6">
            <p className="text-xl sm:text-2xl font-black text-slate-100 leading-relaxed">
              {isFlipped ? currentCard.answer : currentCard.question}
            </p>
            {!isFlipped && showHint && currentCard.hint && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-300 inline-block">
                Hint: {currentCard.hint}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400">
            {!isFlipped && currentCard.hint ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
                className="text-[var(--theme-dirty-white)] hover:text-[var(--theme-dirty-white-muted)] hover:underline flex items-center gap-1 font-bold text-xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            ) : (
              <span />
            )}
            <span className="flex items-center gap-1 font-bold text-slate-400">
              <RotateCw className="w-3 h-3" /> Click card to flip
            </span>
          </div>
        </div>

        {/* Response Controls */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleReviewAction(false)}
            className="py-3 px-4 bg-[var(--theme-surface)] hover:bg-red-50 text-red-600 font-black text-sm rounded-xl border border-[var(--theme-gray-border)] shadow-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform"
          >
            <X className="w-5 h-5 stroke-[3]" />
            Still Learning
          </button>

          <button
            onClick={() => handleReviewAction(true)}
            className="py-3 px-4 bg-[#4ADE80] text-slate-100 font-black text-sm rounded-xl border border-[var(--theme-gray-border)] shadow-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            Got It!
          </button>
        </div>
      </div>
    );
  }

  // Deck Detail View
  if (activeDeck) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
          <div>
            <button
              onClick={() => setActiveDeck(null)}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-100 mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to all decks
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-[var(--theme-surface-raised)] border border-black/20">
                {activeDeck.subject}
              </span>
              <h2 className="text-xl font-black">{activeDeck.title}</h2>
            </div>
            {activeDeck.description && (
              <p className="text-xs text-slate-400 mt-1">{activeDeck.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--theme-surface)] text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </button>
            <button
              onClick={() => startStudy(activeDeck)}
              disabled={activeDeck.cards.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] disabled:opacity-50 text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              Study Now ({activeDeck.cards.length})
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        {activeDeck.cards.length === 0 ? (
          <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
            <Layers className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-300">No cards in this deck yet</h4>
            <p className="text-xs text-slate-400 mt-1">
              Add flashcard questions and answers to begin studying.
            </p>
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="mt-4 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-black shadow-sm"
            >
              Add First Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDeck.cards.map((c, i) => (
              <div
                key={c.id || i}
                className="bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-gray-border)] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 mb-2">
                    <span>Card #{i + 1}</span>
                    <span className="bg-[var(--theme-surface-raised)] px-2 py-0.5 rounded border border-black/20 text-slate-300">
                      Box {c.box || 1}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-neutral-900 mb-2">
                    <span className="text-xs font-black uppercase text-neutral-400 block mb-0.5">
                      Q:
                    </span>
                    {c.question}
                  </p>
                  <p className="text-xs text-slate-400 border-t border-neutral-100 pt-2">
                    <span className="text-[10px] font-black uppercase text-emerald-600 block mb-0.5">
                      A:
                    </span>
                    {c.answer}
                  </p>
                  {c.hint && (
                    <p className="text-[11px] text-amber-700 mt-2 bg-amber-50 p-1.5 rounded border border-amber-200">
                      Hint: {c.hint}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-3 mt-2 border-t border-neutral-100">
                  <button
                    onClick={() => handleDeleteCard(c.id)}
                    className="text-neutral-400 hover:text-red-600 p-1 rounded transition-colors"
                    title="Delete card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Card Modal */}
        {isCardModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-md p-6">
              <h3 className="text-lg font-black mb-4">Add Card to {activeDeck.title}</h3>
              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Question / Prompt *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter front-of-card question"
                    value={newCard.question}
                    onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD21A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Answer *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter back-of-card answer"
                    value={newCard.answer}
                    onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD21A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Hint (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Helpful clue or memory hook"
                    value={newCard.hint}
                    onChange={(e) => setNewCard({ ...newCard, hint: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCardModalOpen(false)}
                    className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Decks Overview List
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Flashcard Maker & Spaced Repetition
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Boost memory retention with Leitner active-recall decks and scheduled review.
          </p>
        </div>

        <button
          onClick={() => setIsDeckModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Deck
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 font-bold text-slate-400">
          Loading flashcard decks...
        </div>
      ) : decks.length === 0 ? (
        <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
          <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-300">No flashcard decks yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Create your first deck to start practicing with spaced repetition.
          </p>
          <button
            onClick={() => setIsDeckModalOpen(true)}
            className="mt-4 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-black shadow-sm"
          >
            Create First Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div
              key={deck._id}
              onClick={() => setActiveDeck(deck)}
              className="bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--theme-surface-raised)] border border-black/20 text-slate-300">
                    {deck.subject}
                  </span>
                  <button
                    onClick={(e) => handleDeleteDeck(deck._id, e)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                    title="Delete deck"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-black text-base text-slate-100">{deck.title}</h3>
                {deck.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{deck.description}</p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  {deck.cards?.length || 0} cards
                </span>
                <span className="text-xs font-black text-[var(--theme-dirty-white)] hover:underline">
                  Study & Manage &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Deck Modal */}
      {isDeckModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-md p-6">
            <h3 className="text-lg font-black mb-4">Create New Flashcard Deck</h3>
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biology, History, Computer Science"
                  value={newDeck.subject}
                  onChange={(e) => setNewDeck({ ...newDeck, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Deck Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cell Organelles & Functions"
                  value={newDeck.title}
                  onChange={(e) => setNewDeck({ ...newDeck, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional overview or course unit"
                  value={newDeck.description}
                  onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="deckPublic"
                  checked={newDeck.isPublic}
                  onChange={(e) => setNewDeck({ ...newDeck, isPublic: e.target.checked })}
                  className="rounded border-black"
                />
                <label htmlFor="deckPublic" className="text-xs font-bold text-slate-300">
                  Make this deck publicly accessible for other learners
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeckModalOpen(false)}
                  className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
