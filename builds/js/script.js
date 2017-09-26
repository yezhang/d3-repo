var sumOfMonth = [
    101,
    305,
    198,
    389,
    170,
    800,
    300,
    312,
    155,
    289,
    110,
    190
];

var redSumOfMonth = [
    100,
    520,
    158,
    300,
    208,
    500,
    89,
    71,
    666,
    100,
    340,
    123
];

var margin = {
    top: 30,
    right: 50,
    bottom: 70,
    left: 50
};
var graphWidth = 900;
var graphHeight = 450;
var width = graphWidth - margin.left - margin.right;
var height = graphHeight - margin.top - margin.bottom;

var xScale = d3
    .scaleLinear()
    .domain([
        1 - 0.5,
        12 + 0.5
    ]) //控制 x 轴的左右缩进
    .range([0, width]);

function makeYScale(data) {
    var yScale = d3
    .scaleLinear()
    .domain([
        0, 1.25 * d3.max(data)
    ])
    .range([height, 10]);

    return yScale;
}

var yScalePrimary = makeYScale(redSumOfMonth);
var yScaleSecond  = makeYScale(sumOfMonth);

var xAxisTicks = d3
    .axisBottom(xScale)
    .tickSizeInner(20)
    .tickFormat(function (d) {
        return d + '月';
    })
    .ticks(12);

var yAxisTicksPrimary = d3
    .axisRight(yScalePrimary)
    .tickSize(width)
    .ticks(5)
    .tickFormat(function (d) {
        return d;
    });

var yAxixTicksSecond = d3.axisRight(yScaleSecond).ticks(5);

var svg = d3
    .select('#viz')
    .append('svg')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function makeGraph(svg, seriesData, yScale, color, isShowingDots) {
    var themecolor = color || "";
    var showingDots = isShowingDots || false;

    function addTheme(element, themecolor) {
        if (themecolor) {
            element.classed(themecolor, true);
        } else {
            element.classed('default', true);
        }
    }

    function makeItLight(element, isLight) {
        element.classed('light', isLight);
    }

    var area = d3
        .area()
        .x(function (d, i) {
            return xScale(i + 1);
        })
        .y1(function (d) {
            return yScale(d);
        })
        .y0(height)
        .curve(d3.curveMonotoneX); //产生曲线渐变 curveCardinal，curveMonotoneX

    var curveLine = d3
        .line()
        .x(function (d, i) {
            return xScale(i + 1)
        })
        .y(function (d) {
            return yScale(d)
        })
        .curve(d3.curveMonotoneX);

    function addGradientDef(svg, themecolor) {
        // 控制渐变定义
        var svgDefs = svg.append('defs');
        var mainGradientId = 'mainGradient-' + themecolor;
        var mainGradient = svgDefs
            .append('linearGradient')
            .attr('id', mainGradientId)
            .attr("gradientUnits", "userSpaceOnUse") //这句很关键
            .attr('x1', 0)
            .attr('y1', yScale(0))
            .attr('x2', 0)
            .attr('y2', yScale(d3.max(seriesData)));

        mainGradient
            .append('stop')
            .attr('class', 'stop-bottom')
            .attr('offset', '0');

        var stopTop = mainGradient
            .append('stop')
            .attr('class', 'stop-top')
            .attr('offset', '1');
        addTheme(stopTop, themecolor);

        if (!showingDots) {
            makeItLight(stopTop, true);
        }

        return mainGradient;
    }

    var mainGradient = addGradientDef(svg, themecolor);
    addTheme(mainGradient, themecolor);

    //添加面积
    var areaDisplay = svg
        .append("path")
        .datum(seriesData)
        .attr("class", "area");
    areaDisplay.attr("d", area);

    addTheme(areaDisplay, themecolor);

    if (!showingDots) {
        makeItLight(areaDisplay, true);
    }

    //添加上方曲线
    var curveLineDisplay = svg
        .append("path")
        .datum(seriesData)
        .attr("class", "line")
        .attr("d", curveLine);

    var totalLength = curveLineDisplay
        .node()
        .getTotalLength();

    //添加曲线动画
    curveLineDisplay
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeCubic)
        .attr("stroke-dashoffset", 0);

    addTheme(curveLineDisplay, themecolor);

    if (!showingDots) {
        makeItLight(curveLineDisplay, true);
    }

    if (showingDots) {
        //添加上方圆点的白色边界
        var dotGroup = svg.append('g');
        dotGroup
            .append('g')
            .selectAll('circle')
            .data(seriesData)
            .enter()
            .append('circle')
            .classed('dotshadow', true)
            .attr('cx', function (d, i) {
                return xScale(i + 1);
            })
            .attr('cy', function (d) {
                return yScale(d);
            })
            .attr('r', 11);

        //添加上方圆点
        var dotDisplay = dotGroup
            .append('g')
            .selectAll('circle')
            .data(seriesData)
            .enter()
            .append('circle')
            .classed('dot', true)
            .attr('cx', function (d, i) {
                return xScale(i + 1);
            })
            .attr('cy', function (d) {
                return yScale(d);
            })
            .attr('r', 5);

        dotGroup
            .attr('opacity', 0)
            .transition()
            .duration(2000)
            .ease(d3.easeCubic)
            .attr('opacity', 1);

        addTheme(dotDisplay, themecolor);
    }
}

//在横坐标绘制完成后，重新设置 x 轴的风格
function customXAxis(g) {
    g.call(xAxisTicks);
    g
        .select(".domain")
        .remove();
    g
        .selectAll(".tick line")
        .remove(); //移除默认的竖线
    g
        .selectAll(".tick text")
        .classed("tick-label", true)
}

function customYAxis(g) {
    g.call(yAxisTicksPrimary);
    g
        .select(".domain")
        .remove();

    var tickLeftShift = -35;
    g
        .selectAll(".tick text")
        .classed("tick-label", true)
        .attr("x", tickLeftShift)
        .attr("dy", 3);

    // now add titles to the axes
    g
        .append("text")
        .attr('class', 'tick y unit')
        .attr("text-anchor", "left") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + tickLeftShift + "," + -15 + ")") // text is drawn off the screen top left, move down and out and rotate
        .text("张");
}

function customRightYAxis(g) {
    g.call(yAxixTicksSecond);
    g
        .select(".domain")
        .remove();
    g
        .selectAll('line')
        .remove();
    var tickLeftShift = 10;
    g
        .selectAll(".tick text")
        .classed("tick-label", true)
        .attr("x", tickLeftShift)
        .attr("dy", 3);

    // 给坐标轴添加文字标题
    g
        .append("text")
        .attr('class', 'tick y unit')
        .attr("text-anchor", "left") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + tickLeftShift + "," + -10 + ")") // text is drawn off the screen top left, move down and out and rotate
        .text("元");
}

//添加坐标轴
svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(customXAxis);

svg
    .append("g")
    .attr("class", "y axis")
    // .attr("transform", "translate(-10,0)")
    .call(customYAxis);

//添加右侧坐标轴
svg
    .append("g")
    .attr("transform", "translate(" + width + " ,0)")
    .call(customRightYAxis);

makeGraph(svg, sumOfMonth, yScaleSecond, 'green');


makeGraph(svg, redSumOfMonth, yScalePrimary, 'red', true)

//添加事件浮动
var overlay = svg
    .append('rect')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height)
    .on("mouseover", function () {
        focus.style("display", null);
    })
    .on("mouseout", function () {
        focus.style("display", "none");
    })
    .on("mousemove", mousemove);

//高亮条
var focus = svg
    .append("g")
    .attr("class", "focus")
    .style("display", "none")
    .on('mouseover', function () {
        focus.style("display", null);
    })
    .on("mouseout", function () {
        focus.style("display", "none");
    });

var focusTips = focus.append('g');
focusTips
    .append("rect")
    .attr('width', 100)
    .attr('height', 50)
    .attr('rx', 5)
    .attr('class', 'focus tips');

focusTips
    .append("text")
    .attr('fill', '#fff')
    .attr("x", 5)
    .attr("dy", "1em");

var focusBar = focus.append('g');

var focusCircle = focus.append('g');
focusCircle
    .append("circle")
    .classed('dotshadow', true)
    .attr("r", 11);
focusCircle
    .append("circle")
    .classed('dot', true)
    .classed('red', true)
    .attr("r", 5);

var focusBarWidth = 34;
focusBar
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', focusBarWidth)
    .attr('height', height + 40)
    .attr('class', 'focus-bar');

var focusLine = focusBar
    .append('g')
    .append('line')
    .attr('x1', focusBarWidth / 2)
    .attr('y1', 0)
    .attr('x2', focusBarWidth / 2)
    .attr('y2', height)
    .attr('stroke', '#e14c46')
    .attr('stroke-width', '2');

focusBar
    .append('text')
    .attr('class', 'tick-label')
    .attr('x', '17')
    .attr('dy', height + 33)
    .attr('text-anchor', 'middle');
setAlpha();

function setAlpha() {
    // filters go in defs element
    var defs = svg.append("defs");

    var filter = defs
        .append("filter")
        .attr("id", "drop-shadow")
        .attr("filterUnits", "userSpaceOnUse")
        .attr("height", "130%");

    filter
        .append("feOffset")
        .attr("in", "SourceAlpha")
        .attr("dx", 0)
        .attr("dy", 10) //距离
        .attr("result", "offsetOut");

    filter
        .append("feGaussianBlur")
        .attr("in", "offsetOut")
        .attr("stdDeviation", 6) //模糊大小
        .attr("result", "blurOut");

    filter
        .append("feFlood")
        .attr('in', 'blurOut')
        .attr('flood-color', '#e04e48')
        .attr('flood-opacity', '0.36')
        .attr('result', 'colorOut');

    filter
        .append('feComposite')
        .attr('in', 'colorOut')
        .attr('in2', 'blurOut')
        .attr('operator', 'in')
        .attr('result', 'offsetBlur')

    var feMerge = filter.append("feMerge");
    feMerge
        .append("feMergeNode")
        .attr("in", "offsetBlur");
    feMerge
        .append("feMergeNode")
        .attr("in", "SourceGraphic");
}
var bisect = d3.bisector(function (d) {
    return d;
}).right;

function mousemove() {
    //console.log(this, d3.mouse(this));
    var monthList = [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12
    ];
    var x0 = xScale.invert(d3.mouse(this)[0]),
        i = bisect(monthList, x0),
        dLeft = redSumOfMonth[i - 1],
        dRight = redSumOfMonth[i];
    var rightIndex = i + 1;
    var leftIndex = i;

    var selection = leftIndex;
    var d = dLeft;

    if (Math.abs(rightIndex - x0) <= Math.abs(x0 - leftIndex)) {
        selection = rightIndex;
        d = dRight;
    }

    //处理鼠标从右侧划入图形时的问题
    if (d) {
        focusCircle.attr("transform", "translate(" + xScale(selection) + "," + yScalePrimary(d) + ")");
        var tipsX = (xScale(selection) + focusBarWidth / 2 + 10);
        var tipsY = yScalePrimary(d) - 20;
        focusTips.attr("transform", "translate(" + tipsX + "," + tipsY + ")");
    }

    focusBar.attr("transform", "translate(" + (xScale(selection) - focusBarWidth / 2) + "," + 0 + ")");
    //添加高亮区域动画
    focus
        .attr('opacity', 0)
        .transition()
        .ease(d3.easeCubic)
        .duration(200)
        .attr('opacity', 1);

    //动态调整高亮时的提示文本
    focusTips
        .select("text")
        .text('开票量：' + d);

    focusBar
        .select('text')
        .text((selection) + '月')
}
