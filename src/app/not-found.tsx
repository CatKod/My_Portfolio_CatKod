import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="about-scene">
      <header className="scene-head reveal">
        <p className="mono-label">404 — Page not found</p>
        <h1>404</h1>
        <p>Trang bạn tìm không tồn tại. Đã bị lạc giữa CatFolio.</p>
      </header>
      <div className="reveal" style={{ marginTop: 16 }}>
        <Link href="/" className="btn-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back home
        </Link>
      </div>
    </div>
  );
}