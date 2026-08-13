import React from 'react';
import DojoYard from './DojoYard';
import { 
  Flame, 
  BookOpen, 
  Pencil, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function Dashboard({ srs, setView }) {
  const { srsItems, level, unlockedItems, streak, xp } = srs;

  // Calculate reviews due
  const now = Date.now();
  const getDueCount = (type) => {
    return Object.values(srsItems).filter(item => 
      item.type === type && item.nextReview <= now
    ).length;
  };

  const dueKanji = getDueCount('kanji');
  const dueVocab = getDueCount('vocab');
  const dueGrammar = getDueCount('grammar');

  // Basic stats
  const totalItemsLearned = Object.keys(srsItems).length;

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Journal Title Bar */}
      <div className="journal-header">
        <div>
          <h2>Nihondojo Dashboard</h2>
          <p className="journal-subtitle font-hand">Your cottage-style Japanese journal</p>
        </div>
        <div className="dashboard-stats flex-center gap-4">
          <div className="stat-badge flex-center">
            <TrendingUp size={16} />
            <span>{xp} XP</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Progress & Garden */}
        <div className="dashboard-left-col flex flex-col gap-6">
          {/* Welcome Card */}
          <div className="card-cozy welcome-card">
            <h3 className="welcome-title font-hand">Welcome back, learner!</h3>
            <p className="welcome-text">
              You are currently at <strong>Level {level}</strong>. Consistent study is key! Keep your streak active by finishing daily reviews or learning new words.
            </p>
            <div className="streak-banner flex-center font-hand">
              <Flame size={24} className="icon-streak" />
              <span>You have kept a <strong>{streak.current} day</strong> streak alive! (Max: {streak.max})</span>
            </div>
          </div>

          {/* Garden Visualizer */}
          <DojoYard unlockedItems={unlockedItems} level={level} />
        </div>

        {/* Right Column: Active Drills & Reviews */}
        <div className="dashboard-right-col flex flex-col gap-6">
          {/* Daily Study Checklist */}
          <div className="card-cozy checklist-card">
            <h3 className="card-title font-hand">Daily Checklist</h3>
            <p className="card-desc">Complete reviews and practice drills due today:</p>
            
            <div className="checklist-items">
              {/* Kana Practice */}
              <div className="checklist-item flex-between">
                <div className="item-info flex-center">
                  <BookOpen size={20} className="checklist-icon c-kana" />
                  <div>
                    <strong>Kana Dojo</strong>
                    <p className="sub">Review Hiragana & Katakana</p>
                  </div>
                </div>
                <button onClick={() => setView('kana')} className="btn-pressable btn-primary btn-sm flex-center">
                  Practice <ArrowRight size={14} />
                </button>
              </div>

              {/* Kanji Review */}
              <div className="checklist-item flex-between">
                <div className="item-info flex-center">
                  <Pencil size={20} className="checklist-icon c-kanji" />
                  <div>
                    <strong>Kanji Quest</strong>
                    <p className="sub">{dueKanji} character cards due</p>
                  </div>
                </div>
                <button onClick={() => setView('kanji')} className="btn-pressable btn-accent btn-sm flex-center">
                  {dueKanji > 0 ? 'Review Due' : 'Study'} <ArrowRight size={14} />
                </button>
              </div>

              {/* Vocabulary Review */}
              <div className="checklist-item flex-between">
                <div className="item-info flex-center">
                  <Layers size={20} className="checklist-icon c-vocab" />
                  <div>
                    <strong>Vocabulary Deck</strong>
                    <p className="sub">{dueVocab} words due for review</p>
                  </div>
                </div>
                <button onClick={() => setView('vocab')} className="btn-pressable btn-sm flex-center">
                  {dueVocab > 0 ? 'Review Due' : 'Browse'} <ArrowRight size={14} />
                </button>
              </div>

              {/* Grammar Study */}
              <div className="checklist-item flex-between">
                <div className="item-info flex-center">
                  <Sparkles size={20} className="checklist-icon c-grammar" />
                  <div>
                    <strong>Grammar & Builder</strong>
                    <p className="sub">{dueGrammar} patterns due</p>
                  </div>
                </div>
                <button onClick={() => setView('grammar')} className="btn-pressable btn-sm flex-center">
                  Study Guide <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats overview */}
          <div className="card-cozy stats-card">
            <h3 className="card-title font-hand">Notebook Stats</h3>
            <div className="stats-row grid grid-cols-2 gap-4">
              <div className="stat-box">
                <span className="stat-val font-hand">{totalItemsLearned}</span>
                <span className="stat-lbl">SRS Items active</span>
              </div>
              <div className="stat-box">
                <span className="stat-val font-hand">N5</span>
                <span className="stat-lbl">Active syllabus</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
