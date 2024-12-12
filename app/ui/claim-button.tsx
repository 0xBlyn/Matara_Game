import React from 'react';

interface ClaimButtonProps {
  onClick?: () => void;
  className?: string;
  content: React.ReactNode;
}

const ClaimButton: React.FC<ClaimButtonProps> = ({ onClick, className = '', content }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative
        w-full
        max-w-md
        py-3
        px-8
        rounded-xl
        bg-gradient-to-r
        from-[#FFB939]
        to-[#FFD683]
        text-black
        text-2xl
        font-black
        font-['Impact']
        tracking-wide
        shadow-[0_4px_15px_rgba(255,195,105,0.25)]
        transition-transform
        duration-200
        hover:scale-[0.98]
        active:scale-95
        overflow-hidden
        ${className}
      `}
    >
      <span >{content}</span>
      <span 
        className="
          absolute 
          inset-0 
          rounded-xl
          bg-gradient-to-r 
          from-[#FFD683] 
          to-[#FFB948]
          opacity-0
          transition-opacity
          duration-200
          hover:opacity-100
        "
      />
      <span 
        className="
          absolute 
          inset-0 
          rounded-xl
          border-2
          border-transparent
          bg-clip-padding
          box-decoration-clone
        "
        style={{
          background: 'linear-gradient(90deg, #FFD683 0%, #FFB948 100%) border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
    </button>
  );
};

export default ClaimButton;

