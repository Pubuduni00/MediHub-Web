import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Pill, Stethoscope } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { useData } from '../../context/DataContext';

const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function PatientCalendar({ patientId }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [popup, setPopup] = useState(null); // { date, logs, prescriptions }
  const { getLogsForDate, getLogsForPatient, getPrescriptionsForPatient } = useData();

  const allLogs = getLogsForPatient(patientId);
  const allRx = getPrescriptionsForPatient(patientId);
  const logDates = new Set(allLogs.map(l => l.date));
  const rxDates = new Set(allRx.map(r => r.date));
  const apptDates = new Set([...logDates, ...rxDates]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const handleDayClick = (day) => {
    const str = format(day, 'yyyy-MM-dd');
    if (!apptDates.has(str)) return;
    const logs = getLogsForDate(patientId, str);
    const rxs = allRx.filter(r => r.date === str);
    setPopup({ date: str, logs, rxs });
  };

  return (
    <div style={{position:'relative'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <p style={{fontSize:13,fontWeight:700}}>{format(currentMonth,'MMMM yyyy')}</p>
        <div style={{display:'flex',gap:4}}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setCurrentMonth(subMonths(currentMonth,1))}><ChevronLeft size={13}/></button>
          <button className="btn btn-ghost btn-sm" onClick={()=>setCurrentMonth(new Date())}>Today</button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setCurrentMonth(addMonths(currentMonth,1))}><ChevronRight size={13}/></button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:3}}>
        {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:10,fontWeight:700,color:'var(--text-muted)',padding:'2px 0'}}>{d}</div>)}
      </div>

      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {days.map(day=>{
          const str = format(day,'yyyy-MM-dd');
          const hasEntry = apptDates.has(str);
          const isToday = isSameDay(day,new Date());
          const inMonth = isSameMonth(day,currentMonth);
          return (
            <div
              key={day.toString()}
              onClick={()=>inMonth && handleDayClick(day)}
              style={{
                aspectRatio:'1',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                borderRadius:5,
                cursor:inMonth&&hasEntry?'pointer':'default',
                background:hasEntry&&inMonth?'var(--accent-green)':isToday?'var(--primary-light)':'transparent',
                border:isToday&&!hasEntry?'1.5px solid var(--primary)':'1.5px solid transparent',
                opacity:inMonth?1:0.2,
                transition:'var(--transition)',
                minHeight:28,
              }}
            >
              <span style={{fontSize:11,fontWeight:hasEntry?700:400,color:hasEntry&&inMonth?'#fff':isToday?'var(--primary)':'var(--text-primary)'}}>
                {format(day,'d')}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{display:'flex',gap:14,marginTop:8}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <div style={{width:10,height:10,borderRadius:2,background:'var(--accent-green)'}}/>
          <span style={{fontSize:10.5,color:'var(--text-muted)'}}>Log / Prescription</span>
        </div>
      </div>

      {/* Popup */}
      {popup && (
        <div style={{position:'fixed',inset:0,background:'rgba(10,33,55,0.4)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}
          onClick={e=>{if(e.target===e.currentTarget)setPopup(null);}}>
          <div style={{background:'#fff',borderRadius:'var(--radius-xl)',boxShadow:'var(--shadow-xl)',width:'100%',maxWidth:560,maxHeight:'80vh',overflow:'hidden',display:'flex',flexDirection:'column',animation:'slideUp 0.2s ease'}}>
            {/* Header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',background:'var(--primary)',color:'#fff',borderRadius:'var(--radius-xl) var(--radius-xl) 0 0'}}>
              <div>
                <p style={{fontWeight:700,fontSize:15}}>Records — {popup.date}</p>
                <p style={{fontSize:11.5,opacity:0.85}}>{popup.logs.length} log(s) · {popup.rxs.length} prescription(s)</p>
              </div>
              <button onClick={()=>setPopup(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:8,cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',padding:6}}><X size={15}/></button>
            </div>

            <div style={{overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:16}}>
              {/* Logs */}
              {popup.logs.map(log=>(
                <div key={log.id} style={{border:'1px solid var(--border)',borderRadius:'var(--radius-md)',overflow:'hidden'}}>
                  <div style={{background:'var(--bg-base)',padding:'8px 14px',display:'flex',alignItems:'center',gap:8}}>
                    <Stethoscope size={14} color="var(--primary)"/>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--primary)'}}>{log.doctorName} — Patient Log</span>
                  </div>
                  <div style={{padding:'10px 14px'}}>
                    {log.examination?.diagnosis&&<div className="info-row"><span className="info-label">Diagnosis</span><span className="info-value" style={{color:'var(--accent-red)',fontWeight:600}}>{log.examination.diagnosis}</span></div>}
                    {log.examination?.chiefComplaint&&<div className="info-row"><span className="info-label">Complaint</span><span className="info-value">{log.examination.chiefComplaint}</span></div>}
                    {log.examination?.plan&&<div className="info-row"><span className="info-label">Plan</span><span className="info-value">{log.examination.plan}</span></div>}
                    {log.drugs?.length>0&&(
                      <div style={{marginTop:8}}>
                        <p style={{fontSize:11.5,fontWeight:700,color:'var(--text-muted)',marginBottom:6}}>DRUGS</p>
                        {log.drugs.map((d,i)=>(
                          <div key={i} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
                            <span style={{fontWeight:600,fontSize:13}}>{d.drug}</span>
                            <span className="badge badge-secondary">{d.dose}</span>
                            <span style={{fontSize:12,color:'var(--text-muted)'}}>{d.frequency} · {d.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Prescriptions */}
              {popup.rxs.map(rx=>(
                <div key={rx.id} style={{border:'1px solid var(--border)',borderRadius:'var(--radius-md)',overflow:'hidden'}}>
                  <div style={{background:'var(--secondary-light)',padding:'8px 14px',display:'flex',alignItems:'center',gap:8}}>
                    <Pill size={14} color="var(--secondary)"/>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--secondary)'}}>Prescription {rx.id}</span>
                  </div>
                  <div style={{padding:'10px 14px'}}>
                    {rx.drugs?.map((d,i)=>(
                      <div key={i} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:6}}>
                        <span style={{fontWeight:600,fontSize:13}}>{d.drug}</span>
                        <span className="badge badge-secondary">{d.dose}</span>
                        <span style={{fontSize:12,color:'var(--text-muted)'}}>{d.frequency} · {d.duration} · {d.mealInstruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
