import type { ReactNode } from 'react'
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from 'remotion'
import { PromoIcon } from './PromoIcon.tsx'

export interface AppPromoDemoProps {
  t: (_key: string) => string
}
interface SceneProps extends AppPromoDemoProps {
  frame: number
}
interface LayerProps {
  frame: number
  from: number
  to: number
  children: ReactNode
}
interface TouchProps {
  frame: number
  at: number
}
interface DemoButtonProps extends TouchProps {
  children: ReactNode
  secondary?: boolean
}

export const PROMO_FPS = 30
export const PROMO_DURATION = 600
export const PROMO_WIDTH = 400
export const PROMO_HEIGHT = 790
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const smooth = { ...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1) }
const tradeSections = [
  { key: 'exchangeTheyCanGive', codes: ['MEX 4', 'MEX 7', 'RSA 12'], at: 209 },
  { key: 'exchangeICanGive', codes: ['MEX 2', 'MEX 10', 'RSA 7'], at: 263 },
]

// Decorative QR artwork, independent of any user's collection.
const qrCells = (() => {
  let seed = 92731
  const cells: string[] = []
  for (let y = 0; y < 29; y++) {
    for (let x = 0; x < 29; x++) {
      seed ^= seed << 13
      seed ^= seed >>> 17
      seed ^= seed << 5
      if ((x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20)) continue
      const on = x === 6 || y === 6 ? (x + y) % 2 === 0 : (seed >>> 0) % 2 === 0
      if (on) cells.push(`M${x + 3} ${y + 3}h1v1h-1z`)
    }
  }
  return cells.join('')
})()

function DemoQr() {
  return (
    <svg
      className="promo-demo-qr"
      viewBox="0 0 35 35"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <rect width="35" height="35" rx="1.5" fill="white" />
      <path d={qrCells} fill="#15253f" />
      {[
        [3, 3],
        [25, 3],
        [3, 25],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="7" height="7" rx="0.6" fill="#15253f" />
          <rect x={x + 1} y={y + 1} width="5" height="5" rx="0.25" fill="white" />
          <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.25" fill="#15253f" />
        </g>
      ))}
    </svg>
  )
}

function Touch({ frame, at }: TouchProps) {
  return (
    <span
      className="promo-demo-touch"
      style={{
        opacity: interpolate(frame, [at - 10, at - 3, at + 10, at + 23], [0, 1, 1, 0], clamp),
      }}
    >
      <span
        style={{
          scale: interpolate(frame, [at - 10, at, at + 23], [1.4, 0.75, 1.7], clamp),
          opacity: interpolate(frame, [at, at + 23], [0.9, 0], clamp),
        }}
      />
      <i style={{ scale: interpolate(frame, [at - 10, at, at + 12], [1.2, 0.8, 1], clamp) }} />
    </span>
  )
}

function DemoButton({ frame, at, secondary, children }: DemoButtonProps) {
  return (
    <div
      className={`promo-demo-button${secondary ? ' is-secondary' : ''}`}
      style={{ scale: interpolate(frame, [at - 4, at, at + 9], [1, 0.975, 1], clamp) }}
    >
      {children}
      <Touch frame={frame} at={at} />
    </div>
  )
}

function Layer({ frame, from, to, children }: LayerProps) {
  if (frame < from || frame > to) return null
  return (
    <div
      className="promo-demo-layer"
      style={{
        translate: `${interpolate(frame, [from, from + 18, to - 14, to], [from === 0 ? 0 : 340, 0, 0, to === PROMO_DURATION ? 0 : -24], smooth)}px 0`,
      }}
    >
      {children}
    </div>
  )
}

function ShareScene({ t, frame }: SceneProps) {
  return (
    <div className="promo-demo-share">
      <div className="promo-demo-album-tag">
        <PromoIcon name="album" size={15} />
        {t('albumsDefaultName')}
      </div>
      <h3>{t('appPromoDemoLead')}</h3>
      <div className="promo-demo-share-card">
        <div className="promo-demo-card-label">
          <span>
            <PromoIcon name="qr" size={19} />
          </span>
          <strong>{t('exchangeMyQrTitle')}</strong>
        </div>
        <DemoQr />
        <p>{t('exchangeMyQrSubtitle')}</p>
      </div>
      <DemoButton frame={frame} at={62}>
        <PromoIcon name="scan" size={21} />
        {t('exchangeScanBtn')}
        <PromoIcon name="arrow" size={18} />
      </DemoButton>
    </div>
  )
}

function ScanScene({ t, frame }: SceneProps) {
  const locked = frame >= 143
  return (
    <div className="promo-demo-scanner">
      <div className="promo-demo-scan-pill">
        <PromoIcon name="scan" size={17} />
        {t('exchangeScanBtn')}
      </div>
      <div className="promo-demo-viewfinder">
        <div
          className="promo-demo-camera-card"
          style={{
            rotate: `${interpolate(frame, [80, 135], [-7, 0], smooth)}deg`,
            scale: interpolate(frame, [80, 135], [0.86, 1], smooth),
            filter: `blur(${interpolate(frame, [80, 132], [2, 0], smooth)}px)`,
          }}
        >
          <DemoQr />
        </div>
        {[0, 1, 2, 3].map((corner) => (
          <span
            key={corner}
            className={`promo-demo-corner corner-${corner}${locked ? ' is-locked' : ''}`}
          />
        ))}
        <div
          className="promo-demo-scan-line"
          style={{
            top: interpolate(frame, [94, 142], [12, 204], clamp),
            opacity: interpolate(frame, [90, 100, 139, 146], [0, 1, 1, 0], clamp),
          }}
        />
      </div>
      <p>{t('exchangeScanning')}</p>
      <div
        className="promo-demo-scan-result"
        style={{
          opacity: interpolate(frame, [143, 154], [0, 1], clamp),
          translate: `0 ${interpolate(frame, [143, 154], [8, 0], smooth)}px`,
        }}
      >
        <PromoIcon name="check" size={18} />
        {t('appPromoDemoConnected')}
      </div>
    </div>
  )
}

function MatchScene({ t, frame }: SceneProps) {
  const ready = frame >= 263
  return (
    <div className="promo-demo-matches">
      <div className="promo-demo-match-heading">
        <span>
          <PromoIcon name="swap" size={22} />
        </span>
        <div>
          <strong>{t('appPromoDemoMatch')}</strong>
          <small>{t('appPromoDemoChoose')}</small>
        </div>
      </div>
      {tradeSections.map(({ key, codes, at }, index) => {
        const selected = frame >= at
        return (
          <div className={`promo-demo-trade-card${index === 1 ? ' is-giving' : ''}`} key={key}>
            <div className="promo-demo-trade-title">
              <strong>{t(key)}</strong>
              <span>{selected ? 3 : 0}/3</span>
            </div>
            <div className="promo-demo-chips">
              {codes.map((code, i) => (
                <div
                  key={code}
                  className={selected ? 'is-selected' : ''}
                  style={{
                    scale: selected
                      ? 1 +
                        Math.sin(Math.min(1, Math.max(0, frame - at - i * 3) / 12) * Math.PI) *
                          0.055
                      : 1,
                  }}
                >
                  <span>{code}</span>
                  <span className="promo-demo-chip-check">
                    {selected && <PromoIcon name="check" size={12} />}
                  </span>
                </div>
              ))}
            </div>
            <div className="promo-demo-select-all">
              {t(selected ? 'exchangeDeselectAll' : 'exchangeSelectAll')}
              <Touch frame={frame} at={at} />
            </div>
          </div>
        )
      })}
      <div className="promo-demo-trade-summary">
        <span>
          {t('exchangeHistoryGive')} <b>{ready ? 3 : 0}</b>
        </span>
        <PromoIcon name="swap" size={20} />
        <span>
          {t('exchangeHistoryReceive')} <b>{frame >= 209 ? 3 : 0}</b>
        </span>
      </div>
      <div style={{ opacity: ready ? 1 : 0.4 }}>
        <DemoButton frame={frame} at={310}>
          {t('exchangeConfirmBtn')}
          <PromoIcon name="arrow" size={18} />
        </DemoButton>
      </div>
    </div>
  )
}

function ConfirmScene({ t, frame }: SceneProps) {
  const finalizing = frame >= 391
  return (
    <div className="promo-demo-confirmation">
      <div
        className="promo-demo-confirm-qr"
        style={{ opacity: interpolate(frame, [387, 402], [1, 0.13], clamp) }}
      >
        <h3>{t('appPromoDemoTradeReady')}</h3>
        <div className="promo-demo-confirm-card">
          <DemoQr />
          <div className="promo-demo-qr-summary">
            <span>
              {t('exchangeHistoryGive')} <b>3</b>
            </span>
            <PromoIcon name="swap" size={20} />
            <span>
              {t('exchangeHistoryReceive')} <b>3</b>
            </span>
          </div>
        </div>
        <p>{t('exchangeTradeQrSubtitle')}</p>
        <DemoButton frame={frame} at={382}>
          {t('exchangeTradeContinue')}
          <PromoIcon name="arrow" size={18} />
        </DemoButton>
      </div>
      {finalizing && (
        <div
          className="promo-demo-finalize"
          style={{
            opacity: interpolate(frame, [391, 402], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [391, 410], [28, 0], smooth)}px`,
          }}
        >
          <span className="promo-demo-finalize-icon">
            <PromoIcon name="swap" size={26} />
          </span>
          <h3>{t('exchangeFinalizeTitle')}</h3>
          <p>{t('exchangeFinalizeDesc')}</p>
          <DemoButton frame={frame} at={423}>
            {t('exchangeFinalizeBtn')}
            <PromoIcon name="check" size={19} />
          </DemoButton>
        </div>
      )}
    </div>
  )
}

function HistoryScene({ t, frame }: SceneProps) {
  const history = frame >= 490
  const progress = spring({
    frame: Math.max(0, frame - 440),
    fps: PROMO_FPS,
    config: { damping: 16, stiffness: 125 },
  })
  return (
    <div className="promo-demo-history-scene">
      <div
        className="promo-demo-completed"
        style={{
          opacity: interpolate(frame, [482, 496], [1, 0], clamp),
          translate: `0 ${interpolate(frame, [482, 496], [0, -12], smooth)}px`,
        }}
      >
        <div className="promo-demo-success-mark" style={{ scale: progress }}>
          <PromoIcon name="check" size={42} />
        </div>
        <h3>{t('exchangeSuccessTitle')}</h3>
        <p>{t('appPromoDemoUpdated')}</p>
        <div className="promo-demo-receipt">
          <span>
            {t('exchangeHistoryGive')}
            <b>3</b>
          </span>
          <PromoIcon name="swap" size={24} />
          <span>
            {t('exchangeHistoryReceive')}
            <b>3</b>
          </span>
        </div>
        <DemoButton frame={frame} at={481} secondary>
          <PromoIcon name="history" size={19} />
          {t('exchangeHistoryLink')}
        </DemoButton>
      </div>
      {history && (
        <div
          className="promo-demo-history"
          style={{
            opacity: interpolate(frame, [490, 504], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [490, 510], [18, 0], smooth)}px`,
          }}
        >
          <div className="promo-demo-history-heading">
            <span>
              <PromoIcon name="history" size={22} />
            </span>
            <h3>{t('exchangeHistoryTitle')}</h3>
          </div>
          <div className="promo-demo-history-card">
            <DemoQr />
            <div className="promo-demo-history-detail">
              {tradeSections.map(({ key, codes }, index) => (
                <div key={key}>
                  <span className={index === 1 ? 'is-giving' : ''}>
                    {t(index === 0 ? 'exchangeHistoryReceive' : 'exchangeHistoryGive')}
                  </span>
                  <strong>{codes.join(' · ')}</strong>
                </div>
              ))}
            </div>
          </div>
          <p>{t('appPromoDemoHistoryHint')}</p>
        </div>
      )}
    </div>
  )
}

export function AppPromoDemo({ t }: AppPromoDemoProps) {
  const frame = useCurrentFrame()
  const step = frame < 174 || frame >= 564 ? 0 : frame < 330 ? 1 : 2
  const captions = ['appPromoStepScan', 'appPromoStepMatch', 'appPromoStepDone']
  return (
    <AbsoluteFill className="promo-demo">
      <div className="promo-demo-halo" />
      <div className="promo-demo-phone">
        <div className="promo-demo-camera" />
        <div className="promo-demo-status">
          <span>9:41</span>
          <div>
            <PromoIcon name="signal" size={13} />
            <PromoIcon name="wifi" size={13} />
            <PromoIcon name="battery" size={19} />
          </div>
        </div>
        <div className="promo-demo-app-header">
          <span className="promo-demo-brand-mark">
            <PromoIcon name="swap" size={20} />
          </span>
          <strong>{t('exchangeTabTitle')}</strong>
          <span className="promo-demo-header-dot" />
        </div>
        <div className="promo-demo-screen">
          <Layer frame={frame} from={0} to={94}>
            <ShareScene t={t} frame={frame} />
          </Layer>
          <Layer frame={frame} from={78} to={188}>
            <ScanScene t={t} frame={frame} />
          </Layer>
          <Layer frame={frame} from={172} to={346}>
            <MatchScene t={t} frame={frame} />
          </Layer>
          <Layer frame={frame} from={330} to={452}>
            <ConfirmScene t={t} frame={frame} />
          </Layer>
          <Layer frame={frame} from={436} to={580}>
            <HistoryScene t={t} frame={frame} />
          </Layer>
          <Layer frame={frame} from={564} to={PROMO_DURATION}>
            <ShareScene t={t} frame={0} />
          </Layer>
        </div>
        <div className="promo-demo-tabs">
          <div>
            <PromoIcon name="album" size={23} />
            <span>{t('exchangeHomeTabTitle')}</span>
          </div>
          <div className="is-active">
            <PromoIcon name="swap" size={23} />
            <span>{t('exchangeTabTitle')}</span>
          </div>
        </div>
        <div className="promo-demo-home" />
      </div>
      <div
        className="promo-demo-caption"
        style={{
          opacity: interpolate(
            frame,
            [0, 162, 174, 186, 318, 330, 342, 552, 564, 576, 600],
            [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
            clamp
          ),
        }}
      >
        <span className="promo-demo-step-number">0{step + 1}</span>
        <strong>{t(captions[step])}</strong>
      </div>
      <div className="promo-demo-progress">
        {[0, 1, 2].map((index) => (
          <span key={index} className={step === index ? 'is-active' : ''} />
        ))}
      </div>
    </AbsoluteFill>
  )
}
