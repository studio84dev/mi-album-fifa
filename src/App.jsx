import { useEffect, useState } from 'react'
import { useI18n } from './hooks/useI18n.js'
import { useAuth } from './hooks/useAuth.js'
import { useGlobalCollection } from './hooks/useGlobalCollection.js'
import { useScroll } from './hooks/useScroll.js'
import { useShare } from './hooks/useShare.js'
import { useSearchResults } from './hooks/useSearchResults.js'
import { useBanners } from './hooks/useBanners.js'
import { useTheme } from './hooks/useTheme.js'

import SuggestionModal from './components/SuggestionModal.jsx'
import StickerPanel from './components/StickerPanel.jsx'
import WhatsNewModal from './components/WhatsNewModal.jsx'
import { PromoBanner } from './components/PromoBanner.jsx'
import CuriosityCarousel from './components/CuriosityCarousel.jsx'
import ImportCollectionModal from './components/ImportCollectionModal.jsx'
import Header from './components/Header.jsx'
import SearchBox from './components/SearchBox.jsx'
import ResultsCount from './components/ResultsCount.jsx'
import StickerList from './components/StickerList.jsx'
import Footer from './components/Footer.jsx'
import ScrollTopButton from './components/ScrollTopButton.jsx'
import RedirectBanner from './components/RedirectBanner.jsx'
import LoginBar from './components/LoginBar.jsx'
import SharePrompt, { STORAGE_KEY as SHARE_PROMPT_KEY } from './components/SharePrompt.jsx'
import WelcomeModal from './components/WelcomeModal.jsx'
import AboutModal from './components/AboutModal.jsx'
import CommunityStats from './components/CommunityStats.jsx'

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
    searchFocused,
    setSearchFocused,
    searchInputRef,
    searchResults,
    activeCountry,
    matchedNumber,
    matchedSticker,
  } = useSearchResults()
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

  const handleSelectCountry = (sticker) => {
    if (sticker.kind === 'stickerCard') {
      selectStickerCard(sticker)
    } else if (sticker.matchedSticker) {
      selectStickerCard(sticker.matchedSticker)
    } else {
      selectCountry(sticker.code)
    }
    scrollToTop()
  }

  return (
    <div className="container">
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

      {showRedirectBanner && <RedirectBanner onDismiss={dismissRedirectBanner} t={t} />}

      {!user && !authLoading && <LoginBar onLogin={signInWithGoogle} t={t} />}

      {showWelcomeModal && <WelcomeModal onClose={dismissWelcomeModal} t={t} />}

      <header className={searchFocused ? 'search-focus-mode' : ''}>
        <h1>
          <span>⚽</span> {t('title')}
        </h1>
        <p>{t('description')}</p>
        <CommunityStats t={t} />
      </header>

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

      <SearchBox
        search={search}
        onChange={setSearch}
        onClear={handleClearSearch}
        onBack={handleBackSearch}
        inputRef={searchInputRef}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
        placeholder={t('searchPlaceholder')}
        t={t}
      />

      {!activeCountry && search && <ResultsCount count={searchResults.length} t={t} />}

      {!activeCountry && (
        <StickerList
          results={searchResults}
          onSelect={handleSelectCountry}
          collection={collection}
          selectedCode={selectedCode}
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
            .replace('{count}', activeCountry.count ?? 20)
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
