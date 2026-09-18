import './Card.css';

export default function Card({ color, value }) {
  return (
    <div 
      className="uno-card"
      style={{ backgroundColor: color === 'black' ? '#333' : (color || '#e0e0e0') }}
    >
      {value || '?'}
    </div>
  );
}