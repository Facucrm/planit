export default function Logo({ size = 32, light = false }) {
  const color = light ? '#FFFFFF' : '#1B2A4A';
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orbital Ring - Back part */}
      <path 
        d="M30 65C20 55 20 45 35 35C50 25 75 25 85 40" 
        stroke={color} 
        strokeWidth="6" 
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Main P Shape */}
      <path 
        d="M40 85V25C40 16.7157 46.7157 10 55 10H70C78.2843 10 85 16.7157 85 25V45C85 53.2843 78.2843 60 70 60H40L35 75L40 85" 
        stroke={color} 
        strokeWidth="8" 
        strokeLinejoin="round"
      />
      
      {/* Planet (Inside P) */}
      <circle cx="62" cy="35" r="12" fill={color} />
      
      {/* Orbital Ring - Front part */}
      <path 
        d="M25 55C15 65 35 75 60 60C85 45 95 35 85 25" 
        stroke={color} 
        strokeWidth="6" 
        strokeLinecap="round"
      />
    </svg>
  );
}
