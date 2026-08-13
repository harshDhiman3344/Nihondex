import React from 'react';
import { 
  Home, 
  BookOpen, 
  Pencil, 
  Layers, 
  Sparkles, 
  Flame 
} from 'lucide-react';

export default function Sidebar({ currentView, setView, srs, activeTheme, setTheme }) {
  const { xp, level, streak } = srs;
  
  // Calculate progress to next level
  const xpInCurrentLevel = xp % 300;
  const xpPercentage = (xpInCurrentLevel / 300) * 100;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, subtitle: 'ダッシュボード' },
    { id: 'kana', label: 'Kana Dojo', icon: BookOpen, subtitle: 'かな道場' },
    { id: 'kanji', label: 'Kanji Quest', icon: Pencil, subtitle: '漢字クエスト' },
    { id: 'vocab', label: 'Vocabulary', icon: Layers, subtitle: '単語' },
    { id: 'grammar', label: 'Grammar Guide', icon: Sparkles, subtitle: '文法' },
  ];

  return (
    <aside className="nd-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <h1 className="brand-title">Nihondojo</h1>
        <p className="brand-sub font-hand">にほんどじょう</p>
      </div>

      {/* User Progress Widget */}
      <div className="sidebar-profile">
        <div className="profile-row flex-between">
          <span className="profile-label font-hand font-bold">Level {level}</span>
          <span className="profile-streak flex-center font-bold">
            <Flame size={18} className="icon-streak" />
            {streak.current} Days
          </span>
        </div>
        <div className="xp-bar-container">
          <div className="xp-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
        </div>
        <div className="xp-subtext flex-between">
          <span>{xpInCurrentLevel}/300 XP</span>
          <span>Total: {xp} XP</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`nav-item flex-between ${isActive ? 'nav-active' : ''}`}
            >
              <div className="nav-item-left">
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </div>
              <span className="nav-subtitle font-hand">{item.subtitle}</span>
            </button>
          );
        })}
      </nav>

      {/* Cozy Theme Selector Widget */}
      <div className="sidebar-theme-selector">
        <span className="theme-label font-sans">Theme / テーマ</span>
        <div className="theme-dots">
          <button 
            onClick={() => setTheme('sage')}
            className={`theme-dot dot-sage ${activeTheme === 'sage' ? 'active' : ''}`}
            title="Sage Garden"
          />
          <button 
            onClick={() => setTheme('aesthetic')}
            className={`theme-dot dot-aesthetic ${activeTheme === 'aesthetic' ? 'active' : ''}`}
            title="Aesthetic Arch / Tokyo Night"
          />
          <button 
            onClick={() => setTheme('sakura')}
            className={`theme-dot dot-sakura ${activeTheme === 'sakura' ? 'active' : ''}`}
            title="Sakura Blossom"
          />
          <button 
            onClick={() => setTheme('cocoa')}
            className={`theme-dot dot-cocoa ${activeTheme === 'cocoa' ? 'active' : ''}`}
            title="Warm Cocoa"
          />
        </div>
      </div>

      {/* Cute cottagecore footer */}
      <div className="sidebar-footer">
        <p>Study hard, grow steady</p>
        <span>Nihondojo v1.0.0 (N5)</span>
      </div>
    </aside>
  );
}
