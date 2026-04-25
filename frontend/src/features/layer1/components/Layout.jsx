import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useJobSocket } from '../../jobs/hooks/useJobSocket';

const Layout = ({ children }) => {
  useJobSocket(); // Keeps job monitor socket alive globally across all dashboard pages

  return (
    <div className="layout-wrapper">
      <Header />
      <div className="layout-wrapper__body">
        <Sidebar />
        <main className="layout-wrapper__main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
