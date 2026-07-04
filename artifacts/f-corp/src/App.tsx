import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

import SplashScreen from './screens/SplashScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import LeagueSelectionScreen from './screens/LeagueSelectionScreen';
import ClubCreationScreen from './screens/ClubCreationScreen';
import MainGame from './screens/MainGame';
import { initTelegram, getTelegramWebApp, getTelegramUserName } from './lib/telegram';
import { isOnboardingComplete, getUser, getLeagueCountry } from './lib/storage';

export type AppState = 'splash' | 'registration' | 'league' | 'club' | 'game';

// Screens where the TG back button should be visible
const BACK_BUTTON_SCREENS: AppState[] = ['league', 'club'];

// Map of which screen to go back to
const BACK_MAP: Partial<Record<AppState, AppState>> = {
  league: 'registration',
  club: 'league',
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppState>('splash');

  // Initialize Telegram Mini App SDK on first mount
  useEffect(() => {
    initTelegram();
  }, []);

  // Auto-advance from splash — resume from last valid completed step
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOnboardingComplete()) {
        setCurrentScreen('game');
      } else if (getLeagueCountry() !== null) {
        // Valid league chosen but club not yet created
        setCurrentScreen('club');
      } else if (getUser() !== null) {
        // Valid user registered but league not yet chosen
        setCurrentScreen('league');
      } else {
        setCurrentScreen('registration');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Manage Telegram Back Button visibility & handler
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return;

    const shouldShow = BACK_BUTTON_SCREENS.includes(currentScreen);

    if (shouldShow) {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }

    const handleBack = () => {
      const prev = BACK_MAP[currentScreen];
      if (prev) setCurrentScreen(prev);
    };

    tg.BackButton.onClick(handleBack);
    return () => {
      tg.BackButton.offClick(handleBack);
    };
  }, [currentScreen]);

  const handleNext = useCallback((nextScreen: AppState) => {
    setCurrentScreen(nextScreen);
  }, []);

  // Pre-fill name from Telegram user profile if available
  const tgName = getTelegramUserName();

  return (
    <div
      className="w-full bg-background text-foreground flex justify-center font-sans"
      style={{ minHeight: '100dvh' }}
    >
      <div
        className="w-full max-w-[430px] relative bg-card shadow-2xl overflow-hidden flex flex-col"
        style={{
          minHeight: '100dvh',
          // Respect Telegram safe areas (notch, home indicator)
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <AnimatePresence mode="wait">
          {currentScreen === 'splash' && (
            <SplashScreen key="splash" />
          )}
          {currentScreen === 'registration' && (
            <RegistrationScreen
              key="registration"
              onNext={() => handleNext('league')}
              defaultName={tgName ?? undefined}
            />
          )}
          {currentScreen === 'league' && (
            <LeagueSelectionScreen
              key="league"
              onNext={() => handleNext('club')}
            />
          )}
          {currentScreen === 'club' && (
            <ClubCreationScreen
              key="club"
              onNext={() => handleNext('game')}
            />
          )}
          {currentScreen === 'game' && (
            <MainGame key="game" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
