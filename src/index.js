import echarts from 'echarts';
import color from 'color';
import { 
    groupAccessor,
    firstYAxis,
    secondYAxis,
    firstYAxisColor,
    secondYAxisColor,
    firstDataAccessor, 
    secondDataAccessor, 
    getMetricTooltip, 
    getYAxisData,
    getYAxis 
} from './utils';

import './index.css';

/**
 * Global controller object is described on Zoomdata knowledge base
 * @see https://www.zoomdata.com/developers/docs/custom-chart-api/controller/
 */

/* global controller */

/**
 * @see http://www.zoomdata.com/developers/docs/custom-chart-api/creating-chart-container/
 */
const chartContainer = document.createElement('div');
chartContainer.classList.add('chart-container');
controller.element.appendChild(chartContainer);

// Dynamic the splitNumber to avoid overlap
echarts.registerProcessor(ecModel => {
    ecModel.findComponents({ mainType: 'yAxis' }).map(component => {
        const defaultSplitNumber = 5;
        const ratio = Math.floor(component.axis.grid.getRect().height / (defaultSplitNumber * component.getTextRect('0').height));
        if (ratio < 1) component.option.axisLabel.show = false;
        else {
            component.option.splitNumber = ratio;
            component.option.axisLabel.show = true;
        }
    });
});

const lineBar = echarts.init(chartContainer);

const option = {
    textStyle: {
        fontFamily: 'Source Pro, source-sans-pro,' +
        ' Helvetica, Arial, sans-serif',
        fontSize: '14',
        fontWeight: 'normal',
        fontStyle: 'normal'
    },
    grid: {
        left: 35,
        top: 30,
        right: 35,
        bottom: 20,
    },
    xAxis: {
        type: 'category',
        axisPointer: {
            show: true,
            type: 'line',
            label: {
                show: false,
            },
            lineStyle: {
                color: color(controller.variables[firstYAxisColor]).darken(.1).hex(),
                width: 2,
                type: 'solid',
            }
        },
        splitLine: {
            show: true,
        },
        axisLine: {
            lineStyle: {
                width: 2,
            }
        },
    },
    yAxis: [
        getYAxis(controller.variables[firstYAxisColor], 'Bar'),
        getYAxis(controller.variables[secondYAxisColor], 'Line')
    ],
    series: [{
            type: 'bar',
            itemStyle: {
                color: controller.variables[firstYAxisColor],
            }
        },
        {
            type: 'line',
            yAxisIndex: 1,
            itemStyle: {
                color: controller.variables[secondYAxisColor],
            }
        },
    ]
}

/**
 * @see http://www.zoomdata.com/developers/docs/custom-chart-api/updating-queries-axis-labels/
 */
controller.createAxisLabel({
    picks: groupAccessor,
    orientation: 'horizontal',
    position: 'bottom',
    popoverTitle: 'Trend',
});

controller.createAxisLabel({
    picks: firstYAxis,
    orientation: 'vertical',
    position: 'left',
});

controller.createAxisLabel({
    picks: secondYAxis,
    orientation: 'vertical',
    position: 'right',
});

controller.resize = () => lineBar.resize();

/**
 * @see http://www.zoomdata.com/developers/docs/custom-chart-api/receiving-chart-data/
 */
controller.update = data => {
    option.xAxis.data = data.map(datum => controller.dataAccessors[groupAccessor].format(_.first(datum.group)));
    _.first(option.series).data = getYAxisData(data, firstDataAccessor.getMetric());
    _.last(option.series).data = getYAxisData(data, secondDataAccessor.getMetric());
    lineBar.setOption(option);
};

// Tooltip
lineBar.on('mousemove', params => {
    if (params && params.data && _.isObject(params.data.datum)) {
        controller.tooltip.show({
            x: params.event.event.clientX,
            y: params.event.event.clientY,
            content: () => {
                return getMetricTooltip(params);
            }
        });
    }
});

lineBar.on('mouseout', () => {
    controller.tooltip.hide();
});

// Menu bar
lineBar.on('click', params => {
    controller.tooltip.hide();
    controller.menu.show({
        x: params.event.event.clientX,
        y: params.event.event.clientY,
        data: () => params.data.datum,
    });
});

console.log(lineBar);