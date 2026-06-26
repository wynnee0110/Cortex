import { buildContext } from "../../buildContext.js";

export function getContext(query?: string): string {
  return buildContext(query);
}
