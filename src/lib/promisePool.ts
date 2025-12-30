export async function promisePool<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency = 6
): Promise<R[]> {
  const results: R[] = [];
  const queue = [...items];
  const running = new Set<Promise<void>>();

  const runNext = async () => {
    const item = queue.shift();
    if (!item) {
      return;
    }

    const taskPromise: Promise<void> = worker(item)
      .then((result) => {
        results.push(result);
      })
      .finally(() => {
        running.delete(taskPromise);
      });

    running.add(taskPromise);
  };

  while (queue.length > 0) {
    while (running.size < concurrency && queue.length > 0) {
      await runNext();
    }
    if (running.size > 0) {
      await Promise.race(running);
    }
  }

  await Promise.all(running);
  return results;
}
