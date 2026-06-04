import React from 'react';
import { useAuth } from '../../Auth/AuthProvider';

import DashboardSuperAdmin from './Dashboard-SuperAdmin';
import DashboardAdmin from './Dashboard-Admin';
import DashboardWorker from './Dashboard-Worker';
import DashboardSuperMember from './Dashboard-SuperMember';
import DashboardMember from './Dashboard-Member';

const Dashboard = () => {
    const { user } = useAuth();

    switch (user.role) {
        case "Super Admin":
            return <DashboardAdmin />;
        case "Admin":
            return <DashboardAdmin />;
        case "Worker":
            return <DashboardWorker />;
        case "Super Member":
            return <DashboardSuperMember />;
        case "Member":
            return <DashboardMember />;
        default:
            return null
    };
}

export default Dashboard;
