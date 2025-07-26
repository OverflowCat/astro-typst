import React, { useState } from "react";
import Confetti from "react-confetti-explosion";

export default () => {
  const [isConfettiRunning, setIsConfettiRunning] = useState(false);
  return (
    <div>
      <button
        disabled={isConfettiRunning}
        onClick={() => {
          setIsConfettiRunning(!isConfettiRunning)
        }}
      >
        Click to trigger Confetti!
      </button>
      {isConfettiRunning && (
        <Confetti onComplete={() => setIsConfettiRunning(false)} />
      )}
    </div>
  );
};
