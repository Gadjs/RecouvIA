import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from 'firebase/functions';

/** Offline demo project: no real Firebase project and no API key (see docs/decisions.md). */
export const FIREBASE_PROJECT_ID = 'demo-recouvia';
/** Must match the region of the functions in `functions/`. */
export const FUNCTIONS_REGION = 'europe-west1';
const EMULATOR_HOST = '127.0.0.1';
const EMULATOR_PORT = 5001;

let app: FirebaseApp | undefined;
let functions: Functions | undefined;

/** Lazy singleton so importing this module (e.g. in tests) has no side effects. */
export function getAppFunctions(): Functions {
  if (!functions) {
    app = initializeApp({ projectId: FIREBASE_PROJECT_ID });
    functions = getFunctions(app, FUNCTIONS_REGION);
    if (import.meta.env.DEV) {
      connectFunctionsEmulator(functions, EMULATOR_HOST, EMULATOR_PORT);
    }
  }
  return functions;
}
