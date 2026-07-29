'use client'

import { useEffect, useState } from 'react'
import { supabase, uploadFile, SETTINGS_ID } from '@/lib/supabase'

const ADMIN_PW = process.env.NEXT_PUBLIC_ADMIN_PW || 'haoraki2026'
const METHOD_LABEL = { card: '카드결제', transfer: '직접이체', org: '기관결제' }

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [tab, setTab] = useState('settings')

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin_ok') === '1') setAuthed(true)
  }, [])

  function login() {
    if (pw === ADMIN_PW) { sessionStorage.setItem('admin_ok', '1'); setAuthed(true) }
    else alert('비밀번호가 맞지 않아요.')
  }

  if (!authed) {
    return (
      <div className="wrap">
        <div className="top"><h1>관리자 로그인</h1></div>
        <div className="card">
          <div className="field">
            <label>비밀번호</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()} placeholder="관리자 비밀번호" />
          </div>
          <button className="btn" onClick={login}>들어가기</button>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap admin-wrap">
      <div className="top"><div className="lab">영유아교육디자인연구소</div><h1>관리자 페이지</h1></div>
      <div className="tab">
        <button className={tab === 'settings' ? 'on' : ''} onClick={() => setTab('settings')}>⚙️ 결제·일정·자료 설정</button>
        <button className={tab === 'apps' ? 'on' : ''} onClick={() => setTab('apps')}>📋 신청 내역</button>
      </div>
      {tab === 'settings' ? <SettingsPanel /> : <AppsPanel />}
      <div className="foot"><a href="/">← 신청자 화면 보기</a></div>
    </div>
  )
}

function SettingsPanel() {
  const [s, setS] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    (async () => {
      if (!supabase) { setS({}); return }
      const { data } = await supabase.from('recom_settings').select('data').eq('id', SETTINGS_ID).maybeSingle()
      setS(data?.data || {})
    })()
  }, [])

  async function save() {
    if (!supabase) { setMsg('저장소 연결이 필요합니다.'); return }
    setBusy(true); setMsg('')
    const { error } = await supabase.from('recom_settings').upsert({ id: SETTINGS_ID, data: s, updated_at: new Date().toISOString() })
    setBusy(false)
    setMsg(error ? '저장 실패: ' + error.message : '저장되었습니다 ✓')
  }

  async function onSchedule(e) {
    const file = e.target.files?.[0]; if (!file) return
    setMsg('일정 이미지 업로드 중…')
    try { const url = await uploadFile(file, 'schedule'); set('scheduleImageUrl', url); setMsg('일정 이미지 업로드 완료 (저장 버튼을 눌러주세요)') }
    catch (e2) { setMsg('업로드 실패: ' + e2.message) }
  }

  async function onMaterial(e) {
    const file = e.target.files?.[0]; if (!file) return
    setMsg('자료 업로드 중…')
    try {
      const url = await uploadFile(file, 'materials')
      const list = Array.isArray(s.materials) ? s.materials : []
      set('materials', [...list, { name: file.name, url }])
      setMsg('자료 추가 완료 (저장 버튼을 눌러주세요)')
    } catch (e2) { setMsg('업로드 실패: ' + e2.message) }
  }

  function removeMaterial(i) {
    const list = [...(s.materials || [])]; list.splice(i, 1); set('materials', list)
  }

  if (!s) return <div className="card center muted">불러오는 중…</div>

  return (
    <div className="card">
      <h2>과정 안내 글</h2>
      <div className="field">
        <label>과정 안내 <span className="hint">(비워두면 기본 안내문이 나옵니다)</span></label>
        <textarea style={{ minHeight: 140 }} value={s.courseInfo || ''} onChange={(e) => set('courseInfo', e.target.value)} placeholder="국공립 신규위탁 과정 안내를 입력하세요" />
      </div>

      <h2 style={{ marginTop: 24 }}>교육일정 이미지</h2>
      {s.scheduleImageUrl && <img className="imgview" src={s.scheduleImageUrl} alt="일정" style={{ marginBottom: 8, maxHeight: 300, objectFit: 'contain' }} />}
      <label className="uploadbox" style={{ display: 'block' }}>
        📎 일정 이미지 올리기 (선택하면 교체됩니다)
        <input type="file" accept="image/*" hidden onChange={onSchedule} />
      </label>

      <h2 style={{ marginTop: 24 }}>결제 정보</h2>
      <div className="field">
        <label>교육비 금액 <span className="hint">(화면에 그대로 표시됩니다)</span></label>
        <input type="text" value={s.price || ''} onChange={(e) => set('price', e.target.value)} placeholder="예) 550,000원 (부가세 포함)" />
      </div>
      <div className="field">
        <label>카드결제 링크 <span className="hint">(카드결제 버튼이 이 주소로 연결됩니다)</span></label>
        <input type="text" value={s.cardLink || ''} onChange={(e) => set('cardLink', e.target.value)} placeholder="https://..." />
      </div>
      <div className="field">
        <label>입금 은행</label>
        <input type="text" value={s.bankName || ''} onChange={(e) => set('bankName', e.target.value)} placeholder="예) 국민은행" />
      </div>
      <div className="field">
        <label>계좌번호 <span className="hint">(직접이체·기관결제에서 복사됩니다)</span></label>
        <input type="text" value={s.accountNumber || ''} onChange={(e) => set('accountNumber', e.target.value)} placeholder="예) 123456-01-234567" />
      </div>
      <div className="field">
        <label>예금주</label>
        <input type="text" value={s.accountHolder || ''} onChange={(e) => set('accountHolder', e.target.value)} placeholder="예) 영유아교육디자인연구소" />
      </div>
      <div className="field">
        <label>카카오 송금 링크 <span className="hint">(선택 · 있으면 카카오 송금 버튼이 생깁니다)</span></label>
        <input type="text" value={s.kakaoPayLink || ''} onChange={(e) => set('kakaoPayLink', e.target.value)} placeholder="https://qr.kakaopay.com/..." />
      </div>

      <h2 style={{ marginTop: 24 }}>교육과정 안내 자료</h2>
      <p className="small muted">신청 완료 화면과 결제 후 안내에 보이는 자료예요. 이미지는 바로 보이고, PDF 등은 열기 버튼으로 나옵니다.</p>
      {(s.materials || []).map((m, i) => (
        <div key={i} className="copybox">
          <div className="v small">{m.name}</div>
          <button className="btn sm ghost" onClick={() => removeMaterial(i)}>삭제</button>
        </div>
      ))}
      <label className="uploadbox" style={{ display: 'block' }}>
        📎 자료 추가하기 (이미지/PDF)
        <input type="file" accept="image/*,application/pdf" hidden onChange={onMaterial} />
      </label>

      <div style={{ marginTop: 20 }}>
        <button className="btn" onClick={save} disabled={busy}>{busy ? '저장 중…' : '전체 설정 저장하기'}</button>
        {msg && <p className="center small" style={{ marginTop: 10, color: msg.includes('실패') ? 'var(--danger)' : 'var(--brand)' }}>{msg}</p>}
      </div>
    </div>
  )
}

function AppsPanel() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')

  async function load() {
    if (!supabase) { setErr('저장소 연결이 필요합니다.'); setRows([]); return }
    const { data, error } = await supabase.from('recom_applications').select('*').order('created_at', { ascending: false })
    if (error) { setErr(error.message); setRows([]); return }
    setRows(data || [])
  }
  useEffect(() => { load() }, [])

  async function toggle(row) {
    const next = row.payment_status === '확정' ? '대기' : '확정'
    await supabase.from('recom_applications').update({ payment_status: next }).eq('id', row.id)
    load()
  }

  if (rows === null) return <div className="card center muted">불러오는 중…</div>
  if (err) return <div className="card"><div className="err">{err}</div></div>

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>신청 내역 ({rows.length}건)</h2>
        <button className="btn sm ghost" onClick={load}>새로고침</button>
      </div>
      {rows.length === 0 ? (
        <p className="muted center">아직 신청 내역이 없어요.</p>
      ) : (
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>신청일</th><th>이름</th><th>전화</th><th>현재→응시</th><th>경력</th><th>도전</th>
                <th>도움받고싶은 부분</th><th>결제</th><th>결제일/예정</th><th>전자계산서</th><th>상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="small">{fmt(r.created_at)}</td>
                  <td>{r.name}</td>
                  <td className="small">{r.phone}</td>
                  <td className="small">{r.current_region} → {r.target_region}</td>
                  <td className="small">{r.career}</td>
                  <td className="small">{r.challenge_count}</td>
                  <td className="small" style={{ maxWidth: 180 }}>{r.help_needed}</td>
                  <td className="small">{METHOD_LABEL[r.payment_method] || r.payment_method}</td>
                  <td className="small">{r.paid_date ? '결제 ' + r.paid_date : ''}{r.scheduled_date ? ' 예정 ' + r.scheduled_date : ''}</td>
                  <td className="small">
                    {r.payment_method === 'org' ? (
                      <>
                        {r.einvoice_email && <div>{r.einvoice_email}</div>}
                        {r.business_reg_url && <a href={r.business_reg_url} target="_blank" rel="noreferrer">고유번호증 보기</a>}
                      </>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={'badge ' + (r.payment_status === '확정' ? 'done' : 'wait')}>{r.payment_status}</span>
                    <button className="btn sm ghost" style={{ marginTop: 6 }} onClick={() => toggle(r)}>
                      {r.payment_status === '확정' ? '대기로' : '확정처리'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function fmt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
