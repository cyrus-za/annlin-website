export default function NotFound() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-amber-700">
          Bladsy nie gevind nie
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
          Ons kon nie daardie bladsy kry nie
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
          Die skakel is moontlik oud, of die inhoud is na ’n ander plek geskuif. Gebruik een van die
          skakels hieronder om terug te kom by die hoofinhoud van die webwerf.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-amber-700 px-6 text-sm font-medium text-white transition-colors hover:bg-amber-800"
          >
            Gaan na tuisblad
          </a>
          <a
            href="/diensgroepe"
            className="inline-flex h-11 items-center justify-center rounded-md border border-stone-200 bg-white px-6 text-sm font-medium text-foreground transition-colors hover:bg-stone-50"
          >
            Bekyk diensgroepe
          </a>
          <a
            href="/kontakbesonderhede"
            className="inline-flex h-11 items-center justify-center rounded-md border border-stone-200 bg-white px-6 text-sm font-medium text-foreground transition-colors hover:bg-stone-50"
          >
            Kontak kerkkantoor
          </a>
        </div>
      </section>
    </main>
  )
}
