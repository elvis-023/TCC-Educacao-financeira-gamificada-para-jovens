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
    <main className="flex min-h-[calc(100dvh-2rem)] flex-col justify-between gap-8 py-6">
      <div className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight">Educação Financeira Gamificada</h1>
          <p className="text-muted-foreground">
            Aprenda a cuidar do seu dinheiro com lições curtas, quizzes, simuladores e conquistas.
          </p>
        </div>
        <ul className="space-y-3">
          {destaques.map(({ icone: Icone, titulo, texto }) => (
            <li key={titulo} className="flex gap-3 rounded-xl border p-3">
              <Icone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{titulo}</p>
                <p className="text-sm text-muted-foreground">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <Button asChild size="lg"><Link to="/cadastro">Criar conta</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/entrar">Entrar</Link></Button>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Para maiores de 18 anos. Este app faz parte de uma pesquisa de TCC da Universidade São Judas Tadeu.
      </p>
    </main>
  );
}
