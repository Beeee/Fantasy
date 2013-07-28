/**
 * User: Roar
 * Date: 11.07.13
 * Time: 12:52
 */

var forever = require('forever');

var child = new(forever.Monitor)('router.js', {
        'silent': false,
        'pidFile': 'pids/router.pid',
        'watch': true,
        'watchDirectory': '.',      // Top-level directory to watch from.
        'watchIgnoreDotFiles': true, // whether to ignore dot files
        'watchIgnorePatterns': [], // array of glob patterns to ignore, merged with contents of watchDirectory + '/.foreverignore' file
        'logFile': 'logs/forever.log', // Path to log output from forever process (when daemonized)
        'outFile': 'logs/forever.out', // Path to log output from child stdout
        'errFile': 'logs/forever.err'
    });
child.start();
forever.startServer(child);