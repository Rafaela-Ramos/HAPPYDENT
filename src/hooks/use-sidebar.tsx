import { useState, useEffect } from 'react';

export const useSidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    // Update CSS variable for sidebar width
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '4rem' : '16rem');
  }, [collapsed]);

  // Set initial CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '4rem' : '16rem');
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return {
    collapsed,
    toggleSidebar,
    sidebarWidth: collapsed ? '4rem' : '16rem'
  };
};