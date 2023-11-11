import React from 'react';

function HeaderMenu() {
    return (
      <aside className="bg-discordAlmostBlack h-screen p-2 rounded top-0 left-0 shadow-md">
      {/* Logo */}
      <div className="text-center  font-bold text-discordPurple mb-8 ">
        <a href="/home"><i className=" text-2xl bi bi-bar-chart-line-fill"></i><br/>Tradex</a>
      </div>
      {/* Navigation Menu */}
      <nav>
        <ul className="space-y-8 text-center">
          <li><a href="/home" className="text-2xl text-gray-300 hover:text-discordPurple p-4 rounded hover:bg-discordDarkGray"><i class="bi bi-house-door-fill"></i></a></li>
          <li><a href="/charts" className="text-2xl text-gray-300 hover:text-discordPurple p-4 rounded hover:bg-discordDarkGray"><i class="bi bi-file-earmark-bar-graph-fill"></i></a></li>
        </ul>
      </nav>
    </aside>
    );
}

export default HeaderMenu;