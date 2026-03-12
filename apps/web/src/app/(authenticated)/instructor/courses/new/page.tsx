// INS-UI-04 講座作成（スタイル選択）
import Link from 'next/link';

const STYLES = [
  {
    id: 'one_on_one' as const,
    label: '1on1',
    headerBg: 'bg-[#a5a6f6]',
    description: '講師と受講者が1対1で行う講座スタイル',
    participants: '1人 / 1回',
    duration: '15分 / 30分 / 60分',
    purpose: '個別指導、コーチング、メンタリング、相談対応など',
    price: '自由設定（低価格〜エグゼクティブ向け高価格まで対応）',
    feature: '完全カスタマイズされた指導内容',
    href: '/instructor/courses/new/simple?style=one_on_one',
  },
  {
    id: 'seminar' as const,
    label: 'セミナー',
    headerBg: 'bg-[#a5a6f6]',
    description: '1度に複数の受講者を相手に行う講座スタイル',
    participants: '上限なし / 1回',
    duration: '1〜2時間',
    purpose: 'セミナー、ワークショップ、勉強会、講演会など',
    price: '自由設定（大衆向けの価格をイメージ）',
    feature: '実演を見せながら教える実践的なセミナー',
    href: '/instructor/courses/new/simple?style=seminar',
  },
  {
    id: 'bootcamp' as const,
    label: 'ブートキャンプ',
    headerBg: 'bg-[#5d5fef]',
    description: '受講者と何度もラリーをしながら進める講座スタイル',
    participants: '設定した定員数まで受講可能。複数人が好きな時間に受講可能',
    duration: '4週間以上',
    purpose:
      '体系的スキル習得プログラム、資格取得講座、転職支援プログラム、企業研修など',
    price: '自由設定（20,000円〜100,000円の高単価を目指す）',
    feature:
      'カリキュラム構成、継続的フォローアップ、コミュニティ型学習による受講者同士の相互支援',
    href: '/instructor/courses/new/bootcamp',
  },
] as const;

export default function CourseCreateStyleSelectPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <div className="border-b border-[#eaeaea]" />
      <div className="mx-auto max-w-[1200px] px-6 py-6 md:px-8">
        {/* パンくず */}
        <nav className="mb-4 flex items-center gap-1 text-xs tracking-[0.96px] text-[#878787]">
          <Link href="/instructor" className="hover:underline">
            TOP
          </Link>
          <span aria-hidden className="text-[#878787]">
            <ChevronRightIcon />
          </span>
          <span className="text-[#878787]">講座を作る</span>
        </nav>

        {/* タイトル */}
        <div className="relative mb-6 pl-5">
          <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-[#5d5fef]" />
          <h1 className="text-2xl tracking-[1.92px] text-black">
            講座を作る
          </h1>
        </div>

        {/* 説明 */}
        <p className="mb-10 max-w-[940px] text-sm leading-8 tracking-[0.56px] text-black">
          講座スタイルを選んでください。講座スタイルによって受講者の人数や時間、学習体験が異なります。
          <br />
          受講者数や目安時間などを参考に、あなたの目的に合った講座スタイルを選んでください。
        </p>

        {/* スタイルカード */}
        <div className="flex flex-wrap gap-10">
          {STYLES.map((style) => (
            <article
              key={style.id}
              className="w-full max-w-[352px] overflow-hidden rounded-lg border border-transparent bg-white shadow-[0_0_0_1px_rgba(93,95,239,0.05)]"
            >
              <div
                className={`flex h-16 items-start rounded-t-lg px-6 pt-4 ${style.headerBg}`}
              >
                <h2
                  className={`text-xl tracking-[0.8px] ${
                    style.id === 'bootcamp' ? 'text-white' : 'text-black'
                  }`}
                >
                  {style.label}
                </h2>
              </div>
              <div className="flex flex-col gap-6 px-6 pb-6 pt-6">
                <dl className="flex flex-col gap-4 text-sm leading-[1.6] tracking-[0.56px]">
                  <Item label="概要" value={style.description} />
                  <Item label="受講者数" value={style.participants} />
                  <Item label="目安時間・期間" value={style.duration} />
                  <Item label="目的・用途" value={style.purpose} />
                  <Item label="価格設定" value={style.price} />
                  <Item label="特徴" value={style.feature} />
                </dl>
                <Link
                  href={style.href}
                  className="flex h-12 w-full items-center justify-center rounded bg-[#5d5fef] text-sm font-normal tracking-[0.56px] text-white transition-opacity hover:opacity-90"
                >
                  このスタイルで進める
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs tracking-[0.96px] text-[#878787]">{label}</dt>
      <dd className="text-sm tracking-[0.56px] text-black">{value}</dd>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4.5 3L7.5 6L4.5 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
