import React, { useState } from 'react';
import { BarberProvider } from './context/BarberContext';
import { MusicProvider, useMusic } from './context/MusicContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StoriesBar } from './components/StoriesBar';
import { BookingSection } from './components/BookingSection';
import { GallerySection } from './components/GallerySection';
import { ReviewsSection } from './components/ReviewsSection';
import { GpsLocationSection } from './components/GpsLocationSection';
import { Footer } from './components/Footer';
import { AdminModal } from './components/AdminPanel/AdminModal';
import { ClientHistoryModal } from './components/ClientHistoryModal';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { BarberMusicPlayer } from './components/BarberMusicPlayer';
import { ExitToast } from './components/ExitToast';
import { useAppBackNavigation } from './hooks/useAppBackNavigation';

const BarberApp: React.FC = () => {
  const { isPlayerOpen, setIsPlayerOpen } = useMusic();

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string>('appointments');
  const [isClientHistoryOpen, setIsClientHistoryOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [preselectedBarberId, setPreselectedBarberId] = useState<string | undefined>(undefined);

  // Hook to handle hardware/browser Back button and navigate to previous screen without exiting to desktop
  const { showExitToast } = useAppBackNavigation({
    activeStoryIndex,
    setActiveStoryIndex,
    isAdminOpen,
    setIsAdminOpen,
    isClientHistoryOpen,
    setIsClientHistoryOpen,
    isPlayerOpen,
    setIsPlayerOpen,
    bookingStep,
    setBookingStep
  });

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenBooking = (barberId?: string) => {
    if (barberId) {
      setPreselectedBarberId(barberId);
    }
    handleScrollToSection('turnos');
  };

  const handleOpenAdminWithTab = (tab: string) => {
    setAdminInitialTab(tab);
    setIsAdminOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-['Plus_Jakarta_Sans']">
      {/* Toast alert preventing accidental exit to desktop on back button press */}
      <ExitToast show={showExitToast} />

      {/* Push Notification Floating Alerts */}
      <PushNotificationBanner />

      {/* Main Navigation Header */}
      <Header
        onOpenBooking={() => handleOpenBooking()}
        onOpenClientHistory={() => setIsClientHistoryOpen(true)}
        onOpenAdmin={() => handleOpenAdminWithTab('appointments')}
        onScrollToSection={handleScrollToSection}
      />

      <main className="flex-1">
        {/* Top Stories & Estados Bar (Facebook / Instagram Style) */}
        <StoriesBar
          onOpenAdminStories={() => handleOpenAdminWithTab('stories')}
          onSelectStoryForBooking={() => handleOpenBooking()}
          activeStoryIndex={activeStoryIndex}
          onOpenStory={setActiveStoryIndex}
          onCloseStory={() => setActiveStoryIndex(null)}
        />

        {/* Hero Section */}
        <HeroSection
          onOpenBooking={handleOpenBooking}
          onScrollToSection={handleScrollToSection}
        />

        {/* Real-time Conditional Appointment Booking Engine */}
        <div id="turnos" className="scroll-mt-14">
          <BookingSection
            preselectedBarberId={preselectedBarberId}
            currentStep={bookingStep}
            onStepChange={setBookingStep}
            onBookingSuccess={() => {
              // Could trigger client history or confetti
            }}
          />
        </div>

        {/* Filterable Work Gallery (Photos and Short Videos) */}
        <GallerySection
          onSelectCutForBooking={(barberId) => handleOpenBooking(barberId)}
          onOpenAdminGallery={() => handleOpenAdminWithTab('gallery')}
        />

        {/* Verified Reviews and Testimonials */}
        <ReviewsSection
          onOpenAdminReviews={() => handleOpenAdminWithTab('reviews')}
        />

        {/* GPS Location, Local SEO & Interactive Map */}
        <GpsLocationSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => handleOpenAdminWithTab('shop')}
        onOpenHistory={() => setIsClientHistoryOpen(true)}
      />

      {/* Floating Barber Music Lounge Instrumental Player */}
      <BarberMusicPlayer />

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        initialTab={adminInitialTab}
      />

      {/* Client History & Appointments Lookup Modal */}
      {isClientHistoryOpen && (
        <ClientHistoryModal
          onClose={() => setIsClientHistoryOpen(false)}
          onOpenReviewForAppointment={() => {
            handleScrollToSection('resenas');
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <BarberProvider>
      <MusicProvider>
        <BarberApp />
      </MusicProvider>
    </BarberProvider>
  );
}
