import React from 'react';

const CourseCard = ({ course, onClick }) => {
  return (
    <div 
      className="bg-black border border-[#00FF00]/20 hover:border-[#00FF00] transition-all cursor-pointer group font-mono overflow-hidden"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="w-full h-48 bg-gray-900 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
        <div className="absolute inset-0 bg-[#00FF00]/10 z-10 group-hover:bg-transparent"></div>
        {course.course_thumbnail || course.thumbnail ? (
          <img 
            src={course.course_thumbnail || course.thumbnail}
            alt={course.course_name || course.name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-[#00FF00] text-sm font-bold">[ENCRYPTED_IMG]</div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#00FF00] text-sm font-bold">
            [DATA_BLOCK]
          </div>
        )}
        {/* Hacker badge */}
        <div className="absolute top-2 right-2 bg-black/80 border border-[#00FF00] px-2 py-0.5 text-[8px] text-[#00FF00] z-20">
          NODE_{course.id?.toString().substring(0,4)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 border-t border-[#00FF00]/20">
        <h3 className="text-xs font-bold text-[#00FF00] mb-3 line-clamp-2 min-h-[32px] uppercase tracking-widest">
          {course.course_name || course.name}
        </h3>

        <div className="flex justify-between items-center mb-4 text-[10px]">
          <span className="text-[#00FF00]/60">VAL: FREE</span>
          <span className="text-[#00FF00]/60">SRC: PW_SERVER</span>
        </div>

        <button className="w-full bg-transparent border border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00] hover:text-black text-[10px] font-bold py-2 px-4 transition-all uppercase">
          INITIATE_DECRYPTION
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
