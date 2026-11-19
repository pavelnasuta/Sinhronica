export function StickerPromo() {
  return <section className="grid gap-3" aria-labelledby="aqui-stickers-title">
    <article className="sinhronica-home-stickers-card relative min-h-64 overflow-hidden rounded-[var(--radius-xl)] border p-5 shadow-[var(--shadow-card)] sm:min-h-60 sm:p-6">
      <div className="relative z-10 grid max-w-[62%] gap-3 sm:max-w-[58%]">
        <div className="grid gap-1.5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/75">Фирменные стикеры</p>
          <h2 id="aqui-stickers-title" className="text-2xl font-extrabold leading-tight tracking-[-0.035em] text-white">Акви теперь в MAX</h2>
          <p className="text-sm font-semibold leading-5 text-white/85">Стикерпак для тренировок, чата команды и всего, что хочется сказать без слов.</p>
        </div>
        <a href="https://max.ru/stickerset/5nMnC50r-zfjveuv8tiRMN_2IaZYDdnEz4bTjJ8m2e0" target="_blank" rel="noreferrer" className="sinhronica-max-sticker-link inline-flex min-h-11 w-fit items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600" aria-label="Открыть стикерпак в MAX">
          <img src={`${import.meta.env.BASE_URL}brands/max-white.svg`} alt="" className="h-5 w-auto" />
          <span>Открыть стикерпак</span>
        </a>
      </div>
      <img src={`${import.meta.env.BASE_URL}mascots/aqui-max-stickers.png`} alt="Стикер Акви в круге для плавания" className="pointer-events-none absolute bottom-[-2.4rem] right-[-5.9rem] h-[16.5rem] w-[16.5rem] max-w-none object-contain sm:bottom-[-2.75rem] sm:right-[-1.75rem] sm:h-[19rem] sm:w-[19rem]" />
    </article>
  </section>
}
