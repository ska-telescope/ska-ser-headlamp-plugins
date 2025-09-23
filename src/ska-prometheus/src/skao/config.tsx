class AppConfig {
  private prometheusProxyServiceLabelSelector: string = '<PROMETHEUS_PROXY_SERVICE_LABEL_SELECTOR>';

  constructor() {
    this.prometheusProxyServiceLabelSelector = this.prometheusProxyServiceLabelSelector.match(
      '<.*>'
    )
      ? null
      : this.prometheusProxyServiceLabelSelector;
  }

  // Function to get the configuration
  public getConfig() {
    return {
      prometheusProxyServiceLabelSelector: this.prometheusProxyServiceLabelSelector,
    };
  }
}

const appConfig = new AppConfig();
export default appConfig;
