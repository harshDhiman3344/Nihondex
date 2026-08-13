import React, { useState, useEffect } from 'react';
import grammarData from '../data/grammar.json';
import { Volume2, Search, ChevronLeft, RefreshCw, Sparkles, BookOpen, Award, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GrammarGuide({ srs }) {
  const { srsItems, recordReview, addXpPoints } = srs;
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('browse'); // browse | detail | builder
  const [selectedGrammar, setSelectedGrammar] = useState(null);

  // Sentence Builder state
  const [puzzleSentence, setPuzzleSentence] = useState(null);
  const [scrambledBlocks, setScrambledBlocks] = useState([]);
  const [assembledBlocks, setAssembledBlocks] = useState([]);
  const [puzzleAnswerState, setPuzzleAnswerState] = useState('idle'); // idle | correct | wrong

  const now = Date.now();

  // Filter grammar list
  const filteredGrammar = grammarData.filter(g => {
    return g.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
           g.meaning.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // TTS voice speaker
  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // SM-2 SRS record review
  const handleSRSSelection = (quality) => {
    if (!selectedGrammar) return;
    recordReview(selectedGrammar.id, quality, 'grammar');
    playAudio(selectedGrammar.pattern);
    setSelectedGrammar(null);
  };

  // Sentence Segmenter (Splits Japanese sentence by particles & common words)
  const segmentSentence = (sentence) => {
    // Basic segmenter: splits by particles: は, が, を, に, で, へ, と, も
    const particleRegex = /([はがをにでへとも])/g;
    
    // Split, clean up empty slots, and filter
    const segments = sentence
      .split(particleRegex)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return segments;
  };

  // Load a new sentence puzzle
  const startNewPuzzle = () => {
    // Get all grammar points that have examples
    const validGrammars = grammarData.filter(g => g.examples && g.examples.length > 0);
    if (validGrammars.length === 0) return;

    // Pick a random grammar point and random example sentence
    const randomGrammar = validGrammars[Math.floor(Math.random() * validGrammars.length)];
    const randomExample = randomGrammar.examples[Math.floor(Math.random() * randomGrammar.examples.length)];

    const segments = segmentSentence(randomExample.japanese);

    // If segmenting yielded only 1 segment, let's split by characters or use a fallback
    let blocks = segments;
    if (blocks.length <= 1) {
      // split by characters or 2-char chunks
      blocks = [];
      const text = randomExample.japanese;
      for (let i = 0; i < text.length; i += 2) {
        blocks.push(text.slice(i, i + 2));
      }
    }

    setPuzzleSentence(randomExample);
    setScrambledBlocks([...blocks].sort(() => 0.5 - Math.random()));
    setAssembledBlocks([]);
    setPuzzleAnswerState('idle');
    setViewMode('builder');
  };

  // Block clicks in builder
  const handleBlockClick = (block, idx, fromScrambled) => {
    if (puzzleAnswerState === 'correct') return;

    if (fromScrambled) {
      // Add to assembled
      setAssembledBlocks(prev => [...prev, block]);
      // Remove from scrambled
      const updated = [...scrambledBlocks];
      updated.splice(idx, 1);
      setScrambledBlocks(updated);
    } else {
      // Add back to scrambled
      setScrambledBlocks(prev => [...prev, block]);
      // Remove from assembled
      const updated = [...assembledBlocks];
      updated.splice(idx, 1);
      setAssembledBlocks(updated);
    }
    setPuzzleAnswerState('idle');
  };

  // Verify assembled sentence
  const checkPuzzle = () => {
    const assembledStr = assembledBlocks.join('');
    const targetStr = puzzleSentence.japanese;

    if (assembledStr === targetStr) {
      setPuzzleAnswerState('correct');
      playAudio(targetStr);
      addXpPoints(15); // +15 XP for correct sentence construction
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      setPuzzleAnswerState('wrong');
    }
  };

  return (
    <div className="grammar-view animate-fade-in">
      <div className="journal-header">
        <div>
          <h2>Grammar Guide & Sentence Builder</h2>
          <p className="journal-subtitle font-hand">Explore N5 structures and construct grammatically correct sentences</p>
        </div>
      </div>

      {viewMode === 'browse' && (
        <>
          {/* Controls */}
          <div className="vocab-controls card-cozy mb-8">
            <div className="search-row flex-between gap-4 mb-4">
              <div className="search-box-wrapper flex-1 flex-center">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search grammar patterns or English translations..."
                  className="search-input font-sans"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={startNewPuzzle} className="btn-pressable btn-accent">
                  <Sparkles size={16} /> Interactive Sentence Builder
                </button>
              </div>
            </div>
            <div className="text-sm font-semibold">
              Available: {filteredGrammar.length} grammar patterns
            </div>
          </div>

          {/* Grammar list grid */}
          <div className="grammar-grid grid grid-cols-2 gap-4">
            {filteredGrammar.map((g) => {
              const srsItem = srsItems[g.id];
              const isLearned = !!srsItem;
              const isDue = srsItem && srsItem.nextReview <= now;

              return (
                <div 
                  key={g.id}
                  onClick={() => { setSelectedGrammar(g); setViewMode('detail'); }}
                  className={`card-cozy grammar-card flex flex-col justify-between ${isDue ? 'border-due' : isLearned ? 'border-learned' : ''}`}
                >
                  <div>
                    <div className="flex-between mb-2">
                      <h4 className="grammar-pattern font-hand text-xl">{g.pattern}</h4>
                      {isDue && <span className="badge-due">Due</span>}
                      {isLearned && !isDue && <span className="badge-learned">Learned</span>}
                    </div>
                    <p className="grammar-meaning font-sans font-semibold text-sm mb-2">{g.meaning}</p>
                  </div>
                  <span className="grammar-view-link font-hand text-xs flex-center self-start gap-1">
                    Study details →
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Grammar detail view */}
      {viewMode === 'detail' && selectedGrammar && (
        <div className="grammar-detail-container animate-fade-in max-w-2xl mx-auto">
          <button onClick={() => setViewMode('browse')} className="btn-pressable mb-6">
            <ChevronLeft size={16} /> Back to Grammar list
          </button>

          <div className="card-cozy detail-card flex flex-col justify-between min-h-[350px]">
            <div className="detail-top flex-between border-b pb-4 mb-4">
              <div>
                <h3 className="character-big font-hand text-3xl">{selectedGrammar.pattern}</h3>
                <p className="flashcard-kana font-hand text-lg text-primary-dark">{selectedGrammar.meaning}</p>
              </div>
              <button onClick={() => playAudio(selectedGrammar.pattern)} className="btn-pressable btn-primary flex-center">
                <Volume2 size={18} /> Pronounce
              </button>
            </div>

            <div className="detail-body flex flex-col gap-6">
              <div className="kanji-meta-row">
                <strong>Conjugation / Formation</strong>
                <p className="meta-val font-mono font-bold text-sm bg-card-secondary p-3 border rounded-xl mt-1">{selectedGrammar.conjugation || 'No complex conjugations'}</p>
              </div>

              <div className="kanji-meta-row">
                <strong>Grammar Explanation</strong>
                <p className="meta-val text-sm leading-relaxed mt-1">{selectedGrammar.explanation}</p>
              </div>

              {/* Example Sentences */}
              {selectedGrammar.examples && selectedGrammar.examples.length > 0 && (
                <div className="kanji-meta-row">
                  <strong>Examples in Context</strong>
                  <div className="answer-examples flex flex-col gap-3 mt-2">
                    {selectedGrammar.examples.map((ex, idx) => (
                      <div key={idx} className="bg-card-secondary p-3 border rounded-xl">
                        <div className="flex-between">
                          <p className="text-md font-hand">{ex.japanese}</p>
                          <button onClick={() => playAudio(ex.japanese)} className="btn-pressable btn-sm flex-center">
                            <Volume2 size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-muted font-hand mt-0.5">{ex.furigana}</p>
                        <p className="text-sm italic mt-1">{ex.english}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SRS Assessment */}
            <div className="srs-panel border-t pt-6 mt-6">
              <p className="text-xs text-muted text-center mb-4">Rate your familiarity with this grammar pattern:</p>
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
        </div>
      )}

      {/* Interactive Sentence Builder Puzzle */}
      {viewMode === 'builder' && puzzleSentence && (
        <div className="sentence-builder-container animate-fade-in max-w-2xl mx-auto">
          <button onClick={() => setViewMode('browse')} className="btn-pressable mb-6">
            <ChevronLeft size={16} /> Exit Builder
          </button>

          <div className="card-cozy builder-card flex-center flex-col min-h-[400px]">
            <Award size={48} className="icon-award mb-2" />
            <h3 className="font-hand font-bold text-2xl mb-2">Sentence Scrambler</h3>
            <p className="text-sm text-muted text-center mb-6">Arrange the blocks to translate the following English sentence:</p>

            {/* English Prompt */}
            <div className="prompt-english bg-card-secondary border rounded-2xl p-4 w-full text-center font-semibold text-lg mb-8">
              "{puzzleSentence.english}"
            </div>

            {/* Assembly Board (Where blocks go) */}
            <div className={`assembly-board w-full min-h-[80px] border-2 border-dashed rounded-2xl p-4 flex flex-wrap gap-3 mb-8 items-center justify-center ${puzzleAnswerState === 'correct' ? 'border-success-line bg-success-fill' : puzzleAnswerState === 'wrong' ? 'border-error-line bg-error-fill animate-shake' : 'bg-card'}`}>
              {assembledBlocks.length === 0 && (
                <span className="text-muted text-sm font-hand">Click blocks below to construct sentence...</span>
              )}
              {assembledBlocks.map((block, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBlockClick(block, idx, false)}
                  className="btn-pressable block-card font-hand text-lg animate-fade-in"
                >
                  {block}
                </button>
              ))}
            </div>

            {/* Scrambled blocks deck (Blocks to pick) */}
            <div className="scrambled-deck flex flex-wrap gap-3 w-full justify-center mb-8">
              {scrambledBlocks.map((block, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBlockClick(block, idx, true)}
                  className="btn-pressable block-card font-hand text-lg"
                >
                  {block}
                </button>
              ))}
            </div>

            {/* Actions and Verify status */}
            <div className="builder-actions w-full flex gap-4">
              {puzzleAnswerState !== 'correct' ? (
                <>
                  <button 
                    onClick={() => {
                      setScrambledBlocks([...assembledBlocks, ...scrambledBlocks].sort(() => 0.5 - Math.random()));
                      setAssembledBlocks([]);
                      setPuzzleAnswerState('idle');
                    }}
                    className="btn-pressable flex-1"
                  >
                    Reset Puzzle
                  </button>
                  <button 
                    disabled={assembledBlocks.length === 0}
                    onClick={checkPuzzle}
                    className="btn-pressable btn-primary flex-1"
                  >
                    Check Construction
                  </button>
                </>
              ) : (
                <button onClick={startNewPuzzle} className="btn-pressable btn-accent w-full">
                  Correct! Konstrukt Next Sentence <ChevronLeft size={16} className="rotate-180" />
                </button>
              )}
            </div>

            {/* Wrong Answer alert */}
            {puzzleAnswerState === 'wrong' && (
              <p className="text-accent-dark font-semibold mt-4 animate-shake">Incorrect order, try wiggling the pieces!</p>
            )}
            
            {puzzleAnswerState === 'correct' && (
              <div className="text-primary-dark font-bold text-center mt-4">
                <Check size={18} className="inline mr-1" />
                Sentence built correctly! +15 XP Point Gain
                <p className="text-xs text-muted font-hand mt-1">{puzzleSentence.furigana}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

