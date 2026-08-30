export function InspirationGallery() {
  const placeholders = Array.from({ length: 9 });

  return (
    <section className="bg-primary px-6 pb-10 pt-8 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 font-glacial text-xl md:text-2xl">
          Mural de Inspirações
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {placeholders.map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-white shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-105"
            />
          ))}
        </div>
      </div>
    </section>
  );
}