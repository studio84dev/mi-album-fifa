interface Album { id: string; name: string; description: string | null }
interface AlbumSelectorProps { albums: Album[]; activeAlbumId: string; onChange: (id: string) => void; onCreate: (name: string) => Promise<void>; t: (key: string) => string }
export default function AlbumSelector({ albums, activeAlbumId, onChange, onCreate, t }: AlbumSelectorProps) {
  const create = async () => { const name = window.prompt(t('albumsNewPrompt')); if (name) await onCreate(name) }
  return <section className="w-full mb-4 rounded-xl border border-border bg-bg-secondary p-3">
    <div className="flex items-center justify-between gap-2 mb-2"><h2 className="font-semibold">{t('albumsTitle')}</h2><button type="button" onClick={() => void create()} className="text-sm underline">{t('albumsNew')}</button></div>
    <select className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2" value={activeAlbumId} onChange={(e) => onChange(e.target.value)} aria-label={t('albumsSelect')}>
      {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
    </select>
  </section>
}
