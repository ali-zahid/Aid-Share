import './Header.css';

export default function Header() {
  return (
    <div className="header">
      <div className="brand">
        <div className="brand-mark">HH</div>
        <div className="brand-text">
          <h1>HELPING HAND</h1>
          <p>Post Generator</p>
        </div>
      </div>
      <div className="header-tagline">Fill in details → Download a ready-to-share image</div>
    </div>
  );
}
