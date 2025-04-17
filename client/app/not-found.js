import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '0 1rem'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>404 - Page Not Found</h1>
      <p style={{marginBottom: '1.5rem'}}>The page you are looking for does not exist.</p>
      <Link
        href="/"
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '0.25rem',
          textDecoration: 'none'
        }}
      >
        Return to Home
      </Link>
    </div>
  );
} 