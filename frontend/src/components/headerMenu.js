import React from 'react';
import { Tooltip } from 'react-tooltip';


function HeaderMenu() {
    // const [pageTitle, setPageTitle] = useState(null);
    // useEffect(() => {
    //   document.title = pageTitle;
    // }, [pageTitle]);
    
    const updateTitle = (title) => {
      // setPageTitle(title);
      document.title = title;
    };

  

    return (
      <aside className="bg-discordAlmostBlack h-screen p-2 rounded top-0 left-0 shadow-md">
      {/* Logo */}
      <div className="text-center  font-bold text-discordPurple mb-8 ">
        <a href="/home"><i className=" text-2xl bi bi-bar-chart-line-fill"></i><br/>Tradex</a>
      </div>
      {/* Navigation Menu */}
      <nav>
        <ul className="space-y-8 text-center">
          <li><a data-tooltip-id="tooltip_0" data-tooltip-content="Home" onClick={updateTitle("Tradex | Home")} href="/home" className="text-2xl text-gray-300 hover:text-discordPurple p-4 rounded hover:bg-discordDarkGray"><i class="bi bi-house-door-fill"></i></a></li>
          <li><a data-tooltip-id="tooltip_1" data-tooltip-content="Charts" onClick={updateTitle("Tradex | Charts")} href="/charts" className="text-2xl text-gray-300 hover:text-discordPurple p-4 rounded hover:bg-discordDarkGray"><i class="bi bi-file-earmark-bar-graph-fill"></i></a></li>
          <li><a data-tooltip-id="tooltip_2" data-tooltip-content="Trading View" onClick={updateTitle("Tradex | Trading View")} href="/tradingView" className="text-2xl text-gray-300 hover:text-discordPurple p-4 rounded hover:bg-discordDarkGray"><i class="bi bi-graph-up"></i></a></li>
          {Array.from({ length: 3 }, (_, index) => (
            <Tooltip className="z-[999] shadow" key={`tooltip_${index}`} id={`tooltip_${index}`} />
          ))}
        </ul>
      </nav>
    </aside>
    );
}

export default HeaderMenu;