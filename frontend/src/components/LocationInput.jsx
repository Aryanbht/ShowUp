import { useState, useRef, useEffect } from 'react';
import { INDIA_LOCATIONS } from '../data/indiaLocations';

export default function LocationInput({ value, onChange, required }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync if parent changes value externally
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // update parent immediately as user types
    setHighlighted(-1);

    if (val.trim().length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const lower = val.toLowerCase();
    const filtered = INDIA_LOCATIONS.filter(loc =>
      loc.toLowerCase().includes(lower)
    ).slice(0, 25);

    setSuggestions(filtered);
    setOpen(filtered.length > 0);
  };

  const select = (loc) => {
    setQuery(loc);
    onChange(loc);
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      select(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const clear = () => {
    setQuery('');
    onChange('');
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <span
          className="material-symbols-outlined"
          style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', fontSize: '18px',
            color: '#777', pointerEvents: 'none'
          }}
        >
          location_on
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="City or State in India"
          autoComplete="off"
          required={required}
          className="input-brutal w-full"
          style={{ paddingLeft: '38px', paddingRight: query ? '36px' : '12px' }}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            style={{
              position: 'absolute', right: '10px', top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', padding: '2px',
              display: 'flex', alignItems: 'center', color: '#999'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: '#FFFFFF', border: '2px solid #1A1A1A',
            boxShadow: '4px 4px 0px #1A1A1A',
            zIndex: 1000, borderRadius: '4px',
            maxHeight: '360px', overflowY: 'auto'
          }}
        >
          {suggestions.map((loc, i) => {
            const parts = loc.split(',');
            const city = parts[0]?.trim();
            const state = parts.slice(1).join(',').trim();
            const isHigh = i === highlighted;

            return (
              <button
                key={loc}
                type="button"
                onMouseDown={() => select(loc)}
                onMouseEnter={() => setHighlighted(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', textAlign: 'left', padding: '10px 14px',
                  background: isHigh ? '#F5F0FF' : 'transparent',
                  border: 'none', borderBottom: '1px solid #F0F0F0',
                  cursor: 'pointer', transition: 'background 0.1s'
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', color: '#7C3AED', flexShrink: 0 }}
                >
                  location_on
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#1A1A1A', fontFamily: 'monospace' }}>
                    {city}
                  </p>
                  {state && (
                    <p style={{ margin: 0, fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
                      {state}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
