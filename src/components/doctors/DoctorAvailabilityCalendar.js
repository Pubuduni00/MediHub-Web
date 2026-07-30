import React, { useState } from 'react';
import { X, Check, Plus, Trash2 } from 'lucide-react';
import { format, isToday } from 'date-fns';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const DoctorAvailabilityCalendar = ({ doctorId, doctorName, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [saving, setSaving] = useState(false);

  // Check if a time slot is in the past (only when today is selected)
  const isPastTimeSlot = (timeStr) => {
    if (!isToday(selectedDate)) return false;
    const now = new Date();
    const [slotH, slotM] = timeStr.split(':').map(Number);
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    if (slotH < currentH) return true;
    if (slotH === currentH && slotM < currentM) return true;
    return false;
  };

  const getInitialRanges = () => {
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    
    // Find next 15-minute slot from now
    let startHour = currentH;
    let startMin = Math.ceil(currentM / 15) * 15;
    if (startMin >= 60) {
      startHour += 1;
      startMin = 0;
    }
    
    if (startHour >= 24) {
      // Very late at night (after 23:45)
      return [{ start: '23:45', end: '23:59' }];
    }
    
    const startStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
    
    let endHour = startHour + 1;
    let endMin = startMin;
    if (endHour >= 24) {
      endHour = 23;
      endMin = 59;
    }
    const endStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    
    return [{ start: startStr, end: endStr }];
  };

  const [ranges, setRanges] = useState(getInitialRanges());

  // Generate 15 min intervals for dropdowns covering 24h
  const generateDropdownTimes = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);
      }
    }
    times.push('23:59'); // Include end of the 24-hour day
    return times;
  };

  const allTimeSlots = generateDropdownTimes();

  const handleAddRange = () => {
    let startStr = '13:00';
    let endStr = '17:00';
    
    if (ranges.length > 0) {
      const lastRange = ranges[ranges.length - 1];
      startStr = lastRange.end;
      const [h, m] = startStr.split(':').map(Number);
      let endH = h + 1;
      let endM = m;
      if (endH >= 24) {
        endH = 23;
        endM = 59;
      }
      endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    }
    
    // If today is selected, ensure it is in the future
    if (isToday(selectedDate)) {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const [sh, sm] = startStr.split(':').map(Number);
      if (sh < currentH || (sh === currentH && sm < currentM)) {
        let startHour = currentH;
        let startMin = Math.ceil(currentM / 15) * 15;
        if (startMin >= 60) {
          startHour += 1;
          startMin = 0;
        }
        if (startHour >= 24) {
          startHour = 23;
          startMin = 45;
        }
        startStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
        
        let endHour = startHour + 1;
        let endMin = startMin;
        if (endHour >= 24) {
          endHour = 23;
          endMin = 59;
        }
        endStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      }
    }
    
    setRanges([...ranges, { start: startStr, end: endStr }]);
  };

  const handleRemoveRange = (index) => {
    setRanges(ranges.filter((_, i) => i !== index));
  };

  const handleRangeChange = (index, field, value) => {
    const newRanges = [...ranges];
    newRanges[index][field] = value;
    
    // If we changed the start time and it is now >= the end time, let's adjust the end time
    if (field === 'start') {
      const startIndex = allTimeSlots.indexOf(value);
      const endIndex = allTimeSlots.indexOf(newRanges[index].end);
      if (startIndex >= endIndex) {
        // Set end time to next slot after start time, or 23:59
        if (startIndex + 4 < allTimeSlots.length) {
          // Default to start + 1 hour (4 slots of 15 min)
          newRanges[index].end = allTimeSlots[startIndex + 4];
        } else {
          newRanges[index].end = allTimeSlots[allTimeSlots.length - 1]; // 23:59
        }
      }
    }
    
    setRanges(newRanges);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const slotTimes = [];
      
      for (const range of ranges) {
        const startIndex = allTimeSlots.indexOf(range.start);
        const endIndex = allTimeSlots.indexOf(range.end);
        
        if (startIndex >= endIndex) {
          alert("End time must be after start time for all ranges");
          setSaving(false);
          return;
        }

        // Generate the 15-min slots for the backend automatically
        for (let i = startIndex; i < endIndex; i++) {
          const slotTime = allTimeSlots[i];
          if (isToday(selectedDate) && isPastTimeSlot(slotTime)) {
            alert(`Time slot ${slotTime} is in the past and cannot be selected.`);
            setSaving(false);
            return;
          }
          if (!slotTimes.includes(slotTime)) {
            slotTimes.push(slotTime);
          }
        }
      }

      if (slotTimes.length === 0) {
        alert("Please add at least one valid time range.");
        setSaving(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/doctors/${doctorId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formattedDate,
          slots: slotTimes
        })
      });

      if (response.ok) {
        alert('Availability saved successfully!');
        onClose();
      } else {
        alert('Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-content" style={{ background: '#ffffff', maxWidth: '550px', width: '90%', padding: 0, borderRadius: '12px', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', position: 'relative' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Set Availability</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            {doctorName}
          </p>
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: '#334155' }}>
              Date
            </label>
            <input 
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const val = e.target.value;
                if (val) setSelectedDate(parseLocalDate(val));
              }}
              min={format(new Date(), 'yyyy-MM-dd')}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', fontSize: '15px' }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', color: '#334155' }}>
              Time Ranges
            </label>
          </div>
          
          {ranges.map((range, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <select 
                  value={range.start} 
                  onChange={e => handleRangeChange(index, 'start', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', fontSize: '15px' }}
                >
                  {allTimeSlots.filter(t => t !== '23:59').map(t => (
                    <option key={`start-${t}`} value={t} disabled={isPastTimeSlot(t)}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>to</div>
              <div style={{ flex: 1 }}>
                <select 
                  value={range.end} 
                  onChange={e => handleRangeChange(index, 'end', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', fontSize: '15px' }}
                >
                  {allTimeSlots.map(t => (
                    <option key={`end-${t}`} value={t} disabled={isPastTimeSlot(t) || allTimeSlots.indexOf(t) <= allTimeSlots.indexOf(range.start)}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              
              {ranges.length > 1 ? (
                <button 
                  onClick={() => handleRemoveRange(index)}
                  style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove range"
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <div style={{ width: '36px' }}></div> /* Placeholder to keep alignment */
              )}
            </div>
          ))}

          <button 
            onClick={handleAddRange}
            style={{ background: 'transparent', color: '#2563eb', border: '1px dashed #cbd5e1', width: '100%', padding: '10px', borderRadius: '6px', fontWeight: 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}
          >
            <Plus size={16} /> Add another time range
          </button>
          
          <p style={{ marginTop: '24px', fontSize: '13px', color: '#64748b', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            The time ranges you select will automatically be divided into 15-minute booking slots for patients.
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#fafafa' }}>
          <button 
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', justifyContent: 'center', background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Check size={18} /> {saving ? 'Saving...' : 'Save Availability Ranges'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DoctorAvailabilityCalendar;
