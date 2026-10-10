export type Profile = {
  id: string
  label: string
  rules: string
}

export const PROFILES: readonly Profile[] = [
  {
    id: 'en',
    label: 'English',
    rules: 'Reply in clear, plain English.',
  },
  {
    id: 'yue',
    label: '廣東話',
    rules:
      'Reply in spoken Hong Kong Cantonese (口語) in Traditional characters, never written Chinese (書面語). ' +
      'Keep it casual and direct. Keep technical terms and product names in English, the way HK engineers talk.',
  },
  {
    id: 'zh-hant',
    label: '書面繁中',
    rules:
      'Reply in formal written Traditional Chinese (書面語). ' +
      'Use no Cantonese colloquial words (係、嘅、唔、咗). Keep technical terms and product names in English.',
  },
  {
    id: 'ste100',
    label: 'STE100',
    rules:
      'Reply in ASD-STE100 Simplified Technical English. ' +
      'Procedural sentences have at most 20 words; descriptive sentences at most 25. ' +
      'Use the active voice and simple verb tenses. Write one instruction per sentence, in the imperative. ' +
      'Use each word with one meaning only. Write paragraphs of at most 6 sentences.',
  },
  {
    id: 'caveman',
    label: 'Caveman',
    rules:
      'Reply in caveman English: short sentences, no articles, no auxiliary verbs, "me" for I. ' +
      'Technical terms stay exact: `git rebase` stays `git rebase`.',
  },
  {
    id: 'wenyan',
    label: '文言文',
    rules:
      'Reply in Classical Chinese (文言文): classical syntax and particles (之、乎、者、也、矣、焉), terse. ' +
      'Modern technical terms stay in English inside the classical sentence, e.g. 此 PR 有 bug 三，宜速修之。',
  },
  {
    id: 'pirate',
    label: 'Pirate',
    rules:
      'Reply as a pirate: pirate slang ("aye", "arr", "matey", "cap\'n") and nautical metaphors. ' +
      'Keep it readable.',
  },
  {
    id: 'shakespeare',
    label: 'Shakespeare',
    rules:
      'Reply in Early Modern English, as Shakespeare wrote it: thou, thee, thy, doth, hath, prithee. ' +
      'Add the odd theatrical flourish, but keep it readable.',
  },
  {
    id: 'yoda',
    label: 'Yoda',
    rules:
      'Reply as Yoda speaks: object first, then subject, then verb ("Fixed, the bug is. Tested, it must be."). ' +
      'Keep it readable.',
  },
]

export const DEFAULT_PROFILE: Profile = PROFILES[0]!

export const findProfile = (id: unknown): Profile | undefined =>
  PROFILES.find(profile => profile.id === id)

/**
 * The note each prompt carries. It names its source and the exact rules it outranks,
 * never a blanket override, and it sits after the cached history, so a switch costs no cache.
 */
export const reminder = (profile: Profile): string =>
  [
    `<language-profile>Reply in the "${profile.label}" profile: ${profile.rules}`,
    'The user picked this profile with /lang. For reply language only, it takes precedence over ' +
      'AGENTS.md, CLAUDE.md and the `language` setting.',
    'Chat only: deliverables, files, code, comments and commit messages stay in plain English. ' +
      'Accuracy beats voice: never bend a fact, a number or a command to fit the style.</language-profile>',
  ].join(' ')
