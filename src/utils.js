import visualization from '../visualization.json';

export const groupAccessor = visualization.variables[4].name
export const firstYAxis = visualization.variables[0].name;
export const secondYAxis = visualization.variables[2].name;
export const firstYAxisColor = visualization.variables[1].name;
export const secondYAxisColor = visualization.variables[3].name;
export const firstDataAccessor = controller.dataAccessors[firstYAxis];
export const secondDataAccessor= controller.dataAccessors[secondYAxis];

const getTableRow = (label, value, color='') => `<div class="zd_tooltip_info_table_row"><div class="zd_tooltip_info_table_row_label">${label}</div><div class="zd_tooltip_info_table_row_value">${color} ${value}</div></div>`;

/**
 * Get Trend Attribute label
 */
const getGeneralLabel = () => {
    const accessor = controller.dataAccessors[groupAccessor];
    const accessorGroup = accessor.getGroup();
    return `${accessorGroup.label} ${accessor._timeZoneId} (${accessorGroup.func})`;
}

/**
 * Get tooltip for Y Axis
 * @param {Object} params 
 * @param {Object} compareName 
 */
const getYAxisTooltip = (params, accessor, compareName=null) => {
    const metric = accessor.getMetric();
    if (metric.name !== 'count' && metric.name !== compareName) {
        return `<div class="zd_tooltip_info_table_row">${getTableRow(`${metric.label} (${metric.func})`, `${accessor.formatted(params.data.datum)}`)}</div>`
    }
    return '';
}

const getMetric = params => {
    if (_.has(params, 'data.datum.current.count')) {
        // Color always put before Volumen value
        const color = `<div class="color_icon active" style="background-color: ${params.color};"></div>`;
        const firstAccessorRow = getYAxisTooltip(params, firstDataAccessor);
        const secondAccessorRow = getYAxisTooltip(params, secondDataAccessor, firstDataAccessor.getMetric().name);
        return `<div class="zd_tooltip_info_table_row">${getTableRow('Volume', `${params.data.datum.current.count}`, color)}</div>${firstAccessorRow}${secondAccessorRow}`;
    }
    return '';
}

const getNormalMetricData = data => data.map(datum => ({ value: datum.current.count, datum }));

/**
 * Format number to k, M, G (thousand, Million)
 * @param {Number} number 
 * @param {Number} digits 
 */
const SIFormat = (number, digits=0) => {
    const codeTable = ['p', 'n', 'u', 'm', '', 'k', 'M', 'G', 'T'];
    const [exponentialNumber, exponential] = number.toExponential(digits).split('e+');
    const index = Math.floor(_.parseInt(exponential) / 3);
    return exponentialNumber * Math.pow(10, _.parseInt(exponential) - index * 3) + codeTable[index + 4];
}

export const getMetricTooltip = params => {
    if (params && _.has(params, 'name') && _.has(params, 'color') && _.has(params, 'data.value')) {
        const label = getGeneralLabel();
        const metric = getMetric(params);
        return `<div class="zd_tooltip_info_group customized"><div class="zd_tooltip_info_table"><div class="zd_tooltip_info_table_row">${getTableRow(label, params.name)}</div>${metric}</div></div>`;
    }
    return '';
};

export const getYAxisData = (data, metric) => {
    if (metric.name != visualization.variables[0].defaultValue[0].name) {
        return data.map(datum => ({ value: datum.current.metrics[metric.name][metric.func], datum }));
    }
    return getNormalMetricData(data);
}

export const getYAxis = (color, name) => ({
        type: 'value',
        name,
        axisLine: {
            lineStyle: {
                color: color,
                width: 2,
            }
        },
        axisLabel: {
            color: '#000',
            formatter: value => SIFormat(value, 2),
        },
        axisTick: {
            show: false,
        }
});