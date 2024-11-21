class AppConfig {
  private skaTangoPingServiceLabelSelector: string = '<SKA_TANGO_PING_SERVICE_LABEL_SELECTOR>';

  constructor() {
    this.skaTangoPingServiceLabelSelector = this.skaTangoPingServiceLabelSelector.match('<.*>')
      ? null
      : this.skaTangoPingServiceLabelSelector;
  }

  // Function to get the configuration
  public getConfig() {
    return {
      skaTangoPingServiceLabelSelector: this.skaTangoPingServiceLabelSelector,
    };
  }
}

const appConfig = new AppConfig();
export default appConfig;
