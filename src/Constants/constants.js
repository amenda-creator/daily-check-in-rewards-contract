const ServiceTypes = {
  CHECKIN: 'CheckIn',
  UPGRADE: 'Upgrade',
  CLUSTER: 'Cluster',
  HEALTH: 'Health'
};

const Actions = {
  CHECK_IN: 'CheckIn',
  GET_STATUS: 'GetStatus',
  HEALTH_CHECK: 'HealthCheck',
  UPGRADE_CONTRACT: 'UpgradeContract',
  UPDATE_CLUSTER_CONFIG: 'UpdateClusterConfig',
  GET_CLUSTER_UNL: 'GetClusterUnl',
  GET_CONTRACT_VERSION: 'GetContractVersion',
  UPDATE_CLUSTER_DETAILS: 'UpdateClusterDetails'
};

const Tables = {
  ContractVersion: 'ContractVersion',
  CheckInUsers: 'CheckInUsers',
  CheckInHistory: 'CheckInHistory'
};

const ErrorCodes = {
  ALREADY_CHECKED_IN: 'ALREADY_CHECKED_IN',
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNKNOWN_SERVICE: 'UNKNOWN_SERVICE',
  UNKNOWN_ACTION: 'UNKNOWN_ACTION',
  UNAUTHORIZED: 'UNAUTHORIZED',
  READ_ONLY: 'READ_ONLY_MODE',
  INTERNAL: 'INTERNAL_ERROR'
};

module.exports = { ServiceTypes, Actions, Tables, ErrorCodes };
