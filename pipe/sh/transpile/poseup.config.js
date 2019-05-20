const os = require('os');
const project = require('../project.config');

const user = os.userInfo().uid === -1 ? null : os.userInfo();
module.exports = {
  log: 'info',
  project: `shst-sh`,
  tasks: {
    transpile: {
      primary: 'go',
      cmd: [
        '/bin/sh',
        '-c',
        '/bin/sh -x /go/app/transpile/docker.sh' +
          (user ? ` && chown -R ${user.uid}:${user.gid} /go/app/pkg` : '')
      ]
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
