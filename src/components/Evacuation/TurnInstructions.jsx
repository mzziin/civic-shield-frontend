import React from 'react';
import './TurnInstructions.css';

function TurnInstructions({ instructions, currentInstructionIndex = 0 }) {
  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };
  
  if (!instructions || instructions.length === 0) {
    return null;
  }
  
  return (
    <div className="turn-instructions">

      
      <div className="turn-instructions-list">
      
        {instructions.map((instruction, index) => {
          const isCurrent = index === currentInstructionIndex;
          const isPast = index < currentInstructionIndex;
          
          return (
            <div
              key={index}
              className={`turn-instruction-item ${
                isCurrent ? 'current' : isPast ? 'past' : 'upcoming'
              }`}
            >
              <div className="turn-instruction-content">
                <div className={`turn-number ${isCurrent ? 'current' : isPast ? 'past' : 'upcoming'}`}>
                  {index + 1}
                </div>
                
                <div className="turn-instruction-details">
                  <p className={`turn-instruction-text ${isCurrent ? 'current-text' : ''}`}>
                    {instruction.instruction}
                  </p>
                  <p className="turn-instruction-meta">
                    {formatDistance(instruction.distance)}
                    {instruction.name && ` • ${instruction.name}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TurnInstructions;
