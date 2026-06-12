import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function App() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['hello'],
    queryFn: api.getHello,
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <main className="mx-auto max-w-2xl p-8 font-sans">
      <h1 className="text-3xl font-bold tracking-tight">Hello World</h1>

      <div className="mt-4 space-y-2 text-muted-foreground">
        {isPending && <p>Loading message from server…</p>}
        {isError && (
          <p role="alert" className="text-destructive">
            Error: {error.message}
          </p>
        )}
        {data && <p>Server says: {data.message}</p>}
      </div>

      <Button
        className="mt-6"
        onClick={handleRefresh}
        disabled={isFetching}
      >
        {isFetching ? 'Refreshing…' : 'Refresh'}
      </Button>
    </main>
  );
}
