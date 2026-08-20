import { HomeContent } from '@/components/home/HomeContent'

// Static—the home page carries no data-fetching work so first paint is served
// immediately; blog posts are fetched client-side by HomeContent (skeleton
// until they arrive). Language still switches live via useLanguage.
export default function HomePage() {
  return <HomeContent />
}