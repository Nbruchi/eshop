import Breadcrumb from 'apps/admin-ui/src/components/Breadcrumb';
import React from 'react';

const Notifications = () => {
  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">Notifications</h2>
      <Breadcrumb title="Notifications" />
      <p className="text-center pt-24 text-white text-sm font-poppins">
        No notifications available yet!
      </p>
    </div>
  );
};

export default Notifications;
