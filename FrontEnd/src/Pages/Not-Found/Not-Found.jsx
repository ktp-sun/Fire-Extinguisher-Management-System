import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className='h-screen flex w-full flex-col bg-white justify-center items-center gap-2'>
            <h1>404</h1>
            <h4 className='text-secondary font-bold'>Page is not found</h4>
            <button className='text-white bg-primary hover:bg-secondary focus:ring-4 focus:outline-none focus:ring-primary font-medium rounded-lg text-sm px-5 py-2.5 text-center' onClick={() => navigate('/login')}>Login</button>
        </div>
    );
}

export default NotFound;
