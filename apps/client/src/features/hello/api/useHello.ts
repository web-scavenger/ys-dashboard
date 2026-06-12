import { useQuery } from '@tanstack/react-query';
import { getHello } from './helloApi.js';

export function useHello() {
  return useQuery({ queryKey: ['hello'], queryFn: getHello });
}
