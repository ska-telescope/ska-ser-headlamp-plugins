class AppConfig {
  private prometheusProxyServiceLabelSelector: string = '<PROMETHEUS_PROXY_SERVICE_LABEL_SELECTOR>';
  private prometheusDatacentreLabel: string = '<PROMETHEUS_DATACENTRE_LABEL>';
  private prometheusMetricsQueryTimeMinutes: string = '<PROMETHEUS_METRICS_QUERY_TIME_MINUTES>';

  constructor() {
    this.prometheusProxyServiceLabelSelector = this.prometheusProxyServiceLabelSelector.match(
      '<.*>'
    )
      ? null
      : this.prometheusProxyServiceLabelSelector;
    this.prometheusDatacentreLabel = this.prometheusDatacentreLabel.match('<.*>')
      ? null
      : this.prometheusDatacentreLabel;
    this.prometheusMetricsQueryTimeMinutes = this.prometheusMetricsQueryTimeMinutes.match('<.*>')
      ? null
      : this.prometheusMetricsQueryTimeMinutes;
  }

  // Function to get the configuration
  public getConfig() {
    return {
      prometheusProxyServiceLabelSelector: this.prometheusProxyServiceLabelSelector,
      prometheusDatacentreLabel: this.prometheusDatacentreLabel,
      prometheusMetricsQueryTimeMinutes: this.prometheusMetricsQueryTimeMinutes,
    };
  }
}

const appConfig = new AppConfig();
export default appConfig;
