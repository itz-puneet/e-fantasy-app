// ============================================================================
//  app/index.tsx  (the very first route, "/")
//  We just forward into the main tabs. The security guard in _layout.tsx will
//  bounce the user to the login screen if they're not signed in.
// ============================================================================
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}
