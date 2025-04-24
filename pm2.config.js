module.exports = {
    apps : [{
      name      : 'money_observer_worker',
      script    : './dist/worker.js',
      node_args : '-r dotenv/config',
    }],
  }