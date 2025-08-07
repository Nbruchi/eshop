'use client';

import { Props } from 'react-apexcharts';

const SalesChart = ({
  ordersData,
}: {
  ordersData?: { month: string; count: number }[];
}) => {
  const chartSeries: Props['series'] = [
    {
      name: 'Sales',
      data: ordersData,
    },
  ];

  return <div></div>;
};

export default SalesChart;
