// ============================================================================
//  app/legal/[doc].tsx  ->  STATIC CONTENT (Terms / Privacy / Help & FAQ)
//  One screen serves all three, chosen by the route (/legal/terms, etc.).
//  The text below is placeholder starter content — replace it with your real
//  legal copy before launch (just edit the CONTENT object).
// ============================================================================
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { font, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';

type Section = { heading: string; body: string };
type Doc = { title: string; sections: Section[] };

const CONTENT: Record<string, Doc> = {
  terms: {
    title: 'Terms & Conditions',
    sections: [
      {
        heading: 'Free to play',
        body: 'E-Fantasy is a free-to-play game for entertainment only. All tokens ("E-Tokens") are virtual, have no cash value, cannot be purchased, redeemed, or exchanged for real money or goods, and involve no gambling.',
      },
      {
        heading: 'Your account',
        body: 'You are responsible for keeping your login details secure and for all activity on your account. Provide accurate information when you register.',
      },
      {
        heading: 'Fair play',
        body: 'Do not cheat, exploit bugs, use multiple accounts to gain an advantage, or interfere with other players. We may suspend or remove accounts that break these rules.',
      },
      {
        heading: 'Contests & scoring',
        body: 'Fantasy points and contest results are calculated from official match data entered by our team. Standings are provisional during a match and confirmed shortly after it ends.',
      },
      {
        heading: 'Changes',
        body: 'We may update these terms and the app from time to time. Continued use of the app means you accept the latest version.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'What we collect',
        body: 'When you register we store your email address and chosen username. We keep a record of your wallet balance, teams, contest entries and in-app transactions so the game works.',
      },
      {
        heading: 'How we use it',
        body: 'Your information is used only to run E-Fantasy — to sign you in, show your wallet and contests, and rank you on leaderboards. We do not sell your personal data.',
      },
      {
        heading: 'Who can see what',
        body: 'Other players can see your username and points on shared leaderboards. Your email and wallet are private to you.',
      },
      {
        heading: 'Contact',
        body: 'For any privacy question or to request deletion of your account, contact us at support@efantasy.example (replace with your real support email).',
      },
    ],
  },
  help: {
    title: 'Help & FAQ',
    sections: [
      {
        heading: 'How do I get tokens?',
        body: 'Every new player starts with 1,000 free E-Tokens. You can win more by finishing near the top of paid contests.',
      },
      {
        heading: 'How do I play?',
        body: 'Open a match, build a team of 12 players + 1 esports team, pick a Captain (2x points) and Vice-Captain (1.5x points), then join a contest for that match.',
      },
      {
        heading: 'When do I get my points?',
        body: 'Points update live as our team enters match results. Final standings are confirmed within about an hour after the match ends.',
      },
      {
        heading: 'Where do I see my contests?',
        body: 'The "My Contests" tab lists everything you\'ve joined. Tap any contest to see its live leaderboard.',
      },
      {
        heading: 'Still need help?',
        body: 'Email us at support@efantasy.example (replace with your real support email) and we\'ll get back to you.',
      },
    ],
  },
};

export default function LegalDoc() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const insets = useSafeAreaInsets();
  const content = CONTENT[doc as string] ?? CONTENT.terms;

  return (
    <View style={styles.container}>
      <ScreenHeader title={content.title} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}>
        {content.sections.map((s, i) => (
          <View key={i} style={{ marginBottom: spacing.lg }}>
            <Text style={styles.heading}>{s.heading}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
        <Text style={styles.note}>This is starter text — replace it with your official policy before launch.</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  heading: { color: colors.text, fontSize: font.lg, fontWeight: '800', marginBottom: spacing.xs },
  body: { color: colors.textMuted, fontSize: font.md, lineHeight: 22 },
  note: {
    color: colors.textFaint,
    fontSize: font.sm - 1,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
