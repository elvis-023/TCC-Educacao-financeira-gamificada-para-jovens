export function TelaProvisoria({ titulo }: { titulo: string }) {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      <p className="text-muted-foreground">Tela provisória.</p>
    </section>
  );
}
