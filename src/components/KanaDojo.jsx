import React, { useState, useEffect } from 'react';
import kanaData from '../data/kana.json';
import { Volume2, RefreshCw, Check, X, Award, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function KanaDojo({ srs }) {
  const { recordKanaResult } = srs;
  const [syllabary, setSyllabary] = useState('hiragana'); // hiragana | katakana
  const [setGroup, setSetGroup] = useState('base'); // base | dakuon | yoon
  const [mode, setMode] = useState('browse'); // browse | quiz
  
  // Drill/Quiz state
  const [quizList, setQuizList] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState(null);
  const [options, setOptions] = useState([]);
  const [quizScore, setQuizScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Flashcard flip states
  const [flippedCards, setFlippedCards] = useState({});

  const activeCharacters = kanaData[syllabary][setGroup];

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

  const toggleFlip = (char) => {
    setFlippedCards(prev => ({
      ...prev,
      [char]: !prev[char]
    }));
  };

  // Build options for quiz
  const generateOptions = (correctItem, allItems) => {
    const wrongOptions = allItems
      .filter(item => item.romaji !== correctItem.romaji)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    return [correctItem, ...wrongOptions].sort(() => 0.5 - Math.random());
  };

  // Start a new Quiz
  const startQuiz = () => {
    if (activeCharacters.length < 4) return;
    
    const shuffled = [...activeCharacters].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuizList(shuffled);
    setCurrentIdx(0);
    setQuizScore(0);
    setIsAnswered(false);
    setSelectedAns(null);
    setQuizFinished(false);
    
    // Set initial options
    setOptions(generateOptions(shuffled[0], activeCharacters));
    setMode('quiz');
  };

  // Answer handle
  const handleAnswerSelect = (opt) => {
    if (isAnswered) return;
    setSelectedAns(opt.romaji);
    setIsAnswered(true);

    const isCorrect = opt.romaji === quizList[currentIdx].romaji;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      // Play audio on correct answer
      playAudio(quizList[currentIdx].character);
      recordKanaResult(quizList[currentIdx].character, syllabary, true);
    } else {
      recordKanaResult(quizList[currentIdx].character, syllabary, false);
    }
  };

  // Next question
  const nextQuestion = () => {
    if (currentIdx + 1 < quizList.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setIsAnswered(false);
      setSelectedAns(null);
      setOptions(generateOptions(quizList[nextIdx], activeCharacters));
    } else {
      setQuizFinished(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="kana-dojo-view animate-fade-in">
      {/* Header */}
      <div className="journal-header">
        <div>
          <h2>あ／ア Kana Dojo</h2>
          <p className="journal-subtitle font-hand">Master Hiragana and Katakana characters</p>
        </div>
      </div>

      {/* Syllabary Selection Grid */}
      <div className="kana-controls card-cozy flex-between flex-wrap gap-4 mb-8">
        <div className="flex gap-3">
          <button 
            onClick={() => { setSyllabary('hiragana'); setMode('browse'); }} 
            className={`btn-pressable ${syllabary === 'hiragana' ? 'btn-selected' : ''}`}
          >
            Hiragana ひらがな
          </button>
          <button 
            onClick={() => { setSyllabary('katakana'); setMode('browse'); }} 
            className={`btn-pressable ${syllabary === 'katakana' ? 'btn-selected' : ''}`}
          >
            Katakana カタカナ
          </button>
        </div>

        <div className="flex gap-3">
          {['base', 'dakuon', 'yoon'].map(group => (
            <button
              key={group}
              onClick={() => { setSetGroup(group); setMode('browse'); }}
              className={`btn-pressable btn-sm ${setGroup === group ? 'btn-primary' : ''}`}
            >
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </button>
          ))}
        </div>

        <div>
          {mode === 'browse' ? (
            <button onClick={startQuiz} className="btn-pressable btn-accent">
              <Play size={16} /> Start Drill Test
            </button>
          ) : (
            <button onClick={() => setMode('browse')} className="btn-pressable">
              Exit Quiz
            </button>
          )}
        </div>
      </div>

      {/* Mode View */}
      {mode === 'browse' ? (
        <div className="kana-grid">
          {activeCharacters.map((item) => {
            const isFlipped = flippedCards[item.character];
            return (
              <div 
                key={item.character} 
                onClick={() => toggleFlip(item.character)}
                className={`card-cozy kana-card flex-center flex-col ${isFlipped ? 'card-flipped' : ''}`}
              >
                {!isFlipped ? (
                  <>
                    <span className="kana-char font-hand">{item.character}</span>
                    <span className="kana-tip font-sans">Tap to flip</span>
                  </>
                ) : (
                  <>
                    <span className="kana-romaji font-bold">{item.romaji}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); playAudio(item.character); }}
                      className="btn-audio flex-center"
                    >
                      <Volume2 size={16} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Quiz Mode */
        <div className="card-cozy quiz-container flex-center flex-col max-w-xl mx-auto">
          {!quizFinished ? (
            <>
              {/* Progress bar */}
              <div className="quiz-progress-bar w-full">
                <div className="q-progress" style={{ width: `${((currentIdx + 1) / quizList.length) * 100}%` }}></div>
              </div>
              <div className="flex-between w-full mb-6 text-sm font-semibold">
                <span>Question {currentIdx + 1} of {quizList.length}</span>
                <span>Score: {quizScore}</span>
              </div>

              {/* Character Prompt */}
              <div className="quiz-prompt flex-center flex-col my-8">
                <span className="prompt-char font-hand">{quizList[currentIdx]?.character}</span>
                <p className="prompt-label">Select the correct Romaji reading:</p>
              </div>

              {/* Options */}
              <div className="quiz-options w-full grid grid-cols-2 gap-4">
                {options.map((opt) => {
                  const isCorrect = opt.romaji === quizList[currentIdx].romaji;
                  const isSelected = selectedAns === opt.romaji;
                  let optClass = '';
                  
                  if (isAnswered) {
                    if (isCorrect) optClass = 'opt-correct';
                    else if (isSelected) optClass = 'opt-incorrect';
                    else optClass = 'opt-muted';
                  }

                  return (
                    <button
                      key={opt.romaji}
                      onClick={() => handleAnswerSelect(opt)}
                      disabled={isAnswered}
                      className={`btn-pressable quiz-opt flex-center ${optClass}`}
                    >
                      <span className="opt-val">{opt.romaji}</span>
                      {isAnswered && isCorrect && <Check size={18} className="opt-icon-check" />}
                      {isAnswered && isSelected && !isCorrect && <X size={18} className="opt-icon-x" />}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              {isAnswered && (
                <button onClick={nextQuestion} className="btn-pressable btn-accent mt-8 w-full">
                  {currentIdx + 1 === quizList.length ? 'Finish Test' : 'Next Question'}
                </button>
              )}
            </>
          ) : (
            /* Quiz Results */
            <div className="quiz-results flex-center flex-col py-6">
              <Award size={64} className="icon-award mb-4" />
              <h3 className="font-hand font-bold text-2xl mb-2">Quiz Completed!</h3>
              <p className="results-text mb-6">
                You got <strong>{quizScore} out of 10</strong> correct answers!
              </p>
              <div className="xp-earned flex-center font-hand mb-8">
                🌿 +{quizScore * 5} XP Points Earned
              </div>
              <div className="flex gap-4">
                <button onClick={startQuiz} className="btn-pressable btn-primary">
                  <RefreshCw size={16} /> Practice Again
                </button>
                <button onClick={() => setMode('browse')} className="btn-pressable">
                  Return to Study
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
