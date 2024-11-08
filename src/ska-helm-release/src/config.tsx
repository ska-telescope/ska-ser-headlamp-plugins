class AppConfig {
  private carProxyServiceLabelSelector: string = '<CAR_PROXY_SERVICE_LABEL_SELECTOR>';

  constructor() {
    this.carProxyServiceLabelSelector = this.carProxyServiceLabelSelector.match('<.*>')
      ? null
      : this.carProxyServiceLabelSelector;
  }

  // Function to get the configuration
  public getConfig() {
    return {
      carProxyServiceLabelSelector: this.carProxyServiceLabelSelector,
    };
  }
}

const appConfig = new AppConfig();
export default appConfig;
