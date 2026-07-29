'use client'

import { useEffect, useState } from 'react'
import { supabase, uploadFile, SETTINGS_ID } from '@/lib/supabase'

const DEFAULT_COURSE = `영유아교육디자인연구소의 국공립신규위탁 과정은 매년 1월·5월·9월, 한 해 세 번 진행하며 한 달 동안 함께 공부하는 시스템입니다.

단순히 샘플 문서를 드리는 것이 아니라, 공부하면서 면접 준비까지 완벽하게 마칠 수 있도록 돕습니다.

• 밀도 높은 지도를 위해 지역별로 딱 1분씩만 참여하실 수 있습니다.
• 다음 차시 강의 재수강 기회도 함께 드립니다.
• 완성도 높은 교육으로 준비하고 있습니다.`

const TOTAL = 8

export default function Home() {
  const [step, setStep] = useState(0)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState('')

  const [f, setF] = useState({
    name: '', phone: '',
    currentRegion: '', targetRegion: '',
    career: '', challengeCount: '', helpNeeded: '',
    paymentMethod: '',
    einvoiceEmail: '', businessRegUrl: '',
    paidDate: '', scheduledDate: '',
  })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return }
      const { data } = await supabase.from('recom_settings').select('data').eq('id', SETTINGS_ID).maybeSingle()
      setSettings(data?.data || {})
      setLoading(false)
    })()
  }, [])

  const s = settings || {}
  const courseText = s.courseInfo || DEFAULT_COURSE
  const price = s.price || ''

  const go = (n) => { setErr(''); window.scrollTo(0, 0); setStep(n) }

  function copy(text, key) {
    navigator.clipboard?.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  async function handleBizUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setErr('')
    try {
      const url = await uploadFile(file, 'business-reg')
      set('businessRegUrl', url)
    } catch (e2) {
      setErr('사진 업로드에 실패했어요. 다시 시도해 주세요.')
    }
  }

  function validSurvey() {
    if (!f.name.trim()) return '이름을 입력해 주세요.'
    if (!f.phone.trim()) return '전화번호를 입력해 주세요.'
    if (!f.currentRegion.trim()) return '현재 지역을 입력해 주세요.'
    if (!f.targetRegion.trim()) return '응시하고자 하는 지역을 입력해 주세요.'
    if (!f.career.trim()) return '총 경력을 입력해 주세요.'
    if (!f.challengeCount.trim()) return '위탁 도전 횟수를 입력해 주세요.'
    if (!f.helpNeeded.trim()) return '가장 도움받고 싶은 부분을 입력해 주세요.'
    return ''
  }

  async function submit() {
    setErr('')
    if (!supabase) { setErr('저장소 연결이 아직 설정되지 않았어요. 관리자에게 문의해 주세요.'); return }
    setSaving(true)
    const { error } = await supabase.from('recom_applications').insert({
      name: f.name.trim(),
      phone: f.phone.trim(),
      current_region: f.currentRegion.trim(),
      target_region: f.targetRegion.trim(),
      career: f.career.trim(),
      challenge_count: f.challengeCount.trim(),
      help_needed: f.helpNeeded.trim(),
      payment_method: f.paymentMethod,
      einvoice_email: f.einvoiceEmail.trim() || null,
      business_reg_url: f.businessRegUrl || null,
      paid_date: f.paidDate || null,
      scheduled_date: f.scheduledDate || null,
      payment_status: '대기',
    })
    setSaving(false)
    if (error) { setErr('신청 저장에 실패했어요. 잠시 후 다시 시도해 주세요.'); return }
    setSaved(true)
    go(7)
  }

  if (loading) {
    return <div className="wrap"><div className="card center muted">불러오는 중…</div></div>
  }

  return (
    <div className="wrap">
      <div className="top">
        <div className="lab">영유아교육디자인연구소</div>
        <h1>국공립 신규위탁 참여신청</h1>
        <div className="sub">한 달 함께 공부하고, 면접까지 완벽하게</div>
      </div>

      <div className="steps">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} className={'dot' + (i <= step ? ' on' : '')} />
        ))}
      </div>

      {/* 0. 참여신청 안내 */}
      {step === 0 && (
        <div className="card">
          <h2><span className="n">1</span>참여신청 안내</h2>
          <p className="lead">영유아교육디자인연구소에서 진행하는 <b>국공립 신규위탁 과정</b> 참여를 신청하는 곳입니다.</p>
          <div className="notice">아래 순서로 진행됩니다.
{'\n'}① 과정 안내 확인  ② 교육일정 확인  ③ 간단한 사전 설문  ④ 결제방법 선택·안내  ⑤ 결제내역 확인  ⑥ 교육자료 안내</div>
          <p className="small muted">신청 전, 다음 화면의 과정 안내를 꼭 읽어주세요.</p>
          <button className="btn" onClick={() => go(1)}>신청 시작하기 →</button>
        </div>
      )}

      {/* 1. 과정 안내 */}
      {step === 1 && (
        <div className="card">
          <h2><span className="n">2</span>국공립 신규위탁 과정 안내</h2>
          <div className="notice">{courseText}</div>
          <div className="row">
            <button className="btn ghost" onClick={() => go(0)}>← 이전</button>
            <button className="btn" onClick={() => go(2)}>다음 →</button>
          </div>
        </div>
      )}

      {/* 2. 교육일정 안내 */}
      {step === 2 && (
        <div className="card">
          <h2><span className="n">3</span>교육일정 안내</h2>
          {s.scheduleImageUrl ? (
            <img className="imgview" src={s.scheduleImageUrl} alt="교육일정 안내" />
          ) : (
            <div className="notice warn">교육일정 이미지가 아직 등록되지 않았습니다. 곧 안내드릴게요.</div>
          )}
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn ghost" onClick={() => go(1)}>← 이전</button>
            <button className="btn" onClick={() => go(3)}>설문 작성 →</button>
          </div>
        </div>
      )}

      {/* 3. 사전 설문 */}
      {step === 3 && (
        <div className="card">
          <h2><span className="n">4</span>신청자 사전 설문</h2>
          <p className="lead">더 잘 도와드리기 위한 질문이에요. 편하게 답해 주세요.</p>

          <div className="field">
            <label>이름</label>
            <input type="text" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="성함" />
          </div>
          <div className="field">
            <label>전화번호</label>
            <input type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="010-0000-0000" />
          </div>
          <div className="field">
            <label>1) 현재 지역</label>
            <input type="text" value={f.currentRegion} onChange={(e) => set('currentRegion', e.target.value)} placeholder="예) 대구 수성구" />
          </div>
          <div className="field">
            <label>2) 응시하고자 하는 지역</label>
            <input type="text" value={f.targetRegion} onChange={(e) => set('targetRegion', e.target.value)} placeholder="예) 대구 달서구" />
          </div>
          <div className="field">
            <label>3) 총 경력 <span className="hint">(교사 + 원장 합산)</span></label>
            <input type="text" value={f.career} onChange={(e) => set('career', e.target.value)} placeholder="예) 교사 8년 + 원장 5년 = 13년" />
          </div>
          <div className="field">
            <label>4) 위탁 도전 횟수</label>
            <input type="text" value={f.challengeCount} onChange={(e) => set('challengeCount', e.target.value)} placeholder="예) 2회째 도전" />
          </div>
          <div className="field">
            <label>5) 이번 위탁과정에서 가장 도움받고 싶은 부분은?</label>
            <textarea value={f.helpNeeded} onChange={(e) => set('helpNeeded', e.target.value)} placeholder="예) 면접 답변 준비, 서류 작성, 심사위원 질문 대응 등" />
          </div>

          {err && <div className="err">{err}</div>}
          <div className="row">
            <button className="btn ghost" onClick={() => go(2)}>← 이전</button>
            <button className="btn" onClick={() => { const v = validSurvey(); if (v) { setErr(v); return } go(4) }}>다음 →</button>
          </div>
        </div>
      )}

      {/* 4. 결제방법 선택 */}
      {step === 4 && (
        <div className="card">
          <h2><span className="n">5</span>결제방법 선택</h2>
          {price && <div className="notice">교육비 안내: <b>{price}</b></div>}
          <div className="choices">
            {[
              { k: 'card', t: '카드결제', d: '결제 링크로 카드 결제' },
              { k: 'transfer', t: '직접이체', d: '카카오/계좌로 직접 이체' },
              { k: 'org', t: '기관결제', d: '기관 계좌 이체 + 전자계산서 발급' },
            ].map((o) => (
              <div key={o.k} className={'choice' + (f.paymentMethod === o.k ? ' sel' : '')} onClick={() => set('paymentMethod', o.k)}>
                <div className="t">{o.t}</div>
                <div className="d">{o.d}</div>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn ghost" onClick={() => go(3)}>← 이전</button>
            <button className="btn" disabled={!f.paymentMethod} onClick={() => go(5)}>다음 →</button>
          </div>
        </div>
      )}

      {/* 5. 결제 안내 (방법별) */}
      {step === 5 && (
        <div className="card">
          <h2><span className="n">6</span>결제 안내</h2>
          {price && <div className="notice">교육비: <b>{price}</b></div>}

          {f.paymentMethod === 'card' && (
            <>
              <p>아래 버튼을 눌러 카드 결제를 진행해 주세요.</p>
              {s.cardLink ? (
                <a className="btn accent" href={s.cardLink} target="_blank" rel="noreferrer">💳 카드 결제하러 가기</a>
              ) : (
                <div className="notice warn">카드 결제 링크가 아직 등록되지 않았어요. 관리자에게 문의해 주세요.</div>
              )}
            </>
          )}

          {f.paymentMethod === 'transfer' && (
            <>
              <p>아래 계좌로 직접 이체해 주세요. 계좌번호를 눌러 복사할 수 있어요.</p>
              <AccountBox s={s} copy={copy} copied={copied} />
            </>
          )}

          {f.paymentMethod === 'org' && (
            <>
              <p>아래 기관 계좌로 이체 후, 전자계산서 발급을 위한 정보를 남겨주세요.</p>
              <AccountBox s={s} copy={copy} copied={copied} />
              <div className="notice">📄 전자계산서 발급 안내
{'\n'}세금계산서(전자계산서) 발급을 위해 고유번호증 사진과 받으실 이메일을 남겨주세요.</div>
              <div className="field">
                <label>고유번호증(사업자등록증) 사진</label>
                {f.businessRegUrl ? (
                  <div>
                    <img className="imgview" src={f.businessRegUrl} alt="고유번호증" style={{ maxHeight: 220, objectFit: 'contain' }} />
                    <label className="btn ghost sm" style={{ marginTop: 8, cursor: 'pointer' }}>
                      다시 올리기
                      <input type="file" accept="image/*" hidden onChange={handleBizUpload} />
                    </label>
                  </div>
                ) : (
                  <label className="uploadbox" style={{ display: 'block' }}>
                    📎 사진 파일을 선택하세요 (탭하여 촬영/앨범)
                    <input type="file" accept="image/*" hidden onChange={handleBizUpload} />
                  </label>
                )}
              </div>
              <div className="field">
                <label>전자계산서 받을 이메일</label>
                <input type="email" value={f.einvoiceEmail} onChange={(e) => set('einvoiceEmail', e.target.value)} placeholder="example@email.com" />
              </div>
            </>
          )}

          {err && <div className="err">{err}</div>}
          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn ghost" onClick={() => go(4)}>← 이전</button>
            <button className="btn" onClick={() => {
              if (f.paymentMethod === 'org') {
                if (!f.businessRegUrl) { setErr('고유번호증 사진을 올려주세요.'); return }
                if (!f.einvoiceEmail.trim()) { setErr('전자계산서 받을 이메일을 입력해 주세요.'); return }
              }
              go(6)
            }}>다음 →</button>
          </div>
        </div>
      )}

      {/* 6. 결제내역 확인 */}
      {step === 6 && (
        <div className="card">
          <h2><span className="n">7</span>결제내역 확인</h2>
          <div className="notice">결제하신 날짜 또는 결제 예정일을 알려주세요. 둘 중 해당하는 칸만 채우시면 됩니다.</div>
          <div className="field">
            <label>결제일자 <span className="hint">(이미 결제하셨다면)</span></label>
            <input type="date" value={f.paidDate} onChange={(e) => set('paidDate', e.target.value)} />
          </div>
          <div className="field">
            <label>결제 예정일 <span className="hint">(곧 결제하실 예정이라면)</span></label>
            <input type="date" value={f.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)} />
          </div>
          <div className="notice warn">✅ 결제 확인 후 <b>확정 문자를 발송해 드릴 예정</b>입니다.</div>
          {err && <div className="err">{err}</div>}
          <div className="row">
            <button className="btn ghost" onClick={() => go(5)}>← 이전</button>
            <button className="btn" disabled={saving} onClick={submit}>{saving ? '신청 접수 중…' : '신청 완료하기'}</button>
          </div>
        </div>
      )}

      {/* 7. 완료 + 교육자료 안내 */}
      {step === 7 && (
        <div className="card center">
          <div className="done-mark">✓</div>
          <h2 style={{ justifyContent: 'center' }}>신청이 접수되었습니다</h2>
          <p className="muted">{f.name}님, 참여신청이 정상 접수되었어요.{'\n'}결제 확인 후 <b>확정 문자</b>를 보내드리겠습니다.</p>

          <div style={{ textAlign: 'left', marginTop: 18 }}>
            <h2 style={{ fontSize: 17 }}><span className="n">8</span>교육과정 안내 자료</h2>
            {Array.isArray(s.materials) && s.materials.length > 0 ? (
              <div>
                {s.materials.map((m, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    {isImage(m.url)
                      ? <img className="imgview" src={m.url} alt={m.name || '교육자료'} />
                      : <a className="btn ghost" href={m.url} target="_blank" rel="noreferrer">📄 {m.name || '자료 열기'}</a>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="notice">교육과정 안내 자료가 준비되면 이 화면에서 확인하실 수 있어요. 확정 문자와 함께 자세히 안내드리겠습니다.</div>
            )}
          </div>
        </div>
      )}

      <div className="foot">
        영유아교육디자인연구소 · 국공립 신규위탁 과정
        <br />
        <a href="/admin">🔒 관리자 페이지</a>
      </div>
    </div>
  )
}

function AccountBox({ s, copy, copied }) {
  const acc = [s.bankName, s.accountNumber].filter(Boolean).join(' ')
  if (!s.accountNumber) {
    return <div className="notice warn">계좌 정보가 아직 등록되지 않았어요. 관리자에게 문의해 주세요.</div>
  }
  return (
    <>
      <div className="copybox">
        <div className="v">{acc}{s.accountHolder ? ` (${s.accountHolder})` : ''}</div>
        <button className="btn sm" onClick={() => copy(s.accountNumber, 'acc')}>{copied === 'acc' ? '복사됨!' : '복사'}</button>
      </div>
      {s.kakaoPayLink && (
        <a className="btn ghost" href={s.kakaoPayLink} target="_blank" rel="noreferrer">💛 카카오 송금 바로가기</a>
      )}
      <p className="small muted">복사 버튼을 누르면 계좌번호가 복사됩니다. 카카오페이/뱅킹 앱에 붙여넣어 이체해 주세요.</p>
    </>
  )
}

function isImage(url = '') {
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url)
}
