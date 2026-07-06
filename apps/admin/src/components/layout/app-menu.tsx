'use client';

import menuData from '@/config/menu.json';
import AppMenuitem from './app-menuitem';

const AppMenu = () => {
  return (
    <ul className="m-0 p-0 list-none select-none">
      {menuData.map((item, index) => (
        <AppMenuitem key={`${item.label}-${index}`} item={item} index={index} />
      ))}
    </ul>
  );
};

export default AppMenu;
