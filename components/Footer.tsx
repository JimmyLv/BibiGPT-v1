import Link from 'next/link'
import { ModeToggle } from '~/components/mode-toggle'
import { BIBIGPT_PRO_CTA_URL } from '~/utils/constants'
import { Icons } from './icons'
import { buttonVariants } from '@/components/ui/button'

export default function Footer() {
  return (
    <footer className="z-50 mt-5 mb-3 flex h-16 w-full flex-col items-center justify-between space-y-3 bg-white px-3 pt-4 text-center text-slate-400 sm:mb-0 sm:h-20 sm:flex-row sm:pt-2 lg:px-12">
      <div className="flex flex-col items-center text-sm text-slate-500 sm:items-start sm:text-left">
        <div>
          想要更强大的版本？
          <a
            href={BIBIGPT_PRO_CTA_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-1 font-semibold text-sky-500 underline-offset-2 transition hover:text-pink-400 hover:underline"
          >
            立即体验 BibiGPT.co
          </a>
        </div>
        <div className="mt-1">
          功能更全、模型更丰富，支持免费试用与
          <a
            href={BIBIGPT_PRO_CTA_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-1 font-semibold text-pink-500 underline-offset-2 transition hover:underline"
          >
            查看当前优惠
          </a>
          。
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <a
          href={BIBIGPT_PRO_CTA_URL}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({
            size: 'sm',
            className: 'bg-sky-500 text-white hover:bg-sky-600',
          })}
          aria-label="升级到 BibiGPT.co"
        >
          升级到 BibiGPT.co
        </a>
        <Link href="/privacy" className="group" aria-label="隐私声明">
          Privacy Statement
        </Link>
        <Link href="https://twitter.com/Jimmy_JingLv" className="group" aria-label="JimmyLv on Twitter">
          <div
            className={buttonVariants({
              size: 'sm',
              variant: 'ghost',
              className: 'text-slate-700 dark:text-slate-400',
            })}
          >
            <Icons.twitter className="h-5 w-5 fill-current" />
            <span className="sr-only">Twitter</span>
          </div>
        </Link>
        <Link href="https://github.com/JimmyLv" className="group" aria-label="JimmyLv on GitHub">
          <div
            className={buttonVariants({
              size: 'sm',
              variant: 'ghost',
              className: 'text-slate-700 dark:text-slate-400',
            })}
          >
            <Icons.gitHub className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </div>
        </Link>
        <ModeToggle />
      </div>
    </footer>
  )
}
