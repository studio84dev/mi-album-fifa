import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import {
  AppPromoDemo,
  PROMO_DURATION,
  PROMO_FPS,
  PROMO_WIDTH,
  PROMO_HEIGHT,
  type AppPromoDemoProps,
} from './AppPromoDemo.tsx'

const motionQuery = '(prefers-reduced-motion: reduce)'
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(motionQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
const getReducedMotion = () => window.matchMedia(motionQuery).matches

function AppPromoPreview({ t }: AppPromoDemoProps) {
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion)
  const [userPaused, setUserPaused] = useState<boolean | null>(null)
  const paused = userPaused ?? reducedMotion
  const playerRef = useRef<PlayerRef>(null)

  useEffect(() => {
    if (paused) playerRef.current?.pause()
    else playerRef.current?.play()
  }, [paused])

  return (
    <>
      <div aria-hidden="true" className="app-promo-player">
        <Player
          ref={playerRef}
          component={AppPromoDemo}
          inputProps={{ t }}
          durationInFrames={PROMO_DURATION}
          compositionWidth={PROMO_WIDTH}
          compositionHeight={PROMO_HEIGHT}
          fps={PROMO_FPS}
          loop
          autoPlay={!paused}
          initialFrame={0}
          initiallyMuted
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          style={{ width: '100%', pointerEvents: 'none' }}
        />
      </div>
      <button className="app-promo-playback" onClick={() => setUserPaused(!paused)}>
        <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
        {t(paused ? 'appPromoPlay' : 'appPromoPause')}
      </button>
    </>
  )
}

export default AppPromoPreview
