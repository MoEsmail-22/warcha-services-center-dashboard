import { LoadingScreen } from './LoadingScreen';

/** Shown while a lazy page or the saved session is loading. */
export default function RouteFallback() {
  return <LoadingScreen variant="page" />;
}
