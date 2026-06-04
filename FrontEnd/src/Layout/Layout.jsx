import React from 'react';
import Header from './Header/Header.jsx';
import Nav from './Nav/Nav.jsx';
import Footer from './Footer/Footer.jsx';
import { Outlet } from 'react-router-dom';

import './Layout.css';


const Layout = () => {
    return (
        <div className='flex w-full h-full'>
            <div className='h-screen fixed max-w-64'><Nav></Nav></div>
            <div className='flex flex-col w-full min-h-screen content p-4'>
                <div className='header'><Header></Header></div>
                <div className='outlet w-full'><Outlet /></div>
                <div className='footer'><Footer></Footer></div>
            </div>
            </div>
    );
}

export default Layout;
