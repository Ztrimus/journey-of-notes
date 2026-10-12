import { useEffect, useRef } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';

// ─── Config ──────────────────────────────────────────────────────────────────

const GITHUB_REPO = 'Ztrimus/journey-of-notes';
const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
/** Abort the network request if it takes longer than this. */
const FETCH_TIMEOUT_MS = 5000;

// ─── Types ───────────────────────────────────────────────────────────────────

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Simple semver comparison.
 * Strips a leading "v" from either string before comparing.
 * Returns true only when `latest` is strictly greater than `current`.
 */
function isNewerVersion(latest: string, current: string): boolean {
  const parse = (v: string): [number, number, number] => {
    const parts = v.replace(/^v/, '').split('.').map(Number);
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
  };
  const [lMaj, lMin, lPat] = parse(latest);
  const [cMaj, cMin, cPat] = parse(current);
  if (lMaj !== cMaj) return lMaj > cMaj;
  if (lMin !== cMin) return lMin > cMin;
  return lPat > cPat;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Checks GitHub Releases for a newer version of the app on every cold start.
 *
 * Rules:
 * - Only runs on Android (APK distribution).
 * - Runs once per app session (module-level flag guards against re-mounts).
 * - Any network or parse error → silent fail, never breaks the app.
 * - No internet / request timeout (5 s) → silent abort.
 * - If an update exists → Alert with "Install" (opens APK download) and "Later".
 */
export function useUpdateCheck() {
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only relevant on Android; iOS distribution is handled via App Store
    if (Platform.OS !== 'android') return;
    // Don't re-run if we already checked this session
    if (hasChecked.current) return;
    hasChecked.current = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const checkForUpdate = async () => {
      try {
        const response = await fetch(RELEASES_API, {
          signal: controller.signal,
          headers: { Accept: 'application/vnd.github+json' },
        });

        // Non-2xx response (rate limit, not found, etc.) → silent exit
        if (!response.ok) return;

        const release: GitHubRelease = await response.json();

        const currentVersion: string =
          Constants.expoConfig?.version ?? '0.0.0';

        if (!isNewerVersion(release.tag_name, currentVersion)) return;

        // Prefer the .apk asset; fall back to the release web page
        const apkAsset = release.assets.find(a =>
          a.name.toLowerCase().endsWith('.apk')
        );
        const downloadUrl =
          apkAsset?.browser_download_url ?? release.html_url;

        Alert.alert(
          'Update Available',
          `Version ${release.tag_name} is ready.\nYou have v${currentVersion} installed.`,
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Install',
              onPress: () => Linking.openURL(downloadUrl).catch(() => {}),
            },
          ],
          { cancelable: true }
        );
      } catch {
        // AbortError (timeout), network failure, JSON parse error — all silent
      }
    };

    checkForUpdate().finally(() => clearTimeout(timeoutId));

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);
}
