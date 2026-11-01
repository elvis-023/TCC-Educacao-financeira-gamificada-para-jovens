import { BookOpen, Calculator, Trophy } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

const destaques = [
  { icone: BookOpen, titulo: 'Trilhas e quizzes', texto: 'Lições curtas e quizzes que se ajustam ao seu ritmo.' },
  { icone: Calculator, titulo: 'Simuladores', texto: 'Veja como os juros e a fatura do cartão funcionam na prática.' },
  { icone: Trophy, titulo: 'XP, conquistas e ranking', texto: 'Ganhe pontos e conquistas a cada passo.' },
];

export function BoasVindas() {
  return (
    <main className="flex min-h-[calc(100dvh-2rem)] flex-col gap-4">
      <div className="fundo-hero flex flex-1 flex-col justify-between gap-8 rounded-3xl p-6">
        <div className="space-y-4 pt-6">
          <h1 className="text-4xl font-semibold leading-[1.1]">Seu dinheiro, com mais clareza</h1>
          <p className="text-base opacity-90">
            Aprenda a cuidar das suas finanças com lições curtas, quizzes, simuladores e conquistas.
          </p>
        </div>
        <ul className="space-y-2">
          {destaques.map(({ icone: Icone, titulo, texto }) => (
            <li key={titulo} className="flex gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
              <Icone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destaque" />
              <div>
                <p className="font-semibold">{titulo}</p>
                <p className="text-sm opacity-90">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <Button asChild size="lg" className="h-12 bg-destaque font-semibold text-destaque-foreground hover:bg-destaque/90"><Link to="/cadastro">Criar conta</Link></Button>
        <Button asChild size="lg" variant="outline" className="h-12 font-semibold"><Link to="/entrar">Entrar</Link></Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Para maiores de 18 anos. Este app faz parte de uma pesquisa de TCC da Universidade São Judas Tadeu.
      </p>
    </main>
  );
}
