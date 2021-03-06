'use strict';

import _ from 'lodash';

import { module } from 'angular';

export const KUBERNETES_V1_CONTAINER_ENVIRONMENTVARIABLES_COMPONENT =
  'spinnaker.deck.kubernetes.environmentVariables.component';
export const name = KUBERNETES_V1_CONTAINER_ENVIRONMENTVARIABLES_COMPONENT; // for backwards compatibility
module(KUBERNETES_V1_CONTAINER_ENVIRONMENTVARIABLES_COMPONENT, []).component(
  'kubernetesContainerEnvironmentVariables',
  {
    bindings: {
      envVars: '=',
    },
    templateUrl: require('./environmentVariables.component.html'),
    controller: function() {
      if (!this.envVars) {
        this.envVars = [];
      }

      this.envVarsSourceTypes = this.envVars.map(envVar => {
        if (_.get(envVar, 'envSource.configMapSource')) {
          return 'Config Map';
        } else if (_.get(envVar, 'envSource.secretSource')) {
          return 'Secret';
        } else if (_.get(envVar, 'envSource.fieldRef')) {
          return 'Field Ref';
        } else {
          return 'Explicit';
        }
      });

      this.removeEnvVar = function(index) {
        this.envVars.splice(index, 1);
        this.envVarsSourceTypes.splice(index, 1);
      };

      this.addEnvVar = function() {
        this.envVars.push({});
        this.envVarsSourceTypes.push('Explicit');
      };

      this.sourceTypes = ['Explicit', 'Config Map', 'Secret', 'Field Ref'];

      this.updateSourceTypeMap = {
        Explicit: envVar => {
          delete envVar.envSource;
        },
        'Config Map': envVar => {
          delete envVar.value;
          if (_.has(envVar, 'envSource.secretSource')) {
            delete envVar.envSource.secretSource;
          }
          if (_.has(envVar, 'envSource.fieldRef')) {
            delete envVar.envSource.fieldRef;
          }
        },
        Secret: envVar => {
          delete envVar.value;
          if (_.has(envVar, 'envSource.configMapSource')) {
            delete envVar.envSource.configMapSource;
          }
          if (_.has(envVar, 'envSource.fieldRef')) {
            delete envVar.envSource.fieldRef;
          }
        },
        'Field Ref': envVar => {
          delete envVar.value;
          if (_.has(envVar, 'envSource.configMapSource')) {
            delete envVar.envSource.configMapSource;
          }
          if (_.has(envVar, 'envSource.secretSource')) {
            delete envVar.envSource.secretSource;
          }
        },
      };

      this.updateEnvVar = index => {
        const envVar = this.envVars[index];
        const sourceType = this.envVarsSourceTypes[index];
        this.updateSourceTypeMap[sourceType](envVar);
      };

      this.initOptional = source => {
        return (source && source.optional == null) || source.optional;
      };
    },
  },
);
