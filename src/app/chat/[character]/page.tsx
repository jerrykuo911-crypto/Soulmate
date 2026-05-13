import { notFound } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';
import type { Character } from '@/lib/types';

const VALID_CHARACTERS: Character[] = ['leo', 'mia'];

interface PageProps {
  params: { character: string };
}

export default function ChatPage({ params }: PageProps) {
  if (!VALID_CHARACTERS.includes(params.character as Character)) {
    notFound();
  }

  return <ChatWindow character={params.character as Character} />;
}
