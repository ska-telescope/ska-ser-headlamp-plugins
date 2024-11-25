class AppConfig {
  private clusterConfigMapLabel: string = '<CLUSTER_CONFIG_MAP_LABEL>';
  constructor() {
    this.clusterConfigMapLabel = this.clusterConfigMapLabel.match('<.*>')
      ? null
      : this.clusterConfigMapLabel;
  }

  // Function to get the configuration
  public getConfig() {
    return {
      clusterConfigMapLabel: this.clusterConfigMapLabel,
    };
  }
}

const appConfig = new AppConfig();
export default appConfig;
