export type Site = {
  website: string;
  githubRepoName?: string;
  author: string;
  desc: string;
  title: string;
  ogImage?: string;
  lightAndDarkMode: boolean;
  postPerPage: number;
  scheduledPostMargin: number;
};

// No longer keyed to the icon set: the footer renders these as words, so a
// social link needs a label to print rather than a mark to look up. The label
// is also the accessible name, which is why there is no separate linkTitle —
// an icon needed one, a word is its own.
export type SocialObjects = {
  label: string;
  href: string;
  active: boolean;
}[];
