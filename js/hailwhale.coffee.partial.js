(function() {
  var $,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = jQuery;

  $.hailwhale = function(host, opts) {
    this.host = host;
    this.opts = opts;
    this.chart = false;
    this.make_params = function(extra) {
      var params;
      return params = {
        pk: JSON.stringify(extra.pk || extra.category || ''),
        dimensions: JSON.stringify(extra.dimensions || extra.dimension || ''),
        metrics: JSON.stringify(extra.metrics || extra.metric || ''),
        period: extra.period || ''
      };
    };
    this.add_graph = function(target, extra) {
      var params, poller, poller_handle, url;
      url = this.host + 'plotpoints';
      extra = $.extend(extra, {
        pk: extra.pk || extra.category || false,
        dimensions: extra.dimensions || extra.dimension || false,
        metrics: extra.metrics || extra.metric || false,
        metric: extra.metrics && extra.metrics[0] || extra.metric || false,
        metric_two: extra.metrics && extra.metrics[1] ? extra.metrics[1] : false,
        width_factor: extra.width_factor || 6
      });
      params = this.make_params(extra);
      params['depth'] = extra.depth || 0;
      poller = function() {
        return $.getJSON(url, params, function(data, status, xhr) {
          var colors, d_d, dimension, dimension_data, i, label, line_width, lines, max_dim, metrics, min_dim, plot, unpacked, yaxis, yaxis_two, _ref, _ref2;
          lines = [];
          colors = extra.colors || ['#000000', '#261AFF', '#0ED42F', '#E84414', '#F5E744', '#36B9FF'];
          i = 0;
          min_dim = 10;
          max_dim = 0;
          dimension_data = {};
          // Data comes back as JSON in the following format:
          // { 'dimension_str_or_list': {'metric': [[x, y], ... ] , 'metric2': ...} }
          // First, let's look at the dimensions and gather some info
          for (dimension in data) {
            metrics = data[dimension];

            // Decipher dimension's name
            try {
              unpacked = JSON.parse(dimension);
            } catch (error) {
              unpacked = [dimension];
            }
            if (unpacked[0] === "_") unpacked = [];
            if (unpacked.length < min_dim) min_dim = unpacked.length;
            if (unpacked.length > max_dim) max_dim = unpacked.length;

            // Keep some extra info about each dimension around
            dimension_data[dimension] = {
              unpacked: unpacked,
              length: unpacked.length,
              metrics: []
            };
            for(i in metrics) {
                dimension_data[dimension].metrics.push(i);
            }
          }

          // OK, now if any of the dimensions changed, we have to re-render the graph
          var re_render = false;
          if(!this.chart)
              re_render = true;
          else
          {
              for(dimension in data)
                  if(!this.chart.get(dimension))
                      re_render = true;
              for(index in this.chart.series)
                  if(!data[this.chart.series[index]])
                      re_render = true;
          }

          if(re_render) {
              console.log('re-drawing graph at ',target);
              var render_options = {
                chart: {
                  renderTo: target, // don't hardcode this
                  defaultSeriesType: 'spline',
                },
                title: {
                  text: extra.title
                },
                xAxis: {
                  type: 'datetime',
                  tickPixelInterval: 150,
                  maxZoom: 20 * 1000
                },
                yAxis: {
                  minPadding: 0.2,
                  maxPadding: 0.2,
                  title: {
                    margin: 20
                  }
                },
                series: []
              }

              // Now we loop dimensions and find our relevant plotpoints
              for (dimension in data) {
                metrics = data[dimension];
                d_d = dimension_data[dimension];

                // If no metric specified, default to the first one
                if (!extra.metric) extra.metric = d_d.metrics[0];

                // If two metrics returned, show the second one too!
                if (!extra.metric_two && d_d.metrics.length > 1) {
                  extra.metric_two = d_d.metrics[1];
                }

                if (_ref = !extra.metric, __indexOf.call(d_d.metrics, _ref) >= 0) {
                  break;
                }
                // Did we ask for a nested graph? 
                if (extra.depth) {
                  // If so, let's give parent a fat line and all the kids skiny ones
                  if (d_d.length === min_dim) {
                    label = 'Overall ' + d_d.unpacked;
                    line_width = extra.width_factor;
                  } else {
                    label = d_d.unpacked[0];
                    line_width = extra.width_factor / (.5 + (d_d.length - min_dim));
                  }
                } else {
                  // Not nested graphs, just size these all the same
                  label = d_d.unpacked[0] || 'Overall';
                  line_width = extra.width_factor * 3 / 4;
                }

                // Add the lines to the render_options
                render_options.series.push({
                  metric: extra.metric,
                  lines: {
                    show: true,
                    lineWidth: line_width
                  },
                  color: colors[i++ % colors.length],
                  name: label + ' ' + extra.metric,
                  id: dimension
                });
                // Second metric if necessary
                if (_ref2 = extra.metric_two, __indexOf.call(d_d.metrics, _ref2) >= 0) {
                  render_options.series.push({
                    data: metrics[extra.metric_two],
                    metric: extra.metric_two,
                    lines: {
                      show: true,
                      lineWidth: line_width
                    },
                    color: colors[i % colors.length],
                    name: label + ' ' + extra.metric_two,
                    yaxis: 2,
                  });
                }
              }
              yaxis = {
                min: 0
              };
              yaxis_two = $.extend({}, yaxis);
              yaxis_two.position = 'right';
              yaxis_two.label = extra.metric_two;
              if (extra.metric_two) yaxis = [yaxis, yaxis_two];
              this.chart = new Highcharts.Chart(render_options);
          }

          // Now update the plotpoints!
          $.each(this.chart.series, function(index, series) {
            dimension = series.options.id;
            console.log('updating data for',dimension,extra.metric);
            series.setData(data[dimension][extra.metric]);
          });
        });
      };
      poller();
      if (extra.autoupdate) {
        return poller_handle = setInterval(poller, extra.interval || 2500);
      }
    };
    return this;
  };

}).call(this);
