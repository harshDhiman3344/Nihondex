import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanaDojo from './components/KanaDojo';
import KanjiQuest from './components/KanjiQuest';
import Vocabulary from './components/Vocabulary';
import GrammarGuide from './components/GrammarGuide';
import { useSRS } from './hooks/useSRS';
import './App.css';

export default function App() {
  const [view, setView] = useState('dashboard'); // dashboard | kana | kanji | vocab | grammar
  const srs = useSRS();

  return (
    <div id="root">
      {/* Sidebar Navigation Panel */}
      <Sidebar currentView={view} setView={setView} srs={srs} />

      {/* Main Journal Workspace Area */}
      <main className="nd-main">
        {view === 'dashboard' && <Dashboard srs={srs} setView={setView} />}
        {view === 'kana' && <KanaDojo srs={srs} />}
        {view === 'kanji' && <KanjiQuest srs={srs} />}
        {view === 'vocab' && <Vocabulary srs={srs} />}
        {view === 'grammar' && <GrammarGuide srs={srs} />}
      </main>
    </div>
  );
}
