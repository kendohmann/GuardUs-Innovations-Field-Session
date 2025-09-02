export default function TopBar() {
  return (
    <div className="top">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <strong>GuardUs Admin</strong>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>

        <a className="btn" href="#help">
          Help
        </a>
      </div>
    </div>
  );
}
