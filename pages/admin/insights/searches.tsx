import React, { useEffect, useState } from 'react';

function SearchChart() {
  const [chartInitialized, setChartInitialized] = useState(false); // Flag to track chart initialization

  useEffect(() => {
    if (chartInitialized) {
      // Prevent re-initialization if the chart is already initialized
      return;
    }

    let chart; // Variable to hold the chart instance for cleanup

    // Dynamically import ApexCharts only on the client-side to avoid "window is not defined" error
    import('apexcharts').then((ApexCharts) => {
      const el = document.querySelector('#chart-search');
      if (el) {
        chart = new ApexCharts.default(el, {
          chart: {
            type: "area",
            fontFamily: 'inherit',
            height: 400,
            parentHeightOffset: 0,
            toolbar: {
              show: true,
            },
            animations: {
              enabled: false,
            },
          },
          fill: {
            opacity: 0.5,
          },
          stroke: {
            width: 0.5,
            lineCap: "round",
            curve: "straight",
          },
          series: [ {
            name: "Searches",
            data: [5000, 5200, 5500, 5300, 5700, 5900, 6100, 6300, 6600, 6800, 7500, 8000]
          },],
          tooltip: {
            theme: 'light',
            marker: {
              show: false,
            },
            x: {
              format: 'dd MMM yyyy',
            },
          },
          grid: {
            padding: {
              top: -20,
              right: 0,
              left: -4,
              bottom: -4,
            },
            strokeDashArray: 10,
          },
          xaxis: {
            labels: {
              padding: 0,
            },
            tooltip: {
              enabled: false,
            },
            type: 'datetime',
          },
          yaxis: {
            labels: {
              padding: 4,
            },
          },
          labels: [
            '2024-02-19', '2024-02-20', '2024-02-21', '2024-02-22', '2024-02-23', '2024-02-24', '2024-02-25', '2024-02-26', '2024-02-27', '2024-02-28', '2024-02-29', '2024-02-30',
          ],
          colors: ["#0000ff"],
          legend: {
            show: true,
            position: 'bottom',
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
        });

        // Render the chart
        chart.render();
        setChartInitialized(true); // Mark the chart as initialized
      }
    }).catch(err => console.error("Error loading ApexCharts", err));

    // Cleanup function to destroy the chart instance when the component unmounts
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [chartInitialized]); // Depend on the chartInitialized flag

  let count = 0;
  return (
    
    <div className="card flex flex-col gap-5 border p-5 rounded-xl hover:shadow-lg bg-background">
        <div className='flex flex-col gap-2'>
            <h1 className="card-title font-semibold text-xl">Searches</h1>
            <p className="text-sm text-gray-500">Day-over-day</p>
        </div>
        
        <div className="card-body">
          {count === 0 && (
            <div id="chart-search" className="chart-xl"></div>
            
          )}
        </div>
    </div>
  );
};

export default SearchChart;