import Panel from '@/components/logistica/Panel';

export const revalidate = 0;

export default function ChoferPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <Panel email="chofer@demo.com" />
    </main>
  );
}