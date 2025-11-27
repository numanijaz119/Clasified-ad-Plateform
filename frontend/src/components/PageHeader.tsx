import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon?: LucideIcon; // Lucide icon component
  title: string;
  description?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="mb-4">
      <div className="flex items-center mb-1">
        {/* Back Button */}
        <Link to="/" className="mr-2 p-1 rounded-full hover:bg-gray-100 text-gray-600">
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Link>

        {/* Icon + Title */}
        <div className="flex items-center">
          {Icon && <Icon className="h-5 w-5 md:h-6 md:w-6 text-orange-500 mr-2" />}

          <h1 className="text-lg md:text-2xl font-semibold md:font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      {description && (
        <p className="text-xs md:text-sm text-gray-600 leading-tight ml-7 md:ml-[2.4rem]">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;
