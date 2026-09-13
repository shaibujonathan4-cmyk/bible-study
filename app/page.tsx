export default function Home() {
  const voices = [
    { name: "Moses", hook: "Led a people out of slavery through the sea." },
    { name: "Elijah", hook: "Called down fire on Mount Carmel." },
    { name: "Deborah", hook: "Judged Israel and led it into battle." },
    { name: "Isaiah", hook: "Saw the throne of God and spoke of a coming king." },
    { name: "Mary", hook: "Carried the Messiah and treasured it all in her heart." },
    { name: "Peter", hook: "Walked on water, and later denied he ever knew him." },
    { name: "Paul", hook: "Persecuted the church, then gave his life to it." },
  ];

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-light/40 via-white to-white" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-[family-name:var(--font-headline)] text-5xl md:text-6xl font-semibold text-[#1a1a1a] leading-tight">
              Their words never stopped speaking.
            </h1>
            <p className="mt-6 text-lg text-[#444] max-w-md">
              Ask Moses about the wilderness. Ask Elijah about the fire on Carmel.
              Ask Peter what it felt like to walk on water. A living conversation
              with the whole of scripture, grounded in their own story.
            </p>
            <div className="mt-8 flex gap-4 items-center">
              <a
                href="/chat"
                className="bg-crimson text-white px-7 py-3 rounded-md font-medium hover:opacity-90 transition"
              >
                Start a conversation
              </a>
              <a href="#voices" className="text-[#1a1a1a] underline underline-offset-4">
                See who you can talk to
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-sky-light">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              <rect width="400" height="300" fill="#EAF6FF" />
              <circle cx="200" cy="170" r="70" fill="#D4AF37" opacity="0.9" />
              <path d="M0 210 L120 130 L200 195 L260 145 L400 220 L400 300 L0 300 Z" fill="#4FA8E0" opacity="0.35" />
              <path d="M0 240 L150 175 L230 225 L320 180 L400 250 L400 300 L0 300 Z" fill="#4FA8E0" opacity="0.55" />
            </svg>
          </div>
        </div>
      </section>

      <section id="voices" className="max-w-6xl mx-auto px-6 py-20" style={{ perspective: "1200px" }}>
        <h2 className="font-[family-name:var(--font-headline)] text-3xl font-semibold text-[#1a1a1a]">
          Some voices to start with
        </h2>
        <p className="mt-2 text-[#555] max-w-lg">
          Every figure in scripture is here — these are just a few familiar
          places to begin.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {voices.map(({ name, hook }) => (
            <a
              key={name}
              href={`/chat?with=${name.toLowerCase()}`}
              className="group relative rounded-xl p-5 bg-white flex flex-col gap-3 transition-all duration-300 ease-out
                shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.08)]
                hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_20px_32px_rgba(0,0,0,0.16)]
                hover:-translate-y-2
                [transform-style:preserve-3d]
                hover:[transform:rotateX(4deg)_rotateY(-4deg)_translateY(-8px)]
              "
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent rounded-t-xl" />
              <div className="w-12 h-12 rounded-full border-2 border-gold bg-gold-light flex items-center justify-center font-[family-name:var(--font-headline)] text-lg text-[#1a1a1a] shadow-sm">
                {name[0]}
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-headline)] text-lg text-[#1a1a1a]">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-[#555]">{hook}</p>
              </div>
              <span className="mt-auto text-sm text-crimson opacity-0 group-hover:opacity-100 transition">
                Start talking →
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-sky-light">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="font-[family-name:var(--font-headline)] text-3xl font-semibold text-[#1a1a1a]">
            Ready when you are.
          </h2>
          <p className="mt-4 text-[#444]">
            No sign-up required to try your first conversation.
          </p>
          <a
            href="/chat"
            className="inline-block mt-8 bg-crimson text-white px-8 py-3 rounded-md font-medium hover:opacity-90 transition"
          >
            Start a conversation
          </a>
        </div>
      </section>
    </main>
  );
}
