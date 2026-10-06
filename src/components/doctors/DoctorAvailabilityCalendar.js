import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Calendar, Clock, Edit2, List } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const DoctorAvailabilityCalendar = ({ doctorId, doctorName, onClose }) => {
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'saved'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allSavedSchedules, setAllSavedSchedules] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

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

  // Helper to group contiguous 15-min slots into time ranges
  const convertSlotsToRanges = (timeList) => {
    if (!timeList || timeList.length === 0) return [];
    const indices = timeList
      .map(t => allTimeSlots.indexOf(t))
      .filter(idx => idx !== -1)
      .sort((a, b) => a - b);

    if (indices.length === 0) return [];

    const result = [];
    let rangeStartIdx = indices[0];
    let prevIdx = indices[0];

    for (let i = 1; i < indices.length; i++) {
      const currentIdx = indices[i];
      if (currentIdx === prevIdx + 1) {
        prevIdx = currentIdx;
      } else {
        const startStr = allTimeSlots[rangeStartIdx];
        const endStr = allTimeSlots[prevIdx + 1] || allTimeSlots[allTimeSlots.length - 1];
        result.push({ start: startStr, end: endStr });
        rangeStartIdx = currentIdx;
        prevIdx = currentIdx;
      }
    }

    const startStr = allTimeSlots[rangeStartIdx];
    const endStr = allTimeSlots[prevIdx + 1] || allTimeSlots[allTimeSlots.length - 1];
    result.push({ start: startStr, end: endStr });

    return result;
  };

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

    let startHour = currentH;
    let startMin = Math.ceil(currentM / 15) * 15;
    if (startMin >= 60) {
      startHour += 1;
      startMin = 0;
    }

    if (startHour >= 24) {
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

  // Fetch ALL saved schedules across all dates for this doctor
  const fetchAllSavedSchedules = async () => {
    if (!doctorId) return;
    try {
      setLoadingSaved(true);
      const res = await fetch(`http://localhost:5000/api/doctors/${doctorId}/availability`);
      if (!res.ok) return;
      const data = await res.json();

      const groupedByDate = {};
      data.forEach(slot => {
        if (!groupedByDate[slot.date]) groupedByDate[slot.date] = [];
        groupedByDate[slot.date].push(slot.time);
      });

      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const formattedList = Object.keys(groupedByDate)
        .filter(d => d >= todayStr)
        .sort()
        .map(d => ({
          date: d,
          ranges: convertSlotsToRanges(groupedByDate[d]),
          totalSlots: groupedByDate[d].length
        }));

      setAllSavedSchedules(formattedList);
    } catch (err) {
      console.error('Error fetching all saved schedules:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchAllSavedSchedules();
  }, [doctorId]);

  // Fetch saved doctor availability for the selected date
  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    let isMounted = true;

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/doctors/${doctorId}/availability?date=${dateStr}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        if (!isMounted) return;

        if (data && data.length > 0) {
          const timeList = data.map(s => s.time);
          const grouped = convertSlotsToRanges(timeList);
          if (grouped.length > 0) {
            setRanges(grouped);
            return;
          }
        }
        setRanges(getInitialRanges());
      } catch (err) {
        console.error('Error fetching availability:', err);
        if (isMounted) setRanges(getInitialRanges());
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAvailability();
    return () => { isMounted = false; };
  }, [doctorId, selectedDate]);

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

    if (field === 'start') {
      const startIndex = allTimeSlots.indexOf(value);
      const endIndex = allTimeSlots.indexOf(newRanges[index].end);
      if (startIndex >= endIndex) {
        if (startIndex + 4 < allTimeSlots.length) {
          newRanges[index].end = allTimeSlots[startIndex + 4];
        } else {
          newRanges[index].end = allTimeSlots[allTimeSlots.length - 1];
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
        await fetchAllSavedSchedules();
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

  const handleDeleteDateSchedule = async (dateStr) => {
    if (!window.confirm(`Are you sure you want to clear availability for ${dateStr}?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${doctorId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, slots: [] })
      });
      if (response.ok) {
        await fetchAllSavedSchedules();
        if (format(selectedDate, 'yyyy-MM-dd') === dateStr) {
          setRanges(getInitialRanges());
        }
      }
    } catch (err) {
      console.error('Error clearing availability:', err);
    }
  };

  const handleEditSavedDate = (dateStr) => {
    setSelectedDate(parseLocalDate(dateStr));
    setActiveTab('add');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-content" style={{ background: '#ffffff', maxWidth: '600px', width: '92%', padding: 0, borderRadius: '12px', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px 24px', position: 'relative' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Set Doctor Availability</h2>
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

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 24px', background: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('add')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === 'add' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'add' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={15} /> Set / Edit Availability
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === 'saved' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'saved' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <List size={15} /> My Saved Schedules ({allSavedSchedules.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'add' ? (
          <div>
            <div style={{ padding: '24px' }}>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: '#334155' }}>
                  Select Date
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
                  Time Ranges {loading && <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>(Loading saved availability...)</span>}
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
                    <div style={{ width: '36px' }}></div>
                  )}
                </div>
              ))}

              <button
                onClick={handleAddRange}
                style={{
                  background: 'transparent',
                  color: '#2563eb',
                  border: '1px dashed #cbd5e1',
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '8px',
                  transition: 'all 0.2s ease-in-out'
                }}
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
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: saving ? '#93c5fd' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '15px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease, transform 0.1s ease'
                }}
              >
                <Check size={18} /> {saving ? 'Saving...' : 'Save Availability Ranges'}
              </button>
            </div>
          </div>
        ) : (
          /* SAVED SCHEDULES TAB */
          <div style={{ padding: '24px', maxHeight: '420px', overflowY: 'auto' }}>
            {loadingSaved ? (
              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Loading saved schedules...</p>
            ) : allSavedSchedules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                <Calendar size={36} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#334155', margin: 0 }}>No Availability Ranges Saved Yet</p>
                <p style={{ fontSize: '13px', margin: '6px 0 16px 0' }}>Switch to "Set / Edit Availability" tab to add time ranges for patients.</p>
                <button
                  onClick={() => setActiveTab('add')}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer' }}
                >
                  Add Time Ranges
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allSavedSchedules.map((item) => (
                  <div
                    key={item.date}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Calendar size={15} color="#2563eb" />
                        <span style={{ fontWeight: 600, fontSize: '14.5px', color: '#1e293b' }}>
                          {format(parseLocalDate(item.date), 'EEEE, dd MMMM yyyy')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {item.ranges.map((rg, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '12.5px',
                              fontWeight: 500
                            }}
                          >
                            <Clock size={12} /> {rg.start} - {rg.end}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleEditSavedDate(item.date)}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Edit this date's availability"
                      >
                        <Edit2 size={13} /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteDateSchedule(item.date)}
                        style={{
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          padding: '7px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete availability for this date"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorAvailabilityCalendar;
