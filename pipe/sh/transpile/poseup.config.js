const project = require('../project.config');

module.exports = {
  log: 'info',
  project: `shst-sh`,
  tasks: {
    transpile: {
      primary: 'go',
      cmd: ['/bin/sh', '-x', '/go/app/transpile/docker.sh']
    }
  },
  compose: {
    version: '3.4',
    services: {
      go: {
        image: 'golang:1.11.5-alpine',
        volumes: [
          {
            type: 'bind',
            source: project.get('paths.root'),
            target: '/go/app'
          }
        ]
      }
    }
  }
};
