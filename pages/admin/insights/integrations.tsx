import React, { useEffect, useState } from 'react';

function IntegrationsBreakdown() {
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    if (chartLoaded) {
      // Prevent re-initialization if the chart is already initialized
      return;
    }

    let chart; // Variable to hold the chart instance for cleanup

      import('apexcharts').then((ApexCharts) => {
        const el = document.querySelector('#integrations-pie');
        if (el && !chartLoaded) {
          chart = new ApexCharts.default(el, {
            chart: {
              type: "donut",
              fontFamily: 'inherit',
              height: 300,
              sparkline: {
                enabled: true
              },
              animations: {
                enabled: false
              },
            },
            fill: {
              opacity: 0.9,
            },
            series: [44, 55, 12, 2, 10, 15, 18],
            labels: ["Asana", "Jira", "GitHub", "Google Drive", "Confluence", "Gmail", "Notion"],
            colors: ["#6c8e7e", "#0052cc", "#24292e", "#4285f4", "#172b4d", "#d44638", "#4d4d4d"],
            legend: {
              show: true,
              position: 'left',
              offsetY: 12,
              markers: {
                width: 10,
                height: 10,
                radius: 100,
              },
              itemMargin: {
                horizontal: 8,
                vertical: 8,
              },
            },
            tooltip: {
              theme: 'dark',
              fillSeriesColor: false,
            },
          });

          chart.render();
          setChartLoaded(true);
        }
      }).catch(err => console.error("Error loading ApexCharts", err));

      // Cleanup function to destroy the chart instance when the component unmounts
      return () => {
        if (chart) {
          chart.destroy();
        }
      };
    }, [chartLoaded]); // Depend on the chartInitialized flag

  let count = 0;
  return (
    <div className="card flex flex-col gap-5 border p-5 rounded-xl hover:shadow-lg flex-grow bg-background">
      <div className='flex flex-col gap-2 items-start'>
        <h1 className="card-title font-semibold text-xl">App Breakdown</h1>
        <p className="text-sm text-gray-500">Search distribution by apps</p>
      </div>
      <div className="card-body">
        {count === 0 && (
            <div id="integrations-pie" className="chart-lg"></div>
        )}
      </div>
    </div>
  );
};

export default React.memo(IntegrationsBreakdown);
