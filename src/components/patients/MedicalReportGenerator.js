import React, { useState } from 'react';
import { FileText, X, Pen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';

export default function MedicalReportGenerator({ patient }) {
  const { isDoctor, user } = useAuth();
  const { getLogsForPatient, getPrescriptionsForPatient } = useData();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="tooltip-wrapper" style={{width:'100%'}}>
        <button
          className="btn btn-primary btn-sm"
          style={{width:'100%',justifyContent:'center',opacity:isDoctor?1:0.5,cursor:isDoctor?'pointer':'not-allowed'}}
          onClick={() => isDoctor && setShowForm(true)}
          disabled={!isDoctor}
        >
          <FileText size={14}/> Generate Medical Report
        </button>
        {!isDoctor && <span className="tooltip">Only doctors can generate medical reports</span>}
      </div>
      {showForm && (
        <MedicalReportForm
          patient={patient} doctor={user}
          logs={getLogsForPatient(patient.id)}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}

function InfoRow({ number, label, value }) {
  return (
    <div style={{
      display:'flex', alignItems:'baseline', gap:8,
      padding:'9px 14px',
      borderBottom:'1px solid var(--border)',
    }}>
      <span style={{fontSize:13,fontWeight:700,color:'var(--text-secondary)',minWidth:20}}>{number}.</span>
      <span style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)',minWidth:200,flexShrink:0}}>{label}</span>
      <span style={{fontSize:13,color:'var(--text-primary)',fontWeight:500}}>{value || '—'}</span>
    </div>
  );
}

function MedicalReportForm({ patient, doctor, logs, onClose }) {
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const mh = patient.medicalHistory;

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    signsSymptoms: latestLog?.examination?.chiefComplaint || mh?.primaryComplaint || '',
    medicalOpinion: latestLog?.examination?.diagnosis || mh?.probableDiagnosis || '',
    recommendations: latestLog?.examination?.plan || '',
    sickLeave: '',
    sickLeaveDate: latestLog?.date || format(new Date(), 'yyyy-MM-dd'),
    fitForDuty: 'No',
    absencePeriod: '',
    additionalNotes: '',
  });
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleGeneratePDF = () => {
    generateMedicalReportPDF(patient, doctor, form, signatureDrawn);
    onClose();
  };

  return (
    <div style={{
      position:'fixed',inset:0,
      background:'rgba(10,33,55,0.5)',backdropFilter:'blur(4px)',
      zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20
    }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{
        background:'#fff',borderRadius:'var(--radius-xl)',
        boxShadow:'var(--shadow-xl)',width:'100%',maxWidth:700,
        maxHeight:'92vh',overflow:'hidden',display:'flex',flexDirection:'column',
        animation:'slideUp 0.2s ease'
      }}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',background:'var(--primary)',color:'#fff',borderRadius:'var(--radius-xl) var(--radius-xl) 0 0'}}>
          <div>
            <p style={{fontSize:16,fontWeight:700}}>Medical Certificate</p>
            <p style={{fontSize:12,opacity:0.85}}>Review details and complete the form before downloading</p>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:8,cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',padding:6}}><X size={16}/></button>
        </div>

        <div style={{overflowY:'auto',flex:1}}>
          {/* Auto-filled section — inline format */}
          <div style={{margin:'16px 20px 0',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',overflow:'hidden'}}>
            <div style={{background:'var(--primary-light)',padding:'8px 14px'}}>
              <p style={{fontSize:11.5,fontWeight:700,color:'var(--primary)',letterSpacing:'0.05em'}}>AUTO-FILLED FROM PATIENT RECORDS</p>
            </div>
            <InfoRow number="1" label="Name of Patient" value={patient.name} />
            <InfoRow number="2" label="Age" value={`${patient.age} years`} />
            <InfoRow number="3" label="Usual Address of Residence" value={patient.address} />
            <InfoRow number="4" label="Date" value={format(new Date(), 'dd/MM/yyyy')} />
          </div>

          {/* Doctor fills */}
          <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:14}}>
            <div style={{background:'var(--accent-orange-light)',border:'1px solid #FED7AA',borderRadius:'var(--radius-md)',padding:'8px 14px',fontSize:12.5,color:'var(--accent-orange)',display:'flex',alignItems:'center',gap:7}}>
              <Pen size={13}/> Fields below require your input as the Medical Officer
            </div>

            <div className="form-group" style={{margin:0}}>
              <label className="form-label">5. Signs and Symptoms Observed</label>
              <textarea className="form-control" rows={3}
                value={form.signsSymptoms} onChange={e=>set('signsSymptoms',e.target.value)}
                placeholder="Describe signs and symptoms observed..."/>
            </div>

            <div className="form-group" style={{margin:0}}>
              <label className="form-label">6. Medical Officer's Opinion / Diagnosis</label>
              <textarea className="form-control" rows={2}
                value={form.medicalOpinion} onChange={e=>set('medicalOpinion',e.target.value)}
                placeholder="e.g. Gastritis, Hypertension Grade I..."/>
            </div>

            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Medical Officer's Recommendations</label>
              <textarea className="form-control" rows={2}
                value={form.recommendations} onChange={e=>set('recommendations',e.target.value)}
                placeholder="Rest at home, follow-up in 3 days..."/>
            </div>

            {/* Sick leave */}
            <div style={{background:'var(--bg-base)',borderRadius:'var(--radius-md)',padding:14}}>
              <p style={{fontSize:12.5,fontWeight:700,color:'var(--text-secondary)',marginBottom:10}}>Sick Leave</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Duration</label>
                  <input className="form-control" value={form.sickLeave} onChange={e=>set('sickLeave',e.target.value)} placeholder="e.g. One day sick leave"/>
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Date of Illness</label>
                  <input type="date" className="form-control" value={form.sickLeaveDate} onChange={e=>set('sickLeaveDate',e.target.value)}/>
                </div>
              </div>
            </div>

            {/* Fit for duty */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group" style={{margin:0}}>
                <label className="form-label">(a) Is applicant fit for duty?</label>
                <select className="form-control" value={form.fitForDuty} onChange={e=>set('fitForDuty',e.target.value)}>
                  <option>Yes</option><option>No</option><option>Partially — with restrictions</option>
                </select>
              </div>
              {form.fitForDuty !== 'Yes' && (
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">(b) Period of absence recommended</label>
                  <input className="form-control" value={form.absencePeriod} onChange={e=>set('absencePeriod',e.target.value)} placeholder="e.g. 2 days from 10/04/2026"/>
                </div>
              )}
            </div>

            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea className="form-control" rows={2} value={form.additionalNotes} onChange={e=>set('additionalNotes',e.target.value)} placeholder="Any other relevant information..."/>
            </div>

            {/* Auto-filled doctor info */}
            <div style={{border:'1px solid var(--border)',borderRadius:'var(--radius-md)',overflow:'hidden'}}>
              <div style={{background:'var(--primary-light)',padding:'8px 14px'}}>
                <p style={{fontSize:11.5,fontWeight:700,color:'var(--primary)',letterSpacing:'0.05em'}}>AUTO-FILLED — MEDICAL OFFICER</p>
              </div>
              <InfoRow number="" label="Name" value={doctor?.name} />
              <InfoRow number="" label="Specialty / Rank" value={doctor?.specialty || 'Medical Officer'} />
            </div>

            {/* Signature */}
            <div style={{border:'2px dashed var(--border)',borderRadius:'var(--radius-md)',padding:'16px 20px',textAlign:'center'}}>
              <p style={{fontSize:12.5,color:'var(--text-muted)',marginBottom:10}}>Signature of Medical Officer</p>
              {signatureDrawn ? (
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                  <div style={{fontFamily:'Georgia,serif',fontSize:22,color:'var(--primary)',fontStyle:'italic',borderBottom:'2px solid var(--primary)',paddingBottom:4,minWidth:180}}>
                    {doctor?.name}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setSignatureDrawn(false)}>Clear</button>
                </div>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={()=>setSignatureDrawn(true)}>
                  <Pen size={13}/> Apply Signature
                </button>
              )}
              <p style={{fontSize:11,color:'var(--text-muted)',marginTop:8}}>{doctor?.name} · {doctor?.specialty||'Medical Officer'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:10,padding:'14px 24px',borderTop:'1px solid var(--border)',background:'var(--bg-base)',borderRadius:'0 0 var(--radius-xl) var(--radius-xl)'}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleGeneratePDF}>
            <FileText size={14}/> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function generateMedicalReportPDF(patient, doctor, form, signed) {
  import('jspdf').then(({ default: jsPDF }) => {
    const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // Header
    doc.setFillColor(10,110,189);
    doc.rect(0,0,pageW,38,'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('MediHub Care Platform', margin, 14);
    doc.setFontSize(11); doc.setFont('helvetica','normal');
    doc.text('MEDICAL CERTIFICATE', margin, 23);
    doc.text(`Date: ${format(new Date(),'dd/MM/yyyy')}`, pageW-margin, 23, {align:'right'});
    doc.setFontSize(9); doc.text('CONFIDENTIAL', pageW-margin, 31, {align:'right'});
    y = 50;
    doc.setTextColor(26,43,60);

    const section = (num, label, value) => {
      if (y > 255) { doc.addPage(); y = 20; }
      doc.setFontSize(9.5); doc.setFont('helvetica','bold');
      doc.text(`${num}.`, margin, y);
      doc.text(label, margin+8, y);
      if (value) {
        doc.setFont('helvetica','normal');
        doc.setFillColor(248,251,255);
        const lines = doc.splitTextToSize(value, pageW-margin*2-12);
        doc.roundedRect(margin+6, y+2, pageW-margin*2-6, lines.length*5+4, 1.5, 1.5, 'F');
        doc.text(lines, margin+10, y+6);
        y += lines.length*5+10;
      } else { y += 8; }
    };

    section('1','Name of Patient', patient.name);
    section('2','Age', `${patient.age} years`);
    section('3','Usual Address of Residence', patient.address||'N/A');
    section('4','Date', format(new Date(),'dd/MM/yyyy'));
    section('5','Signs and Symptoms Observed by Medical Officer', form.signsSymptoms||'—');
    section('6',"Medical Officer's Opinion", form.medicalOpinion||'—');
    section('7',"Medical Officer's Recommendations", form.recommendations||'—');

    if (form.sickLeave) {
      if (y>250){doc.addPage();y=20;}
      doc.setFontSize(9.5); doc.setFont('helvetica','bold');
      doc.text('8.','Sick Leave', margin, y);
      doc.text('Sick Leave', margin+8, y); y+=6;
      doc.setFont('helvetica','normal');
      doc.setFillColor(248,251,255);
      doc.roundedRect(margin+6,y-2,pageW-margin*2-6,10,1.5,1.5,'F');
      doc.text(`${form.sickLeave} on ${form.sickLeaveDate}`, margin+10, y+4);
      y+=14;
    }

    if (y>250){doc.addPage();y=20;}
    doc.setFontSize(9.5); doc.setFont('helvetica','bold');
    doc.text('(a)', margin, y); doc.text('Is applicant fit for duty?', margin+10, y);
    doc.setFont('helvetica','normal'); doc.text(form.fitForDuty, pageW-margin-40, y); y+=7;
    if (form.fitForDuty!=='Yes'&&form.absencePeriod) {
      doc.setFont('helvetica','bold'); doc.text('(b)', margin, y); doc.text('Period of absence recommended:', margin+10, y); y+=6;
      doc.setFont('helvetica','normal'); doc.text(form.absencePeriod, margin+10, y); y+=10;
    }

    if (form.additionalNotes) {
      y+=4; doc.setFontSize(9.5); doc.setFont('helvetica','bold'); doc.text('Notes:', margin, y); y+=6;
      doc.setFont('helvetica','normal');
      const lines = doc.splitTextToSize(form.additionalNotes, pageW-margin*2);
      doc.text(lines, margin, y); y += lines.length*5+8;
    }

    // Signature block
    if (y>230){doc.addPage();y=20;}
    y = Math.max(y+16, 225);
    if (signed) {
      doc.setTextColor(10,110,189); doc.setFontSize(16); doc.setFont('helvetica','bolditalic');
      doc.text(doctor?.name||'', margin, y-8);
      doc.setTextColor(26,43,60);
    }
    doc.setDrawColor(180,200,220); doc.line(margin, y, margin+75, y);
    doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(26,43,60);
    doc.text('Signature of Medical Officer', margin, y+6);
    doc.setFont('helvetica','normal');
    doc.text(`Name: ${doctor?.name||''}`, margin, y+13);
    doc.text(`Rank/Designation: ${doctor?.specialty||'Medical Officer'}`, margin, y+20);
    doc.text(`Date: ${format(new Date(),'dd/MM/yyyy')}`, margin, y+27);

    // Footer
    const total = doc.internal.getNumberOfPages();
    for (let i=1;i<=total;i++) {
      doc.setPage(i);
      const fY = doc.internal.pageSize.getHeight()-10;
      doc.setFontSize(7.5); doc.setTextColor(160,180,200); doc.setFont('helvetica','normal');
      doc.text('MediHub Care Platform — Confidential Medical Document', margin, fY);
      doc.text(`Page ${i} of ${total}`, pageW-margin, fY, {align:'right'});
    }

    doc.save(`Medical_Certificate_${patient.name.replace(/\s+/g,'_')}_${format(new Date(),'yyyyMMdd')}.pdf`);
  });
}
