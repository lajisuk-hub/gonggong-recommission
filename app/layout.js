import './globals.css'

export const metadata = {
  title: '국공립신규위탁 참여신청 | 영유아교육디자인연구소',
  description: '영유아교육디자인연구소 국공립신규위탁 과정 참여신청·설문·결제안내',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
