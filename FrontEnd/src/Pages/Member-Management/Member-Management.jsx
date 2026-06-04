import React from 'react';
import MemberManagementAdmin from './Member-Management-Admin';
import MemberManagementSuperMember from './Member-Management-SuperMember';
import { useAuth } from '../../Auth/AuthProvider';

const MemberManagement = () => {
    const {user} = useAuth();

    switch (user.role) {
        case "Super Admin":
            return <MemberManagementAdmin />;
        case "Admin":
            return <MemberManagementAdmin />;
        case "Super Member":
            return <MemberManagementSuperMember />;
        default:
            return null
    };
}

export default MemberManagement;
