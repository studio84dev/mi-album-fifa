import { useEffect, useState } from 'react'
import { useI18n } from './hooks/useI18n.ts'
import { useAuth } from './hooks/useAuth.ts'
import { useGlobalCollection } from './hooks/useGlobalCollection.ts'
import { useScroll } from './hooks/useScroll.ts'
import { useShare } from './hooks/useShare.ts'
import { useSearchResults } from './hooks/useSearchResults.ts'
import type { SearchResult } from './hooks/useSearchResults.ts'
import { useBanners } from './hooks/useBanners.ts'
import { useTheme } from './hooks/useTheme.ts'

import SuggestionModal from './components/SuggestionModal.tsx'
import StickerPanel from './components/StickerPanel.tsx'
import WhatsNewModal from './components/WhatsNewModal.tsx'
import { PromoBanner } from './components/PromoBanner.tsx'
import CuriosityCarousel from './components/CuriosityCarousel.tsx'
import ImportCollectionModal from './components/ImportCollectionModal.tsx'
import Header from './components/Header.tsx'
import SearchBox from './components/SearchBox.tsx'
import ResultsCount from './components/ResultsCount.tsx'
import StickerList from './components/StickerList.tsx'
import Footer from './components/Footer.tsx'
import ScrollTopButton from './components/ScrollTopButton.tsx'
import RedirectBanner from './components/RedirectBanner.tsx'
import AndroidBanner from './components/AndroidBanner.tsx'
import LoginBar from './components/LoginBar.tsx'
import SharePrompt, { STORAGE_KEY as SHARE_PROMPT_KEY } from './components/SharePrompt.tsx'
import WelcomeModal from './components/WelcomeModal.tsx'
import AboutModal from './components/AboutModal.tsx'
import ViewToggle from './components/ViewToggle.tsx'
import AllPanelsView from './components/AllPanelsView.tsx'

function App() {
  const { locale, t, toggleLocale } = useI18n()
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  useTheme()
  const { collection, totals, loading: collectionLoading, updateEntry } = useGlobalCollection(user)
  const { showScrollTop, isAtBottom, scrollToTop } = useScroll()
  const { share, shareOptions } = useShare(t)
  const {
    search,
    setSearch,
    selectedCode,
    selectCountry,
    selectStickerCard,
    clearSearch,
    searchInputRef,
    searchResults,
    activeCountry,
    matchedNumber,
    matchedSticker,
    teamsData,
    countryDetails,
    panelMatchedCountryCodes,
    panelHighlightByCountry,
  } = useSearchResults()

  const [viewMode, setViewMode] = useState<'cards' | 'panels'>('cards')
  const {
    showWhatsNew,
    setShowWhatsNew,
    whatsNewUnread,
    openWhatsNew,
    showWelcomeModal,
    dismissWelcomeModal,
    showAbout,
    setShowAbout,
    showSuggestionModal,
    setShowSuggestionModal,
    showImportModal,
    setShowImportModal,
    showRedirectBanner,
    dismissRedirectBanner,
    showAndroidBanner,
    dismissAndroidBanner,
  } = useBanners(user)

  // SEO meta tags
  useEffect(() => {
    document.documentElement.lang = locale
    document.title = t('metaTitle')
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', t('metaDescription'))
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', t('metaTitle'))
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', t('metaDescription'))
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) twitterTitle.setAttribute('content', t('metaTitle'))
    const twitterDesc = document.querySelector('meta[name="twitter:description"]')
    if (twitterDesc) twitterDesc.setAttribute('content', t('metaDescription'))
    const ogLocale = document.querySelector('meta[property="og:locale"]')
    if (ogLocale) ogLocale.setAttribute('content', locale === 'en' ? 'en_US' : 'es_ES')
  }, [locale, t])

  const [showSharePrompt, setShowSharePrompt] = useState(false)
  const { teamCollected, fwcCollected, ccCollected, paniniCollected } = totals
  const totalCollected = teamCollected + fwcCollected + ccCollected + paniniCollected

  useEffect(() => {
    if (localStorage.getItem(SHARE_PROMPT_KEY)) return
    if (user && totalCollected >= 20) setShowSharePrompt(true)
  }, [user, totalCollected])

  const handleClearSearch = () => {
    clearSearch()
    searchInputRef.current?.focus()
  }

  const handleBackSearch = () => {
    clearSearch()
    searchInputRef.current?.blur()
  }

  const handleSelectCountry = (sticker: SearchResult) => {
    if (sticker.kind === 'stickerCard') {
      selectStickerCard(sticker)
    } else {
      selectCountry(sticker.code)
    }
    scrollToTop()
  }

  return (
    <div className="max-w-[760px] mx-auto px-4 pb-12 flex flex-col items-center min-h-screen w-full">
      <div className="sticky top-0 z-[100] bg-bg-primary w-full">
        <Header
          t={t}
          user={user}
          authLoading={authLoading}
          whatsNewUnread={whatsNewUnread}
          onOpenWhatsNew={openWhatsNew}
          onSignIn={signInWithGoogle}
          onSignOut={signOut}
          onImport={() => setShowImportModal(true)}
          totals={totals}
          collectionLoading={collectionLoading}
        />

        {!user && !authLoading && <LoginBar onLogin={signInWithGoogle} t={t} />}

        <SearchBox
          search={search}
          onChange={setSearch}
          onClear={handleClearSearch}
          onBack={handleBackSearch}
          inputRef={searchInputRef}
          placeholder={t('searchPlaceholder')}
          t={t}
        />

        {!activeCountry && !search && (
          <div className="self-start mb-4 transition-[margin,opacity,max-height] duration-slow">
            <ViewToggle
              mode={viewMode}
              onChange={(mode) => {
                setViewMode(mode)
                if (mode === 'panels') {
                  selectCountry('')
                }
              }}
              cardsLabel={t('viewModeCards')}
              panelsLabel={t('viewModePanels')}
            />
          </div>
        )}
      </div>

      {showAndroidBanner && <AndroidBanner onDismiss={dismissAndroidBanner} t={t} />}
      {showRedirectBanner && <RedirectBanner onDismiss={dismissRedirectBanner} t={t} />}

      {showWelcomeModal && <WelcomeModal onClose={dismissWelcomeModal} t={t} />}

      {showSharePrompt && (
        <SharePrompt t={t} share={share} onDismiss={() => setShowSharePrompt(false)} />
      )}

      {showAbout && (
        <AboutModal
          onClose={() => setShowAbout(false)}
          t={t}
          share={share}
          shareOptions={shareOptions}
        />
      )}

      {showSuggestionModal && <SuggestionModal onClose={() => setShowSuggestionModal(false)} />}

      {showWhatsNew && (
        <WhatsNewModal onClose={() => setShowWhatsNew(false)} t={t} locale={locale} />
      )}

      {showImportModal && (
        <ImportCollectionModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => window.location.reload()}
          t={t}
        />
      )}

      {!activeCountry && viewMode === 'cards' && (
        <>
          {search && <ResultsCount count={searchResults.length} t={t} />}
          <StickerList
            results={searchResults}
            onSelect={handleSelectCountry}
            collection={collection}
            selectedCode={selectedCode}
            t={t}
          />
        </>
      )}

      {!activeCountry && viewMode === 'panels' && (
        <AllPanelsView
          allCountries={teamsData}
          countryDetails={countryDetails}
          collection={collection}
          user={user}
          updateEntry={updateEntry}
          searchQuery={search}
          matchedCountryCodes={panelMatchedCountryCodes}
          highlightByCountry={panelHighlightByCountry}
          t={t}
        />
      )}

      {activeCountry && user && (
        <StickerPanel
          countryCode={activeCountry.code}
          user={user}
          stickerCount={activeCountry.count ?? 20}
          page={activeCountry.page ?? null}
          initialData={collection[activeCountry.code] ?? {}}
          onCollectionChange={updateEntry}
          onInteract={selectCountry}
          highlightNumber={matchedNumber}
          matchedSticker={matchedSticker}
          t={t}
        />
      )}

      {activeCountry && !user && !authLoading && (
        <PromoBanner
          icon="🏆"
          title={t('promoBannerCountryTitle')}
          body={t('promoBannerCountryBody')
            .replace('{count}', String(activeCountry.count ?? 20))
            .replace('{country}', activeCountry.team_name ?? activeCountry.description)}
          onLogin={signInWithGoogle}
          className="promo-banner--country"
        />
      )}

      {activeCountry && <CuriosityCarousel countryCode={activeCountry.code} locale={locale} />}

      <Footer
        t={t}
        locale={locale}
        toggleLocale={toggleLocale}
        onShowAbout={() => setShowAbout(true)}
        onShowSuggestion={() => setShowSuggestionModal(true)}
        share={share}
        shareOptions={shareOptions}
        user={user}
        totalCollected={totalCollected}
      />

      <ScrollTopButton show={showScrollTop} isRaised={isAtBottom} onClick={scrollToTop} t={t} />
    </div>
  )
}

export default App
