function Leaderboard({ leaderboard }) {
  return (
  <div
    style={{
      flex: 1,
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.1)"
    }}
  >
      <h2>Leaderboard</h2>

      {leaderboard.map((user, index) => (
        <div key={user.userId}>
          #{index + 1} | {user.email} | ₹{user.totalValue.toFixed(2)}
        </div>
      ))}
    </div>
  );
}

export default Leaderboard;