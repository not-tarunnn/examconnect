import React from 'react';
import Link from 'next/link';

const headerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0)', // transparent white
  backdropFilter: 'blur(10px)',
  padding: '1rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 1000,
};

export default function Header() {
  return (
    <header style={headerStyle}>
      <div>
        <Link
          href="/"
          style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#333', textDecoration: 'none' }}
        >
          ExamConnect
        </Link>
      </div>
      <nav>
        <Link href="/dashboard" style={{ marginRight: '1rem' }}>
          Dashboard
        </Link>
        <Link href="/profile" style={{ marginRight: '1rem' }}>
          Profile
        </Link>
        <Link href="/settings">
          Settings
        </Link>
      </nav>
    </header>
  );
}
