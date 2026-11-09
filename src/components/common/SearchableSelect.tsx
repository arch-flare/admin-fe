'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

interface Props {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    required?: boolean;
    name?: string;
}

/**
 * A select that stays inside its container on any screen size: the list is a
 * scrollable panel capped to the viewport, with a search box, instead of the
 * browser's native popup (unusable and clipped with ~130 options).
 */
const SearchableSelect: React.FC<Props> = ({
    options,
    value,
    onChange,
    placeholder = 'Select',
    searchPlaceholder = 'Search...',
    required,
    name,
}) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selected = options.find(o => o.value === value);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
    }, [options, query]);

    useEffect(() => {
        const onDown = (e: MouseEvent | TouchEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('touchstart', onDown);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('touchstart', onDown);
        };
    }, []);

    useEffect(() => {
        if (open) {
            setQuery('');
            setActive(Math.max(0, options.findIndex(o => o.value === value)));
            setTimeout(() => searchRef.current?.focus(), 0);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Escape closes the list wherever focus is (not only inside the search box)
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    useEffect(() => setActive(0), [query]);

    useEffect(() => {
        listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
    }, [active, open]);

    const choose = (v: string) => {
        onChange(v);
        setOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[active]) choose(filtered[active].value);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div ref={rootRef} className="relative w-full">
            {/* Hidden input keeps native "required" validation working */}
            <input
                tabIndex={-1}
                aria-hidden="true"
                name={name}
                required={required}
                value={value}
                onChange={() => {}}
                className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
            />
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between gap-3 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-left text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
                <span className={`truncate ${selected ? '' : 'text-body dark:text-bodydark'}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <svg
                    className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded border border-stroke bg-white shadow-lg dark:border-form-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke p-2 dark:border-form-strokedark">
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder={searchPlaceholder}
                            className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-primary dark:border-form-strokedark dark:text-white"
                        />
                    </div>
                    <ul
                        ref={listRef}
                        role="listbox"
                        className="max-h-[50vh] overflow-y-auto overscroll-contain py-1 sm:max-h-64"
                    >
                        {filtered.length === 0 && (
                            <li className="px-4 py-3 text-sm text-body dark:text-bodydark">No matches</li>
                        )}
                        {filtered.map((o, i) => (
                            <li
                                key={o.value}
                                role="option"
                                aria-selected={o.value === value}
                                onMouseEnter={() => setActive(i)}
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => choose(o.value)}
                                className={`cursor-pointer break-words px-4 py-2.5 text-sm text-black dark:text-white ${
                                    i === active ? 'bg-gray-2 dark:bg-meta-4' : ''
                                } ${o.value === value ? 'font-medium text-primary' : ''}`}
                            >
                                {o.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
