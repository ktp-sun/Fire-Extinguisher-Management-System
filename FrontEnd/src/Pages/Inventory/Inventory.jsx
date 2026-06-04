import React from 'react';
import { useAuth } from '../../Auth/AuthProvider';

// import InventorySAdmin from './Inventory-SAdmin';
import InventoryAdmin from './Inventory-Admin';
import InventoryWorker from './Inventory-Worker';
import InventorySuperMember from './Inventory-SuperMember';
import InventoryMember from './Inventory-Member';


const Inventory = () => {
    const { user } = useAuth();

    switch (user.role) {
        case "Super Admin":
            return <InventoryAdmin />;
        case "Admin":
            return <InventoryAdmin />;
        case "Worker":
            return <InventoryWorker />;
        case "Super Member":
            return <InventorySuperMember />;
        case "Member":
            return <InventoryMember />;
        default:
            return null
    };
}

export default Inventory;
