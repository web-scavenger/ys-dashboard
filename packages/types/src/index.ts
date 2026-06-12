/**
 * Shared types between server and client.
 *
 * Single source of truth: the server types its route schemas against these and
 * the client types its responses against these, so the two cannot drift.
 * Widget/entity types will be added here in the feature phase.
 */

export interface HelloResponse {
  message: string;
}
