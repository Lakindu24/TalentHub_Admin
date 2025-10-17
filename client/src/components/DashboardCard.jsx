const DashboardCard = ({ title, count, color, icon }) => {
  return (
    <div className={`p-6 rounded-2xl shadow-lg border border-gray-200 bg-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
        </div>
        <div className={`p-4 rounded-full bg-opacity-10 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
