import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Hang<span className="text-primary-600">word</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              The daily word guessing game
            </p>
          </div>

          <div className="flex space-x-6">
            <Link href="/play" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              Play
            </Link>
            <Link href="/leaderboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              Leaderboard
            </Link>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Hangword. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
