import React from "react";
import { Users } from "lucide-react";

const UsersTab: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Users Management
      </h3>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
};

export default UsersTab;
