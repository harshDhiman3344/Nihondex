import React, { useState, useRef, useEffect } from 'react';
import kanjiData from '../data/kanji.json';
import { Volume2, ChevronLeft, Award, HelpCircle, RefreshCw, Star } from 'lucide-react';

export default function KanjiQuest({ srs }) {
  const { srsItems, recordReview } = srs;
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // all | due | learned
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const now = Date.now();

  // Filter Kanji list
  const filteredKanji = kanjiData.filter(k => {
    const srsItem = srsItems[k.character];
    const isLearned = !!srsItem;
    const isDue = srsItem && srsItem.nextReview <= now;

    if (filterMode === 'due') return isDue;
    if (filterMode === 'learned') return isLearned;
    return true;
  });

  // Calculate learning counts
  const totalKanji = kanjiData.length;
  const learnedCount = Object.values(srsItems).filter(item => item.type === 'kanji').length;
  const dueCount = kanjiData.filter(k => srsItems[k.character] && srsItems[k.character].nextReview <= now).length;

  // TTS audio player
  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Drawing pad handlers
  useEffect(() => {
    if (selectedKanji && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 240;
      canvas.height = 240;
      ctx.strokeStyle = '#4d443c';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      clearCanvas();
    }
  }, [selectedKanji]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid guidelines
    ctx.strokeStyle = 'rgba(77, 68, 60, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(120, 0); ctx.lineTo(120, 240);
    ctx.moveTo(0, 120); ctx.lineTo(240, 120);
    ctx.stroke();
    
    ctx.strokeStyle = '#4d443c';
    ctx.lineWidth = 5;
    ctx.setLineDash([]);
  };

  const handleSRSSelection = (quality) => {
    if (!selectedKanji) return;
    recordReview(selectedKanji.character, quality, 'kanji');
    playAudio(selectedKanji.character);
    setSelectedKanji(null);
  };

  // Get heatmap level styling for a kanji
  const getHeatmapClass = (char) => {
    const srsItem = srsItems[char];
    if (!srsItem) return 'heatmap-new';
    
    const isDue = srsItem.nextReview <= now;
    if (isDue) return 'heatmap-due animate-float';

    const interval = srsItem.interval || 0;
    if (interval >= 15) return 'heatmap-mastered';
    if (interval >= 5) return 'heatmap-familiar';
    return 'heatmap-started';
  };

  return (
    <div className="kanji-quest-view animate-fade-in">
      <div className="journal-header">
        <div>
          <h2>Kanji Quest Heatmap</h2>
          <p className="journal-subtitle font-hand">Practice N5 Kanji readings and writing stroke orders</p>
        </div>
      </div>

      {!selectedKanji ? (
        /* Grid list view with Heatmap elements */
        <>
          <div className="kanji-filters card-cozy flex-between gap-4 mb-8">
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={() => setFilterMode('all')} 
                className={`btn-pressable btn-sm ${filterMode === 'all' ? 'btn-primary' : ''}`}
              >
                All Kanji ({totalKanji})
              </button>
              <button 
                onClick={() => setFilterMode('due')} 
                className={`btn-pressable btn-sm ${filterMode === 'due' ? 'btn-accent' : ''}`}
              >
                Due Review ({dueCount})
              </button>
              <button 
                onClick={() => setFilterMode('learned')} 
                className={`btn-pressable btn-sm ${filterMode === 'learned' ? 'btn-primary' : ''}`}
              >
                Learned ({learnedCount})
              </button>
            </div>
            <div className="text-sm font-semibold flex gap-4">
              <span>Progress: {Math.round((learnedCount / totalKanji) * 100)}%</span>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="heatmap-legend flex gap-4 flex-wrap mb-4 text-xs font-semibold">
            <div className="legend-item flex-center gap-1.5">
              <div className="legend-box heatmap-new"></div> <span>New (Unlearned)</span>
            </div>
            <div className="legend-item flex-center gap-1.5">
              <div className="legend-box heatmap-started"></div> <span>Familiar (Early SRS)</span>
            </div>
            <div className="legend-item flex-center gap-1.5">
              <div className="legend-box heatmap-familiar"></div> <span>Learned (Medium SRS)</span>
            </div>
            <div className="legend-item flex-center gap-1.5">
              <div className="legend-box heatmap-mastered"></div> <span>Mastered (High SRS)</span>
            </div>
            <div className="legend-item flex-center gap-1.5">
              <div className="legend-box heatmap-due"></div> <span>Due for Review</span>
            </div>
          </div>

          {/* Heatmap Layout Grid */}
          <div className="card-cozy heatmap-container-card mb-8">
            <div className="kanji-heatmap-grid">
              {filteredKanji.map((k) => {
                const heatmapClass = getHeatmapClass(k.character);
                const firstMeaning = k.meanings?.[0] || '';
                const onReading = k.onyomi?.[0] || '';
                const kunReading = k.kunyomi?.[0] || '';
                
                const tooltipText = `${k.character}\nMeaning: ${firstMeaning}\nOn: ${onReading || 'None'}\nKun: ${kunReading || 'None'}`;

                return (
                  <div
                    key={k.character}
                    onClick={() => setSelectedKanji(k)}
                    className={`heatmap-square flex-center ${heatmapClass}`}
                    title={tooltipText}
                  >
                    <span className="heatmap-char font-hand">{k.character}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Detail character study view */
        <div className="kanji-detail-view animate-fade-in">
          <button onClick={() => setSelectedKanji(null)} className="btn-pressable mb-6">
            <ChevronLeft size={16} /> Back to Kanji Heatmap
          </button>

          <div className="detail-split-layout grid grid-cols-2 gap-8">
            {/* Left Panel: Information */}
            <div className="card-cozy kanji-info-panel flex flex-col justify-between">
              <div className="info-top">
                <div className="flex-between border-b pb-4 mb-4">
                  <div>
                    <h3 className="character-big font-hand animate-float">{selectedKanji.character}</h3>
                    <p className="strokes-count font-hand">{selectedKanji.strokes} Strokes</p>
                  </div>
                  <button onClick={() => playAudio(selectedKanji.character)} className="btn-pressable btn-primary flex-center">
                    <Volume2 size={18} /> Pronounce
                  </button>
                </div>

                <div className="kanji-meta-row">
                  <strong>Meanings</strong>
                  <p className="meta-val font-semibold text-lg">{selectedKanji.meanings.join(', ')}</p>
                </div>

                <div className="kanji-meta-row mt-4">
                  <strong>Onyomi (Chinese reading)</strong>
                  <p className="meta-val font-hand text-lg text-accent-dark">{selectedKanji.onyomi.length > 0 ? selectedKanji.onyomi.join(', ') : 'None'}</p>
                </div>

                <div className="kanji-meta-row mt-4">
                  <strong>Kunyomi (Japanese reading)</strong>
                  <p className="meta-val font-hand text-lg text-primary-dark">{selectedKanji.kunyomi.length > 0 ? selectedKanji.kunyomi.join(', ') : 'None'}</p>
                </div>
              </div>

              {/* Context Examples */}
              <div className="info-bottom mt-6 pt-6 border-t">
                <h4 className="font-hand font-bold mb-3">Context Compounds</h4>
                {selectedKanji.examples && selectedKanji.examples.length > 0 ? (
                  <div className="kanji-examples flex flex-col gap-3">
                    {selectedKanji.examples.map((ex, idx) => (
                      <div key={idx} className="kanji-ex-box bg-card-secondary p-3 border rounded-xl">
                        <div className="flex-between">
                          <strong className="text-md font-hand">{ex.word} ({ex.reading})</strong>
                        </div>
                        <p className="text-sm mt-1">{ex.meaning}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No specific examples parsed, use in custom N5 sentences.</p>
                )}
              </div>
            </div>

            {/* Right Panel: Interactive Drawing Pad & SRS Self-Rating */}
            <div className="flex flex-col gap-6">
              {/* Stroke Order Drawing pad */}
              <div className="card-cozy drawing-panel flex-center flex-col">
                <h4 className="font-hand font-bold mb-2">Practice Writing Pad</h4>
                <p className="text-xs text-muted mb-4">Draw using mouse or touch inside the grid boundaries:</p>
                
                <div className="canvas-wrapper">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="drawing-canvas"
                  />
                </div>

                <button onClick={clearCanvas} className="btn-pressable btn-sm btn-accent mt-4">
                  <RefreshCw size={12} /> Clear Practice Pad
                </button>
              </div>

              {/* SRS Rating Board */}
              <div className="card-cozy srs-panel">
                <h4 className="font-hand font-bold text-center mb-3">Self-Assessment Review</h4>
                <p className="text-xs text-muted text-center mb-4">Rate how easily you remembered this character:</p>
                
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
        </div>
      )}
    </div>
  );
}


