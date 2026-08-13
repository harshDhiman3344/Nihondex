import React, { useState } from 'react';
import vocabData from '../data/vocab.json';
import { Volume2, Search, RefreshCw, Eye, Star, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Vocabulary({ srs }) {
  const { srsItems, recordReview } = srs;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLesson, setSelectedLesson] = useState('all'); // all | specific section name
  const [viewMode, setViewMode] = useState('browse'); // browse | review | detail
  const [selectedWord, setSelectedWord] = useState(null);

  // Review Queue state
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);

  const now = Date.now();

  // Categories mapping
  const categories = [
    { id: 'all', label: 'All Types' },
    { id: 'noun', label: 'Nouns' },
    { id: 'verb', label: 'Verbs' },
    { id: 'adjective', label: 'Adjectives' },
    { id: 'particle', label: 'Particles' },
    { id: 'adverb', label: 'Adverbs' },
    { id: 'expression', label: 'Expressions' }
  ];

  // Extract unique lesson sections dynamically from vocabulary database
  const uniqueLessons = Array.from(new Set(vocabData.map(v => v.lesson))).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  // Filter vocabulary list
  const filteredVocab = vocabData.filter(v => {
    const matchesSearch = 
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.reading.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.meaning.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = activeCategory === 'all' || 
      (v.partOfSpeech || '').toLowerCase().includes(activeCategory.toLowerCase());

    const matchesLesson = selectedLesson === 'all' || v.lesson === selectedLesson;
    
    return matchesSearch && matchesType && matchesLesson;
  });

  // TTS Voice player
  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Review session
  const startReview = () => {
    const dueList = vocabData.filter(v => {
      const srsItem = srsItems[v.word];
      return srsItem && srsItem.nextReview <= now;
    });

    if (dueList.length === 0) {
      alert("No reviews due right now! Learn some words or practice Kana first.");
      return;
    }

    setReviewQueue(dueList.sort(() => 0.5 - Math.random()));
    setReviewIdx(0);
    setRevealAnswer(false);
    setViewMode('review');
  };

  const handleSRSSelection = (quality) => {
    const currentWord = reviewQueue[reviewIdx];
    recordReview(currentWord.word, quality, 'vocab');
    playAudio(currentWord.word);

    if (reviewIdx + 1 < reviewQueue.length) {
      setReviewIdx(prev => prev + 1);
      setRevealAnswer(false);
    } else {
      // Completed reviews
      setViewMode('browse');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.65 }
      });
    }
  };

  return (
    <div className="vocab-view animate-fade-in">
      <div className="journal-header">
        <div>
          <h2>Vocabulary Syllabus Deck</h2>
          <p className="journal-subtitle font-hand">Practice N5 words, organized by lesson and section topic</p>
        </div>
      </div>

      {viewMode === 'browse' && (
        <>
          {/* Controls Bar */}
          <div className="vocab-controls card-cozy mb-8">
            <div className="search-row grid grid-cols-3 gap-4 mb-4 items-center">
              
              {/* Keyword Search */}
              <div className="search-box-wrapper col-span-2 flex-center">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by spelling, reading, or translation..."
                  className="search-input font-sans"
                />
              </div>

              {/* Review triggers */}
              <div className="flex justify-end">
                <button onClick={startReview} className="btn-pressable btn-accent w-full text-center">
                  Review Due ({vocabData.filter(v => srsItems[v.word] && srsItems[v.word].nextReview <= now).length})
                </button>
              </div>
            </div>

            {/* Selector Dropdown: Syllabus/Lessons and Type Categories */}
            <div className="filter-selection-grid grid grid-cols-3 gap-4 mb-4">
              <div className="lesson-select-box col-span-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase">Syllabus Section</label>
                <select 
                  value={selectedLesson} 
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="btn-pressable font-semibold py-2 px-3 text-sm text-left justify-start w-full bg-card"
                  style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
                >
                  <option value="all">All Lessons</option>
                  {uniqueLessons.map(lesson => (
                    <option key={lesson} value={lesson}>{lesson}</option>
                  ))}
                </select>
              </div>

              <div className="category-select-box col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase">Word Category Type</label>
                <div className="categories-row flex gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`btn-pressable btn-sm ${activeCategory === cat.id ? 'btn-primary' : ''}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-xs font-semibold text-muted text-right">
              Showing {filteredVocab.length} matches out of {vocabData.length} total words
            </div>
          </div>

          {/* Vocabulary list explorer */}
          <div className="vocab-list card-cozy">
            <div className="table-responsive">
              <table className="vocab-table">
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>Reading</th>
                    <th>Translation</th>
                    <th>Lesson / Section</th>
                    <th>Review State</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocab.slice(0, 100).map((v) => {
                    const srsItem = srsItems[v.word];
                    const isLearned = !!srsItem;
                    const isDue = srsItem && srsItem.nextReview <= now;

                    return (
                      <tr key={v.word} className={isDue ? 'row-due' : ''}>
                        <td className="font-hand font-bold text-xl">{v.word}</td>
                        <td className="font-hand text-primary-dark">{v.reading}</td>
                        <td className="font-sans font-semibold">{v.meaning}</td>
                        <td>
                          <span className="vocab-pos-badge" style={{ backgroundColor: 'var(--bg-card-secondary)', borderStyle: 'dotted' }}>
                            {v.lesson.split('-')[0].trim()}
                          </span>
                        </td>
                        <td>
                          {isDue ? (
                            <span className="badge-due">Due Review</span>
                          ) : isLearned ? (
                            <span className="badge-learned">Scheduled</span>
                          ) : (
                            <span className="badge-new">New</span>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button onClick={() => playAudio(v.word)} className="btn-pressable btn-sm flex-center">
                              <Volume2 size={14} />
                            </button>
                            <button onClick={() => { setSelectedWord(v); setViewMode('detail'); }} className="btn-pressable btn-sm btn-primary flex-center">
                              <Eye size={14} /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredVocab.length > 100 && (
                <p className="text-center text-xs text-muted mt-4">Showing first 100 entries. Refine search parameters above.</p>
              )}
              {filteredVocab.length === 0 && (
                <p className="text-center text-md py-6">No matching words found. Try adjusting filters.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Review Queue Mode */}
      {viewMode === 'review' && (
        <div className="vocab-review-container flex-center flex-col max-w-xl mx-auto">
          <button onClick={() => setViewMode('browse')} className="btn-pressable mb-6 self-start">
            <ChevronLeft size={16} /> Exit Session
          </button>

          <div className="card-cozy review-card-wrapper w-full flex-center flex-col min-h-[350px]">
            <div className="quiz-progress-bar w-full mb-6">
              <div className="q-progress" style={{ width: `${((reviewIdx + 1) / reviewQueue.length) * 100}%` }}></div>
            </div>

            <span className="review-progress-text mb-4 text-xs font-semibold">
              Word {reviewIdx + 1} of {reviewQueue.length}
            </span>

            {/* Flashcard Side A */}
            {!revealAnswer ? (
              <div className="card-prompt flex-center flex-col my-8 w-full">
                <span className="flashcard-spelling font-hand">{reviewQueue[reviewIdx]?.word}</span>
                <p className="prompt-label mt-4">Think of the reading and translation...</p>
                <button onClick={() => setRevealAnswer(true)} className="btn-pressable btn-primary mt-8">
                  Reveal Card Answer
                </button>
              </div>
            ) : (
              /* Flashcard Side B */
              <div className="card-answer-revealed flex-center flex-col w-full">
                <div className="answer-header flex-center gap-4 mb-4 border-b pb-4 w-full">
                  <div>
                    <h3 className="flashcard-spelling font-hand">{reviewQueue[reviewIdx]?.word}</h3>
                    <p className="flashcard-kana font-hand text-lg text-primary-dark">{reviewQueue[reviewIdx]?.reading}</p>
                  </div>
                  <button onClick={() => playAudio(reviewQueue[reviewIdx]?.word)} className="btn-pressable btn-primary btn-sm flex-center">
                    <Volume2 size={16} /> Play Voice
                  </button>
                </div>

                <div className="answer-details text-center mb-6">
                  <strong>Translation Meaning</strong>
                  <p className="text-xl font-bold text-title">{reviewQueue[reviewIdx]?.meaning}</p>
                  <span className="vocab-pos-badge mt-2">{reviewQueue[reviewIdx]?.partOfSpeech}</span>
                </div>

                {/* Example Sentences */}
                {reviewQueue[reviewIdx]?.examples && reviewQueue[reviewIdx].examples.length > 0 && (
                  <div className="answer-examples bg-card-secondary p-3 border rounded-xl w-full mb-8 text-left">
                    <strong className="text-xs uppercase text-muted tracking-wide">Example Context</strong>
                    {reviewQueue[reviewIdx].examples.map((ex, idx) => (
                      <div key={idx} className="mt-2 border-t pt-2 first:border-0 first:pt-0">
                        <p className="text-md font-hand">{ex.japanese}</p>
                        <p className="text-sm italic mt-1">{ex.english}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* SRS Self-Rating Board */}
                <div className="srs-panel w-full">
                  <p className="text-xs text-muted text-center mb-4">Rate how easily you remembered this word:</p>
                  <div className="srs-rating-buttons grid grid-cols-4 gap-2">
                    <button onClick={() => handleSRSSelection(1)} className="btn-pressable srs-rate srs-forgot flex-col">
                      <span className="rate-num">0</span>
                      <span className="rate-lbl">Forgot</span>
                    </button>
                    <button onClick={() => handleSRSSelection(3)} className="btn-pressable srs-rate srs-hard flex-col">
                      <span className="rate-num">3</span>
                      <span className="rate-lbl">Hard</span>
                    </button>
                    <button onClick={() => handleSRSSelection(4)} className="btn-pressable srs-rate srs-good flex-col">
                      <span className="rate-num">4</span>
                      <span className="rate-lbl">Good</span>
                    </button>
                    <button onClick={() => handleSRSSelection(5)} className="btn-pressable srs-rate srs-easy flex-col">
                      <span className="rate-num">5</span>
                      <span className="rate-lbl">Easy</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Word Detail View */}
      {viewMode === 'detail' && selectedWord && (
        <div className="vocab-detail-container animate-fade-in max-w-2xl mx-auto">
          <button onClick={() => setViewMode('browse')} className="btn-pressable mb-6">
            <ChevronLeft size={16} /> Back to Vocabulary list
          </button>

          <div className="card-cozy detail-card flex flex-col justify-between min-h-[300px]">
            <div className="detail-top flex-between border-b pb-4 mb-4">
              <div>
                <h3 className="character-big font-hand">{selectedWord.word}</h3>
                <p className="flashcard-kana font-hand text-lg text-primary-dark">{selectedWord.reading}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => playAudio(selectedWord.word)} className="btn-pressable btn-primary flex-center">
                  <Volume2 size={18} /> Pronounce
                </button>
              </div>
            </div>

            <div className="detail-body">
              <div className="kanji-meta-row">
                <strong>Translation Meaning</strong>
                <p className="meta-val font-semibold text-lg">{selectedWord.meaning}</p>
                <span className="vocab-pos-badge mt-2">{selectedWord.partOfSpeech}</span>
                <span className="vocab-pos-badge mt-2 ml-2" style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent-dark)' }}>{selectedWord.lesson}</span>
              </div>

              {/* Context Examples */}
              {selectedWord.examples && selectedWord.examples.length > 0 && (
                <div className="kanji-meta-row mt-6">
                  <strong>Example Context</strong>
                  <div className="answer-examples flex flex-col gap-3 mt-2">
                    {selectedWord.examples.map((ex, idx) => (
                      <div key={idx} className="bg-card-secondary p-3 border rounded-xl">
                        <p className="text-md font-hand">{ex.japanese}</p>
                        <p className="text-sm italic mt-1">{ex.english}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="detail-footer border-t pt-4 mt-6 text-center">
              {srsItems[selectedWord.word] ? (
                <div className="flex-center gap-2">
                  <Star size={16} className="color-primary-dark" />
                  <span>Item added to Spaced Repetition active learning deck.</span>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    recordReview(selectedWord.word, 4, 'vocab');
                    setViewMode('browse');
                  }}
                  className="btn-pressable btn-accent"
                >
                  Add to Active Review Deck
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
